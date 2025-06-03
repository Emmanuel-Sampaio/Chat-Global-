import asyncio
import websockets
import json
from datetime import datetime

connected = set()
usernames = dict()

async def handler(websocket):
    connected.add(websocket)
    try:
        while True:
            message = await websocket.recv()
            data = json.loads(message)

            if websocket not in usernames:
                if data.get("type") == "set_username":
                    name = data.get("name")
                    if not name or name in usernames.values():
                        await websocket.send(json.dumps({
                            "type": "error",
                            "error": "Esse nome já foi cadastrado, digite um novo"
                        }))
                        continue
                    usernames[websocket] = name
                    await websocket.send(json.dumps({
                        "type": "success",
                        "success": f'Nome "{name}" registrado.'
                    }))
                    print(f'Usuário registrado: {name}')
                else:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "error": "Registre um nome primeiro."
                    }))
            else:
                if data.get("type") == "message":
                    name = usernames[websocket]
                    msg = data.get("message", "")
                    timestamp = datetime.now().strftime('%H:%M')
                    print(f'[{timestamp}] {name}: {msg}')
                    broadcast_data = json.dumps({
                        "type": "message",
                        "name": name,
                        "message": msg,
                        "time": timestamp
                    })
                    await asyncio.gather(*[conn.send(broadcast_data) for conn in connected])
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected.discard(websocket)
        if websocket in usernames:
            print(f'Usuário desconectado: {usernames[websocket]}')
            del usernames[websocket]

async def main():
    print("Servidor WebSocket rodando em ws://0.0.0.0:5001")
    async with websockets.serve(handler, "0.0.0.0", 5001):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
