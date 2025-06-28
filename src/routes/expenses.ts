import express from 'express';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateExpense } from '../middleware/validation';
import { AuthRequest } from '../types';

const router = express.Router();

// Get all expenses for user
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, categoryId, limit = '50', offset = '0' } = req.query;
    
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `;
    const params: any[] = [userId];
    
    // Add date filters
    if (startDate) {
      const startDateStr = startDate as string;
      if (startDateStr && !isNaN(Date.parse(startDateStr))) {
        query += ' AND e.expense_date >= ?';
        params.push(startDateStr);
      }
    }
    
    if (endDate) {
      const endDateStr = endDate as string;
      if (endDateStr && !isNaN(Date.parse(endDateStr))) {
        query += ' AND e.expense_date <= ?';
        params.push(endDateStr);
      }
    }
    
    // Add category filter
    if (categoryId) {
      const categoryIdNum = parseInt(categoryId as string);
      if (!isNaN(categoryIdNum)) {
        query += ' AND e.category_id = ?';
        params.push(categoryIdNum);
      }
    }
    
    // Add ordering first
    query += ' ORDER BY e.expense_date DESC, e.created_at DESC';
    
    // Parse and validate limit and offset
    const limitValue = Math.max(1, Math.min(1000, parseInt(limit as string) || 50));
    const offsetValue = Math.max(0, parseInt(offset as string) || 0);
    
    // Add LIMIT and OFFSET as literal values (not parameters)
    query += ` LIMIT ${limitValue} OFFSET ${offsetValue}`;
    
    const expenses = await database.query(query, params);
    res.json(expenses);
  } catch (error) {
    console.error('Database error:', error);
    next(error);
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;

    const expenses = await database.query(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? AND e.user_id = ?
    `, [expenseId, userId]);

    if (expenses.length === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(expenses[0]);
  } catch (error) {
    next(error);
  }
});

// Create new expense
router.post('/', authenticateToken, validateExpense, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { categoryId, amount, description, expenseDate } = req.body;

    const result = await database.query(`
      INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, categoryId, amount, description, expenseDate]);

    // Update budget if exists
    const currentMonth = new Date(expenseDate).toISOString().slice(0, 7);
    await database.query(`
      UPDATE budgets 
      SET current_spent = current_spent + ?
      WHERE user_id = ? AND category_id = ? AND month_year = ?
    `, [amount, userId, categoryId, currentMonth]);

    res.status(201).json({
      message: 'Expense created successfully',
      expenseId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Update expense
router.put('/:id', authenticateToken, validateExpense, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;
    const { categoryId, amount, description, expenseDate } = req.body;

    // Get old expense data
    const oldExpenses = await database.query(`
      SELECT category_id, amount, expense_date FROM expenses WHERE id = ? AND user_id = ?
    `, [expenseId, userId]);

    if (oldExpenses.length === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const oldExpense = oldExpenses[0];

    // Update expense
    await database.query(`
      UPDATE expenses 
      SET category_id = ?, amount = ?, description = ?, expense_date = ?
      WHERE id = ? AND user_id = ?
    `, [categoryId, amount, description, expenseDate, expenseId, userId]);

    // Update budget - subtract old amount and add new amount
    const oldMonth = new Date(oldExpense.expense_date).toISOString().slice(0, 7);
    const newMonth = new Date(expenseDate).toISOString().slice(0, 7);

    if (oldMonth === newMonth && oldExpense.category_id === categoryId) {
      // Same month and category - just update the difference
      const difference = amount - oldExpense.amount;
      await database.query(`
        UPDATE budgets 
        SET current_spent = current_spent + ?
        WHERE user_id = ? AND category_id = ? AND month_year = ?
      `, [difference, userId, categoryId, newMonth]);
    } else {
      // Different month or category - subtract from old and add to new
      await database.query(`
        UPDATE budgets 
        SET current_spent = current_spent - ?
        WHERE user_id = ? AND category_id = ? AND month_year = ?
      `, [oldExpense.amount, userId, oldExpense.category_id, oldMonth]);

      await database.query(`
        UPDATE budgets 
        SET current_spent = current_spent + ?
        WHERE user_id = ? AND category_id = ? AND month_year = ?
      `, [amount, userId, categoryId, newMonth]);
    }

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;

    // Get expense data before deletion
    const expenses = await database.query(`
      SELECT category_id, amount, expense_date FROM expenses WHERE id = ? AND user_id = ?
    `, [expenseId, userId]);

    if (expenses.length === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const expense = expenses[0];

    // Delete expense
    await database.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);

    // Update budget
    const month = new Date(expense.expense_date).toISOString().slice(0, 7);
    await database.query(`
      UPDATE budgets 
      SET current_spent = current_spent - ?
      WHERE user_id = ? AND category_id = ? AND month_year = ?
    `, [expense.amount, userId, expense.category_id, month]);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get expense statistics
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    } else if (period === 'year') {
      dateFilter = 'AND e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    const [totalStats] = await database.query(`
      SELECT 
        COUNT(*) as total_expenses,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount
      FROM expenses e
      WHERE user_id = ? ${dateFilter}
    `, [userId]);

    const categoryStats = await database.query(`
      SELECT 
        c.name as category_name,
        c.color as category_color,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ? ${dateFilter}
      GROUP BY c.id, c.name, c.color
      ORDER BY total_amount DESC
    `, [userId]);

    res.json({
      summary: totalStats,
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    next(error);
  }
});

export { router as expenseRoutes };
