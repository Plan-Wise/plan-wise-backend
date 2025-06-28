# Financial Management Backend

A simple AI-powered financial management tool backend built with Node.js, TypeScript, Express, and MySQL.

## Features

- **User Authentication**: Register, login, email verification, password reset
- **Expense Tracking**: Add, edit, delete, and categorize expenses
- **Financial Goals**: Set and track progress towards financial goals
- **Budget Management**: Create and monitor monthly budgets
- **AI Recommendations**: Get AI-powered insights and recommendations using Google Gemini
- **Email Notifications**: OTP verification and password reset emails

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MySQL
- **AI**: Google Generative AI (Gemini)
- **Email**: Nodemailer
- **Security**: JWT, bcryptjs, helmet, cors, rate limiting

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 2. Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values.

### 3. Database Setup

1. Create a MySQL database called `financial_management`
2. Run the schema file to create tables:
   ```bash
   mysql -u your_username -p financial_management < database/schema.sql
   ```

### 4. Environment Variables

Configure the following in your `.env` file:

- **Database**: MySQL connection details
- **JWT**: Secret key for token signing
- **Email**: SMTP configuration (Gmail recommended)
- **AI**: Google Gemini API key

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Expenses
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/summary` - Get expense statistics

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `PATCH /api/goals/:id/progress` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/overview/current` - Get current month overview

### AI Features
- `POST /api/ai/recommendations/budgeting` - Get AI budgeting recommendations
- `POST /api/ai/insights/spending` - Get AI spending insights
- `POST /api/ai/advice/goal/:goalId` - Get AI goal advice
- `GET /api/ai/recommendations` - Get all AI recommendations

### Categories
- `GET /api/categories` - Get all expense categories

## API Testing

Use tools like Postman or Thunder Client to test the API endpoints. Make sure to:

1. Register a new user
2. Verify email with OTP
3. Login to get JWT token
4. Include the token in Authorization header for protected endpoints: `Bearer <token>`

## Health Check

Check if the server is running:
```
GET /health
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi

## AI Integration

The application uses Google's Gemini AI to provide:
- Personalized budgeting recommendations
- Spending pattern insights
- Goal achievement advice

Make sure to get a Gemini API key from Google AI Studio and add it to your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
