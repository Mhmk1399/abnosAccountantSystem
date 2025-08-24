"use client";
import { useState } from "react";
import FiscalYearForm from "@/components/fiscalYears/FiscalYearForm";
import FiscalYears from "@/components/fiscalYears/fiscalYears";

export default function FiscalYearWrapper() {
  const [activeTab, setActiveTab] = useState<"form" | "table">("form");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Refresh the table when a new entry is created
    setRefreshKey((prev) => prev + 1);
    setActiveTab("table");
    console.log("Fiscal year created successfully");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-6 text-center">
        مدیریت سال‌های مالی
      </h1>

      {/* Tabs */}
      <div className="flex border-b text-black gap-2 mb-6" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "form" ? "bg-blue-500 text-white" : "bg-gray-200"
          } `}
          onClick={() => setActiveTab("form")}
        >
          ثبت سال مالی جدید
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          } `}
          onClick={() => setActiveTab("table")}
        >
          مشاهده سال‌های مالی
        </button>
      </div>

      {activeTab === "form" ? (
        <FiscalYearForm onSuccess={handleSuccess} />
      ) : (
        <FiscalYears key={refreshKey} />
      )}
    </div>
  );
}
