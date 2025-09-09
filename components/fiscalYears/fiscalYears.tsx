"use client";

import { useState, useRef } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import { TableConfig, DynamicTableRef } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";

export interface FiscalYear extends Record<string, unknown> {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean; // optional because default is false
  createdAt?: Date; // optional because default is Date.now
  updatedAt?: Date; // optional because default is Date.now
}

export default function FiscalYears() {
  const [selectedFiscalYear, setSelectedFiscalYear] =
    useState<FiscalYear | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const tableRef = useRef<DynamicTableRef>(null);

  const handleView = (fiscalYear: FiscalYear) => {
    setSelectedFiscalYear(fiscalYear);
    setModalConfig({
      title: `مشاهده اطلاعات سال مالی ${fiscalYear.name}`,
      type: "view",
      size: "md",
      fields: [
        { key: "name", label: "نام سال مالی" },
        { key: "startDate", label: "تاریخ شروع", type: "date" },
        { key: "endDate", label: "تاریخ پایان", type: "date" },
        { key: "taxRate", label: "تاریخ پایان", type: "date" },
        {
          key: "isActive",
          label: "وضعیت",
          render: (value) => (value ? "فعال" : "غیرفعال"),
        },
        { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
        { key: "updatedAt", label: "تاریخ بروزرسانی", type: "date" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedFiscalYear(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (fiscalYear: FiscalYear) => {
    setSelectedFiscalYear(fiscalYear);
    setModalConfig({
      title: `ویرایش سال مالی ${fiscalYear.name}`,
      type: "edit",
      size: "md",
      endpoint: `/api/fiscalYears`,
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام سال مالی",
          type: "text",
          required: true,
          placeholder: "نام سال مالی را وارد کنید",
        },
        {
          key: "startDate",
          label: "تاریخ شروع",
          type: "date",
          required: true,
        },
        {
          key: "endDate",
          label: "تاریخ پایان",
          type: "date",
          required: true,
        },
        {
          key: "taxRate",
          label: "نرخ مالیات (%)",
          type: "number",
          required: true,
        },
        {
          key: "isActive",
          label: "فعال",
          type: "select",
          options: [
            { value: "true", label: "فعال" },
            { value: "false", label: "غیرفعال" },
          ],
        },
      ],
      onSuccess: () => {
        toast.success("سال مالی با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedFiscalYear(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی سال مالی: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedFiscalYear(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (fiscalYear: FiscalYear) => {
    setSelectedFiscalYear(fiscalYear);
    setModalConfig({
      title: `حذف سال مالی`,
      type: "delete",
      endpoint: `/api/fiscalYears/id`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("سال مالی با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedFiscalYear(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در حذف سال مالی: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedFiscalYear(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت سال‌های مالی",
    description: "لیست سال‌های مالی و اطلاعات آنها",
    endpoint: "/api/fiscalYears",
    enableFilters: true,
    columns: [
      {
        key: "name",
        label: "نام سال مالی",
        sortable: true,
        filterable: true,
        filterType: "text",
      },
      {
        key: "startDate",
        label: "تاریخ شروع",
        type: "date",
        sortable: true,
        filterable: true,
        filterType: "dateRange",
      },
      {
        key: "endDate",
        label: "تاریخ پایان",
        type: "date",
        sortable: true,
        filterable: true,
        filterType: "dateRange",
      },
      {
        key: "taxRate",
        label: "نرخ مالیات (%)",
        type: "number",
        sortable: true,
      },
      {
        key: "isActive",
        label: "وضعیت",
        filterable: true,
        filterType: "select",
        filterOptions: [
          { value: "true", label: "فعال" },
          { value: "false", label: "غیرفعال" },
        ],
        render: (value) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "فعال" : "غیرفعال"}
          </span>
        ),
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedFiscalYear?._id}
          initialData={selectedFiscalYear || undefined}
        />
      )}
    </div>
  );
}
