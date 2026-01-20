# Troubleshooting PWA em Produção

## Problema: Modal de Instalação Não Aparece

### Verificações Rápidas

1. **Verificar Service Worker**

   ```javascript
   // No console do navegador
   navigator.serviceWorker.getRegistration().then(reg => {
     console.log('SW:', reg ? '✅ Ativo' : '❌ Não registrado')
   })
   ```

2. **Verificar Manifest**

   ```javascript
   // No console
   fetch('/manifest.webmanifest')
     .then(r => r.json())
     .then(m => console.log('Manifest:', m))
     .catch(e => console.error('Erro:', e))
   ```

3. **Verificar Evento beforeinstallprompt**

   ```javascript
   // No console
   window.addEventListener('beforeinstallprompt', e => {
     console.log('✅ beforeinstallprompt disparado!', e)
   })
   ```

4. **Verificar localStorage**
   ```javascript
   // No console
   console.log('Dismissed:', localStorage.getItem('pwa-install-dismissed'))
   ```

### Soluções

#### 1. Limpar Cache do localStorage

Se o usuário já rejeitou antes, o modal não aparece novamente. Para resetar:

```javascript
// No console do navegador
localStorage.removeItem('pwa-install-dismissed')
location.reload()
```

#### 2. Verificar se App Já Está Instalado

```javascript
// No console
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
console.log('Já instalado:', isStandalone)
```

#### 3. Forçar Mostrar Modal (Debug)

Adicione temporariamente no console:

```javascript
// Forçar mostrar modal
window.dispatchEvent(new Event('beforeinstallprompt'))
```

#### 4. Verificar Requisitos PWA

O navegador só mostra o prompt de instalação se:

- ✅ HTTPS ativo (ou localhost)
- ✅ Manifest válido e acessível
- ✅ Service Worker registrado e ativo
- ✅ Ícones válidos (pelo menos 192x192 e 512x512)
- ✅ App não está já instalado
- ✅ Usuário visitou o site pelo menos 2 vezes (alguns navegadores)

### Usar Painel de Debug

O painel de debug está disponível em desenvolvimento. Para usar em produção temporariamente:

1. Adicione `?debug=pwa` na URL
2. Ou modifique temporariamente `AppLayout.tsx`:

```tsx
{
  /* PWA Debug Panel - Temporário para produção */
}
{
  import.meta.env.DEV || window.location.search.includes('debug=pwa') ? <PWADebugPanel /> : null
}
```

### Checklist de Produção

- [ ] Service Worker está registrado (`/service-worker.js` acessível)
- [ ] Manifest está acessível (`/manifest.webmanifest` retorna JSON válido)
- [ ] Ícones estão acessíveis (`/icons/icon-192x192.png` e `/icons/icon-512x512.png`)
- [ ] HTTPS está ativo (não HTTP)
- [ ] App não está já instalado
- [ ] localStorage não tem `pwa-install-dismissed: true`
- [ ] Evento `beforeinstallprompt` está sendo capturado

### Comandos Úteis para Debug

```javascript
// Verificar tudo de uma vez
;(async () => {
  const sw = await navigator.serviceWorker.getRegistration()
  const manifest = await fetch('/manifest.webmanifest').then(r => r.json())
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const standalone = window.matchMedia('(display-mode: standalone)').matches

  console.table({
    'Service Worker': sw ? '✅' : '❌',
    Manifest: manifest.name || '❌',
    Dismissed: dismissed || 'Não',
    Standalone: standalone ? 'Sim' : 'Não',
  })
})()
```

### Problemas Comuns

1. **"beforeinstallprompt nunca dispara"**
   - Verifique se o manifest tem todos os campos obrigatórios
   - Verifique se os ícones estão acessíveis
   - Alguns navegadores exigem que o usuário visite o site múltiplas vezes

2. **"Modal aparece mas instalação falha"**
   - Verifique se o Service Worker está ativo
   - Verifique se há erros no console

3. **"Funciona em dev mas não em produção"**
   - Verifique se os arquivos estáticos estão sendo servidos corretamente
   - Verifique se o caminho do service-worker.js está correto
   - Verifique CORS e headers HTTP

### Próximos Passos

1. Verifique os logs do sistema (devtools console)
2. Use o painel de debug para identificar o problema
3. Verifique a documentação do navegador específico:
   - [Chrome PWA](https://developer.chrome.com/docs/workbox/)
   - [Edge PWA](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)
   - [Safari PWA](https://developer.apple.com/documentation/safari_web_content/promoting_apps_with_smart_app_banners)
