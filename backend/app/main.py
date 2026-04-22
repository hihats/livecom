"""livecom backend entrypoint.

See docs/openapi.yaml and docs/ws-schema.json for the authoritative specs.
"""

import logging

from fastapi import FastAPI

from app.api import audio_ws

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(
    title="livecom HTTP API",
    version="0.1.0",
    description="See docs/openapi.yaml for the authoritative spec.",
)

app.include_router(audio_ws.router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}
