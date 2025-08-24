"use client";
import React, { useState } from "react";
import AddProvider from "./addProvider";
import ProviderList from "./providerList";
import ProviderReport from "./providerReport";

const ProviderTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("add");

  const tabs = [
    { id: "add", label: "افزودن تامین کننده", component: <AddProvider /> },
    { id: "list", label: "لیست تامین کنندگان", component: <ProviderList /> },
    { id: "reports", label: "گزارش تامین کنندگان", component: <ProviderReport /> },
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

export default ProviderTabs;