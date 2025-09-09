"use client";
import React from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableColumn } from "@/types/tables";

const columns: TableColumn[] = [
  {
    key: "name",
    label: "نام",
    sortable: true,
    filterable: true,
    filterType: "text",
    placeholder: "جستجو نام",
  },
  {
    key: "code",
    label: "کد",
    sortable: true,
    filterable: true,
    filterType: "text",
    placeholder: "جستجو کد",
  },
  { key: "info", label: "اطلاعات", sortable: false },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    sortable: true,
    type: "date",
    filterable: true,
    filterType: "dateRange",
  },
  {
    key: "updatedAt",
    label: "تاریخ بروزرسانی",
    sortable: true,
    type: "date",
  },
];

const ProviderList: React.FC = () => {
  return (
    <div className="p-6">
      <DynamicTable
        config={{
          title: "لیست تامین‌کنندگان",
          endpoint: "/api/providerApi",
          columns: columns,
          enableFilters: true,

          actions: {
            view: true,
            edit: true,
            delete: true,
          },
          responseHandler: (response) => response.providers || [],
        }}
      />
    </div>
  );
};

export default ProviderList;
