# Financial Management Backend API - Curl Commands

Base URL: http://localhost:3000

## Authentication Variables
Replace these with actual values when testing:
- `$AUTH_TOKEN` - JWT token received from login
- `$USER_EMAIL` - User email for testing
- `$OTP_CODE` - OTP code received via email

## 1. Health Check

### Health Check
```bash
curl -X GET "http://localhost:3000/health" \
  -H "Content-Type: application/json"
```

## 2. Authentication Endpoints

### Register User
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

### Verify OTP
```bash
curl -X POST "http://localhost:3000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

### Login
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

### Forgot Password
```bash
curl -X POST "http://localhost:3000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Reset Password
```bash
curl -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456",
    "newPassword": "NewPassword123!"
  }'
```

## 3. Categories Endpoints

### Get All Categories
```bash
curl -X GET "http://localhost:3000/api/categories" \
  -H "Content-Type: application/json"
```

## 4. Expenses Endpoints

### Get All Expenses
```bash
curl -X GET "http://localhost:3000/api/expenses" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Expenses with Filters
```bash
curl -X GET "http://localhost:3000/api/expenses?startDate=2024-01-01&endDate=2024-12-31&categoryId=1&limit=10&offset=0" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Expense by ID
```bash
curl -X GET "http://localhost:3000/api/expenses/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Create New Expense
```bash
curl -X POST "http://localhost:3000/api/expenses" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "amount": 25.99,
    "description": "Coffee and snacks",
    "expenseDate": "2024-06-28"
  }'
```

### Update Expense
```bash
curl -X PUT "http://localhost:3000/api/expenses/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "amount": 30.99,
    "description": "Coffee, snacks and tip",
    "expenseDate": "2024-06-28"
  }'
```

### Delete Expense
```bash
curl -X DELETE "http://localhost:3000/api/expenses/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Expense Statistics
```bash
curl -X GET "http://localhost:3000/api/expenses/stats/summary?period=month" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Expense Statistics (Week)
```bash
curl -X GET "http://localhost:3000/api/expenses/stats/summary?period=week" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Expense Statistics (Year)
```bash
curl -X GET "http://localhost:3000/api/expenses/stats/summary?period=year" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

## 5. Budgets Endpoints

### Get All Budgets
```bash
curl -X GET "http://localhost:3000/api/budgets" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Budgets for Specific Month
```bash
curl -X GET "http://localhost:3000/api/budgets?monthYear=2024-06" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Budget by ID
```bash
curl -X GET "http://localhost:3000/api/budgets/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Create New Budget
```bash
curl -X POST "http://localhost:3000/api/budgets" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "monthlyLimit": 500.00,
    "monthYear": "2024-06"
  }'
```

### Update Budget
```bash
curl -X PUT "http://localhost:3000/api/budgets/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "monthlyLimit": 600.00,
    "monthYear": "2024-06"
  }'
```

### Delete Budget
```bash
curl -X DELETE "http://localhost:3000/api/budgets/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Budget Overview for Current Month
```bash
curl -X GET "http://localhost:3000/api/budgets/overview/current" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Categories Without Budgets
```bash
curl -X GET "http://localhost:3000/api/budgets/missing/2024-06" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

## 6. Financial Goals Endpoints

### Get All Goals
```bash
curl -X GET "http://localhost:3000/api/goals" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Goals by Status
```bash
curl -X GET "http://localhost:3000/api/goals?status=active" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Goal by ID
```bash
curl -X GET "http://localhost:3000/api/goals/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Create New Goal
```bash
curl -X POST "http://localhost:3000/api/goals" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund",
    "targetAmount": 10000.00,
    "currentAmount": 2500.00,
    "targetDate": "2024-12-31",
    "description": "Build emergency fund for 6 months of expenses"
  }'
```

### Update Goal
```bash
curl -X PUT "http://localhost:3000/api/goals/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund - Updated",
    "targetAmount": 12000.00,
    "currentAmount": 3000.00,
    "targetDate": "2024-12-31",
    "description": "Build emergency fund for 6 months of expenses",
    "status": "active"
  }'
```

### Update Goal Progress
```bash
curl -X PATCH "http://localhost:3000/api/goals/1/progress" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00
  }'
```

### Delete Goal
```bash
curl -X DELETE "http://localhost:3000/api/goals/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Goal Statistics
```bash
curl -X GET "http://localhost:3000/api/goals/stats/summary" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

## 7. AI Recommendations Endpoints

### Get AI Budgeting Recommendations
```bash
curl -X POST "http://localhost:3000/api/ai/recommendations/budgeting" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get AI Spending Insights
```bash
curl -X POST "http://localhost:3000/api/ai/insights/spending" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get AI Goal Advice
```bash
curl -X POST "http://localhost:3000/api/ai/advice/goal/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get All AI Recommendations
```bash
curl -X GET "http://localhost:3000/api/ai/recommendations" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get AI Recommendations with Filters
```bash
curl -X GET "http://localhost:3000/api/ai/recommendations?type=budgeting&limit=5&offset=0&unreadOnly=true" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Mark Recommendation as Read
```bash
curl -X PATCH "http://localhost:3000/api/ai/recommendations/1/read" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Delete AI Recommendation
```bash
curl -X DELETE "http://localhost:3000/api/ai/recommendations/1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Categories (AI Route)
```bash
curl -X GET "http://localhost:3000/api/ai/categories" \
  -H "Content-Type: application/json"
```

## Testing Workflow

1. **Start the server**: Make sure your backend is running on port 3000
2. **Health Check**: Test the health endpoint first
3. **Register**: Create a new user account
4. **Verify OTP**: Verify the OTP sent to email
5. **Login**: Get your JWT token
6. **Replace $AUTH_TOKEN**: Use the token from login in all authenticated requests
7. **Test other endpoints**: Use the token to test protected endpoints

## Notes

- Replace `$AUTH_TOKEN` with the actual JWT token received from login
- Replace email addresses and other placeholder data with actual test data
- Some endpoints require existing data (like expense/budget/goal IDs)
- The AI endpoints may require additional configuration for the Gemini service
- Make sure to test error cases by providing invalid data or IDs
