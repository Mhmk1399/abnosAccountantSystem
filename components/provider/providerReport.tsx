"use client";
import React from "react";
import DynamicTable from "@/components/global/DynamicTable";
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

  return (
    <div className="p-6">
      <DynamicTable
        config={{
          title: "گزارش تامین کنندگان",
          endpoint: "/api/reports/providers",
          columns: columns,
          responseHandler: (response) => {
            return response.providerReports || [];
          }
        }}
      />
    </div>
  );
};

export default ProviderReport;
