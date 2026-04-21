import { env } from "../config/env.js";

function formatLog(level, message, metadata) {
  const base = {
    ts: new Date().toISOString(),
    level,
    env: env.nodeEnv,
    message
  };

  return JSON.stringify(metadata ? { ...base, ...metadata } : base);
}

export const logger = {
  info(message, metadata) {
    console.log(formatLog("info", message, metadata));
  },
  warn(message, metadata) {
    console.warn(formatLog("warn", message, metadata));
  },
  error(message, metadata) {
    console.error(formatLog("error", message, metadata));
  }
};
