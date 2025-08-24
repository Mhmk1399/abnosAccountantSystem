"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableConfig } from "@/types/tables";
import { HiOutlineUserAdd } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";
import { Account, TypeOfDailyBookRow } from "@/types/finalTypes";

export interface TypeOfDailyBook extends Record<string, unknown> {
  name: string;
  _id: string;
  savedDebitAccount?: string; // as string for API
  savedCreditAccount?: string; // as string for API
  debitSampleDescriptions?: string[];
  creditSampleDescriptions?: string[];
}

const TypeOfDailyBookWrapper: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypeOfDailyBook | null>(
    null
  );
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [fixedAccountOptions, setFixedAccountOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchFixedAccounts = async () => {
      try {
        const response = await fetch("/api/accounts/fixedAccounts");
        const data = await response.json();
        if (data.fixedAccounts) {
          const options = data.fixedAccounts.map((acc: Account) => ({
            value: acc._id,
            label: `${acc.code} - ${acc.name}`,
          }));
          setFixedAccountOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch fixed accounts:", error);
      }
    };
    fetchFixedAccounts();
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
      typeOfDailyBookFormConfig(
        null,
        handleFormSuccess,
        handleCloseModal,
        fixedAccountOptions
      )
    );
    setIsModalOpen(true);
  };

  const handleEditClick = (item: TypeOfDailyBook) => {
    setSelectedItem(item);
    setSelectedItemId(item._id);
    setModalConfig(
      typeOfDailyBookFormConfig(
        item,
        handleFormSuccess,
        handleCloseModal,
        fixedAccountOptions
      )
    );
    setIsModalOpen(true);
  };

  const handleViewClick = (item: TypeOfDailyBook) => {
    setSelectedItem(item);
    setModalConfig({
      title: `مشاهده نوع دفتر روزنامه: ${item.name}`,
      type: "view",
      size: "md",
      fields: [
        { key: "name", label: "نام" },
        { key: "savedDebitAccount.name", label: "حساب بدهکار" },
        { key: "savedCreditAccount.name", label: "حساب بستانکار" },
        {
          key: "debitSampleDescriptions",
          label: "توضیحات نمونه بدهکار",
          type: "textarea",
          render: (value: unknown) => {
            if (Array.isArray(value)) {
              return value.join(", ");
            }
            return (value as string) || "-";
          },
        },
        {
          key: "creditSampleDescriptions",
          label: "توضیحات نمونه بستانکار",
          type: "textarea",
          render: (value: unknown) => {
            if (Array.isArray(value)) {
              return value.join(", ");
            }
            return (value as string) || "-";
          },
        },
      ],
      onClose: handleCloseModal,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: TypeOfDailyBook) => {
    setSelectedItem(item);
    setSelectedItemId(item._id);
    const config: ModalConfig = {
      title: "حذف نوع دفتر روزنامه",
      type: "delete",
      endpoint: "/api/typeOfDailyBook",
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
    toast.success("نوع دفتر روزنامه با موفقیت حذف شد");
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    if (selectedItem) {
      toast.success("نوع دفتر روزنامه با موفقیت ویرایش شد");
    } else {
      toast.success("نوع دفتر روزنامه جدید با موفقیت اضافه شد");
    }
  };

  const tableConfig: TableConfig = {
    endpoint: "/api/typeOfDailyBook",
    responseHandler: (res) => res.typeOfDailyBooks,
    title: "لیست انواع دفتر روزنامه",
    description: "مدیریت انواع دفتر روزنامه",
    columns: [
      { key: "name", label: "نام", sortable: true },
      {
        key: "savedDebitAccount.name",
        label: "حساب بدهکار",
        sortable: true,
        render: (value: unknown, row: Record<string, unknown>) => {
          const typedRow = row as unknown as TypeOfDailyBookRow;
          return typedRow.savedDebitAccount?.name || "-";
        },
      },
      {
        key: "savedCreditAccount.name",
        label: "حساب بستانکار",
        sortable: true,
        render: (value: unknown, row: Record<string, unknown>) => {
          const typedRow = row as unknown as TypeOfDailyBookRow;
          return typedRow.savedCreditAccount?.name || "-";
        },
      },
      {
        key: "debitSampleDescriptions",
        label: "توضیحات نمونه بدهکار",
        type: "textarea",
        render: (value: unknown) => {
          if (Array.isArray(value)) {
            return value.join(", ");
          }
          return (value as string) || "-";
        },
      },
      {
        key: "creditSampleDescriptions",
        label: "توضیحات نمونه بستانکار",
        type: "textarea",
        render: (value: unknown) => {
          if (Array.isArray(value)) {
            return value.join(", ");
          }
          return (value as string) || "-";
        },
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
    },
    onView: handleViewClick,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  };

  const typeOfDailyBookFormConfig = (
    item: TypeOfDailyBook | null,
    onSuccess: () => void,
    onClose: () => void,
    fixedAccountOptions: { value: string; label: string }[]
  ): ModalConfig => ({
    title: item ? "ویرایش نوع دفتر روزنامه" : "افزودن نوع دفتر روزنامه",
    endpoint: `/api/typeOfDailyBook`,
    method: item ? "PATCH" : "POST",
    type: item ? "edit" : "create",
    onClose,
    fields: [
      { key: "_id", label: "", type: "hidden" },
      {
        key: "name",
        label: "نام",
        type: "text",
        required: true,
      },
      {
        key: "savedDebitAccount",
        label: "حساب بدهکار",
        type: "select",
        required: false,
        options: fixedAccountOptions,
      },
      {
        key: "savedCreditAccount",
        label: "حساب بستانکار",
        type: "select",
        required: false,
        options: fixedAccountOptions,
      },
      {
        key: "debitSampleDescriptions",
        label: "توضیحات نمونه بدهکار",
        type: "textarea",
        required: false,
        placeholder: "توضیح اول, توضیح دوم, توضیح سوم",
      },
      {
        key: "creditSampleDescriptions",
        label: "توضیحات نمونه بستانکار",
        type: "textarea",
        required: false,
        placeholder: "توضیح اول, توضیح دوم, توضیح سوم",
      },
    ],
    onSuccess,
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <HiOutlineUserAdd className="ml-2" />
          افزودن نوع دفتر روزنامه
        </button>
      </div>
      <DynamicTable ref={tableRef} config={tableConfig} />
      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={selectedItem || undefined}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default TypeOfDailyBookWrapper;
