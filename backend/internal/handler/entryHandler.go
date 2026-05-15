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

func (h *EntryHandler) ListEntries(c *gin.Context) {
	accountID, ok := parseUUID(c, "account_id")
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
