import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải được dữ liệu hoặc thao tác bị gián đoạn. Vui lòng thử lại.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-rose-50/70 border border-rose-200 rounded-3xl p-8 sm:p-10 text-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="font-heading font-bold text-base text-rose-900">
        {title}
      </h4>
      <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}
    </div>
  );
};
