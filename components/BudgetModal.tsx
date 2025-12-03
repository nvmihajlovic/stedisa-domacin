'use client';

import { useState, useEffect } from 'react';

interface Budget {
  id: string;
  categoryId: string | null;
  amount: number;
  period: string;
  groupId?: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBudget?: Budget | null;
  activeGroupId?: string | null;
  isGroupOwnerOrAdmin?: boolean;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  editingBudget,
  activeGroupId,
  isGroupOwnerOrAdmin = false,
}: BudgetModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [period, setPeriod] = useState<string>('MONTHLY');
  const [budgetType, setBudgetType] = useState<'personal' | 'group'>('personal');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const showGroupOption = activeGroupId && isGroupOwnerOrAdmin;

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editingBudget) {
        setCategoryId(editingBudget.categoryId || '');
        setAmount(editingBudget.amount.toString());
        setPeriod(editingBudget.period);
        setBudgetType(editingBudget.groupId ? 'group' : 'personal');
      } else {
        setCategoryId('');
        setAmount('');
        setPeriod('MONTHLY');
        setBudgetType('personal');
      }
      setError('');
    }
  }, [isOpen, editingBudget]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Unesite validan iznos');
        setLoading(false);
        return;
      }

      const method = editingBudget ? 'PATCH' : 'POST';
      const url = editingBudget
        ? budgetType === 'group'
          ? `/api/group/budgets/${editingBudget.id}`
          : `/api/budgets/${editingBudget.id}`
        : budgetType === 'group'
        ? '/api/group/budgets'
        : '/api/budgets';

      const body: any = {
        categoryId: categoryId || null,
        amount: numAmount,
        period,
      };

      if (budgetType === 'group' && activeGroupId) {
        body.groupId = activeGroupId;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Greška prilikom čuvanja budžeta');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
      setError('Došlo je do greške');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {editingBudget ? '✏️ Izmeni budžet' : '🎯 Novi budžet'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Budget Type Selection */}
          {showGroupOption && !editingBudget && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tip budžeta
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBudgetType('personal')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    budgetType === 'personal'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  👤 Lični
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('group')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    budgetType === 'group'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  👥 Grupni
                </button>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Kategorija (opciono - ostavi prazno za ukupni budžet)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="">🎯 Ukupni budžet</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Iznos budžeta (RSD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder="50000"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Period
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPeriod('MONTHLY')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  period === 'MONTHLY'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                📅 Mesečno
              </button>
              <button
                type="button"
                onClick={() => setPeriod('YEARLY')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  period === 'YEARLY'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                📆 Godišnje
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-2">Pregled:</div>
            <div className="text-lg font-semibold text-white">
              {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : '🎯 Ukupni budžet'}
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {amount ? `${parseFloat(amount).toLocaleString('sr-RS')} RSD` : '0 RSD'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {period === 'MONTHLY' ? '📅 Mesečno' : '📆 Godišnje'}
              {budgetType === 'group' && ' • 👥 Grupni budžet'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-slate-300 py-3 px-4 rounded-xl font-medium transition-all border border-slate-700"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Čuvam...' : editingBudget ? 'Sačuvaj izmene' : 'Kreiraj budžet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
