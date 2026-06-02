# Mawid — Medical Appointment System

Backend: Django 6.0 + DRF | Frontend: React + Vite

---

## Environment Setup

Copy the example env file and fill in your values:

```bash
cp api/.env.example api/.env
```

### Key variables:

| Variable | Description |
|----------|-------------|
| `DEBUG` | `True` for dev, `False` for production |
| `SECRET_KEY` | Django secret key (generate a long random string for production) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional — leave blank for local file storage in dev |
| `EMAIL_BACKEND` | `console` prints emails to terminal; `smtp` sends real emails |

---

## Running the Backend

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## Seed Data

Populate the database with sample doctors, patients, and appointments:

```bash
python manage.py seed_data
```

### Pre-seeded accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mawid.com` | `admin123` |
| Doctor | `dr.sarah@mawid.com` | `doctor123` |
| Doctor | `dr.mohamed@mawid.com` | `doctor123` |
| Patient | `omar.hassan@mail.com` | `patient123` |
| Patient | `nour.adel@mail.com` | `patient123` |

The command is idempotent — running it again skips existing records.

---

## Clear Database

Delete **all** data from all tables (except migrations):

```bash
python manage.py clean_db
```

Prompts for confirmation. To skip the prompt:

```bash
python manage.py clean_db --no-input
```

---

## Run Tests

```bash
python manage.py test --settings=api.test_settings
```

Or with pytest:

```bash
pytest
```
