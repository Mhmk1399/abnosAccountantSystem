"use client";
import React, { useState } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import TableFilters, { FilterConfig } from "@/components/global/TableFilters";
import { TableColumn } from "@/types/tables";

const columns: TableColumn[] = [
  {
    key: "code",
    label: "کد تامین کننده",
    sortable: true,
  },
  {
    key: "name",
    label: "نام تامین کننده",
    sortable: true,
  },
  {
    key: "purchaseAmount",
    label: "مبلغ خریداری شده",
    sortable: true,
    render: (value) => `${Number(value || 0).toLocaleString("fa-IR")} ریال`,
  },
  {
    key: "usedAmount",
    label: "مبلغ استفاده شده",
    sortable: true,
    render: (value) => `${Number(value || 0).toLocaleString("fa-IR")} ریال`,
  },
  {
    key: "remainingAmount",
    label: "مبلغ باقیمانده",
    sortable: true,
    render: (value) => `${Number(value || 0).toLocaleString("fa-IR")} ریال`,
  },
];

const ProviderReport: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "name",
        label: "نام تامین کننده",
        type: "text",
        placeholder: "جستجو بر اساس نام..."
      },
      {
        key: "code",
        label: "کد تامین کننده",
        type: "text",
        placeholder: "جستجو بر اساس کد..."
      },
      {
        key: "minAmount",
        label: "حداقل مبلغ خرید",
        type: "text",
        placeholder: "حداقل مبلغ..."
      },
      {
        key: "maxAmount",
        label: "حداکثر مبلغ خرید",
        type: "text",
        placeholder: "حداکثر مبلغ..."
      }
    ],
    onFiltersChange: setFilters
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <TableFilters
          config={filterConfig}
        />
      </div>
      <DynamicTable
        config={{
          title: "گزارش تامین کنندگان",
          endpoint: "/api/reports/providers",
          columns: columns,
          filters: filters,
          responseHandler: (response) => {
            return response.providerReports || [];
          }
        }}
      />
    </div>
  );
};

export default ProviderReport;
