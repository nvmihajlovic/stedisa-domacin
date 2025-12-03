"use client";

import { useState } from "react";
import { X, CalendarBlank, CurrencyCircleDollar, ClockCounterClockwise } from "phosphor-react";

interface RecurringItem {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  currency: string;
  type: 'expense' | 'income';
  recurringType: string;
  nextRecurringDate: string;
}

interface RecurringModalProps {
  item: RecurringItem;
  onSave: (updatedAmount: number, updatedDate: string) => void;
  onPostpone: (days: number) => void;
  onCancel: () => void;
  onDisableRecurring?: () => void;
}

export default function RecurringModal({ item, onSave, onPostpone, onCancel, onDisableRecurring }: RecurringModalProps) {
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [postponeDays, setPostponeDays] = useState("3");
  const [showPostponeInput, setShowPostponeInput] = useState(false);

  const handleSave = () => {
    onSave(parseFloat(amount), date);
  };

  const handlePostpone = () => {
    onPostpone(parseInt(postponeDays) || 3);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const getRecurringTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mesečno';
      case 'weekly': return 'Nedeljno';
      case 'yearly': return 'Godišnje';
      default: return type;
    }
  };

  const itemColor = item.type === 'expense' ? '#9F70FF' : '#45D38A';
  const itemGradient = item.type === 'expense' 
    ? 'linear-gradient(135deg, #9F70FF, #4C8BEA)' 
    : 'linear-gradient(135deg, #45D38A, #2ECC71)';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div 
        className="w-full max-w-md p-6 rounded-2xl relative"
        style={{background: '#242236'}}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all"
          style={{color: '#A5A4B6'}}
        >
          <X size={24} weight="bold" />
        </button>

        <div className="mb-6">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{background: `${itemColor}20`, color: itemColor}}
          >
            <ClockCounterClockwise size={14} weight="bold" />
            {getRecurringTypeLabel(item.recurringType)}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {item.type === 'expense' ? 'Ponavljajući trošak' : 'Ponavljajući prihod'}
          </h2>
          <p className="text-sm" style={{color: '#7A7A8C'}}>
            Vreme je za unos ovog {item.type === 'expense' ? 'troška' : 'prihoda'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Category & Description */}
          <div 
            className="p-4 rounded-xl"
            style={{background: '#1C1A2E', border: '1px solid #2E2B44'}}
          >
            <div className="flex items-center gap-3 mb-2">
              {item.category && (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{background: `${item.category.color}20`}}
                >
                  {item.category.icon}
                </div>
              )}
              <div>
                <p className="text-sm" style={{color: '#7A7A8C'}}>
                  {item.category?.name || 'Kategorija'}
                </p>
                <p className="font-medium text-white">{item.description}</p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Iznos *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none text-white font-semibold text-lg"
                style={{
                  background: '#1C1A2E',
                  border: `2px solid ${itemColor}40`,
                }}
              />
              <div 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                style={{color: '#7A7A8C'}}
              >
                {item.currency}
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Datum *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none text-white"
              style={{
                background: '#1C1A2E',
                border: `2px solid ${itemColor}40`,
              }}
            />
          </div>
        </div>

        {/* Postpone Section */}
        {showPostponeInput ? (
          <div className="mb-4 p-4 rounded-xl" style={{background: '#1C1A2E'}}>
            <label className="block text-sm font-medium mb-2" style={{color: '#A5A4B6'}}>
              Odloži za (dana)
            </label>
            <input
              type="number"
              min="1"
              value={postponeDays}
              onChange={(e) => setPostponeDays(e.target.value)}
              className="w-full px-4 py-2 rounded-xl outline-none text-white"
              style={{background: '#242236', border: '1px solid #2E2B44'}}
              placeholder="3"
            />
            <p className="text-xs mt-2" style={{color: '#7A7A8C'}}>
              Podrazumevano: 3 dana
            </p>
          </div>
        ) : null}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{background: itemGradient}}
          >
            Sačuvaj
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (showPostponeInput) {
                  handlePostpone();
                } else {
                  setShowPostponeInput(true);
                }
              }}
              className="py-3 rounded-xl font-semibold transition-all"
              style={{
                background: '#1C1A2E',
                border: '1px solid #2E2B44',
                color: '#A5A4B6'
              }}
            >
              {showPostponeInput ? 'Potvrdi odlaganje' : 'Odloži'}
            </button>

            <button
              onClick={onCancel}
              className="py-3 rounded-xl font-semibold transition-all"
              style={{
                background: '#1C1A2E',
                border: '1px solid #2E2B44',
                color: '#A5A4B6'
              }}
            >
              Otkaži
            </button>
          </div>

          {onDisableRecurring && (
            <button
              onClick={onDisableRecurring}
              className="w-full py-3 rounded-xl font-semibold transition-all"
              style={{
                background: '#1C1A2E',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444'
              }}
            >
              Više nije recurring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
