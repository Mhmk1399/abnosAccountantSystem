"use client";
import React, { useState, useEffect, useRef } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useInventoryData } from "@/hooks/useInventoryData";
import toast from "react-hot-toast";
import { TableColumn } from "@/types/tables";
import { InventoryTableData } from "@/types/type";

interface InventoryFormData {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  count: number;
  provider: string;
  materialType: "glass" | "sideMaterial";
  glass: string;
  sideMaterial: string;
  width: number;
  height: number;
  enterDate: string;
  [key: string]: string | number | boolean | Date | string[] | File;
}

const InventoryList: React.FC = () => {
  const {
    providers,
    glasses,
    sideMaterials,
    inventoryError,
    handleEditSuccess,
    fetchFormOptions,
  } = useInventoryData();

  const [isCustomEditModalOpen, setIsCustomEditModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryFormData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryTableData | null>(
    null
  );
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const columns: TableColumn[] = [
    {
      key: "name",
      label: "نام",
      sortable: true,
      filterable: true,
      filterType: "text",
      placeholder: "جستجو در نام",
    },
    { key: "code", label: "کد", sortable: true },
    {
      key: "buyPrice",
      label: "قیمت خرید",
      sortable: true,
      filterable: true,
      filterType: "numberRange",
      placeholder: "قیمت خرید",
    },
    { key: "count", label: "تعداد", sortable: true },
    {
      key: "provider.name",
      label: "تامین کننده",
      sortable: true,
      filterable: true,
      filterType: "select",
      placeholder: "انتخاب تامین کننده",
      filterOptions: providers.map((provider) => ({
        value: provider.label,
        label: provider.label,
        key: provider.value,
      })),
    },
    {
      key: "materialType",
      label: "نوع مواد",
      sortable: true,
      filterable: true,
      filterType: "select",
      placeholder: "انتخاب نوع مواد",
      filterOptions: [
        { value: "شیشه", label: "شیشه", key: "glass" },
        { value: "مواد جانبی", label: "مواد جانبی", key: "sideMaterial" },
      ],
      render: (value, row: unknown) => {
        const typedRow = row as InventoryTableData;
        if (typedRow.glass) return "شیشه";
        if (typedRow.sideMaterial) return "مواد جانبی";
        return "نامشخص";
      },
    },
    {
      key: "materialName",
      label: "نام مواد",
      sortable: true,
      render: (value, row: unknown) => {
        const typedRow = row as InventoryTableData;
        if (
          typedRow.glass &&
          typeof typedRow.glass === "object" &&
          "name" in typedRow.glass
        )
          return (typedRow.glass as { name: string }).name;
        if (
          typedRow.sideMaterial &&
          typeof typedRow.sideMaterial === "object" &&
          "name" in typedRow.sideMaterial
        )
          return (typedRow.sideMaterial as { name: string }).name;
        return "نامشخص";
      },
    },
    {
      key: "dimensions",
      label: "ابعاد",
      sortable: false,
      render: (value, row: unknown) => {
        const typedRow = row as InventoryTableData;
        if (typedRow.width && typedRow.height) {
          return `${typedRow.width} × ${typedRow.height}`;
        }
        return "ندارد";
      },
    },
    {
      key: "enterDate",
      label: "تاریخ ورود",
      sortable: true,
      type: "date",
      filterable: true,
      filterType: "dateRange",
      placeholder: "انتخاب تاریخ",
    },
    {
      key: "createdAt",
      label: "تاریخ ایجاد",
      sortable: true,
      type: "date",
    },
  ];

  const handleEditClick = (item: unknown) => {
    const typedItem = item as InventoryTableData;

    // Transform the item to match InventoryFormData structure, ensuring no undefined values
    const formData: InventoryFormData = {
      _id: typedItem._id || "",
      name: typedItem.name || "",
      code: typedItem.code || "",
      buyPrice: typedItem.buyPrice || 0,
      count: typedItem.count || 0,
      provider:
        typeof typedItem.provider === "object" && typedItem.provider !== null
          ? (typedItem.provider as { _id: string })._id
          : (typedItem.provider as string) || "",
      materialType: typedItem.glass ? "glass" : "sideMaterial",
      glass: typeof typedItem.glass === "string" ? typedItem.glass : "",
      sideMaterial:
        typeof typedItem.sideMaterial === "string"
          ? typedItem.sideMaterial
          : "",
      width: typedItem.width || 0,
      height: typedItem.height || 0,
      enterDate: typedItem.enterDate
        ? new Date(typedItem.enterDate).toISOString().split("T")[0]
        : "",
    };

    setSelectedInventoryItem(formData);
    setIsCustomEditModalOpen(true);
  };

  const closeCustomEditModal = () => {
    setIsCustomEditModalOpen(false);
    setSelectedInventoryItem(null);
  };

  const handleCustomEditSuccess = () => {
    closeCustomEditModal();
    handleEditSuccess();
    tableRef.current?.refreshData();
    toast.success("موجودی با موفقیت بروزرسانی شد");
  };

  const handleDeleteClick = (item: unknown) => {
    setItemToDelete(item as InventoryTableData);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) return;
    try {
      const response = await fetch(`/api/inventory?id=${itemToDelete._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        tableRef.current?.refreshData();
        toast.success("موجودی با موفقیت حذف شد");
      } else {
        toast.error("خطا در حذف موجودی");
      }
    } catch {
      toast.error("خطا در حذف موجودی");
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  if (inventoryError) {
    return (
      <div className="p-6 text-red-600">
        خطا در دریافت اطلاعات موجودی: {inventoryError.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl text-black font-bold my-4">لیست موجودی</h2>
      <DynamicTable
        ref={tableRef}
        config={{
          title: "لیست موجودی",
          endpoint: "/api/inventory",
          columns: columns,
          enableFilters: true,
          actions: {
            edit: true,
            delete: true,
            view: false,
          },
          onEdit: handleEditClick,
          onDelete: handleDeleteClick,
          responseHandler: (response) => {
            return response.inventory || [];
          },
        }}
      />

      {/* Custom Edit Modal using DynamicForm */}
      <AnimatePresence>
        {isCustomEditModalOpen && selectedInventoryItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCustomEditModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-11/12 max-h-100 overflow-auto md:max-w-2xl my-8 p-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    ویرایش موجودی
                  </h3>
                  <button onClick={closeCustomEditModal}>
                    <IoClose
                      size={24}
                      className="text-gray-600 hover:text-gray-800"
                    />
                  </button>
                </div>
                <DynamicForm
                  config={
                    {
                      title: "ویرایش موجودی",
                      endpoint: "/api/inventory",
                      method: "PATCH",
                      fields: [
                        {
                          name: "_id",
                          type: "hidden",
                          label: "",
                          defaultValue: selectedInventoryItem._id || "",
                        },
                        {
                          name: "name",
                          type: "text",
                          label: "نام",
                          required: true,
                          placeholder: "نام را وارد کنید",
                        },
                        {
                          name: "buyPrice",
                          type: "number",
                          label: "قیمت خرید",
                          required: true,
                          placeholder: "قیمت خرید",
                        },
                        {
                          name: "count",
                          type: "number",
                          label: "تعداد",
                          required: true,
                          placeholder: "تعداد",
                        },
                        {
                          name: "provider",
                          type: "select",
                          label: "تامین کننده",
                          required: true,
                          options: [
                            { label: "انتخاب کنید", value: "" },
                            ...providers,
                          ],
                        },
                        {
                          name: "materialType",
                          type: "select",
                          label: "نوع مواد",
                          required: true,
                          options: [
                            { label: "انتخاب کنید", value: "" },
                            { label: "شیشه", value: "glass" },
                            { label: "مواد جانبی", value: "sideMaterial" },
                          ],
                        },
                        {
                          name: "glass",
                          type: "select",
                          label: "شیشه",
                          options: [
                            { label: "انتخاب کنید", value: "" },
                            ...glasses,
                          ],
                        },
                        {
                          name: "sideMaterial",
                          type: "select",
                          label: "مواد جانبی",
                          options: [
                            { label: "انتخاب کنید", value: "" },
                            ...sideMaterials,
                          ],
                        },
                        {
                          name: "width",
                          type: "number",
                          label: "عرض (سانتیمتر)",
                          placeholder: "عرض",
                        },
                        {
                          name: "height",
                          type: "number",
                          label: "ارتفاع (سانتیمتر)",
                          placeholder: "ارتفاع",
                        },
                        {
                          name: "enterDate",
                          type: "persian-date",
                          label: "تاریخ ورود",
                          required: true,
                        },
                      ],
                      submitButtonText: "بروزرسانی موجودی",
                      onSuccess: handleCustomEditSuccess,
                      onError: () => toast.error("خطا در بروزرسانی موجودی"),
                    } as FormConfig
                  }
                  initialData={selectedInventoryItem}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                تأیید حذف
              </h3>
              <p className="text-gray-600 mb-6">
                آیا از حذف موجودی &quot;{itemToDelete?.name}&quot; اطمینان
                دارید؟
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryList;
