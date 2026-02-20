from flask import Flask, request, jsonify
from flask_cors import CORS
from classifier import classify_crime, predict_risk

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Crime AI API'})

@app.route('/classify', methods=['POST'])
def classify():
    """Classify crime type from FIR description text."""
    data = request.get_json()
    description = data.get('description', '')
    if not description:
        return jsonify({'error': 'description is required'}), 400
    result = classify_crime(description)
    return jsonify(result)

@app.route('/predict', methods=['POST'])
def predict():
    """Predict risk level for a region based on historical data."""
    data = request.get_json()
    region = data.get('region', '')
    fir_count = data.get('fir_count', 0)
    result = predict_risk(region, fir_count)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
