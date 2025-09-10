"use client";

import { useRef, useState, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableConfig } from "@/types/tables";
import toast from "react-hot-toast";
import type { Invoice } from "@/types/finalTypes";
import { Customer } from "@/types/type";

export default function InvoiceStatusManager() {
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [customers, setCustomers] = useState<
    { value: string; label: string; key: string }[]
  >([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customer");
        const data = await response.json();
        setCustomers(
          (data || []).map((customer: Customer) => ({
            value: customer.name,
            label: customer.name,
            key: customer._id,
          }))
        );
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const updateStatus = async (invoice: Invoice) => {
    try {
      const response = await fetch("/api/invoice", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoice._id,
          status: "in progress",
        }),
      });

      if (response.ok) {
        toast.success("وضعیت فاکتور به در حال انجام تغییر یافت");
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } else {
        const errorData = await response.json();
        toast.error(
          `خطا: ${errorData.message || "خطا در بروزرسانی وضعیت فاکتور"}`
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("خطا در بروزرسانی وضعیت فاکتور");
    }
  };

  const tableConfig: TableConfig = {
    title: "مدیریت وضعیت فاکتورها",
    description: "مدیریت فاکتورهای در انتظار و بروزرسانی وضعیت آنها",
    endpoint: "/api/invoice",
    enableFilters: true,
    filters: { status: "pending" },
    responseHandler: (data) => data?.invoices || [],
    columns: [
      {
        key: "code",
        label: "کد",
        sortable: true,
        filterable: true,
        filterType: "text",
        placeholder: "جستجو کد فاکتور",
      },
      {
        key: "customer.name",
        label: "مشتری",
        filterable: true,
        filterType: "select",
        placeholder: "انتخاب مشتری",
        filterOptions: customers,
        render: (value: unknown, row: Record<string, unknown>) => {
          const customer = row.customer as { name?: string } | undefined;
          return customer?.name || "ندارد";
        },
      },
      {
        key: "priority.name",
        label: "اولویت",
        render: (value: unknown, row: Record<string, unknown>) => {
          const priority = row.priority as { name?: string } | undefined;
          return priority?.name || "ندارد";
        },
      },
      {
        key: "price",
        label: "قیمت",
        filterable: true,
        filterType: "numberRange",
        placeholder: "قیمت",
        render: (value: unknown) => `${value} تومان`,
      },
      {
        key: "status",
        label: "وضعیت",
        render: (value: unknown) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : value === "in progress"
                ? "bg-blue-100 text-blue-800"
                : value === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value === "pending"
              ? "در انتظار"
              : value === "in progress"
              ? "در حال انجام"
              : value === "completed"
              ? "تکمیل شده"
              : value === "cancelled"
              ? "لغو شده"
              : value === "stop production"
              ? "توقف تولید"
              : String(value)}
          </span>
        ),
      },
      {
        key: "productionDate",
        label: "تاریخ تولید",
        type: "date",
      },
      {
        key: "action",
        label: "عملیات",
        render: (value: unknown, row: Record<string, unknown>) => (
          console.log(value, row),
          (
            <button
              onClick={() => updateStatus(row as Invoice)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              شروع پردازش
            </button>
          )
        ),
      },
    ],
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DynamicTable ref={tableRef} config={tableConfig} />
    </div>
  );
}
