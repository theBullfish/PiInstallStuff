# Import Statements
from flask import Flask, request, jsonify
import requests
import socket
import logging
from apscheduler.schedulers.background import BackgroundScheduler
import psycopg2
from psycopg2.extras import RealDictCursor


# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Flask App Initialization
app = Flask(__name__)

# Global Variables
collected_data = []
pi_identifier = socket.gethostname()

# Database Connection Function
def get_db_connection():
    conn = psycopg2.connect(
        host='localhost',
        port='5433',
        database='mynewdb',
        user='postgres',
        password='Santana@11')
    return conn

# Utility Functions
def send_data_to_server(data_batch):
    try:
        server_url = 'http://mainserver.example.com/ingest'
        response = requests.post(server_url, json=data_batch)
        if response.status_code == 200:
            return True
        else:
            logging.error(f"Server responded with status code: {response.status_code}")
            return False
    except Exception as e:
        logging.error(f"Error sending data to server: {e}")
        return False

def batch_send():
    global collected_data
    if collected_data:
        if send_data_to_server(collected_data):
            logging.info("Data sent successfully. Clearing collected data.")
            collected_data.clear()
        else:
            logging.error("Data sending failed, will retry.")

# Flask Routes
@app.route('/collect', methods=['POST'])
def collect_data():
    try:
        data = request.json

        # Extracting data from the request
        artist = data.get('artist')
        service = data.get('service')
        timestamp = data.get('timestamp')
        title = data.get('title')

        # Check if all necessary data is present
        if not all([artist, service, timestamp, title]):
            logging.error("Missing data in request")
            return jsonify({"status": "error", "message": "Missing data"}), 400

        # Add the Pi identifier
        pi_id = pi_identifier

        # Database connection and insertion
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO picollector_song_plays (pi_id, artist, service, timestamp, title) VALUES (%s, %s, %s, %s, %s)',
                       (pi_id, artist, service, timestamp, title))
        conn.commit()
        cursor.close()
        conn.close()

        # Optionally, append data to collected_data if needed
        collected_data.append({"pi_id": pi_id, "artist": artist, "service": service, "timestamp": timestamp, "title": title})

        return jsonify({"status": "success"}), 200

    except Exception as e:
        logging.error(f"Error in collect_data: {e}")
        return jsonify({"status": "error"}), 500


# Background Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(batch_send, 'interval', minutes=5)
scheduler.start()

# App Entry Point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# Navigate to the project directory
cd ~/PiInstallStuff/PiBrowserCollector

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Deactivate the virtual environment
deactivate

# Create a systemd service file
sudo tee /etc/systemd/system/pi_browser_collector.service > /dev/null << EOF
[Unit]
Description=Pi Browser Collector Service
After=network.target

[Service]
ExecStart=/home/adminbrad/PiInstallStuff/Pi Browser Collector/venv/bin/python3 /home/adminbrad/PiInstallStuff/Pi Browser Collector/app.py
WorkingDirectory=/home/adminbrad/PiInstallStuff/Pi Browser Collector
StandardOutput=inherit
StandardError=inherit
Restart=always
User=adminbrad

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable pi_browser_collector.service
sudo systemctl start pi_browser_collector.service

echo "Installation and setup completed successfully."
echo "Pi Browser Collector is now running and will start automatically on boot."
