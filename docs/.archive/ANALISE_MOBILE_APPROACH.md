# Mobile Approach Analysis — MINC Hub

Decision record for how to deliver MINC Teams on mobile (Welcome ministry volunteers and leaders).

## Requirements

- **QR check-in is critical** — reliable camera access and fast scan UX
- Team has React/TypeScript experience
- Target timeline: MVP in weeks, not months
- Must share business rules with existing web app

## Options considered

| Approach | Pros | Cons |
|----------|------|------|
| PWA / WebView only | Reuse web UI | Weak camera/QR; inconsistent push |
| Capacitor wrapper | Fast first ship | Still WebView limits for QR |
| React Native (Expo) | Native camera, push, performance | New navigation and some duplicate UI |

## Recommendation

**Primary: React Native with Expo** for production mobile, reusing shared types/API packages from the monorepo.

**Optional short-term:** Capacitor or PWA only for demos — not for leader QR scanning in production.

## Rationale

- QR is a core workflow; native camera APIs are significantly more reliable than WebView
- Expo shortens build/setup while allowing custom native modules if needed
- Shared TypeScript models reduce drift with NestJS backend and web client

## Suggested phases

1. **Weeks 1–2:** Monorepo package extraction, mobile shell, auth  
2. **Weeks 3–4:** Schedules, profile, QR generate (volunteer)  
3. **Weeks 5–6:** QR scan (leader), push notifications, backend integration  

## Risks

- Duplicate UI work vs web — mitigate with shared design tokens and API client  
- Store release cadence — plan TestFlight/internal testing early  

## When WebView might be enough

- Read-only schedule viewing for members without scan duty  
- Internal admin tools already covered by web  

For leader check-in and volunteer QR display, invest in React Native.
