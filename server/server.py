# Setting up flask backend.
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import time
from datetime import datetime, timedelta

# app instance
app = Flask(__name__)
# Allow all origins, all methods, all headers
CORS(app, resources={r"/*": {"origins": "*"}})

# Load environment variables
SHORT_TERM_API_KEY = os.getenv('SHORT_TERM_API_KEY', 'your_short_term_api_key_here')
SHORT_TERM_API_URL = os.getenv('SHORT_TERM_API_URL', 'http://127.0.0.1:8000/forecast-7d/summary')
LONG_TERM_API_KEY = os.getenv('LONG_TERM_API_KEY', 'your_long_term_api_key_here')
LONG_TERM_API_URL = os.getenv('LONG_TERM_API_URL', 'http://127.0.0.1:8080/shorelines/long-term')
MODEL_TIMEOUT = int(os.getenv('MODEL_TIMEOUT', '30000'))
MODEL_MAX_RETRIES = int(os.getenv('MODEL_MAX_RETRIES', '3'))
MODEL_API_KEY = os.getenv('MODEL_API_KEY', 'your_model_api_key_here')

# /api/home
@app.route('/api/home', methods = ['GET'])
def returnHome():
    return jsonify({
        'message': "Hello Everyone..!!"
    })

# /api/predict/short-term
@app.route('/api/predict/short-term', methods=['POST'])
def predict_short_term():
    try:
        # Get request data
        data = request.get_json()
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Prepare request to your short-term model API
        headers = {
            'Authorization': f'Bearer {SHORT_TERM_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model_type': 'short_term',
            'timestamp': timestamp,
            'duration': '7_days'
        }
        
        # Make request to your short-term model API
        response = requests.get(
            SHORT_TERM_API_URL,
            headers=headers,
            params=payload,
            timeout=MODEL_TIMEOUT/1000
        )
        if response.status_code == 200:
            model_result = response.json()
            print("Short-term model response status:", model_result)
            
            # Process the model result and format for frontend
            daily_totals = model_result.get('daily_totals', [])
            if not daily_totals:
                return jsonify({
                    'success': False,
                    'error': 'No daily totals returned from model'
                }), 500

            return jsonify({
                'success': True,
                'model_result': model_result,
                'model_info': {
                    'type': 'short_term',
                    'duration': '7_days',
                    'timestamp': timestamp
                }
            })

        else:
            return jsonify({
                'success': False,
                'error': f'Model API returned status {response.status_code}',
                'message': 'Failed to get prediction from model'
            }), 500
            
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'Model API timeout',
            'message': 'The model took too long to respond'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': 'Model API connection failed',
            'message': str(e)
        }), 503
    except Exception as e:
        print("error", e)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# /api/predict/long-term
@app.route('/api/predict/long-term', methods=['POST'])
def predict_long_term():
    try:
        # Get request data
        data = request.get_json()
        timestamp = data.get('timestamp', datetime.now().isoformat())
        print("📩 Received request:", data)

        # Prepare request to your long-term model API
        headers = {
            'Authorization': f'Bearer {LONG_TERM_API_KEY}',
            'Content-Type': 'application/json'
        }

        payload = {
            'model_type': 'long_term',
            'timestamp': timestamp,
            'duration': '1_month'
        }

        print("🚀 Sending to model:", LONG_TERM_API_URL, payload)

        # Make request to your long-term model API
        response = requests.get(
            LONG_TERM_API_URL,
            headers=headers,
            json=payload,
            timeout=MODEL_TIMEOUT / 1000
        )

        print("✅ Model response status:", response.status_code)
        print("📦 Model response body:", response.text[:400])  # limit logs

        if response.status_code == 200:
           model_result = response.json()
           print("Long-term model result:", model_result)

           return jsonify({
            'success': True,
            'model_result': model_result, 
            'model_info': {
                'type': 'long_term',
                'duration': '75_years',
                'timestamp': timestamp
            }
           })

        else:
            # Model API returned non-200 response
            print("⚠️ Model API error:", response.text)
            return jsonify({
                'success': False,
                'error': f'Model API returned status {response.status_code}',
                'message': response.text
            }), 500

    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'Model API timeout',
            'message': 'The model took too long to respond'
        }), 504

    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': 'Model API connection failed',
            'message': str(e)
        }), 503

    except Exception as e:
        print("❌ Internal Error:", e)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_api_configured': bool(MODEL_API_KEY and MODEL_API_KEY != 'your_model_api_key_here')
    })

if __name__ == "__main__":
    app.run(debug=True) # remove the debug when live
