"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ActionSheet({ isOpen, onClose, title, children }: ActionSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Panel */}
      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl z-10 border-t border-gray-100 dark:border-gray-800 slide-up">
        {/* Swipe drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{title || "Amallar"}</h3>
          <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition touch-friendly text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Yopish"
            >
              <X size={18} />
            </button>
          </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[65vh] p-6 mobile-scroll">{children}</div>
      </div>
    </div>
  );
}

export default ActionSheet;
