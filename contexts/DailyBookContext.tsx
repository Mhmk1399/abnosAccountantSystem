"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  IAccountGroup,
  ITotalAccount,
  IFixedAccount,
  IDetailedAccount,
} from "@/types/models";

// Define FiscalYear interface since it's not in types/models.ts
interface FiscalYear {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DailyBookEntry {
  accountGroup: string;
  totalAccount: string;
  fixedAccounts: string;
  amount: number;
  description: string;
  detailed1?: string;
  detailed2?: string;
  reference?: string;
  fiscalYear: string;
}

interface DailyBookDocument {
  entries: any;
  _id?: string;
  documentNumber: string;
  date: Date;
  debitEntries: DailyBookEntry[];
  creditEntries: DailyBookEntry[];
  description: string;
  createdBy: string;
  approvedBy?: string;
  status: "draft" | "posted" | "reversed" | "canceled";
  type:string
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  metadata?: {
    ipAddress: string;
    userAgent: string;
  };
}

interface DailyBookContextType {
  dailyBooks: DailyBookDocument[];
  accountGroups: IAccountGroup[];
  totalAccounts: ITotalAccount[];
  fixedAccounts: IFixedAccount[];
  detailedAccounts: IDetailedAccount[];
  fiscalYears: FiscalYear[];
  loading: boolean;
  error: string | null;
  createDailyBook: (
    dailyBook: Omit<DailyBookDocument, "_id">
  ) => Promise<DailyBookDocument>;
  updateDailyBook: (
    id: string,
    dailyBook: Partial<DailyBookDocument>
  ) => Promise<DailyBookDocument>;
  deleteDailyBook: (id: string) => Promise<void>;
  getDailyBook: (id: string) => Promise<DailyBookDocument>;
  refreshData: () => Promise<void>;
}

const DailyBookContext = createContext<DailyBookContextType | undefined>(
  undefined
);

export const useDailyBook = (): DailyBookContextType => {
  const context = useContext(DailyBookContext);
  if (!context) {
    throw new Error("useDailyBook must be used within a DailyBookProvider");
  }
  return context;
};

interface DailyBookProviderProps {
  children: ReactNode;
}

export const DailyBookProvider: React.FC<DailyBookProviderProps> = ({
  children,
}) => {
  const [dailyBooks, setDailyBooks] = useState<DailyBookDocument[]>([]);
  const [accountGroups, setAccountGroups] = useState<IAccountGroup[]>([]);
  const [totalAccounts, setTotalAccounts] = useState<ITotalAccount[]>([]);
  const [fixedAccounts, setFixedAccounts] = useState<IFixedAccount[]>([]);
  const [detailedAccounts, setDetailedAccounts] = useState<IDetailedAccount[]>(
    []
  );
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data in parallel
      const [
        dailyBooksRes,
        accountGroupsRes,
        totalAccountsRes,
        fixedAccountsRes,
        detailedAccountsRes,
        fiscalYearsRes,
      ] = await Promise.all([
        fetch("/api/dailyBook"),
        fetch("/api/accounts/accountGroups"),
        fetch("/api/accounts/totalAccounts"),
        fetch("/api/accounts/fixedAccounts"),
        fetch("/api/accounts/detailed"),
        fetch("/api/fiscalYears"),
      ]);

      // Check if all requests were successful
      if (
        !dailyBooksRes.ok ||
        !accountGroupsRes.ok ||
        !totalAccountsRes.ok ||
        !fixedAccountsRes.ok ||
        !detailedAccountsRes.ok ||
        !fiscalYearsRes.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      // Parse the responses
      const { dailyBooks } = await dailyBooksRes.json();
      const { accountGroups } = await accountGroupsRes.json();
      const { totalAccounts } = await totalAccountsRes.json();
      const { fixedAccounts } = await fixedAccountsRes.json();
      const { detailedAccounts } = await detailedAccountsRes.json();

      // Fiscal years API returns data in a different format
      const fiscalYearsData = await fiscalYearsRes.json();
      const fiscalYears = fiscalYearsData.data || [];

      console.log("Fetched fiscal years:", fiscalYears);

      // Update state with fetched data
      setDailyBooks(dailyBooks);
      setAccountGroups(accountGroups);
      setTotalAccounts(totalAccounts);
      setFixedAccounts(fixedAccounts);
      setDetailedAccounts(detailedAccounts);
      setFiscalYears(fiscalYears);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createDailyBook = async (
    dailyBook: Omit<DailyBookDocument, "_id">
  ): Promise<DailyBookDocument> => {
    try {
      const response = await fetch("/api/dailyBook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dailyBook),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create daily book");
      }

      const { dailyBook: createdDailyBook } = await response.json();
      setDailyBooks((prev) => [...prev, createdDailyBook]);
      return createdDailyBook;
    } catch (err) {
      throw err;
    }
  };

  const updateDailyBook = async (
    id: string,
    dailyBook: Partial<DailyBookDocument>
  ): Promise<DailyBookDocument> => {
    try {
      const response = await fetch("/api/dailyBook", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: id,
        },
        body: JSON.stringify(dailyBook),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update daily book");
      }

      const { dailyBook: updatedDailyBook } = await response.json();
      setDailyBooks((prev) =>
        prev.map((db) => (db._id === id ? updatedDailyBook : db))
      );
      return updatedDailyBook;
    } catch (err) {
      throw err;
    }
  };

  const deleteDailyBook = async (id: string): Promise<void> => {
    try {
      const response = await fetch("/api/dailyBook", {
        method: "DELETE",
        headers: {
          id: id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete daily book");
      }

      setDailyBooks((prev) => prev.filter((db) => db._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const getDailyBook = async (id: string): Promise<DailyBookDocument> => {
    // First check if we already have it in state
    const existingDailyBook = dailyBooks.find((db) => db._id === id);
    if (existingDailyBook) {
      return existingDailyBook;
    }

    // Otherwise fetch it
    try {
      const response = await fetch("/api/dailyBook", {
        headers: {
          id: id,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get daily book");
      }

      const { dailyBook } = await response.json();
      return dailyBook;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    dailyBooks,
    accountGroups,
    totalAccounts,
    fixedAccounts,
    detailedAccounts,
    fiscalYears,
    loading,
    error,
    createDailyBook,
    updateDailyBook,
    deleteDailyBook,
    getDailyBook,
    refreshData: fetchData,
  };

  return (
    <DailyBookContext.Provider value={value}>
      {children}
    </DailyBookContext.Provider>
  );
};
