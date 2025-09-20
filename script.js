const videoForm = document.getElementById('videoForm');
const videoUrlInput = document.getElementById('videoUrl');
const videoFrame = document.getElementById('videoFrame');
const transcriptContainer = document.getElementById('transcript');

videoForm.addEventListener('submit', (e) => {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const url = videoUrlInput.value.trim();
  if (!url) return;

  const videoId = extractVideoId(url);
  if (videoId) {
    // غيّر الفيديو
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;

    // حمّل الكابتشنات
    loadCaptions(videoId);
  } else {
    alert('⚠️ رابط يوتيوب غير صالح');
  }
});

// استخراج ID من روابط يوتيوب
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// تحميل وعرض الكابتشنات
async function loadCaptions(videoId) {
  transcriptContainer.innerHTML = "⏳ Loading transcript...";

  try {
    const apiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    const res = await fetch(proxyUrl);
    const textData = await res.text();

    if (!textData) {
      transcriptContainer.innerHTML = "❌ Proxy returned empty response.";
      return;
    }

    let data;
    try {
      data = JSON.parse(textData);
    } catch (err) {
      transcriptContainer.innerHTML = "❌ Failed to parse response.";
      console.error("Raw response:", textData);
      return;
    }

    if (!data.contents) {
      transcriptContainer.innerHTML = "⚠️ No transcript found.";
      return;
    }

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const texts = xml.getElementsByTagName("text");

    if (!texts.length) {
      transcriptContainer.innerHTML = "⚠️ No captions available.";
      return;
    }

    transcriptContainer.innerHTML = "";
    Array.from(texts).forEach(node => {
      const words = node.textContent.split(" ");
      words.forEach(word => {
        if (!word.trim()) return;
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        span.addEventListener("click", () => {
          englishContent.textContent = `Meaning of "${word}" (placeholder)`;
          arabicContent.textContent = `ترجمة كلمة "${word}" (تجريبية)`;
          modal.classList.remove("hidden");
        });
        transcriptContainer.appendChild(span);
        transcriptContainer.append(" ");
      });
    });

  } catch (err) {
    transcriptContainer.innerHTML = "❌ Failed to load captions.";
    console.error(err);
  }
}
