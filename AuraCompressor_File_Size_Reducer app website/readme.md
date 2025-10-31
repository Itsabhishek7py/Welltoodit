AuraCompress: The File Size Reducer App

A simple, beautiful, in-browser web application to help you reduce the size of your files quickly and easily. Built with a stunning green and blue "glass" aesthetic using Tailwind CSS.

Overview

AuraCompress is a single-page web app that provides two main methods for file compression right in your browser. No server uploads are needed, ensuring your data stays private.

Image Compression (Lossy): Reduce the size of JPG, PNG, and WEBP files by adjusting the quality and resizing the dimensions.

Gzip Compression (Lossless): Compress any file using the Gzip algorithm. This is highly effective for text-based files like .txt, .json, .csv, or .svg.

Features

Beautiful UI: A modern, responsive "glassmorphism" interface with a green-to-blue gradient background.

Drag & Drop: Easily drag and drop your file to get started.

Image Options: Fine-tune image compression with a quality slider and an option to set the maximum dimension (e.g., 1920px).

Gzip for General Files: A reliable compression method for non-image files.

Instant Feedback: See the original size, new size, and the percentage of reduction instantly.

Purely In-Browser: All compression happens on your computer. Your files are never sent to a server.

How to Use

Open index.html in any modern web browser.

Drag & drop a file onto the upload area, or click to select a file from your computer.

The app will auto-detect if the file is an image and suggest a compression mode. You can switch between "Image" and "General File (Gzip)" manually.

If compressing an image:

Adjust the Image Quality slider (lower means smaller file size).

(Optional) Set a Max Dimension to resize the image.

If compressing a general file:

Just leave the "General File (Gzip)" mode selected.

Click the "Compress File" button.

Wait for the compression to finish.

Click the "Download Compressed File" button to save your new, smaller file.

Technology Used

HTML5: The core structure of the app.

Tailwind CSS: For all styling, responsiveness, and the beautiful UI.

JavaScript (ES6+): Handles all the logic, file reading, and UI interactions.

HTML5 Canvas API: Used to draw, resize, and re-compress images.

Pako.js: A fast JavaScript library used to implement Gzip compression in the browser.