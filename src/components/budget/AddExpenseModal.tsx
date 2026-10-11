import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExpenseCategory } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { ExpenseSchema } from '../../lib/validators';
import { useBudgetStore } from '../../store/budgetStore';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const addExpense = useBudgetStore((state) => state.addExpense);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    const numAmount = parseFloat(amount);

    const validation = ExpenseSchema.safeParse({
      amount: isNaN(numAmount) ? 0 : numAmount,
      description,
      category,
      date: new Date(),
      isRecurring: false,
    });

    if (!validation.success) {
      const fieldErrors: { amount?: string; description?: string } = {};
      const issues = validation.error.issues || (validation.error as any).errors || [];
      for (const err of issues) {
        if (err.path[0] === 'amount') fieldErrors.amount = err.message;
        if (err.path[0] === 'description') fieldErrors.description = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: validation.data.amount,
        description: validation.data.description,
        category: validation.data.category,
        date: new Date(),
        isRecurring: false,
        tags: [],
      });
      setAmount('');
      setDescription('');
      onClose();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Financial Expense"
      description="Add a transaction to deduct from your ₹10,000 monthly cycle"
    >
      <form onSubmit={handleSubmit} noValidate aria-label="Add new expense" className="space-y-4">
        {/* Amount Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="expense-amount" className="text-xs font-semibold text-slate-300">
            Amount (₹) <span aria-hidden="true">*</span>
            <span className="sr-only">, required</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-mono">
              ₹
            </span>
            <input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              min="1"
              max="10000"
              step="0.01"
              required
              aria-required="true"
              aria-describedby={`amount-hint ${errors.amount ? 'amount-error' : ''}`}
              aria-invalid={!!errors.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 450"
              className={`w-full pl-8 pr-4 py-2.5 bg-[#0C0E17] border rounded-lg text-white font-mono text-base focus:outline-none focus:border-indigo-500 transition-colors ${
                errors.amount ? 'border-red-500' : 'border-[#232840]'
              }`}
            />
          </div>
          <span id="amount-hint" className="text-[11px] text-zinc-400">
            Max ₹10,000 per expense
          </span>
          {errors.amount && (
            <span id="amount-error" role="alert" className="text-xs text-red-400">
              {errors.amount}
            </span>
          )}
        </div>

        {/* Description Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="expense-desc" className="text-xs font-semibold text-slate-300">
            Description <span aria-hidden="true">*</span>
          </label>
          <input
            id="expense-desc"
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Sushi Bento Box, Metro Smartcard Recharge"
            className={`w-full px-3.5 py-2.5 bg-[#0C0E17] border rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
              errors.description ? 'border-red-500' : 'border-[#232840]'
            }`}
          />
          {errors.description && (
            <span role="alert" className="text-xs text-red-400">
              {errors.description}
            </span>
          )}
        </div>

        {/* Category Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((cat) => {
              const meta = CATEGORIES[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-[#0C0E17] border-[#222740] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">{meta.name.split('&')[0]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};
