const inputText = document.getElementById("inputText");
const rewriteBtn = document.getElementById("rewriteBtn");
const resultText = document.getElementById("resultText");

async function rewriteContent() {
  const text = inputText.value.trim();

  if (!text) {
    resultText.textContent = "Ingresa un texto antes de reescribir.";
    return;
  }

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Reescribiendo...";
  resultText.textContent = "Procesando...";

  try {
    const response = await fetch("http://localhost:3000/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "Error al procesar la solicitud.";
      resultText.textContent = `Error: ${message}`;
      return;
    }

    resultText.textContent = data?.data?.rewrittenText || "No se obtuvo resultado.";
  } catch (error) {
    resultText.textContent = `Error de conexión: ${error.message}`;
  } finally {
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = "Reescribir";
  }
}

rewriteBtn.addEventListener("click", rewriteContent);
