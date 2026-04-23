const inputText = document.getElementById("inputText");
const toneSelect = document.getElementById("tone");
const audienceInput = document.getElementById("audience");
const writingTypeSelect = document.getElementById("writingType");
const rewriteBtn = document.getElementById("rewriteBtn");
const resultText = document.getElementById("resultText");
const suggestionsBox = document.getElementById("suggestionsBox");
const learnedWordsKey = "rewrite-pro-learned-words";
const baseSuggestions = [
  "estimado",
  "equipo",
  "cordialmente",
  "adjunto",
  "agradezco",
  "confirmar",
  "revisión",
  "seguimiento",
  "implementación",
  "prioridad",
  "objetivo",
  "propuesta"
];

function setResultState(state) {
  resultText.classList.remove("result-loading", "result-error", "result-success");
  if (state) {
    resultText.classList.add(state);
  }
}

function getLearnedWords() {
  try {
    const value = localStorage.getItem(learnedWordsKey);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function saveLearnedWords(text) {
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-zA-Z]{4,}/g);

  if (!words?.length) {
    return;
  }

  const current = getLearnedWords();
  const merged = Array.from(new Set([...words, ...current])).slice(0, 200);
  localStorage.setItem(learnedWordsKey, JSON.stringify(merged));
}

function getCurrentToken(text) {
  const tokens = text.trimEnd().split(/\s+/);
  return tokens[tokens.length - 1] || "";
}

function renderSuggestions(suggestions) {
  suggestionsBox.innerHTML = "";

  if (!suggestions.length) {
    suggestionsBox.hidden = true;
    return;
  }

  suggestions.forEach((word) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-item";
    button.textContent = word;
    button.addEventListener("click", () => applySuggestion(word));
    suggestionsBox.appendChild(button);
  });

  suggestionsBox.hidden = false;
}

function getSuggestions(text) {
  const token = getCurrentToken(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!token || token.length < 2) {
    return [];
  }

  const source = Array.from(new Set([...getLearnedWords(), ...baseSuggestions]));
  return source
    .filter((word) => word.startsWith(token) && word !== token)
    .slice(0, 6);
}

function applySuggestion(word) {
  const text = inputText.value;
  const trimmedEnd = text.trimEnd();
  const trailingSpaces = text.length - trimmedEnd.length;
  const parts = trimmedEnd.split(/\s+/);
  parts[parts.length - 1] = word;
  inputText.value = `${parts.join(" ")}${" ".repeat(trailingSpaces)} `;
  inputText.focus();
  renderSuggestions([]);
}

async function rewriteContent() {
  const text = inputText.value.trim();
  const tone = toneSelect.value.trim();
  const audience = audienceInput.value.trim();
  const writingType = writingTypeSelect.value;

  if (!text) {
    setResultState("result-error");
    resultText.textContent = "Ingresa un texto antes de reescribir.";
    return;
  }

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Reescribiendo...";
  setResultState("result-loading");
  resultText.textContent = "Procesando...";

  try {
    saveLearnedWords(text);
    const payload = { text };
    if (tone) payload.tone = tone;
    if (audience) payload.audience = audience;
    if (writingType) payload.writingType = writingType;

    const response = await fetch("http://localhost:3000/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "Error al procesar la solicitud.";
      setResultState("result-error");
      resultText.textContent = `Error: ${message}`;
      return;
    }

    setResultState("result-success");
    resultText.textContent = data?.data?.rewrittenText || "No se obtuvo resultado.";
  } catch (error) {
    setResultState("result-error");
    resultText.textContent = `Error de conexión: ${error.message}`;
  } finally {
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = "Reescribir";
  }
}

inputText.addEventListener("input", () => {
  renderSuggestions(getSuggestions(inputText.value));
});

inputText.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || suggestionsBox.hidden) {
    return;
  }

  const firstSuggestion = suggestionsBox.firstElementChild?.textContent;
  if (!firstSuggestion) {
    return;
  }

  event.preventDefault();
  applySuggestion(firstSuggestion);
});

inputText.addEventListener("blur", () => {
  setTimeout(() => renderSuggestions([]), 120);
});

inputText.addEventListener("focus", () => {
  renderSuggestions(getSuggestions(inputText.value));
});

rewriteBtn.addEventListener("click", rewriteContent);
