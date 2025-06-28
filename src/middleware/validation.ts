import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateExpense = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    categoryId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow('').optional(),
    expenseDate: Joi.date().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateGoal = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    targetAmount: Joi.number().positive().required(),
    currentAmount: Joi.number().min(0).default(0),
    targetDate: Joi.date().optional(),
    description: Joi.string().allow('').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateBudget = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    categoryId: Joi.number().integer().positive().required(),
    monthlyLimit: Joi.number().positive().required(),
    monthYear: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};
