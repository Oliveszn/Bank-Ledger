package db

import (
	"context"
	"double-entry/internal/db/sqlc"
	"double-entry/internal/logger"
	"os"

	"github.com/jackc/pgx/v5"
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

// Exectx runs a function within a db transaction so if the function returns an error the transaction is rolled back, else committed
func (s *Store) ExecTx(ctx context.Context, fn func(*sqlc.Queries) error) error {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}

	q := sqlc.New(tx)
	err = fn(q)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return rbErr
		}
		return err
	}

	return tx.Commit(ctx)
}
