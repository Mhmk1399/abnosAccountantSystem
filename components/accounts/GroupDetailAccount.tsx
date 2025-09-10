"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import toast from "react-hot-toast";

interface GroupDetailAccountData {
  _id?: string;
  name: string;
  flag: string;
  description: string;
  status: "active" | "inactive" | "archived";
  detailedAccounts?: {
    _id: string;
    name: string;
    description?: string;
    code?: string;
    type?: string;
    customer?: string;
    balance?: {
      totalDebit: number;
      totalCredit: number;
      net: number;
    };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

const GroupDetailAccount: React.FC = () => {
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<GroupDetailAccountData | null>(null);
  const [createModalConfig, setCreateModalConfig] =
    useState<ModalConfig | null>(null);
  const [editModalConfig, setEditModalConfig] = useState<ModalConfig | null>(
    null
  );
  const [deleteModalConfig, setDeleteModalConfig] =
    useState<ModalConfig | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalConfig, setViewModalConfig] = useState<ModalConfig | null>(
    null
  );
  const [detailedAccounts, setDetailedAccounts] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchDetailedAccounts = async () => {
      try {
        const response = await fetch("/api/accounts/detailed");
        const result = await response.json();
        setDetailedAccounts(result.detailedAccounts || []);
      } catch (error) {
        console.error("Error fetching detailed accounts:", error);
      }
    };
    fetchDetailedAccounts();
  }, []);

  const handleCreateClick = () => {
    setCreateModalConfig({
      title: "ایجاد گروه حساب جدید",
      type: "create",
      endpoint: "/api/accounts/groupDetailAccount",
      method: "POST",
      fields: [
        {
          key: "name",
          label: "نام گروه حساب",
          type: "text",
          required: true,
          placeholder: "نام گروه حساب را وارد کنید",
        },
        {
          key: "flag",
          label: "شناسه یکتا",
          type: "text",
          required: true,
          placeholder: "شناسه یکتا برای گروه حساب",
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
          placeholder: "توضیحات گروه حساب",
        },
        {
          key: "detailedAccounts",
          label: "حساب های تفصیلی",
          type: "select",
          multiple: true,
          options: detailedAccounts.map((acc) => ({
            value: acc._id,
            label: acc.name,
          })),
          placeholder: "حساب های تفصیلی را انتخاب کنید",
        },
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          options: [
            { value: "active", label: "فعال" },
            { value: "inactive", label: "غیرفعال" },
            { value: "archived", label: "آرشیو شده" },
          ],
        },
      ],
      onSuccess: handleCreateSuccess,
      onClose: handleCloseCreateModal,
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (row: GroupDetailAccountData) => {
    setSelectedItem(row);
    setEditModalConfig({
      title: "ویرایش گروه حساب",
      type: "edit",
      endpoint: "/api/accounts/groupDetailAccount",
      method: "PATCH",
      fields: [
        {
          key: "name",
          label: "نام گروه حساب",
          type: "text",
          required: true,
          placeholder: "نام گروه حساب را وارد کنید",
        },
        {
          key: "flag",
          label: "شناسه یکتا",
          type: "text",
          required: true,
          placeholder: "شناسه یکتا برای گروه حساب",
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
          placeholder: "توضیحات گروه حساب",
        },
        {
          key: "detailedAccounts",
          label: "حساب های تفصیلی",
          type: "select",
          multiple: true,
          options: detailedAccounts.map((acc) => ({
            value: acc._id,
            label: acc.name,
          })),
          placeholder: "حساب های تفصیلی را انتخاب کنید",
        },
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          options: [
            { value: "active", label: "فعال" },
            { value: "inactive", label: "غیرفعال" },
            { value: "archived", label: "آرشیو شده" },
          ],
        },
      ],
      onSuccess: handleEditSuccess,
      onClose: handleCloseEditModal,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (row: GroupDetailAccountData) => {
    setSelectedItem(row);
    setDeleteModalConfig({
      title: "حذف گروه حساب",
      type: "delete",
      endpoint: "/api/accounts/groupDetailAccount",
      method: "DELETE",
      fields: [],
      onSuccess: handleDeleteSuccess,
      onClose: handleCloseDeleteModal,
    });
    setIsDeleteModalOpen(true);
  };

  const handleCreateSuccess = () => {
    handleCloseCreateModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("گروه حساب با موفقیت ایجاد شد");
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("گروه حساب با موفقیت بهروزرسانی شد");
  };

  const handleDeleteSuccess = () => {
    handleCloseDeleteModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("گروه حساب با موفقیت حذف شد");
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateModalConfig(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditModalConfig(null);
    setSelectedItem(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteModalConfig(null);
    setSelectedItem(null);
  };

  const handleViewClick = (row: GroupDetailAccountData) => {
    setSelectedItem(row);
    setViewModalConfig({
      title: "مشاهده گروه حساب",
      type: "view",
      fields: [
        { key: "name", label: "نام گروه حساب", type: "text" },
        { key: "flag", label: "شناسه یکتا", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "detailedAccounts", label: "حساب های تفصیلی", type: "text" },
        { key: "status", label: "وضعیت", type: "text" },
      ],
      onClose: handleCloseViewModal,
    });
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewModalConfig(null);
    setSelectedItem(null);
  };

  const groupDetailAccountTableConfig: TableConfig = {
    endpoint: "/api/accounts/groupDetailAccount",
    responseHandler: (res) => res.groupDetailAccounts,
    title: "لیست گروه های حساب",
    description: "مدیریت گروه های حساب تفصیلی",
    enableFilters: true,
    columns: [
      {
        key: "name",
        label: "نام گروه حساب",
        filterable: true,
        filterType: "text",
        placeholder: "جستجو در نام گروه حساب",
      },
      {
        key: "flag",
        label: "شناسه یکتا",
        filterable: true,
        filterType: "text",
        placeholder: "جستجو در شناسه یکتا",
      },
      { key: "description", label: "توضیحات" },
      {
        key: "status",
        label: "وضعیت",
        render: (value: unknown) => {
          const statusMap = {
            active: "فعال",
            inactive: "غیرفعال",
            archived: "آرشیو شده",
          };
          return statusMap[value as keyof typeof statusMap] || String(value);
        },
      },
      {
        key: "detailedAccounts",
        label: "حساب های تفصیلی",
        filterable: true,
        filterType: "select",
        placeholder: "انتخاب حساب تفصیلی",
        filterOptions: detailedAccounts.map((acc, index) => ({
          value: acc.name,
          label: acc.name,
          key: acc._id || `acc-${index}`,
        })),
        render: (value: unknown) => {
          if (Array.isArray(value)) {
            return (
              value
                .map((acc) => {
                  if (
                    typeof acc === "object" &&
                    acc !== null &&
                    "name" in acc
                  ) {
                    return String(acc.name || "");
                  }
                  return String(acc || "");
                })
                .filter((name) => name)
                .join(", ") || "-"
            );
          }
          return "-";
        },
      },
      { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
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

  return (
    <div className="min-h-screen pt-20 ">
      <div className=" mx-auto">
        <div className="bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  مدیریت گروه های حساب
                </h1>
                <p className="text-gray-600 mt-2">
                  مدیریت گروه های حساب تفصیلی سیستم
                </p>
              </div>
              <button
                onClick={handleCreateClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <span>+</span>
                ایجاد گروه حساب جدید
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <DynamicTable
              ref={tableRef}
              config={groupDetailAccountTableConfig}
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {createModalConfig && (
        <DynamicModal isOpen={isCreateModalOpen} config={createModalConfig} />
      )}

      {/* Edit Modal */}
      {editModalConfig && (
        <DynamicModal
          isOpen={isEditModalOpen}
          config={editModalConfig}
          itemId={selectedItem?._id}
          initialData={{
            name: selectedItem?.name,
            flag: selectedItem?.flag,
            description: selectedItem?.description,
            detailedAccounts: selectedItem?.detailedAccounts,
            status: selectedItem?.status,
          }}
        />
      )}

      {/* View Modal */}
      {viewModalConfig && (
        <DynamicModal
          isOpen={isViewModalOpen}
          config={viewModalConfig}
          initialData={{
            name: selectedItem?.name,
            flag: selectedItem?.flag,
            description: selectedItem?.description,
            detailedAccounts: Array.isArray(selectedItem?.detailedAccounts)
              ? selectedItem.detailedAccounts
                  .map((acc) => acc.name || acc)
                  .join(", ")
              : "-",
            status:
              selectedItem?.status === "active"
                ? "فعال"
                : selectedItem?.status === "inactive"
                ? "غیرفعال"
                : "آرشیو شده",
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteModalConfig && (
        <DynamicModal
          isOpen={isDeleteModalOpen}
          config={deleteModalConfig}
          itemId={selectedItem?._id}
        />
      )}
    </div>
  );
};

export default GroupDetailAccount;
