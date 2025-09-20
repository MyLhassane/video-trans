export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("v");
    const lang = searchParams.get("lang") || "en";

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // رابط YouTube captions
    const ytUrl = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}`;

    const ytRes = await fetch(ytUrl);
    if (!ytRes.ok) {
      return new Response(JSON.stringify({ error: "No captions found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const xml = await ytRes.text();

    // بسيط: استخراج النصوص بـ Regex (بدون DOMParser لأنه غير مدعوم على Edge Runtime)
    const regex = /<text start="([^"]+)" dur="([^"]+)">([\s\S]*?)<\/text>/g;
    let match;
    const transcript = [];

    while ((match = regex.exec(xml)) !== null) {
      transcript.push({
        start: match[1],
        dur: match[2],
        text: decodeURIComponent(match[3]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"'))
      });
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
