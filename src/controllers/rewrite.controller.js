import { rewriteText } from "../services/rewrite.service.js";

const demoCorporateText =
  "Hola equipo queria comentarles que basicamente se estuvo haciendo varias reuniones y al final se decidio una estrategia nueva que en realidad busca mejorar un poco todo, entonces les pedimos que por favor puedan ir revisando esto cuando tengan chance para ver si lo podemos implementar pronto.";

export async function rewriteController(req, res, next) {
  try {
    const { text, tone, audience, writingType, promptConfig } = req.body;
    const result = await rewriteText({ text, tone, audience, writingType, promptConfig });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function rewriteDemoController(req, res, next) {
  try {
    const inputText = req.body?.text || demoCorporateText;
    const result = await rewriteText({
      text: inputText,
      tone: req.body?.tone || "profesional pero cercano",
      audience: req.body?.audience || "equipo interno",
      writingType: req.body?.writingType || "internal_email"
    });

    res.status(200).json({
      success: true,
      demo: true,
      input: inputText,
      output: result.rewrittenText,
      details: result
    });
  } catch (error) {
    next(error);
  }
}
