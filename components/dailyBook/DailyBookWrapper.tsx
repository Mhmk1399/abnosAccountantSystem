"use client";

import React, { useState } from "react";
import { AccountingProvider } from "@/contexts/AccountingContext";
import { DailyBookProvider } from "@/contexts/DailyBookContext";
import DailyBookForm from "@/components/dailyBook/DailyBookForm";
import DailyBookTable from "@/components/dailyBook/DailyBookTable";
import AccountBalanceTable from "@/components/dailyBook/AccountBalanceTable";

// This is a placeholder - in a real app, you would get this from authentication
const CURRENT_USER_ID = "placeholder-user-id";

export default function DailyBookPage() {
  const [activeTab, setActiveTab] = useState<"form" | "table" | "balance">("form");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Refresh the table when a new entry is created
    setRefreshKey((prev) => prev + 1);
    setActiveTab("table");
    console.log("Daily book entry created successfully");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        مدیریت دفتر روزنامه
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 text-black gap-2" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "form" ? "bg-blue-500 text-white" : "bg-gray-200"
          } `}
          onClick={() => setActiveTab("form")}
        >
          ثبت سند جدید
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          } `}
          onClick={() => setActiveTab("table")}
        >
          مشاهده اسناد
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "balance" ? "bg-blue-500 text-white" : "bg-gray-200"
          } `}
          onClick={() => setActiveTab("balance")}
        >
          مانده حسابها
        </button>
      </div>

      <AccountingProvider>
        <DailyBookProvider>
          {activeTab === "form" ? (
            <DailyBookForm userId={CURRENT_USER_ID} onSuccess={handleSuccess} />
          ) : activeTab === "table" ? (
            <DailyBookTable
              key={refreshKey}
              onEdit={(id) => {
                // Handle edit functionality
                console.log("Edit daily book with ID:", id);
                setActiveTab("form");
              }}
              onDelete={(id) => {
                // Handle delete functionality
                console.log("Delete daily book with ID:", id);
                setRefreshKey((prev) => prev + 1);
              }}
            />
          ) : (
            <AccountBalanceTable />
          )}
        </DailyBookProvider>
      </AccountingProvider>
    </div>
  );
}
