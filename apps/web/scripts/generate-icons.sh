#!/bin/bash

# Script para gerar ícones PWA em múltiplos tamanhos
# Requer ImageMagick (convert)

SOURCE_ICON="public/Logo-minc.png"
ICONS_DIR="public/icons"

# Criar diretório de ícones se não existir
mkdir -p "$ICONS_DIR"

# Tamanhos de ícones necessários
SIZES=(72 96 128 144 152 192 384 512)

echo "Gerando ícones PWA a partir de $SOURCE_ICON..."

for size in "${SIZES[@]}"; do
  output_file="$ICONS_DIR/icon-${size}x${size}.png"
  echo "Gerando $output_file..."
  # Criar ícone quadrado: redimensionar mantendo proporção e centralizar em fundo transparente
  # Forçar RGB para garantir cores (mesmo que o logo seja em escala de cinza, alguns navegadores preferem RGB)
  convert "$SOURCE_ICON" -resize "${size}x${size}^" -gravity center -extent "${size}x${size}" -background transparent -type TrueColor -colorspace sRGB "$output_file"
done

# Gerar favicon.ico (32x32) - quadrado
echo "Gerando favicon.ico..."
convert "$SOURCE_ICON" -resize "32x32^" -gravity center -extent "32x32" -background transparent -type TrueColor -colorspace sRGB "public/favicon.ico"

# Gerar apple-touch-icon.png (180x180) - quadrado
echo "Gerando apple-touch-icon.png..."
convert "$SOURCE_ICON" -resize "180x180^" -gravity center -extent "180x180" -background transparent -type TrueColor -colorspace sRGB "public/apple-touch-icon.png"

echo "Ícones gerados com sucesso!"
