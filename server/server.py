# Setting up flask backend.
from flask import Flask, jsonify

# app instance
app = Flask(__name__)


# /api/home
@app.route('/api/home', methods = ['GET'])
def returnHome():
    return jsonify({
        'message': "Hello Everyone..!!"
    })

if __name__ == "__main__":
    app.run(debug=True) # remove the debug when live
