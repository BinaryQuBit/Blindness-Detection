# Imports

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from PIL import Image
import numpy as np
import tflite_runtime.interpreter as tflite

# Upload Folder Path
UPLOAD_FOLDER = 'backend/uploads'

# Static File Serving with CORS Policy
app = Flask(__name__, static_folder='out')
CORS(app, resources={r"/*": {"origins": "https://blindnessdetection.csproject.org/"}})

# Upload folder check
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serving Root with Index
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if os.path.isfile(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Endpoint to upload file and send response back
@app.route("/api/uploads", methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        file.save(file_path)

        img = Image.open(file_path).convert('RGB').resize((224, 224))
        x = np.array(img, dtype=np.float32)
        x = np.expand_dims(x, axis=0)
        x /= 255.0
        
        MODEL_PATH = 'backend/model/finalModel.tflite'
        
        interpreter = tflite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        interpreter.set_tensor(input_details[0]['index'], x)

        interpreter.invoke()

        output_data = interpreter.get_tensor(output_details[0]['index'])
        predicted_class_index = np.argmax(output_data)
        class_labels = {0: 'NoDR', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'ProliferativeDR'}
        predicted_class = class_labels[predicted_class_index]

        os.remove(file_path)

        return jsonify({"message": predicted_class})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=86, debug=True)
