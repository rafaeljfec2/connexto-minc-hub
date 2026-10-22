# PWA Testing Guide — MINC Teams

How to verify Progressive Web App behavior in this project.

## Prerequisites

1. **Production-like build** — use `pnpm build` + `pnpm preview` (or HTTPS dev)
2. **Secure context** — Service Workers require HTTPS or `localhost`
3. **Browsers:** Chrome, Edge, Firefox; Safari on iOS (limited install APIs)

## Step 1: Build and preview

```bash
cd apps/web
pnpm build
pnpm preview
```

Optional HTTPS in dev (e.g. mkcert): `pnpm dev --https`

## Step 2: Manifest

1. Open DevTools → **Application** → **Manifest**
2. Confirm name, description, icons, and theme color load
3. Open `http://localhost:3001/manifest.webmanifest` (adjust port if needed)

## Step 3: Service Worker

1. **Application** → **Service Workers**
2. Status should be **activated and running**, scope `/`

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered Service Workers:', regs)
})
```

## Step 4: Installation

### Chrome / Edge

- Install prompt (~3 s) or address-bar install control
- After install: standalone window, no URL bar, home-screen icon

### Safari (iOS)

**Share** → **Add to Home Screen**

### Programmatic check

```javascript
window.addEventListener('beforeinstallprompt', e => {
  console.log('beforeinstallprompt available', e)
})
```

## Step 5: Offline

1. Install the PWA (optional but realistic)
2. DevTools → **Network** → **Offline**
3. Reload — static shell and assets should load; API calls may fail (expected)

**Cache storage:** look for `minc-teams-v1.0.0` (or current version) with HTML, JS, CSS, icons.

## Step 6: Service Worker update

1. Bump `CACHE_VERSION` in `apps/web/public/service-worker.js`
2. Rebuild and preview
3. DevTools should show a worker **waiting**; use **skipWaiting** or reload

```javascript
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('New Service Worker activated')
  window.location.reload()
})
```

## Step 7: Logs

- Console format: `TIMESTAMP LEVEL [PWA] message`
- In production, batch logs may POST to `/logs/batch` every ~30 s (Network tab)

## Step 8: Devices

| Environment | Install | Offline |
| ----------- | ------- | ------- |
| Chrome desktop | Full | Full |
| Firefox desktop | Full | Full |
| Safari desktop | Limited | Partial |
| Android Chrome | Full | Full |
| iOS Safari | Manual add to home | Partial |

## Checklist

**Basics:** manifest, SW registration, icons, install flow, standalone mode

**Offline:** cached assets, layout without network

**Updates:** new SW detected, old cache cleared

**Logging:** dev console logs; production batch endpoint if enabled

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | -------------- | --- |
| SW not registering | Not HTTPS/localhost | Use preview or HTTPS |
| No install prompt | Already installed or unsupported | Remove install or try Chrome |
| Stale assets | Inactive SW | Check Application → Service Workers |
| No log POSTs | Missing backend route | Implement `/logs/batch` or fix API URL |

## Useful snippets

```javascript
window.matchMedia('(display-mode: standalone)').matches
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))
navigator.serviceWorker.getRegistration().then(reg => reg?.update())
```

Clear site data: DevTools → Application → Clear storage.

## Next steps

1. Backend batch logging endpoint if required
2. Analytics for installs and offline usage
3. Tune cache strategies
4. Validate on a production deployment

## Resources

- [MDN — Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev — PWA](https://web.dev/progressive-web-apps/)
- [Chrome DevTools — Application](https://developer.chrome.com/docs/devtools/application/)
