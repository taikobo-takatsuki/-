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
  cancelText = 'やめる',
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl shadow-stone-200/50 p-8 animate-in zoom-in-95 duration-200 border border-white/50">
        <h3 className="text-xl font-extrabold text-stone-800 mb-3 text-center tracking-tight">{title}</h3>
        <div className="text-stone-500 mb-8 text-sm leading-relaxed whitespace-pre-wrap text-center font-medium">
          {message}
        </div>
        <div className="flex flex-col gap-3">
          <Button variant={variant} onClick={onConfirm} fullWidth>
            {confirmText}
          </Button>
          <Button variant="ghost" onClick={onCancel} fullWidth>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};