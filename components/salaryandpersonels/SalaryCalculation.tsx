"use client";

import React, { useState, useEffect } from "react";
import { TableColumn } from "@/types/tables";

interface SalaryData {
  staffId: string;
  staffName: string;
  month: number;
  year: number;
  workHours: number;
  baseSalary: number;
  dailyBaseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance: number;
  seniority: number;
  totalEarnings: number;
  taxDeduction: number;
  insuranceDeduction: number;
  deficits: number;
  totalDeductions: number;
  netPay: number;
  MarriageAllowance: number;
  extraWorkPay: number;
  extraHours: number;
  overtimeHours: number;
  overtimePay: number;
  workingDays: number;
  extraWorkPayFee: number;
}

interface Staff {
  _id: string;
  title: string;
  name: string;
  position: string;
}

const SalaryCalculation: React.FC = () => {
  const [month, setMonth] = useState<number>(5);
  const [year, setYear] = useState<number>(1404);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaffData, setSelectedStaffData] = useState<SalaryData | null>(
    null
  );

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/salaryandpersonels/calculateSalary");
      const result = await response.json();
      console.log(result, "rrrrrr");
      if (response.ok) {
        setStaff(result.staff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const calculateSalaries = async () => {
    setLoading(true);
    try {
      const requestBody = selectedStaff
        ? { staffId: selectedStaff, month, year }
        : { calculateAll: true, month, year };

      const response = await fetch("/api/salaryandpersonels/calculateSalary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (response.ok) {
        const data = selectedStaff ? [result.result] : result.results;
        setSalaryData(data);
        setCalculated(true);
      } else {
        alert("خطا در محاسبه حقوق: " + result.error);
      }
    } catch (error) {
      console.log(error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const approveSalaries = async () => {
    setLoading(true);
    try {
      for (const salary of salaryData) {
        await fetch("/api/salaryandpersonels/slary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staff: salary.staffId,
            month: salary.month,
            year: salary.year,
            workHurs: salary.workHours,
            baseSalary: salary.baseSalary,
            housingAllowance: salary.housingAllowance,
            workerVoucher: salary.workerVoucher,
            childAllowance: salary.childAllowance,
            seniority: salary.seniority,
            overtimeHours: salary.overtimeHours,
            overtimePay: salary.overtimePay,

            taxDeduction: salary.taxDeduction,
            insuranceDeduction: salary.insuranceDeduction,
            dificits: salary.deficits,
            totalEarnings: salary.totalEarnings,
            totalDeductions: salary.totalDeductions,
            netPay: salary.netPay,
          }),
        });
      }
      alert("حقوق‌ها با موفقیت ثبت شد");
      setCalculated(false);
      setSalaryData([]);
    } catch (error) {
      console.log(error);

      alert("خطا در ثبت حقوق‌ها");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (staffData: SalaryData) => {
    setSelectedStaffData(staffData);
    setShowModal(true);
  };

  const generateImage = async () => {
    if (!selectedStaffData) return;

    const element = document.querySelector(".salary-table-container");
    if (!element) return;

    try {
      const domtoimage = await import("dom-to-image");
      const dataUrl = await domtoimage.default.toPng(element as HTMLElement, {
        quality: 2,
        bgcolor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `salary-${selectedStaffData.staffName}-${selectedStaffData.month}-${selectedStaffData.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const totalSummary = salaryData.reduce(
    (acc, item) => ({
      totalEarnings: acc.totalEarnings + item.totalEarnings,
      totalDeductions: acc.totalDeductions + item.totalDeductions,
      netPay: acc.netPay + item.netPay,
      workingDays: acc.workingDays + item.workingDays,
    }),
    { totalEarnings: 0, totalDeductions: 0, netPay: 0, workingDays: 0 }
  );

  const columns: TableColumn[] = [
    { key: "staffName", label: "نام کارمند", sortable: true },
    {
      key: "workHours",
      label: "ساعت کار",
      sortable: true,
      render: (value) => Math.round(Number(value)).toFixed(2),
    },
    {
      key: "workingDays",
      label: "روز کارکرد",
      sortable: true,
      render: (value) => Math.round(Number(value)).toFixed(2),
    },
    {
      key: "baseSalary",
      label: "حقوق پایه",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "housingAllowance",
      label: "کمک هزینه مسکن",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "workerVoucher",
      label: "بن کارگری",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "childAllowances",
      label: "کمک هزینه فرزند",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "seniority",
      label: "سنوات",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "MarriageAllowance",
      label: "حق ازدواج",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "extraWorkPay",
      label: "اضافه کار",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "totalEarnings",
      label: "کل دریافتی",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "extraHours",
      label: "ساعات اضافه کاری",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "taxDeduction",
      label: "مالیات",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "insuranceDeduction",
      label: "بیمه",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "deficits",
      label: "کسورات",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "totalDeductions",
      label: "کل کسورات",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "netPay",
      label: "خالص پرداختی",
      sortable: true,
      render: (value) => Math.round(Number(value)).toLocaleString(),
    },
    {
      key: "actions",
      label: "عملیات",
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => openModal(row as unknown as SalaryData)}
          className="text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">محاسبه حقوق کارکنان</h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-6">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                کارمند
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
              >
                <option value="">همه کارمندان</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title} {s.name} - {s.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[120px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                ماه
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[120px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                سال
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
              />
            </div>

            <button
              onClick={calculateSalaries}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  در حال محاسبه...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  محاسبه حقوق
                </>
              )}
            </button>
          </div>
        </div>

        {calculated && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-emerald-200 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              خلاصه کل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      کل دریافتی
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      {Math.round(totalSummary.totalEarnings).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      کل روز کارکرد
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {totalSummary.workingDays.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      کل کسورات
                    </p>
                    <p className="text-lg font-bold text-red-700">
                      {Math.round(
                        totalSummary.totalDeductions
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      خالص پرداختی
                    </p>
                    <p className="text-lg font-bold text-emerald-700">
                      {Math.round(totalSummary.netPay).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {calculated && (
        <>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                لیست حقوق محاسبه شده
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaryData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {column.render
                            ? column.render(
                                row[column.key as keyof SalaryData],
                                row as unknown as Record<string, unknown>
                              )
                            : row[column.key as keyof SalaryData]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={approveSalaries}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "در حال ثبت..." : "تایید و ثبت حقوق‌ها"}
            </button>
          </div>
        </>
      )}

      {showModal && selectedStaffData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          dir="ltr"
        >
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="relative mb-6">
              <div className="bg-gray-300 border-2 border-black p-3 text-center">
                <h3 className="text-lg font-bold">
                  حقوق مزد سال {selectedStaffData.year}{" "}
                  {selectedStaffData.staffName}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 absolute top-2 left-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="border-2 border-black salary-table-container p-8 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-300">
                    <th
                      className="border border-black p-2 text-center font-bold"
                      colSpan={2}
                    >
                      کسورات
                    </th>
                    <th
                      className="border border-black p-2 text-center font-bold"
                      colSpan={2}
                    >
                      اضافات
                    </th>
                    <th
                      className="border border-black p-2 text-center font-bold"
                      colSpan={3}
                    >
                      {" "}
                      کارکرد
                    </th>
                  </tr>
                  <tr className="bg-gray-200">
                    <th className="border border-black p-2 text-sm font-bold">
                      ریال
                    </th>
                    <th className="border border-black p-2 text-sm font-bold">
                      شرح
                    </th>
                    <th className="border border-black p-2 text-sm font-bold">
                      ریال
                    </th>
                    <th className="border border-black p-2 text-sm font-bold">
                      شرح
                    </th>
                    <th className="border border-black p-2 text-sm font-bold">
                      حقوق روزانه
                    </th>
                    <th className="border border-black p-2 text-sm font-bold">
                      روز/ساعت
                    </th>
                    <th className="border border-black p-2 text-sm font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.insuranceDeduction.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      بیمه ۷ درصد سهم کارگر
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.baseSalary.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حقوق ماهانه
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.dailyBaseSalary.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.workHours}
                    </td>
                    <td
                      className="border border-black p-1 text-center text-sm"
                      rowSpan={2}
                    >
                      کارکرد عادی
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      مالیات ۱۰ درصد
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.housingAllowance.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حق مسکن
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      روز
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {Math.round(selectedStaffData.workingDays)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      ذخیره بن پرداختی
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.workerVoucher.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حق بن
                    </td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      شیشه
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حق ناهار
                    </td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.deficits.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      مساعده
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      مزایای پرستی
                    </td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      وام
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.MarriageAllowance.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حق ازدواج
                    </td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                    <td className="border border-white p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حق اولاد
                    </td>
                    <td className=" border- p-1 text-center text-sm"></td>
                    <td className=" border- p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm">
                      ۰
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      حقوق مشمول مالیات
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      هر ساعت اضافه کاری
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      ساعت
                    </td>
                    <td className="border border-black p-1 text-center text-sm"></td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm"></td>
                    <td className="border border-black p-1 text-center text-sm">
                      {selectedStaffData.extraWorkPay.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      مبلغ اضافه کاری
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {Math.round(
                        selectedStaffData.extraWorkPayFee
                      ).toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      {Math.round(
                        selectedStaffData.extraWorkPay /
                          (selectedStaffData.extraHours || 1)
                      ).toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center text-sm">
                      اضافه کاری
                    </td>
                  </tr>
                  <tr className="bg-gray-200">
                    <td className="border border-black p-1 text-center font-bold text-sm">
                      {selectedStaffData.totalDeductions.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center font-bold text-sm">
                      جمع کسورات
                    </td>
                    <td className="border border-black p-1 text-center font-bold text-sm">
                      {selectedStaffData.totalEarnings.toLocaleString()}
                    </td>
                    <td className="border border-black p-1 text-center font-bold text-sm">
                      جمع حقوق
                    </td>
                    <td
                      className="border border-black p-1 text-center"
                      colSpan={3}
                    ></td>
                  </tr>
                  <tr className="bg-blue-200">
                    <td
                      className="border border-black p-2 text-center font-bold"
                      colSpan={2}
                    >
                      {selectedStaffData.netPay.toLocaleString()}
                    </td>
                    <td
                      className="border border-black p-2 text-center font-bold"
                      colSpan={5}
                    >
                      قابل پرداخت
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={generateImage}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                دانلود تصویر
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculation;
