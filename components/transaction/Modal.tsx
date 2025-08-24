"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[70vh] mx-auto rounded-2xl shadow-lg overflow-auto animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title || "فرم"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
