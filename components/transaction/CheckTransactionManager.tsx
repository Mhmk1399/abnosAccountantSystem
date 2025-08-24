"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CheckPriorityService } from "../../services/checkPriorityService";
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineDownload,
} from "react-icons/hi";
import { useTableToPng } from "../../hooks/useTableToPng";

export interface Check {
  _id: string;
  checkNumber: number;
  seryNumber: number;
  fromBank: Array<{
    shobe?: string;
    name?: string;
    accountNumber?: string;
    _id?: string;
  }>;
  status:
    | "nazeSandogh"
    | "darJaryanVosool"
    | "vosoolShode"
    | "bargashti"
    | "enteghalDadeShode";
  inboxStatus?:
    | "darJaryanVosool"
    | "vosoolShode"
    | "bargashti"
    | "enteghalDadeShode"
    | null;
  toBank:
    | string
    | {
        _id?: string;
        name: string;
      };

  amount: number;
  dueDate: string;
  description?: string;
  documentNumber?: string;
  paidBy: string | { _id: string; name: string; code: string };
  payTo: { _id: string; name: string; code: string };
  receiverName?: string;
  senderName?: string;
  type: "income" | "outcome";
  createdAt: string;
  updatedAt: string;
}

interface Bank {
  _id?: string;
  name: string;
  description: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  ownerName: string;
  detailedAccount?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function ChecksManagement() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [filteredChecks, setFilteredChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Check>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [bankFilter, setBankFilter] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(new Set());
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error,
  } = useTableToPng();

