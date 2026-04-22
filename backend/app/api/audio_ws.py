"""WebSocket endpoint for audio streaming and server-pushed messages.

See docs/ws-schema.json for the authoritative message schema.
"""

import base64
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/sessions/{session_id}/ws")
async def audio_ws(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    total_bytes = 0
    try:
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type")
            if msg_type == "hello":
                logger.info("hello session_id=%s", msg.get("session_id"))
            elif msg_type == "audio_chunk":
                chunk = base64.b64decode(msg["pcm_b64"])
                total_bytes += len(chunk)
                logger.info(
                    "audio_chunk seq=%s bytes=%d total=%d",
                    msg.get("seq"),
                    len(chunk),
                    total_bytes,
                )
            elif msg_type == "qa_request":
                await websocket.send_json(
                    {"type": "error", "message": "qa not implemented yet (M5)"}
                )
            elif msg_type == "bye":
                logger.info(
                    "bye session_id=%s total_bytes=%d", session_id, total_bytes
                )
                break
            else:
                logger.warning("unknown message type: %s", msg_type)
    except WebSocketDisconnect:
        logger.info(
            "disconnect session_id=%s total_bytes=%d", session_id, total_bytes
        )
