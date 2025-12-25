import React, { useState } from 'react';
import { Plus, X, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Group } from '../types';
import { generateId } from '../utils';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <button 
          onClick={onCancel}
          className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">グループを作成</h1>
          <p className="text-slate-500 mt-2">旅行やイベントの経費を簡単に記録</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">イベント名 / グループ名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 夏旅行 2024"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">通貨</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none bg-white"
            >
              <option value="JPY">日本円 (JPY ¥)</option>
              <option value="USD">米ドル (USD $)</option>
              <option value="EUR">ユーロ (EUR €)</option>
              <option value="GBP">ポンド (GBP £)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">メンバー</label>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={`メンバー ${index + 1}`}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none"
                  />
                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={16} /> メンバーを追加
            </button>
          </div>

          <Button type="submit" fullWidth disabled={!name.trim() || members.filter(m => m.trim()).length < 2}>
            グループを作成する <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};
