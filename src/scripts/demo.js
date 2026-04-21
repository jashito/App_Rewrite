import { rewriteText } from "../services/rewrite.service.js";

const inputText =
  "Buenos dias equipo, les escribo para comentarles que estuvimos viendo varias cosas del proyecto y creemos que seria bueno hacer cambios para mejorar resultados en general, por favor revisen cuando puedan y luego vemos como seguir.";

async function runDemo() {
  const result = await rewriteText({
    text: inputText,
    tone: "profesional pero natural",
    audience: "equipo corporativo interno"
  });

  console.log("INPUT:");
  console.log(inputText);
  console.log("\nOUTPUT:");
  console.log(result.rewrittenText);
}

runDemo().catch((error) => {
  console.error("Error en demo:", error.message);
  process.exit(1);
});
