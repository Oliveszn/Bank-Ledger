package main

import (
	"double-entry/internal/db"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	// if err != nil {
	// 	log.Fatal("Error loading .env file")
	// }

	databaseURL := os.Getenv("DB_URL")

	conn := db.NewDB(databaseURL)
	defer conn.Close()

	r := gin.Default()

	_ = conn

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "server running",
		})
	})

	err := r.Run(":8000")
	if err != nil {
		log.Fatal(err)
	}
}
