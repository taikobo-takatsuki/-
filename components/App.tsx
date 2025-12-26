import React, { useState, useEffect } from 'react';
import { CreateGroup } from './components/CreateGroup';
import { Dashboard } from './components/Dashboard';
import { Home } from './components/Home';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Group, Expense } from './types';
import { decodeGroupData } from './utils';

const STORAGE_KEY = 'warikan_app_data_v1';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function App() {
  const [history, setHistory] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'create' | 'dashboard'>('home');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [importConfirmGroup, setImportConfirmGroup] = useState<Group | null>(null);

  // Load from local storage on mount and check URL for shared data
  useEffect(() => {
    let initialHistory: Group[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean up old groups (> 1 year)
        const now = Date.now();
        initialHistory = (parsed.history || []).filter((g: Group) => {
          return (now - g.createdAt) < ONE_YEAR_MS;
        });
        setHistory(initialHistory);

        // Normally set active group if exists
        if (parsed.activeGroupId) {
          if (initialHistory.find((g: Group) => g.id === parsed.activeGroupId)) {
            setActiveGroupId(parsed.activeGroupId);
            setView('dashboard');
          }
        }
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }

    // Check URL parameters for shared data
    const searchParams = new URLSearchParams(window.location.search);
    const shareData = searchParams.get('share');
    if (shareData) {
      const importedGroup = decodeGroupData(shareData);
      if (importedGroup) {
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setImportConfirmGroup(importedGroup);
      }
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    const data = {
      history,
      activeGroupId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [history, activeGroupId]);

  const activeGroup = history.find(g => g.id === activeGroupId) || null;

  const handleCreateGroup = (newGroup: Group) => {
    setHistory(prev => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    setView('dashboard');
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setHistory(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleAddExpense = (expense: Expense) => {
    if (!activeGroup) return;
    const updatedGroup = {
      ...activeGroup,
      expenses: [...activeGroup.expenses, expense],
      updatedAt: Date.now()
    };
    handleUpdateGroup(updatedGroup);
  };

  const handleCompleteGroup = () => {
    if (!activeGroup) return;
    const completedGroup = {
      ...activeGroup,
      isCompleted: true,
      updatedAt: Date.now()
    };
    handleUpdateGroup(completedGroup);
    setActiveGroupId(null);
    setView('home');
  };

  const handleBackToHome = () => {
    setActiveGroupId(null);
    setView('home');
  };

  // 削除ボタンが押されたときの処理（ダイアログを表示）
  const handleDeleteRequest = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(groupId);
  };

  // 実際に削除を実行する処理
  const executeDelete = () => {
    if (deleteTargetId) {
      setHistory(prev => prev.filter(g => g.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setActiveGroupId(group.id);
    setView('dashboard');
  };

  // 共有されたグループを取り込む処理
  const handleImportConfirm = () => {
    if (importConfirmGroup) {
      // 既存の同じIDのグループがあれば上書き、なければ追加
      setHistory(prev => {
        const exists = prev.some(g => g.id === importConfirmGroup.id);
        if (exists) {
          return prev.map(g => g.id === importConfirmGroup.id ? importConfirmGroup : g);
        } else {
          return [importConfirmGroup, ...prev];
        }
      });
      setActiveGroupId(importConfirmGroup.id);
      setView('dashboard');
      setImportConfirmGroup(null);
    }
  };

  return (
    <div className="font-sans text-stone-800 antialiased selection:bg-primary-100 selection:text-primary-700">
      {view === 'home' && (
        <Home 
          history={history}
          onCreateNew={() => setView('create')}
          onSelectGroup={handleSelectGroup}
          onDeleteGroup={handleDeleteRequest}
        />
      )}
      
      {view === 'create' && (
        <CreateGroup 
          onCreate={handleCreateGroup} 
          onCancel={() => setView('home')}
        />
      )}

      {view === 'dashboard' && activeGroup && (
        <Dashboard 
          group={activeGroup} 
          onAddExpense={handleAddExpense} 
          onBack={handleBackToHome}
          onComplete={handleCompleteGroup}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="履歴を削除しますか？"
        message="この操作は取り消せません。このイベントの記録は完全に削除されます。"
        confirmText="削除する"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ConfirmDialog
        isOpen={!!importConfirmGroup}
        title="共有されたグループを開きますか？"
        message={
          <span>
            「<strong>{importConfirmGroup?.name}</strong>」のデータを受け取りました。<br/>
            リストに追加して開きますか？<br/>
            <span className="text-xs text-stone-400 block mt-2">※すでに同じグループがある場合は上書きされます。</span>
          </span>
        }
        confirmText="開く！"
        onConfirm={handleImportConfirm}
        onCancel={() => setImportConfirmGroup(null)}
      />
    </div>
  );
}