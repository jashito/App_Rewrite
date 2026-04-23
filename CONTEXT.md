# 🧠 CONTEXT DEL PROYECTO

> **Instrucción para la IA:** Lee este archivo completo antes de 
> responder cualquier cosa. Este documento es la fuente de verdad 
> del proyecto. Continúa desde el estado aquí.

## 📌 Resumen del Proyecto
- **Nombre:** App_Rewrite (redactor-corporativo-api)
- **Qué hace:** API REST que reescribe texto coloquial/informal en estilo corporativo profesional usando Google Gemini. Incluye una interfaz web frontend para pruebas rápidas.
- **Estado actual:** Funciona correctamente. Preparado para integración con Doppler para gestión de secrets.

## 🛠️ Stack Tecnológico
- **Runtime:** Node.js v22.13.0
- **Framework:** Express.js v5.2.1
- **IA:** @google/genai v1.50.1 (Gemini API)
- **Middleware:** helmet v8.1.0, cors v2.8.6, morgan v1.10.1
- **Config:** dotenv v17.4.2

## 🗂️ Estructura del Proyecto
```
App_Rewrite/
├── src/
│   ├── app.js              # Configuración Express, middlewares
│   ├── server.js           # Entry point, inicio del servidor
│   ├── config/
│   │   └── env.js          # Variables de entorno (soporta .env y Doppler)
│   ├── controllers/
│   │   └── rewrite.controller.js  # Controladores de rutas
│   ├── services/
│   │   ├── rewrite.service.js    # Lógica principal de reescritura
│   │   └── gemini.client.js     # Cliente Gemini
│   ├── prompts/
│   │   └── rewrite.prompt.js   # Prompts para Gemini
│   ├── routes/
│   │   └── rewrite.routes.js  # Definición de rutas
│   ├── middlewares/
│   │   └── error-handler.js  # Manejo de errores
│   ├── utils/
│   │   ├── logger.js        # Logging
│   │   └── http-error.js    # Errores HTTP
│   └── scripts/
│       └── demo.js         # Script de demo
├── public/
│   ├── index.html         # Frontend UI
│   ├── app.js           # Lógica frontend
│   └── styles.css       # Estilos
├── .env                 # Configuración local (NO subir a git)
├── .env.example         # Plantilla de configuración
├── .gitignore
└── package.json
```

## ✅ Lo que ya está hecho
- API REST completa `/api/rewrite` y `/rewrite`
- Endpoint demo `/rewrite/demo` con texto de ejemplo
- Integración con Gemini para reescritura de texto
- Proceso de 2 pasos: reescritura inicial + refinamiento (humanización)
- Frontend web simple para pruebas
- Health check endpoint `/health`
- Soporte para múltiples tipos de escritura: `formal_email`, `internal_email`, `technical_report`
- Parámetros configurables: `tone`, `audience`, `writingType`, `promptConfig`
- Integración con Doppler para secrets (mediante variable `DOPPLER_CONFIG`)
- Graceful shutdown (SIGINT/SIGTERM)

## 🚧 Trabajo de la Última Sesión
- Se estabilizó el backend en local dejando una sola instancia activa en `:3000` para evitar falsos errores en pruebas de UI/API.
- Se mejoró el manejo de errores de Gemini para el caso de alta demanda (`503` / `UNAVAILABLE`) con mensaje amigable en vez de JSON crudo.
- Se inició el **Camino A** de afinamiento visual (sin migrar stack): rediseño de interfaz vanilla inspirado en patrones de `shadcn/ui`.
- Se actualizaron estados visuales del resultado (`loading`, `error`, `success`) para mejor feedback al usuario.
- Archivos impactados hoy:
  - `public/index.html` (estructura visual estilo card + secciones)
  - `public/styles.css` (tema, spacing, componentes y estados)
  - `public/app.js` (clases de estado para resultado)
  - `src/services/rewrite.service.js` (manejo de `UNAVAILABLE` / alta demanda)

## 🔜 Próximos Pasos
- [Por confirmar] Agregar más tests unitarios
- [Por confirmar] Dockerizar la aplicación
- [Por confirmar] Agregar CI/CD
- [Por confirmar] Implementar autenticación si se expondrá públicamente

## 🐛 Problemas Conocidos / Bugs Activos
- En este entorno, `npm run dev` puede fallar con `EMFILE: too many open files, watch` por el watcher de Node.
- Workaround actual: usar `npm start` para ejecutar y probar la app sin watch.

## 📐 Convenciones del Proyecto
- **Naming:** camelCase para variables y funciones, PascalCase para clases
- **Estructura:** Arquitectura MVC simplificada (controllers → services → clients)
- **Errores:** Custom HttpError class en `utils/http-error.js`
- **Logging:** Usa logger personalizado en `utils/logger.js`
- **Prompts:** Prompts separados por lógica en `prompts/rewrite.prompt.js`

## 🔐 Variables de Entorno Necesarias
- `GEMINI_API_KEY` - API key de Google Gemini (requerida)
- `GEMINI_MODEL` - Modelo a usar (default: gemini-2.5-flash)
- `PORT` - Puerto del servidor (default: 3000)
- `NODE_ENV` - Entorno (development/test/production)
- `DOPPLER_CONFIG` - Presente cuando corre en Doppler [opcional]

## 🔗 Referencias Útiles
- shadcn/ui (referencia visual de componentes): https://ui.shadcn.com/

## 📝 Notas Adicionales
- El `.env` contiene API key sensitiva y NO debe subirse a git (ya está en .gitignore)
- Para desarrollo local: `cp .env.example .env` y completar API key
- Para producción con Doppler: `doppler run -- npm start`
- El servidor corre en puerto 3000 por defecto
- Para desarrollo: `npm run dev` (con --watch), pero en este equipo puede fallar por `EMFILE`.
- Si falla el watch, usar temporalmente `npm start` para pruebas de la API/UI.
- UI actual en Camino A: mejoras visuales en vanilla (sin React/Tailwind por ahora).

---

> "Al final de cada sesión: Pídele a Cursor → 
> 'Actualiza el CONTEXT.md con todo lo que trabajamos hoy' 
> y luego haz commit."
