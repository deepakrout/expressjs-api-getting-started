import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { cacheMiddleware } from '../utils/cache';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// In-memory product store (replace with DB in production)
interface Product {
  id: string;
  name: string;
  price: number;
  createdBy: string;
}

let products: Product[] = [
  { id: '1', name: 'Widget A', price: 9.99, createdBy: 'system' },
  { id: '2', name: 'Widget B', price: 19.99, createdBy: 'system' },
];

// GET /api/products — public, cached
router.get('/', cacheMiddleware('products'), (_req, res: Response) => {
  res.json({ success: true, data: products });
});

// GET /api/products/:id — public, cached
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Product ID is required')],
  validate,
  cacheMiddleware('product'),
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const product = products.find((p) => p.id === req.params!.id);
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ success: true, data: product });
  }
);

// POST /api/products — protected
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  (req: AuthRequest, res: Response) => {
    const { name, price } = req.body as { name: string; price: number };
    const newProduct: Product = {
      id: String(products.length + 1),
      name,
      price,
      createdBy: req.user!.email,
    };
    products.push(newProduct);
    res.status(201).json({ success: true, data: newProduct });
  }
);

// PUT /api/products/:id — protected
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const index = products.findIndex((p) => p.id === req.params!.id);
    if (index === -1) return next(new AppError('Product not found', 404));
    products[index] = { ...products[index], ...req.body as Partial<Product> };
    res.json({ success: true, data: products[index] });
  }
);

// DELETE /api/products/:id — protected (admin only)
router.delete(
  '/:id',
  authenticate,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user!.role !== 'admin') return next(new AppError('Forbidden: admins only', 403));
    const index = products.findIndex((p) => p.id === req.params!.id);
    if (index === -1) return next(new AppError('Product not found', 404));
    products.splice(index, 1);
    res.json({ success: true, message: 'Product deleted' });
  }
);

export default router;
