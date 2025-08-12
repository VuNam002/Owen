// components/ErrorAlert.tsx
import type { FC } from 'react';

interface ErrorAlertProps {
  error: string;
  onClose: () => void;
}

export const ErrorAlert: FC<ErrorAlertProps> = ({ error, onClose }) => {
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
      {error}
      <button
        onClick={onClose}
        className="float-right text-red-500 hover:text-red-700"
      >
        ×
      </button>
    </div>
  );
};