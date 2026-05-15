package dtos

type CreateAccountDto struct {
	Name     string `json:"name" binding:"required"`
	Currency string `json:"currency" binding:"required,len=3"`
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

type BalanceResponse struct {
	AccountID         string `json:"account_id"`
	CalculatedBalance string `json:"calculated_balance"`
}
