import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full h-full sm:h-auto max-h-full sm:max-w-lg bg-[#111322] border-0 sm:border sm:border-[#232842] rounded-none sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-scaleUp overflow-y-auto flex flex-col justify-between sm:justify-start">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4 pb-2 border-b border-[#1E2338] sm:border-0 sm:pb-0">
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
              {description && (
                <p id="modal-description" className="text-sm sm:text-xs text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-[#1C2036] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
