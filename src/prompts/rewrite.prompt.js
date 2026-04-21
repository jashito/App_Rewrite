export const defaultRewritePromptConfig = {
  locale: "español latino",
  tone: "profesional pero natural",
  audience: "equipo corporativo general",
  style: {
    direct: true,
    avoidFiller: true,
    noForcedOpenings: true,
    noForcedClosings: true,
    variedSentenceStructure: true,
    avoidRepetitivePatterns: true,
    specificAndConcreteLanguage: true
  },
  bannedPatterns: [
    "Como modelo de lenguaje",
    "En conclusión",
    "Para finalizar",
    "Espero que te sirva",
    "Sin más preámbulos"
  ]
};

export const writingTypeProfiles = {
  formal_email: {
    label: "email formal",
    tone: "formal, claro y diplomático",
    structure:
      "Asunto implícito claro, contexto breve, solicitud/decisión concreta y cierre profesional breve.",
    styleGuidelines: [
      "Usa tratamiento respetuoso y lenguaje institucional.",
      "Evita coloquialismos y ambiguedades.",
      "Prioriza precisión en plazos, responsables y próximos pasos."
    ]
  },
  internal_email: {
    label: "email interno",
    tone: "profesional, cercano y directo",
    structure: "Contexto corto, punto principal, acciones esperadas y fecha de seguimiento si aplica.",
    styleGuidelines: [
      "Mantén lenguaje natural entre equipos, sin rigidez excesiva.",
      "Usa verbos de acción y frases breves.",
      "Reduce formalismos innecesarios."
    ]
  },
  technical_report: {
    label: "reporte técnico",
    tone: "técnico, objetivo y accionable",
    structure: "Hallazgos, impacto, evidencia y recomendaciones priorizadas.",
    styleGuidelines: [
      "Diferencia claramente hechos, diagnóstico y recomendación.",
      "Evita adjetivos vagos; usa términos técnicos concretos.",
      "Expón riesgos y dependencias de forma explícita."
    ]
  }
};

export const defaultHumanizePromptConfig = {
  detectRoboticTone: true,
  reduceRedundancy: true,
  improveFluency: true,
  variedRhythm: true,
  avoidTemplatePhrasing: true,
  keepMeaning: true
};

export function buildRewriteSystemPrompt(customConfig = {}) {
  const config = mergePromptConfig(customConfig);
  const styleRules = [];

  if (config.style.direct) {
    styleRules.push("Sé directo y prioriza la información accionable.");
  }

  if (config.style.avoidFiller) {
    styleRules.push("Elimina relleno, redundancias y frases vacías.");
  }

  if (config.style.noForcedOpenings) {
    styleRules.push("No uses introducciones forzadas.");
  }

  if (config.style.noForcedClosings) {
    styleRules.push("No uses conclusiones o cierres forzados.");
  }

  if (config.style.variedSentenceStructure) {
    styleRules.push("Varía la estructura de las frases: combina frases cortas, medias y subordinadas cuando aporte claridad.");
  }

  if (config.style.avoidRepetitivePatterns) {
    styleRules.push("Evita patrones repetitivos (mismos conectores, aperturas o cadencias en frases consecutivas).");
  }

  if (config.style.specificAndConcreteLanguage) {
    styleRules.push("Prioriza lenguaje concreto y específico; evita redacción genérica y abstracta.");
  }

  const bannedPatternsRule = config.bannedPatterns.length
    ? `Evita estas frases o variantes: ${config.bannedPatterns.join(", ")}.`
    : "";

  return `
Eres un redactor corporativo senior.
Escribe en ${config.locale}.
Usa un tono ${config.tone}.
Mantén exactitud factual y no agregues información no proporcionada.
${styleRules.join("\n")}
Evita frases típicas de IA.
${bannedPatternsRule}
`.trim();
}

export function buildRewriteUserPrompt({ text, tone, audience }) {
  return `
Reescribe el siguiente texto.

Objetivo:
- Mantener el significado original.
- Mejorar claridad, estructura y gramática.
- Ajustar el tono a: ${tone || defaultRewritePromptConfig.tone}.
- Considerar esta audiencia: ${audience || defaultRewritePromptConfig.audience}.
- Evitar salida genérica y plantillas típicas de IA.
- Escribir como lo haría una persona en un entorno corporativo real.

Texto original:
"""
${text}
"""
`.trim();
}

export function resolveWritingTypeProfile(writingType) {
  if (!writingType) {
    return null;
  }

  return writingTypeProfiles[writingType] || null;
}

export function buildWritingTypeInstructions({ writingType, tone, audience }) {
  const profile = resolveWritingTypeProfile(writingType);

  if (!profile) {
    return "";
  }

  const effectiveTone = tone || profile.tone;

  return `
Tipo de redacción seleccionado: ${profile.label}.
Tono recomendado para este tipo: ${effectiveTone}.
Estructura esperada: ${profile.structure}
Guías de estilo:
- ${profile.styleGuidelines.join("\n- ")}
Audiencia objetivo: ${audience || defaultRewritePromptConfig.audience}.
`.trim();
}

export function buildHumanizeSystemPrompt({ customConfig = {}, tone, audience } = {}) {
  const config = {
    ...defaultHumanizePromptConfig,
    ...customConfig
  };
  const rules = [
    "Refina el texto para que suene humano, profesional y natural en español latino.",
    "No cambies hechos, cifras, fechas ni compromisos del texto original."
  ];

  if (config.detectRoboticTone) {
    rules.push("Detecta y elimina tono robótico o artificial.");
  }

  if (config.reduceRedundancy) {
    rules.push("Reduce redundancias y repeticiones sin perder claridad.");
  }

  if (config.improveFluency) {
    rules.push("Mejora la fluidez para que la lectura sea natural y continua.");
  }

  if (config.variedRhythm) {
    rules.push("Introduce ritmo natural: alterna longitud de oraciones y evita cadencias mecánicas.");
  }

  if (config.avoidTemplatePhrasing) {
    rules.push("Elimina frases de plantilla y construcciones previsibles de asistente virtual.");
  }

  if (config.keepMeaning) {
    rules.push("Conserva el significado y la intención original.");
  }

  return `
Eres editor de estilo corporativo.
${rules.join("\n")}
Tono objetivo: ${tone || defaultRewritePromptConfig.tone}.
Audiencia objetivo: ${audience || defaultRewritePromptConfig.audience}.
Si detectas expresiones genéricas, sustitúyelas por formulaciones más precisas.
No agregues introducciones ni conclusiones forzadas.
Responde solo con la versión final del texto.
`.trim();
}

export function buildHumanizeUserPrompt({ text, previousText }) {
  return `
Refina este texto:
"""
${text}
"""

Texto base original para preservar intención:
"""
${previousText}
"""
`.trim();
}

function mergePromptConfig(customConfig) {
  return {
    ...defaultRewritePromptConfig,
    ...customConfig,
    style: {
      ...defaultRewritePromptConfig.style,
      ...(customConfig.style || {})
    },
    bannedPatterns: customConfig.bannedPatterns || defaultRewritePromptConfig.bannedPatterns
  };
}
