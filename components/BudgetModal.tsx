'use client';

import { useState, useEffect } from 'react';
import CategorySelector from '@/lib/components/CategorySelector';
import { User, Users, Target, Calendar, CalendarBlank } from 'phosphor-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="w-full max-w-lg p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative" style={{background: '#242236'}} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
          style={{color: '#A5A4B6'}}
        >
          <span className="text-2xl leading-none">×</span>
        </button>
        
        <h2 className="text-2xl font-bold mb-6" style={{color: '#FFFFFF'}}>
          {editingBudget ? 'Izmeni budžet' : 'Novi budžet'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl flex items-center gap-2" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5'}}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Budget Type Selection */}
          {showGroupOption && !editingBudget && (
            <div className="p-4 rounded-xl space-y-3" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
              <label className="block text-sm font-medium" style={{color: '#A5A4B6'}}>
                Tip budžeta
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBudgetType('personal')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    budgetType === 'personal'
                      ? 'text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                  style={budgetType === 'personal' ? {background: '#9F70FF'} : {background: 'rgba(159, 112, 255, 0.2)', border: '1px solid rgba(159, 112, 255, 0.3)'}}
                >
                  <User size={18} weight="bold" />
                  <span>Lični</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('group')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    budgetType === 'group'
                      ? 'text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                  style={budgetType === 'group' ? {background: '#9F70FF'} : {background: 'rgba(159, 112, 255, 0.2)', border: '1px solid rgba(159, 112, 255, 0.3)'}}
                >
                  <Users size={18} weight="bold" />
                  <span>Grupni</span>
                </button>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Kategorija (opciono - ostavi prazno za ukupni budžet)
            </label>
            
            {/* "Ukupni budžet" Option */}
            <button
              type="button"
              onClick={() => setCategoryId('')}
              className="w-full mb-3 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              style={categoryId === '' 
                ? {background: '#9F70FF', color: '#FFFFFF'} 
                : {background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#A5A4B6'}
              }
            >
              <Target size={20} weight="bold" />
              <span>Ukupni budžet (sve kategorije)</span>
            </button>

            {!categoryId && (
              <p className="text-xs mb-3" style={{color: '#7A7A8C'}}>Ili izaberi specifičnu kategoriju:</p>
            )}

            {/* Category Grid */}
            <CategorySelector
              categories={categories}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Iznos budžeta (RSD) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder="50000"
              className="w-full px-4 py-3 rounded-xl outline-none focus:border-[#9F70FF] transition-colors"
              style={{background: '#1C1A2E', border: '1px solid #2E2B44', color: '#fff'}}
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Period *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPeriod('MONTHLY')}
                className="flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                style={period === 'MONTHLY' 
                  ? {background: '#9F70FF', color: '#FFFFFF'} 
                  : {background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#A5A4B6'}
                }
              >
                <Calendar size={18} weight="bold" />
                <span>Mesečno</span>
              </button>
              <button
                type="button"
                onClick={() => setPeriod('YEARLY')}
                className="flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                style={period === 'YEARLY' 
                  ? {background: '#9F70FF', color: '#FFFFFF'} 
                  : {background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#A5A4B6'}
                }
              >
                <CalendarBlank size={18} weight="bold" />
                <span>Godišnje</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          {amount && (
            <div className="rounded-xl p-4" style={{background: 'rgba(159, 112, 255, 0.05)', border: '1px solid rgba(159, 112, 255, 0.15)'}}>
              <div className="text-xs font-medium mb-2" style={{color: '#A5A4B6'}}>Pregled:</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2" style={{color: '#FFFFFF'}}>
                    {selectedCategory ? (
                      <>
                        <span>{selectedCategory.icon}</span>
                        <span>{selectedCategory.name}</span>
                      </>
                    ) : (
                      <>
                        <Target size={16} weight="bold" />
                        <span>Ukupni budžet</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs mt-1 flex items-center gap-1" style={{color: '#A5A4B6'}}>
                    {period === 'MONTHLY' ? (
                      <><Calendar size={12} weight="bold" /> Mesečno</>
                    ) : (
                      <><CalendarBlank size={12} weight="bold" /> Godišnje</>
                    )}
                    {budgetType === 'group' && (
                      <><span> • </span><Users size={12} weight="bold" /> Grupni</>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{color: '#9F70FF'}}>
                    {parseFloat(amount).toLocaleString('sr-RS')}
                  </div>
                  <div className="text-xs" style={{color: '#A5A4B6'}}>RSD</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-all hover:bg-white/5"
              style={{background: 'rgba(159, 112, 255, 0.1)', border: '1px solid rgba(159, 112, 255, 0.3)', color: '#A5A4B6'}}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background: loading ? 'rgba(159, 112, 255, 0.5)' : '#9F70FF', color: '#FFFFFF'}}
            >
              {loading ? 'Čuvam...' : editingBudget ? 'Sačuvaj izmene' : 'Kreiraj budžet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
