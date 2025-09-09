import { CashTransaction } from "@/types/type";
import useSWR from "swr";

interface UseCashParams {
  currentPage: number;
  recordsPerPage: number;
  paidByFilter?: string;
  payToFilter?: string;
  typeFilter?: string;
  descriptionFilter?: string;
  amountFromFilter?: string;
  amountToFilter?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

interface CashResponse {
  cashTransactions: CashTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
  };
}

const fetcher = async (url: string): Promise<CashResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch cash transactions");
  }
  return response.json();
};

export const useCash = (params: UseCashParams) => {
  const queryParams = new URLSearchParams({
    page: params.currentPage.toString(),
    limit: params.recordsPerPage.toString(),
  });

  if (params.paidByFilter)
    queryParams.append("paidByFilter", params.paidByFilter);
  if (params.payToFilter) queryParams.append("payToFilter", params.payToFilter);
  if (params.typeFilter && params.typeFilter !== "all")
    queryParams.append("typeFilter", params.typeFilter);
  if (params.descriptionFilter)
    queryParams.append("descriptionFilter", params.descriptionFilter);
  if (params.amountFromFilter)
    queryParams.append("amountFromFilter", params.amountFromFilter);
  if (params.amountToFilter)
    queryParams.append("amountToFilter", params.amountToFilter);
  if (params.dateFrom)
    queryParams.append("dateFrom", params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append("dateTo", params.dateTo.toISOString());

  const url = `/api/transactions/cash?${queryParams.toString()}`;
  console.log("SWR URL:", url);
  console.log("Filters:", {
    paidByFilter: params.paidByFilter,
    payToFilter: params.payToFilter,
  });

  const { data, error, mutate, isLoading } = useSWR<CashResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    transactions: data?.cashTransactions || [],
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      recordsPerPage: params.recordsPerPage,
    },
    isLoading,
    error,
    mutate,
  };
};
