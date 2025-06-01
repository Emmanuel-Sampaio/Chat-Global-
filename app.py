from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, send, disconnect
from datetime import datetime

app = Flask(__name__, static_folder='Statics')
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = set()
user_sid_map = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Statics/<path:filename>')
def custom_static(filename):
    return send_from_directory('Statics', filename)

@socketio.on('connect')
def on_connect():
    print(f'Cliente conectado: {request.sid}')

@socketio.on('disconnect')
def on_disconnect():
    user_to_remove = None
    for user, sid in user_sid_map.items():
        if sid == request.sid:
            user_to_remove = user
            break
    if user_to_remove:
        connected_users.remove(user_to_remove)
        del user_sid_map[user_to_remove]
        print(f'Usuário {user_to_remove} desconectado e removido da lista.')

@socketio.on('set_username')
def handle_set_username(data):
    name = data.get('name')
    if not name:
        send({'error': 'Nome inválido.'}, to=request.sid)
        disconnect()
        return

    if name in connected_users:
        send({'error': f'Nome "{name}" já está em uso!'}, to=request.sid)
        disconnect()
        return

    connected_users.add(name)
    user_sid_map[name] = request.sid
    send({'success': f'Nome "{name}" registrado com sucesso.'}, to=request.sid)
    print(f'Usuário registrado: {name} [{request.sid}]')

@socketio.on('message')
def handle_message(data):
    name = data.get('name')
    if name not in connected_users:
        send({'error': 'Você precisa registrar um nome válido antes de enviar mensagens.'}, to=request.sid)
        disconnect()
        return

    message = data.get('message', '')
    device = data.get('device', 'Unknown device')
    timestamp = datetime.now().strftime('%H:%M')

    print(f'[{timestamp}] "{message}" de {name}  [ID: {request.sid}]')

    send({
        'name': name,
        'device': device,
        'message': message,
        'time': timestamp
    }, broadcast=True, include_self=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001)