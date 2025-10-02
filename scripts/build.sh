#!/bin/bash

echo "🚀 Iniciando build do Nanquim Locações..."

# Verificar se EAS está instalado
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI não encontrado. Instalando..."
    npm install -g @expo/eas-cli
fi

# Login no EAS (se necessário)
echo "🔐 Verificando autenticação EAS..."
eas whoami

echo ""
echo "📱 Escolha o tipo de build:"
echo "1) iOS (App Store)"
echo "2) Android (Play Store)"
echo "3) Ambos"
echo ""

read -p "Opção [1-3]: " choice

case $choice in
    1)
        echo "🍎 Fazendo build para iOS..."
        eas build --platform ios --profile production-ios
        ;;
    2)
        echo "🤖 Fazendo build para Android..."
        eas build --platform android --profile production-android
        ;;
    3)
        echo "📱 Fazendo build para ambas as plataformas..."
        eas build --platform all --profile production
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Build iniciado! Você pode acompanhar o progresso em:"
echo "https://expo.dev/accounts/ssobralbreno/projects/vehicle-rental-app/builds"
