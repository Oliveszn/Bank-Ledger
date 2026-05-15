package handler

import (
	"double-entry/internal/api"
	"double-entry/internal/api/dtos"
	"double-entry/internal/logger"
	"double-entry/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	txSvc service.TransactionService
}

func NewTransactionHandler(txSvc service.TransactionService) *TransactionHandler {
	return &TransactionHandler{txSvc: txSvc}
}

func (h *TransactionHandler) Deposit(c *gin.Context) {
	var dto dtos.DepositDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	userID := c.GetString("user_id")

	result, err := h.txSvc.Deposit(c.Request.Context(), userID, dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound:    http.StatusNotFound,
			service.ErrAccountNotOwned:    http.StatusForbidden,
			service.ErrAccountDeactivated: http.StatusUnprocessableEntity,
		})
		return
	}

	api.Respond(c, http.StatusCreated, "Deposit successful", result)
}

func (h *TransactionHandler) Withdraw(c *gin.Context) {
	var dto dtos.WithdrawDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	userID := c.GetString("user_id")

	result, err := h.txSvc.Withdraw(c.Request.Context(), userID, dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound:    http.StatusNotFound,
			service.ErrAccountNotOwned:    http.StatusForbidden,
			service.ErrAccountDeactivated: http.StatusUnprocessableEntity,
			service.ErrInsufficientFunds:  http.StatusUnprocessableEntity,
		})
		return
	}

	api.Respond(c, http.StatusCreated, "Withdrawal successful", result)
}

func (h *TransactionHandler) Transfer(c *gin.Context) {
	var dto dtos.TransferDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	userID := c.GetString("user_id")

	result, err := h.txSvc.Transfer(c.Request.Context(), userID, dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound:    http.StatusNotFound,
			service.ErrAccountNotOwned:    http.StatusForbidden,
			service.ErrAccountDeactivated: http.StatusUnprocessableEntity,
			service.ErrInsufficientFunds:  http.StatusUnprocessableEntity,
			service.ErrSameAccount:        http.StatusBadRequest,
			service.ErrCurrencyMismatch:   http.StatusBadRequest,
		})
		return
	}

	api.Respond(c, http.StatusCreated, "Transfer successful", result)
}

func (h *TransactionHandler) GetTransaction(c *gin.Context) {
	txID, ok := parseUUID(c, "id")
	if !ok {
		return
	}

	userID := c.GetString("user_id")

	result, err := h.txSvc.GetTransaction(c.Request.Context(), userID, txID.String())
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrTransactionNotFound: http.StatusNotFound,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Transaction retrieved", result)
}

func (h *TransactionHandler) ListTransactions(c *gin.Context) {
	accountID, ok := parseUUID(c, "account_id")
	if !ok {
		return
	}

	userID := c.GetString("user_id")

	results, err := h.txSvc.ListTransactions(c.Request.Context(), userID, accountID.String())
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound: http.StatusNotFound,
			service.ErrAccountNotOwned: http.StatusForbidden,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Transactions retrieved", results)
}
