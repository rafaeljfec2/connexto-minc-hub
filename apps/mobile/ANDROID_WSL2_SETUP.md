# Configuração Android com WSL2 + SDK no Windows

Este guia explica como usar o Android SDK instalado no Windows a partir do WSL2.

## Situação

- **Código**: WSL2 (Linux)
- **Android SDK**: Windows
- **Desafio**: WSL2 precisa acessar o SDK do Windows

## Soluções

### Opção 1: Usar ADB do Windows via WSL2 (Recomendado)

WSL2 pode executar executáveis do Windows diretamente.

#### Passo 1: Encontrar Caminho do SDK no Windows

O SDK geralmente está em:
```
C:\Users\[SEU_USUARIO]\AppData\Local\Android\Sdk
```

No WSL2, esse caminho é acessível via:
```
/mnt/c/Users/[SEU_USUARIO]/AppData/Local/Android/Sdk
```

#### Passo 2: Adicionar ao PATH no WSL2

Edite seu `~/.bashrc` ou `~/.zshrc`:

```bash
# Android SDK do Windows
export ANDROID_HOME=/mnt/c/Users/[SEU_USUARIO]/AppData/Local/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/emulator
```

**Ou usando executáveis do Windows diretamente:**

```bash
# Usar adb.exe do Windows
alias adb='/mnt/c/Users/[SEU_USUARIO]/AppData/Local/Android/Sdk/platform-tools/adb.exe'

# Usar emulator.exe do Windows
alias emulator='/mnt/c/Users/[SEU_USUARIO]/AppData/Local/Android/Sdk/emulator/emulator.exe'
```

#### Passo 3: Recarregar o Shell

```bash
source ~/.bashrc
# ou
source ~/.zshrc
```

#### Passo 4: Verificar

```bash
# Verificar se adb funciona
adb version

# Ver dispositivos (deve funcionar)
adb devices
```

### Opção 2: Usar ADB Server do Windows

O ADB do Windows já está rodando no Windows. Você pode se conectar a ele.

#### Passo 1: Iniciar ADB Server no Windows

No PowerShell do Windows (como Administrador):

```powershell
# Ir para o SDK
cd $env:LOCALAPPDATA\Android\Sdk\platform-tools

# Iniciar servidor ADB
.\adb.exe start-server

# Verificar dispositivos
.\adb.exe devices
```

#### Passo 2: Conectar do WSL2

No WSL2, o ADB pode se conectar ao servidor do Windows usando TCP/IP:

```bash
# Instalar adb no WSL2 (se não tiver)
sudo apt update
sudo apt install android-tools-adb

# Conectar ao ADB do Windows via TCP
adb connect localhost:5037

# Ou usar adb.exe do Windows diretamente
/mnt/c/Users/[SEU_USUARIO]/AppData/Local/Android/Sdk/platform-tools/adb.exe devices
```

### Opção 3: Usar Expo Go no Dispositivo Físico (Mais Simples)

Se você tem um dispositivo físico Android, pode usar o Expo Go:

#### Passo 1: Iniciar Expo no WSL2

```bash
cd apps/mobile
pnpm start
```

#### Passo 2: Ler QR Code no Dispositivo

1. Instale **Expo Go** no seu dispositivo Android (Play Store)
2. Abra o Expo Go
3. Escaneie o QR Code que aparece no terminal

**OU** usar o túnel:

```bash
pnpm start --tunnel
```

Isso cria um link público que funciona mesmo em redes diferentes.

### Opção 4: Configurar Emulador no Windows e Conectar via TCP

#### Passo 1: Iniciar Emulador no Windows

No PowerShell do Windows:

```powershell
# Listar AVDs
cd $env:LOCALAPPDATA\Android\Sdk\emulator
.\emulator.exe -list-avds

# Iniciar emulador
.\emulator.exe -avd [NOME_DO_AVD]
```

#### Passo 2: Conectar do WSL2

O emulador cria uma conexão TCP na porta 5554. Do WSL2:

```bash
# Conectar ao emulador do Windows
adb connect 127.0.0.1:5554
# ou
adb connect localhost:5554

# Verificar
adb devices
```

Se não funcionar, pode ser necessário usar o IP do Windows:

1. Descubra o IP do Windows (no PowerShell do Windows):
   ```powershell
   ipconfig
   ```
   Procure por "WSL" ou "vEthernet" - geralmente algo como `172.x.x.x`

2. Do WSL2, conecte usando esse IP:
   ```bash
   adb connect 172.x.x.x:5554
   ```

## Configuração Recomendada para WSL2

### Script de Setup Automático

Crie um arquivo `setup-android-wsl2.sh`:

```bash
#!/bin/bash

# Configurar variáveis (ajuste o usuário)
WINDOWS_USER="seu_usuario"  # SUBSTITUA pelo seu usuário do Windows
ANDROID_SDK_WIN="/mnt/c/Users/$WINDOWS_USER/AppData/Local/Android/Sdk"

# Adicionar ao PATH
export ANDROID_HOME=$ANDROID_SDK_WIN
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/emulator

# Aliases para usar executáveis do Windows
alias adb="$ANDROID_SDK_WIN/platform-tools/adb.exe"
alias emulator="$ANDROID_SDK_WIN/emulator/emulator.exe"

echo "Android SDK configurado do Windows"
echo "ANDROID_HOME: $ANDROID_HOME"
echo ""
echo "Teste com: adb devices"
```

Adicione ao seu `~/.bashrc`:

```bash
# Android SDK do Windows
source /caminho/para/setup-android-wsl2.sh
```

### Alternativa: Usar Diretamente no package.json

Você pode criar scripts que usam o caminho do Windows diretamente:

```json
{
  "scripts": {
    "android:windows": "/mnt/c/Users/[USUARIO]/AppData/Local/Android/Sdk/platform-tools/adb.exe devices",
    "android:start": "expo start --android"
  }
}
```

## Solução Mais Simples: Expo Go

Para desenvolvimento, a forma mais simples é usar **Expo Go** no dispositivo físico:

### Vantagens:
- ✅ Não precisa configurar ADB
- ✅ Funciona via rede
- ✅ Hot Reload funciona
- ✅ Mais rápido que emulador

### Como usar:

1. **No WSL2:**
   ```bash
   cd apps/mobile
   pnpm start --tunnel
   ```

2. **No dispositivo Android:**
   - Instale Expo Go (Play Store)
   - Abra Expo Go
   - Escaneie o QR Code

3. **Pronto!** O app carrega no dispositivo

## Testando a Configuração

### Verificar se ADB funciona:

```bash
# Versão
adb version

# Listar dispositivos
adb devices

# Se aparecer "List of devices attached" e dispositivos, está funcionando!
```

### Testar Expo:

```bash
cd apps/mobile

# Iniciar Expo
pnpm start

# Se usar dispositivo físico com Expo Go:
# - Pressione 't' para abrir no túnel
# - Escaneie QR Code no dispositivo

# Se usar emulador/ADB configurado:
# - Pressione 'a' para Android
# - Expo tentará abrir no dispositivo conectado
```

## Troubleshooting WSL2 + Windows SDK

### Erro: "adb: command not found"

**Solução 1**: Usar executável do Windows diretamente:
```bash
/mnt/c/Users/[USUARIO]/AppData/Local/Android/Sdk/platform-tools/adb.exe devices
```

**Solução 2**: Adicionar ao PATH (veja Opção 1 acima)

### Erro: "no devices/emulators found"

**Solução 1**: Certifique-se que emulador/dispositivo está rodando no Windows

**Solução 2**: Conectar via TCP:
```bash
# Descobrir IP do Windows
ipconfig  # no PowerShell do Windows

# Conectar do WSL2
adb connect [IP_DO_WINDOWS]:5554
```

**Solução 3**: Usar Expo Go (mais simples)

### Erro: "cannot connect to daemon"

**Solução**: O ADB server precisa estar rodando no Windows:
```powershell
# No PowerShell do Windows
cd $env:LOCALAPPDATA\Android\Sdk\platform-tools
.\adb.exe start-server
```

### Expo não encontra dispositivo

**Solução 1**: Use túnel (recomendado):
```bash
pnpm start --tunnel
```

**Solução 2**: Certifique-se que adb funciona:
```bash
adb devices
# Deve listar dispositivos
```

**Solução 3**: Use Expo Go (mais confiável)

### Emulador lento no Windows

Isso é normal. Considere:
- Usar dispositivo físico
- Reduzir RAM do emulador
- Usar Expo Go (mais rápido)

## Comandos Úteis WSL2 + Windows

```bash
# Verificar se adb funciona
adb version

# Ver dispositivos (conectados no Windows)
adb devices

# Conectar ao emulador do Windows
adb connect 127.0.0.1:5554

# Ver logs (do dispositivo conectado)
adb logcat

# Filtrar logs React Native
adb logcat *:S ReactNative:V ReactNativeJS:V

# Limpar cache Expo
npx expo start --clear

# Iniciar com túnel (funciona melhor no WSL2)
npx expo start --tunnel
```

## Recomendação Final

Para desenvolvimento com WSL2 + SDK no Windows:

1. **Use Expo Go no dispositivo físico** (mais simples e rápido)
   ```bash
   cd apps/mobile
   pnpm start --tunnel
   ```

2. **OU configure ADB para usar executáveis do Windows**
   - Adicione ao PATH ou use aliases
   - Inicie emulador no Windows
   - Conecte do WSL2 via TCP

3. **Para builds de produção**, use EAS Build (não precisa do SDK local)

## Próximos Passos

1. Escolha a opção que preferir (recomendo Expo Go)
2. Configure conforme a opção escolhida
3. Teste: `cd apps/mobile && pnpm start`
4. Quando estiver pronto, faça build com EAS:
   ```bash
   pnpm build:android -- --profile preview
   ```
