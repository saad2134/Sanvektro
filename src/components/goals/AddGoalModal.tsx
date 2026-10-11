import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GoalSchema } from '../../lib/validators';
import { useBudgetStore } from '../../store/budgetStore';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const addGoal = useBudgetStore((state) => state.addGoal);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [daysFromNow, setDaysFromNow] = useState('20');
  const [errors, setErrors] = useState<{ name?: string; targetAmount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numTarget = parseFloat(targetAmount);
    const deadline = new Date(Date.now() + parseInt(daysFromNow || '20', 10) * 86400000);

    const validation = GoalSchema.safeParse({
      name,
      targetAmount: isNaN(numTarget) ? 0 : numTarget,
      deadline,
    });

    if (!validation.success) {
      const fieldErrors: { name?: string; targetAmount?: string } = {};
      const issues = validation.error.issues || (validation.error as any).errors || [];
      for (const err of issues) {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
        if (err.path[0] === 'targetAmount') fieldErrors.targetAmount = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      addGoal({
        name: validation.data.name,
        targetAmount: validation.data.targetAmount,
        savedAmount: 0,
        deadline: validation.data.deadline,
      });
      setName('');
      setTargetAmount('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Savings Goal"
      description="Lock away funds for future milestones without disrupting your daily baseline"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="goal-name" className="block text-xs font-semibold text-slate-300 mb-1">
            Goal Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="goal-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goa Trip, New Sneakers, M3 iPad"
            className="w-full px-3.5 py-2.5 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          {errors.name && <span className="text-xs text-red-400 mt-1 block">{errors.name}</span>}
        </div>

        <div>
          <label htmlFor="goal-target" className="block text-xs font-semibold text-slate-300 mb-1">
            Target Amount (₹) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-mono">
              ₹
            </span>
            <input
              id="goal-target"
              type="number"
              min="100"
              max="10000"
              step="50"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 3500"
              className="w-full pl-8 pr-4 py-2.5 bg-[#0C0E17] border border-[#232840] rounded-lg text-white font-mono text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
          {errors.targetAmount && (
            <span className="text-xs text-red-400 mt-1 block">{errors.targetAmount}</span>
          )}
        </div>

        <div>
          <label htmlFor="goal-deadline" className="block text-xs font-semibold text-slate-300 mb-1">
            Target Timeline
          </label>
          <select
            id="goal-deadline"
            value={daysFromNow}
            onChange={(e) => setDaysFromNow(e.target.value)}
            className="w-full px-3 py-2 bg-[#0C0E17] border border-[#232840] rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="10">End of this cycle (10-20 days)</option>
            <option value="20">In 20 Days</option>
            <option value="30">Next Month Cycle (30 Days)</option>
            <option value="60">2 Months Ahead (60 Days)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
