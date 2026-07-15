const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("input");
const sendEl = document.getElementById("send");
const modelSelect = document.getElementById("model-select");
const newChatBtn = document.getElementById("new-chat");

let history = [];
let busy = false;

function renderEmptyState() {
  chatEl.innerHTML = '<div class="empty-state">Pick a model and start chatting.</div>';
}

function scrollToBottom() {
  chatEl.scrollTop = chatEl.scrollHeight;
}

function addMessage(role, content) {
  document.querySelector(".empty-state")?.remove();

  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  scrollToBottom();
  return bubble;
}

async function loadModels() {
  try {
    const resp = await fetch("/api/models");
    const data = await resp.json();
    modelSelect.innerHTML = "";
    if (!data.models || data.models.length === 0) {
      modelSelect.innerHTML = '<option value="">No models found</option>';
      return;
    }
    for (const name of data.models) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      modelSelect.appendChild(opt);
    }
  } catch (err) {
    modelSelect.innerHTML = '<option value="">Ollama unreachable</option>';
  }
}

function setBusy(state) {
  busy = state;
  sendEl.disabled = state;
  inputEl.disabled = state;
}

async function sendMessage(text) {
  const model = modelSelect.value;
  if (!model) {
    addMessage("assistant", "No model selected. Is Ollama running with a model pulled?");
    return;
  }

  history.push({ role: "user", content: text });
  addMessage("user", text);

  const bubble = addMessage("assistant", "");
  bubble.classList.add("pending");

  setBusy(true);
  let assistantText = "";

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: history }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error(`Request failed: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistantText += decoder.decode(value, { stream: true });
      bubble.textContent = assistantText;
      scrollToBottom();
    }
  } catch (err) {
    assistantText += `\n\n[error: ${err.message}]`;
    bubble.textContent = assistantText;
  } finally {
    bubble.classList.remove("pending");
    history.push({ role: "assistant", content: assistantText });
    setBusy(false);
  }
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text || busy) return;
  inputEl.value = "";
  inputEl.style.height = "auto";
  sendMessage(text);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    formEl.requestSubmit();
  }
});

inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = `${Math.min(inputEl.scrollHeight, 200)}px`;
});

newChatBtn.addEventListener("click", () => {
  history = [];
  renderEmptyState();
});

renderEmptyState();
loadModels();
