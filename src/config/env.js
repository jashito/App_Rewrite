import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["GEMINI_API_KEY"];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Falta variable de entorno requerida: ${varName}`);
  }
}

const allowedNodeEnvs = ["development", "test", "production"];
const nodeEnv = process.env.NODE_ENV ?? "development";

if (!allowedNodeEnvs.includes(nodeEnv)) {
  throw new Error("NODE_ENV inválido. Usa development, test o production.");
}

const parsedPort = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
  throw new Error("PORT inválido. Debe ser un entero entre 1 y 65535.");
}

export const env = {
  nodeEnv,
  port: parsedPort,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
};
