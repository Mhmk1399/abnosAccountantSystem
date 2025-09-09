import useSWR from "swr";

const fetcher = async (
  url: string,
  headers: Record<string, string> | undefined
) => {
  const options: RequestInit = {
    method: "GET",
    headers: headers || {},
  };
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch data");
  }

  // Handle different response structures
  if (result.accountGroups) {
    return {
      data: result.accountGroups || [],
      pagination: result.pagination || null,
    };
  } else if (result.totalAccounts) {
    return {
      data: result.totalAccounts || [],
      pagination: result.pagination || null,
    };
  } else if (result.permissions) {
    return {
      data: result.permissions || [],
      pagination: result.pagination || null,
    };
  } else if (result.rollcalls) {
    return {
      data: result.rollcalls || [],
      pagination: result.pagination || null,
    };
  } else if (result.deficits) {
    return {
      data: result.deficits || [],
      pagination: result.pagination || null,
    };
  } else if (result.checks) {
    return { data: result.checks || [], pagination: result.pagination || null };
  } else if (result.inventoryReports) {
    return {
      data: result.inventoryReports || [],
      pagination: result.pagination || null,
    };
  } else if (result.inventory) {
    return {
      data: result.inventory || [],
      pagination: result.pagination || null,
    };
  } else if (result.providers) {
    return {
      data: result.providers || [],
      pagination: result.pagination || null,
    };
  } else if (result.providerReports) {
    return {
      data: result.providerReports || [],
      pagination: result.pagination || null,
    };
  } else {
    return { data: result.data || [], pagination: result.pagination || null };
  }
};

export const useTableData = (
  endpoint: string,
  headers: Record<string, string> | undefined,
  filters: Record<string, any>,
  currentPage: number,
  responseHandler?: (data: any) => any[]
) => {
  // Build URL with filters and pagination
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("page", String(currentPage));
  url.searchParams.set("limit", "10");

  const allFilters = { ...filters };
  Object.entries(allFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        const [min, max] = value;
        if (min !== undefined && min !== null && min !== "") {
          url.searchParams.set(`${key}From`, String(min));
        }
        if (max !== undefined && max !== null && max !== "") {
          url.searchParams.set(`${key}To`, String(max));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });

  const { data, error, mutate } = useSWR(
    [url.toString(), headers],
    ([url, headers]) => fetcher(url, headers),
    {
      revalidateOnFocus: false,
      refreshInterval: 20000, // Avoid duplicate requests within 2 seconds
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
    error: error
      ? error instanceof Error
        ? error.message
        : "An error occurred"
      : null,
    isLoading: !data && !error,
    mutate,
  };
};
