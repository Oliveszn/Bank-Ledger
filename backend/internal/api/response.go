package api

import (
	"double-entry/internal/api/dtos"

	"github.com/gin-gonic/gin"
)

func Respond(c *gin.Context, status int, message string, payload interface{}) {
	c.JSON(status, dtos.StructuredResponse{
		Success: status < 400,
		Status:  status,
		Message: message,
		Payload: payload,
	})
}

func RespondError(c *gin.Context, status int, message string) {
	Respond(c, status, message, nil)
}
