package dtos

// RegisterUserDto represents the data needed to register a new user
// @Description Registration data for creating a new user account
type RegisterUserDto struct {
	// User's email address
	// @example john.doe@example.com
	Email string `json:"email" binding:"required" example:"john.doe@example.com"`
	// User's password (min 8 characters)
	// @example SecureP@ssw0rd
	Password string `json:"password" binding:"required" example:"SecureP@ssw0rd"`
}

// LoginUserDto represents the data needed to login a user
// @Description Login credentials for authenticating a user
type LoginUserDto struct {
	// User's email address
	// @example john.doe@example.com
	Email string `json:"email" binding:"required" example:"john.doe@example.com"`
	// User's password
	// @example SecureP@ssw0rd
	Password string `json:"password" binding:"required" example:"SecureP@ssw0rd"`
}

// RegisterResponse is returned after successful registration.
type RegisterResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Token  string `json:"token"`
}

type LoginResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Token  string `json:"token"`
}

// TokenResponse contains a signed JWT.
type TokenResponse struct {
	Token string `json:"token"`
}
