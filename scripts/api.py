from flask import Flask, request, jsonify
from flask_cors import CORS
import smule_engine 

app = Flask(__name__)
CORS(app) # This tells Oracle to accept requests from outside (Vercel)

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "The Oracle Engine is awake and listening!"})

@app.route('/capture', methods=['POST'])
def capture():
    data = request.json
    song_url = data.get('url')
    
    if not song_url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        # This triggers the Seal Team Six logic
        result = smule_engine.get_smule_data(song_url)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Runs on port 8080, listening to all incoming connections (0.0.0.0)
    app.run(host='0.0.0.0', port=8080)