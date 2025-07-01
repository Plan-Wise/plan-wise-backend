# PlanWise Frontend

A modern React-based financial management application frontend built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication**: User registration, login, and OTP verification
- **Dashboard**: Overview of financial metrics and recent activity
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Budget Tracking**: Set monthly budgets and track spending
- **Financial Goals**: Create and track progress towards financial objectives
- **AI Insights**: Get personalized financial recommendations and spending analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Environment Setup

Make sure your backend server is running on `http://localhost:3000` for the API calls to work properly.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── pages/             # Page components
├── services/          # API services
├── types/             # TypeScript type definitions
└── App.tsx            # Main app component
```

## API Integration

The frontend integrates with the PlanWise backend API with the following endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/expenses/*` - Expense management
- `/api/budgets/*` - Budget management
- `/api/goals/*` - Financial goals
- `/api/categories/*` - Expense categories
- `/api/ai/*` - AI-powered insights

## Key Features

### Authentication Flow
- User registration with email verification
- Secure login with JWT tokens
- Protected routes with automatic redirection

### Dashboard
- Financial overview cards
- Recent expenses list
- Budget utilization progress
- Active goals tracking
- Quick action buttons

### Expense Management
- Add/edit/delete expenses
- Category-based organization
- Date range filtering
- Search functionality
- Responsive data table

### Budget Tracking
- Monthly budget creation
- Real-time utilization tracking
- Visual progress indicators
- Budget vs actual spending comparison

### Financial Goals
- Goal creation with target amounts and dates
- Progress tracking
- Contribution management
- Status-based filtering

### AI Insights
- Personalized budgeting recommendations
- Spending pattern analysis
- AI-powered financial advice
- Formatted insight display

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
