package service

import (
	"double-entry/internal/api/dtos"
	"double-entry/internal/db/sqlc"
	"errors"
	"math"
	"math/big"

	"github.com/jackc/pgx/v5/pgtype"
)

// toNumeric converts a float64 amount to pgtype.Numeric
func toNumeric(amount float64) (pgtype.Numeric, error) {
	var n pgtype.Numeric
	err := n.Scan(amount)
	if err != nil {
		return pgtype.Numeric{}, errors.New("failed to convert amount")
	}
	return n, nil
}

// negateNumeric flips the sign of a pgtype.Numeric for subtracting balances
func negateNumeric(n pgtype.Numeric) (pgtype.Numeric, error) {
	if !n.Valid || n.Int == nil {
		return pgtype.Numeric{}, errors.New("invalid numeric")
	}
	negated := new(big.Int).Neg(n.Int)
	return pgtype.Numeric{
		Int:              negated,
		Exp:              n.Exp,
		Valid:            true,
		NaN:              false,
		InfinityModifier: pgtype.Finite,
	}, nil
}

// hasSufficientFunds checks balance >= amount
func hasSufficientFunds(balance, amount pgtype.Numeric) bool {
	if !balance.Valid || !amount.Valid {
		return false
	}
	b := new(big.Float).SetInt(balance.Int)
	a := new(big.Float).SetInt(amount.Int)
	return b.Cmp(a) >= 0
}

// numericToString converts pgtype.Numeric to a plain decimal string
func numericToString(n pgtype.Numeric) string {
	if !n.Valid {
		return "0.0000"
	}
	value, err := n.Value()
	if err != nil || value == nil {
		return "0.0000"
	}
	return value.(string)
}

func parsePgtypeUUID(id string) (pgtype.UUID, error) {
	var uid pgtype.UUID
	err := uid.Scan(id)
	return uid, err
}

// numericToBigFloat converts pgtype.Numeric to big.Float for arithmetic
func numericToBigFloat(n pgtype.Numeric) *big.Float {
	if !n.Valid || n.Int == nil {
		return new(big.Float).SetFloat64(0)
	}
	f := new(big.Float).SetInt(n.Int)
	if n.Exp != 0 {
		exp := new(big.Float).SetFloat64(math.Pow10(int(n.Exp)))
		f.Mul(f, exp)
	}
	return f
}

// toTransactionResponse maps sqlc types to the response DTO
func toTransactionResponse(tx sqlc.Transaction, entries []sqlc.Entry) *dtos.TransactionResponse {
	entryResponses := make([]dtos.EntryResponse, len(entries))
	for i, e := range entries {
		entryResponses[i] = dtos.EntryResponse{
			ID:          e.ID.String(),
			AccountID:   e.AccountID.String(),
			Debit:       numericToString(e.Debit),
			Credit:      numericToString(e.Credit),
			Description: e.Description.String,
			CreatedAt:   e.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return &dtos.TransactionResponse{
		ID:            tx.ID.String(),
		OperationType: string(tx.OperationType),
		Description:   tx.Description.String,
		CreatedAt:     tx.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		Entries:       entryResponses,
	}
}

func toAccountResponse(a sqlc.Account) *dtos.AccountResponse {
	return &dtos.AccountResponse{
		ID:        a.ID.String(),
		OwnerID:   a.OwnerID.String(),
		Name:      a.Name,
		Balance:   numericToString(a.Balance),
		Currency:  a.Currency,
		IsSystem:  a.IsSystem,
		IsActive:  a.IsActive,
		CreatedAt: a.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}
