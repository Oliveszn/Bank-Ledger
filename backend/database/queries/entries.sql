-- name: CreateEntry :one
INSERT INTO entries (account_id, debit, credit, transaction_id, operation_type, description)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListEntriesByAccount :many
SELECT * FROM entries
WHERE account_id = $1
ORDER BY created_at DESC
LIMIT $2::int OFFSET $3::int;

-- name: ListEntriesByTransaction :many
SELECT * FROM entries
WHERE transaction_id = $1
ORDER BY created_at;


-- name: GetAccountBalance :one
SELECT CAST((COALESCE(SUM(credit), 0::NUMERIC) - COALESCE(SUM(debit), 0::NUMERIC)) AS NUMERIC(19,4)) AS calculated_balance
FROM entries
WHERE account_id = $1;