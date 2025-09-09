"use client";

import { useState, useRef } from "react";
import FormattedNumberInput from "@/utils/FormattedNumberInput";
import { useFiscalYear } from "@/contexts/FiscalYearContext";
import DynamicTable from "@/components/global/DynamicTable";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";
import { TableConfig } from "@/types/tables";
import toast from "react-hot-toast";

interface SalaryLawsData {
  _id?: string;
  year: number;
  workHoursPerDay: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance1: number;
  childAllowance2: number;
  seniorityPay: number;
  overtimeRate: number;
  holidayRate: number;
  taxRate: number;
  insuranceRate: number;
}

interface SalaryLawsWithYear extends Omit<SalaryLawsData, "year"> {
  year: {
    _id: string;
    name: string;
  };
}

interface FormField {
  key: keyof SalaryLawsData;
  label: string;
  type: string;
  step?: string;
  placeholder?: string;
}

const SalaryLaws: React.FC = () => {
  const { selectedFiscalYear, resetFiscalYear } = useFiscalYear();
  const [activeTab, setActiveTab] = useState<"form" | "table">("form");
  const tableRef = useRef<{ refreshData: () => void }>(null);
  const [formData, setFormData] = useState<SalaryLawsData>({
    year: selectedFiscalYear ? parseInt(selectedFiscalYear.name) : 1403,
    workHoursPerDay: 7.33,
    baseSalary: 5000000,
    housingAllowance: 500000,
    workerVoucher: 300000,
    childAllowance1: 200000,
    childAllowance2: 400000,
    seniorityPay: 100000,
    overtimeRate: 50000,
    holidayRate: 60000,
    taxRate: 0.1,
    insuranceRate: 0.07,
  });
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] =
    useState<SalaryLawsData | null>(null);
  const [deleteModalConfig, setDeleteModalConfig] =
    useState<ModalConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] =
    useState<SalaryLawsData | null>(null);
  const [editModalConfig, setEditModalConfig] = useState<ModalConfig | null>(
    null
  );

  const resetForm = () => {
    setFormData({
      year: selectedFiscalYear ? parseInt(selectedFiscalYear.name) : 1403,
      workHoursPerDay: 7.33,
      baseSalary: 5000000,
      housingAllowance: 500000,
      workerVoucher: 300000,
      childAllowance1: 200000,
      childAllowance2: 400000,
      seniorityPay: 100000,
      overtimeRate: 50000,
      holidayRate: 60000,
      taxRate: 0.1,
      insuranceRate: 0.07,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = formData._id ? "PATCH" : "POST";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (formData._id) headers.id = formData._id;

      const backendData = {
        ...formData,
        year: selectedFiscalYear ? selectedFiscalYear._id : null,
        childAllowance: formData.childAllowance1,
      };

      const response = await fetch("/api/salaryandpersonels/salaryLaws", {
        method,
        headers,
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        toast.success("قوانین حقوق با موفقیت ذخیره شد");
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
        if (!formData._id) {
          resetForm();
        }
      } else {
        const result = await response.json();
        toast.error("خطا: " + result.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof SalaryLawsData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = (row: SalaryLawsData) => {
    setSelectedItemForEdit(row);
    setEditModalConfig({
      title: "ویرایش قانون حقوق",
      type: "edit",
      endpoint: "/api/salaryandpersonels/salaryLaws",
      method: "PATCH",
      fields: [
        {
          key: "workHoursPerDay",
          label: "ساعت کار روزانه",
          type: "number",
          required: true,
        },
        {
          key: "baseSalary",
          label: "حقوق پایه",
          type: "formatted-number",
          required: true,
        },
        {
          key: "housingAllowance",
          label: "کمک هزینه مسکن",
          type: "formatted-number",
          required: true,
        },
        {
          key: "workerVoucher",
          label: "بن کارگری",
          type: "formatted-number",
          required: true,
        },
        {
          key: "childAllowance1",
          label: "کمک هزینه فرزند اول",
          type: "formatted-number",
          required: true,
        },
        {
          key: "childAllowance2",
          label: "کمک هزینه فرزند دوم",
          type: "formatted-number",
          required: true,
        },
        {
          key: "seniorityPay",
          label: "پاداش سنوات",
          type: "formatted-number",
          required: true,
        },
        {
          key: "overtimeRate",
          label: "نرخ اضافه کار",
          type: "formatted-number",
          required: true,
        },
        {
          key: "holidayRate",
          label: "نرخ کار تعطیل",
          type: "formatted-number",
          required: true,
        },
        {
          key: "taxRate",
          label: "نرخ مالیات",
          type: "number",
          required: true,
        },
        {
          key: "insuranceRate",
          label: "نرخ بیمه",
          type: "number",
          required: true,
        },
      ],
      onSuccess: handleEditSuccess,
      onClose: handleCloseEditModal,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (row: SalaryLawsData) => {
    setSelectedItemForDelete(row);
    setDeleteModalConfig({
      title: "حذف قانون حقوق",
      type: "delete",
      endpoint: "/api/salaryandpersonels/salaryLaws",
      method: "DELETE",
      fields: [],
      onSuccess: handleDeleteSuccess,
      onClose: handleCloseDeleteModal,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    handleCloseDeleteModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("قانون حقوق با موفقیت حذف شد");
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteModalConfig(null);
    setSelectedItemForDelete(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
    toast.success("قانون حقوق با موفقیت بهروزرسانی شد");
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditModalConfig(null);
    setSelectedItemForEdit(null);
  };

  const handleNewRecord = () => {
    resetForm();
    toast.success("فرم برای ایجاد جدید آماده شد");
  };

  const salaryLawsTableConfig: TableConfig = {
    endpoint: "/api/salaryandpersonels/salaryLaws",
    responseHandler: (res) => res.salaryLaws,
    title: "لیست قوانین حقوق",
    description: "مدیریت قوانین حقوق",
    columns: [
      {
        key: "year",
        label: "سال مالی",
        render: (value: unknown, row: SalaryLawsWithYear) =>
          row.year?.name || "-",
      },
      { key: "workHoursPerDay", label: "ساعت کار روزانه" },
      {
        key: "baseSalary",
        label: "حقوق پایه",
        render: (value: unknown) =>
          value ? Number(value).toLocaleString() : "-",
      },
      {
        key: "housingAllowance",
        label: "کمک هزینه مسکن",
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
        key: "childAllowance",
        label: "کمک هزینه فرزند",
        render: (value: unknown) =>
          value ? Number(value).toLocaleString() : "-",
      },
      {
        key: "seniorityPay",
        label: "سنوات",
        render: (value: unknown) =>
          value ? Number(value).toLocaleString() : "-",
      },
      {
        key: "overtimeRate",
        label: "نرخ اضافه کار",
        render: (value: unknown) =>
          value ? Number(value).toLocaleString() : "-",
      },
      {
        key: "holidayRate",
        label: "نرخ کار تعطیل",
        render: (value: unknown) =>
          value ? Number(value).toLocaleString() : "-",
      },
      { key: "taxRate", label: "نرخ مالیات" },
      { key: "insuranceRate", label: "نرخ بیمه" },
      { key: "createdAt", label: "تاریخ ایجاد", type: "date" },
    ],
    actions: {
      edit: true,
      delete: true,
    },
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  };

  const formSections: {
    title: string;
    description: string;
    fields: FormField[];
  }[] = [
    {
      title: "تنظیمات کلی",
      description: "پارامترهای اصلی سیستم حقوق و دستمزد",
      fields: [
        {
          key: "workHoursPerDay" as keyof SalaryLawsData,
          label: "ساعت کار روزانه",
          type: "number",
          step: "0.01",
          placeholder: "مثال: 8",
        },
      ],
    },
    {
      title: "حقوق و مزایای پایه",
      description: "مبالغ پایه حقوق و مزایای ثابت کارکنان",
      fields: [
        {
          key: "baseSalary" as keyof SalaryLawsData,
          label: "حقوق پایه",
          type: "currency",
          placeholder: "مبلغ حقوق پایه",
        },
        {
          key: "housingAllowance" as keyof SalaryLawsData,
          label: "کمک هزینه مسکن",
          type: "currency",
          placeholder: "مبلغ کمک هزینه مسکن",
        },
        {
          key: "workerVoucher" as keyof SalaryLawsData,
          label: "بن کارگری",
          type: "currency",
          placeholder: "مبلغ بن کارگری",
        },
        {
          key: "seniorityPay" as keyof SalaryLawsData,
          label: "پاداش سنوات",
          type: "currency",
          placeholder: "مبلغ پاداش سنوات",
        },
      ],
    },
    {
      title: "مزایای خانوادگی",
      description: "کمک هزینه‌های مربوط به فرزندان",
      fields: [
        {
          key: "childAllowance1" as keyof SalaryLawsData,
          label: "کمک هزینه فرزند اول",
          type: "currency",
          placeholder: "مبلغ کمک هزینه فرزند اول",
        },
        {
          key: "childAllowance2" as keyof SalaryLawsData,
          label: "کمک هزینه فرزند دوم",
          type: "currency",
          placeholder: "مبلغ کمک هزینه فرزند دوم",
        },
      ],
    },
    {
      title: "نرخ‌های اضافه کار",
      description: "تعرفه‌های مربوط به کار خارج از ساعت عادی",
      fields: [
        {
          key: "overtimeRate" as keyof SalaryLawsData,
          label: "نرخ اضافه کار",
          type: "currency",
          placeholder: "نرخ ساعتی اضافه کار",
        },
        {
          key: "holidayRate" as keyof SalaryLawsData,
          label: "نرخ کار تعطیل",
          type: "currency",
          placeholder: "نرخ کار در روزهای تعطیل",
        },
      ],
    },
    {
      title: "کسورات قانونی",
      description: "درصدهای مالیات و بیمه",
      fields: [
        {
          key: "taxRate" as keyof SalaryLawsData,
          label: "نرخ مالیات (%)",
          type: "number",
          step: "0.01",
          placeholder: "مثال: 0.1 برای 10%",
        },
        {
          key: "insuranceRate" as keyof SalaryLawsData,
          label: "نرخ بیمه (%)",
          type: "number",
          step: "0.01",
          placeholder: "مثال: 0.07 برای 7%",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  مدیریت قوانین حقوق
                </h1>
                <p className="text-gray-600 mt-2">
                  تنظیمات و پارامترهای سیستم حقوق و دستمزد
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <div className="bg-gray-50 px-3 py-2 rounded border">
                  آخرین به‌روزرسانی: {new Date().toLocaleDateString("fa-IR")}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex px-6">
              {[
                { key: "form", label: "ساخت" },
                { key: "table", label: "مشاهده و ویرایش" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "form" | "table")}
                  className={`py-4 px-6 border-b-2 font-medium cursor-pointer text-sm transition-all duration-200 ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "form" ? (
              <div className=" ">
                {/* Fiscal Year Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        سال مالی جاری
                      </h3>
                      <p className="text-sm text-gray-600">
                        انتخاب سال مالی برای اعمال قوانین
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 min-w-[120px] text-center">
                        {selectedFiscalYear
                          ? selectedFiscalYear.name
                          : "انتخاب نشده"}
                      </div>
                      <button
                        type="button"
                        onClick={resetFiscalYear}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        تغییر سال
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {formSections.map((section, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {section.fields.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              {field.type === "currency" ? (
                                <FormattedNumberInput
                                  value={formData[field.key] as number}
                                  onChange={(value) =>
                                    handleChange(field.key, value)
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  placeholder={field.placeholder}
                                />
                              ) : (
                                <input
                                  type="number"
                                  step={field.step || "1"}
                                  value={formData[field.key]}
                                  onChange={(e) =>
                                    handleChange(
                                      field.key,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  placeholder={field.placeholder}
                                  required
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Form Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                      {formData._id && (
                        <button
                          type="button"
                          onClick={handleNewRecord}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          ایجاد رکورد جدید
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium min-w-[160px]"
                      >
                        {loading
                          ? "در حال پردازش..."
                          : formData._id
                          ? "به‌روزرسانی"
                          : "ذخیره تنظیمات"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <DynamicTable ref={tableRef} config={salaryLawsTableConfig} />
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalConfig && (
        <DynamicModal
          isOpen={isDeleteModalOpen}
          config={deleteModalConfig}
          itemId={selectedItemForDelete?._id}
        />
      )}

      {/* Edit Modal */}
      {editModalConfig && (
        <DynamicModal
          isOpen={isEditModalOpen}
          config={editModalConfig}
          itemId={selectedItemForEdit?._id}
          initialData={{
            workHoursPerDay: selectedItemForEdit?.workHoursPerDay,
            baseSalary: selectedItemForEdit?.baseSalary,
            housingAllowance: selectedItemForEdit?.housingAllowance,
            workerVoucher: selectedItemForEdit?.workerVoucher,
            childAllowance1: selectedItemForEdit?.childAllowance1,
            childAllowance2: selectedItemForEdit?.childAllowance2,
            seniorityPay: selectedItemForEdit?.seniorityPay,
            overtimeRate: selectedItemForEdit?.overtimeRate,
            holidayRate: selectedItemForEdit?.holidayRate,
            taxRate: selectedItemForEdit?.taxRate,
            insuranceRate: selectedItemForEdit?.insuranceRate,
          }}
        />
      )}
    </div>
  );
};

export default SalaryLaws;
