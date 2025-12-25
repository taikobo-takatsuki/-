import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { Member, Expense } from '../types';
import { generateId, CURRENCIES, getCurrencySymbol } from '../utils';

interface AddExpenseModalProps {
  members: Member[];
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  members,
  currency: baseCurrency,
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);
  const [paidBy, setPaidBy] = useState(members[0]?.id || '');
  const [involvedMembers, setInvolvedMembers] = useState<string[]>(members.map(m => m.id));

  // Reset currency when modal opens or baseCurrency changes
  useEffect(() => {
    if (isOpen) {
      setCurrency(baseCurrency);
      // Don't reset other fields to allow quick consecutive entries or if accidentally closed
    }
  }, [isOpen, baseCurrency]);

  if (!isOpen) return null;

  const toggleInvolvedMember = (memberId: string) => {
    setInvolvedMembers(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAll = () => {
    setInvolvedMembers(members.map(m => m.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidBy || involvedMembers.length === 0) return;

    onAdd({
      id: generateId(),
      title,
      amount: parseFloat(amount),
      currency,
      paidBy,
      involvedMembers,
      timestamp: Date.now(),
    });

    // Reset fields for next entry
    setTitle('');
    setAmount('');
    setCurrency(baseCurrency);
    // Keep paidBy and involvedMembers as they are often same for consecutive entries
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-extrabold text-stone-800 mb-6 text-center">これいくら？</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 pl-2">なにに使った？</label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: みんなのランチ"
              className="w-full px-6 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none font-bold text-stone-800 placeholder-stone-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 pl-2">金額</label>
            <div className="flex gap-2">
               <div className="relative w-1/3">
                 <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-full px-4 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none font-bold text-stone-800 appearance-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16}/>
               </div>
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-6 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none text-xl font-bold text-stone-900 placeholder-stone-300"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 pl-2">はらった人</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group ${
                    paidBy === member.id
                      ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                      : 'bg-white text-stone-500 border-2 border-stone-100 hover:border-primary-100'
                  }`}
                >
                  <span className="truncate">{member.name}</span>
                  {paidBy === member.id && <Check size={18} className="text-primary-500" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 pl-2">
              <label className="block text-sm font-bold text-stone-500">だれの分？</label>
              {involvedMembers.length !== members.length && (
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 px-3 py-1 rounded-full transition-colors"
                >
                  全員えらぶ
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {members.map(member => {
                const isSelected = involvedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleInvolvedMember(member.id)}
                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group ${
                      isSelected
                        ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                        : 'bg-white text-stone-300 border-2 border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    <span className="truncate">{member.name}</span>
                    {isSelected && <Check size={18} className="text-primary-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth className="text-lg">
              ついか！
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};