"""whisper-service: host-side STT over HTTP.

See docs/whisper-service-api.yaml for the authoritative spec.
"""

from fastapi import FastAPI

app = FastAPI(
    title="whisper-service",
    version="0.1.0",
    description="Host-side faster-whisper transcription service.",
)


@app.get("/healthz")
async def healthz() -> dict[str, object]:
    return {"status": "ok", "model_loaded": False}
