import express from 'express';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateGoal } from '../middleware/validation';
import { AuthRequest } from '../types';

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    let query = 'SELECT * FROM financial_goals WHERE user_id = ?';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const goals = await database.query(query, params);
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

// Get goal by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const goals = await database.query(`
      SELECT * FROM financial_goals WHERE id = ? AND user_id = ?
    `, [goalId, userId]);

    if (goals.length === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json(goals[0]);
  } catch (error) {
    next(error);
  }
});

// Create new goal
router.post('/', authenticateToken, validateGoal, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { title, targetAmount, currentAmount = 0, targetDate, description } = req.body;

    const result = await database.query(`
      INSERT INTO financial_goals (user_id, title, target_amount, current_amount, target_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title, targetAmount, currentAmount, targetDate, description]);

    res.status(201).json({
      message: 'Goal created successfully',
      goalId: result.insertId
    });
  } catch (error) {
    next(error);
  }
});

// Update goal
router.put('/:id', authenticateToken, validateGoal, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { title, targetAmount, currentAmount, targetDate, description, status } = req.body;

    const result = await database.query(`
      UPDATE financial_goals 
      SET title = ?, target_amount = ?, current_amount = ?, target_date = ?, description = ?, status = ?
      WHERE id = ? AND user_id = ?
    `, [title, targetAmount, currentAmount, targetDate, description, status || 'active', goalId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ message: 'Goal updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Update goal progress
router.patch('/:id/progress', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }

    // Get current goal data
    const goals = await database.query(`
      SELECT current_amount, target_amount FROM financial_goals WHERE id = ? AND user_id = ?
    `, [goalId, userId]);

    if (goals.length === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const goal = goals[0];
    const newAmount = Number(goal.current_amount) + Number(amount);
    const targetAmount = Number(goal.target_amount);

    // Check if goal is completed
    const newStatus = newAmount >= targetAmount ? 'completed' : 'active';

    await database.query(`
      UPDATE financial_goals 
      SET current_amount = ?, status = ?
      WHERE id = ? AND user_id = ?
    `, [newAmount, newStatus, goalId, userId]);

    res.json({
      message: 'Goal progress updated successfully',
      newAmount,
      status: newStatus,
      completed: newStatus === 'completed'
    });
  } catch (error) {
    next(error);
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const result = await database.query('DELETE FROM financial_goals WHERE id = ? AND user_id = ?', [goalId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get goal statistics
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [stats] = await database.query(`
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_goals,
        COALESCE(SUM(target_amount), 0) as total_target_amount,
        COALESCE(SUM(current_amount), 0) as total_current_amount
      FROM financial_goals
      WHERE user_id = ?
    `, [userId]);

    const upcomingDeadlines = await database.query(`
      SELECT title, target_date, target_amount, current_amount
      FROM financial_goals
      WHERE user_id = ? AND status = 'active' AND target_date IS NOT NULL AND target_date >= CURDATE()
      ORDER BY target_date ASC
      LIMIT 5
    `, [userId]);

    res.json({
      summary: stats,
      upcomingDeadlines
    });
  } catch (error) {
    next(error);
  }
});

export { router as goalRoutes };
