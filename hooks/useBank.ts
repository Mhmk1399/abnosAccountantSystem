import useSWR from "swr";

interface Bank {
  _id: string;
  name: string;
  description: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

interface UseBankParams {
  currentPage: number;
  recordsPerPage: number;
  nameFilter?: string;
  branchFilter?: string;
  ownerFilter?: string;
  accountNumberFilter?: string;
}

interface BankResponse {
  banks: Bank[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
  };
}

const fetcher = async (url: string): Promise<BankResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch banks");
  }
  return response.json();
};

export const useBank = (params: UseBankParams) => {
  const queryParams = new URLSearchParams({
    page: params.currentPage.toString(),
    limit: params.recordsPerPage.toString(),
  });

  if (params.nameFilter) queryParams.append("nameFilter", params.nameFilter);
  if (params.branchFilter) queryParams.append("branchFilter", params.branchFilter);
  if (params.ownerFilter) queryParams.append("ownerFilter", params.ownerFilter);
  if (params.accountNumberFilter) queryParams.append("accountNumberFilter", params.accountNumberFilter);

  const url = `/api/transactions/bank?${queryParams.toString()}`;

  const { data, error, mutate, isLoading } = useSWR<BankResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    banks: data?.banks || [],
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