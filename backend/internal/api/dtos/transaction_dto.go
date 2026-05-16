package dtos

type DepositDto struct {
	AccountID   string  `json:"account_id" binding:"required" example:"acc_123"`
	Amount      float64 `json:"amount" binding:"required,gt=0" example:"2500"`
	Description string  `json:"description" example:"Salary deposit"`
}

type WithdrawDto struct {
	AccountID   string  `json:"account_id" binding:"required" example:"acc_123"`
	Amount      float64 `json:"amount" binding:"required,gt=0" example:"500"`
	Description string  `json:"description" example:"ATM withdrawal"`
}

type TransferDto struct {
	FromAccountID string  `json:"from_account_id" binding:"required" example:"acc_123"`
	ToAccountID   string  `json:"to_account_id" binding:"required" example:"acc_456"`
	Amount        float64 `json:"amount" binding:"required,gt=0" example:"1500"`
	Description   string  `json:"description" example:"rent payment"`
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

type DepositResponse struct {
	Success bool                `json:"success"`
	Status  int                 `json:"status"`
	Message string              `json:"message"`
	Payload TransactionResponse `json:"payload"`
}

type WithdrawResponse struct {
	Success bool                `json:"success"`
	Status  int                 `json:"status"`
	Message string              `json:"message"`
	Payload TransactionResponse `json:"payload"`
}

type TransferResponse struct {
	Success bool                `json:"success"`
	Status  int                 `json:"status"`
	Message string              `json:"message"`
	Payload TransactionResponse `json:"payload"`
}

type GetTransactionResponse struct {
	Success bool                `json:"success"`
	Status  int                 `json:"status"`
	Message string              `json:"message"`
	Payload TransactionResponse `json:"payload"`
}

type ListTransactionsResponse struct {
	Success bool                  `json:"success"`
	Status  int                   `json:"status"`
	Message string                `json:"message"`
	Payload []TransactionResponse `json:"payload"`
}
