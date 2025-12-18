#!/bin/bash

# Script para limpiar la caché de Next.js
echo "🧹 Limpiando caché de Next.js..."

# Eliminar carpeta .next
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Caché .next eliminada"
else
    echo "ℹ️  No hay carpeta .next"
fi

# Eliminar caché de node_modules
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Caché de node_modules eliminada"
else
    echo "ℹ️  No hay caché en node_modules"
fi

echo "✅ ¡Caché limpiada completamente!"
echo ""
echo "Ahora ejecuta: npm run dev"

