import express from 'express';
import { geminiService } from '../services/geminiService';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// Get AI budgeting recommendations
router.post('/recommendations/budgeting', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const recommendation = await geminiService.generateFinancialRecommendation(userId);
    
    res.json({
      message: 'Budgeting recommendation generated successfully',
      recommendation
    });
  } catch (error: any) {
    error.statusCode = 500;
    next(error);
  }
});

// Get AI spending insights
router.post('/insights/spending', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const insights = await geminiService.generateSpendingInsights(userId);
    
    res.json({
      message: 'Spending insights generated successfully',
      insights
    });
  } catch (error: any) {
    error.statusCode = 500;
    next(error);
  }
});

// Get AI goal advice
router.post('/advice/goal/:goalId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const goalId = parseInt(req.params.goalId);
    
    // Verify goal belongs to user
    const goals = await database.query('SELECT id FROM financial_goals WHERE id = ? AND user_id = ?', [goalId, userId]);
    if (goals.length === 0) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    
    const advice = await geminiService.generateGoalAdvice(userId, goalId);
    
    res.json({
      message: 'Goal advice generated successfully',
      advice
    });
  } catch (error: any) {
    error.statusCode = 500;
    next(error);
  }
});

// Get all AI recommendations for user
router.get('/recommendations', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { type, limit = 10, offset = 0, unreadOnly } = req.query;

    let query = 'SELECT * FROM ai_recommendations WHERE user_id = ?';
    const params: any[] = [userId];

    if (type) {
      query += ' AND recommendation_type = ?';
      params.push(type);
    }

    if (unreadOnly === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const recommendations = await database.query(query, params);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

// Mark recommendation as read
router.patch('/recommendations/:id/read', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const recommendationId = req.params.id;

    const result = await database.query(`
      UPDATE ai_recommendations 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `, [recommendationId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    res.json({ message: 'Recommendation marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete recommendation
router.delete('/recommendations/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const recommendationId = req.params.id;

    const result = await database.query('DELETE FROM ai_recommendations WHERE id = ? AND user_id = ?', [recommendationId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get categories for expenses/budgets
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await database.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

export { router as aiRoutes };
