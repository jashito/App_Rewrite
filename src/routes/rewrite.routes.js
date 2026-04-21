import { Router } from "express";
import { rewriteController, rewriteDemoController } from "../controllers/rewrite.controller.js";

const rewriteRouter = Router();

rewriteRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Usa POST /rewrite para procesar texto.",
    example: {
      method: "POST",
      path: "/rewrite",
      body: {
        text: "Necesitamos mejorar la comunicación del equipo.",
        writingType: "internal_email",
        audience: "equipo interno"
      }
    }
  });
});
rewriteRouter.get("/demo", rewriteDemoController);
rewriteRouter.post("/", rewriteController);

export default rewriteRouter;
