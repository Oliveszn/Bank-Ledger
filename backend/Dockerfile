FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy project files
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

FROM alpine:latest

WORKDIR /app

# Install certificates
RUN apk add --no-cache ca-certificates

# Copy built binary
COPY --from=builder /app/server .

# Copy env file if needed
COPY .env .env

# Expose app port
EXPOSE 8000

# Run app
CMD ["./server"]