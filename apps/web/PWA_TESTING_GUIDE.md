# Guia de Testes do PWA - MINC Teams

Este guia explica como testar todas as funcionalidades do Progressive Web App (PWA) implementado.

## Pré-requisitos

1. **Build do projeto**: O PWA precisa estar em modo de produção ou preview para funcionar corretamente
2. **HTTPS ou localhost**: Service Workers só funcionam em HTTPS ou localhost
3. **Navegadores compatíveis**: Chrome, Edge, Firefox, Safari (iOS)

## Passo 1: Build e Preview

```bash
# Build do projeto
cd apps/web
pnpm build

# Preview local (simula produção)
pnpm preview
```

Ou em desenvolvimento com HTTPS:

```bash
# Usar um servidor HTTPS local (ex: usando mkcert)
pnpm dev --https
```

## Passo 2: Verificar Manifest

1. Abra o DevTools (F12)
2. Vá para a aba **Application** (Chrome) ou **Manifest** (Firefox)
3. Verifique:
   - ✅ Manifest carregado corretamente
   - ✅ Ícones aparecem
   - ✅ Nome e descrição corretos
   - ✅ Theme color configurado

**URL para verificar**: `http://localhost:3001/manifest.webmanifest`

## Passo 3: Verificar Service Worker

1. No DevTools, vá para **Application** > **Service Workers**
2. Verifique:
   - ✅ Service Worker registrado e ativo
   - ✅ Status: "activated and is running"
   - ✅ Escopo: `/`

**Teste manual**:

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations)
})
```

## Passo 4: Testar Instalação

### Chrome/Edge (Desktop e Mobile)

1. **Verificar prompt automático**:
   - O modal de instalação deve aparecer após ~3 segundos
   - Ou procure pelo ícone de instalação na barra de endereço

2. **Instalar manualmente**:
   - Clique no ícone de instalação (➕) na barra de endereço
   - Ou vá em Menu > "Instalar MINC Teams"

3. **Verificar instalação**:
   - O app deve abrir em uma janela standalone
   - Verifique se não há barra de endereço
   - Verifique se o ícone aparece na área de trabalho

### Safari iOS

1. Abra o site no Safari iOS
2. Toque no botão **Compartilhar** (quadrado com seta)
3. Role para baixo e toque em **Adicionar à Tela de Início**
4. Confirme a instalação

### Teste Programático

```javascript
// No console do navegador
// Verificar se o evento beforeinstallprompt está disponível
window.addEventListener('beforeinstallprompt', e => {
  console.log('✅ beforeinstallprompt disponível!', e)
  // Você pode chamar e.prompt() para mostrar o prompt manualmente
})
```

## Passo 5: Testar Funcionalidade Offline

### Teste Básico

1. **Instale o app** (se ainda não instalou)
2. **Abra o DevTools** > **Network**
3. **Selecione "Offline"** no throttling
4. **Recarregue a página**
5. **Verifique**:
   - ✅ A página ainda carrega (assets estáticos em cache)
   - ✅ Layout e estilos funcionam
   - ⚠️ APIs podem falhar (esperado - Network First)

### Teste de Cache

1. Abra **Application** > **Cache Storage**
2. Verifique se há um cache chamado `minc-teams-v1.0.0`
3. Verifique os recursos cacheados:
   - HTML, CSS, JS
   - Ícones e imagens
   - Manifest

## Passo 6: Testar Atualização do Service Worker

### Simular Nova Versão

1. **Modifique o Service Worker**:

   ```javascript
   // Em apps/web/public/service-worker.js
   const CACHE_VERSION = 'v1.0.1' // Incrementar versão
   ```

2. **Rebuild e recarregue**:

   ```bash
   pnpm build
   pnpm preview
   ```

3. **Verifique no DevTools**:
   - Vá para **Application** > **Service Workers**
   - Deve aparecer "waiting to activate"
   - Clique em "skipWaiting" ou recarregue a página

### Teste Automático

```javascript
// No console
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('✅ Novo Service Worker ativado!')
  window.location.reload()
})
```

## Passo 7: Verificar Logs do Sistema

### Verificar Logs no Console

Os logs do sistema devem aparecer no console com o formato:

```
2024-01-15T19:30:00.000Z INFO [PWA] Service Worker registrado com sucesso
```

### Verificar Logs Enviados ao Backend

1. Abra **Network** no DevTools
2. Filtre por `/logs/batch`
3. Verifique se há requisições POST sendo enviadas
4. **Nota**: Logs são enviados a cada 30 segundos em produção

## Passo 8: Testar em Diferentes Dispositivos

### Desktop

- ✅ Chrome/Edge: Suporte completo
- ✅ Firefox: Suporte completo
- ⚠️ Safari: Suporte limitado (sem beforeinstallprompt)

### Mobile

- ✅ Android Chrome: Suporte completo
- ✅ iOS Safari: Suporte básico (instalação manual)

## Checklist de Testes

### Funcionalidades Básicas

- [ ] Manifest carrega corretamente
- [ ] Service Worker registra sem erros
- [ ] Ícones aparecem em todos os tamanhos
- [ ] Modal de instalação aparece automaticamente
- [ ] App instala corretamente
- [ ] App abre em modo standalone após instalação

### Funcionalidades Offline

- [ ] Assets estáticos carregam offline
- [ ] Layout funciona offline
- [ ] Service Worker cacheia recursos corretamente
- [ ] Cache é limpo quando necessário

### Funcionalidades de Atualização

- [ ] Novo Service Worker é detectado
- [ ] Atualização funciona corretamente
- [ ] Cache antigo é limpo

### Logs e Monitoramento

- [ ] Logs aparecem no console (dev)
- [ ] Logs são enviados ao backend (produção)
- [ ] Logs incluem contexto e dados relevantes

## Problemas Comuns e Soluções

### Service Worker não registra

- **Causa**: Não está em HTTPS ou localhost
- **Solução**: Use `pnpm preview` ou configure HTTPS local

### Modal de instalação não aparece

- **Causa**: App já instalado ou navegador não suporta
- **Solução**: Desinstale o app ou teste em outro navegador

### Cache não funciona

- **Causa**: Service Worker não está ativo
- **Solução**: Verifique o status no DevTools > Application > Service Workers

### Logs não são enviados

- **Causa**: Backend não tem endpoint `/logs/batch`
- **Solução**: Implemente o endpoint ou verifique a URL da API

## Comandos Úteis

```bash
# Limpar cache do Service Worker
# No DevTools > Application > Clear storage > Clear site data

# Verificar se está em modo standalone
# No console:
window.matchMedia('(display-mode: standalone)').matches

# Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

# Forçar atualização do Service Worker
navigator.serviceWorker.getRegistration().then(reg => reg?.update())
```

## Próximos Passos

1. **Implementar endpoint de logs no backend**: `POST /minc-teams/v1/logs/batch`
2. **Adicionar analytics**: Rastrear instalações e uso offline
3. **Otimizar cache**: Ajustar estratégias conforme necessário
4. **Testar em produção**: Deploy e testes em ambiente real

## Recursos Adicionais

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Chrome DevTools - Application Tab](https://developer.chrome.com/docs/devtools/application/)
