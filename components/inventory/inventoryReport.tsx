"use client";
import React from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableColumn } from "@/types/tables";

const InventoryReport: React.FC = () => {


  // Define table columns
  const columns: TableColumn[] = [
    { key: "name", label: "نام محصول", sortable: true },
    {
      key: "buyPrice",
      label: "مبلغ خرید",
      sortable: true,
      render: (value) => `${Number(value).toLocaleString()} تومان`,
    },
    {
      key: "count",
      label: "مقدار خرید",
      sortable: true,
    },
    {
      key: "usageCount",
      label: "مقدار مصرف شده",
      sortable: true,
    },
    {
      key: "remainingStock",
      label: "موجودی باقیمانده",
      sortable: true,
      render: (value) => {
        const remaining = Number(value);
        return (
          <span className={remaining <= 0 ? "text-red-600 font-bold" : remaining <= 5 ? "text-yellow-600 font-bold" : "text-green-600"}>
            {remaining}
          </span>
        );
      },
    },
    {
      key: "totalArea",
      label: "متراژ کل",
      sortable: true,
      render: (value) => `${Number(value)} متر مربع`,
    },
    {
      key: "enterDate",
      label: "تاریخ ورود",
      sortable: true,
      type: "date",
    },
  ];



  return (
    <div className="p-6">
      <h2 className="text-2xl text-black font-bold my-4">گزارش موجودی</h2>
      <DynamicTable
        config={{
          title: "گزارش موجودی",
          endpoint: "/api/reports/inventory",
          columns: columns,
          responseHandler: (response) => {
            return response.inventoryReports || [];
          },
        }}
      />
    </div>
  );
};

export default InventoryReport;
