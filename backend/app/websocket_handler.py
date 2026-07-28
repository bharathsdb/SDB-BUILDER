"""
WebSocket Handler for Real-Time Collaboration
Manages connections for live updates, notifications, and team collaboration.
"""
import json
import logging
from typing import Set, Dict
from fastapi import WebSocket, WebSocketDisconnect, APIRouter

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, room_id: str = None):
        await websocket.accept()
        
        # Track by user
        self.user_connections[user_id] = websocket
        
        # Track by room/project
        if room_id:
            if room_id not in self.active_connections:
                self.active_connections[room_id] = set()
            self.active_connections[room_id].add(websocket)
        
        logger.info(f"WebSocket connected: user={user_id}, room={room_id}")

    def disconnect(self, websocket: WebSocket, user_id: str, room_id: str = None):
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        if room_id and room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        
        logger.info(f"WebSocket disconnected: user={user_id}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_json(message)
            except Exception:
                pass

    async def broadcast_to_room(self, message: dict, room_id: str, exclude_user_id: str = None):
        if room_id not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        for conn in disconnected:
            self.active_connections[room_id].discard(conn)

    async def broadcast_all(self, message: dict):
        disconnected = []
        for user_id, connection in self.user_connections.items():
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(user_id)
        
        for uid in disconnected:
            del self.user_connections[uid]


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, project_id: str = None):
    await manager.connect(websocket, user_id, project_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type", "")
            payload = message.get("payload", {})
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif msg_type == "join_room":
                room_id = payload.get("room_id")
                if room_id:
                    if project_id and project_id in manager.active_connections:
                        manager.active_connections[project_id].discard(websocket)
                    manager.active_connections.setdefault(room_id, set()).add(websocket)
                    await manager.broadcast_to_room(
                        {"type": "user_joined", "payload": {"user_id": user_id}},
                        room_id,
                    )
            
            elif msg_type == "cursor_update":
                room_id = payload.get("room_id")
                if room_id:
                    await manager.broadcast_to_room(
                        {"type": "cursor_update", "payload": {"user_id": user_id, "position": payload.get("position")}},
                        room_id, exclude_user_id=user_id,
                    )
            
            elif msg_type == "comment":
                room_id = payload.get("room_id")
                if room_id:
                    await manager.broadcast_to_room(
                        {"type": "comment", "payload": payload},
                        room_id,
                    )
            
            elif msg_type == "plan_update":
                room_id = payload.get("room_id")
                if room_id:
                    await manager.broadcast_to_room(
                        {"type": "plan_update", "payload": payload},
                        room_id, exclude_user_id=user_id,
                    )
            
            elif msg_type == "notification":
                target_user = payload.get("target_user_id")
                if target_user:
                    await manager.send_personal_message(
                        {"type": "notification", "payload": payload},
                        target_user,
                    )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, project_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id, project_id)
