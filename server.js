import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";

import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  selectComposition,
} from "@remotion/renderer";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* --------------------------------
   Basic routes
-------------------------------- */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Quest Video Generator Backend 🎮",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend connection working!",
  });
});

/* --------------------------------
   Calculate quest values
-------------------------------- */

app.post("/api/calculate", (req, res) => {
  const {
    quest,
    previousBalance,
    todaysLoot,
    target,
  } = req.body;

  const previous = Number(previousBalance);
  const loot = Number(todaysLoot);
  const goal = Number(target);

  if (
    !quest ||
    !Number.isFinite(previous) ||
    !Number.isFinite(loot) ||
    !Number.isFinite(goal) ||
    goal <= 0
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid input",
    });
  }

  const newBalance = previous + loot;

  const progress = Math.min(
    100,
    Math.round((newBalance / goal) * 100)
  );

  res.json({
    success: true,
    data: {
      quest,
      previousBalance: previous,
      todaysLoot: loot,
      newBalance,
      target: goal,
      progress,
    },
  });
});

/* --------------------------------
   Render video
-------------------------------- */

app.post("/api/render", async (req, res) => {
  try {
    const {
      quest,
      previousBalance,
      todaysLoot,
      target,
    } = req.body;

    const previous = Number(previousBalance);
    const loot = Number(todaysLoot);
    const goal = Number(target);

    if (
      !quest ||
      !Number.isFinite(previous) ||
      !Number.isFinite(loot) ||
      !Number.isFinite(goal) ||
      goal <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid input",
      });
    }

    /* Calculate values */

    const newBalance = previous + loot;

    const progress = Math.min(
      100,
      Math.round((newBalance / goal) * 100)
    );

    console.log("Starting video render...");
    console.log({
      quest,
      previous,
      loot,
      newBalance,
      goal,
      progress,
    });

    /* Create temporary bundle */

    const entryPoint = path.join(
      process.cwd(),
      "src",
      "index.jsx"
    );

    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    /* Get composition */

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "QuestVideo",
      inputProps: {
        quest,
        previousBalance: previous,
        todaysLoot: loot,
        newBalance,
        target: goal,
        progress,
      },
    });

    /* Temporary output file */

    const outputFile = path.join(
      os.tmpdir(),
      `quest-${Date.now()}.mp4`
    );

    /* Render */

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputFile,
      inputProps: {
        quest,
        previousBalance: previous,
        todaysLoot: loot,
        newBalance,
        target: goal,
        progress,
      },
    });

    console.log("Video render completed!");

    /* Send MP4 */

    res.download(
      outputFile,
      "quest-video.mp4",
      (error) => {
        if (error) {
          console.error("Download error:", error);
        }

        /* Delete temporary file */

        fs.unlink(
          outputFile,
          () => {}
        );
      }
    );

  } catch (error) {
    console.error("VIDEO RENDER ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Video rendering failed",
      details: error.message,
    });
  }
});

/* --------------------------------
   Start server
-------------------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Quest Video Generator running on port ${PORT}`
  );
});
