import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  otp_code?: string;
  otp_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface Expense {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  description?: string;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: Date;
}

export interface FinancialGoal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: Date;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: Date;
  updated_at: Date;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  monthly_limit: number;
  current_spent: number;
  month_year: string;
  created_at: Date;
  updated_at: Date;
}

export interface AIRecommendation {
  id: number;
  user_id: number;
  recommendation_text: string;
  recommendation_type: 'saving' | 'spending' | 'budgeting' | 'goal';
  is_read: boolean;
  created_at: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ExpenseRequest {
  categoryId: number;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface GoalRequest {
  title: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
}

export interface BudgetRequest {
  categoryId: number;
  monthlyLimit: number;
  monthYear: string; // Format: YYYY-MM
}