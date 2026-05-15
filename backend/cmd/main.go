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

	r := router.Setup(authHandler, accountHandler)

	if err := r.Run(":8000"); err != nil {
		logger.Log.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
}
