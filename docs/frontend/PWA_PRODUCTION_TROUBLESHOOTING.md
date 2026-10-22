# PWA Troubleshooting in Production

## Problem: Install prompt modal does not appear

### Quick checks

1. **Verify Service Worker**

   ```javascript
   // In the browser console
   navigator.serviceWorker.getRegistration().then(reg => {
     console.log('SW:', reg ? '✅ Active' : '❌ Not registered')
   })
   ```

2. **Verify Manifest**

   ```javascript
   // In the console
   fetch('/manifest.webmanifest')
     .then(r => r.json())
     .then(m => console.log('Manifest:', m))
     .catch(e => console.error('Error:', e))
   ```

3. **Verify `beforeinstallprompt` event**

   ```javascript
   // In the console
   window.addEventListener('beforeinstallprompt', e => {
     console.log('✅ beforeinstallprompt fired!', e)
   })
   ```

4. **Verify localStorage**
   ```javascript
   // In the console
   console.log('Dismissed:', localStorage.getItem('pwa-install-dismissed'))
   ```

### Solutions

#### 1. Clear localStorage cache

If the user previously dismissed the prompt, the modal will not appear again. To reset:

```javascript
// In the browser console
localStorage.removeItem('pwa-install-dismissed')
location.reload()
```

#### 2. Check if the app is already installed

```javascript
// In the console
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
console.log('Already installed:', isStandalone)
```

#### 3. Force show modal (debug)

Add temporarily in the console:

```javascript
// Force show modal (may not work on all browsers)
window.dispatchEvent(new Event('beforeinstallprompt'))
```

#### 4. Verify PWA requirements

The browser shows the install prompt only when:

- ✅ HTTPS is active (or localhost)
- ✅ Manifest is valid and reachable
- ✅ Service Worker is registered and active
- ✅ Icons are valid (at least 192×192 and 512×512)
- ✅ App is not already installed
- ✅ User has visited the site at least twice (some browsers)

### Debug panel

The debug panel is available in development. To use it temporarily in production:

1. Add `?debug=pwa` to the URL
2. Or temporarily change `AppLayout.tsx`:

```tsx
{
  /* PWA Debug Panel — temporary for production */
}
{
  import.meta.env.DEV || window.location.search.includes('debug=pwa') ? <PWADebugPanel /> : null
}
```

### Production checklist

- [ ] Service Worker is registered (`/service-worker.js` reachable)
- [ ] Manifest is reachable (`/manifest.webmanifest` returns valid JSON)
- [ ] Icons are reachable (`/icons/icon-192x192.png` and `/icons/icon-512x512.png`)
- [ ] HTTPS is active (not HTTP)
- [ ] App is not already installed
- [ ] localStorage does not have `pwa-install-dismissed: true`
- [ ] `beforeinstallprompt` event is being captured

### Useful debug snippet

```javascript
// Check everything at once
;(async () => {
  const sw = await navigator.serviceWorker.getRegistration()
  const manifest = await fetch('/manifest.webmanifest').then(r => r.json())
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const standalone = window.matchMedia('(display-mode: standalone)').matches

  console.table({
    'Service Worker': sw ? '✅' : '❌',
    Manifest: manifest.name || '❌',
    Dismissed: dismissed || 'No',
    Standalone: standalone ? 'Yes' : 'No',
  })
})()
```

### Common issues

1. **`beforeinstallprompt` never fires**
   - Verify the manifest has all required fields
   - Verify icons are reachable
   - Some browsers require multiple visits before showing the prompt

2. **Modal appears but installation fails**
   - Verify the Service Worker is active
   - Check for errors in the console

3. **Works in dev but not in production**
   - Verify static files are served correctly
   - Verify the service worker path is correct
   - Check CORS and HTTP headers

### Next steps

1. Check system logs (devtools console)
2. Use the debug panel to identify the issue
3. Review browser-specific documentation:
   - [Chrome PWA](https://developer.chrome.com/docs/workbox/)
   - [Edge PWA](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)
   - [Safari PWA](https://developer.apple.com/documentation/safari_web_content/promoting_apps_with_smart_app_banners)
