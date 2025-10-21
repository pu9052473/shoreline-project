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
            predictions = []
            daily_totals = model_result.get('daily_totals', [])
            for i, day_data in enumerate(daily_totals):
                day_num = i + 1
                # Extract prediction data from your model's response
                # Adjust these fields based on your actual model output
                pred = {
                    'day': f'Day {day_num}',
                    'erosion':  day_data.get('total_m', 0.0),
                    # 'confidence': model_result.get('predictions', [{}])[i].get('confidence', 95 + i),
                    'confidence': 95,  # static placeholder,
                    'image': f'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&v={i}'
                }
                predictions.append(pred)
            
            return jsonify({
                'success': True,
                'predictions': predictions,
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
        
        # Make request to your long-term model API
        response = requests.get(
            LONG_TERM_API_URL,
            headers=headers,
            params=payload,
            timeout=MODEL_TIMEOUT/1000
        )
        if response.status_code == 200:
            model_result = response.json()
            # Process the model result and format for frontend
            predictions = []
            for i in range(4):
                week_num = i + 1
                # Extract prediction data from your model's response
                # Adjust these fields based on your actual model output
                prediction = {
                    'week': f'Week {week_num}',
                    'erosion': model_result.get('predictions', [{}])[i].get('erosion_rate', 0.8 + (i * 0.1)),
                    'confidence': model_result.get('predictions', [{}])[i].get('confidence', 94 + i),
                    'image': model_result.get('predictions', [{}])[i].get('image_url', f'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&v={i}')
                }
                predictions.append(prediction)
            
            return jsonify({
                'success': True,
                'predictions': predictions,
                'model_info': {
                    'type': 'long_term',
                    'duration': '1_month',
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
