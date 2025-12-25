import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './Button';
import { Member, Expense } from '../types';
import { generateId } from '../utils';

interface AddExpenseModalProps {
  members: Member[];
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  members,
  currency,
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members[0]?.id || '');
  const [involvedMembers, setInvolvedMembers] = useState<string[]>(members.map(m => m.id));

  if (!isOpen) return null;

  const toggleInvolvedMember = (memberId: string) => {
    setInvolvedMembers(prev => {
      if (prev.includes(memberId)) {
        // 最後の1人は外せないようにする（最低1人は必要）
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
      paidBy,
      involvedMembers,
      timestamp: Date.now(),
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setPaidBy(members[0]?.id || '');
    setInvolvedMembers(members.map(m => m.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-6">立替を追加</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">用途 (何に使った？)</label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ランチ代"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">金額</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                {currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
              </span>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-lg font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">支払った人</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between group ${
                    paidBy === member.id
                      ? 'bg-primary-50 text-primary-700 border-primary-200 ring-1 ring-primary-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{member.name}</span>
                  {paidBy === member.id && <Check size={16} className="text-primary-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">対象 (誰の分？)</label>
              {involvedMembers.length !== members.length && (
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  全員選択
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
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between group ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 border-primary-200 ring-1 ring-primary-200'
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{member.name}</span>
                    {isSelected && <Check size={16} className="text-primary-600" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">
              {involvedMembers.length}人を選択中 (1人あたり {amount ? Math.round(parseFloat(amount) / involvedMembers.length).toLocaleString() : 0}円)
            </p>
          </div>

          <Button type="submit" fullWidth className="mt-4">
            追加する
          </Button>
        </form>
      </div>
    </div>
  );
};
