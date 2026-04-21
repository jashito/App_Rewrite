# Redactor Corporativo API

API en Node.js + Express para reescritura de textos corporativos usando Google AI Studio (Gemini API).

## Qué incluye

```text
src/
  app.js
  server.js
  config/
    env.js
  controllers/
    rewrite.controller.js
  middlewares/
    error-handler.js
  prompts/
    rewrite.prompt.js
  routes/
    rewrite.routes.js
  services/
    gemini.client.js
    rewrite.service.js
  scripts/
    demo.js
  utils/
    http-error.js
    logger.js
```

## Requisitos

- Node.js 20+
- API key de Google AI Studio

## Variables de entorno

Usa `.env.example` como base:

```bash
cp .env.example .env
```

Variables:

- `NODE_ENV`: `development` | `test` | `production`
- `PORT`: puerto del servidor (1-65535)
- `GEMINI_API_KEY`: API key de Google AI Studio (obligatoria)
- `GEMINI_MODEL`: modelo Gemini (opcional)

Si falta una variable obligatoria o `PORT`/`NODE_ENV` es inválido, la app falla al iniciar.

## Ejecución local

1. Instala dependencias:

```bash
npm install
```

1. Inicia en desarrollo:

```bash
npm run dev
```

1. Verifica salud:

```bash
curl http://localhost:3000/health
```

## Scripts

- `npm run dev`: servidor con watch
- `npm start`: servidor en modo normal (ideal para despliegue)
- `npm run check`: validación de sintaxis
- `npm run demo`: prueba rápida en consola con input/output

## Endpoints principales

### `POST /rewrite`

Recibe texto, ejecuta:

1. reescritura corporativa
2. refinado (menos robótico, menos redundancia, más fluidez)

Body ejemplo:

```bash
curl -X POST http://localhost:3000/rewrite \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Necesitamos mejorar la comunicación del equipo porque hay mensajes cruzados y retrasos.",
    "tone": "profesional pero natural",
    "audience": "liderazgo",
    "writingType": "formal_email"
  }'
```

`writingType` soportados:

- `formal_email` (email formal)
- `internal_email` (email interno)
- `technical_report` (reporte técnico)

Respuesta:

```json
{
  "success": true,
  "data": {
    "rewrittenText": "Propongo ajustar la comunicación entre equipos para reducir cruces de información y acelerar la ejecución.",
    "rawRewrittenText": "Se recomienda mejorar la comunicación del equipo para optimizar los resultados.",
    "writingType": "formal_email",
    "model": "gemini-2.5-flash"
  }
}
```

### `GET /rewrite/demo`

Demo rápida con texto mal redactado y salida `input/output` en JSON.

## Logs básicos

- Logs HTTP con `morgan` (`combined`).
- Logs de aplicación en JSON (`src/utils/logger.js`) para:
  - arranque
  - errores de request
  - apagado controlado

## Listo para despliegue básico

- Usa `npm start` como comando de arranque.
- Expone `PORT` configurable por entorno.
- Incluye endpoint de salud `GET /health`.
- Maneja `SIGINT`/`SIGTERM` para cierre limpio.
- `.gitignore` evita subir secretos (`.env`) y artefactos locales.
