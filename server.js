import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Quest Video Generator Backend is running 🎮"
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend connection working!"
  });
});

app.post("/api/calculate", (req, res) => {
  const {
    quest,
    previousBalance,
    todaysLoot,
    target
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
      error: "Invalid input"
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
      progress
    }
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
