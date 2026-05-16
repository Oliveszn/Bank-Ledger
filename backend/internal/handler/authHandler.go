package handler

import (
	"double-entry/internal/api"
	"double-entry/internal/api/dtos"
	"double-entry/internal/logger"
	"double-entry/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authSvc service.AuthService
}

func NewAuthHandler(
	authSvc service.AuthService,

) *AuthHandler {
	return &AuthHandler{
		authSvc: authSvc,
	}
}

// Register godoc
// @Summary      Register a new user
// @Description  Creates a new user account with the provided credentials.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dtos.RegisterUserDto true "Registration payload"
// @Success      201  {object}  dtos.RegisterResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      409  {object}  dtos.StructuredResponse
// @Failure      500  {object}  dtos.StructuredResponse
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var dto dtos.RegisterUserDto
	if !bindJSON(c, logger.Log, &dto) {
		logger.Log.Warn("invalid register payload")
		return
	}

	logger.Log.Info("register attempt",
		"email", dto.Email,
	)

	pair, err := h.authSvc.Register(
		c.Request.Context(),
		dto,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		logger.Log.Warn("register failed",
			"email", dto.Email,
			"error", err,
		)
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrUserAlreadyExists: http.StatusConflict,
			service.ErrPasswordMismatch:  http.StatusBadRequest,
		})
		return
	}

	logger.Log.Info("user registered successfully",
		"email", dto.Email,
	)

	api.Respond(c, http.StatusCreated, "Account created successfully", dtos.RegisterResponse{
		UserID: pair.UserID,
		Email:  dto.Email,
		Token:  pair.Token,
	})
}

// Login godoc
// @Summary      Authenticate a user
// @Description  Validates credentials and returns an access token + sets a refresh token cookie.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dtos.LoginUserDto true "Login payload"
// @Success      200  {object}  dtos.LoginResponse
// @Failure      400  {object}  dtos.StructuredResponse
// @Failure      401  {object} dtos.StructuredResponse
// @Failure      500  {object} dtos.StructuredResponse
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var dto dtos.LoginUserDto
	if !bindJSON(c, logger.Log, &dto) {
		return
	}

	logger.Log.Info("login attempt", "email", dto.Email)

	pair, err := h.authSvc.Login(
		c.Request.Context(),
		dto,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		logger.Log.Warn("login failed", "email", dto.Email)
		handleServiceError(c, logger.Log, err, map[error]int{
			service.ErrInvalidCredentials: http.StatusUnauthorized,
		})
		return
	}

	logger.Log.Info("login successful", "email", dto.Email)

	api.Respond(c, http.StatusOK, "Login successful", dtos.LoginResponse{
		UserID: pair.UserID,
		Email:  dto.Email,
		Token:  pair.Token,
	})
}

// Logout godoc
// @Summary      Logout current session
// @Description  Revokes the current refresh token and clears the cookie.
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  dtos.StructuredResponse
// @Failure      401  {object}  dtos.StructuredResponse
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		api.RespondError(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	err := h.authSvc.Logout(c.Request.Context(), userID.(string))
	if err != nil {
		api.RespondError(c, http.StatusInternalServerError, "logout failed")
		return
	}

	api.Respond(c, http.StatusOK, "Logged out successfully", nil)
}
