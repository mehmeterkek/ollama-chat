# Ollama Chat

A simple, self-hosted, ChatGPT-style web interface for chatting with local models served by [Ollama](https://ollama.com). Built with Python (FastAPI) on the backend and vanilla HTML/CSS/JS on the frontend. No database, no accounts — everything runs on your machine and chat history lives only in the browser tab.

## Features

- ChatGPT-like dark UI with streaming responses
- Dropdown to switch between any model you've pulled into Ollama
- "New chat" button to clear the conversation
- No database, no external services — 100% local

## Prerequisites

- **Python 3.9+**
- **Ollama** (runs the models locally)
- ~4-8 GB free disk space per model you pull, plus enough RAM to run it

## Step 1: Install Ollama

**macOS**

Download the app from [ollama.com/download](https://ollama.com/download), or install via Homebrew:

```bash
brew install ollama
```

**Linux**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows**

Download the installer from [ollama.com/download](https://ollama.com/download).

## Step 2: Start Ollama and pull a model

Start the Ollama service (the macOS/Windows app does this automatically when opened; on Linux it runs as a systemd service after install, or start it manually):

```bash
ollama serve
```

In a separate terminal, pull at least one model:

```bash
ollama pull llama3
```

Other good options: `phi3`, `gemma3:4b`, `qwen2.5:7b` (bigger = smarter but slower and more RAM-hungry). You can pull as many as you like — they'll all show up in the app's model dropdown.

Verify it's working:

```bash
ollama list
```

## Step 3: Get this code

If you're cloning from GitHub:

```bash
git clone https://github.com/mehmeterkek/ollama-chat.git
cd ollama-chat
```

## Step 4: Set up the Python environment

```bash
python3 -m venv venv
source venv/bin/activate      # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 5: Run the app

Make sure Ollama is running (`ollama serve` or the desktop app), then:

```bash
uvicorn main:app --reload
```

Open your browser to **http://127.0.0.1:8000**.

## Usage

1. Pick a model from the dropdown in the top right.
2. Type a message and press Enter (or click Send).
3. Click **New chat** to clear the conversation and start fresh.

## Configuration

By default the app talks to Ollama at `http://localhost:11434`. If your Ollama instance runs elsewhere, set the `OLLAMA_URL` environment variable before starting the server:

```bash
OLLAMA_URL=http://192.168.1.50:11434 uvicorn main:app --reload
```

## Troubleshooting

- **"Ollama unreachable" in the model dropdown** — Ollama isn't running, or isn't on the default port. Run `ollama serve` and refresh the page.
- **"No models found"** — you haven't pulled any models yet. Run `ollama pull llama3` (or any model of your choice).
- **Port 8000 already in use** — run on a different port: `uvicorn main:app --reload --port 8001`.
- **Responses are slow** — larger models need more RAM/CPU (or GPU). Try a smaller model like `phi3` or `gemma3:4b`.

## Project structure

```
ollama-chat/
├── main.py              # FastAPI backend (proxies Ollama's API, streams responses)
├── requirements.txt
├── static/
│   ├── index.html       # Chat UI markup
│   ├── style.css         # ChatGPT-style dark theme
│   └── app.js            # Frontend logic (model loading, streaming, chat state)
└── README.md
```
