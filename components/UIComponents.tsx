import React from 'react';

export const IOSCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

export const IOSButton: React.FC<{ onClick: () => void; label: string; variant?: 'primary' | 'secondary' | 'danger' }> = ({ onClick, label, variant = 'primary' }) => {
  const baseStyles = "w-full py-3.5 rounded-xl font-semibold text-[17px] transition-all active:scale-[0.98]";
  const variants = {
    primary: "bg-blue-500 text-white active:bg-blue-600",
    secondary: "bg-zinc-800 text-white active:bg-zinc-700",
    danger: "bg-red-500/10 text-red-500 active:bg-red-500/20"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {label}
    </button>
  );
};

export const StatItem: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-light text-white tracking-tight font-mono">{value}</span>
      {unit && <span className="text-sm text-zinc-500 font-medium">{unit}</span>}
    </div>
  </div>
);
