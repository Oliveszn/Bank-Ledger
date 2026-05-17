package handler

import (
	"double-entry/internal/api"
	"double-entry/internal/api/dtos"
	"double-entry/internal/logger"
	"double-entry/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type EntryHandler struct {
	entrySvc service.EntryService
}

func NewEntryHandler(entrySvc service.EntryService) *EntryHandler {
	return &EntryHandler{entrySvc: entrySvc}
}

// ListEntries godoc
// @Summary      List account entries
// @Description  Retrieves ledger entries for a specific account with pagination support.
// @Tags         entries
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        account_id  path      string  true  "Account ID"
// @Param        limit       query     int     true  "Number of records to return (1-100)"
// @Param        offset      query     int     true  "Pagination offset (start index)"
// @Success      200         {object}  dtos.ListEntriesResponse
// @Failure      400         {object}  dtos.StructuredResponse
// @Failure      401         {object}  dtos.StructuredResponse
// @Failure      403         {object}  dtos.StructuredResponse
// @Failure      404         {object}  dtos.StructuredResponse
// @Failure      500         {object}  dtos.StructuredResponse
// @Router       /accounts/{id}/entries [get]
func (h *EntryHandler) ListEntries(c *gin.Context) {
	accountID, ok := parseUUID(c, "id")
	if !ok {
		return
	}

	var dto dtos.ListEntriesDto
	if err := c.ShouldBindQuery(&dto); err != nil {
		api.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	entries, err := h.entrySvc.ListEntries(c.Request.Context(), userID, accountID.String(), dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound: http.StatusNotFound,
			service.ErrAccountNotOwned: http.StatusForbidden,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Entries retrieved", entries)
}

// ReconcileAccount godoc
// @Summary      Reconcile account balance
// @Description  Compares expected balance with calculated ledger balance to verify account integrity.
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      dtos.ReconcileDto  true  "Reconciliation payload"
// @Success      200   {object}  dtos.ReconcileAccountResponse
// @Failure      400   {object}  dtos.StructuredResponse
// @Failure      401   {object}  dtos.StructuredResponse
// @Failure      403   {object}  dtos.StructuredResponse
// @Failure      404   {object}  dtos.StructuredResponse
// @Failure      422   {object}  dtos.StructuredResponse
// @Failure      500   {object}  dtos.StructuredResponse
// @Router       /accounts/reconcile [post]
func (h *EntryHandler) ReconcileAccount(c *gin.Context) {
	var dto dtos.ReconcileDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	userID := c.GetString("user_id")

	result, err := h.entrySvc.ReconcileAccount(c.Request.Context(), userID, dto)
	if err != nil {
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrAccountNotFound:    http.StatusNotFound,
			service.ErrAccountNotOwned:    http.StatusForbidden,
			service.ErrAccountDeactivated: http.StatusUnprocessableEntity,
		})
		return
	}

	api.Respond(c, http.StatusOK, "Reconciliation complete", result)
}
