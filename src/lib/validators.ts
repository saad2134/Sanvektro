/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const ExpenseCategoryEnum = z.enum([
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Subscriptions',
  'Savings',
  'Other',
]);

export const ExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(10000, 'Single expense cannot exceed total budget')
    .refine((val) => Number((val * 100).toFixed(2)) % 1 === 0, {
      message: 'Max 2 decimal places',
    }),
  description: z
    .string()
    .min(1, 'Description required')
    .max(100, 'Too long')
    .regex(/^[a-zA-Z0-9\s₹\-_.,!?()]+$/, 'Invalid characters')
    .transform((s) => s.trim()),
  category: ExpenseCategoryEnum,
  date: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()).refine(
    (d) => (d as Date).getTime() <= Date.now() + 60000,
    { message: 'Cannot log future expenses' }
  ),
  isRecurring: z.boolean().default(false),
});

export const GoalSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .transform((s) => s.trim()),
  targetAmount: z
    .number()
    .positive('Target must be positive')
    .max(10000, 'Target cannot exceed ₹10,000'),
  deadline: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()).refine(
    (d) => (d as Date).getTime() > Date.now() - 60000,
    { message: 'Deadline must be in future' }
  ),
  monthlyContribution: z.number().positive().optional(),
});

export const SubscriptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name required')
    .max(50, 'Name cannot exceed 50 characters')
    .transform((s) => s.trim()),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(5000, 'Single subscription cannot exceed ₹5,000'),
  billingDate: z
    .number()
    .int('Billing date must be an integer')
    .min(1, 'Day must be between 1 and 31')
    .max(31, 'Day must be between 1 and 31'),
});

export const BudgetStateSchema = z.object({
  totalBudget: z.number().default(10000),
  startDate: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()),
  daysPassed: z.number().min(0).max(30),
  daysRemaining: z.number().min(0).max(30),
  spent: z.number().min(0),
  committed: z.number().min(0),
  savedToGoals: z.number().min(0),
  availableBalance: z.number().min(0),
  dailyAllowance: z.number().min(0),
  healthScore: z.number().min(0).max(100),
  riskLevel: z.enum(['safe', 'caution', 'danger']),
});
