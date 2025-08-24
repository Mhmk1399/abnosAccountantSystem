"use client";
import React, { useState } from "react";
import AddInventory from "./addInventory";
import InventoryList from "./inventoryList";
import InventoryReport from "./inventoryReport";

const InventoryTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");

  const tabs = [
    { id: "list", label: "لیست موجودی", component: <InventoryList /> },
    { id: "add", label: "افزودن موجودی", component: <AddInventory /> },
    { id: "reports", label: "گزارش موجودی", component: <InventoryReport /> },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="flex gap-2 mt-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default InventoryTabs;