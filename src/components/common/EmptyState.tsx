import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-slate-200/90 shadow-2xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3.5 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-heading font-extrabold text-base text-slate-800">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
