"use client";

import { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";
import type { Rollcall, Staff } from "@/types/finalTypes";

export default function Rollcall() {
  const [selectedRollcall, setSelectedRollcall] = useState<Rollcall | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const [staffRes, rollcallRes] = await Promise.all([
      fetch("/api/staff"),
      fetch("/api/rollcall"),
    ]);
    const staffData = await staffRes.json();
    const rollcallData = await rollcallRes.json();

    const combined = (staffData.staffs || []).map((staff: Staff) => {
      const rollcall = (rollcallData.rollcalls || []).find(
        (r: Rollcall) => r.staff._id === staff._id
      );
      return {
        _id: rollcall?._id || staff._id,
        staff: { _id: staff._id, name: staff.name },
        date: rollcall?.date,
        status: rollcall?.status,
        entranceTime: rollcall?.entranceTime,
        exitTime: rollcall?.exitTime,
        description: rollcall?.description,
      };
    });
    setData(combined);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleView = (rollcall: Rollcall) => {
    setSelectedRollcall(rollcall);
    setModalConfig({
      title: `مشاهده اطلاعات حضور و غیاب`,
      type: "view",
      size: "md",
      fields: [
        { key: "staff.name", label: "نام کارمند" },
        { key: "date", label: "تاریخ", type: "date" },
        {
          key: "status",
          label: "وضعیت",
          type: "text",
        },
        {
          key: "entranceTime",
          label: "زمان ورود",
          type: "text",
        },
        {
          key: "exitTime",
          label: "زمان خروج",
          type: "text",
        },
        { key: "description", label: "توضیحات" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedRollcall(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (rollcall: Rollcall) => {
    // Create a modified rollcall object with staff ID extracted

    setSelectedRollcall(rollcall);
    setModalConfig({
      title: `ویرایش اطلاعات حضور و غیاب`,
      type: "edit",
      size: "md",
      endpoint: `/api/rollcall`,
      method: "PUT",
      fields: [
        {
          key: "persian-date",
          label: "تاریخ",
          type: "date",
          required: true,
        },
        {
          key: "status",
          label: "وضعیت",
          type: "select",
          required: true,
          options: [
            { value: "present", label: "حاضر" },
            { value: "absent", label: "غایب" },
            { value: "late", label: "تاخیر" },
          ],
        },
        {
          key: "entranceTime",
          label: "زمان ورود",
          type: "time",
        },
        {
          key: "exitTime",
          label: "زمان خروج",
          type: "time",
        },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
        },
      ],
      onSuccess: () => {
        toast.success("اطلاعات حضور و غیاب با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedRollcall(null);
        fetchData();
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی اطلاعات: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedRollcall(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (rollcall: Rollcall) => {
    setSelectedRollcall(rollcall);
    setModalConfig({
      title: `حذف رکورد حضور و غیاب`,
      type: "delete",
      endpoint: `/api/rollcall`,
      method: "DELETE",
      onSuccess: () => {
        toast.success("رکورد حضور و غیاب با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedRollcall(null);
        fetchData();
        if (tableRef.current) tableRef.current.refreshData();
      },
      onError: (error) => {
        toast.error(`خطا در حذف رکورد: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedRollcall(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت حضور و غیاب",
    description: "لیست حضور و غیاب کارمندان",
    endpoint: "/api/rollcall",
    responseHandler: () => data,
    columns: [
      {
        key: "staff.name",
        label: "نام کارمند",
        sortable: true,
      },
      {
        key: "date",
        label: "تاریخ",
        type: "date",
        sortable: true,
        render: (value: unknown) =>
          value ? new Date(value as string).toLocaleDateString("fa-IR") : "--",
      },
      {
        key: "status",
        label: "وضعیت",
        sortable: true,
        render: (value: unknown) => {
          if (!value) return "--";
          switch (value) {
            case "present":
              return "حاضر";
            case "absent":
              return "غایب";
            case "late":
              return "تاخیر";
            default:
              return "--";
          }
        },
      },
      {
        key: "entranceTime",
        label: "زمان ورود",
        type: "text",
        render: (value: unknown) => (value ? String(value) : "--"),
      },
      {
        key: "exitTime",
        label: "زمان خروج",
        type: "text",
        render: (value: unknown) => (value ? String(value) : "--"),
      },
    ],
    actions: { view: true, edit: true, delete: true },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedRollcall?._id}
          initialData={selectedRollcall as Record<string, unknown> | undefined}
        />
      )}
    </div>
  );
}
