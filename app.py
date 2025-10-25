from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import io
import cv2
import easyocr
import time
import logging
import os

# -------------------------------
# Flask App Setup
# -------------------------------
app = Flask(__name__)
CORS(app)

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s"
)

# -------------------------------
# EasyOCR Reader Initialization
# -------------------------------
try:
    reader = easyocr.Reader(['en'], gpu=True)
    logging.info("✅ EasyOCR initialized using GPU.")
except Exception as e:
    reader = easyocr.Reader(['en'], gpu=False)
    logging.warning(f"⚠️ GPU not available, falling back to CPU. Reason: {e}")

# -------------------------------
# Helper Function: Preprocessing
# -------------------------------
def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Enhance the image for better OCR results.
    - Converts to grayscale
    - Applies CLAHE for contrast enhancement
    Returns processed image bytes.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image file")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(gray)

    _, buffer = cv2.imencode('.png', enhanced_gray)
    return buffer.tobytes()

# -------------------------------
# Routes
# -------------------------------
@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html')


@app.route('/api/ocr', methods=['POST'])
def ocr_endpoint():
    """
    Endpoint: /api/ocr
    Accepts: image (multipart/form-data)
    Returns: extracted text in JSON
    """
    start_time = time.time()

    if 'image' not in request.files:
        return jsonify({'error': 'No file part named "image" found.'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed_extensions:
        return jsonify({'error': 'Unsupported file type.'}), 400

    try:
        image_bytes = file.read()
        processed_bytes = preprocess_image(image_bytes)

        # OCR Extraction
        results = reader.readtext(processed_bytes)
        extracted_text = "\n".join([res[1] for res in results]).strip()

        response_time = round(time.time() - start_time, 2)
        logging.info(f"OCR processed in {response_time}s")

        return jsonify({
            'text': extracted_text,
            'processing_time': f"{response_time}s"
        }), 200

    except Exception as e:
        logging.error(f"OCR Processing Error: {e}")
        return jsonify({'error': f"OCR failed: {str(e)}"}), 500

# -------------------------------
# Main Entrypoint
# -------------------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    logging.info(f"🚀 Starting Flask server on port {port}...")
    app.run(debug=True, host='0.0.0.0', port=port)
