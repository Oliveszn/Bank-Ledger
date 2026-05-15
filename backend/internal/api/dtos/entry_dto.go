package dtos

type ListEntriesDto struct {
	Limit  int32 `form:"limit" binding:"required,min=1,max=100"`
	Offset int32 `form:"offset" binding:"min=0"`
}

type ReconcileDto struct {
	AccountID string  `json:"account_id" binding:"required"`
	Expected  float64 `json:"expected_balance" binding:"required,gte=0"`
}

type ReconcileResponse struct {
	AccountID         string `json:"account_id"`
	ExpectedBalance   string `json:"expected_balance"`
	CalculatedBalance string `json:"calculated_balance"`
	Reconciled        bool   `json:"reconciled"`
	Discrepancy       string `json:"discrepancy"`
}
