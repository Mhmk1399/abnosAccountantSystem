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

// Define the shape of the hierarchical data
export interface HierarchicalAccountGroup extends IAccountGroup {
  totalAccounts: (ITotalAccount & {
    fixedAccounts: (IFixedAccount & {
      detailedAccounts: IDetailedAccount[];
    })[];
  })[];
}

interface AccountingContextType {
  data: HierarchicalAccountGroup[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(
  undefined
);

export const useAccounting = (): AccountingContextType => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error("useAccounting must be used within an AccountingProvider");
  }
  return context;
};

interface AccountingProviderProps {
  children: ReactNode;
}

export const AccountingProvider: React.FC<AccountingProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<HierarchicalAccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, totalsRes, fixedsRes, detailedsRes] = await Promise.all(
        [
          fetch("/api/accounts/accountGroups"),
          fetch("/api/accounts/totalAccounts"),
          fetch("/api/accounts/fixedAccounts"),
          fetch("/api/accounts/detailed"),
        ]
      );

      if (!groupsRes.ok || !totalsRes.ok || !fixedsRes.ok || !detailedsRes.ok) {
        throw new Error("Failed to fetch accounting data");
      }

      const { accountGroups } = await groupsRes.json();
      const { totalAccounts } = await totalsRes.json();
      const { fixedAccounts } = await fixedsRes.json();
      const { detailedAccounts } = await detailedsRes.json();

      // Assemble the hierarchy
      const hierarchicalData = accountGroups.map((group: IAccountGroup) => {
        const filteredTotalAccounts = totalAccounts.filter(
          (total: any) =>
            total.accountGroup &&
            total.accountGroup._id.toString() === group._id.toString()
        );

        const hierarchicalTotals = filteredTotalAccounts.map((total: any) => {
          const filteredFixedAccounts = fixedAccounts.filter(
            (fixed: any) =>
              fixed.totalAccount &&
              fixed.totalAccount._id.toString() === total._id.toString()
          );

          const hierarchicalFixed = filteredFixedAccounts.map((fixed: any) => {
            // Get detailed accounts by matching IDs from the detailedAccounts array
            const filteredDetailedAccounts = detailedAccounts.filter(
              (detailed: any) =>
                fixed.detailedAccounts && 
                fixed.detailedAccounts.includes(detailed._id)
            );
            return { ...fixed, detailedAccounts: filteredDetailedAccounts };
          });

          return { ...total, fixedAccounts: hierarchicalFixed };
        });

        return { ...group, totalAccounts: hierarchicalTotals };
      });

      setData(hierarchicalData);
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

  const value = {
    data,
    loading,
    error,
    refreshData: fetchData,
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
};
