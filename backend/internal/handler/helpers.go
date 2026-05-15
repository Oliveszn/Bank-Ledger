package handler

import (
	"errors"
	"log/slog"
	"net/http"

	"double-entry/internal/api"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func bindJSON(c *gin.Context, logger *slog.Logger, dto interface{}) bool {
	if err := c.ShouldBindJSON(dto); err != nil {
		logger.Error("bind error",
			"error", err,
		)
		api.RespondError(c, http.StatusBadRequest, err.Error())
		return false
	}
	return true
}

func parseUUID(c *gin.Context, param string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(param))
	if err != nil {
		api.RespondError(c, http.StatusBadRequest, "invalid id format")
		return uuid.Nil, false
	}
	return id, true
}

func handleServiceError(c *gin.Context, logger *slog.Logger, err error, statusMap map[error]int) {
	for target, code := range statusMap {
		if errors.Is(err, target) {
			api.RespondError(c, code, err.Error())
			return
		}
	}
	if logger != nil {
		logger.Error("unhandled service error", "error", err)
	}
	api.RespondError(c, http.StatusInternalServerError, "an internal error occurred")
}
