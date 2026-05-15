package service

import (
	"context"
	"double-entry/internal/api/dtos"
	"double-entry/internal/db"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"errors"

	"math/big"
)

var ErrEntryNotFound = errors.New("no entries found for this account")

type EntryService interface {
	ListEntries(ctx context.Context, userID, accountID string, dto dtos.ListEntriesDto) ([]dtos.EntryResponse, error)
	ReconcileAccount(ctx context.Context, userID string, dto dtos.ReconcileDto) (*dtos.ReconcileResponse, error)
}

type entryService struct {
	store *db.Store
}

func NewEntryService(store *db.Store) EntryService {
	return &entryService{store: store}
}

func (s *entryService) ListEntries(ctx context.Context, userID, accountID string, dto dtos.ListEntriesDto) ([]dtos.EntryResponse, error) {
	logger.Log.Info("listing entries", "user_id", userID, "account_id", accountID)

	accountUID, err := parsePgtypeUUID(accountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

	// Verify ownership
	account, err := s.store.GetAccount(ctx, accountUID)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	entries, err := s.store.ListEntriesByAccount(ctx, sqlc.ListEntriesByAccountParams{
		AccountID: accountUID,
		Limit:     dto.Limit,
		Offset:    dto.Offset,
	})
	if err != nil {
		return nil, err
	}

	responses := make([]dtos.EntryResponse, len(entries))
	for i, e := range entries {
		responses[i] = dtos.EntryResponse{
			ID:          e.ID.String(),
			AccountID:   e.AccountID.String(),
			Debit:       numericToString(e.Debit),
			Credit:      numericToString(e.Credit),
			Description: e.Description.String,
			CreatedAt:   e.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return responses, nil
}

func (s *entryService) ReconcileAccount(ctx context.Context, userID string, dto dtos.ReconcileDto) (*dtos.ReconcileResponse, error) {
	logger.Log.Info("reconciling account", "user_id", userID, "account_id", dto.AccountID)

	accountUID, err := parsePgtypeUUID(dto.AccountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

	// Verify ownership
	account, err := s.store.GetAccount(ctx, accountUID)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	if !account.IsActive {
		return nil, ErrAccountDeactivated
	}

	// Get calculated balance from entries (source of truth)
	calculatedBalance, err := s.store.GetAccountBalance(ctx, accountUID)
	if err != nil {
		return nil, err
	}

	// Convert expected balance from float64 to pgtype.Numeric
	expectedNumeric, err := toNumeric(dto.Expected)
	if err != nil {
		return nil, errors.New("invalid expected balance")
	}

	// Compare expected vs calculated
	calcFloat := numericToBigFloat(calculatedBalance)
	expFloat := numericToBigFloat(expectedNumeric)

	discrepancy := new(big.Float).Sub(expFloat, calcFloat)
	reconciled := discrepancy.Sign() == 0

	if !reconciled {
		logger.Log.Warn("reconciliation discrepancy found",
			"account_id", dto.AccountID,
			"expected", dto.Expected,
			"calculated", numericToString(calculatedBalance),
		)
	} else {
		logger.Log.Info("reconciliation passed", "account_id", dto.AccountID)
	}

	return &dtos.ReconcileResponse{
		AccountID:         dto.AccountID,
		ExpectedBalance:   expFloat.Text('f', 4),
		CalculatedBalance: numericToString(calculatedBalance),
		Reconciled:        reconciled,
		Discrepancy:       discrepancy.Text('f', 4),
	}, nil
}
