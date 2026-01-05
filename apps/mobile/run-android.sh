#!/bin/bash
# Script para rodar Android com variáveis configuradas

export ANDROID_HOME="/mnt/c/Users/rafae/AppData/Local/Android/Sdk"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

pnpm android
