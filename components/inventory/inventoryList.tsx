"use client";
import React, { useState, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import InventoryEditForm from "./inventoryEditForm";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useInventoryData } from "@/hooks/useInventoryData";
import toast from "react-hot-toast";
import { TableColumn } from "@/types/tables";
import {
  FormField,
  InventoryFormData,
  InventoryTableData,
} from "@/types/type";

const columns: TableColumn[] = [
  { key: "name", label: "نام", sortable: true },
  { key: "code", label: "کد", sortable: true },
  { key: "buyPrice", label: "قیمت خرید", sortable: true },
  { key: "count", label: "تعداد", sortable: true },
  { key: "provider.name", label: "تامین کننده", sortable: true },
  {
    key: "materialType",
    label: "نوع مواد",
    sortable: true,
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
      if (typedRow.glass && typeof typedRow.glass === 'object' && 'name' in typedRow.glass) return (typedRow.glass as { name: string }).name;
      if (typedRow.sideMaterial && typeof typedRow.sideMaterial === 'object' && 'name' in typedRow.sideMaterial) return (typedRow.sideMaterial as { name: string }).name;
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
  },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    sortable: true,
    type: "date",
  },
];

const InventoryList: React.FC = () => {
  const {
    providers,
    glasses,
    sideMaterials,
    inventoryError,
    transformDataForEdit,
    handleEditSuccess,
    fetchFormOptions,
  } = useInventoryData();

  const [isCustomEditModalOpen, setIsCustomEditModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryFormData | null>(null);

  // Form fields for editing inventory (unused but kept for compatibility)
  const getInventoryFormFields = (): FormField[] => [
    {
      name: "name",
      label: "نام",
      type: "text",
      placeholder: "نام را وارد کنید",
      validation: [
        { type: "required", message: "نام الزامی است" },
        { type: "minLength", value: 2, message: "حداقل ۲ کاراکتر نیاز است" },
      ],
    },
    {
      name: "code",
      label: "کد",
      type: "text",
      placeholder: "کد را وارد کنید",
      validation: [{ type: "required", message: "کد الزامی است" }],
    },
    {
      name: "buyPrice",
      label: "قیمت خرید",
      type: "number",
      placeholder: "قیمت خرید را وارد کنید",
      validation: [
        { type: "required", message: "قیمت خرید الزامی است" },
        { type: "min", value: 0, message: "قیمت نمی‌تواند منفی باشد" },
      ],
    },
    {
      name: "count",
      label: "تعداد",
      type: "number",
      placeholder: "تعداد را وارد کنید",
      validation: [
        { type: "required", message: "تعداد الزامی است" },
        { type: "min", value: 1, message: "تعداد باید حداقل ۱ باشد" },
      ],
    },
    {
      name: "provider",
      label: "تامین کننده",
      type: "select",
      placeholder: "تامین کننده را انتخاب کنید",
      options: providers,
      validation: [
        { type: "required", message: "انتخاب تامین کننده الزامی است" },
      ],
    },
    {
      name: "materialType",
      label: "نوع مواد",
      type: "select",
      placeholder: "نوع مواد را انتخاب کنید",
      options: [
        { label: "شیشه", value: "glass" },
        { label: "مواد جانبی", value: "sideMaterial" },
      ],
      validation: [{ type: "required", message: "انتخاب نوع مواد الزامی است" }],
    },
    {
      name: "glass",
      label: "شیشه",
      type: "select",
      placeholder: "شیشه را انتخاب کنید",
      options: glasses,
      validation: [
        {
          type: "required",
          message: "انتخاب شیشه الزامی است",
          validator: (value, formValues) =>
            formValues?.materialType === "glass" ? !!value : true,
        },
      ],
      dependency: {
        field: "materialType",
        value: "glass",
      },
    },
    {
      name: "width",
      label: "عرض (سانتی‌متر)",
      type: "number",
      placeholder: "عرض را وارد کنید",
      validation: [
        {
          type: "required",
          message: "عرض الزامی است",
          validator: (value, formValues) =>
            formValues?.materialType === "glass" ? !!value : true,
        },
        { type: "min", value: 0, message: "عرض نمی‌تواند منفی باشد" },
      ],
      dependency: {
        field: "materialType",
        value: "glass",
      },
    },
    {
      name: "height",
      label: "ارتفاع (سانتی‌متر)",
      type: "number",
      placeholder: "ارتفاع را وارد کنید",
      validation: [
        {
          type: "required",
          message: "ارتفاع الزامی است",
          validator: (value, formValues) =>
            formValues?.materialType === "glass" ? !!value : true,
        },
        { type: "min", value: 0, message: "ارتفاع نمی‌تواند منفی باشد" },
      ],
      dependency: {
        field: "materialType",
        value: "glass",
      },
    },
    {
      name: "sideMaterial",
      label: "مواد جانبی",
      type: "select",
      placeholder: "مواد جانبی را انتخاب کنید",
      options: sideMaterials,
      validation: [
        {
          type: "required",
          message: "انتخاب مواد جانبی الزامی است",
          validator: (value, formValues) =>
            formValues?.materialType === "sideMaterial" ? !!value : true,
        },
      ],
      dependency: {
        field: "materialType",
        value: "sideMaterial",
      },
    },
    {
      name: "enterDate",
      label: "تاریخ ورود",
      type: "date",
      placeholder: "تاریخ ورود را وارد کنید",
      validation: [{ type: "required", message: "تاریخ ورود الزامی است" }],
    },
  ];

  const handleEditClick = (item: unknown) => {
    setSelectedInventoryItem(transformDataForEdit(item as InventoryTableData));
    setIsCustomEditModalOpen(true);
  };

  const closeCustomEditModal = () => {
    setIsCustomEditModalOpen(false);
    setSelectedInventoryItem(null);
  };

  const handleCustomEditSuccess = () => {
    closeCustomEditModal();
    handleEditSuccess();
    toast.success("موجودی با موفقیت بروزرسانی شد");
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
        config={{
          title: "لیست موجودی",
          endpoint: "/api/inventory",
          columns: columns,
          actions: {
            edit: true,
            delete: false,
            view: false,
          },
          onEdit: handleEditClick,
          responseHandler: (response) => {
            return response.inventory || [];
          },
        }}
      />

      {/* Custom Edit Modal using InventoryEditForm */}
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
                <InventoryEditForm
                  inventoryId={selectedInventoryItem._id || ""}
                  initialValues={selectedInventoryItem}
                  onSuccess={handleCustomEditSuccess}
                  onCancel={closeCustomEditModal}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryList;
