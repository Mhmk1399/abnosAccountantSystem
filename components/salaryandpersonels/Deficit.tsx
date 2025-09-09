"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableConfig } from "@/types/tables";
import { HiOutlineUserAdd } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import FormattedNumberInput from "@/utils/FormattedNumberInput";
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
  const [currentView, setCurrentView] = useState<'staff' | 'deficits'>('staff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeficit, setSelectedDeficit] = useState<Deficit | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [staffOptions, setStaffOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

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

  const handleAddDeficitForStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedDeficit(null);
    setSelectedItemId(null);
    setModalConfig(
      deficitFormConfigForStaff(staff, handleFormSuccess, handleCloseModal)
    );
    setIsModalOpen(true);
  };

  const handleAddDeficit = () => {
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

  const deficitFormConfigForStaff = (
    staff: Staff,
    onSuccess: () => void,
    onClose: () => void
  ): ModalConfig => {
    const now = new Date();
    const persianDate = now.toLocaleDateString('fa-IR-u-nu-latn').split('/');
    return {
      title: `افزودن کسورات برای ${staff.name}`,
      endpoint: `/api/salaryandpersonels/deficits`,
      method: "POST",
      type: "create",
      onClose,
      initialData: {
        staff: staff._id,
        day: parseInt(persianDate[2]),
        month: parseInt(persianDate[1]),
        year: parseInt(persianDate[0]),
      },
      fields: [
        { key: "staff", label: "", type: "hidden" },
        {
          key: "type",
          label: "نوع",
          type: "select",
          required: true,
          options: [
            { value: "buy glass", label: "خرید شیشه" },
            { value: "punishment", label: "جریمه" },
            { value: "help", label: "مساعده" },
          ],
        },
        { key: "amount", label: "مبلغ", type: "formatted-number", required: true, placeholder: "مبلغ کسورات" },
        {
          key: "description",
          label: "توضیحات",
          type: "textarea",
          required: true,
          placeholder: "توضیحات کسورات را وارد کنید"
        },
        { key: "day", label: "", type: "hidden" },
        { key: "month", label: "", type: "hidden" },
        { key: "year", label: "", type: "hidden" },
      ],
      onSuccess,
    };
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
          { value: "punishment", label: "جریمه" },
          { value: "help", label: "مساعده" },
        ],
      },
      { key: "amount", label: "مبلغ", type: "formatted-number", required: true, placeholder: "مبلغ کسورات" },
      { key: "month", label: "ماه", type: "number", required: true, placeholder: "ماه (1-12)" },
      { key: "year", label: "سال", type: "number", required: true, placeholder: "سال (مثال: 1403)" },
      { key: "day", label: "روز", type: "number", required: true, placeholder: "روز (1-31)" },
      {
        key: "description",
        label: "توضیحات",
        type: "textarea",
        required: true,
        placeholder: "توضیحات کسورات را وارد کنید"
      },
    ],
    onSuccess,
  });

  const staffTableConfig: TableConfig = {
    endpoint: "/api/salaryandpersonels/staff",
    responseHandler: (res) => res.staff,
    title: "لیست کارمندان",
    description: "افزودن کسورات برای کارمندان",
    columns: [
      { key: "name", label: "نام", sortable: true },
      { key: "title", label: "عنوان", sortable: true },
      { key: "position", label: "سمت", sortable: true },
      { key: "mobilePhone", label: "موبایل" },
    ],
    actions: {
      custom: [
        {
          label: "افزودن کسورات",
          onClick: handleAddDeficitForStaff,
          className: "bg-red-500 hover:bg-red-600 text-white",
        },
      ],
    },
  };

  const renderContent = () => {
    switch (currentView) {
      case 'staff':
        return <DynamicTable ref={tableRef} config={staffTableConfig} />;
      case 'deficits':
        return <DynamicTable ref={tableRef} config={deficitTableConfig} />;
      default:
        return <DynamicTable ref={tableRef} config={staffTableConfig} />;
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('staff')}
            className={`px-4 py-2 rounded-md ${
              currentView === 'staff'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            کارمندان
          </button>
          <button
            onClick={() => setCurrentView('deficits')}
            className={`px-4 py-2 rounded-md ${
              currentView === 'deficits'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            لیست کسورات
          </button>
        </div>
        {currentView === 'deficits' && (
          <button
            onClick={handleAddDeficit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <HiOutlineUserAdd className="ml-2" />
            افزودن کسورات
          </button>
        )}
      </div>
      {renderContent()}
      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={modalConfig.initialData || selectedDeficit || {}}
          itemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default Deficit;
