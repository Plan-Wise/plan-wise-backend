import express from 'express';
import { database } from '../config/database';

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await database.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

export { router as categoryRoutes };
