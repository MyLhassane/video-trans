export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("v");

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // جلب صفحة الفيديو
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch video page" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = await res.text();

    // البحث عن ytInitialPlayerResponse JSON
    const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ transcript: [], message: "✅ لا يوجد transcript متاح" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const playerResponse = JSON.parse(jsonMatch[1]);

    // محاولة الوصول للtranscript
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || !captionTracks.length) {
      return new Response(JSON.stringify({ transcript: [], message: "✅ لا يوجد transcript متاح" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // اختيار أول ترجمة إنجليزية متاحة
    let track = captionTracks.find(t => t.languageCode.startsWith("en")) || captionTracks[0];

    // جلب محتوى الترجمات بصيغة XML
    const xmlRes = await fetch(track.baseUrl);
    if (!xmlRes.ok) {
      return new Response(JSON.stringify({ transcript: [], message: "❌ Failed to fetch captions XML" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const xmlText = await xmlRes.text();

    // تحليل XML
    const regex = /<text start="([^"]+)" dur="([^"]+)">([\s\S]*?)<\/text>/g;
    let match;
    const transcript = [];
    while ((match = regex.exec(xmlText)) !== null) {
      transcript.push({
        start: parseFloat(match[1]),
        dur: parseFloat(match[2]),
        text: decodeURIComponent(
          match[3].replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&#39;/g, "'")
                   .replace(/&quot;/g, '"')
      )});
    }

    return new Response(JSON.stringify({ transcript }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
