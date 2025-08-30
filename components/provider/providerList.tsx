"use client";
import React, { useState } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import TableFilters, { FilterConfig } from "@/components/global/TableFilters";
import { TableColumn } from "@/types/tables";

const columns: TableColumn[] = [
  { key: "name", label: "نام", sortable: true },
  { key: "code", label: "کد", sortable: true },
  { key: "info", label: "اطلاعات", sortable: false },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    sortable: true,
    type: "date",
  },
  {
    key: "updatedAt",
    label: "تاریخ بروزرسانی",
    sortable: true,
    type: "date",
  },
];

const ProviderList: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "name",
        label: "نام تامین کننده",
        type: "text",
        placeholder: "جستجو در نام تامین کننده..."
      },
      {
        key: "code",
        label: "کد تامین کننده",
        type: "text",
        placeholder: "جستجو در کد تامین کننده..."
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        type: "dateRange"
      }
    ],
    onFiltersChange: setFilters
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <TableFilters config={filterConfig} />
      <DynamicTable
        config={{
          title: "لیست تامین‌کنندگان",
          endpoint: "/api/providerApi",
          filters,
          itemsPerPage: 10,
          columns: columns,
          actions: {
            view: true,
            edit: true,
            delete: true
          },
          responseHandler: (response) => response.providers || []
        }}
      />
    </div>
  );
};

export default ProviderList;