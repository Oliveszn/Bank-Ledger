package dtos

type CreateAccountDto struct {
	Name     string `json:"name" binding:"required" example:"Savings Account"`
	Currency string `json:"currency" binding:"required,len=3" example:"USD"`
}

type CreateAccountResponse struct {
	Success bool            `json:"success"`
	Status  int             `json:"status"`
	Message string          `json:"message"`
	Payload AccountResponse `json:"payload"`
}

type GetAccountResponse struct {
	Success bool            `json:"success"`
	Status  int             `json:"status"`
	Message string          `json:"message"`
	Payload AccountResponse `json:"payload"`
}

type ListAccountsResponse struct {
	Success bool              `json:"success"`
	Status  int               `json:"status"`
	Message string            `json:"message"`
	Payload []AccountResponse `json:"payload"`
}

type BalanceResponse struct {
	AccountID         string `json:"account_id"`
	CalculatedBalance string `json:"calculated_balance"`
}

type GetAccountBalanceResponse struct {
	Success bool            `json:"success"`
	Status  int             `json:"status"`
	Message string          `json:"message"`
	Payload BalanceResponse `json:"payload"`
}

type AccountResponse struct {
	ID        string `json:"id"`
	OwnerID   string `json:"owner_id"`
	Name      string `json:"name"`
	Balance   string `json:"balance"`
	Currency  string `json:"currency"`
	IsSystem  bool   `json:"is_system"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}
