from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model
import numpy as np

app = Flask(__name__)
# Allowing CORS for all domains on all routes (customize as needed)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load the model only once, when the Flask app starts
MODEL_PATH = './model/finalModel.h5'
model = load_model(MODEL_PATH)

@app.route("/")
def home():
    return {"message": "Hello from backend"}

@app.route("/uploads", methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    img_path = os.path.join('uploads', filename)
    file.save(img_path)

    try:
        # Ensure the image is resized to the dimensions expected by the model
        img = load_img(img_path, target_size=(224, 224))
        x = img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x /= 255.0

        # Prediction
        predictions = model.predict(x)
        predicted_class_index = np.argmax(predictions)
        class_labels = {0: 'NoDR', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'ProliferativeDR'}
        predicted_class = class_labels[predicted_class_index]
        
        # Clean up after prediction
        os.remove(img_path)
        
        return jsonify({"message": predicted_class})
    except Exception as e:
        # Remove the saved file in case of an exception
        if os.path.exists(img_path):
            os.remove(img_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)  # Remember to turn off debug in production
