package service

import (
	"context"
	"double-entry/internal/api"
	"double-entry/internal/api/dtos"
	"double-entry/internal/db"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("Invalid email or password")
	ErrUserAlreadyExists  = errors.New("An account with this email already exists")
	ErrPasswordMismatch   = errors.New("Passwords do not match")
)

type TokenPair struct {
	UserID string
	Token  string
}

type AuthService interface {
	Register(ctx context.Context, dto dtos.RegisterUserDto, ipAddress, userAgent string) (*TokenPair, error)
	Login(ctx context.Context, dto dtos.LoginUserDto, ipAddress, userAgent string) (*TokenPair, error)
	Logout(ctx context.Context, userID string) error
}

type authService struct {
	store *db.Store
}

func NewAuthService(store *db.Store) AuthService {
	return &authService{
		store: store,
	}
}

func (s *authService) Register(ctx context.Context, dto dtos.RegisterUserDto, ipAddress, userAgent string) (*TokenPair, error) {
	logger.Log.Info("register service called", "email", dto.Email)

	hashed, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Log.Error("failed to hash password")
		return nil, err
	}

	user, err := s.store.CreateUser(ctx, sqlc.CreateUserParams{
		Email:          dto.Email,
		HashedPassword: string(hashed),
	})
	if err != nil {
		logger.Log.Error("failed to create user", "email", dto.Email)
		return nil, ErrUserAlreadyExists
	}

	token, err := api.GenerateToken(user.ID.String())
	if err != nil {
		logger.Log.Error("failed to generate token", "user_id", user.ID.String())
		return nil, err
	}

	return &TokenPair{
		UserID: user.ID.String(),
		Token:  token,
	}, nil
}

func (s *authService) Login(ctx context.Context, dto dtos.LoginUserDto, ipAddress, userAgent string) (*TokenPair, error) {
	logger.Log.Info("login service called", "email", dto.Email)

	user, err := s.store.GetUserByEmail(ctx, dto.Email)
	if err != nil {
		logger.Log.Warn("user not found", "email", dto.Email)
		return nil, ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(dto.Password))
	if err != nil {
		logger.Log.Warn("invalid password", "email", dto.Email)
		return nil, ErrInvalidCredentials
	}

	token, err := api.GenerateToken(user.ID.String())
	if err != nil {
		logger.Log.Error("failed to generate token", "user_id", user.ID.String())
		return nil, err
	}

	return &TokenPair{
		UserID: user.ID.String(),
		Token:  token,
	}, nil
}

func (s *authService) Logout(ctx context.Context, userID string) error {
	logger.Log.Info("logout", "user_id", userID)
	return nil
}
