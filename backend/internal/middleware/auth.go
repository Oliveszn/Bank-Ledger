package middleware

import (
	"double-entry/internal/api"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			api.RespondError(c, http.StatusUnauthorized, "authorization header is required")
			c.Abort()
			return
		}

		// Expect "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			api.RespondError(c, http.StatusUnauthorized, "authorization header format must be: Bearer <token>")
			c.Abort()
			return
		}

		tokenString := parts[1]

		token, err := api.ParseToken(tokenString)
		if err != nil || !token.Valid {
			api.RespondError(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			api.RespondError(c, http.StatusUnauthorized, "invalid token claims")
			c.Abort()
			return
		}

		userID, ok := claims["user_id"].(string)
		if !ok || userID == "" {
			api.RespondError(c, http.StatusUnauthorized, "invalid token payload")
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
