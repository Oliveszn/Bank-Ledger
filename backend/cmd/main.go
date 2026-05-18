package main

import (
	"double-entry/internal/api"
	"double-entry/internal/db"
	"double-entry/internal/handler"
	"double-entry/internal/router"
	"double-entry/internal/service"
	"os"

	"double-entry/internal/logger"

	"github.com/joho/godotenv"

	_ "double-entry/docs"
)

// @title           Double-Entry Bank Ledger API
// @version         1.0
// @description     Double-entry accounting ledger
// @host            localhost:8000
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	godotenv.Load()

	if err := api.InitTokenAuthFromEnv(); err != nil {
		logger.Log.Error("failed to init token auth",
			"error", err,
		)
	}

	databaseURL := os.Getenv("DB_URL")

	conn := db.NewDB(databaseURL)
	defer conn.Close()

	store := db.NewStore(conn)

	authSvc := service.NewAuthService(store)
	authHandler := handler.NewAuthHandler(authSvc)

	accountSvc := service.NewAccountService(store)
	accountHandler := handler.NewAccountHandler(accountSvc)

	txSvc := service.NewTransactionService(store)
	txHandler := handler.NewTransactionHandler(txSvc)

	entrySvc := service.NewEntryService(store)
	entryHandler := handler.NewEntryHandler(entrySvc)

	r := router.Setup(authHandler, accountHandler, txHandler, entryHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	if err := r.Run(":" + port); err != nil {
		logger.Log.Error("failed to start server", "error", err)
		os.Exit(1)
	}
}
