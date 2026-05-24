# Mawid API — Overview

Base URL: `http://localhost:8000`
Interactive docs: `http://localhost:8000/api/docs/`
ReDoc: `http://localhost:8000/api/redoc/`

---

## Authentication flow (JWT)

All protected endpoints require a Bearer token in the `Authorization` header.

### 1. Register

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test1234!","role":"patient"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test1234!"}'
# → {"user": {...}, "access": "<token>", "refresh": "<refresh_token>"}
```

### 3. Refresh token

```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'
```

### 4. Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'
```

---

## Role-based access

| Endpoint | Patient | Doctor | Admin |
|---|---|---|---|
| `POST /api/auth/register/` | ✓ | ✓ | — |
| `POST /api/auth/login/` | ✓ | ✓ | ✓ |
| `GET /api/auth/me/` | ✓ | ✓ | ✓ |
| `GET /api/doctors/` | ✓ (approved only) | ✓ (approved only) | ✓ (all) |
| `GET /api/doctors/{id}/` | ✓ | ✓ | ✓ |
| `GET /api/doctors/availability/` | — | ✓ (own) | ✓ |
| `GET /api/patients/me/` | ✓ | — | — |
| `POST /api/appointments/` | ✓ | — | ✓ |
| `GET /api/appointments/` | ✓ (own) | ✓ (own) | ✓ (all) |
| `PATCH /api/appointments/{id}/status/` | cancel only | accept/reject/complete | ✓ |

---

## Common error formats

Validation errors — `400 Bad Request`:
```json
{"time_slot": ["This slot is already booked."], "date": ["Cannot book a date in the past."]}
```

Auth errors — `401 Unauthorized`:
```json
{"error": "Invalid credentials"}
```

Permission errors — `403 Forbidden`:
```json
{"detail": "You do not have permission to set this status."}
```

---

## Quickstart by role

### Patient — book an appointment

```bash
TOKEN="<patient_access_token>"

# List available doctors
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/doctors/

# Book appointment
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doctor":1,"patient":1,"date":"2026-06-02","time_slot":"10:00","reason":"Annual check-up"}'

# View own appointments
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/appointments/
```

### Doctor — manage appointments

```bash
TOKEN="<doctor_access_token>"

# View incoming requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/appointments/

# Accept appointment id=5
curl -X PATCH http://localhost:8000/api/appointments/5/status/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'

# Mark completed
curl -X PATCH http://localhost:8000/api/appointments/5/status/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Admin — approve a doctor

```bash
TOKEN="<admin_access_token>"

# Approve doctor account (via Django admin or admin endpoints)
# When is_approved flips to True, doctor receives an approval email automatically.
```

---

## Status transition rules

```
pending  → accepted | rejected
accepted → completed | rejected
rejected → (terminal)
completed → (terminal)
```

Invalid transitions return `400 Bad Request`.

---

## Email notifications

The system sends emails automatically on these events:

| Event | Recipients |
|---|---|
| User registration | New user |
| Doctor account approved | Doctor |
| Account blocked | Affected user |
| Appointment created | Patient + Doctor |
| Appointment status changed | Patient |

Set `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` in dev (emails print to terminal).
For production set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` and configure SMTP env vars.
