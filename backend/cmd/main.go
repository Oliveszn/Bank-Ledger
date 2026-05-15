package main

import (
	"double-entry/internal/api"
	"double-entry/internal/db"
	"double-entry/internal/handler"
	"double-entry/internal/service"
	"os"

	"double-entry/internal/logger"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	_ "double-entry/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	r := gin.Default()

	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "server running",
		})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	err := r.Run(":8000")
	if err != nil {
		logger.Log.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
}
