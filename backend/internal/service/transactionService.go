package service

import (
	"context"
	"double-entry/internal/api/dtos"
	"double-entry/internal/db"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

var (
	ErrInsufficientFunds   = errors.New("insufficient funds")
	ErrSameAccount         = errors.New("cannot transfer to the same account")
	ErrCurrencyMismatch    = errors.New("account currencies do not match")
	ErrTransactionNotFound = errors.New("transaction not found")
)

type TransactionService interface {
	Deposit(ctx context.Context, userID string, dto dtos.DepositDto) (*dtos.TransactionResponse, error)
	Withdraw(ctx context.Context, userID string, dto dtos.WithdrawDto) (*dtos.TransactionResponse, error)
	Transfer(ctx context.Context, userID string, dto dtos.TransferDto) (*dtos.TransactionResponse, error)
	GetTransaction(ctx context.Context, userID, transactionID string) (*dtos.TransactionResponse, error)
	ListTransactions(ctx context.Context, userID, accountID string) ([]dtos.TransactionResponse, error)
}

type transactionService struct{ store *db.Store }

func NewTransactionService(store *db.Store) TransactionService {
	return &transactionService{store: store}
}

func (s *transactionService) Deposit(ctx context.Context, userID string, dto dtos.DepositDto) (*dtos.TransactionResponse, error) {
	logger.Log.Info("deposit attempt", "user_id", userID, "account_id", dto.AccountID)

	accountUID, err := parsePgtypeUUID(dto.AccountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

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

	amount, err := toNumeric(dto.Amount)
	if err != nil {
		return nil, errors.New("invalid amount")
	}

	// Run deposit inside a db transaction so entries + balance update are atomic
	var response *dtos.TransactionResponse
	err = s.store.ExecTx(ctx, func(q *sqlc.Queries) error {
		// 1. Create the transaction record
		tx, err := q.CreateTransaction(ctx, sqlc.CreateTransactionParams{
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
			OperationType: sqlc.OperationTypeDeposit,
		})
		if err != nil {
			return err
		}

		txUID, _ := parsePgtypeUUID(tx.ID.String())

		// 2. Credit the user account (money coming in)
		creditEntry, err := q.CreateEntry(ctx, sqlc.CreateEntryParams{
			AccountID: accountUID,
			// Debit:         pgtype.Numeric{Valid: false},
			Debit:         zeroNumeric(),
			Credit:        amount,
			TransactionID: txUID,
			OperationType: sqlc.OperationTypeDeposit,
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
		})
		if err != nil {
			return err
		}

		// 3. Update account balance
		err = q.UpdateAccountBalance(ctx, sqlc.UpdateAccountBalanceParams{
			Balance: amount,
			ID:      accountUID,
		})
		if err != nil {
			return err
		}

		response = toTransactionResponse(tx, []sqlc.Entry{creditEntry})
		return nil
	})

	if err != nil {
		logger.Log.Error("deposit failed", "user_id", userID, "account_id", dto.AccountID)
		return nil, err
	}

	logger.Log.Info("deposit successful", "user_id", userID, "account_id", dto.AccountID)
	return response, nil
}

func (s *transactionService) Withdraw(ctx context.Context, userID string, dto dtos.WithdrawDto) (*dtos.TransactionResponse, error) {
	logger.Log.Info("withdrawal attempt", "user_id", userID, "account_id", dto.AccountID)

	accountUID, err := parsePgtypeUUID(dto.AccountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

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

	amount, err := toNumeric(dto.Amount)
	if err != nil {
		return nil, errors.New("invalid amount")
	}

	// Check sufficient funds before entering db transaction
	if !hasSufficientFunds(account.Balance, amount) {
		return nil, ErrInsufficientFunds
	}

	var response *dtos.TransactionResponse
	err = s.store.ExecTx(ctx, func(q *sqlc.Queries) error {
		tx, err := q.CreateTransaction(ctx, sqlc.CreateTransactionParams{
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
			OperationType: sqlc.OperationTypeWithdrawal,
		})
		if err != nil {
			return err
		}

		txUID, _ := parsePgtypeUUID(tx.ID.String())

		// Debit the account (money going out)
		debitEntry, err := q.CreateEntry(ctx, sqlc.CreateEntryParams{
			AccountID: accountUID,
			Debit:     amount,
			// Credit:        pgtype.Numeric{Valid: false},
			Credit:        zeroNumeric(),
			TransactionID: txUID,
			OperationType: sqlc.OperationTypeWithdrawal,
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
		})
		if err != nil {
			return err
		}

		// Subtract from balance — pass negative amount
		negAmount, _ := negateNumeric(amount)
		err = q.UpdateAccountBalance(ctx, sqlc.UpdateAccountBalanceParams{
			Balance: negAmount,
			ID:      accountUID,
		})
		if err != nil {
			return err
		}

		response = toTransactionResponse(tx, []sqlc.Entry{debitEntry})
		return nil
	})

	if err != nil {
		logger.Log.Error("withdrawal failed", "user_id", userID, "account_id", dto.AccountID)
		return nil, err
	}

	logger.Log.Info("withdrawal successful", "user_id", userID, "account_id", dto.AccountID)
	return response, nil
}

func (s *transactionService) Transfer(ctx context.Context, userID string, dto dtos.TransferDto) (*dtos.TransactionResponse, error) {
	logger.Log.Info("transfer attempt", "user_id", userID, "from", dto.FromAccountID, "to", dto.ToAccountID)

	if dto.FromAccountID == dto.ToAccountID {
		return nil, ErrSameAccount
	}

	fromUID, err := parsePgtypeUUID(dto.FromAccountID)
	if err != nil {
		return nil, errors.New("invalid from_account_id")
	}

	toUID, err := parsePgtypeUUID(dto.ToAccountID)
	if err != nil {
		return nil, errors.New("invalid to_account_id")
	}

	fromAccount, err := s.store.GetAccount(ctx, fromUID)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if fromAccount.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	if !fromAccount.IsActive {
		return nil, ErrAccountDeactivated
	}

	toAccount, err := s.store.GetAccount(ctx, toUID)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if !toAccount.IsActive {
		return nil, ErrAccountDeactivated
	}

	if fromAccount.Currency != toAccount.Currency {
		return nil, ErrCurrencyMismatch
	}

	amount, err := toNumeric(dto.Amount)
	if err != nil {
		return nil, errors.New("invalid amount")
	}

	if !hasSufficientFunds(fromAccount.Balance, amount) {
		return nil, ErrInsufficientFunds
	}

	var response *dtos.TransactionResponse
	err = s.store.ExecTx(ctx, func(q *sqlc.Queries) error {
		tx, err := q.CreateTransaction(ctx, sqlc.CreateTransactionParams{
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
			OperationType: sqlc.OperationTypeTransfer,
		})
		if err != nil {
			return err
		}

		txUID, _ := parsePgtypeUUID(tx.ID.String())

		// Debit the sender
		debitEntry, err := q.CreateEntry(ctx, sqlc.CreateEntryParams{
			AccountID: fromUID,
			Debit:     amount,
			// Credit:        pgtype.Numeric{Valid: false},
			Credit:        zeroNumeric(),
			TransactionID: txUID,
			OperationType: sqlc.OperationTypeTransfer,
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
		})
		if err != nil {
			return err
		}

		// Credit the receiver
		creditEntry, err := q.CreateEntry(ctx, sqlc.CreateEntryParams{
			AccountID: toUID,
			// Debit:         pgtype.Numeric{Valid: false},
			Debit:         zeroNumeric(),
			Credit:        amount,
			TransactionID: txUID,
			OperationType: sqlc.OperationTypeTransfer,
			Description:   pgtype.Text{String: dto.Description, Valid: dto.Description != ""},
		})
		if err != nil {
			return err
		}

		// Update sender balance (subtract)
		negAmount, _ := negateNumeric(amount)
		err = q.UpdateAccountBalance(ctx, sqlc.UpdateAccountBalanceParams{
			Balance: negAmount,
			ID:      fromUID,
		})
		if err != nil {
			return err
		}

		// Update receiver balance (add)
		err = q.UpdateAccountBalance(ctx, sqlc.UpdateAccountBalanceParams{
			Balance: amount,
			ID:      toUID,
		})
		if err != nil {
			return err
		}

		response = toTransactionResponse(tx, []sqlc.Entry{debitEntry, creditEntry})
		return nil
	})

	if err != nil {
		logger.Log.Error("transfer failed", "from", dto.FromAccountID, "to", dto.ToAccountID)
		return nil, err
	}

	logger.Log.Info("transfer successful", "from", dto.FromAccountID, "to", dto.ToAccountID)
	return response, nil
}

func (s *transactionService) GetTransaction(ctx context.Context, userID, transactionID string) (*dtos.TransactionResponse, error) {
	txUID, err := parsePgtypeUUID(transactionID)
	if err != nil {
		return nil, errors.New("invalid transaction id")
	}

	tx, err := s.store.GetTransaction(ctx, txUID)
	if err != nil {
		return nil, ErrTransactionNotFound
	}

	entries, err := s.store.ListEntriesByTransaction(ctx, txUID)
	if err != nil {
		return nil, err
	}

	return toTransactionResponse(tx, entries), nil
}

func (s *transactionService) ListTransactions(ctx context.Context, userID, accountID string) ([]dtos.TransactionResponse, error) {
	accountUID, err := parsePgtypeUUID(accountID)
	if err != nil {
		return nil, errors.New("invalid account id")
	}

	account, err := s.store.GetAccount(ctx, accountUID)
	if err != nil {
		return nil, ErrAccountNotFound
	}

	if account.OwnerID.String() != userID {
		return nil, ErrAccountNotOwned
	}

	transactions, err := s.store.ListTransactionsByAccount(ctx, accountUID)
	if err != nil {
		return nil, err
	}

	responses := make([]dtos.TransactionResponse, len(transactions))
	for i, tx := range transactions {
		entries, err := s.store.ListEntriesByTransaction(ctx, tx.ID)
		if err != nil {
			return nil, err
		}
		responses[i] = *toTransactionResponse(tx, entries)
	}

	return responses, nil
}
