import React, { useState } from 'react';
import type { Transaction, ExpenseCategory } from '../types/finance';
import { Receipt, Trash2, Plus, Search } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  currentDay: number;
  onDeleteTransaction: (id: string) => void;
  onAddManualTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  currentDay,
  onDeleteTransaction,
  onAddManualTransaction
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(200);
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');

  // Filter transactions up to currentDay
  const activeTxs = transactions.filter(tx => tx.day <= currentDay);

  const filtered = activeTxs.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || tx.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    onAddManualTransaction({
      title: title.trim(),
      amount,
      category,
      day: currentDay
    });
    setTitle('');
    setShowAddModal(false);
  };

  const getCatBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Food & Dining': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Entertainment & Social': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Transit & Commute': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'Shopping & Quick-Commerce': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Health & Emergency': return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section 
      id="transaction-ledger-section"
      className="rounded-2xl bg-[#0d121e] border border-slate-800/80 p-5 shadow-xl transition-all"
      aria-label="Transaction Ledger"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Transaction Ledger & Realized Spends
          </h2>
          <p className="text-xs text-slate-400">
            Recorded expenses up to Day {currentDay} ({filtered.length} entries)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          id="btn-add-ledger-entry"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Spend</span>
        </button>
      </div>

      {/* Add spend form */}
      {showAddModal && (
        <form onSubmit={handleAddSubmit} className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Expense title"
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            required
          />
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="Amount (₹)"
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            required
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
            className="bg-[#07090e] border border-slate-700 rounded-lg px-2 py-1.5 text-white"
          >
            <option value="Food & Dining">Food & Dining</option>
            <option value="Entertainment & Social">Entertainment & Social</option>
            <option value="Transit & Commute">Transit & Commute</option>
            <option value="Shopping & Quick-Commerce">Shopping & Quick-Commerce</option>
            <option value="Academic & Tech">Academic & Tech</option>
            <option value="Health & Emergency">Health & Emergency</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg py-1.5"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="bg-slate-800 text-slate-400 rounded-lg px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          className="w-full sm:w-auto bg-[#07090e] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-700"
        >
          <option value="ALL">All Categories</option>
          <option value="Food & Dining">Food & Dining</option>
          <option value="Entertainment & Social">Entertainment & Social</option>
          <option value="Transit & Commute">Transit & Commute</option>
          <option value="Shopping & Quick-Commerce">Shopping & Quick-Commerce</option>
          <option value="Academic & Tech">Academic & Tech</option>
          <option value="Health & Emergency">Health & Emergency</option>
        </select>
      </div>

      {/* Transactions list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No transactions found for this period.
          </div>
        ) : (
          filtered.slice().reverse().map(tx => (
            <div
              key={tx.id}
              id={`tx-row-${tx.id}`}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                  D{tx.day}
                </span>
                <div className="min-w-0">
                  <span className="font-medium text-white truncate block">
                    {tx.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block mt-0.5 ${getCatBadgeColor(tx.category)}`}>
                    {tx.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-rose-400 text-xs">
                  -₹{tx.amount}
                </span>
                <button
                  onClick={() => onDeleteTransaction(tx.id)}
                  id={`btn-delete-tx-${tx.id}`}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
