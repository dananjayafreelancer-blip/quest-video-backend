const BACKEND_URL = "https://quest-video-backend.onrender.com";

const generateButton = document.getElementById("generate");
const status = document.getElementById("status");
const download = document.getElementById("download");

generateButton.addEventListener("click", async () => {
  const quest = document.getElementById("quest").value.trim();
  const previousBalance = Number(document.getElementById("previousBalance").value);
  const todaysLoot = Number(document.getElementById("todaysLoot").value);
  const target = Number(document.getElementById("target").value);

  if (!quest) {
    status.textContent = "⚠️ Enter a quest.";
    return;
  }

  if (
    !Number.isFinite(previousBalance) ||
    !Number.isFinite(todaysLoot) ||
    !Number.isFinite(target) ||
    target <= 0
  ) {
    status.textContent = "⚠️ Check your values.";
    return;
  }

  generateButton.disabled = true;
  download.style.display = "none";
  status.textContent = "🎬 Submitting render job...";

  try {
    // 1. Submit Render Request
    const response = await fetch(`${BACKEND_URL}/api/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quest, previousBalance, todaysLoot, target }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to start rendering process.");
    }

    const jobId = data.jobId;
    status.textContent = "⏳ Rendering video in background... Please wait.";

    // 2. Poll Status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`${BACKEND_URL}/api/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          clearInterval(pollInterval);
          status.textContent = "✅ Video ready!";

          download.href = `${BACKEND_URL}/api/download/${jobId}`;
          download.download = "quest-video.mp4";
          download.style.display = "block";
          generateButton.disabled = false;
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval);
          throw new Error(statusData.error || "Video rendering failed.");
        }
      } catch (err) {
        clearInterval(pollInterval);
        status.textContent = "❌ " + err.message;
        generateButton.disabled = false;
      }
    }, 3000);

  } catch (error) {
    console.error(error);
    status.textContent = "❌ " + error.message;
    generateButton.disabled = false;
  }
});
