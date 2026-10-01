import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200)
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  confirmPassword: z.string().min(8).max(200)
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  description: z.string().trim().max(5000),
  categoryId: z.string().min(1),
  basePrice: z.coerce.number().min(0).max(1000000),
  compareAt: z.union([z.coerce.number().min(0).max(1000000), z.literal(''), z.null()]).optional(),
  image: z.string().trim().max(2000000).refine(v => v.startsWith('/') || v.startsWith('https://') || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v), 'Image must be a local path, HTTPS URL, or uploaded image'),
  featured: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional()
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().trim().min(6).max(30),
  addressLine1: z.string().trim().min(3).max(180),
  addressLine2: z.string().trim().max(180).optional().default(''),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(1000).optional().default(''),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(10)
  })).min(1).max(50)
});
