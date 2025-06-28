import express from 'express';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBudget } from '../middleware/validation';
import { AuthRequest } from '../types';

const router = express.Router();

// Get all budgets for user
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { monthYear } = req.query;

    let query = `
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `;
    const params: any[] = [userId];

    if (monthYear) {
      query += ' AND b.month_year = ?';
      params.push(monthYear);
    }

    query += ' ORDER BY b.month_year DESC, c.name ASC';

    const budgets = await database.query(query, params);
    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// Get budget by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const budgets = await database.query(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.user_id = ?
    `, [budgetId, userId]);

    if (budgets.length === 0) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    res.json(budgets[0]);
  } catch (error) {
    next(error);
  }
});

// Create new budget
router.post('/', authenticateToken, validateBudget, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { categoryId, monthlyLimit, monthYear } = req.body;

    // Calculate current spent for this category and month
    const [currentSpent] = await database.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ? AND category_id = ? AND DATE_FORMAT(expense_date, '%Y-%m') = ?
    `, [userId, categoryId, monthYear]);

    const result = await database.query(`
      INSERT INTO budgets (user_id, category_id, monthly_limit, current_spent, month_year)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit)
    `, [userId, categoryId, monthlyLimit, currentSpent.total, monthYear]);

    res.status(201).json({
      message: 'Budget created successfully',
      budgetId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Update budget
router.put('/:id', authenticateToken, validateBudget, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;
    const { categoryId, monthlyLimit, monthYear } = req.body;

    const result = await database.query(`
      UPDATE budgets 
      SET category_id = ?, monthly_limit = ?, month_year = ?
      WHERE id = ? AND user_id = ?
    `, [categoryId, monthlyLimit, monthYear, budgetId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    res.json({ message: 'Budget updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete budget
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const result = await database.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [budgetId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get budget overview for current month
router.get('/overview/current', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgets = await database.query(`
      SELECT 
        b.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        CASE 
          WHEN b.monthly_limit > 0 THEN (b.current_spent / b.monthly_limit) * 100 
          ELSE 0 
        END as usage_percentage,
        (b.monthly_limit - b.current_spent) as remaining_amount
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.month_year = ?
      ORDER BY usage_percentage DESC
    `, [userId, currentMonth]);

    const [summary] = await database.query(`
      SELECT 
        COUNT(*) as total_budgets,
        COALESCE(SUM(monthly_limit), 0) as total_budget,
        COALESCE(SUM(current_spent), 0) as total_spent,
        COALESCE(SUM(monthly_limit - current_spent), 0) as total_remaining,
        COUNT(CASE WHEN current_spent > monthly_limit THEN 1 END) as exceeded_budgets
      FROM budgets
      WHERE user_id = ? AND month_year = ?
    `, [userId, currentMonth]);

    res.json({
      budgets,
      summary,
      month: currentMonth
    });
  } catch (error) {
    next(error);
  }
});

// Get categories without budgets for a specific month
router.get('/missing/:monthYear', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { monthYear } = req.params;

    const categories = await database.query(`
      SELECT c.*
      FROM categories c
      WHERE c.id NOT IN (
        SELECT category_id 
        FROM budgets 
        WHERE user_id = ? AND month_year = ?
      )
      ORDER BY c.name
    `, [userId, monthYear]);

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

export { router as budgetRoutes };
