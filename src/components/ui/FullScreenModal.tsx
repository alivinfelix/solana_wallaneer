import React, { useEffect } from 'react';
import styles from '@/styles/PhoneFrame.module.css';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`absolute inset-0 z-50 bg-[#12120de6] bg-opacity-80 backdrop-blur-md ${styles.fullScreenModal} rounded-[20px]`}>
      <div className="flex flex-col h-full bg-opacity-90">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1a1a1e]">
          <h3 className="text-xl font-medium text-white">{title || 'Modal'}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-auto bg-[#12120de6] bg-opacity-90 text-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
