"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
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

  const deficitTableConfig: TableConfig = {
    endpoint: "/api/salaryandpersonels/deficits",
    responseHandler: (res) => res.deficit,
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
      { key: "month", label: "ماه", sortable: true },
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
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <HiOutlineUserAdd className="ml-2" />
          افزودن کسورات
        </button>
      </div>
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
