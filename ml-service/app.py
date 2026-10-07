from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from preprocess import preprocess_text

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(MODEL_DIR, 'logistic_regression_model.pkl')

vectorizer = None
model = None

def load_models():
    global vectorizer, model
    try:
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            vectorizer = joblib.load(VECTORIZER_PATH)
            model = joblib.load(MODEL_PATH)
            print("ML Models loaded successfully.")
        else:
            print("Warning: ML models not found. Please run train_model.py first.")
    except Exception as e:
        print(f"Error loading models: {e}")

# Load models on startup
load_models()

@app.route('/', methods=['GET'])
def health_check():
    status = "ready" if model and vectorizer else "models_missing"
    return jsonify({"status": "ML Service is running", "model_status": status})

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vectorizer:
        return jsonify({
            "error": "Models not loaded. Train the model first."
        }), 503
        
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "Please provide 'text' in the request body."}), 400
        
    text = data['text']
    if not text.strip():
        return jsonify({"error": "Text cannot be empty."}), 400
        
    # Preprocess
    clean_text = preprocess_text(text)
    
    if not clean_text.strip():
        # Edge case: text was only stop words or symbols
        return jsonify({
            "prediction": "Unverified",
            "confidence": 0.0,
            "message": "Text too short or only contained stop words."
        })
        
    # Vectorize
    features = vectorizer.transform([clean_text])
    
    # Predict
    prediction = model.predict(features)[0]
    
    # Get probabilities
    probabilities = model.predict_proba(features)[0]
    classes = model.classes_
    
    # Find probability for the predicted class
    pred_idx = list(classes).index(prediction)
    confidence = float(probabilities[pred_idx])
    
    # Confidence as percentage
    confidence_percentage = round(confidence * 100, 2)
    
    return jsonify({
        "prediction": prediction,
        "confidence": confidence_percentage,
        "clean_text_debug": clean_text
    })

if __name__ == '__main__':
    from waitress import serve
    print("Starting ML Service on port 5000...")
    serve(app, host="0.0.0.0", port=5000)
