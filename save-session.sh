#!/bin/bash

echo "💾 Guardando contexto de sesión..."

# Fecha actual
DATE=$(date '+%Y-%m-%d %H:%M')

# Archivos modificados en esta sesión (desde último commit)
MODIFIED=$(git diff --name-only HEAD)

echo ""
echo "📝 Archivos modificados en esta sesión:"
echo "$MODIFIED"
echo ""
echo "👉 Ahora ve a Cursor y ejecuta este prompt:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Actualiza el CONTEXT.md con la sesión de hoy ($DATE)."
echo "Los archivos que modificamos fueron:"
echo "$MODIFIED"
echo ""
echo "Sigue la estructura exacta del documento."
echo "Muéstrame el resultado antes de guardar."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Cursor ya actualizó el CONTEXT.md? (s/n): " CONFIRM

if [ "$CONFIRM" = "s" ]; then
  git add CONTEXT.md
  git commit -m "context: sesión $DATE"
  echo "✅ Contexto guardado y commiteado"
else
  echo "⚠️  Recuerda  actualizar y commitear el CONTEXT.md antes de cerrar"
fi
