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

func (h *AccountHandler) ListAccounts(c *gin.Context) {
	userID := c.GetString("user_id")

	accounts, err := h.accountSvc.ListAccounts(c.Request.Context(), userID)
	if err != nil {
		handleServiceError(c, logger.Log, err, nil)
		return
	}

	api.Respond(c, http.StatusOK, "Accounts retrieved", accounts)
}

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
