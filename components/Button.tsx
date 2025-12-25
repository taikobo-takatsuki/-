import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "bg-primary-500 text-white shadow-lg shadow-primary-200 hover:bg-primary-600 hover:shadow-primary-300 focus:ring-primary-100",
    secondary: "bg-white text-slate-600 border-2 border-slate-100 hover:border-primary-200 hover:text-primary-600 focus:ring-slate-100",
    ghost: "bg-transparent text-slate-500 hover:bg-primary-50 hover:text-primary-600",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-100 border-2 border-transparent",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};