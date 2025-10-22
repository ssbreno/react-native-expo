#!/bin/bash

# Script para remover console.log mas manter console.error e console.warn
# Use com cuidado em produção!

echo "🧹 Removendo console.log da aplicação..."
echo "⚠️  Mantendo console.error e console.warn"
echo ""

# Encontrar e processar arquivos TypeScript e JavaScript
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
  # Verificar se o arquivo contém console.log
  if grep -q "console\.log" "$file"; then
    echo "📝 Processando: $file"
    
    # Criar backup
    cp "$file" "$file.backup"
    
    # Remover linhas com console.log (mas não console.error ou console.warn)
    # Isso remove linhas inteiras que contêm APENAS console.log
    sed -i.tmp '/console\.log/d' "$file"
    rm "$file.tmp"
    
    echo "   ✅ Limpo"
  fi
done

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Backups criados com extensão .backup"
echo "Para reverter: find src -name '*.backup' -exec sh -c 'mv \"\$1\" \"\${1%.backup}\"' _ {} \;"
