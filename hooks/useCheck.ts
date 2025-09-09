import { Check } from "@/types/type";
import { useMemo } from "react";
import useSWR from "swr";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

interface UseChecksParams {
  currentPage: number;
  recordsPerPage: number;
  statusFilter: string;
  typeFilter: string;
  checkNumberFilter: string;
  bankFilter: string;
  customerFilter: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("خطا در دریافت داده‌ها");
  }
  return res.json();
};

export const useChecks = ({
  currentPage,
  recordsPerPage,
  statusFilter,
  typeFilter,
  checkNumberFilter,
  bankFilter,
  customerFilter,
  dateFrom,
  dateTo,
}: UseChecksParams) => {
  // Create cache key based on filters
  const cacheKey = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: recordsPerPage.toString(),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(typeFilter !== "all" && { type: typeFilter }),
      ...(checkNumberFilter && { checkNumber: checkNumberFilter }),
      ...(bankFilter && { bankFilter }),
      ...(customerFilter && { customerFilter }),
      ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
      ...(dateTo && { dateTo: dateTo.toISOString() }),
    });
    return `/api/transactions/cheks?${params}`;
  }, [
    currentPage,
    recordsPerPage,
    statusFilter,
    typeFilter,
    checkNumberFilter,
    bankFilter,
    customerFilter,
    dateFrom,
    dateTo,
  ]);

  // Fetch checks using SWR
  const { data, error, isLoading, mutate } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Prevent refetching for 1 minute
  });

  const checks: Check[] = data?.checkTransactions || [];
  const pagination: Pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: recordsPerPage,
  };

  return { checks, pagination, isLoading, error, mutate };
};
