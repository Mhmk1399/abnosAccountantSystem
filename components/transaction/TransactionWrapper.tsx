"use client";

import React, { useState, useRef, useEffect, JSX } from "react";
import { gsap } from "gsap";
import {
  MdOutlineAllInbox,
  MdAttachMoney,
  MdCompareArrows,
  MdOutlineReceiptLong,
  MdOutlineBalance,
} from "react-icons/md";

import CashTransactionManager from "./CashTransactionManager";
import TransferTransactionManager from "./TransferTransactionManager";
import TransactionManager from "./TransactionManager";
import ChecksManagement from "./CheckTransactionManager";
import BankManager from "./BankManager";

type Tab = "cash" | "transfer" | "check" | "transaction" | "bank";

const TransactionWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("transaction");
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  
  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(
      tabContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: "transaction",
      label: "همه تراکنش‌ها",
      icon: <MdOutlineAllInbox size={22} />,
    },
    { id: "cash", label: "نقدی", icon: <MdAttachMoney size={22} /> },
    { id: "transfer", label: "انتقال", icon: <MdCompareArrows size={22} /> },
    { id: "check", label: "چک", icon: <MdOutlineReceiptLong size={22} /> },
    { id: "bank", label: "بانک", icon: <MdOutlineBalance size={22} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "cash":
        return <CashTransactionManager />;
      case "transfer":
        return <TransferTransactionManager />;
      case "check":
        return <ChecksManagement />;
      case "transaction":
        return <TransactionManager />;
      case "bank":
        return <BankManager />;
      default:
        return null;
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-10 md:py-16  min-h-screen "
      dir="rtl"
    >
      {/* Title */}
      <h1
        ref={titleRef}
        className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-indigo-900 tracking-tight leading-tight drop-shadow-md"
      >
        مدیریت تراکنش‌ها
      </h1>

      {/* Tabs */}
      <div
        ref={tabContainerRef}
        className="flex justify-start md:justify-center flex-wrap gap-3 mb-8 px-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center cursor-pointer gap-2 px-5 py-2 rounded-full transition-all font-medium text-sm md:text-base shadow-sm relative
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-50"
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[300px] transition-all duration-300"
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default TransactionWrapper;
