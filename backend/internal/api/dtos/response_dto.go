package dtos

// MessageResponse contains a simple status message.
type MessageResponse struct {
	Message string `json:"message"`
}

// ErrorResponse contains an API error message.
type ErrorResponse struct {
	Error string `json:"error"`
}

// ReconcileResponse reports whether stored and computed balances match.
type ReconcileResponse struct {
	Message string `json:"message"`
	Matched bool   `json:"matched"`
}

// StructuredResponse is the standard response format for all API endpoints
// @Description Standard response format containing success status, HTTP status code, message, and optional payload
type StructuredResponse struct {
	// Whether the operation was successful
	// @example true
	Success bool `json:"success" example:"true"`
	// HTTP status code
	// @example 200
	Status int `json:"status" example:"200"`
	// Human-readable message
	// @example Operation completed successfully
	Message string `json:"message" example:"Operation completed successfully"`
	// Optional payload containing response data
	// @example {"id":1,"name":"Example Item"}
	Payload interface{} `json:"payload"`
}
