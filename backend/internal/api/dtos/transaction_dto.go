package dtos

type DepositDto struct {
	AccountID   string  `json:"account_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Description string  `json:"description"`
}

type WithdrawDto struct {
	AccountID   string  `json:"account_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Description string  `json:"description"`
}

type TransferDto struct {
	FromAccountID string  `json:"from_account_id" binding:"required"`
	ToAccountID   string  `json:"to_account_id" binding:"required"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	Description   string  `json:"description"`
}

type TransactionResponse struct {
	ID            string          `json:"id"`
	OperationType string          `json:"operation_type"`
	Description   string          `json:"description"`
	CreatedAt     string          `json:"created_at"`
	Entries       []EntryResponse `json:"entries"`
}

type EntryResponse struct {
	ID          string `json:"id"`
	AccountID   string `json:"account_id"`
	Debit       string `json:"debit"`
	Credit      string `json:"credit"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
}
