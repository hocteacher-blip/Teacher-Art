import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Đang tải dữ liệu học tập...',
  subMessage = 'Vui lòng chờ trong giây lát',
  minHeight = 'min-h-[280px]',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${minHeight} bg-white/60 rounded-3xl border border-slate-200/60`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </div>
      <h4 className="font-heading font-bold text-sm text-slate-800 mt-4 text-center">
        {message}
      </h4>
      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 text-center">
          {subMessage}
        </p>
      )}
    </div>
  );
};
