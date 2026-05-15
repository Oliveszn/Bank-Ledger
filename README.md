# Bank Ledger — Double-Entry Accounting API

A production-ready financial ledger built with **Go**, **PostgreSQL** (Neon), and **React + Vite**. Every financial movement is recorded using the double-entry accounting principle, ensuring the books always balance.

---

## Table of Contents

- [Double-Entry Accounting Principle](#double-entry-accounting-principle)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Transaction Flows](#transaction-flows)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Frontend](#frontend)

---

## Double-Entry Accounting Principle

Double-entry bookkeeping is a system where **every financial transaction affects at least two accounts**, with total debits always equalling total credits. This is the foundation of all modern accounting systems.

### The Core Rule

> For every transaction: **Total Debits = Total Credits**

Every entry in the ledger is either a **debit** or a **credit** — never both. This is enforced at the database level with a `CHECK` constraint:

```sql
CONSTRAINT check_single_side CHECK (
    (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
)
```

### How We Implemented It

```
┌─────────────────────────────────────────────────────────┐
│                    DEPOSIT £100                          │
│                                                          │
│  User Account        │  Direction  │  Amount             │
│  ───────────────     │  ─────────  │  ──────             │
│  Savings Account     │  CREDIT (+) │  £100.00            │
│                                                          │
│  Net effect: account balance increases by £100           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   WITHDRAWAL £40                         │
│                                                          │
│  User Account        │  Direction  │  Amount             │
│  ───────────────     │  ─────────  │  ──────             │
│  Savings Account     │  DEBIT  (-) │  £40.00             │
│                                                          │
│  Net effect: account balance decreases by £40            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   TRANSFER £60                           │
│                                                          │
│  Account             │  Direction  │  Amount             │
│  ───────────────     │  ─────────  │  ──────             │
│  Sender Account      │  DEBIT  (-) │  £60.00             │
│  Receiver Account    │  CREDIT (+) │  £60.00             │
│                                                          │
│  Net effect: money moves, total in system unchanged      │
└─────────────────────────────────────────────────────────┘
```

### Why This Matters

- **Audit trail** — every balance change has a corresponding entry explaining why
- **Error detection** — if debits ≠ credits, something went wrong
- **Reconciliation** — calculated balance from entries must match stored balance
- **No money creation** — transfers can never create or destroy value

### Calculated vs Stored Balance

We maintain two views of truth:

```
Stored balance  →  accounts.balance (updated on every transaction)
Calculated balance  →  SUM(credit) - SUM(debit) across all entries

These must always match. The /accounts/:id/reconcile endpoint verifies this.
```

---

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Language         | Go 1.25                          |
| Web Framework    | Gin                              |
| Database         | PostgreSQL via Neon (serverless) |
| DB Driver        | pgx/v5                           |
| Query Generation | sqlc                             |
| Migrations       | golang-migrate                   |
| Auth             | JWT (golang-jwt/jwt)             |
| API Docs         | Swagger (swaggo)                 |
| Frontend         | React + Vite                     |
| Containerisation | Docker + Docker Compose          |

---

## Project Structure

```
ledger/
├── backend/
│   ├── cmd/
│   │   └── main.go                    # Entry point, wires all dependencies
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 000001_init_schema.up.sql
│   │   │   ├── 000001_init_schema.down.sql
│   │   │   ├── 000002_add_is_active.up.sql
│   │   │   └── 000002_add_is_active.down.sql
│   │   └── queries/
│   │       ├── accounts.sql           # sqlc query definitions
│   │       ├── entries.sql
│   │       ├── transactions.sql
│   │       └── users.sql
│   ├── docs/                          # Swagger generated docs
│   │   ├── docs.go
│   │   ├── swagger.json
│   │   └── swagger.yaml
│   ├── internal/
│   │   ├── api/
│   │   │   ├── dtos/
│   │   │   │   ├── account_dto.go
│   │   │   │   ├── auth_dto.go
│   │   │   │   ├── entry_dto.go
│   │   │   │   ├── response_dto.go
│   │   │   │   └── transaction_dto.go
│   │   │   ├── jwt.go                 # Token generation and parsing
│   │   │   └── respond.go             # Unified JSON response helpers
│   │   ├── db/
│   │   │   ├── sqlc/                  # Auto-generated by sqlc
│   │   │   │   ├── accounts.sql.go
│   │   │   │   ├── db.go
│   │   │   │   ├── entries.sql.go
│   │   │   │   ├── models.go
│   │   │   │   ├── transactions.sql.go
│   │   │   │   └── users.sql.go
│   │   │   └── store.go               # pgxpool + ExecTx for atomic operations
│   │   ├── handler/
│   │   │   ├── account_handler.go
│   │   │   ├── auth_handler.go
│   │   │   ├── entry_handler.go
│   │   │   ├── helpers.go             # bindJSON, parseUUID, handleServiceError
│   │   │   └── transaction_handler.go
│   │   ├── logger/
│   │   │   └── logger.go              # slog structured logger
│   │   ├── middleware/
│   │   │   └── auth.go                # JWT Bearer token middleware
│   │   ├── router/
│   │   │   └── router.go              # Route definitions and middleware wiring
│   │   └── service/
│   │       ├── account_service.go
│   │       ├── auth_service.go
│   │       ├── entry_service.go
│   │       ├── helpers.go             # Numeric conversion, balance checks
│   │       └── transaction_service.go
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   └── sqlc.yaml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/                  # API client
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

---

## Architecture

```mermaid
graph TD
    Client["React + Vite\nFrontend"]
    Gin["Gin Router"]
    MW["JWT Middleware"]
    AH["Auth Handler"]
    ACH["Account Handler"]
    TH["Transaction Handler"]
    EH["Entry Handler"]
    AS["Auth Service"]
    ACS["Account Service"]
    TS["Transaction Service"]
    ES["Entry Service"]
    Store["DB Store\n(pgxpool + ExecTx)"]
    SQLC["sqlc Queries"]
    Neon["Neon PostgreSQL"]

    Client -->|HTTP + Bearer Token| Gin
    Gin --> MW
    MW -->|Inject user_id| AH
    MW -->|Inject user_id| ACH
    MW -->|Inject user_id| TH
    MW -->|Inject user_id| EH
    AH --> AS
    ACH --> ACS
    TH --> TS
    EH --> ES
    AS --> Store
    ACS --> Store
    TS --> Store
    ES --> Store
    Store --> SQLC
    SQLC --> Neon
```

### Request Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as JWT Middleware
    participant H as Handler
    participant S as Service
    participant DB as Database

    C->>R: POST /transactions/transfer
    R->>M: Check Authorization header
    M->>M: Parse & validate JWT
    M->>H: Inject user_id into context
    H->>H: Bind & validate request body
    H->>S: Call service with user_id + dto
    S->>DB: GetAccount (verify ownership)
    S->>DB: ExecTx (atomic operation)
    DB-->>S: Result
    S-->>H: TransactionResponse
    H-->>C: 201 JSON response
```

---

## Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        text email UK
        text hashed_password
        timestamptz created_at
    }

    accounts {
        uuid id PK
        uuid owner_id FK
        text name
        numeric balance
        text currency
        boolean is_system
        boolean is_active
        timestamptz created_at
    }

    transactions {
        uuid id PK
        text description
        operation_type operation_type
        timestamptz created_at
    }

    entries {
        uuid id PK
        uuid account_id FK
        numeric debit
        numeric credit
        uuid transaction_id FK
        operation_type operation_type
        text description
        timestamptz created_at
    }

    users ||--o{ accounts : "owns"
    accounts ||--o{ entries : "has"
    transactions ||--o{ entries : "contains"
```

### Key Design Decisions

**Money stored as `NUMERIC(19,4)`** — never `FLOAT`. Floating point arithmetic is imprecise and will silently corrupt financial calculations. `NUMERIC` is exact.

**Debit and credit as separate columns** — rather than a single signed `amount`, we use separate `debit` and `credit` columns. The `check_single_side` constraint ensures exactly one side is non-zero per entry. This maps directly to accounting ledger convention.

**`transactions` groups `entries`** — a single transfer creates one `transaction` and two `entries` (one debit, one credit). The transaction is the event; the entries are the bookkeeping.

**`is_active` on accounts** — financial accounts are never hard deleted. Deactivation is a soft operation that prevents further transactions while preserving all history.

---

## API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Route            | Auth      | Description                    |
| ------ | ---------------- | --------- | ------------------------------ |
| POST   | `/auth/register` | Public    | Create account, returns JWT    |
| POST   | `/auth/login`    | Public    | Login, returns JWT             |
| POST   | `/auth/logout`   | Protected | Logout (client discards token) |

### Accounts

| Method | Route                      | Auth      | Description                         |
| ------ | -------------------------- | --------- | ----------------------------------- |
| POST   | `/accounts`                | Protected | Create a new account                |
| GET    | `/accounts`                | Protected | List all accounts for user          |
| GET    | `/accounts/:id`            | Protected | Get single account                  |
| GET    | `/accounts/:id/balance`    | Protected | Get calculated balance from entries |
| PATCH  | `/accounts/:id/deactivate` | Protected | Soft deactivate account             |

### Transactions

| Method | Route                                | Auth      | Description                   |
| ------ | ------------------------------------ | --------- | ----------------------------- |
| POST   | `/transactions/deposit`              | Protected | Deposit funds                 |
| POST   | `/transactions/withdraw`             | Protected | Withdraw funds                |
| POST   | `/transactions/transfer`             | Protected | Transfer between accounts     |
| GET    | `/transactions/:id`                  | Protected | Get transaction with entries  |
| GET    | `/accounts/:account_id/transactions` | Protected | List transactions for account |

### Entries

| Method | Route                           | Auth      | Description              |
| ------ | ------------------------------- | --------- | ------------------------ |
| GET    | `/accounts/:account_id/entries` | Protected | Paginated entry list     |
| POST   | `/accounts/reconcile`           | Protected | Verify balance integrity |

Swagger UI is available at `/swagger/index.html` when the server is running.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as API
    participant DB as Database

    U->>API: POST /auth/register { email, password }
    API->>API: bcrypt hash password
    API->>DB: INSERT INTO users
    DB-->>API: User record
    API->>API: Generate JWT (24h expiry)
    API-->>U: 201 { user_id, email, token }

    U->>API: POST /auth/login { email, password }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: bcrypt.CompareHashAndPassword
    API->>API: Generate JWT
    API-->>U: 200 { user_id, email, token }

    U->>API: GET /accounts (Authorization: Bearer token)
    API->>API: Parse & validate JWT
    API->>API: Extract user_id from claims
    API->>DB: SELECT accounts WHERE owner_id = user_id
    DB-->>API: Accounts
    API-->>U: 200 { accounts }
```

---

## Transaction Flows

### Deposit

```mermaid
sequenceDiagram
    participant C as Client
    participant S as TransactionService
    participant DB as Database

    C->>S: Deposit { account_id, amount }
    S->>DB: GetAccount (verify ownership + active)
    S->>DB: BEGIN TRANSACTION
    S->>DB: CreateTransaction (operation_type=deposit)
    S->>DB: CreateEntry (credit = amount, debit = 0)
    S->>DB: UpdateAccountBalance (+amount)
    S->>DB: COMMIT
    S-->>C: TransactionResponse with entries
```

### Withdrawal

```mermaid
sequenceDiagram
    participant C as Client
    participant S as TransactionService
    participant DB as Database

    C->>S: Withdraw { account_id, amount }
    S->>DB: GetAccount (verify ownership + active)
    S->>S: Check balance >= amount
    S->>DB: BEGIN TRANSACTION
    S->>DB: CreateTransaction (operation_type=withdrawal)
    S->>DB: CreateEntry (debit = amount, credit = 0)
    S->>DB: UpdateAccountBalance (-amount)
    S->>DB: COMMIT
    S-->>C: TransactionResponse with entries
```

### Transfer

```mermaid
sequenceDiagram
    participant C as Client
    participant S as TransactionService
    participant DB as Database

    C->>S: Transfer { from_account_id, to_account_id, amount }
    S->>S: Validate accounts are not the same
    S->>DB: GetAccount sender (verify ownership + active)
    S->>DB: GetAccount receiver (verify active)
    S->>S: Verify currencies match
    S->>S: Check sender balance >= amount
    S->>DB: BEGIN TRANSACTION
    S->>DB: CreateTransaction (operation_type=transfer)
    S->>DB: CreateEntry sender (debit = amount, credit = 0)
    S->>DB: CreateEntry receiver (debit = 0, credit = amount)
    S->>DB: UpdateAccountBalance sender (-amount)
    S->>DB: UpdateAccountBalance receiver (+amount)
    S->>DB: COMMIT
    S-->>C: TransactionResponse with both entries
```

### Reconciliation

```mermaid
flowchart TD
    A[POST /accounts/reconcile] --> B[Verify account ownership]
    B --> C[Fetch stored balance from accounts table]
    C --> D[Calculate balance from entries\nSUM credit - SUM debit]
    D --> E{stored == calculated?}
    E -->|Yes| F[reconciled: true\ndiscrepancy: 0.0000]
    E -->|No| G[reconciled: false\ndiscrepancy: difference]
    F --> H[Return ReconcileResponse]
    G --> H
```

---

## Getting Started

### Prerequisites

- Go 1.25+
- Docker + Docker Compose
- [golang-migrate](https://github.com/golang-migrate/migrate) CLI
- [sqlc](https://sqlc.dev)
- A [Neon](https://neon.tech) PostgreSQL database

### Local Setup

**1. Clone and configure:**

```bash
git clone https://github.com/yourname/ledger.git
cd ledger/backend
cp .env.example .env
# Fill in your DB_URL and JWT_SECRET in .env
```

**2. Run migrations:**

```bash
migrate -path database/migrations \
  -database "postgres://user:pass@host/db?sslmode=require" up
```

**3. Generate sqlc code:**

```bash
sqlc generate
```

**4. Generate Swagger docs:**

```bash
swag init -g cmd/main.go
```

**5. Run the server:**

```bash
go run cmd/main.go
```

Server starts at `http://localhost:8000`. Swagger UI at `http://localhost:8000/swagger/index.html`.

---

## Running with Docker

```bash
# From the project root
docker compose up --build
```

The first build downloads base images and dependencies — subsequent builds use the cache and are significantly faster.

### Dockerfile Strategy

The build uses a two-stage Dockerfile to keep the final image as small as possible:

```
Stage 1 (builder)     Stage 2 (runtime)
─────────────────     ─────────────────
golang:1.25-alpine    scratch (empty)
Install git
Copy go.mod/go.sum ──► (cached layer)
go mod download    ──► (cached unless deps change)
Copy source
go build           ──► COPY binary + CA certs
                       CMD ["./server"]
```

The final image contains only the compiled binary and TLS certificates — no OS, no shell, no Go toolchain. This keeps the image under 20MB and eliminates an entire class of vulnerabilities.

---

## Environment Variables

| Variable     | Description                            | Example                                        |
| ------------ | -------------------------------------- | ---------------------------------------------- |
| `DB_URL`     | Neon PostgreSQL connection string      | `postgres://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | `your-secret-key-at-least-32-characters`       |

---

## Frontend

The frontend is built with **React + Vite** and communicates with the API over HTTP.

### Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.

### Key Pages

| Page             | Route           | Description                        |
| ---------------- | --------------- | ---------------------------------- |
| Login / Register | `/`             | Auth screens                       |
| Dashboard        | `/dashboard`    | Account overview and balances      |
| Account Detail   | `/accounts/:id` | Entry history and transaction list |
| Transfer         | `/transfer`     | Move funds between accounts        |
| Reconcile        | `/reconcile`    | Verify account balance integrity   |

### API Client

All API calls go through a centralised service layer in `src/services/` with the JWT token automatically attached via an Axios interceptor:

```typescript
// Token is injected on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Key Technical Decisions

**Atomic transactions via `ExecTx`** — deposit, withdrawal, and transfer all run inside a PostgreSQL transaction. If any step fails (e.g. the balance update fails after the entry is created), the entire operation rolls back. No partial states are ever committed.

**Ownership checks on every operation** — every protected service method verifies that the authenticated user owns the account before performing any operation. This is checked at the service layer, not just the handler layer.

**`pgtype.Numeric` for money** — sqlc maps `NUMERIC(19,4)` columns to `pgtype.Numeric`, a big-integer backed type with no floating point involvement. Arithmetic uses `math/big` throughout.

**Structured logging with `slog`** — every service method logs its inputs and outcomes. Failed operations log at `WARN`, unexpected errors at `ERROR`. This makes tracing a transaction through the logs straightforward.

**Stateless JWT auth** — the server holds no session state. The JWT contains the `user_id` claim and a 24-hour expiry. Logout is handled client-side by discarding the token. A token blacklist can be added later if needed.
