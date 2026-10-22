# Check-in and QR Code — Refactoring Analysis

## Initial findings

### Backend

1. **Duplication** — Time-window validation duplicated in `generateQrCode` and `validateQrCode`; expiry checks repeated; multiple DB round-trips that could be merged.
2. **Data shape** — `QrCodeData` not modeled as a DTO; weak structure validation; some `any` in hot paths.
3. **Performance** — Three separate queries for valid schedules; service loaded separately instead of joined.
4. **WebSocket gateway** — Partial mock `UserEntity`; incomplete error handling; user not loaded fully from DB.

### Frontend

1. **Organization** — Scanner logic tightly coupled to the page; no dedicated hook; resume-scan logic duplicated.
2. **WebSocket** — Incorrect `useEffect` dependencies; missing connection guard; debug logs left in place.
3. **Types** — Duplicated `GenerateQrCodeResponse`; missing shared QR types.

## Implemented refactorings

### Backend

1. **`checkin-time.utils.ts`** — Centralized `validateCheckInTime` and `isQrCodeExpired`; removed duplicated time math.
2. **`qr-code-data.dto.ts`** — Typed DTO with validation for QR payload structure.
3. **Query optimization** — Combined schedule/service lookup into fewer queries with relations loaded upfront.
4. **WebSocket** — Load full user from DB; consistent error responses.

### Frontend

1. **`useQrScanner` hook** — Isolated scanner state, lifecycle, and cleanup.
2. **Page slim-down** — Scanner UI delegates to hook; ~40% less code on main page.
3. **WebSocket hook fixes** — Correct dependencies; connection check before subscribe; removed console noise.
4. **Shared types** — Single source for QR-related interfaces.

## Metrics (approximate)

| Metric | Before | After |
|--------|--------|-------|
| Main page LOC | High | ~40% lower |
| Duplicated validation blocks | Several | 0 |
| Schedule queries (hot path) | 3–4 | 1 |

## Follow-ups

- Unit tests for time utilities and DTO validation
- Optional signed QR payload to prevent forgery
- Integration tests for scan → check-in flow

## Conclusion

Check-in code is cleaner, testable, and ready for schedule integration with fewer queries and no duplicated validation logic.
