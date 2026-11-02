import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface ValidationBannerProps {
  errors: string[];
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-200 shadow-md backdrop-blur-sm"
    >
      <div className="flex items-start space-x-3">
        <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-rose-300 flex items-center justify-between">
            <span>Project Configuration Errors ({errors.length})</span>
            <span className="text-xs font-normal text-rose-400">
              Resolve these before generating or downloading
            </span>
          </h2>
          <ul className="mt-2 space-y-1 text-xs text-rose-200/90 list-disc list-inside">
            {errors.map((error, idx) => (
              <li key={idx} className="leading-relaxed">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
