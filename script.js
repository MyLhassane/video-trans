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
