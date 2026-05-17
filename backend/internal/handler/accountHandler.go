package handler

import (
	"double-entry/internal/api"
	"double-entry/internal/api/dtos"
	"double-entry/internal/logger"
	"double-entry/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AccountHandler struct {
	accountSvc service.AccountService
}

func NewAccountHandler(accountSvc service.AccountService) *AccountHandler {
	return &AccountHandler{accountSvc: accountSvc}
}

// CreateAccount godoc
// @Summary      Create a new account
// @Description  Creates a new financial account for the authenticated user.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dtos.CreateAccountDto  true  "Account payload"
// @Success      201   {object}  dtos.CreateAccountResponse
// @Failure      400   {object}  dtos.StructuredResponse
// @Failure      401   {object}  dtos.StructuredResponse
// @Failure      500   {object}  dtos.StructuredResponse
// @Router       /accounts [post]
func (h *AccountHandler) CreateAccount(c *gin.Context) {
	var dto dtos.CreateAccountDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	userID := c.GetString("user_id")

	account, err := h.accountSvc.CreateAccount(c.Request.Context(), userID, dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, nil)
		return
	}

	api.Respond(c, http.StatusCreated, "Account created", account)
}

// GetAccount godoc
// @Summary      Get an account
// @Description  Retrieves a single account belonging to the authenticated user.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Account ID"
// @Success      200  {object}  dtos.GetAccountResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Failure      403  {object}  dtos.StructuredResponse
// @Failure      404  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /accounts/{id} [get]
func (h *AccountHandler) GetAccount(c *gin.Context) {
	accountID, ok := parseUUID(c, "id")
	if !ok {
		return
	}

	userID := c.GetString("user_id")

	account, err := h.accountSvc.GetAccount(c.Request.Context(), userID, accountID.String())
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound: http.StatusNotFound,
			service.ErrAccountNotOwned: http.StatusForbidden,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Account retrieved", account)
}

// ListAccounts godoc
// @Summary      List user accounts
// @Description  Retrieves all accounts belonging to the authenticated user.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dtos.ListAccountsResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /accounts [get]
func (h *AccountHandler) ListAccounts(c *gin.Context) {
	userID := c.GetString("user_id")

	accounts, err := h.accountSvc.ListAccounts(c.Request.Context(), userID)
	if err != nil {
		handleServiceError(c, logger.Log, err, nil)
		return
	}

	api.Respond(c, http.StatusOK, "Accounts retrieved", accounts)
}

// GetAccountBalance godoc
// @Summary      Get account balance
// @Description  Retrieves the current balance of a specific account.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Account ID"
// @Success      200  {object}  dtos.GetAccountBalanceResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Failure      403  {object}  dtos.StructuredResponse
// @Failure      404  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /accounts/{id}/balance [get]
func (h *AccountHandler) GetAccountBalance(c *gin.Context) {
	accountID, ok := parseUUID(c, "id")
	if !ok {
		return
	}

	userID := c.GetString("user_id")

	balance, err := h.accountSvc.GetAccountBalance(c.Request.Context(), userID, accountID.String())
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound: http.StatusNotFound,
			service.ErrAccountNotOwned: http.StatusForbidden,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Balance retrieved", balance)
}

// DeactivateAccount godoc
// @Summary      Deactivate an account
// @Description  Deactivates a user-owned account. This action is irreversible.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Account ID"
// @Success      200  {object}  dtos.StructuredResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Failure      403  {object}  dtos.StructuredResponse
// @Failure      404  {object}  dtos.StructuredResponse
// @Failure      409  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /accounts/{id}/deactivate [patch]
func (h *AccountHandler) DeactivateAccount(c *gin.Context) {
	accountID, ok := parseUUID(c, "id")
	if !ok {
		return
	}

	userID := c.GetString("user_id")

	err := h.accountSvc.DeactivateAccount(c.Request.Context(), userID, accountID.String())
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound:           http.StatusNotFound,
			service.ErrAccountNotOwned:           http.StatusForbidden,
			service.ErrAccountAlreadyDeactivated: http.StatusConflict,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Account deactivated", nil)
}
