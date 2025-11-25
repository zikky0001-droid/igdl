import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/igdl", async (req, res) => {
  const { chat_id, url } = req.body;
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  try {
    const apiRes = await fetch(
      `https://instagram-story-downloader-media-downloader.p.rapidapi.com/unified/url?url=${encodeURIComponent(url)}`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "instagram-story-downloader-media-downloader.p.rapidapi.com"
        }
      }
    );
    const data = await apiRes.json();
    const mediaUrl = data?.data?.content?.media_url || data?.thumbnail_url;
    if (!mediaUrl) throw new Error("No media found");

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        video: mediaUrl,
        caption: "✅ Download Complete!"
      })
    });

    res.json({ ok: true, mediaUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
