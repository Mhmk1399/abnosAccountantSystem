"use client";

import React, { useState } from "react";
import Staff from "./Staff";
import Deficit from "./Deficit";
import Rollcall from "./Rollcall";
import Salary from "./Salary";
import {
  HiOutlineUsers,
  HiOutlineMinusCircle,
  HiOutlineClipboardCheck,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
} from "react-icons/hi";
import SalaryCalculation from "./SalaryCalculation";
import SalaryLaws from "./SalaryLaws";
import Leave from "./leave";

type Tab =
  | "staff"
  | "deficit"
  | "rollcall"
  | "salary"
  | "salaryCalculation"
  | "salaryLaws"
  | "leave";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SalaryAndPersonelWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("staff");

  const tabs: TabConfig[] = [
    {
      id: "staff",
      label: "کارمندان",
      icon: HiOutlineUsers,
      description: "مدیریت اطلاعات کارمندان",
    },
    {
      id: "deficit",
      label: "کسورات",
      icon: HiOutlineMinusCircle,
      description: "مدیریت کسورات و جرائم",
    },
    {
      id: "rollcall",
      label: "حضور و غیاب",
      icon: HiOutlineClipboardCheck,
      description: "ثبت و مدیریت حضور و غیاب",
    },
    {
      id: "salary",
      label: "حقوق",
      icon: HiOutlineCurrencyDollar,
      description: "مدیریت حقوق و دستمزد",
    },
    {
      id: "leave",
      label: "مرخصی",
      icon: HiOutlineCalendar,
      description: "مدیریت مرخصی",
    },
    {
      id: "salaryCalculation",
      label: "محاسبه حقوق",
      icon: HiOutlineCurrencyDollar,
      description: "محاسبه حقوق کارمندان",
    },
    {
      id: "salaryLaws",
      label: "قوانین حقوق",
      icon: HiOutlineCurrencyDollar,
      description: "تنظیمات قوانین حقوق",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "staff":
        return <Staff />;
      case "deficit":
        return <Deficit />;
      case "rollcall":
        return <Rollcall />;
      case "salary":
        return <Salary />;
      case "salaryCalculation":
        return <SalaryCalculation />;
      case "salaryLaws":
        return <SalaryLaws />;
      case "leave":
        return <Leave />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[90rem] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              مدیریت حقوق و پرسنل
            </h1>
            <p className="text-gray-600">
              سیستم جامع مدیریت منابع انسانی و حقوق
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white  shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-wrap" dir="rtl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  className={`
                    flex-1 min-w-0 px-6 py-4 text-center transition-all duration-300 ease-in-out
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    ${
                      isActive
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-transparent text-gray-600 hover:text-gray-800"
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="animate-fadeIn">{renderContent()}</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .border-b-3 {
          border-bottom-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default SalaryAndPersonelWrapper;
