import React from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <div className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
          {message}
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
