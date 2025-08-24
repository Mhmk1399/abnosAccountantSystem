"use client";

import { useState, useRef } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import { ModalConfig } from "@/components/global/DynamicModal";

import toast from "react-hot-toast";
import type { Staff } from "@/types/finalTypes";

export default function Staff() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    type: "view",
  });
  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleView = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalConfig({
      title: `مشاهده اطلاعات ${staff.name}`,
      type: "view",
      size: "lg",
      fields: [
        { key: "title", label: "عنوان" },
        { key: "name", label: "نام و نام خانوادگی" },
        { key: "fatherName", label: "نام پدر" },
        { key: "nationalId", label: "کد ملی" },
        { key: "idNumber", label: "شماره شناسنامه" },
        { key: "idIssuePlace", label: "محل صدور شناسنامه" },
        { key: "birthPlace", label: "محل تولد" },
        { key: "birthDate", label: "تاریخ تولد", type: "date" },
        { key: "insuranceNumber", label: "شماره بیمه" },
        { key: "address", label: "آدرس", type: "textarea" },
        { key: "postalCode", label: "کد پستی" },
        { key: "homePhone", label: "تلفن ثابت" },
        { key: "mobilePhone", label: "تلفن همراه" },
        { key: "position", label: "سمت" },
        { key: "workplace", label: "محل کار" },
        { key: "educationLevel", label: "سطح تحصیلات" },
        { key: "fieldOfStudy", label: "رشته تحصیلی" },
        { key: "degreeYear", label: "سال اخذ مدرک" },
        { key: "workExperience", label: "سابقه کار", type: "textarea" },
        { key: "hireDate", label: "تاریخ استخدام", type: "date" },
        { key: "baseSalary", label: "حقوق پایه (تومان)" },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalConfig({
      title: `ویرایش اطلاعات ${staff.name}`,
      type: "edit",
      size: "lg",
      endpoint: `/api/staff`,
      method: "PATCH",
      fields: [
        {
          key: "title",
          label: "عنوان",
          type: "select",
          required: true,
          options: [
            { value: "خانم", label: "خانم" },
            { value: "آقاي", label: "آقای" },
          ],
        },
        {
          key: "name",
          label: "نام و نام خانوادگی",
          type: "text",
          required: true,
          placeholder: "نام و نام خانوادگی کارمند را وارد کنید",
        },
        {
          key: "fatherName",
          label: "نام پدر",
          type: "text",
          required: true,
          placeholder: "نام پدر را وارد کنید",
        },
        {
          key: "nationalId",
          label: "کد ملی",
          type: "text",
          required: true,
          placeholder: "کد ملی را وارد کنید",
        },
        {
          key: "idNumber",
          label: "شماره شناسنامه",
          type: "text",
          required: true,
          placeholder: "شماره شناسنامه را وارد کنید",
        },
        {
          key: "idIssuePlace",
          label: "محل صدور شناسنامه",
          type: "text",
          required: true,
          placeholder: "محل صدور شناسنامه را وارد کنید",
        },
        {
          key: "birthPlace",
          label: "محل تولد",
          type: "text",
          required: true,
          placeholder: "محل تولد را وارد کنید",
        },
        {
          key: "birthDate",
          label: "تاریخ تولد",
          type: "date",
          required: true,
        },
        {
          key: "insuranceNumber",
          label: "شماره بیمه",
          type: "text",
          required: true,
          placeholder: "شماره بیمه را وارد کنید",
        },
        {
          key: "address",
          label: "آدرس",
          type: "textarea",
          required: true,
          placeholder: "آدرس کامل را وارد کنید",
        },
        {
          key: "postalCode",
          label: "کد پستی",
          type: "text",
          required: true,
          placeholder: "کد پستی را وارد کنید",
        },
        {
          key: "homePhone",
          label: "تلفن ثابت",
          type: "tel",
          placeholder: "تلفن ثابت را وارد کنید",
        },
        {
          key: "mobilePhone",
          label: "تلفن همراه",
          type: "tel",
          required: true,
          placeholder: "تلفن همراه را وارد کنید",
        },
        {
          key: "position",
          label: "سمت",
          type: "text",
          required: true,
          placeholder: "سمت کارمند را وارد کنید",
        },
        {
          key: "workplace",
          label: "محل کار",
          type: "text",
          required: true,
          placeholder: "محل کار را وارد کنید",
        },
        {
          key: "educationLevel",
          label: "سطح تحصیلات",
          type: "select",
          required: true,
          options: [
            { value: "زیر دیپلم", label: "زیر دیپلم" },
            { value: "دیپلم", label: "دیپلم" },
            { value: "کاردانی", label: "کاردانی" },
            { value: "کارشناسی", label: "کارشناسی" },
            { value: "کارشناسی ارشد", label: "کارشناسی ارشد" },
            { value: "دکتری", label: "دکتری" },
          ],
        },
        {
          key: "fieldOfStudy",
          label: "رشته تحصیلی",
          type: "text",
          required: true,
          placeholder: "رشته تحصیلی را وارد کنید",
        },
        {
          key: "hireDate",
          label: "تاریخ استخدام",
          type: "date",
          required: true,
        },
        {
          key: "baseSalary",
          label: "حقوق پایه (تومان)",
          type: "number",
          required: true,
          placeholder: "حقوق پایه را وارد کنید",
        },
      ],
      onSuccess: () => {
        toast.success("اطلاعات کارمند با موفقیت بروزرسانی شد");
        setIsModalOpen(false);
        setSelectedStaff(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در بروزرسانی اطلاعات: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalConfig({
      title: `حذف کارمند`,
      type: "delete",
      endpoint: `/api/staff/id`,
      method: "DELETE",

      onSuccess: () => {
        toast.success("کارمند با موفقیت حذف شد");
        setIsModalOpen(false);
        setSelectedStaff(null);
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      },
      onError: (error) => {
        toast.error(`خطا در حذف کارمند: ${error}`);
      },
      onClose: () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
      },
    });
    setIsModalOpen(true);
  };

  const tableConfig: TableConfig = {
    title: "مدیریت کارمندان",
    description: "لیست کارمندان و اطلاعات آنها",
    endpoint: "/api/staff",
    columns: [
      {
        key: "name",
        label: "نام و نام خانوادگی",
        sortable: true,
      },
      {
        key: "nationalId",
        label: "کد ملی",
      },
      {
        key: "position",
        label: "سمت",
        sortable: true,
      },
      {
        key: "mobilePhone",
        label: "شماره تماس",
        type: "phone",
      },
      {
        key: "hireDate",
        label: "تاریخ استخدام",
        type: "date",
        sortable: true,
      },
    ],
    actions: {
      view: true,
      edit: true,
      delete: true,
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت کارمندان</h1>
      </div>

      <DynamicTable ref={tableRef} config={tableConfig} />

      {isModalOpen && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedStaff?._id}
          initialData={selectedStaff as Record<string, unknown> | undefined}
        />
      )}
    </div>
  );
}
