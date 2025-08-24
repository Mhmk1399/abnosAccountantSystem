import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { ProviderReportData, ProviderTableData } from "@/types/type";

// Create a fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return response.json();
};

export function useProviderData() {
  const [providers, setProviders] = useState<ProviderTableData[]>([]);

  // Use SWR for fetching provider data
  const {
    data: providersData,
    error: providersError,
    mutate: mutateProviders,
    isLoading: providersLoading,
  } = useSWR("/api/providerApi", fetcher, {
    onSuccess: (data: ProviderReportData[]) => {
      console.log("Raw provider data:", data);
      try {
        // Validate and filter data before processing
        if (!Array.isArray(data)) {
          console.error("Provider data is not an array:", data);
          toast.error("فرمت داده‌های تامین‌کنندگان نامعتبر است");
          return;
        }

        // Map each provider to contain the required fields for the table
        const mappedProviders: ProviderTableData[] = data
          .filter((provider: ProviderReportData) => {
            // Filter out invalid providers
            if (!provider || !provider._id) {
              console.warn("Invalid provider object:", provider);
              return false;
            }
            return true;
          })
          .map((provider: ProviderReportData) => ({
            _id: provider._id,
            name: provider.name || "",
            code: provider.code || "",
            info: String(provider.info || ""),
            createdAt: String(provider.createdAt || new Date().toISOString()),
            updatedAt: String(provider.updatedAt || new Date().toISOString()),
            date: new Date(String(provider.createdAt || new Date())).toLocaleString(
              "fa-IR"
            ),
            phone: "", // Required by TableData interface but not applicable for providers
            type: 1, // Using numeric type as in original component
          }));

        console.log("Mapped providers:", mappedProviders);
        setProviders(mappedProviders);
      } catch (error) {
        console.error("Error processing provider data:", error);
        toast.error("خطا در پردازش اطلاعات تامین‌کنندگان");
        setProviders([]); // Set empty array on error
      }
    },
    onError: (err) => {
      console.error("Error fetching providers:", err);
      toast.error("خطا در دریافت اطلاعات تامین‌کنندگان");
      setProviders([]); // Set empty array on error
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Function to refresh provider data
  const refreshProviders = async () => {
    try {
      await mutateProviders();
      toast.success("اطلاعات تامین‌کنندگان با موفقیت بروزرسانی شد");
    } catch (error) {
      console.error("Error refreshing providers:", error);
      toast.error("خطا در بروزرسانی اطلاعات تامین‌کنندگان");
    }
  };

  return {
    // Data
    providers,

    // Loading state
    loading: providersLoading,
    providersLoading,

    // Error state
    providersError,

    // Mutation function
    mutateProviders,

    // Convenience function
    refreshProviders,

    // Raw data (if needed)
    providersData,
  };
}

// Export type for use in components
export type { ProviderTableData };
