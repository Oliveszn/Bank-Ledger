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

// Deposit godoc
// @Summary      Deposit funds
// @Description  Deposits money into a user account and creates a transaction record.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dtos.DepositDto  true  "Deposit payload"
// @Success      201   {object}  dtos.DepositResponse
// @Failure      400   {object}  dtos.StructuredResponse
// @Failure      401   {object}  dtos.StructuredResponse
// @Failure      403   {object}  dtos.StructuredResponse
// @Failure      404   {object}  dtos.StructuredResponse
// @Failure      422   {object}  dtos.StructuredResponse
// @Failure      500   {object}  dtos.StructuredResponse
// @Router       /transactions/deposit [post]
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

// Withdraw godoc
// @Summary      Withdraw funds
// @Description  Withdraws money from a user account and creates a transaction record.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dtos.WithdrawDto  true  "Withdrawal payload"
// @Success      201   {object}  dtos.WithdrawResponse
// @Failure      400   {object}  dtos.StructuredResponse
// @Failure      401   {object}  dtos.StructuredResponse
// @Failure      403   {object}  dtos.StructuredResponse
// @Failure      404   {object}  dtos.StructuredResponse
// @Failure      422   {object}  dtos.StructuredResponse
// @Failure      500   {object}  dtos.StructuredResponse
// @Router       /transactions/withdraw [post]
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

// Transfer godoc
// @Summary      Transfer funds between accounts
// @Description  Transfers money from one account to another and creates a transaction record.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dtos.TransferDto  true  "Transfer payload"
// @Success      201   {object}  dtos.TransferResponse
// @Failure      400   {object}  dtos.StructuredResponse
// @Failure      401   {object}  dtos.StructuredResponse
// @Failure      403   {object}  dtos.StructuredResponse
// @Failure      404   {object}  dtos.StructuredResponse
// @Failure      422   {object}  dtos.StructuredResponse
// @Failure      500   {object}  dtos.StructuredResponse
// @Router       /transactions/transfer [post]
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

// GetTransaction godoc
// @Summary      Get a transaction
// @Description  Retrieves a single transaction by ID for the authenticated user.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Transaction ID"
// @Success      200  {object}  dtos.GetTransactionResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Failure      403  {object}  dtos.StructuredResponse
// @Failure      404  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /transactions/{id} [get]
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

// ListTransactions godoc
// @Summary      List account transactions
// @Description  Retrieves all transactions for a specific account owned by the authenticated user.
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        account_id  path      string  true  "Account ID"
// @Success      200         {object}  dtos.ListTransactionsResponse
// @Failure      400         {object}  dtos.StructuredResponse
// @Failure      401         {object}  dtos.StructuredResponse
// @Failure      403         {object}  dtos.StructuredResponse
// @Failure      404         {object}  dtos.StructuredResponse
// @Failure      500         {object}  dtos.StructuredResponse
// @Router       /accounts/{account_id}/transactions [get]
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
