package router

import (
	"double-entry/internal/handler"
	"double-entry/internal/middleware"

	"github.com/gin-gonic/gin"

	docs "double-entry/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func Setup(authHandler *handler.AuthHandler) *gin.Engine {
	docs.SwaggerInfo.BasePath = "/"

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "server running"})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/auth/logout", authHandler.Logout)
	}

	return r
}
