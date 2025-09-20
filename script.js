const videoForm = document.getElementById('videoForm');
const videoUrlInput = document.getElementById('videoUrl');
const videoFrame = document.getElementById('videoFrame');
const transcriptContainer = document.getElementById('transcript');

// عناصر المودال
const modal = document.getElementById("modal");
const englishContent = document.getElementById("englishContent");
const arabicContent = document.getElementById("arabicContent");
const closeModal = document.getElementById("closeModal");

// إغلاق المودال
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

videoForm.addEventListener('submit', (e) => {
  e.preventDefault();

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

// تحميل وعرض الكابتشنات عبر خادم وسيط (Vercel Edge Function)
async function loadCaptions(videoId) {
  transcriptContainer.innerHTML = "⏳ Loading transcript...";

  try {
    // عنوان الـ API (نبدله لاحقًا بعنوان Vercel الخاص بنا)
    const apiUrl = `/api/captions?videoId=${videoId}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Bad response from server");

    const data = await res.json();

    if (!data || !data.captions) {
      transcriptContainer.innerHTML = "⚠️ No transcript found.";
      return;
    }

    transcriptContainer.innerHTML = "";
    data.captions.forEach(word => {
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

  } catch (err) {
    transcriptContainer.innerHTML = "❌ Failed to load captions.";
    console.error(err);
  }
}

