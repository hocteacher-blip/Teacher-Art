import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-800',
      icon: XCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-800',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-2xl border flex items-start justify-between shadow-2xs ${config.bg} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div>
          <h5 className="font-heading font-bold text-xs sm:text-sm">{title}</h5>
          {message && (
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{message}</p>
          )}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
