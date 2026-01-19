> **MANDATORIO: Siempre responde en ESPAÑOL**

---
name: python-fastapi
description: FastAPI REST API template principles. SQLAlchemy, Pydantic, Alembic.
---

# FastAPI API Template

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Migrations | Alembic |
| Auth | JWT + passlib |

---

## Directory Structure

```
project-name/
â”œâ”€â”€ alembic/             # Migrations
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ main.py          # FastAPI app
â”‚   â”œâ”€â”€ config.py        # Settings
â”‚   â”œâ”€â”€ database.py      # DB connection
â”‚   â”œâ”€â”€ models/          # SQLAlchemy models
â”‚   â”œâ”€â”€ schemas/         # Pydantic schemas
â”‚   â”œâ”€â”€ routers/         # API routes
â”‚   â”œâ”€â”€ services/        # Business logic
â”‚   â”œâ”€â”€ dependencies/    # DI
â”‚   â””â”€â”€ utils/
â”œâ”€â”€ tests/
â”œâ”€â”€ .env.example
â””â”€â”€ requirements.txt
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Async | async/await throughout |
| Dependency Injection | FastAPI Depends |
| Pydantic v2 | Validation + serialization |
| SQLAlchemy 2.0 | Async sessions |

---

## API Structure

| Layer | Responsibility |
|-------|---------------|
| Routers | HTTP handling |
| Dependencies | Auth, validation |
| Services | Business logic |
| Models | Database entities |
| Schemas | Request/response |

---

## Setup Steps

1. `python -m venv venv`
2. `source venv/bin/activate`
3. `pip install fastapi uvicorn sqlalchemy alembic pydantic`
4. Create `.env`
5. `alembic upgrade head`
6. `uvicorn app.main:app --reload`

---

## Best Practices

- Use async everywhere
- Pydantic v2 for validation
- SQLAlchemy 2.0 async sessions
- Alembic for migrations
- pytest-asyncio for tests

