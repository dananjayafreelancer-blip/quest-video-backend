const BACKEND_URL =
  "https://quest-video-backend.onrender.com";

const generateButton =
  document.getElementById("generate");

const status =
  document.getElementById("status");

const download =
  document.getElementById("download");


generateButton.addEventListener("click", async () => {

  const quest =
    document.getElementById("quest").value.trim();

  const previousBalance =
    Number(
      document.getElementById("previousBalance").value
    );

  const todaysLoot =
    Number(
      document.getElementById("todaysLoot").value
    );

  const target =
    Number(
      document.getElementById("target").value
    );


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

  status.textContent =
    "🎬 Rendering video... Please wait.";


  try {

    const response = await fetch(
      `${BACKEND_URL}/api/render`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          quest,
          previousBalance,
          todaysLoot,
          target
        })
      }
    );


    if (!response.ok) {

      let errorMessage =
        "Video rendering failed.";

      try {
        const error =
          await response.json();

        if (error.error) {
          errorMessage = error.error;
        }
      } catch {}

      throw new Error(errorMessage);
    }


    const blob =
      await response.blob();


    const videoURL =
      URL.createObjectURL(blob);


    download.href = videoURL;

    download.download =
      "quest-video.mp4";

    download.style.display =
      "block";


    status.textContent =
      "✅ Video ready!";


  } catch (error) {

    console.error(error);

    status.textContent =
      "❌ " + error.message;

  } finally {

    generateButton.disabled =
      false;

  }

});
