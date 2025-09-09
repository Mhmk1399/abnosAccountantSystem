import useSWR from "swr";

interface UseTransfersParams {
  currentPage: number;
  recordsPerPage: number;
  typeFilter: string;
  bankFilter: string;
  paidByFilter: string;
  payToFilter: string;
  transferReferenceFilter: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTransfers = (params: UseTransfersParams) => {
  const searchParams = new URLSearchParams();

  searchParams.append("page", params.currentPage.toString());
  searchParams.append("limit", params.recordsPerPage.toString());

  if (params.typeFilter && params.typeFilter !== "all") {
    searchParams.append("type", params.typeFilter);
  }
  if (params.bankFilter) {
    searchParams.append("bankFilter", params.bankFilter);
  }
  if (params.paidByFilter) {
    searchParams.append("paidByFilter", params.paidByFilter);
  }
  if (params.payToFilter) {
    searchParams.append("payToFilter", params.payToFilter);
  }
  if (params.transferReferenceFilter) {
    searchParams.append("transferReference", params.transferReferenceFilter);
  }
  if (params.dateFrom) {
    searchParams.append("dateFrom", params.dateFrom.toISOString());
  }
  if (params.dateTo) {
    searchParams.append("dateTo", params.dateTo.toISOString());
  }

  const { data, error, mutate } = useSWR(
    `/api/transactions/transfer?${searchParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Prevent refetching for 1 minute
    }
  );

  return {
    transfers: data?.transferTransactions || [],
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: params.recordsPerPage,
    },
    isLoading: !error && !data,
    error,
    mutate,
  };
};
