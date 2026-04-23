import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export const geminiClient = env.geminiApiKey
  ? new GoogleGenAI({ apiKey: env.geminiApiKey })
  : null;
