# QR Code Check-in — Implementation Guide

## Objective

Design a QR Code check-in system that lets team leaders validate volunteer attendance at worship services quickly and securely.

---

## Functional requirements

### FR-001: QR Code generation

- Volunteers can generate a unique QR Code
- QR Code is bound to volunteer ID and timestamp
- QR Code has a time limit (e.g. one hour)
- Volunteers can refresh the QR Code

### FR-002: QR Code scanning

- Team leaders scan via device camera
- Server validates in real time
- Successful validation records check-in automatically
- UI provides visual and optional audio confirmation

### FR-003: Validation rules

- QR Code signature and payload integrity
- Expiration not passed
- Volunteer belongs to the leader’s team
- Volunteer is on the schedule for that service/day
- Duplicate check-in rejected

### FR-004: Manual check-in

- Team leaders can mark attendance manually
- List volunteers on the schedule for the team
- Per-person present/absent with optional absence reason

---

## Non-functional requirements

### NFR-001: Security

- Signed payload (HMAC or asymmetric signature)
- Server-side validation only
- Replay protection (expiry + optional one-time use)

### NFR-002: Performance

- Scan decode under ~2 seconds on client
- Server validation under ~500 ms
- Support concurrent scans

### NFR-003: Usability

- Clear scanning UI and error messages
- Works in varied lighting
- Optional offline queue with later sync

---

## Proposed architecture

### Payload structure

```json
{
  "volunteerId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T11:30:00Z",
  "version": "1.0",
  "signature": "hmac-hex"
}
```

### Generation flow

1. Volunteer requests a QR Code
2. Backend builds payload and signs it
3. Backend returns encoded data (JSON + Base64 or URL)
4. Client renders QR image

### Scan flow

1. Leader opens scan screen and enables camera
2. Client decodes payload
3. Backend validates signature, expiry, team, schedule
4. Check-in persisted; UI confirms success or shows error

---

## Recommended libraries

### Web (React)

- **Display:** `qrcode.react` or `react-qr-code`
- **Scan:** `@zxing/library` or `html5-qrcode`

### Backend (NestJS)

- **Display encoding:** `qrcode` (Node.js)
- **Crypto:** Node.js `crypto` (HMAC-SHA256)

---

## Security

### Signing example

```typescript
const payload = {
  volunteerId: 'uuid',
  timestamp: Date.now(),
  expiresAt: Date.now() + 3_600_000,
}

const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex')

const qrCodeData = { ...payload, signature }
```

### Validation example

```typescript
function validateQRCode(qrData: QRCodeData): boolean {
  if (Date.now() > qrData.expiresAt) return false

  const { signature, ...payload } = qrData
  const expected = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex')

  if (signature !== expected) return false

  // Load volunteer, team membership, schedule, duplicate check-in
  return true
}
```

### Replay mitigation

- Short TTL (e.g. one hour)
- Optional Redis set of used `(volunteerId, scheduleId, window)` keys

---

## Web vs mobile

| Platform | Leader scan | Volunteer display |
| -------- | ----------- | ----------------- |
| Web      | Webcam      | Browser           |
| Mobile   | Native camera | Native app      |

---

## Data model (reference)

### `check_ins`

```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES persons(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  checked_in_at TIMESTAMP NOT NULL,
  checked_in_by UUID NOT NULL REFERENCES users(id),
  method VARCHAR(20) NOT NULL, -- 'qr_code' | 'manual'
  qr_code_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `qr_code_logs` (audit)

```sql
CREATE TABLE qr_code_logs (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL,
  qr_code_data JSONB NOT NULL,
  scanned_at TIMESTAMP NOT NULL,
  scanned_by UUID NOT NULL,
  is_valid BOOLEAN NOT NULL,
  validation_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UX wireframes (reference)

**Volunteer — My QR Code:** large QR, expiry countdown, refresh button.

**Leader — Scan:** camera view, switch camera, link to manual check-in.

**Success:** volunteer name, team, timestamp, OK dismiss.

---

## User flows

1. **QR success:** generate → scan → validate → record → confirm
2. **QR failure:** show specific error (expired, wrong team, not scheduled, duplicate)
3. **Manual:** pick schedule/team → mark roster → save batch check-ins

---

## Test cases (summary)

- Generation: valid signature, correct expiry
- Scan: happy path registers attendance
- Validation: reject expired, invalid signature, wrong team, not on schedule, duplicate
- Manual: leader permissions and absence notes

---

## Metrics

- QR vs manual check-in ratio
- Average time to check in
- Scan error rate
- User satisfaction

---

## Implementation roadmap

| Phase | Scope |
| ----- | ----- |
| 1 | Library spike, security prototype |
| 2 | Backend generate + validate APIs, migrations |
| 3 | Web volunteer display + leader scanner |
| 4 | React Native camera integration |
| 5 | UX polish, performance, documentation |

---

## Technical notes

- QR type: standard QR (not Data Matrix)
- Error correction level: M (~15%)
- Minimum render size: 256×256 px
- Target: generation &lt; 100 ms, validation &lt; 500 ms

---

## References

- [QR Code specification](https://www.qrcode.com/en/)
- [ZXing](https://github.com/zxing/zxing)
- [Node.js crypto](https://nodejs.org/api/crypto.html)
- [qrcode.react](https://www.npmjs.com/package/qrcode.react)

---

**Last updated:** 2024-01-XX  
**Version:** 1.0.0
