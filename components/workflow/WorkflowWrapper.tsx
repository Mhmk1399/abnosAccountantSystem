"use client";

import React, { useState } from "react";
import WorkflowTable from "./WorkflowTable";
import WorkflowBuilderNew from "./WorkflowBuilderNew";

export default function WorkflowWrapper() {
  const [activeTab, setActiveTab] = useState<"builder" | "table">("builder");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        مدیریت ورکفلو
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 text-black gap-2" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "builder" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("builder")}
        >
          سازنده ورکفلو
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("table")}
        >
          مشاهده ورکفلوها
        </button>
      </div>

      {activeTab === "builder" ? <WorkflowBuilderNew /> : <WorkflowTable />}
    </div>
  );
}