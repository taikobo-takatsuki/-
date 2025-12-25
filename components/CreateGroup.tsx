import React, { useState } from 'react';
import { Plus, X, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Group } from '../types';
import { generateId, CURRENCIES } from '../utils';

interface CreateGroupProps {
  onCreate: (group: Group) => void;
  onCancel: () => void;
}

export const CreateGroup: React.FC<CreateGroupProps> = ({ onCreate, onCancel }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [members, setMembers] = useState<string[]>(['', '']);

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index: number) => {
    if (members.length <= 2) return;
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty names
    const validMemberNames = members.filter(m => m.trim() !== '');
    
    if (!name.trim() || validMemberNames.length < 2) return;

    const now = Date.now();
    const newGroup: Group = {
      id: generateId(),
      name: name.trim(),
      currency,
      members: validMemberNames.map(m => ({ id: generateId(), name: m.trim() })),
      expenses: [],
      createdAt: now,
      updatedAt: now,
      isCompleted: false,
    };

    onCreate(newGroup);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-stone-200/50 p-8 relative border border-white">
        <button 
          onClick={onCancel}
          className="absolute left-6 top-6 text-stone-400 hover:text-stone-600 transition-colors p-2 -ml-2 rounded-full hover:bg-stone-50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Users size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">グループをつくる</h1>
          <p className="text-stone-500 mt-2 font-medium">楽しいイベントをはじめよう！</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2 pl-2">イベント名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 京都旅行 2024"
              className="w-full px-6 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none font-bold text-stone-800 placeholder-stone-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2 pl-2">精算する通貨 (ベース)</label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none font-bold text-stone-800 appearance-none"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code} {c.symbol})</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <ArrowRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2 pl-2">メンバー</label>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={`メンバー ${index + 1}`}
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-primary-300 focus:bg-white focus:ring-0 transition-all outline-none font-medium text-stone-800 placeholder-stone-300"
                  />
                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="p-3.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMemberField}
              className="mt-4 w-full py-3 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 font-bold hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> メンバーを追加
            </button>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={!name.trim() || members.filter(m => m.trim()).length < 2}>
              はじめる！ <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};