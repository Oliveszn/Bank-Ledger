package db

import (
	"context"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	*sqlc.Queries
	db *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) *Store {
	return &Store{
		Queries: sqlc.New(db),
		db:      db,
	}
}

func NewDB(databaseURL string) *pgxpool.Pool {
	db, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		logger.Log.Error("failed to connect database", "error", err)
		os.Exit(1)
	}

	err = db.Ping(context.Background())
	if err != nil {
		logger.Log.Error("failed to ping database", "error", err)
		os.Exit(1)
	}

	logger.Log.Info("connected to database")

	return db
}
