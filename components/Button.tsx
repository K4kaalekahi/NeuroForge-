import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neuro-bg active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neuro-primary text-white hover:bg-blue-600 focus:ring-blue-500 border border-transparent",
    secondary: "bg-neuro-surface text-neuro-text hover:bg-slate-700 border border-slate-600 focus:ring-slate-500",
    accent: "bg-neuro-accent text-white hover:bg-emerald-600 focus:ring-emerald-500 border border-transparent",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 border border-transparent",
    ghost: "bg-transparent text-neuro-text hover:bg-slate-800 shadow-none",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base", // Min touch target 44px+
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;