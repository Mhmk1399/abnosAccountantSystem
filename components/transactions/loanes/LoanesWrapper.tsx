"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableConfig } from "@/types/tables";
import { HiOutlineUserAdd } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";
import { Bank, DetailedAccount, Loan } from "@/types/finalTypes";

type Tab = "form" | "table";

const LoanesWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("form");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Loan | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
  const [detailedAccountOptions, setDetailedAccountOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch banks
        const bankResponse = await fetch("/api/bank");
        const bankData = await bankResponse.json();
        if (bankData.banks) {
          setBankOptions(bankData.banks.map((bank: Bank) => ({
            value: bank._id,
            label: bank.name,
          })));
        }

        // Fetch detailed accounts
        const detailedResponse = await fetch("/api/accounts/detailed");
        const detailedData = await detailedResponse.json();
        if (detailedData.detailedAccounts) {
          setDetailedAccountOptions(detailedData.detailedAccounts.map((acc: DetailedAccount) => ({
            value: acc._id,
            label: `${acc.code} - ${acc.name}`,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
    setSelectedItem(null);
    setSelectedItemId(null);
  };

  const handleAddClick = () => {
    setSelectedItem(null);
    setSelectedItemId(null);
    setModalConfig(
      loanFormConfig(null, handleFormSuccess, handleCloseModal, bankOptions, detailedAccountOptions)
    );
    setIsModalOpen(true);
  };

  const handleEditClick = (item: Loan) => {
    setSelectedItem(item);
    setSelectedItemId(item._id);
    setModalConfig(
      loanFormConfig(item, handleFormSuccess, handleCloseModal, bankOptions, detailedAccountOptions)
    );
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: Loan) => {
    setSelectedItem(item);
    setSelectedItemId(item._id);
    const config: ModalConfig = {
      title: "حذف وام",
      type: "delete",
      endpoint: "/api/transactions/loanes",
      method: "DELETE",
      fields: [],
      onSuccess: handleDeleteSuccess,
      onClose: handleCloseModal,
    };
    setModalConfig(config);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("وام با موفقیت حذف شد");
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    if (selectedItem) {
      toast.success("وام با موفقیت ویرایش شد");
    } else {
      toast.success("وام جدید با موفقیت اضافه شد");
      setActiveTab("table");
    }
  };

  const tableConfig: TableConfig = {
    endpoint: "/api/transactions/loanes",
    responseHandler: (res) => res.loanes,
    title: "لیست وام‌ها",
    description: "مدیریت وام‌ها",
    columns: [
      { key: "name", label: "نام", sortable: true },
      { key: "bank.name", label: "بانک", sortable: true },
      { key: "amount", label: "مبلغ", sortable: true, render: (value) => Number(value).toLocaleString() },
      { key: "paidperson.name", label: "پرداخت کننده", sortable: true },
      { key: "countOfIinstallments", label: "تعداد اقساط", sortable: true },
      { key: "amountOfIinstallments", label: "مبلغ قسط", sortable: true, render: (value) => Number(value).toLocaleString() },
    ],
    actions: {
      edit: true,
      delete: true,
    },
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  };

  const loanFormConfig = (
    item: Loan | null,
    onSuccess: () => void,
    onClose: () => void,
    bankOptions: { value: string; label: string }[],
    detailedAccountOptions: { value: string; label: string }[]
  ): ModalConfig => ({
    title: item ? "ویرایش وام" : "افزودن وام",
    endpoint: `/api/transactions/loanes`,
    method: item ? "PATCH" : "POST",
    type: item ? "edit" : "create",
    onClose,
    fields: [
      { key: "_id", label: "", type: "hidden" },
      {
        key: "name",
        label: "نام وام",
        type: "text",
        required: true,
      },
      {
        key: "bank",
        label: "بانک",
        type: "select",
        required: false,
        options: bankOptions,
      },
      {
        key: "amount",
        label: "مبلغ وام",
        type: "number",
        required: false,
      },
      {
        key: "paidperson",
        label: "پرداخت کننده",
        type: "select",
        required: false,
        options: detailedAccountOptions,
      },
      {
        key: "countOfIinstallments",
        label: "تعداد اقساط",
        type: "number",
        required: false,
      },
      {
        key: "amountOfIinstallments",
        label: "مبلغ هر قسط",
        type: "number",
        required: false,
      },
    ],
    onSuccess,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        مدیریت وام‌ها
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 text-black gap-2" dir="rtl">
        <button
          className={`px-4 py-2 ${
            activeTab === "form" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("form")}
        >
          ثبت وام جدید
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("table")}
        >
          مشاهده وام‌ها
        </button>
      </div>

      {activeTab === "form" ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
            >
              <HiOutlineUserAdd className="ml-2" />
              افزودن وام جدید
            </button>
          </div>
        </div>
      ) : (
        <DynamicTable ref={tableRef} config={tableConfig} />
      )}

      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={selectedItem as Record<string, unknown> || {}}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default LoanesWrapper;