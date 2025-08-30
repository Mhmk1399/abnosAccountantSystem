"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import TableFilters, { FilterConfig } from "@/components/global/TableFilters";
import { TableConfig } from "@/types/tables";
import { HiOutlineUserAdd } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";

export interface Deficit extends Record<string, unknown> {
  staff: string; // As string for API calls
  type: "buy glass" | "punishment" | "help";
  _id: string;
  amount: number;
  month: number;
  year: number;
  day: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for when staff is populated from API
interface DeficitWithPopulatedStaff extends Omit<Deficit, 'staff'> {
  staff: { _id: string; name: string; title: string };
}

// Union type for table data
type DeficitTableRow = Deficit | DeficitWithPopulatedStaff;

export interface Staff {
  title: "خانم" | "آقاي";
  _id: string;
  name: string;
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

const Deficit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeficit, setSelectedDeficit] = useState<Deficit | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string | number>>({});
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [staffOptions, setStaffOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("/api/salaryandpersonels/staff");
        const data = await response.json();
        if (data.staff) {
          const options = data.staff.map((s: Staff) => ({
            value: s._id,
            label: s.name,
          }));
          setStaffOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
    setSelectedDeficit(null);
    setSelectedItemId(null);
  };

  const handleAddClick = () => {
    setSelectedDeficit(null);
    setSelectedItemId(null);
    setModalConfig(
      deficitFormConfig(null, handleFormSuccess, handleCloseModal, staffOptions)
    );
    setIsModalOpen(true);
  };

  const handleEditClick = (deficit: Deficit) => {
    console.log("Edit deficit data:", deficit);
    // Transform the data to match form expectations
    const transformedDeficit = {
      ...deficit,
      staff:
        typeof deficit.staff === "object" && deficit.staff !== null
          ? (deficit.staff as Staff)._id
          : deficit.staff,
    };

    console.log("Transformed deficit data:", transformedDeficit);
    setSelectedDeficit(transformedDeficit);
    setSelectedItemId(deficit._id);
    setModalConfig(
      deficitFormConfig(
        transformedDeficit,
        handleFormSuccess,
        handleCloseModal,
        staffOptions
      )
    );
    setIsModalOpen(true);
  };

  const handleDeleteClick = (deficit: Deficit) => {
    setSelectedDeficit(deficit);
    setSelectedItemId(deficit._id);
    const config: ModalConfig = {
      title: "حذف کسورات",
      type: "delete",
      endpoint: "/api/salaryandpersonels/deficits",
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
    toast.success("کسورات با موفقیت حذف شد");
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    if (selectedDeficit) {
      toast.success("کسورات با موفقیت ویرایش شد");
    } else {
      toast.success("کسورات جدید با موفقیت اضافه شد");
    }
  };

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "staff",
        label: "کارمند",
        type: "text",
        placeholder: "جستجو در نام کارمند..."
      },
      {
        key: "type",
        label: "نوع کسورات",
        type: "select",
        options: [
          { value: "buy glass", label: "خرید شیشه" },
          { value: "loanes", label: "وام" },
          { value: "punishment", label: "جریمه" },
          { value: "help", label: "مساعده" }
        ]
      },
      {
        key: "year",
        label: "سال",
        type: "text",
        placeholder: "جستجو در سال..."
      },
      {
        key: "month",
        label: "ماه",
        type: "select",
        options: [
          { value: "1", label: "فروردین" },
          { value: "2", label: "اردیبهشت" },
          { value: "3", label: "خرداد" },
          { value: "4", label: "تیر" },
          { value: "5", label: "مرداد" },
          { value: "6", label: "شهریور" },
          { value: "7", label: "مهر" },
          { value: "8", label: "آبان" },
          { value: "9", label: "آذر" },
          { value: "10", label: "دی" },
          { value: "11", label: "بهمن" },
          { value: "12", label: "اسفند" }
        ]
      }
    ],
    onFiltersChange: setFilters
  };

  const deficitTableConfig: TableConfig = {
    endpoint: "/api/salaryandpersonels/deficits",
    responseHandler: (res) => res.deficit,
    filters,
    itemsPerPage: 10,
    title: "لیست کسورات",
    description: "مدیریت کسورات",
    columns: [
      {
        key: "staff.name",
        label: "کارمند",
        sortable: true,
        render: (_value: unknown, row: unknown): React.ReactNode => {
          const deficitRow = row as DeficitTableRow;
          // Check if staff is populated object or just ID
          if (typeof deficitRow.staff === "object" && 'name' in deficitRow.staff) {
            return deficitRow.staff.name;
          }
          // If staff is just ID, find name from staffOptions
          const staffOption = staffOptions.find(
            (opt) => opt.value === deficitRow.staff as string
          );
          return staffOption?.label || "-";
        },
      },
      {
        key: "type",
        label: "نوع",
        sortable: true,
        render: (value: unknown): React.ReactNode => {
          const typeMap = {
            "buy glass": "خرید شیشه",
            punishment: "جریمه",
            help: "مساعده",
          };
          return typeof value === "string"
            ? typeMap[value as keyof typeof typeMap] || value || "-"
            : "-";
        },
      },
      {
        key: "amount",
        label: "مبلغ",
        sortable: true,
        render: (value) => Number(value).toLocaleString(),
      },
      { key: "day", label: "روز", sortable: true },
      {
        key: "month",
        label: "ماه",
        sortable: true,
        render: (value: unknown): React.ReactNode => {
          const monthNames = {
            1: "فروردین",
            2: "اردیبهشت",
            3: "خرداد",
            4: "تیر",
            5: "مرداد",
            6: "شهریور",
            7: "مهر",
            8: "آبان",
            9: "آذر",
            10: "دی",
            11: "بهمن",
            12: "اسفند"
          };
          return typeof value === "number" && value >= 1 && value <= 12
            ? monthNames[value as keyof typeof monthNames]
            : "-";
        }
      },
      { key: "year", label: "سال", sortable: true },
      { key: "description", label: "توضیحات" },
    ],
    actions: {
      edit: true,
      delete: true,
    },
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  };

  const deficitFormConfig = (
    deficit: Deficit | null,
    onSuccess: () => void,
    onClose: () => void,
    staffOptions: { value: string; label: string }[]
  ): ModalConfig => ({
    title: deficit ? "ویرایش کسورات" : "افزودن کسورات",
    endpoint: `/api/salaryandpersonels/deficits`,
    method: deficit ? "PATCH" : "POST",
    type: deficit ? "edit" : "create",
    onClose,
    fields: [
      { key: "_id", label: "", type: "hidden" },
      {
        key: "staff",
        label: "کارمند",
        type: "select",
        required: true,
        options: staffOptions,
      },
      {
        key: "type",
        label: "نوع",
        type: "select",
        required: true,
        options: [
          { value: "buy glass", label: "خرید شیشه" },
          { value: "loanes", label: "وام" },
          { value: "punishment", label: "جریمه" },
          { value: "help", label: "مساعده" },
        ],
      },
      { key: "amount", label: "مبلغ", type: "number", required: true },
      {
        key: "month",
        label: "ماه",
        type: "number",
        required: true,
        // min: 1,
        // max: 12,
      },
      { key: "year", label: "سال", type: "number", required: true },
      {
        key: "day",
        label: "روز",
        type: "number",
        required: true,
        // min: 1,
        // max: 31,
      },
      {
        key: "description",
        label: "توضیحات",
        type: "textarea",
        required: true,
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
          افزودن کسورات
        </button>
      </div>
      <TableFilters config={filterConfig} />
      <DynamicTable ref={tableRef} config={deficitTableConfig} />
      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={selectedDeficit || {}}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default Deficit;
