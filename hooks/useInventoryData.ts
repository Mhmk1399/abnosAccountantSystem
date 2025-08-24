import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  FieldOption,
  Glass,
  Inventory,
  InventoryFormData,
  InventoryHook,
  InventoryTableData,
  ProviderReportData,
  SideMaterial,
} from "@/types/type";

// Create a fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return response.json();
};

// Interface based on the original component

export function useInventoryData() {
  const [inventory, setInventory] = useState<InventoryTableData[]>([]);
  const [providers, setProviders] = useState<FieldOption[]>([]);
  const [glasses, setGlasses] = useState<FieldOption[]>([]);
  const [sideMaterials, setSideMaterials] = useState<FieldOption[]>([]);

  // Use SWR for fetching inventory data
  const {
    data: inventoryData,
    error: inventoryError,
    mutate: mutateInventory,
    isLoading: inventoryLoading,
  } = useSWR("/api/inventory", fetcher, {
    onSuccess: (response: any) => {
      console.log("Raw inventory response:", response);
      const data = Array.isArray(response) ? response : response.inventory;
      try {
        // Validate and filter data before processing
        if (!Array.isArray(data)) {
          console.log("Inventory data is not an array:", data);
          toast.error("فرمت داده‌های موجودی نامعتبر است");
          return;
        }

        // Map each inventory item to contain the required fields for the table
        const mappedInventory = data
          .filter((item: InventoryHook) => {
            // Filter out invalid inventory items
            if (!item || !item._id) {
              console.warn("Invalid inventory object:", item);
              return false;
            }
            return true;
          })
          .map((item: InventoryHook) => {
            // Determine material type and name
            let materialType = "sideMaterial";
            let materialName = "نامشخص";

            if (
              item.glass &&
              (typeof item.glass === "object" ? item.glass._id : item.glass)
            ) {
              materialType = "glass";
              materialName =
                typeof item.glass === "object" ? item.glass.name : "شیشه";
            } else if (
              item.sideMaterial &&
              (typeof item.sideMaterial === "object"
                ? item.sideMaterial._id
                : item.sideMaterial)
            ) {
              materialType = "sideMaterial";
              materialName =
                typeof item.sideMaterial === "object"
                  ? item.sideMaterial.name
                  : "متریال کناری";
            } else if (item.width && item.height) {
              // If has dimensions but no glass/sideMaterial reference, assume it's glass
              materialType = "glass";
              materialName = "شیشه عمومی";
            }

            // Format dimensions string if width and height are available
            let dimensions = "";
            if (item.width && item.height) {
              dimensions = `${item.width} × ${item.height}`;
            } else if (
              materialType === "glass" &&
              item.glass &&
              typeof item.glass === "object"
            ) {
              // Try to get dimensions from glass object if available
              const glassObj = item.glass as Glass;
              if (glassObj.width && glassObj.height) {
                dimensions = `${glassObj.width} × ${glassObj.height}`;
              }
            }

            // Format date for display
            const formattedEnterDate = item.enterDate
              ? new Date(item.enterDate).toISOString().split("T")[0]
              : "";

            // Create the inventory table data object without the originalData property
            const inventoryTableData: InventoryTableData = {
              _id: item._id,
              name: item.name || "",
              code: item.code || "",
              buyPrice: item.buyPrice || 0,
              count: item.count || 0,
              providerName:
                typeof item.provider === "object" && item.provider
                  ? item.provider.name
                  : "نامشخص",
              materialType,
              materialName,
              dimensions,
              // Store the IDs for the form
              provider: item.provider ? item.provider._id : "",
              glass: item.glass ? item.glass._id : "",
              sideMaterial: item.sideMaterial ? item.sideMaterial._id : "",
              width: item.width || 0,
              height: item.height || 0,
              enterDate: formattedEnterDate,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              date: new Date(item.createdAt || new Date()).toLocaleString(
                "fa-ir"
              ),
              phone: "", // Required by TableData interface
              type: 1, // Default value for required type field
            };

            // We're storing the original data in the TableData as a property
            // but since it's not in our interface, we need to use a type assertion
            // to bypass type checking for this specific property
            (
              inventoryTableData as InventoryTableData & {
                originalData: InventoryHook;
              }
            ).originalData = item;

            return inventoryTableData;
          });

        setInventory(mappedInventory as InventoryTableData[]);
      } catch (error) {
        console.log("Error processing inventory data:", error);
        toast.error("خطا در پردازش اطلاعات موجودی");
        setInventory([]); // Set empty array on error
      }
    },
    onError: (err) => {
      console.error("Error fetching inventory:", err);
      toast.error("خطا در دریافت اطلاعات موجودی");
      setInventory([]); // Set empty array on error
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    // Add error retry configuration
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  // Fetch providers, glasses, and side materials for form fields
  const fetchFormOptions = async () => {
    try {
      // Fetch providers
      const providersResponse = await fetch("/api/providerApi");
      const providersData = await providersResponse.json();
      const providersOptions = providersData.providers.map(
        (provider: ProviderReportData) => ({
          label: provider.name,
          value: provider._id,
        })
      );
      setProviders(providersOptions);

      // Fetch glasses
      const glassesResponse = await fetch("/api/glass");
      const glassesData = await glassesResponse.json();
      const glassesOptions = glassesData.map((glass: Glass) => ({
        label: `${glass.name} (${glass.width}×${glass.height}×${glass.thickness})`,
        value: glass._id,
      }));
      setGlasses(glassesOptions);

      // Fetch side materials
      const sideMaterialsResponse = await fetch("/api/sideMaterial");
      const sideMaterialsData = await sideMaterialsResponse.json();
      const sideMaterialsOptions = sideMaterialsData.map(
        (material: SideMaterial) => ({
          label: `${material.name} (${material.code})`,
          value: material._id,
        })
      );
      setSideMaterials(sideMaterialsOptions);
    } catch (error) {
      console.error("Error fetching form options:", error);
      toast.error("خطا در دریافت اطلاعات فرم");
    }
  };

  // Transform data for edit modal
  const transformDataForEdit = (
    item: InventoryTableData
  ): InventoryFormData => {
    return {
      _id: item._id,
      name: item.name,
      code: item.code,
      buyPrice: item.buyPrice,
      count: item.count || 0,
      provider: item.provider,
      materialType: item.materialType as "glass" | "sideMaterial",
      glass: item.materialType === "glass" ? item.glass : "",
      sideMaterial:
        item.materialType === "sideMaterial" ? item.sideMaterial : "",
      width: item.width || 0,
      height: item.height || 0,
      enterDate: item.enterDate,
    };
  };

  // Function to refresh inventory data
  const refreshInventory = async () => {
    try {
      await mutateInventory();
      toast.success("اطلاعات موجودی با موفقیت بروزرسانی شد");
    } catch (error) {
      console.log("Error refreshing inventory:", error);
      toast.error("خطا در بروزرسانی اطلاعات موجودی");
    }
  };

  // Event handlers
  const handleEditSuccess = () => {
    refreshInventory(); // Refresh the data
  };

  const handleEditError = (error: Response | Error | { message: string }) => {
    console.log("Error updating inventory:", error);
    toast.error("خطا در بروزرسانی موجودی");
  };

  return {
    // Data
    inventory,
    providers,
    glasses,
    sideMaterials,

    // Loading state
    loading: inventoryLoading,
    inventoryLoading,

    // Error state
    inventoryError,

    // Mutation function
    mutateInventory,

    // Transformation functions
    transformDataForEdit,

    // Event handlers
    handleEditSuccess,
    handleEditError,

    // Convenience functions
    refreshInventory,
    fetchFormOptions,

    // Raw data (if needed)
    inventoryData,
  };
}

// Export types for use in components
