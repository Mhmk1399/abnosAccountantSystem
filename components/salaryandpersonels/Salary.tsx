"use client";

import React, { useState, useRef, useEffect } from "react";
import DynamicTable from "@/components/global/DynamicTable";
import { TableConfig } from "@/types/tables";
import { HiOutlineSearch } from "react-icons/hi";
import DynamicModal, { ModalConfig } from "@/components/global/DynamicModal";

interface SalaryData extends Record<string, unknown> {
  _id: string;
  staff: { name: string; _id: string };
  month: number;
  year: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance: number;
  overtimePay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

const Salary: React.FC = () => {
  const [staffOptions, setStaffOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SalaryData | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const tableRef = useRef<{ refreshData: () => void }>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("/api/salaryandpersonels/staff");
        const data = await response.json();
        if (data.staff) {
          const options = data.staff.map(
            (s: { _id: string; name: string }) => ({
              value: s._id,
              label: s.name,
            })
          );
          setStaffOptions(options);
        }
      } catch (error) {
        console.log("Failed to fetch staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleFilter = () => {
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
  };

  const buildEndpoint = () => {
    const endpoint = "/api/salaryandpersonels/slary";
    const params = new URLSearchParams();

    if (selectedStaff) params.append("staffId", selectedStaff);
    if (selectedMonth) params.append("month", selectedMonth.toString());
    if (selectedYear) params.append("year", selectedYear.toString());

    return params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
  };

  const handleViewClick = (item: SalaryData) => {
    setSelectedItem(item);
    setModalConfig({
      title: `مشاهده حقوق: ${item.staff.name}`,
      type: "view",
      size: "lg",
      fields: [
        { key: "staff.name", label: "کارمند" },
        { key: "month", label: "ماه" },
        { key: "year", label: "سال" },
        {
          key: "baseSalary",
          label: "حقوق پایه",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "housingAllowance",
          label: "کمک مسکن",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "workerVoucher",
          label: "بن کارگری",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "childAllowance",
          label: "کمک فرزند",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "overtimePay",
          label: "اضافه کار",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "totalEarnings",
          label: "کل دریافتی",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "totalDeductions",
          label: "کل کسورات",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
        {
          key: "netPay",
          label: "خالص پرداختی",
          render: (value: unknown) => Number(value).toLocaleString(),
        },
      ],
      onClose: () => {
        setIsModalOpen(false);
        setModalConfig(null);
        setSelectedItem(null);
      },
    });
    setIsModalOpen(true);
  };

  const salaryTableConfig: TableConfig = {
    endpoint: buildEndpoint(),
    responseHandler: (res: { salaries: SalaryData[] }) => res.salaries,
    title: "لیست حقوق تایید شده",
    description: "مشاهده حقوق کارمندان",
    columns: [
      {
        key: "staff.name",
        label: "کارمند",
        sortable: true,
        render: (value: unknown, row: unknown) => {
          const salaryRow = row as SalaryData;
          return salaryRow.staff?.name || "-";
        },
      },
      { key: "month", label: "ماه", sortable: true },
      { key: "year", label: "سال", sortable: true },
      {
        key: "baseSalary",
        label: "حقوق پایه",
        sortable: true,
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "housingAllowance",
        label: "کمک مسکن",
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "workerVoucher",
        label: "بن کارگری",
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "childAllowance",
        label: "کمک فرزند",
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "overtimePay",
        label: "اضافه کار",
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "totalEarnings",
        label: "کل دریافتی",
        sortable: true,
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "totalDeductions",
        label: "کل کسورات",
        render: (value: unknown) => Number(value).toLocaleString(),
      },
      {
        key: "netPay",
        label: "خالص پرداختی",
        sortable: true,
        render: (value: unknown) => Number(value).toLocaleString(),
      },
    ],
    actions: {
      view: true,
      custom: [
        {
          label: "دانلود PNG",
          className: "text-green-600 hover:text-green-800",
          onClick: () => {
            // PNG functionality will be handled by DynamicTable
          },
        },
      ],
    },
    onView: handleViewClick,
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">فیلتر حقوق</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">کارمند</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">همه کارمندان</option>
              {staffOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ماه</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={0}>همه ماه‌ها</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">سال</label>
            <input
              type="number"
              value={selectedYear || ""}
              onChange={(e) => setSelectedYear(Number(e.target.value) || 0)}
              className="w-full border rounded px-3 py-2"
              placeholder="سال"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center"
            >
              <HiOutlineSearch className="ml-2" />
              جستجو
            </button>
          </div>
        </div>
      </div>

      <DynamicTable ref={tableRef} config={salaryTableConfig} />
      {modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          initialData={selectedItem || undefined}
        />
      )}
    </div>
  );
};

export default Salary;
