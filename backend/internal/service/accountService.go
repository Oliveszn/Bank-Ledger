package service

import (
	"context"
	"double-entry/internal/api/dtos"
	"double-entry/internal/db"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"errors"
)

var (
	ErrAccountNotFound           = errors.New("account not found")
	ErrAccountNotOwned           = errors.New("you do not own this account")
	ErrAccountDeactivated        = errors.New("account is deactivated")
	ErrAccountAlreadyDeactivated = errors.New("account is already deactivated")
)

type AccountService interface {
	CreateAccount(ctx context.Context, userID string, dto dtos.CreateAccountDto) (*dtos.AccountResponse, error)
	GetAccount(ctx context.Context, userID, accountID string) (*dtos.AccountResponse, error)
	ListAccounts(ctx context.Context, userID string) ([]dtos.AccountResponse, error)
	GetAccountBalance(ctx context.Context, userID, accountID string) (*dtos.BalanceResponse, error)
	DeactivateAccount(ctx context.Context, userID, accountID string) error
}

type accountService struct {
	store *db.Store
}

func NewAccountService(store *db.Store) AccountService {
	return &accountService{store: store}
}

func (s *accountService) CreateAccount(ctx context.Context, userID string, dto dtos.CreateAccountDto) (*dtos.AccountResponse, error) {
	logger.Log.Info("creating account", "user_id", userID, "name", dto.Name)

	ownerID, err := parsePgtypeUUID(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	account, err := s.store.CreateAccount(ctx, sqlc.CreateAccountParams{
		OwnerID:  ownerID,
		Name:     dto.Name,
		Currency: dto.Currency,
		IsSystem: false,
	})
	if err != nil {
		logger.Log.Error("failed to create account", "user_id", userID)
		return nil, err
	}

	return toAccountResponse(account), nil
}

func (s *accountService) GetAccount(ctx context.Context, userID, accountID string) (*dtos.AccountResponse, error) {
	uid, err := parsePgtypeUUID(accountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

	account, err := s.store.GetAccount(ctx, uid)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	if !account.IsActive {
		return nil, ErrAccountDeactivated
	}

	return toAccountResponse(account), nil
}

func (s *accountService) ListAccounts(ctx context.Context, userID string) ([]dtos.AccountResponse, error) {
	ownerID, err := parsePgtypeUUID(userID)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	accounts, err := s.store.ListAccountsByOwner(ctx, ownerID)
	if err != nil {
		logger.Log.Error("failed to list accounts", "user_id", userID)
		return nil, err
	}

	responses := make([]dtos.AccountResponse, len(accounts))
	for i, acc := range accounts {
		responses[i] = *toAccountResponse(acc)
	}

	return responses, nil
}

func (s *accountService) GetAccountBalance(ctx context.Context, userID, accountID string) (*dtos.BalanceResponse, error) {
	uid, err := parsePgtypeUUID(accountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

	// Verify ownership first
	account, err := s.store.GetAccount(ctx, uid)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	balance, err := s.store.GetAccountBalance(ctx, uid)
	if err != nil {
		return nil, err
	}

	return &dtos.BalanceResponse{
		AccountID:         accountID,
		CalculatedBalance: numericToString(balance),
	}, nil
}

func (s *accountService) DeactivateAccount(ctx context.Context, userID, accountID string) error {
	uid, err := parsePgtypeUUID(accountID)
	if err != nil {
		return errors.New("invalid account id")
	}

	account, err := s.store.GetAccount(ctx, uid)
	if err != nil {
		return ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return ErrAccountNotOwned
	}

	if !account.IsActive {
		return ErrAccountAlreadyDeactivated
	}

	err = s.store.DeactivateAccount(ctx, uid)
	if err != nil {
		return err
	}

	logger.Log.Info("account deactivated", "account_id", accountID, "user_id", userID)
	return nil
}
