    // --- DOM Elements ---
        const fileUpload = document.getElementById('fileUpload');
        const uploadSection = document.getElementById('uploadSection');
        const optionsSection = document.getElementById('optionsSection');
        const resultSection = document.getElementById('resultSection');
        
        const fileNameEl = document.getElementById('fileName');
        const fileSizeEl = document.getElementById('fileSize');

        const modeImage = document.getElementById('modeImage');
        const modeGzip = document.getElementById('modeGzip');
        
        const imageOptions = document.getElementById('imageOptions');
        const imageQuality = document.getElementById('imageQuality');
        const qualityValue = document.getElementById('qualityValue');
        const imageResize = document.getElementById('imageResize');
        
        const gzipInfo = document.getElementById('gzipInfo');
        
        const compressButton = document.getElementById('compressButton');
        
        const loadingSpinner = document.getElementById('loadingSpinner');
        const downloadArea = document.getElementById('downloadArea');
        const originalVsNew = document.getElementById('originalVsNew');
        const downloadButton = document.getElementById('downloadButton');
        const errorArea = document.getElementById('errorArea');
        const errorMessage = document.getElementById('errorMessage');

        let currentFile = null;

        // --- Event Listeners ---
        
        // Handle file drop zone clicks and drag/drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadSection.addEventListener(eventName, () => uploadSection.firstElementChild.classList.add('bg-white/10'), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, () => uploadSection.firstElementChild.classList.remove('bg-white/10'), false);
        });

        uploadSection.addEventListener('drop', handleDrop, false);
        fileUpload.addEventListener('change', handleFileSelect);
        
        // Update quality slider text
        imageQuality.addEventListener('input', (e) => {
            qualityValue.textContent = `Current: ${e.target.value}`;
        });

        // Toggle options based on mode
        modeImage.addEventListener('change', toggleOptions);
        modeGzip.addEventListener('change', toggleOptions);
        
        // Main compress button
        compressButton.addEventListener('click', handleCompression);


        // --- Functions ---

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }
        
        function handleFileSelect(e) {
            const files = e.target.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }

        function handleFile(file) {
            currentFile = file;
            if (!currentFile) return;

            // Reset UI
            resetResultUI();
            
            // Display file info
            fileNameEl.textContent = currentFile.name;
            fileSizeEl.textContent = `Original Size: ${formatBytes(currentFile.size)}`;
            
            // Show options
            optionsSection.classList.remove('hidden');
            resultSection.classList.add('hidden');
            
            // Auto-select mode
            if (currentFile.type.startsWith('image/')) {
                modeImage.checked = true;
            } else {
                modeGzip.checked = true;
            }
            toggleOptions();
        }

        function toggleOptions() {
            if (modeImage.checked) {
                imageOptions.classList.remove('hidden');
                gzipInfo.classList.add('hidden');
            } else {
                imageOptions.classList.add('hidden');
                gzipInfo.classList.remove('hidden');
            }
        }
        
        function resetResultUI() {
            loadingSpinner.classList.add('hidden');
            downloadArea.classList.add('hidden');
            errorArea.classList.add('hidden');
            if (downloadButton.href) {
                URL.revokeObjectURL(downloadButton.href); // Clean up old blob URLs
            }
        }
        
        function showError(message) {
            resetResultUI();
            resultSection.classList.remove('hidden');
            errorArea.classList.remove('hidden');
            errorMessage.textContent = `Error: ${message}`;
        }

        function handleCompression() {
            if (!currentFile) {
                showError("No file selected.");
                return;
            }

            // Show spinner and hide old results
            resultSection.classList.remove('hidden');
            resetResultUI();
            loadingSpinner.classList.remove('hidden');

            if (modeImage.checked) {
                compressImage();
            } else {
                compressGzip();
            }
        }

        function compressImage() {
            const quality = parseFloat(imageQuality.value);
            const maxDimension = parseInt(imageResize.value, 10) || null;
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        let { width, height } = img;

                        // Calculate new dimensions if maxDimension is set
                        if (maxDimension && (width > maxDimension || height > maxDimension)) {
                            if (width > height) {
                                height = Math.round((height * maxDimension) / width);
                                width = maxDimension;
                            } else {
                                width = Math.round((width * maxDimension) / height);
                                height = maxDimension;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        
                        // Draw image to canvas
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get blob from canvas
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    const newFileName = getNewFileName(currentFile.name, 'image');
                                    showDownload(blob, newFileName);
                                } else {
                                    showError("Could not create compressed image blob.");
                                }
                            },
                            currentFile.type, // Use original mime type
                            quality // Apply quality setting
                        );
                    } catch (err) {
                        showError(err.message);
                    }
                };
                img.onerror = () => {
                    showError("Could not load the selected file as an image.");
                };
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                showError("Could not read the file.");
            };

            reader.readAsDataURL(currentFile);
        }

        function compressGzip() {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const data = new Uint8Array(arrayBuffer);
                    
                    // Use Pako.js to Gzip
                    const compressedData = pako.gzip(data);
                    
                    const blob = new Blob([compressedData], { type: 'application/gzip' });
                    const newFileName = getNewFileName(currentFile.name, 'gzip');
                    showDownload(blob, newFileName);
                    
                } catch (err) {
                    showError(err.message);
                }
            };
            
            reader.onerror = () => {
                showError("Could not read the file.");
            };

            reader.readAsArrayBuffer(currentFile);
        }

        function showDownload(blob, newFileName) {
            loadingSpinner.classList.add('hidden');
            downloadArea.classList.remove('hidden');

            const oldSize = currentFile.size;
            const newSize = blob.size;
            const percentChange = (((newSize - oldSize) / oldSize) * 100).toFixed(1);

            originalVsNew.innerHTML = `
                Original: <strong>${formatBytes(oldSize)}</strong> | 
                New: <strong>${formatBytes(newSize)}</strong> 
                <span class="${percentChange > 0 ? 'text-red-300' : 'text-green-300'}">(${percentChange > 0 ? '+' : ''}${percentChange}%)</span>
            `;

            const downloadUrl = URL.createObjectURL(blob);
            downloadButton.href = downloadUrl;
            downloadButton.download = newFileName;
        }

        function getNewFileName(originalName, mode) {
            const parts = originalName.split('.');
            const ext = parts.pop();
            const base = parts.join('.');
            
            if (mode === 'gzip') {
                return `${originalName}.gz`;
            }
            
            // For images
            return `${base}-compressed.${ext}`;
        }

        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
