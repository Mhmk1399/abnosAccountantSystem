"use client";
import React, { useState } from 'react';
import { useFiscalYear } from '@/contexts/FiscalYearContext';
import { X } from 'lucide-react';

interface FiscalYearSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FiscalYearSelectionModal: React.FC<FiscalYearSelectionModalProps> = ({ isOpen, onClose }) => {
  const { fiscalYears, setSelectedFiscalYear, loading } = useFiscalYear();
  const [selectedId, setSelectedId] = useState<string>('');

  const handleConfirm = () => {
    const fiscalYear = fiscalYears.find(fy => fy._id === selectedId);
    if (fiscalYear) {
      setSelectedFiscalYear(fiscalYear);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">انتخاب سال مالی</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          لطفاً سال مالی مورد نظر خود را انتخاب کنید:
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {fiscalYears.map((fiscalYear) => (
              <label
                key={fiscalYear._id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === fiscalYear._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="fiscalYear"
                  value={fiscalYear._id}
                  checked={selectedId === fiscalYear._id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="ml-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{fiscalYear.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(fiscalYear.startDate).toLocaleDateString('fa-IR')} - {new Date(fiscalYear.endDate).toLocaleDateString('fa-IR')}
                    {fiscalYear.isActive && (
                      <span className="mr-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        فعال
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            لغو
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            تأیید
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiscalYearSelectionModal;