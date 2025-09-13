// Select elements
const words = document.querySelectorAll('.word');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
const englishContent = document.getElementById('englishContent');
const arabicContent = document.getElementById('arabicContent');

// Open modal on word click
words.forEach(word => {
  word.addEventListener('click', () => {
    englishContent.textContent = `Meaning of "${word.textContent}" (placeholder)`;
    arabicContent.textContent = `ترجمة كلمة "${word.textContent}" (تجريبية)`;
    modal.classList.remove('hidden');
  });
});

// Close modal
closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Switch tabs
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    // Activate current
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// Video form handling
const videoForm = document.getElementById('videoForm');
const videoUrlInput = document.getElementById('videoUrl');
const videoFrame = document.getElementById('videoFrame');

videoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = videoUrlInput.value.trim();
  if (!url) return;

  // استخراج ID من الرابط
  const videoId = extractVideoId(url);
  if (videoId) {
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
  } else {
    alert('⚠️ رابط غير صالح');
  }
});

// دالة لاستخراج ID من رابط يوتيوب
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const transcriptContainer = document.getElementById('transcript');

async function loadCaptions(videoId) {
  transcriptContainer.innerHTML = "⏳ Loading transcript...";

  try {
    // طلب subtitles (عادة الانجليزية code=en)
    const apiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    const res = await fetch(proxyUrl);
    const data = await res.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const texts = xml.getElementsByTagName("text");

    if (!texts.length) {
      transcriptContainer.innerHTML = "⚠️ No captions available.";
      return;
    }

    // عرض النصوص ككلمات منفصلة
    transcriptContainer.innerHTML = "";
    Array.from(texts).forEach(node => {
      const words = node.textContent.split(" ");
      words.forEach(word => {
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        span.addEventListener("click", () => {
          englishContent.textContent = `Meaning of "${word}" (placeholder)`;
          arabicContent.textContent = `ترجمة كلمة "${word}" (تجريبية)`;
          modal.classList.remove("hidden");
        });
        transcriptContainer.appendChild(span);
        transcriptContainer.append(" "); // مسافة
      });
    });

  } catch (err) {
    transcriptContainer.innerHTML = "❌ Failed to load captions.";
    console.error(err);
  }
}

// تعديل حدث الفورم: بعد تغيير الفيديو نحمل الكابتشن
videoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = videoUrlInput.value.trim();
  if (!url) return;

  const videoId = extractVideoId(url);
  if (videoId) {
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
    loadCaptions(videoId); // تحميل الكابتشن
  } else {
    alert('⚠️ رابط غير صالح');
  }
});
