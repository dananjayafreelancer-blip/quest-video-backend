import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

// In-memory job store for video rendering
const jobs = new Map();

/* ------------------------------------------------
   1. Cache bundle on server startup (Saves 15s+)
------------------------------------------------ */
let cachedBundleLocation = null;

async function getBundle() {
  if (!cachedBundleLocation) {
    console.log("📦 Bundling Remotion project for startup...");
    const entryPoint = path.join(process.cwd(), "src", "index.jsx");
    cachedBundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });
    console.log("✅ Remotion project bundled successfully!");
  }
  return cachedBundleLocation;
}

// Pre-bundle immediately on boot
getBundle().catch((err) => console.error("❌ Pre-bundling error:", err));

/* ------------------------------------------------
   Routes
------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({ status: "online", message: "Quest Video Generator Backend 🎮" });
});

/* ------------------------------------------------
   Start Video Render (Async Background Job)
------------------------------------------------ */
app.post("/api/render", async (req, res) => {
  try {
    const { quest, previousBalance, todaysLoot, target } = req.body;

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
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const newBalance = previous + loot;
    const progress = Math.min(100, Math.round((newBalance / goal) * 100));
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Save job status
    jobs.set(jobId, { status: "rendering" });

    // Return jobId instantly to prevent HTTP Timeouts
    res.json({ success: true, jobId });

    // Background Processing
    (async () => {
      try {
        console.log(`[${jobId}] Starting render...`);
        const bundleLocation = await getBundle();

        const chromiumOptions = {
          executablePath: CHROMIUM_PATH,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        };

        const inputProps = {
          quest,
          previousBalance: previous,
          todaysLoot: loot,
          newBalance,
          target: goal,
          progress,
        };

        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: "QuestVideo",
          inputProps,
          chromiumOptions,
        });

        const outputFile = path.join(os.tmpdir(), `${jobId}.mp4`);

        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: "h264",
          outputLocation: outputFile,
          inputProps,
          chromiumOptions,
        });

        console.log(`[${jobId}] Render finished successfully!`);
        jobs.set(jobId, { status: "completed", filePath: outputFile });
      } catch (error) {
        console.error(`[${jobId}] Render failed:`, error);
        jobs.set(jobId, { status: "failed", error: error.message });
      }
    })();
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

/* ------------------------------------------------
   Check Job Status
------------------------------------------------ */
app.get("/api/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }
  res.json({ success: true, ...job });
});

/* ------------------------------------------------
   Download Rendered MP4
------------------------------------------------ */
app.get("/api/download/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job || job.status !== "completed" || !job.filePath) {
    return res.status(400).json({ success: false, error: "Video not ready" });
  }

  res.download(job.filePath, "quest-video.mp4", (err) => {
    if (err) console.error("Download error:", err);

    // Clean up temporary file & job memory after download
    fs.unlink(job.filePath, () => {});
    jobs.delete(req.params.jobId);
  });
});

/* ------------------------------------------------
   Start Server
------------------------------------------------ */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Quest Video Generator running on port ${PORT}`);
});
