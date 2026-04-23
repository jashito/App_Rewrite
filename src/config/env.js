import dotenv from "dotenv";

const isDoppler = !!process.env.DOPPLER_CONFIG;
const isProduction = process.env.NODE_ENV === "production";

if (!isDoppler) {
  dotenv.config();
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

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  if (isProduction) {
    throw new Error("Falta GEMINI_API_KEY. Configura tus secrets en Doppler.");
  }
  console.warn("⚠️  GEMINI_API_KEY no encontrada. Usa Doppler o crea un archivo .env");
}

export const env = {
  nodeEnv,
  port: parsedPort,
  geminiApiKey,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  isDoppler
};
