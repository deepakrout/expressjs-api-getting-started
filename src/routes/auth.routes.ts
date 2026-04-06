import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Simulated user store (replace with a real DB in production)
const MOCK_USERS: Record<string, { password: string; role: string }> = {
  'user@example.com': { password: 'password123', role: 'user' },
  'admin@example.com': { password: 'admin123', role: 'admin' },
};

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/login
router.post('/login', authRateLimiter, loginValidation, validate, (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = MOCK_USERS[email];

  if (!user || user.password !== password) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = signToken({ userId: email, email, role: user.role });
  res.json({ success: true, token });
});

export default router;
