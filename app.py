from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import io
import easyocr
import cv2  # <--- Make sure CV2 is imported

app = Flask(__name__)
CORS(app)

# Initialize the EasyOCR reader (same as before)
try:
    reader = easyocr.Reader(['en'], gpu=True)
    print("EasyOCR reader initialized on GPU.")
except:
    reader = easyocr.Reader(['en'], gpu=False)
    print("EasyOCR reader initialized on CPU.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/ocr', methods=['POST'])
def ocr_endpoint():
    if 'image' not in request.files:
        return jsonify({'error': 'no file part named "image"'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    
    try:
        image_bytes = file.read()

        # --- Gentle Preprocessing for Handwriting ---
        # 1. Decode the image bytes into a CV2 image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 2. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. Apply CLAHE to enhance local contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)
        
        # 4. Encode the *enhanced* image back into bytes
        _, buffer = cv2.imencode('.png', enhanced_gray)
        processed_image_bytes = buffer.tobytes()
        # --- End of Preprocessing ---

        # Pass the *new* processed bytes to EasyOCR
        results = reader.readtext(processed_image_bytes)
        
        # Extract just the text
        text = "\n".join([res[1] for res in results])
        cleaned = text.strip()
        
        return jsonify({'text': cleaned})
    
    except Exception as e:
        print(f"Error during OCR: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
