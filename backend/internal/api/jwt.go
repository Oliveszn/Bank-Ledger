package api

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

// InitTokenAuthFromEnv initializes JWT auth using the JWT_SECRET environment variable.
func InitTokenAuthFromEnv() error {
	// Keep bootstrap simple: this function is called once from main().
	secret := os.Getenv("JWT_SECRET")
	return InitTokenAuth(secret)
}

// InitTokenAuth initializes JWT auth with the provided secret.
func InitTokenAuth(secret string) error {
	if secret == "" {
		return errors.New("JWT_SECRET is required")
	}
	if len(secret) < 32 {
		return errors.New("JWT_SECRET must be at least 32 characters")
	}
	jwtSecret = []byte(secret)
	return nil
}

// GenerateToken creates a signed JWT for the given user ID.
func GenerateToken(userID string) (string, error) {
	if jwtSecret == nil {
		return "", errors.New("token auth is not initialized")
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})
}
