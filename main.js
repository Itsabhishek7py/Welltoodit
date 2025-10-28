// ==== DOM ELEMENTS ====
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const previewArea = document.getElementById('previewArea');
const extractedTextEl = document.getElementById('extractedText');
const statusEl = document.getElementById('status');

// ==== STATE ====
let selectedFile = null;

// ==== EVENT: File Selection ====
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', handleUpload);

// ==== FUNCTIONS ====

/**
 * Handles image file selection and preview rendering.
 */
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    statusEl.textContent = 'Please select a valid image file.';
    fileInput.value = '';
    selectedFile = null;
    return;
  }

  // Create image preview
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = () => URL.revokeObjectURL(img.src);
  img.className = 'preview-img';

  // Render in preview area
  previewArea.innerHTML = '';
  previewArea.appendChild(img);

  statusEl.textContent = `Selected: ${file.name}`;
}

/**
 * Handles the image upload and OCR text extraction.
 */
async function handleUpload() {
  if (!selectedFile) {
    alert('Please choose an image first.');
    return;
  }

  extractedTextEl.textContent = '';
  statusEl.textContent = '⏳ Uploading and extracting text...';

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }

    const data = await response.json();
    extractedTextEl.textContent = data.text || '⚠️ No text detected in image.';
    statusEl.textContent = '✅ Extraction complete!';
  } catch (error) {
    console.error('Upload error:', error);
    statusEl.textContent = `❌ Upload failed: ${error.message}`;
  } finally {
    // Optional UX improvement — reset button state
    uploadBtn.disabled = false;
  }
}
