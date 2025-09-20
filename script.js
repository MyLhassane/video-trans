const videoForm = document.getElementById('videoForm');
const videoUrlInput = document.getElementById('videoUrl');
const videoFrame = document.getElementById('videoFrame');
const transcriptContainer = document.getElementById('transcript');

const modal = document.getElementById("modal");
const englishContent = document.getElementById("englishContent");
const arabicContent = document.getElementById("arabicContent");
const closeModal = document.getElementById("closeModal");

// إغلاق النافذة المنبثقة
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Tabs switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

videoForm.addEventListener('submit', (e) => {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const url = videoUrlInput.value.trim();
  if (!url) return;

  const videoId = extractVideoId(url);
  if (videoId) {
    // غيّر الفيديو
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;

    // حمّل النصوص
    loadTranscript(videoId);
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

// تحميل وعرض النصوص
async function loadTranscript(videoId) {
  transcriptContainer.innerHTML = "⏳ Loading transcript...";

  try {
    const apiUrl = `/api/captions?v=${videoId}&lang=en`; // استدعاء Vercel API

    const res = await fetch(apiUrl);
    if (!res.ok) {
      transcriptContainer.innerHTML = "❌ Failed to load transcript.";
      return;
    }

    const data = await res.json();
    if (!data || !data.transcript || !data.transcript.length) {
      transcriptContainer.innerHTML = "⚠️ No transcript found.";
      return;
    }

    transcriptContainer.innerHTML = "";
    data.transcript.forEach(item => {
      const words = item.text.split(" ");
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
    transcriptContainer.innerHTML = "❌ Failed to load transcript.";
    console.error(err);
  }
}
