# Testing the Simplified Lojas Functionality

## Manual Testing Guide

### 1. Accessing the Simplified View
1. Navigate to `/pages/lojas` 
2. Click on "Usar Versão Simplificada" button
3. You should be redirected to `/pages/lojas/simplified`

### 2. Verifying API Endpoints
You can test the new API endpoints using Postman or curl:

#### GET all lojas with summary
```bash
curl -X GET http://localhost:3000/api/lojasApi/simplified
```

Expected response structure:
```json
{
  "success": true,
  "data": {
    "total_items": 1,
    "page": 1,
    "limit": 1,
    "lojas": [
      {
        "id": "loja-id",
        "nome": "Loja Teste",
        "LUC": "LUC001",
        "localizacao": "Piso 1",
        "smart": "Sim",
        "idKron": "KRON001",
        "atuadoresSummary": {
          "total": 2,
          "operational": 1,
          "percentage": 50
        },
        "sensoresSummary": {
          "total": 3,
          "operational": 2,
          "percentage": 67
        }
      }
    ]
  }
}
```

#### POST create new loja
```bash
curl -X POST http://localhost:3000/api/lojasApi/simplified \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nova Loja",
    "LUC": "LUC002",
    "localizacao": "Piso 2",
    "smart": "Não",
    "idKron": "KRON002"
  }'
```

#### GET specific loja
```bash
curl -X GET http://localhost:3000/api/lojasApi/simplified/{loja-id}
```

#### PUT update loja
```bash
curl -X PUT http://localhost:3000/api/lojasApi/simplified/{loja-id} \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Loja Atualizada",
    "LUC": "LUC002",
    "localizacao": "Piso 3",
    "smart": "Sim",
    "idKron": "KRON003"
  }'
```

#### DELETE loja
```bash
curl -X DELETE http://localhost:3000/api/lojasApi/simplified/{loja-id}
```

### 3. Frontend Functionality Tests

#### View Toggle
- On both the advanced and simplified views, there should be a toggle button to switch between views
- The button text should change based on the current view

#### Lojas Table
- The table should display columns: Lojas, LUC, Piso, Smart, ID Kron, Status Atuadores, Status Sensores, Ações
- Status columns should show color-coded badges with percentages
- Search functionality should filter results across all columns

#### Actions
- View Details button should open a modal with detailed information
- Edit button should open a form to edit the loja
- Delete button should show a confirmation before deleting

#### Form Validation
- Creating/editing a loja should require both Nome and LUC fields
- LUC field should automatically convert to uppercase
- Form should show validation errors when required fields are missing

## Automated Testing
To set up automated testing, you would need to:

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest @types/jest node-mocks-http
   ```

2. Create test files similar to the example in `__tests__/lojas-simplified-api.test.ts` (before it was deleted)

3. Run tests with:
   ```bash
   npm test
   ```