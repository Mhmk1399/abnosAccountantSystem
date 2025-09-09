"use client";

import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { useTableToPng } from "@/hooks/useTableToPng";
import { HiOutlineDownload } from "react-icons/hi";

interface LeaveData {
  staffId: string;
  name: string;
  position: string;
  contracthireDate: string;
  contractendDate?: string;
  nationalId: string;
  isActive: boolean;
  annualLeave: number;
  leavePerMonth: number[];
  usedLeavePerMonth: number[];
  remainingLeavePerMonth: number[];
  totalUsedLeave: number;
  totalRemainingLeave: number;
}

interface RowData {
  name: string;
  position: string;
  [key: string]: string | number;
}

const monthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const Leave: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [filteredData, setFilteredData] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1404);
  const [nameFilter, setNameFilter] = useState("");
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 11]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);
  const { generateTablePng, generateRowPng, generateSelectedRowsPng } =
    useTableToPng();

  useEffect(() => {
    fetchLeaveData();
  }, [selectedYear]);

  useEffect(() => {
    filterData();
  }, [leaveData, nameFilter, monthRange]);

  const filterData = () => {
    const filtered = leaveData.filter(
      (staff) => nameFilter === "" || staff.name === nameFilter
    );
    setFilteredData(filtered);
  };

  const fetchLeaveData = async () => {
    try {
      const response = await fetch(
        `/api/salaryandpersonels/leave?year=${selectedYear}`
      );
      const data = await response.json();
      setLeaveData(data.leaveData);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const convertStaffToRowData = (staff: LeaveData): RowData => {
    const rowData: RowData = { name: staff.name, position: staff.position };

    const rangeMonths: number[] = [];
    for (let i = monthRange[0]; i <= monthRange[1]; i++) {
      rangeMonths.push(i);
    }

    rangeMonths.forEach((monthIndex) => {
      rowData[monthNames[monthIndex]] = staff.remainingLeavePerMonth[monthIndex].toFixed(1);
    });

    const rangeUsed = rangeMonths.reduce((sum, i) => sum + staff.usedLeavePerMonth[i], 0);
    const rangeRemaining = rangeMonths.reduce((sum, i) => sum + staff.remainingLeavePerMonth[i], 0);
    
    rowData.totalUsed = rangeUsed;
    rowData.totalRemaining = Math.round(rangeRemaining);

    return rowData;
  };

  const getHeaders = () => {
    const rangeMonths: string[] = [];
    for (let i = monthRange[0]; i <= monthRange[1]; i++) {
      rangeMonths.push(monthNames[i]);
    }
    return ["نام", "سمت", ...rangeMonths, "کل استفاده", "کل باقیمانده"];
  };

  const handleDownloadFullTable = () => {
    const tableData = filteredData.map(convertStaffToRowData);

    // Add totals row
    const totalsRow: RowData = { name: "جمع کل:", position: "" };

    const rangeMonths: number[] = [];
    for (let i = monthRange[0]; i <= monthRange[1]; i++) {
      rangeMonths.push(i);
    }

    rangeMonths.forEach((monthIndex) => {
      totalsRow[monthNames[monthIndex]] = filteredData
        .reduce((sum, staff) => sum + staff.remainingLeavePerMonth[monthIndex], 0)
        .toFixed(1);
    });
    
    const totalRangeUsed = filteredData.reduce((sum, staff) => 
      sum + rangeMonths.reduce((monthSum, i) => monthSum + staff.usedLeavePerMonth[i], 0), 0
    );
    const totalRangeRemaining = filteredData.reduce((sum, staff) => 
      sum + rangeMonths.reduce((monthSum, i) => monthSum + staff.remainingLeavePerMonth[i], 0), 0
    );
    
    totalsRow.totalUsed = totalRangeUsed;
    totalsRow.totalRemaining = Math.round(totalRangeRemaining);

    tableData.push(totalsRow);

    generateTablePng(tableData, getHeaders(), {
      filename: `مرخصی-پرسنل-${selectedYear}-${monthNames[monthRange[0]]}-تا-${monthNames[monthRange[1]]}.png`,
    });
  };

  const handleDownloadRow = (index: number) => {
    const staff = filteredData[index];
    const rowData = convertStaffToRowData(staff);
    generateRowPng(rowData, getHeaders(), {
      filename: `مرخصی-${staff.name}-${selectedYear}.png`,
    });
  };

  const handleDownloadSelected = () => {
    const selectedData = Array.from(selectedRows).map((index) =>
      convertStaffToRowData(filteredData[index])
    );
    generateSelectedRowsPng(selectedData, getHeaders(), {
      filename: `مرخصی-انتخابی-${selectedYear}.png`,
    });
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((_, index) => index)));
    }
  };

  if (loading) return <div className="p-4">در حال بارگذاری...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between flex-row-reverse items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={handleDownloadFullTable}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <HiOutlineDownload className="w-4 h-4" />
            دانلود کامل
          </button>
          <button
            onClick={handleDownloadSelected}
            disabled={selectedRows.size === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <HiOutlineDownload className="w-4 h-4" />
            انتخابی ({selectedRows.size})
          </button>
        </div>
        <h2 className="text-2xl font-bold text-right">مرخصی پرسنل</h2>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">
            انتخاب کارمند:
          </label>
          <select
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">همه کارمندان</option>
            {leaveData.map((staff) => (
              <option key={staff.staffId} value={staff.name}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">
            بازه ماه: {monthNames[monthRange[0]]} تا {monthNames[monthRange[1]]}
          </label>
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-white">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <div className="text-sm">
                  <label className="block text-xs text-gray-600">از ماه:</label>
                  <select
                    value={monthRange[0]}
                    onChange={(e) => {
                      const start = Number(e.target.value);
                      setMonthRange([start, Math.max(start, monthRange[1])]);
                    }}
                    className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm">
                  <label className="block text-xs text-gray-600">تا ماه:</label>
                  <select
                    value={monthRange[1]}
                    onChange={(e) => {
                      const end = Number(e.target.value);
                      setMonthRange([Math.min(monthRange[0], end), end]);
                    }}
                    className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-lg" dir="rtl" >
                <div 
                  className="absolute h-2 bg-blue-500 rounded-lg"
                  style={{
                    right: `${(monthRange[0] / 11) * 100}%`,
                    width: `${((monthRange[1] - monthRange[0]) / 11 ) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">سال:</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={new DateObject({
              calendar: persian,
              locale: persian_fa,
            }).setYear(selectedYear)}
            onChange={(date) => {
              if (date) {
                setSelectedYear(date.year);
              }
            }}
            onlyYearPicker
            format="YYYY"
            inputClass="px-3 py-2 border border-gray-300 rounded-md w-full"
            placeholder="انتخاب سال"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md"
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === filteredData.length &&
                    filteredData.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase border-b">
                نام
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase border-b">
                سمت
              </th>
              {Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i).map((monthIndex) => (
                <th
                  key={monthIndex}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b"
                >
                  {monthNames[monthIndex]}
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b">
                کل استفاده
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b">
                کل باقیمانده
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((staff, index) => (
              <tr
                key={staff.staffId}
                className={`hover:bg-gray-50 ${
                  selectedRows.has(index) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={() => handleSelectRow(index)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {staff.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {staff.position}
                </td>
                {Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i).map((monthIndex) => (
                  <td
                    key={monthIndex}
                    className="px-2 py-4 whitespace-nowrap text-sm text-center"
                  >
                    <span
                      className={`px-1 py-1 rounded text-xs ${
                        staff.remainingLeavePerMonth[monthIndex] > 1
                          ? "bg-green-100 text-green-800"
                          : staff.remainingLeavePerMonth[monthIndex] > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {staff.remainingLeavePerMonth[monthIndex].toFixed(1)}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                      .reduce((sum, monthIndex) => sum + staff.usedLeavePerMonth[monthIndex], 0)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                        .reduce((sum, monthIndex) => sum + staff.remainingLeavePerMonth[monthIndex], 0) > 10
                        ? "bg-green-100 text-green-800"
                        : Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                          .reduce((sum, monthIndex) => sum + staff.remainingLeavePerMonth[monthIndex], 0) > 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {Math.round(Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                      .reduce((sum, monthIndex) => sum + staff.remainingLeavePerMonth[monthIndex], 0))}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleDownloadRow(index)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                  >
                    <HiOutlineDownload className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td
                className="px-4 py-4 text-right text-sm font-bold"
                colSpan={3}
              >
                جمع کل:
              </td>
              {Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i).map((monthIndex) => (
                <td key={monthIndex} className="px-2 py-4 text-center text-sm">
                  {filteredData
                    .reduce(
                      (sum, staff) =>
                        sum + staff.remainingLeavePerMonth[monthIndex],
                      0
                    )
                    .toFixed(1)}
                </td>
              ))}
              <td className="px-4 py-4 text-center text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {filteredData.reduce((sum, staff) => 
                    sum + Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                      .reduce((monthSum, monthIndex) => monthSum + staff.usedLeavePerMonth[monthIndex], 0), 0
                  )}
                </span>
              </td>
              <td className="px-4 py-4 text-center text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {Math.round(
                    filteredData.reduce((sum, staff) => 
                      sum + Array.from({ length: monthRange[1] - monthRange[0] + 1 }, (_, i) => monthRange[0] + i)
                        .reduce((monthSum, monthIndex) => monthSum + staff.remainingLeavePerMonth[monthIndex], 0), 0
                    )
                  )}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          هیچ دادهای یافت نشد
        </div>
      )}
    </div>
  );
};

export default Leave;
