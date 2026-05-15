-- name: CreateAccount :one
INSERT INTO accounts (owner_id, name, currency, is_system)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetAccount :one
SELECT * FROM accounts
WHERE id = $1
LIMIT 1;

-- name: GetAccountForUpdate :one
SELECT * FROM accounts
WHERE id = $1
LIMIT 1
FOR UPDATE; -- locks row for update, prevents TOCTOU races

-- name: ListAccountsByOwner :many
SELECT * FROM accounts
WHERE owner_id = $1
ORDER BY created_at DESC;

-- name: UpdateAccountBalance :exec
UPDATE accounts
SET balance = balance + $1
WHERE id = $2;

-- name: GetSettlementAccount :one
SELECT * FROM accounts
WHERE is_system = TRUE AND name = 'Settlement Account'
LIMIT 1;

-- name: GetSettlementAccountForUpdate :one
SELECT * FROM accounts
WHERE is_system = TRUE AND name = 'Settlement Account'
LIMIT 1
FOR UPDATE; -- lock prevents concurrent transactions from reading a stale balance.

-- name: CreateTransaction :one
INSERT INTO transactions (description, operation_type)
VALUES ($1, $2)
RETURNING *;

-- name: GetTransaction :one
SELECT * FROM transactions
WHERE id = $1;

-- name: ListTransactionsByIDs :many
SELECT DISTINCT t.* FROM transactions t
INNER JOIN entries e ON e.transaction_id = t.id
WHERE e.account_id = $1
ORDER BY t.created_at DESC;

-- name: DeactivateAccount :exec
UPDATE accounts
SET is_active = false
WHERE id = $1;

-- name: ListTransactionsByAccount :many
SELECT DISTINCT t.* FROM transactions t
INNER JOIN entries e ON e.transaction_id = t.id
WHERE e.account_id = $1
ORDER BY t.created_at DESC;