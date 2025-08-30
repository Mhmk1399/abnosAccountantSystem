"use client";

import React, { useState, useRef } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import TableFilters, { FilterConfig } from "@/components/global/TableFilters";
import { TableConfig } from "@/types/tables";
import { HiOutlineUserAdd } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";

export interface Staff extends Record<string, unknown> {
  title: "خانم" | "آقاي";
  name: string;
  _id: string;
  fatherName: string;
  machineidNumber?: string;
  birthPlace: string;
  birthDate: Date;
  nationalId: string;
  insuranceNumber?: string;
  address: string;
  postalCode?: string;
  homePhone?: string;
  mobilePhone: string;
  workExperience?: string;
  position: string;
  workplace: string;
  educationLevel: string;
  contracthireDate: Date;
  contractendDate?: Date;
  childrenCounts: number;
  personalNumber?: string;
  ismaried: boolean;
  baseSalary?: number;
  hourlywage?: number;
  housingAllowance?: number;
  workerVoucher?: number;
  detailedAccount?: string; // as string for API
  isActive?: boolean;
}

const Staff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string | number>>({});
  const tableRef = useRef<{ refreshData: () => void }>(null);

  const handleAddClick = () => {
    setSelectedStaff(null);
    setSelectedItemId(null);
    setModalConfig(staffFormConfig(null, handleFormSuccess, handleCloseModal));
    setIsModalOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedItemId(staff._id);
    setModalConfig(staffFormConfig(staff, handleFormSuccess, handleCloseModal));
    setIsModalOpen(true);
  };

  const handleViewClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setModalConfig({
      title: `مشاهده کارمند: ${staff.name}`,
      type: "view",
      size: "lg",
      fields: [
        { key: "title", label: "عنوان" },
        { key: "name", label: "نام" },
        { key: "fatherName", label: "نام پدر" },
        { key: "machineidNumber", label: "شماره دستگاه" },
        { key: "birthPlace", label: "محل تولد" },
        { key: "birthDate", label: "تاریخ تولد", type: "date" },
        { key: "nationalId", label: "کد ملی" },
        { key: "insuranceNumber", label: "شماره بیمه" },
        { key: "address", label: "آدرس", type: "textarea" },
        { key: "postalCode", label: "کد پستی" },
        { key: "homePhone", label: "تلفن ثابت" },
        { key: "mobilePhone", label: "موبایل" },
        { key: "workExperience", label: "سابقه کار" },
        { key: "position", label: "موقعیت شغلی" },
        { key: "workplace", label: "محل کار" },
        { key: "educationLevel", label: "سطح تحصیلات" },
        { key: "contracthireDate", label: "تاریخ شروع قرارداد", type: "date" },
        { key: "contractendDate", label: "تاریخ پایان قرارداد", type: "date" },
        { key: "childrenCounts", label: "تعداد فرزندان" },
        { key: "personalNumber", label: "شماره پرسنلی" },
        {
          key: "ismaried",
          label: "وضعیت تاهل",
          render: (value: unknown) => (value ? "متاهل" : "مجرد"),
        },
        {
          key: "baseSalary",
          label: "حقوق پایه",
          render: (value: unknown) =>
            value ? Number(value).toLocaleString() : "-",
        },
        {
          key: "hourlywage",
          label: "دستمزد ساعتی",
          render: (value: unknown) =>
            value ? Number(value).toLocaleString() : "-",
        },
        {
          key: "housingAllowance",
          label: "کمک مسکن",
          render: (value: unknown) =>
            value ? Number(value).toLocaleString() : "-",
        },
        {
          key: "workerVoucher",
          label: "بن کارگری",
          render: (value: unknown) =>
            value ? Number(value).toLocaleString() : "-",
        },
        {
          key: "isActive",
          label: "وضعیت فعالیت",
          render: (value: unknown) => (value ? "فعال" : "غیرفعال"),
        },
      ],
      onClose: handleCloseModal,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedItemId(staff._id);
    const config: ModalConfig = {
      title: "حذف کارمند",
      type: "delete",
      endpoint: "/api/salaryandpersonels/staff",
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
    toast.success(`کارمند ${selectedStaff?.name || ""} با موفقیت حذف شد`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
    setSelectedStaff(null);
    setSelectedItemId(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    if (selectedStaff) {
      toast.success(`کارمند ${selectedStaff.name} با موفقیت ویرایش شد`);
    } else {
      toast.success("کارمند جدید با موفقیت اضافه شد");
    }
  };

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "name",
        label: "نام کارمند",
        type: "text",
        placeholder: "جستجو در نام کارمند..."
      },
      {
        key: "nationalId",
        label: "کد ملی",
        type: "text",
        placeholder: "جستجو در کد ملی..."
      },
      {
        key: "position",
        label: "موقعیت شغلی",
        type: "text",
        placeholder: "جستجو در موقعیت شغلی..."
      },
      {
        key: "isActive",
        label: "وضعیت فعالیت",
        type: "select",
        options: [
          { value: "true", label: "فعال" },
          { value: "false", label: "غیرفعال" }
        ]
      },
      {
        key: "ismaried",
        label: "وضعیت تاهل",
        type: "select",
        options: [
          { value: "true", label: "متاهل" },
          { value: "false", label: "مجرد" }
        ]
      },
      {
        key: "contracthireDate",
        label: "تاریخ استخدام",
        type: "dateRange"
      }
    ],
    onFiltersChange: setFilters
  };

  const staffTableConfig: TableConfig = {
    endpoint: "/api/salaryandpersonels/staff",
    responseHandler: (res) => res.staff,
    filters,
    itemsPerPage: 10,
    title: "لیست کارمندان",
    description: "مدیریت کارمندان",
    columns: [
      { key: "name", label: "نام", sortable: true },
      { key: "fatherName", label: "نام پدر" },
      { key: "personalNumber", label: "شماره پرسنلی" },
      { key: "nationalId", label: "کد ملی", sortable: true },
      { key: "position", label: "موقعیت شغلی" },
      { key: "mobilePhone", label: "موبایل" },
      {
        key: "workExperience",
        label: "سابقه کار",
        render: (value: unknown, row: Staff) => {
          console.log(value)
          if (row.contracthireDate) {
            const hireDate = new Date(row.contracthireDate);
            const now = new Date();

            if (hireDate > now) return "تاریخ نامعتبر";

            let years = now.getFullYear() - hireDate.getFullYear();
            let months = now.getMonth() - hireDate.getMonth();
            let days = now.getDate() - hireDate.getDate();

            if (days < 0) {
              months--;
              const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
              days += lastMonth.getDate();
            }

            if (months < 0) {
              years--;
              months += 12;
            }

            let result = "";
            if (years > 0) result += `${years} سال`;
            if (months > 0) result += `${result ? " و " : ""}${months} ماه`;
            if (days > 0) result += `${result ? " و " : ""}${days} روز`;

            return result || "0 روز";
          }
          return "-";
        },
      },
      {
        key: "contracthireDate",
        label: "تاریخ استخدام",
        type: "date",
        sortable: true,
      },
      { key: "contractendDate", label: "تاریخ پایان قرارداد", type: "date" },
      { key: "baseSalary", label: "حقوق پایه" },
      { key: "annualrewards", label: "پاداش سالانه" },
      { key: "hourlywage", label: "دستمزد ساعتی" },
      {
        key: "isActive",
        label: "وضعیت",
        type: "boolean",
        render: (value: boolean) => (value ? "فعال" : "غیرفعال"),
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

  const staffFormConfig = (
    staff: Staff | null,
    onSuccess: () => void,
    onClose: () => void
  ): ModalConfig => ({
    title: staff ? "ویرایش کارمند" : "افزودن کارمند",
    endpoint: `/api/salaryandpersonels/staff`,
    method: staff ? "PATCH" : "POST",
    type: staff ? "edit" : "create",
    onClose,
    fields: [
      { key: "_id", label: "", type: "hidden" },
      {
        key: "title",
        label: "عنوان",
        type: "select",
        required: true,
        options: [
          { value: "آقاي", label: "آقای" },
          { value: "خانم", label: "خانم" },
        ],
      },
      { key: "name", label: "نام", type: "text", required: true },
      { key: "fatherName", label: "نام پدر", type: "text", required: true },
      {
        key: "machineidNumber",
        label: "شماره دستگاه",
        type: "number",
        required: false,
      },
      { key: "birthPlace", label: "محل تولد", type: "text", required: true },
      { key: "birthDate", label: "تاریخ تولد", type: "date", required: true },
      { key: "nationalId", label: "کد ملی", type: "number", required: true },
      {
        key: "insuranceNumber",
        label: "شماره بیمه",
        type: "number",
        required: false,
      },
      { key: "address", label: "آدرس", type: "textarea", required: true },
      { key: "postalCode", label: "کد پستی", type: "number", required: false },
      { key: "homePhone", label: "تلفن ثابت", type: "number" },
      { key: "mobilePhone", label: "موبایل", type: "number", required: true },
      {
        key: "contracthireDate",
        label: "تاریخ شروع قرارداد",
        type: "date",
        required: true,
      },
      {
        key: "workExperience",
        label: "سابقه کار",
        type: "text",
        computed: true,
        computeValue: (formData) => {
          if (formData.contracthireDate) {
            const hireDate = new Date(String(formData.contracthireDate));
            const now = new Date();

            // Check if hire date is in the future
            if (hireDate > now) {
              return "تاریخ نامعتبر - تاریخ آینده مجاز نیست";
            }

            let years = now.getFullYear() - hireDate.getFullYear();
            let months = now.getMonth() - hireDate.getMonth();
            let days = now.getDate() - hireDate.getDate();

            if (days < 0) {
              months--;
              const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
              days += lastMonth.getDate();
            }

            if (months < 0) {
              years--;
              months += 12;
            }

            let result = "";
            if (years > 0) result += `${years} سال`;
            if (months > 0) result += `${result ? " و " : ""}${months} ماه`;
            if (days > 0) result += `${result ? " و " : ""}${days} روز`;

            return result || "0 روز";
          }
          return "";
        },
      },
      { key: "position", label: "موقعیت شغلی", type: "text", required: true },
      { key: "workplace", label: "محل کار", type: "text", required: true },
      {
        key: "educationLevel",
        label: "سطح تحصیلات",
        type: "text",
        required: true,
      },

      { key: "contractendDate", label: "تاریخ پایان قرارداد", type: "date" },
      {
        key: "childrenCounts",
        label: "تعداد فرزندان",
        type: "number",
        required: true,
      },
      { key: "personalNumber", label: "شماره پرسنلی", type: "text" },
      {
        key: "ismaried",
        label: "وضعیت تاهل",
        type: "select",
        required: true,
        options: [
          { value: true, label: "متاهل" },
          { value: false, label: "مجرد" },
        ],
      },
      { key: "baseSalary", label: "حقوق پایه", type: "number", required: true },
      { key: "annualrewards", label: "پاداش سالانه", type: "number" },
      { key: "hourlywage", label: "دستمزد ساعتی", type: "number" },
      {
        key: "isActive",
        label: "وضعیت فعالیت",
        type: "select",
        required: true,
        options: [
          { value: true, label: "فعال" },
          { value: false, label: "غیرفعال" },
        ],
      },
    ],
    onSuccess,
  });

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <HiOutlineUserAdd className="ml-2" />
          افزودن کارمند
        </button>
      </div>
      <TableFilters config={filterConfig} />
      <DynamicTable ref={tableRef} config={staffTableConfig} />
      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={selectedStaff || undefined}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default Staff;
