import { geminiClient } from "./gemini.client.js";
import { env } from "../config/env.js";
import {
  buildRewriteSystemPrompt,
  buildRewriteUserPrompt,
  buildHumanizeSystemPrompt,
  buildHumanizeUserPrompt,
  buildWritingTypeInstructions,
  resolveWritingTypeProfile
} from "../prompts/rewrite.prompt.js";
import { HttpError } from "../utils/http-error.js";

export async function rewriteText({ text, tone, audience, writingType, promptConfig }) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "El campo 'text' es requerido.");
  }
  if (writingType && !resolveWritingTypeProfile(writingType)) {
    throw new HttpError(
      400,
      "writingType inválido. Usa: formal_email, internal_email o technical_report."
    );
  }

  const userPrompt = buildRewriteUserPrompt({
    text: text.trim(),
    tone,
    audience
  });
  const systemPrompt = buildRewriteSystemPrompt(promptConfig);
  const writingTypeInstructions = buildWritingTypeInstructions({
    writingType,
    tone,
    audience
  });

  const response = await callGemini({
    model: env.geminiModel,
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${writingTypeInstructions}\n\n${userPrompt}`.trim() }]
      }
    ]
  });

  const rewrittenText = response?.text?.trim();

  if (!rewrittenText) {
    throw new HttpError(502, "No fue posible obtener una respuesta válida de Gemini.");
  }

  const refinedText = await refineText({
    text: rewrittenText,
    previousText: text.trim(),
    tone,
    audience,
    writingType,
    humanizeConfig: promptConfig?.humanize
  });

  return {
    rewrittenText: refinedText,
    rawRewrittenText: rewrittenText,
    writingType: writingType || "default",
    model: env.geminiModel
  };
}

export async function refineText({
  text,
  previousText,
  tone,
  audience,
  writingType,
  humanizeConfig
}) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "El texto a refinar es requerido.");
  }

  const systemPrompt = buildHumanizeSystemPrompt({
    customConfig: humanizeConfig,
    tone,
    audience
  });
  const userPrompt = buildHumanizeUserPrompt({
    text: text.trim(),
    previousText: previousText || text.trim()
  });
  const writingTypeInstructions = buildWritingTypeInstructions({
    writingType,
    tone,
    audience
  });

  const response = await callGemini({
    model: env.geminiModel,
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${writingTypeInstructions}\n\n${userPrompt}`.trim() }]
      }
    ]
  });

  const refinedText = response?.text?.trim();

  if (!refinedText) {
    throw new HttpError(502, "No fue posible refinar el texto con un estilo más humano.");
  }

  return refinedText;
}

export const refineHumanText = refineText;

async function callGemini(payload) {
  if (!geminiClient) {
    throw new HttpError(503, "Gemini no está configurado. Usa Doppler o configura GEMINI_API_KEY.");
  }

  try {
    return await geminiClient.models.generateContent(payload);
  } catch (error) {
    const rawMessage = String(error?.message || "");
    const geminiErrorPayload = parseGeminiErrorPayload(rawMessage);
    const geminiStatus = geminiErrorPayload?.error?.status;
    const geminiCode = geminiErrorPayload?.error?.code;
    const geminiMessage = String(geminiErrorPayload?.error?.message || "");
    const dnsFailure =
      error?.cause?.code === "ENOTFOUND" ||
      String(error?.cause?.message || "").includes("ENOTFOUND");
    const highDemandFailure =
      geminiStatus === "UNAVAILABLE" ||
      geminiCode === 503 ||
      geminiMessage.toLowerCase().includes("high demand");
    const quotaExceededFailure =
      geminiStatus === "RESOURCE_EXHAUSTED" ||
      geminiCode === 429 ||
      geminiMessage.toLowerCase().includes("quota exceeded") ||
      geminiMessage.toLowerCase().includes("exceeded your current quota");

    if (dnsFailure) {
      throw new HttpError(
        503,
        "No se pudo conectar a Gemini (DNS). Verifica tu conexion, VPN/proxy o DNS para generativelanguage.googleapis.com."
      );
    }

    if (highDemandFailure) {
      throw new HttpError(
        503,
        "Gemini esta con alta demanda temporal. Intenta nuevamente en unos segundos."
      );
    }

    if (quotaExceededFailure) {
      const retrySeconds = extractRetrySeconds(rawMessage, geminiErrorPayload);
      const retryHint = retrySeconds
        ? ` Intenta nuevamente en aproximadamente ${retrySeconds} segundos.`
        : " Intenta nuevamente más tarde o revisa los límites/cuota de tu proyecto.";

      throw new HttpError(429, `Se alcanzó la cuota de Gemini.${retryHint}`);
    }

    throw new HttpError(502, `Error al conectar con Gemini: ${rawMessage}`);
  }
}

function parseGeminiErrorPayload(message) {
  const jsonStart = message.indexOf("{");

  if (jsonStart === -1) {
    return null;
  }

  try {
    return JSON.parse(message.slice(jsonStart));
  } catch {
    return null;
  }
}

function extractRetrySeconds(rawMessage, payload) {
  const retryFromDetails =
    payload?.error?.details?.find((detail) => detail?.retryDelay)?.retryDelay || null;
  if (retryFromDetails) {
    const parsed = Number.parseInt(String(retryFromDetails).replace(/\D/g, ""), 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const directSeconds = rawMessage.match(/Please retry in\s+([\d.]+)s/i);
  if (directSeconds?.[1]) {
    const parsed = Math.ceil(Number.parseFloat(directSeconds[1]));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}
