"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { useTableToPng } from "@/hooks/useTableToPng";
import {
  HiOutlinePhotograph,
  HiOutlineDownload,
  HiOutlineCollection,
} from "react-icons/hi";

interface IDailyRecord {
  day: number;
  status: "present" | "absent" | "leave" | "holiday" | "permission" | "medical";
  entryTime?: string;
  launchtime?: string;
  exitTime?: string;
  description?: string;
}
export interface SalaryLaws {
  year: number;
  workHoursPerDay: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance: number;
  seniorityPay: number;
  overtimeRate: number;
  holidayRate: number;
  taxRate: number;
  insuranceRate: number;
  MarriageAllowance?: number;
  taxStandard: number;
  createdAt?: Date;
  updatedAt?: Date;
}
interface IStaff {
  _id: string;
  name: string;
  title: string;
}

interface IRollcall {
  _id: string;
  staff: {
    _id: string;
    name: string;
    title: string;
  };
  month: number;
  year: number;
  days: IDailyRecord[];
}

const Rollcall: React.FC = () => {
  const [rollcallData, setRollcallData] = useState<IRollcall[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [salaryLaws, setSalaryLaws] = useState<SalaryLaws | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    rollcall: IRollcall | null;
    dayRecord: IDailyRecord | null;
  }>({ isOpen: false, rollcall: null, dayRecord: null });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);
  const { generateTablePng, generateRowPng, generateSelectedRowsPng } =
    useTableToPng();

  const fetchSalaryLaws = async (year: number) => {
    try {
      const response = await fetch("/api/salaryandpersonels/salaryLaws", {
        headers: { year: year.toString() },
      });
      const data = await response.json();
      console.log(data);
      setSalaryLaws(data.salaryLaws);
    } catch (error) {
      console.log("Failed to fetch salary laws:", error);
    }
  };

  const calculateWorkHours = (
    entryTime: string,
    exitTime: string,
    lunchTime: string,
    status: string
  ) => {
    if (status !== "present" || !entryTime || !exitTime)
      return { workHours: 0, overtime: 0 };

    // تبدیل زمان به اعشاری مثل ماشین حساب
    const [entryHour, entryMin] = entryTime.split(":").map(Number);
    const [exitHour, exitMin] = exitTime.split(":").map(Number);
    const [lunchHour, lunchMin] = lunchTime.split(":").map(Number);

    const entryDecimal = entryHour + entryMin / 60;
    const exitDecimal = exitHour + exitMin / 60;
    const lunchDecimal = lunchHour + lunchMin / 60;

    // کل ساعت کار = خروج - ورود
    const totalWorkHours = exitDecimal - entryDecimal;

    // ساعت کار خالص = کل کار - نهار
    const workHours = totalWorkHours - lunchDecimal;

    // اضافه کاری = ساعت کار - ساعت استاندارد
    const standardHours = salaryLaws?.workHoursPerDay || 7.33;
    const overtime = Math.max(0, workHours - standardHours);

    return { workHours: Math.max(0, workHours), overtime };
  };

  const fetchRollcallData = async () => {
    try {
      setLoading(true);
      const persianDate = new DateObject({
        date: selectedDate,
        calendar: persian,
        locale: persian_fa,
      });
      const month = persianDate.month;
      const year = persianDate.year;

      await fetchSalaryLaws(year);

      // Fetch staff data
      const staffResponse = await fetch('/api/salaryandpersonels/staff');
      const staffData = await staffResponse.json();
      
      // Fetch rollcall data
      let rollcallData = [];
      try {
        const rollcallResponse = await fetch(
          `/api/salaryandpersonels/rollcall?month=${month}&year=${year}`
        );
        const rollcallResult = await rollcallResponse.json();
        rollcallData = Array.isArray(rollcallResult) ? rollcallResult : rollcallResult.rollcall || [];
      } catch {
        console.log("No rollcall data available");
      }

      // Combine staff with rollcall data
      const combined = (staffData.staff || []).map((staff: IStaff) => {
        const existingRollcall = rollcallData.find((r: IRollcall) => r.staff._id === staff._id);
        return existingRollcall || {
          _id: staff._id,
          staff: {
            _id: staff._id,
            name: staff.name,
            title: staff.title
          },
          month,
          year,
          days: []
        };
      });
      
      setRollcallData(combined);
    } catch (error) {
      console.log("Failed to fetch rollcall data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRollcallData();
  }, [selectedDate]);

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      present: "حاضر",
      absent: "غایب",
      holiday: "تعطیل",
      permission: "اجازه",
      medical: "پزشکی",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      leave: "bg-yellow-100 text-yellow-800",
      holiday: "bg-blue-100 text-blue-800",
      permission: "bg-purple-100 text-purple-800",
      medical: "bg-orange-100 text-orange-800",
    };
    return (
      colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
    );
  };

  const formatPersianDate = (date: Date) => {
    const persianDate = new DateObject({
      date: date,
      calendar: persian,
      locale: persian_fa,
    });
    return persianDate.format("YYYY/MM/DD");
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleEditAttendance = (rollcall: IRollcall) => {
    const persianDate = new DateObject({
      date: selectedDate,
      calendar: persian,
      locale: persian_fa,
    });
    const persianDay = persianDate.day;

    const todayRecord = rollcall.days?.find(
      (day) => day.day === persianDay
    ) || {
      day: persianDay,
      status: "absent" as const,
      entryTime: "",
      launchtime: "1:00",
      exitTime: "",
      description: "",
    };

    setEditModal({
      isOpen: true,
      rollcall,
      dayRecord: todayRecord,
    });
  };

  const handleSaveAttendance = async () => {
    if (!editModal.rollcall || !editModal.dayRecord) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/salaryandpersonels/rollcall`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: editModal.rollcall.staff._id,
          month: editModal.rollcall.month,
          year: editModal.rollcall.year,
          day: editModal.dayRecord.day,
          dayData: editModal.dayRecord,
        }),
      });

      if (response.ok) {
        await fetchRollcallData();
        setEditModal({ isOpen: false, rollcall: null, dayRecord: null });
      }
    } catch (error) {
      console.log("Failed to update attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTablePng = () => {
    const persianDate = new DateObject({
      date: selectedDate,
      calendar: persian,
      locale: persian_fa,
    });
    const persianDay = persianDate.day;
    const persianDateStr = formatPersianDate(selectedDate);

    const tableData = rollcallData.map((rollcall) =>
      convertRollcallToTableData(rollcall, persianDay)
    );
    generateTablePng(tableData, getTableHeaders(), {
      filename: `حضور-غیاب-${persianDateStr}.png`,
    });
  };

  const handleRowPng = (rowIndex: number) => {
    const persianDate = new DateObject({
      date: selectedDate,
      calendar: persian,
      locale: persian_fa,
    });
    const persianDay = persianDate.day;
    const staff = rollcallData[rowIndex];
    const persianDateStr = formatPersianDate(selectedDate);

    const rowData = convertRollcallToTableData(staff, persianDay);
    generateRowPng(rowData, getTableHeaders(), {
      filename: `حضور-${staff.staff.name}-${persianDateStr}.png`,
    });
  };

  const handleSelectedRowsPng = () => {
    if (selectedRows.size > 0) {
      const persianDate = new DateObject({
        date: selectedDate,
        calendar: persian,
        locale: persian_fa,
      });
      const persianDay = persianDate.day;
      const persianDateStr = formatPersianDate(selectedDate);

      const selectedData = Array.from(selectedRows).map((index) =>
        convertRollcallToTableData(rollcallData[index], persianDay)
      );
      generateSelectedRowsPng(selectedData, getTableHeaders(), {
        filename: `حضور-انتخابی-${persianDateStr}.png`,
      });
    }
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
    if (selectedRows.size === rollcallData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rollcallData.map((_, index) => index)));
    }
  };

  const getTableHeaders = () => [
    "نام خانوادگی",
    "نام",
    "از ساعت",
    "تا ساعت",
    "نهار",
    "نوع",
    "کارکرد",
    "اضافه کار",
  ];

  const convertRollcallToTableData = (
    rollcall: IRollcall,
    persianDay: number
  ) => {
    const todayRecord = rollcall.days?.find((day) => day.day === persianDay);
    const workHours =
      todayRecord?.entryTime && todayRecord?.exitTime
        ? calculateWorkHours(
            todayRecord.entryTime,
            todayRecord.exitTime,
            todayRecord.launchtime || "1:00",
            todayRecord.status
          ).workHours
        : 0;
    const overtime =
      todayRecord?.entryTime && todayRecord?.exitTime
        ? calculateWorkHours(
            todayRecord.entryTime,
            todayRecord.exitTime,
            todayRecord.launchtime || "1:00",
            todayRecord.status
          ).overtime
        : 0;

    return {
      title: rollcall.staff.title,
      name: rollcall.staff.name,
      entryTime: todayRecord?.entryTime || "--:--",
      exitTime: todayRecord?.exitTime || "--:--",
      launchtime: todayRecord?.launchtime || "--:--",
      status: getStatusDisplay(todayRecord?.status || "absent"),
      workHours: workHours.toFixed(2),
      overtime: overtime.toFixed(2),
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">ساعات کارکرد پرسنل</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleTablePng}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <HiOutlinePhotograph className="w-4 h-4" />
                  دانلود جدول
                </button>

                <button
                  onClick={handleSelectedRowsPng}
                  disabled={selectedRows.size === 0}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <HiOutlineCollection className="w-4 h-4" />
                  انتخابی ({selectedRows.size})
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousDay}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors"
              >
                روز قبل
              </button>
              <div className="bg-white text-blue-700 px-4 py-2 rounded font-semibold">
                {formatPersianDate(selectedDate)}
              </div>
              <button
                onClick={goToNextDay}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors"
              >
                روز بعد
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b text-center">
                <th className="p-3 font-semibold border-r">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === rollcallData.length &&
                      rollcallData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="p-3  font-semibold border-r">نام خانوادگی</th>
                <th className="p-3  font-semibold border-r">نام</th>
                <th className="p-3  font-semibold border-r">از ساعت</th>
                <th className="p-3  font-semibold border-r">تا ساعت</th>
                <th className="p-3  font-semibold border-r">نهار</th>
                <th className="p-3  font-semibold border-r">نوع</th>
                <th className="p-3  font-semibold border-r">کارکرد</th>
                <th className="p-3  font-semibold border-r">اضافه کار</th>
                <th className="p-3  font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rollcallData.map((rollcall, index) => {
                const persianDate = new DateObject({
                  date: selectedDate,
                  calendar: persian,
                  locale: persian_fa,
                });
                const persianDay = persianDate.day;

                const todayRecord = rollcall.days?.find(
                  (day) => day.day === persianDay
                );

                return (
                  <tr
                    key={rollcall._id}
                    className={`border-b text-center hover:bg-gray-50 ${
                      selectedRows.has(index)
                        ? "bg-blue-50"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-25"
                    }`}
                  >
                    <td className="p-3 border-r">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 border-r font-medium">
                      {rollcall.staff.title}
                    </td>
                    <td className="p-3 border-r">{rollcall.staff.name}</td>
                    <td className="p-3 border-r text-center">
                      {todayRecord?.entryTime || "--:--"}
                    </td>
                    <td className="p-3 border-r text-center">
                      {todayRecord?.exitTime || "--:--"}
                    </td>
                    <td className="p-3 border-r text-center">
                      {todayRecord?.launchtime || "--:--"}
                    </td>
                    <td className="p-3 border-r text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          todayRecord?.status || "absent"
                        )}`}
                      >
                        {todayRecord?.status ? getStatusDisplay(todayRecord.status) : "--"}
                      </span>
                    </td>
                    <td className="p-3 border-r text-center">
                      {(() => {
                        if (!todayRecord?.entryTime || !todayRecord?.exitTime)
                          return "0.00";
                        const { workHours } = calculateWorkHours(
                          todayRecord.entryTime,
                          todayRecord.exitTime,
                          todayRecord.launchtime || "1:00",
                          todayRecord.status
                        );
                        return workHours.toFixed(2);
                      })()}
                    </td>
                    <td className="p-3 border-r text-center">
                      {(() => {
                        if (!todayRecord?.entryTime || !todayRecord?.exitTime)
                          return "0.00";
                        const { overtime } = calculateWorkHours(
                          todayRecord.entryTime,
                          todayRecord.exitTime,
                          todayRecord.launchtime || "1:00",
                          todayRecord.status
                        );
                        return overtime.toFixed(2);
                      })()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleEditAttendance(rollcall)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleRowPng(index)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="دانلود PNG"
                        >
                          <HiOutlineDownload className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            خروج
          </button>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              برو به تاریخ
            </button>
            {showDatePicker && (
              <div className=" ">
                <DatePicker
                className=" z-50"
                  calendar={persian}
                  locale={persian_fa}
                  value={selectedDate}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(date.toDate());
                      setShowDatePicker(false);
                    }
                  }}
                  format="YYYY/MM/DD"
                  calendarPosition="top-left"
                  inputClass="border rounded px-3 py-2 w-32"
                  placeholder="انتخاب تاریخ"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.rollcall && editModal.dayRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-bold mb-4">
              ویرایش حضور و غیاب - {editModal.rollcall.staff.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">وضعیت</label>
                <select
                  value={editModal.dayRecord.status}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      dayRecord: prev.dayRecord
                        ? {
                            ...prev.dayRecord,
                            status: e.target.value as IDailyRecord["status"],
                          }
                        : null,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="present">حاضر</option>
                  <option value="absent">غایب</option>
                  <option value="holiday">تعطیل</option>
                  <option value="permission">اجازه</option>
                  <option value="medical">پزشکی</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ساعت ورود
                </label>
                <input
                  type="time"
                  value={editModal.dayRecord.entryTime || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      dayRecord: prev.dayRecord
                        ? {
                            ...prev.dayRecord,
                            entryTime: e.target.value,
                          }
                        : null,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ساعت خروج
                </label>
                <input
                  type="time"
                  value={editModal.dayRecord.exitTime || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      dayRecord: prev.dayRecord
                        ? {
                            ...prev.dayRecord,
                            exitTime: e.target.value,
                          }
                        : null,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  مدت نهار (ساعت)
                </label>
                <input
                  type="text"
                  value={editModal.dayRecord.launchtime || "1:00"}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      dayRecord: prev.dayRecord
                        ? {
                            ...prev.dayRecord,
                            launchtime: e.target.value,
                          }
                        : null,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  توضیحات
                </label>
                <textarea
                  value={editModal.dayRecord.description || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      dayRecord: prev.dayRecord
                        ? {
                            ...prev.dayRecord,
                            description: e.target.value,
                          }
                        : null,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() =>
                  setEditModal({
                    isOpen: false,
                    rollcall: null,
                    dayRecord: null,
                  })
                }
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {loading ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-center">در حال بارگذاری...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rollcall;
