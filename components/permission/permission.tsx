"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Permission } from "@/types/finalTypes";

export default function Permission() {
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const [, setStaffs] = useState([]);

  const getStaffs = async () => {
    const response = await fetch("/api/staff");
    const data = await response.json();
    setStaffs(data.staffs || []);
    console.log("Loaded staff data:", data.staffs);
  };
  useEffect(() => {
    getStaffs();
  }, []);
  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalConfig({
      title: `مشاهده اطلاعات مرخصی`,
      type: "view",
      size: "md",
      fields: [
        { key: "staff.name", label: "نام کارمند" },
        { key: "date", label: "تاریخ", type: "date" },
        { key: "description", label: "توضیحات" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedPermission(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    // Create a modified permission object with staff ID extracted
    const modifiedPermission = {
      ...permission,
      // If staff is an object, extract just the ID
      staff:
        permission.staff && typeof permission.staff === "object"
          ? permission.staff._id
          : permission.staff,
    };

    console.log("Original permission:", permission);
    console.log("Modified permission for edit:", modifiedPermission);

    setSelectedPermission(permission);
    setModalConfig({
      title: `ویرایش اطلاعات مرخصی`,
      type: "edit",
      size: "md",
      endpoint: `/api/permissions`,
      method: "PATCH",
      fields: [
        {
          key: "date",
          label: "تاریخ",
          type: "date",
          required: true,
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
        },
      ],
      onSuccess: () => {
        toast.success("اطلاعات مرخصی با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedPermission(null);
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی اطلاعات: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedPermission(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalConfig({
      title: `حذف مرخصی`,
      type: "delete",
      endpoint: `/api/permissions`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("مرخصی با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedPermission(null);
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در حذف مرخصی: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedPermission(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت مرخصی‌ها",
    description: "لیست مرخصی‌های کارمندان",
    endpoint: "/api/permissions",
    columns: [
      {
        key: "staff.name",
        label: "نام کارمند",
        type: "text",
        sortable: true,
      },
      {
        key: "date",
        label: "تاریخ",
        type: "date",
        sortable: true,
      },
      {
        key: "description",
        label: "توضیحات",
      },
    ],
    actions: { view: true, edit: true, delete: true },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت مرخصی‌ها</h1>
        <Link href="/permission/new">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            ثبت مرخصی جدید
          </button>
        </Link>
      </div>

      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedPermission?._id}
          initialData={selectedPermission as Record<string, unknown> | undefined}
        />
      )}
    </div>
  );
}
