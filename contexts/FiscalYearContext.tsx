"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

interface FiscalYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  taxRate: number;
}

interface FiscalYearContextType {
  selectedFiscalYear: FiscalYear | null;
  fiscalYears: FiscalYear[];
  loading: boolean;
  setSelectedFiscalYear: (fiscalYear: FiscalYear | null) => void;
  refreshFiscalYears: () => Promise<void>;
  isInitialized: boolean;
  showSelectionModal: boolean;
  setShowSelectionModal: (show: boolean) => void;
  resetFiscalYear: () => void;
}

const FiscalYearContext = createContext<FiscalYearContextType | undefined>(
  undefined
);

export const FiscalYearProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedFiscalYear, setSelectedFiscalYearState] =
    useState<FiscalYear | null>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // Load fiscal years from API
  const refreshFiscalYears = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fiscalYears");
      const data = await response.json();

      if (data.data) {
        setFiscalYears(data.data);

        // Check if fiscal year is already selected
        if (!selectedFiscalYear && data.data.length > 0) {
          const savedFiscalYearId = localStorage.getItem(
            "selectedFiscalYearId"
          );

          if (savedFiscalYearId) {
            const fiscalYearToSelect = data.data.find(
              (fy: FiscalYear) => fy._id === savedFiscalYearId
            );
            if (fiscalYearToSelect) {
              setSelectedFiscalYearState(fiscalYearToSelect);
            } else {
              // Saved fiscal year not found, show selection modal
              setShowSelectionModal(true);
            }
          } else {
            // No saved fiscal year, show selection modal
            setShowSelectionModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
      toast.error("خطا در دریافت سال‌های مالی");
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Set selected fiscal year with persistence
  const setSelectedFiscalYear = (fiscalYear: FiscalYear | null) => {
    setSelectedFiscalYearState(fiscalYear);

    if (fiscalYear) {
      localStorage.setItem("selectedFiscalYearId", fiscalYear._id);
      localStorage.setItem("selectedFiscalYear", JSON.stringify(fiscalYear));
      toast.success(`سال مالی ${fiscalYear.name} انتخاب شد`);
    } else {
      localStorage.removeItem("selectedFiscalYearId");
      localStorage.removeItem("selectedFiscalYear");
    }
  };

  // Reset fiscal year and show selection modal
  const resetFiscalYear = () => {
    setSelectedFiscalYearState(null);
    localStorage.removeItem("selectedFiscalYearId");
    localStorage.removeItem("selectedFiscalYear");
    setShowSelectionModal(true);
    toast("سال مالی حذف شد. لطفا سال مالی جدید انتخاب کنید.");
  };

  // Initialize on mount
  useEffect(() => {
    const initializeFiscalYear = () => {
      // Try to load from localStorage first
      const savedFiscalYear = localStorage.getItem("selectedFiscalYear");
      if (savedFiscalYear) {
        try {
          const parsedFiscalYear = JSON.parse(savedFiscalYear);
          setSelectedFiscalYearState(parsedFiscalYear);
        } catch (error) {
          console.error("Error parsing saved fiscal year:", error);
          localStorage.removeItem("selectedFiscalYear");
          localStorage.removeItem("selectedFiscalYearId");
        }
      }

      // Always refresh from API to get latest data
      refreshFiscalYears();
    };

    initializeFiscalYear();
  }, []);

  const value: FiscalYearContextType = {
    selectedFiscalYear,
    fiscalYears,
    loading,
    setSelectedFiscalYear,
    refreshFiscalYears,
    isInitialized,
    showSelectionModal,
    setShowSelectionModal,
    resetFiscalYear,
  };

  return (
    <FiscalYearContext.Provider value={value}>
      {children}
    </FiscalYearContext.Provider>
  );
};

export const useFiscalYear = (): FiscalYearContextType => {
  const context = useContext(FiscalYearContext);
  if (context === undefined) {
    throw new Error("useFiscalYear must be used within a FiscalYearProvider");
  }
  return context;
};
