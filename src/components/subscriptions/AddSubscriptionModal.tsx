import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SubscriptionSchema } from '../../lib/validators';
import { useBudgetStore } from '../../store/budgetStore';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const addSubscription = useBudgetStore((state) => state.addSubscription);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDate, setBillingDate] = useState('15');
  const [category] = useState('Subscriptions');
  const [errors, setErrors] = useState<{ name?: string; amount?: string; billingDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amount);
    const numDate = parseInt(billingDate, 10);

    const validation = SubscriptionSchema.safeParse({
      name,
      amount: isNaN(numAmount) ? 0 : numAmount,
      billingDate: numDate,
    });

    if (!validation.success) {
      const fieldErrors: { name?: string; amount?: string; billingDate?: string } = {};
      const issues = validation.error.issues || (validation.error as any).errors || [];
      for (const err of issues) {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
        if (err.path[0] === 'amount') fieldErrors.amount = err.message;
        if (err.path[0] === 'billingDate') fieldErrors.billingDate = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      addSubscription({
        name: validation.data.name,
        amount: validation.data.amount,
        billingDate: validation.data.billingDate,
        category,
        isActive: true,
      });
      setName('');
      setAmount('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Recurring Subscription"
      description="Lock monthly recurring charges to safeguard cash flow"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="sub-name" className="block text-xs font-semibold text-slate-300 mb-1">
            Service Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="sub-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. YouTube Premium, Claude Pro, Gym Pass"
            className="w-full px-3.5 py-2.5 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          {errors.name && <span className="text-xs text-red-400 mt-1 block">{errors.name}</span>}
        </div>

        <div>
          <label htmlFor="sub-amount" className="block text-xs font-semibold text-slate-300 mb-1">
            Monthly Cost (₹) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-mono">
              ₹
            </span>
            <input
              id="sub-amount"
              type="number"
              min="1"
              max="5000"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 199"
              className="w-full pl-8 pr-4 py-2.5 bg-[#0C0E17] border border-[#232840] rounded-lg text-white font-mono text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
          {errors.amount && (
            <span className="text-xs text-red-400 mt-1 block">{errors.amount}</span>
          )}
        </div>

        <div>
          <label htmlFor="sub-billing-date" className="block text-xs font-semibold text-slate-300 mb-1">
            Day of Month Charge (1–31)
          </label>
          <input
            id="sub-billing-date"
            type="number"
            min="1"
            max="31"
            required
            value={billingDate}
            onChange={(e) => setBillingDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
          />
          {errors.billingDate && (
            <span className="text-xs text-red-400 mt-1 block">{errors.billingDate}</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Subscription
          </Button>
        </div>
      </form>
    </Modal>
  );
};
