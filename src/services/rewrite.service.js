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
  try {
    return await geminiClient.models.generateContent(payload);
  } catch (error) {
    const dnsFailure =
      error?.cause?.code === "ENOTFOUND" ||
      String(error?.cause?.message || "").includes("ENOTFOUND");

    if (dnsFailure) {
      throw new HttpError(
        503,
        "No se pudo conectar a Gemini (DNS). Verifica tu conexion, VPN/proxy o DNS para generativelanguage.googleapis.com."
      );
    }

    throw new HttpError(502, `Error al conectar con Gemini: ${error.message}`);
  }
}
