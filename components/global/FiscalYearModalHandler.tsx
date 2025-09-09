"use client";
import React from 'react';
import { useFiscalYear } from '@/contexts/FiscalYearContext';
import FiscalYearSelectionModal from './FiscalYearSelectionModal';

const FiscalYearModalHandler: React.FC = () => {
  const { showSelectionModal, setShowSelectionModal } = useFiscalYear();

  return (
    <FiscalYearSelectionModal
      isOpen={showSelectionModal}
      onClose={() => setShowSelectionModal(false)}
    />
  );
};

export default FiscalYearModalHandler;