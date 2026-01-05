# Testando Android Localmente (Windows)

Este guia explica como testar o app Android localmente usando Android Studio e emulador/dispositivo físico.

## Pré-requisitos

1. **Android Studio instalado** (com Android SDK)

   - Download: https://developer.android.com/studio
   - Durante instalação, instale:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

2. **Variáveis de Ambiente configuradas**

   Adicione ao PATH do Windows:

   ```
   %LOCALAPPDATA%\Android\Sdk\platform-tools
   %LOCALAPPDATA%\Android\Sdk\tools
   %LOCALAPPDATA%\Android\Sdk\emulator
   ```

   Ou caminho completo (se instalado em outro local):

   ```
   C:\Users\[SEU_USUARIO]\AppData\Local\Android\Sdk\platform-tools
   C:\Users\[SEU_USUARIO]\AppData\Local\Android\Sdk\tools
   C:\Users\[SEU_USUARIO]\AppData\Local\Android\Sdk\emulator
   ```

3. **Java JDK instalado** (Android Studio geralmente inclui)

## Passo 1: Verificar Android SDK

Abra o PowerShell ou CMD e verifique:

```powershell
# Verificar se adb está disponível
adb version

# Verificar se emulator está disponível
emulator -list-avds
```

Se não funcionar, adicione as variáveis de ambiente.

## Passo 2: Configurar Emulador (OPÇÃO 1 - Recomendado)

### Criar AVD (Android Virtual Device)

1. Abra **Android Studio**
2. Vá em **Tools** > **Device Manager**
3. Clique em **Create Device**
4. Escolha um dispositivo (ex: Pixel 5)
5. Escolha uma imagem do sistema (ex: Android 13 - API 33)
6. Clique em **Finish**

### Iniciar Emulador

1. No **Device Manager**, clique em ▶️ no AVD criado
2. Ou via linha de comando:
   ```powershell
   emulator -avd [NOME_DO_AVD]
   ```

### Listar AVDs disponíveis

```powershell
emulator -list-avds
```

## Passo 3: Usar Dispositivo Físico (OPÇÃO 2)

### Habilitar Modo Desenvolvedor

1. No dispositivo Android:

   - Vá em **Configurações** > **Sobre o telefone**
   - Toque 7 vezes em **Número da versão** (ativa modo desenvolvedor)

2. Ativar **Depuração USB**:
   - Vá em **Configurações** > **Sistema** > **Opções do desenvolvedor**
   - Ative **Depuração USB**

### Conectar Dispositivo

1. Conecte o dispositivo via USB
2. Aceite a mensagem de autorização no dispositivo
3. Verifique conexão:

   ```powershell
   adb devices
   ```

   Deve aparecer algo como:

   ```
   List of devices attached
   ABC123XYZ    device
   ```

## Passo 4: Executar o App

### Opção A: Usando pnpm (Recomendado)

```powershell
# No diretório do monorepo
cd apps/mobile

# Iniciar Expo
pnpm start

# Em outro terminal, iniciar Android
pnpm android
```

### Opção B: Usando npm scripts do monorepo

```powershell
# Do root do monorepo
pnpm --filter @minc-teams/mobile start

# Em outro terminal
pnpm --filter @minc-teams/mobile android
```

### Opção C: Usando Expo CLI diretamente

```powershell
cd apps/mobile

# Iniciar Expo
npx expo start

# Pressionar 'a' para Android
# Ou
npx expo start --android
```

## Passo 5: O que Esperar

1. **Metro Bundler inicia**:

   ```
   Metro waiting on exp://192.168.x.x:8081
   ```

2. **App compila** (primeira vez pode demorar)

3. **App abre no emulador/dispositivo**

4. **Hot Reload funciona** - Mudanças no código atualizam automaticamente

## Troubleshooting

### Erro: "adb: command not found"

**Solução**: Adicione Android SDK ao PATH:

1. Pesquise "Variáveis de Ambiente" no Windows
2. Edite variável **Path**
3. Adicione caminhos do Android SDK (veja acima)

### Erro: "No devices/emulators found"

**Para Emulador**:

```powershell
# Listar AVDs
emulator -list-avds

# Iniciar emulador
emulator -avd [NOME_DO_AVD]
```

**Para Dispositivo Físico**:

```powershell
# Verificar se dispositivo está conectado
adb devices

# Se não aparecer, tente:
adb kill-server
adb start-server
adb devices
```

### Erro: "Java not found"

**Solução**: Instale Java JDK ou use o que vem com Android Studio:

1. Configure variável `JAVA_HOME`:
   ```
   C:\Program Files\Android\Android Studio\jbr
   ```

### Emulador muito lento

**Soluções**:

1. **Ativar HAXM/HAXM** (Intel) ou **Hyper-V** (AMD)
2. **Reduzir RAM** do emulador (2GB pode ser suficiente)
3. **Usar dispositivo físico** (mais rápido)

### Porta 8081 já está em uso

```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :8081

# Matar processo (substitua PID)
taskkill /PID [PID] /F

# Ou use outra porta
npx expo start --port 8082
```

### App não carrega / Erro de conexão

1. **Verifique se Metro está rodando**
2. **Verifique firewall** - permita Node.js
3. **Use túnel** (se em redes diferentes):
   ```powershell
   npx expo start --tunnel
   ```

### Erro de permissões (Câmera)

O app precisa de permissão de câmera. No emulador:

1. Vá em **Configurações** > **Apps** > **MINC Teams** > **Permissões**
2. Ative **Câmera**

## Comandos Úteis

```powershell
# Ver dispositivos conectados
adb devices

# Ver logs do Android
adb logcat

# Filtrar logs do React Native
adb logcat *:S ReactNative:V ReactNativeJS:V

# Reiniciar adb
adb kill-server
adb start-server

# Instalar app diretamente (se tiver APK)
adb install app.apk

# Abrir shell do dispositivo
adb shell

# Limpar cache do Metro
npx expo start --clear

# Reinstalar dependências
cd apps/mobile
rm -rf node_modules
pnpm install
```

## Configuração Recomendada para Desenvolvimento

### AVD Recomendado

- **Dispositivo**: Pixel 5 ou Pixel 6
- **Android Version**: Android 13 (API 33) ou Android 14 (API 34)
- **RAM**: 2-4GB
- **Armazenamento**: 4GB+

### Performance

- **Ative Hardware Acceleration** no emulador
- **Use Snapshots** para iniciar rápido
- **Considere dispositivo físico** para melhor performance

## Workflow de Desenvolvimento

1. **Iniciar emulador/dispositivo**
2. **Iniciar Expo**:
   ```powershell
   cd apps/mobile
   pnpm start
   ```
3. **Pressionar 'a' para Android** (ou usar `pnpm android`)
4. **Desenvolver** - mudanças aparecem automaticamente
5. **Testar QR Code**:
   - No emulador: Use a câmera virtual
   - Em dispositivo físico: Use câmera real

## Próximos Passos

Após testar localmente:

1. Testar todas as funcionalidades
2. Testar QR Code (funcionalidade crítica)
3. Quando estiver pronto, fazer build com EAS:
   ```powershell
   pnpm build:android -- --profile preview
   ```

## Notas

- **Primeira execução**: Pode demorar (download de dependências)
- **Hot Reload**: Funciona automaticamente ao salvar arquivos
- **Fast Refresh**: Atualiza componentes sem perder estado
- **Debug**: Use `adb logcat` ou React Native Debugger
