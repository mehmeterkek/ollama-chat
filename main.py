import json
import os

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

app = FastAPI(title="Ollama Chat")


@app.get("/api/models")
async def list_models():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OLLAMA_URL}/api/tags", timeout=10)
        resp.raise_for_status()
        data = resp.json()
    return {"models": [m["name"] for m in data.get("models", [])]}


@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    model = body.get("model")
    messages = body.get("messages", [])

    async def event_stream():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_URL}/api/chat",
                json={"model": model, "messages": messages, "stream": True},
            ) as resp:
                async for line in resp.aiter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    if chunk.get("message", {}).get("content"):
                        yield chunk["message"]["content"]
                    if chunk.get("done"):
                        break

    return StreamingResponse(event_stream(), media_type="text/plain")


app.mount("/", StaticFiles(directory="static", html=True), name="static")