  // Fetch checks from API
  const fetchChecks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/cheks");
      const data = await response.json();
      setChecks(data.checkTransactions || []);
      setFilteredChecks(data.checkTransactions || []);
    } catch (error) {
      toast.error("خطا در دریافت لیست چک ها");
      console.error("Error fetching checks:", error);
      setChecks([]);
      setFilteredChecks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch banks for filter
  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/transactions/bank");
      if (response.ok) {
        const data = await response.json();
        setBanks(data || []);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };
  useEffect(() => {
    fetchChecks();
    fetchBanks();
  }, []);

  // Filter checks based on status, type, and date range
  const applyFilters = () => {
    let filtered = showOverdueOnly
      ? CheckPriorityService.getOverdueChecks(
          checks.map((check) => ({
            ...check,
            fromBank: check.fromBank || [],
            toBank:
              typeof check.toBank === "object"
                ? check.toBank._id || ""
                : check.toBank || "",
          }))
        )
      : [...checks];

    // Status filter
    if (statusFilter !== "all" && !showOverdueOnly) {
      filtered = filtered.filter((check) => check.status === statusFilter);
    }

    // Bank filter
    if (bankFilter) {
      filtered = filtered.filter((check) => {
        const bankName =
          typeof check.toBank === "object" ? check.toBank.name : "";
        return bankName?.toLowerCase().includes(bankFilter.toLowerCase());
      });
    }

    // Customer filter
    if (customerFilter) {
      filtered = filtered.filter(
        (check) =>
          check.receiverName
            ?.toLowerCase()
            .includes(customerFilter.toLowerCase()) ||
          check.senderName?.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((check) => check.type === typeFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (check) => new Date(check.dueDate) >= dateFrom
      );
    }
    if (dateTo) {
      filtered = filtered.filter((check) => new Date(check.dueDate) <= dateTo);
    }

    setFilteredChecks(filtered);
  };

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [
    checks,
    statusFilter,
    typeFilter,
    dateFrom,
    dateTo,
    bankFilter,
    customerFilter,
    showOverdueOnly,
  ]);

  // Handle edit check
  const handleEdit = (check: Check) => {
    setSelectedCheck(check);
    setEditFormData({
      checkNumber: check.checkNumber,
      seryNumber: check.seryNumber,
      status: check.status,
      inboxStatus: check.inboxStatus,
      amount: check.amount,
      dueDate: check.dueDate,
      description: check.description,
      receiverName: check.receiverName,
      senderName: check.senderName,
      type: check.type,
      toBank:
        typeof check.toBank === "object"
          ? check.toBank._id || ""
          : check.toBank || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle update check
  const handleUpdate = async () => {
    if (!selectedCheck) return;

    try {
      const response = await fetch(`/api/transactions/cheks`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: selectedCheck._id,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        toast.success("چک با موفقیت ویرایش شد");
        fetchChecks();
        setIsEditModalOpen(false);
        setSelectedCheck(null);
        setEditFormData({});
      } else {
        throw new Error("Failed to update check");
      }
    } catch (error) {
      toast.error("خطا در ویرایش چک");
      console.error("Error updating check:", error);
    }
  };

  // Handle delete check
  const handleDelete = async () => {
    if (!selectedCheck) return;

    try {
      await fetch(`/api/transactions/cheks`, {
        method: "DELETE",
        headers: {
          id: selectedCheck._id,
        },
      });
      toast.success("چک با موفقیت حذف شد");
      setChecks(checks.filter((check) => check._id !== selectedCheck._id));
      setIsDeleteModalOpen(false);
      setSelectedCheck(null);
    } catch (error) {
      toast.error("خطا در حذف چک");
      console.error("Error deleting check:", error);
    }
  };
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };
  // Format amount with commas
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  // Handle PNG generation for single row
  const handleRowPng = (check: Check) => {
    const headers = [
      "#",
      "شماره چک",
      "در وجه",
      "مبلغ (ریال)",
      "تاریخ سررسید",
      "تاریخ ایجاد",
      "وضعیت",
      "نوع",
    ];
    const rowData = {
      index: filteredChecks.findIndex((c) => c._id === check._id) + 1,
      checkNumber: check.checkNumber,
      receiverName: check.receiverName || "-",
      amount: formatAmount(check.amount),
      dueDate: formatDate(check.dueDate),
      createdAt: formatDate(check.createdAt),
      status:
        check.status === "nazeSandogh"
          ? "نزد صندوق"
          : check.status === "darJaryanVosool"
          ? "در جریان وصول"
          : check.status === "vosoolShode"
          ? "وصول شده"
          : check.status === "bargashti"
          ? "برگشتی"
          : "انتقال داده شده",
      type: check.type === "income" ? "دریافتی" : "پرداختی",
    };
    generateRowPng(rowData, headers, {
      filename: `check-${check.checkNumber}-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  // Handle PNG generation for entire table
  const handleTablePng = () => {
    const headers = [
      "#",
      "شماره چک",
      "در وجه",
      "مبلغ (ریال)",
      "تاریخ سررسید",
      "تاریخ ایجاد",
      "وضعیت",
      "نوع",
    ];
    const tableData = filteredChecks.map((check, idx) => ({
      index: idx + 1,
      checkNumber: check.checkNumber,
      receiverName: check.receiverName || "-",
      amount: formatAmount(check.amount),
      dueDate: formatDate(check.dueDate),
      createdAt: formatDate(check.createdAt),
      status:
        check.status === "nazeSandogh"
          ? "نزد صندوق"
          : check.status === "darJaryanVosool"
          ? "در جریان وصول"
          : check.status === "vosoolShode"
          ? "وصول شده"
          : check.status === "bargashti"
          ? "برگشتی"
          : "انتقال داده شده",
      type: check.type === "income" ? "دریافتی" : "پرداختی",
    }));
    generateTablePng(tableData, headers, {
      filename: `checks-table-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectCheck = (checkId: string) => {
    setSelectedChecks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedChecks.size === filteredChecks.length) {
      setSelectedChecks(new Set());
    } else {
      setSelectedChecks(new Set(filteredChecks.map((check) => check._id)));
    }
  };

  const handleSelectedRowsPng = () => {
    const selectedData = filteredChecks
      .filter((check) => selectedChecks.has(check._id))
      .map((check) => ({
        index: filteredChecks.findIndex((c) => c._id === check._id) + 1,
        checkNumber: check.checkNumber,
        receiverName: check.receiverName || "-",
        amount: formatAmount(check.amount),
        dueDate: formatDate(check.dueDate),
        createdAt: formatDate(check.createdAt),
        status:
          check.status === "nazeSandogh"
            ? "نزد صندوق"
            : check.status === "darJaryanVosool"
            ? "در جریان وصول"
            : check.status === "vosoolShode"
            ? "وصول شده"
            : check.status === "bargashti"
            ? "برگشتی"
            : "انتقال داده شده",
        type: check.type === "income" ? "دریافتی" : "پرداختی",
      }));

    const headers = [
      "#",
      "شماره چک",
      "در وجه",
      "مبلغ (ریال)",
      "تاریخ سررسید",
      "تاریخ ایجاد",
      "وضعیت",
      "نوع",
    ];

    generateSelectedRowsPng(selectedData, headers, {
      filename: `selected-checks-${selectedChecks.size}-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  // Handle PNG generation from existing table DOM

  return (
    <div className="p-6  min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">مدیریت چک ها</h1>
            {(() => {
              const checksWithFromBank = checks.map((check) => ({
                ...check,
                fromBank: check.fromBank || [],
                toBank:
                  typeof check.toBank === "object"
                    ? check.toBank._id || ""
                    : check.toBank || "",
              }));
              const upcomingChecks =
                CheckPriorityService.getOverdueChecks(checksWithFromBank);

              return upcomingChecks.length > 0;
            })() && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-orange-600 font-medium">
                  {
                    CheckPriorityService.getOverdueChecks(
                      checks.map((check) => ({
                        ...check,
                        fromBank: check.fromBank || [],
                        toBank:
                          typeof check.toBank === "object"
                            ? check.toBank._id || ""
                            : check.toBank || "",
                      }))
                    ).length
                  }{" "}
                  چک نزدیک سررسید (1هفته آینده)
                </span>
                <button
                  onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    showOverdueOnly
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {showOverdueOnly ? "نمایش همه" : "نمایش نزدیک سررسید"}
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTablePng}
              disabled={isGenerating || filteredChecks.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              دانلود جدول (PNG)
            </button>

            <button
              onClick={handleSelectedRowsPng}
              disabled={isGenerating || selectedChecks.size === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              انتخاب شده ({selectedChecks.size})
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 justify-center items-center gap-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس وضعیت
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">همه وضعیت ها</option>
                <option value="nazeSandogh">نزد صندوق</option>
                <option value="darJaryanVosool">در جریان وصول</option>
                <option value="vosoolShode">وصول شده</option>
                <option value="bargashti">برگشتی</option>
                <option value="enteghalDadeShode">انتقال داده شده</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس نوع
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">همه انواع</option>
                <option value="income">دریافتی</option>
                <option value="outcome">پرداختی</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={dateFrom}
                onChange={(date) => setDateFrom(date?.toDate() || null)}
                placeholder="از تاریخ"
                format="YYYY/MM/DD"
                inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={dateTo}
                placeholder="تا تاریخ"
                onChange={(date) => setDateTo(date?.toDate() || null)}
                format="YYYY/MM/DD"
                inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس بانک
              </label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه بانک ها</option>
                {banks.map((bank) => (
                  <option key={bank._id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس مشتری
              </label>
              <input
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="نام مشتری"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پاک کردن فیلترها
              </label>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setDateFrom(null);
                  setDateTo(null);
                  setBankFilter("");
                  setCustomerFilter("");
                  setShowOverdueOnly(false);
                }}
                className="w-full px-4 py-2 cursor-pointer border border-red-500 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* Checks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
            </div>
          ) : filteredChecks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">چکی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                id="checks-table"
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedChecks.size === filteredChecks.length &&
                          filteredChecks.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      شماره چک
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      در وجه
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      مبلغ (ریال)
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      تاریخ سررسید
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      تاریخ ایجاد
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      وضعیت
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      نوع
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      اقدامات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChecks?.map((check, idx) => {
                    const priority = CheckPriorityService.getCheckPriority(
                      check.dueDate
                    );
                    return (
                      <motion.tr
                        key={check._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`hover:bg-gray-50 ${
                          selectedChecks.has(check._id) ? "bg-blue-50" : ""
                        } ${
                          showOverdueOnly ||
                          (priority.days >= 7 && check.type === "income")
                            ? `border-r-4 ${CheckPriorityService.getBorderColor(
                                priority
                              )}`
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={selectedChecks.has(check._id)}
                            onChange={() => handleSelectCheck(check._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {check.checkNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {check.receiverName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatAmount(check.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span>{formatDate(check.dueDate)}</span>
                            {(showOverdueOnly ||
                              (priority.days >= 7 &&
                                check.type === "income")) && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full mt-1 inline-block w-fit ${priority.color}`}
                              >
                                {CheckPriorityService.getDaysText(
                                  priority.days
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(check.createdAt)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                check.status === "vosoolShode"
                                  ? "bg-green-100 text-green-800"
                                  : check.status === "nazeSandogh"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : check.status === "bargashti"
                                  ? "bg-red-100 text-red-800"
                                  : check.status === "darJaryanVosool"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {check.status === "nazeSandogh"
                                ? "نزد صندوق"
                                : check.status === "darJaryanVosool"
                                ? "در جریان وصول"
                                : check.status === "vosoolShode"
                                ? "وصول شده"
                                : check.status === "bargashti"
                                ? "برگشتی"
                                : "انتقال داده شده"}
                            </span>
                            {check.status === "nazeSandogh" &&
                              check.inboxStatus && (
                                <span className="text-xs text-gray-500">
                                  (
                                  {check.inboxStatus === "darJaryanVosool"
                                    ? "در جریان وصول"
                                    : check.inboxStatus === "vosoolShode"
                                    ? "وصول شده"
                                    : check.inboxStatus === "bargashti"
                                    ? "برگشتی"
                                    : "انتقال داده شده"}
                                  )
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              check.type === "income"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {check.type === "income" ? "دریافتی" : "پرداختی"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <div className="relative group">
                              <button
                                onClick={() => {
                                  setSelectedCheck(check);
                                  setIsViewModalOpen(true);
                                }}
                                className="text-blue-600 border cursor-pointer hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlineEye className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                مشاهده جزئیات
                              </span>
                            </div>

                            <div className="relative group">
                              <button
                                onClick={() => handleEdit(check)}
                                className="text-amber-600 border cursor-pointer hover:text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlinePencilAlt className="w-4 h-4" />{" "}
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                ویرایش
                              </span>
                            </div>

                            <div className="relative group">
                              <button
                                onClick={() => {
                                  setSelectedCheck(check);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-600 border cursor-pointer hover:text-red-900 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                حذف
                              </span>
                            </div>
                            <div className="relative group">
                              <button
                                onClick={() => handleRowPng(check)}
                                disabled={isGenerating}
                                className="text-purple-600 border cursor-pointer hover:text-purple-900 px-3 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                              >
                                <HiOutlineDownload className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                دانلود PNG
                              </span>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedCheck && (
          <div className="fixed inset-0 backdrop-blur-md flex -mt-120 items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg text-black shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    مشاهده جزئیات چک
                  </h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">بستن</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات چک
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            شماره چک:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedCheck.checkNumber || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            تاریخ سررسید:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedCheck.dueDate
                              ? formatDate(selectedCheck.dueDate)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">مبلغ:</span>
                          <span className="text-sm font-medium">
                            {formatAmount(selectedCheck.amount || 0)} ریال
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">در وجه:</span>
                          <span className="text-sm font-medium">
                            {selectedCheck.receiverName || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات بانک
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">بانک :</span>
                          <span className="text-sm font-medium">
                            {typeof selectedCheck.toBank === "object"
                              ? selectedCheck.toBank.name || "-"
                              : selectedCheck.toBank || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات تکمیلی
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            نوع انتقال:
                          </span>
                          <span className="text-sm font-medium">چک</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            تاریخ سند:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedCheck.createdAt
                              ? formatDate(selectedCheck.createdAt)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            نام صادر کننده:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedCheck.senderName || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                    توضیحات
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedCheck.description || "توضیحاتی ثبت نشده است"}
                  </p>
                </div>

                <div className="mt-6 flex justify-start">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedCheck && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    ویرایش چک شماره {selectedCheck.checkNumber}
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditFormData({});
                      setSelectedCheck(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره چک
                    </label>
                    <input
                      type="number"
                      value={editFormData.checkNumber || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          checkNumber: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره سری
                    </label>
                    <input
                      type="number"
                      value={editFormData.seryNumber || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          seryNumber: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مبلغ (ریال)
                    </label>
                    <input
                      type="number"
                      value={editFormData.amount || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          amount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاریخ سررسید
                    </label>
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={
                        editFormData.dueDate
                          ? new Date(editFormData.dueDate)
                          : null
                      }
                      onChange={(date) =>
                        setEditFormData({
                          ...editFormData,
                          dueDate: date?.toDate()?.toISOString() || "",
                        })
                      }
                      format="YYYY/MM/DD"
                      inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      بانک
                    </label>
                    <select
                      value={
                        typeof editFormData.toBank === "object"
                          ? editFormData.toBank._id || ""
                          : editFormData.toBank || ""
                      }
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          toBank: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">انتخاب بانک</option>
                      {banks.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وضعیت
                    </label>
                    <select
                      value={editFormData.status || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value as
                            | "nazeSandogh"
                            | "darJaryanVosool"
                            | "vosoolShode"
                            | "bargashti"
                            | "enteghalDadeShode"
                            | undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="nazeSandogh">نزد صندوق</option>
                      <option value="darJaryanVosool">در جریان وصول</option>
                      <option value="vosoolShode">وصول شده</option>
                      <option value="bargashti">برگشتی</option>
                      <option value="enteghalDadeShode">انتقال داده شده</option>
                    </select>
                  </div>

                  {editFormData.status === "nazeSandogh" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        وضعیت در صندوق
                      </label>
                      <select
                        value={editFormData.inboxStatus || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            inboxStatus: e.target.value as
                              | "darJaryanVosool"
                              | "vosoolShode"
                              | "bargashti"
                              | "enteghalDadeShode"
                              | null
                              | undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="darJaryanVosool">در جریان وصول</option>
                        <option value="vosoolShode">وصول شده</option>
                        <option value="bargashti">برگشتی</option>
                        <option value="enteghalDadeShode">
                          انتقال داده شده
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع
                    </label>
                    <select
                      value={editFormData.type || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          type: e.target.value as "income" | "outcome",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="income">دریافتی</option>
                      <option value="outcome">پرداختی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام صادرکننده
                    </label>
                    <input
                      type="text"
                      value={editFormData.senderName || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          senderName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام دریافت کننده
                    </label>
                    <input
                      type="text"
                      value={editFormData.receiverName || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          receiverName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      توضیحات
                    </label>
                    <textarea
                      value={editFormData.description || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-start gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditFormData({});
                      setSelectedCheck(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    ذخیره تغییرات
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedCheck && (
          <div className="fixed inset-0 backdrop-blur-md flex -mt-120 items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">حذف چک</h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">بستن</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    آیا از حذف چک شماره{" "}
                    <span className="font-medium">
                      {selectedCheck.documentNumber}
                    </span>{" "}
                    به مبلغ{" "}
                    <span className="font-medium">
                      {formatAmount(selectedCheck.amount)} ریال
                    </span>{" "}
                    اطمینان دارید؟
                  </p>
                </div>

                <div className="mt-6 flex justify-start gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    حذف چک
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
