"use client";

import React, { useState, useRef } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import TransactionWizard from "./TransactionWizard";
import { TableColumn } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";

const TransactionManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
    setSelectedItemId(null);
  };

  
  const handleSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("عملیات با موفقیت به پایان رسید");
  };

  const columns: TableColumn[] = [
    { key: "type", label: "نوع" },
    { key: "amount", label: "شماره", type: "number" },
    { key: "date", label: "تاریخ", type: "date" },
    { key: "payType", label: "نوع پرداخت" },
    { key: "description", label: "توضیحات" },
  ];

  const openModal = (
    type: "create" | "edit" | "view" | "delete",
    itemId?: string
  ) => {
    if (type === "create") {
      setIsWizardOpen(true);
      return;
    }

    setSelectedItemId(itemId || null);
    const config: ModalConfig = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Transaction`,
      type: type,
      endpoint: "/api/transactions",
      method: type === "edit" ? "PATCH" : "DELETE",
      fields: [
        {
          key: "type",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { value: "paied", label: "Paid" },
            { value: "recived", label: "Received" },
          ],
        },
        {
          key: "sourceAccount",
          label: "Source Account",
          type: "select",
          required: true,
          optionsEndpoint: "/api/accounts/detailed",
          optionLabelKey: "name",
        },
        {
          key: "destinationAccount",
          label: "Destination Account",
          type: "select",
          required: true,
          optionsEndpoint: "/api/accounts/detailed",
          optionLabelKey: "name",
        },
        {
          key: "payType",
          label: "Payment Type",
          type: "select",
          required: true,
          options: [
            { value: "cash", label: "Cash" },
            { value: "check", label: "Check" },
            { value: "transfer", label: "Transfer" },
          ],
        },
        {
          key: "payDetail",
          label: "Payment Detail",
          type: "select",
          required: true,
          optionsEndpoint: "/api/transactions/cash", // This will need to be dynamic based on payType
          optionLabelKey: "_id",
        },
        { key: "amount", label: "Amount", type: "number", required: true },
        { key: "date", label: "Date", type: "date", required: true },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
      ],
      onSuccess: handleSuccess,
      onClose: handleCloseModal,
    };
    setModalConfig(config);
    setIsModalOpen(true);
  };

  return (
    <div className="relative h-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openModal("create")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ساخت تراکنش
        </button>
      </div>
      <DynamicTable
        ref={tableRef}
        config={{
          endpoint: "/api/transactions",
          columns: columns,
          title: "تراکنش ها",
          description: "مشاهده لیست تراکنش ها",
          responseHandler: (res) => res.transactions,
          actions: {
            view: true,
            edit: true,
            delete: true,
          },
          onEdit: (item) => openModal("edit", item._id),
          onDelete: (item) => openModal("delete", item._id),
          onView: (item) => openModal("view", item._id),
        }}
      />
      {isModalOpen && modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedItemId}
        />
      )}
      <TransactionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default TransactionManager;
