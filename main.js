const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const previewArea = document.getElementById('previewArea');
const extractedTextEl = document.getElementById('extractedText');
const statusEl = document.getElementById('status');

let selectedFile = null;
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = () => URL.revokeObjectURL(img.src);
  img.className = 'preview-img';
  previewArea.innerHTML = '';
  previewArea.appendChild(img);
});

uploadBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    alert('Please choose an image first');
    return;
  }
  statusEl.textContent = 'Uploading...';
  extractedTextEl.textContent = '';
  const form = new FormData();
  form.append('image', selectedFile);
  try {
    const resp = await fetch('/api/ocr', { method: 'POST', body: form });
    if (!resp.ok) {
      const err = await resp.json();
      statusEl.textContent = 'Error: ' + (err.error || resp.statusText);
      return;
    }
    const data = await resp.json();
    extractedTextEl.textContent = data.text || 'No text found.';
    statusEl.textContent = 'Done';
  } catch (err) {
    statusEl.textContent = 'Upload failed: ' + err.message;
  }
});
