import { GoogleGenerativeAI } from '@google/generative-ai';
import { database } from '../config/database';

interface ExpenseAnalysis {
  totalSpent: number;
  categoryBreakdown: { [key: string]: number };
  monthlySpending: { [key: string]: number };
}

interface FinancialData {
  expenses: ExpenseAnalysis;
  goals: any[];
  budgets: any[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateFinancialRecommendation(userId: number): Promise<string> {
    try {
      const financialData = await this.getUserFinancialData(userId);
      const prompt = this.buildRecommendationPrompt(financialData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendation = response.text();

      // Save recommendation to database
      await this.saveRecommendation(userId, recommendation, 'budgeting');

      return recommendation;
    } catch (error) {
      console.error('Error generating recommendation:', error);
      throw new Error('Failed to generate AI recommendation');
    }
  }

  async generateSpendingInsights(userId: number): Promise<string> {
    try {
      const financialData = await this.getUserFinancialData(userId);
      const prompt = this.buildSpendingInsightsPrompt(financialData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      await this.saveRecommendation(userId, insights, 'spending');

      return insights;
    } catch (error) {
      console.error('Error generating spending insights:', error);
      throw new Error('Failed to generate spending insights');
    }
  }

  async generateGoalAdvice(userId: number, goalId: number): Promise<string> {
    try {
      const financialData = await this.getUserFinancialData(userId);
      const goalData = await this.getGoalData(goalId);
      const prompt = this.buildGoalAdvicePrompt(financialData, goalData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const advice = response.text();

      await this.saveRecommendation(userId, advice, 'goal');

      return advice;
    } catch (error) {
      console.error('Error generating goal advice:', error);
      throw new Error('Failed to generate goal advice');
    }
  }

  private async getUserFinancialData(userId: number): Promise<FinancialData> {
    // Get expenses for last 3 months
    const expenses = await database.query(`
      SELECT e.amount, e.expense_date, c.name as category_name
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ? AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      ORDER BY e.expense_date DESC
    `, [userId]);

    // Get active goals
    const goals = await database.query(`
      SELECT title, target_amount, current_amount, target_date, description
      FROM financial_goals
      WHERE user_id = ? AND status = 'active'
    `, [userId]);

    // Get current month budgets
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgets = await database.query(`
      SELECT b.monthly_limit, b.current_spent, c.name as category_name
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.month_year = ?
    `, [userId, currentMonth]);

    return this.processFinancialData(expenses, goals, budgets);
  }

  private processFinancialData(expenses: any[], goals: any[], budgets: any[]): FinancialData {
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const categoryBreakdown: { [key: string]: number } = {};
    const monthlySpending: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const category = expense.category_name;
      const month = expense.expense_date.toISOString().slice(0, 7);
      const amount = Number(expense.amount);

      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
      monthlySpending[month] = (monthlySpending[month] || 0) + amount;
    });

    return {
      expenses: {
        totalSpent,
        categoryBreakdown,
        monthlySpending
      },
      goals,
      budgets
    };
  }

  private async getGoalData(goalId: number): Promise<any> {
    const goal = await database.query(`
      SELECT title, target_amount, current_amount, target_date, description, status
      FROM financial_goals
      WHERE id = ?
    `, [goalId]);

    return goal[0] || null;
  }

  private buildRecommendationPrompt(data: FinancialData): string {
    return `
      Based on the following financial data, provide personalized budgeting recommendations:
      
      Total Spent (Last 3 months): $${data.expenses.totalSpent}
      
      Category Breakdown:
      ${Object.entries(data.expenses.categoryBreakdown)
        .map(([category, amount]) => `- ${category}: $${amount}`)
        .join('\n')}
      
      Monthly Spending Pattern:
      ${Object.entries(data.expenses.monthlySpending)
        .map(([month, amount]) => `- ${month}: $${amount}`)
        .join('\n')}
      
      Active Goals: ${data.goals.length}
      Current Budgets: ${data.budgets.length}
      
      Please provide 3-5 actionable budgeting recommendations to help improve financial health.
      Keep recommendations practical and specific.
    `;
  }

  private buildSpendingInsightsPrompt(data: FinancialData): string {
    return `
      Analyze the following spending data and provide insights:
      
      Total Spent (Last 3 months): $${data.expenses.totalSpent}
      
      Category Breakdown:
      ${Object.entries(data.expenses.categoryBreakdown)
        .map(([category, amount]) => `- ${category}: $${amount}`)
        .join('\n')}
      
      Monthly Spending Pattern:
      ${Object.entries(data.expenses.monthlySpending)
        .map(([month, amount]) => `- ${month}: $${amount}`)
        .join('\n')}
      
      Provide insights about:
      1. Spending patterns and trends
      2. Areas where spending could be optimized
      3. Notable changes in spending behavior
      4. Recommendations for better financial management
    `;
  }

  private buildGoalAdvicePrompt(financialData: FinancialData, goalData: any): string {
    if (!goalData) return 'Goal not found';

    return `
      Provide advice for achieving the following financial goal:
      
      Goal: ${goalData.title}
      Target Amount: $${goalData.target_amount}
      Current Amount: $${goalData.current_amount}
      Target Date: ${goalData.target_date ? new Date(goalData.target_date).toLocaleDateString() : 'Not set'}
      Description: ${goalData.description || 'No description'}
      
      Current Financial Context:
      - Monthly Average Spending: $${financialData.expenses.totalSpent / 3}
      - Top Spending Categories: ${Object.entries(financialData.expenses.categoryBreakdown)
        .sort(([,a], [,b]) => Number(b) - Number(a))
        .slice(0, 3)
        .map(([category, amount]) => `${category} ($${amount})`)
        .join(', ')}
      
      Provide specific advice on:
      1. How much to save monthly to reach this goal
      2. Areas to cut spending to free up money for this goal
      3. Timeline adjustments if needed
      4. Strategies to stay motivated
    `;
  }

  private async saveRecommendation(userId: number, recommendation: string, type: string): Promise<void> {
    await database.query(`
      INSERT INTO ai_recommendations (user_id, recommendation_text, recommendation_type)
      VALUES (?, ?, ?)
    `, [userId, recommendation, type]);
  }
}

export const geminiService = new GeminiService();