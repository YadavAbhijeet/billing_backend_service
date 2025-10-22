#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000/api"

# Create a new customer
curl -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
  }'

# Get all customers
curl -X GET "$BASE_URL/customers"

# Get a customer by ID
curl -X GET "$BASE_URL/customers/1"

# Update a customer by ID
curl -X PUT "$BASE_URL/customers/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "0987654321"
  }'

# Delete a customer by ID
curl -X DELETE "$BASE_URL/customers/1"

# Create a new product
curl -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product A",
    "price": 100.0,
    "description": "A sample product"
  }'

# Get all products
curl -X GET "$BASE_URL/products"

# Get a product by ID
curl -X GET "$BASE_URL/products/1"

# Update a product by ID
curl -X PUT "$BASE_URL/products/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product A",
    "price": 120.0,
    "description": "An updated sample product"
  }'

# Delete a product by ID
curl -X DELETE "$BASE_URL/products/1"

# Create a new invoice template
curl -X POST "$BASE_URL/invoice-templates" \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Default Template",
    "file_name": "template.pdf",
    "preview_url": "http://example.com/template-preview",
    "is_default": true
  }'

# Get all invoice templates
curl -X GET "$BASE_URL/invoice-templates"

# Get an invoice template by ID
curl -X GET "$BASE_URL/invoice-templates/1"

# Update an invoice template by ID
curl -X PUT "$BASE_URL/invoice-templates/1" \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Updated Template",
    "file_name": "updated-template.pdf",
    "preview_url": "http://example.com/updated-template-preview",
    "is_default": false
  }'

# Delete an invoice template by ID
curl -X DELETE "$BASE_URL/invoice-templates/1"

# Create a new invoice
curl -X POST "$BASE_URL/invoices" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "invoice_date": "2025-10-11",
    "due_date": "2025-10-18",
    "total_amount": 500.0,
    "status": "Pending"
  }'

# Get all invoices
curl -X GET "$BASE_URL/invoices"

# Get an invoice by ID
curl -X GET "$BASE_URL/invoices/1"

# Update an invoice by ID
curl -X PUT "$BASE_URL/invoices/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Paid"
  }'

# Delete an invoice by ID
curl -X DELETE "$BASE_URL/invoices/1"