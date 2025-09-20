export default async function handler(req, res) {
  try {
    const { v: videoId } = req.query;

    if (!videoId) {
      res.status(400).json({ error: "Missing videoId" });
      return;
    }

    // جلب صفحة الفيديو HTML
    const videoPageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!videoPageRes.ok) {
      res.status(500).json({ error: "Failed to fetch video page" });
      return;
    }

    const html = await videoPageRes.text();

    // البحث عن ytInitialPlayerResponse JSON
    const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (!match) {
      res.json({ transcript: [], message: "✅ لا يوجد transcript متاح" });
      return;
    }

    const playerResponse = JSON.parse(match[1]);

    // محاولة الوصول للـ transcript
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || !captionTracks.length) {
      res.json({ transcript: [], message: "✅ لا يوجد transcript متاح" });
      return;
    }

    // اختيار أول ترجمة إنجليزية متاحة أو أي ترجمة متوفرة
    const track = captionTracks.find(t => t.languageCode.startsWith("en")) || captionTracks[0];

    // جلب محتوى الترجمات بصيغة XML
    const xmlRes = await fetch(track.baseUrl);
    if (!xmlRes.ok) {
      res.status(500).json({ transcript: [], message: "❌ Failed to fetch captions XML" });
      return;
    }

    const xmlText = await xmlRes.text();

    // تحليل XML لاستخراج الكلمات
    const regex = /<text start="([^"]+)" dur="([^"]+)">([\s\S]*?)<\/text>/g;
    let m;
    const transcript = [];
    while ((m = regex.exec(xmlText)) !== null) {
      transcript.push({
        start: parseFloat(m[1]),
        dur: parseFloat(m[2]),
        text: decodeURIComponent(
          m[3].replace(/&amp;/g, "&")
               .replace(/&lt;/g, "<")
               .replace(/&gt;/g, ">")
               .replace(/&#39;/g, "'")
               .replace(/&quot;/g, '"')
        )
      });
    }

    res.json({ transcript });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
