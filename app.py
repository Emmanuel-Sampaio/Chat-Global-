from flask import Flask, render_template, send_from_directory, request
from flask_socketio import SocketIO, send
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Statics/<path:filename>')
def serve_static(filename):
    return send_from_directory('Statics', filename)

@socketio.on('message')
def handle_message(data):
    sender_id = request.sid
    name = data.get('name', 'Anon')
    device = data.get('device', 'Unknown device')
    message = data.get('message', '')
    timestamp = datetime.now().strftime('%H:%M')

    print(f'[{timestamp}] "{message}" de {name}  [ID: {sender_id}]')

    formatted_msg = f'[{timestamp}] {name} : {message}'
    send(formatted_msg, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)
