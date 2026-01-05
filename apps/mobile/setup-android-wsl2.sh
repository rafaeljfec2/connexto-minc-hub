#!/bin/bash

# Script para configurar Android SDK do Windows no WSL2
# Uso: source setup-android-wsl2.sh

# Caminho do SDK no Windows (via WSL2)
# Ajustado para: C:\Users\rafae\AppData\Local\Android\Sdk
ANDROID_SDK_WIN="/mnt/c/Users/rafae/AppData/Local/Android/Sdk"

# Verificar se o SDK existe
if [ ! -d "$ANDROID_SDK_WIN" ]; then
    echo "⚠️  SDK não encontrado em: $ANDROID_SDK_WIN"
    echo ""
    echo "Caminho esperado: C:\\Users\\rafae\\AppData\\Local\\Android\\Sdk"
    echo "Para verificar no Windows:"
    echo "  No PowerShell: \$env:LOCALAPPDATA\\Android\\Sdk"
    return 1
fi

# Configurar variáveis de ambiente
export ANDROID_HOME="$ANDROID_SDK_WIN"
export PATH="$PATH:$ANDROID_SDK_WIN/platform-tools"
export PATH="$PATH:$ANDROID_SDK_WIN/tools"
export PATH="$PATH:$ANDROID_SDK_WIN/tools/bin"
export PATH="$PATH:$ANDROID_SDK_WIN/emulator"

# Aliases para usar executáveis do Windows diretamente
alias adb="$ANDROID_SDK_WIN/platform-tools/adb.exe"
alias emulator="$ANDROID_SDK_WIN/emulator/emulator.exe"

echo "✅ Android SDK configurado do Windows"
echo "   ANDROID_HOME: $ANDROID_HOME"
echo ""
echo "Teste com: adb devices"
echo ""
echo "Para tornar permanente, adicione ao ~/.bashrc ou ~/.zshrc:"
echo "  source $(pwd)/setup-android-wsl2.sh"
