"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";
import Link from "next/link";
import toast from "react-hot-toast";
import { Staff, type Deficit } from "@/types/finalTypes";

export default function Deficit() {
  const [selectedDeficit, setSelectedDeficit] = useState<Deficit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const [staffs, setStaffs] = useState([]);

  const getStaffs = async () => {
    const response = await fetch("/api/staff");
    const data = await response.json();
    setStaffs(data.data || []);
  };

  useEffect(() => {
    getStaffs();
  }, []);

  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleView = (deficit: Deficit) => {
    setSelectedDeficit(deficit);
    setModalConfig({
      title: `مشاهده اطلاعات کسری`,
      type: "view",
      size: "md",
      fields: [
        { key: "staff.name", label: "نام کارمند" },
        { key: "amount", label: "مبلغ (تومان)" },
        { key: "description", label: "توضیحات" },
        { key: "createdAt", label: "تاریخ ثبت", type: "date" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedDeficit(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (deficit: Deficit) => {
    // Create a modified deficit object with staff ID extracted
    // const modifiedDeficit = {
    //   ...deficit,
    //   // If staff is an object, extract just the ID
    //   staff: deficit.staff && typeof deficit.staff === 'object' ? deficit.staff._id : deficit.staff
    // };

    setSelectedDeficit(deficit);
    setModalConfig({
      title: `ویرایش اطلاعات کسری`,
      type: "edit",
      size: "md",
      endpoint: `/api/deficits`,
      method: "PUT",
      fields: [
        {
          key: "staff",
          label: "کارمند",
          type: "select",
          required: true,
          options: staffs.map((staff: Staff) => ({
            value: staff._id,
            label: staff.name,
          })),
        },
        {
          key: "amount",
          label: "مبلغ (تومان)",
          type: "number",
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
        toast.success("اطلاعات کسری با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedDeficit(null);
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی اطلاعات: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedDeficit(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (deficit: Deficit) => {
    setSelectedDeficit(deficit);
    setModalConfig({
      title: `حذف کسری`,
      type: "delete",
      endpoint: `/api/deficits`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("کسری با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedDeficit(null);
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در حذف کسری: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedDeficit(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت کسری‌ها",
    description: "لیست کسری‌های کارمندان",
    endpoint: "/api/deficits",
    columns: [
      {
        key: "staff.name",
        label: "نام کارمند",
        sortable: true,
      },
      {
        key: "amount",
        label: "مبلغ (تومان)",
        sortable: true,
        render: (value) => {
          return value ? value.toLocaleString("fa-IR") : "-";
        },
      },
      {
        key: "description",
        label: "توضیحات",
      },
      {
        key: "createdAt",
        label: "تاریخ ثبت",
        type: "date",
        sortable: true,
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
        <h1 className="text-2xl font-bold">مدیریت کسری‌ها</h1>
        <Link href="/deficit/new">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            ثبت کسری جدید
          </button>
        </Link>
      </div>

      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedDeficit?._id}
          initialData={selectedDeficit || undefined}
        />
      )}
    </div>
  );
}
