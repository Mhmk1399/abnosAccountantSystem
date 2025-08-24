"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiX,
  HiOutlineDownload,
} from "react-icons/hi";
import { useTableToPng } from "../../hooks/useTableToPng";
import { useDailyBook } from "@/contexts/DailyBookContext";

export interface CashTransaction {
  _id: string;
  amount: number;
  transactionDate: string;
  description?: string;
  documentNumber?: string;
  documentDate?: string;
  paidBy: { _id: string; name: string; code: string };
  payTo: { _id: string; name: string; code: string };
  type: "income" | "outcome";
  createdAt: string;
  updatedAt: string;
}

export default function CashTransactionManager() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    CashTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashTransaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: null as DateObject | null,
    dateTo: null as DateObject | null,
    amountFrom: "",
    amountTo: "",
    description: "",
    paidBy: "",
    payTo: "",
    type: "",
  });
  const { detailedAccounts } = useDailyBook();
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error,
  } = useTableToPng();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/cash");
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      console.log("Transactions:", data.cashTransactions); // Debug log
      setTransactions(data.cashTransactions || []);
      setFilteredTransactions(data.cashTransactions || []);
    } catch (error) {
      toast.error("خطا در دریافت لیست تراکنش های نقدی");
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.dateFrom) {
      const fromDate = filters.dateFrom.toDate();
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = filters.dateTo.toDate();
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate <= toDate;
      });
    }

    if (filters.amountFrom) {
      filtered = filtered.filter(
        (transaction) => transaction.amount >= Number(filters.amountFrom)
      );
    }

    if (filters.amountTo) {
      filtered = filtered.filter(
        (transaction) => transaction.amount <= Number(filters.amountTo)
      );
    }

    if (filters.description) {
      filtered = filtered.filter((transaction) =>
        transaction.description
          ?.toLowerCase()
          .includes(filters.description.toLowerCase())
      );
    }

    if (filters.paidBy) {
      filtered = filtered.filter((transaction) =>
        typeof transaction.paidBy === "object"
          ? transaction.paidBy._id === filters.paidBy
          : transaction.paidBy === filters.paidBy
      );
    }

    if (filters.payTo) {
      filtered = filtered.filter((transaction) =>
        typeof transaction.payTo === "object"
          ? transaction.payTo._id === filters.payTo
          : transaction.payTo === filters.payTo
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (transaction) => transaction.type === filters.type
      );
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterChange = (
    key: string,
    value: string | DateObject | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      amountFrom: "",
      amountTo: "",
      description: "",
      paidBy: "",
      payTo: "",
      type: "",
    });
  };

  const [formData, setFormData] = useState({
    amount: "",
    transactionDate: null as DateObject | null,
    description: "",
    documentNumber: "",
    documentDate: null as DateObject | null,
    paidBy: "",
    payTo: "",
    type: "income" as "income" | "outcome",
  });

  const handleEdit = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch("/api/transactions/cash", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: selectedTransaction._id,
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          transactionDate: formData.transactionDate?.toDate().toISOString(),
          description: formData.description,
          documentNumber: formData.documentNumber,
          documentDate: formData.documentDate?.toDate().toISOString(),
          paidBy: formData.paidBy,
          payTo: formData.payTo,
          type: formData.type,
        }),
      });

      if (response.ok) {
        toast.success("تراکنش با موفقیت ویرایش شد");
        setIsEditModalOpen(false);
        setSelectedTransaction(null);
        setFormData({
          amount: "",
          transactionDate: null,
          description: "",
          documentNumber: "",
          documentDate: null,
          paidBy: "",
          payTo: "",
          type: "income",
        });
        fetchTransactions();
      } else {
        toast.error("خطا در ویرایش تراکنش");
      }
    } catch (error) {
      toast.error("خطا در ویرایش تراکنش");
      console.error("Error editing transaction:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await fetch(`/api/transactions/cash`, {
        method: "DELETE",
        headers: {
          id: selectedTransaction._id,
        },
      });
      toast.success("تراکنش با موفقیت حذف شد");
      setTransactions(
        transactions.filter((t) => t._id !== selectedTransaction._id)
      );
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      toast.error("خطا در حذف تراکنش");
      console.error("Error deleting transaction:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-IR");
  };

  const handleRowPng = (transaction: CashTransaction) => {
    const headers = [
      "#",
      "مبلغ (ریال)",
      "تاریخ تراکنش",
      "پرداخت کننده",
      "دریافت کننده",
      "شماره سند",
      "نوع",
      "توضیحات",
    ];
    const rowData = {
      index:
        filteredTransactions.findIndex((t) => t._id === transaction._id) + 1,
      amount: formatAmount(transaction.amount),
      transactionDate: formatDate(transaction.transactionDate),
      paidBy:
        typeof transaction.paidBy === "object"
          ? transaction.paidBy?.name
          : transaction.paidBy || "-",
      payTo:
        typeof transaction.payTo === "object"
          ? transaction.payTo?.name
          : transaction.payTo || "-",
      documentNumber: transaction.documentNumber || "-",
      type: transaction.type === "income" ? "دریافتی" : "پرداختی",
      description: transaction.description || "-",
    };
    generateRowPng(rowData, headers, {
      filename: `cash-transaction-${
        transaction.documentNumber
      }-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleTablePng = () => {
    const headers = [
      "#",
      "مبلغ (ریال)",
      "تاریخ تراکنش",
      "پرداخت کننده",
      "دریافت کننده",
      "شماره سند",
      "نوع",
      "توضیحات",
    ];
    const tableData = filteredTransactions.map((transaction, idx) => ({
      index: idx + 1,
      amount: formatAmount(transaction.amount),
      transactionDate: formatDate(transaction.transactionDate),
      paidBy:
        typeof transaction.paidBy === "object"
          ? transaction.paidBy?.name
          : transaction.paidBy || "-",
      payTo:
        typeof transaction.payTo === "object"
          ? transaction.payTo?.name
          : transaction.payTo || "-",
      documentNumber: transaction.documentNumber || "-",
      type: transaction.type === "income" ? "دریافتی" : "پرداختی",
      description: transaction.description || "-",
    }));
    generateTablePng(tableData, headers, {
      filename: `cash-transactions-table-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map((t) => t._id)));
    }
  };

  const handleSelectedRowsPng = () => {
    const selectedData = filteredTransactions
      .filter((t) => selectedTransactions.has(t._id))
      .map((transaction) => ({
        index:
          filteredTransactions.findIndex((t) => t._id === transaction._id) + 1,
        amount: formatAmount(transaction.amount),
        transactionDate: formatDate(transaction.transactionDate),
        paidBy:
          typeof transaction.paidBy === "object"
            ? transaction.paidBy?.name
            : transaction.paidBy || "-",
        payTo:
          typeof transaction.payTo === "object"
            ? transaction.payTo?.name
            : transaction.payTo || "-",
        documentNumber: transaction.documentNumber || "-",
        type: transaction.type === "income" ? "دریافتی" : "پرداختی",
        description: transaction.description || "-",
      }));

    const headers = [
      "#",
      "مبلغ (ریال)",
      "تاریخ تراکنش",
      "پرداخت کننده",
      "دریافت کننده",
      "شماره سند",
      "نوع",
      "توضیحات",
    ];

    generateSelectedRowsPng(selectedData, headers, {
      filename: `selected-cash-transactions-${
        selectedTransactions.size
      }-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  return (
    <div className="p-6 min-h-screen relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت تراکنش های نقدی
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTablePng}
              disabled={isGenerating || filteredTransactions.length === 0}
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
              disabled={isGenerating || selectedTransactions.size === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              انتخاب شده ({selectedTransactions.size})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-9 gap-1 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پرداخت کننده
              </label>
              <select
                value={filters.paidBy}
                onChange={(e) => handleFilterChange("paidBy", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه</option>
                {detailedAccounts.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دریافت کننده
              </label>
              <select
                value={filters.payTo}
                onChange={(e) => handleFilterChange("payTo", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه</option>
                {detailedAccounts.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-300">
                <FaRegCalendarAlt className="text-gray-400" />
                <DatePicker
                  value={filters.dateFrom}
                  onChange={(date: DateObject | DateObject[] | null) => {
                    if (date && typeof date === "object" && "toDate" in date) {
                      handleFilterChange("dateFrom", date);
                    } else {
                      handleFilterChange("dateFrom", null);
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="w-full bg-transparent focus:outline-none"
                  calendarPosition="bottom-right"
                  placeholder="از تاریخ"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-300">
                <FaRegCalendarAlt className="text-gray-400" />
                <DatePicker
                  value={filters.dateTo}
                  onChange={(date: DateObject | DateObject[] | null) => {
                    if (date && typeof date === "object" && "toDate" in date) {
                      handleFilterChange("dateTo", date);
                    } else {
                      handleFilterChange("dateTo", null);
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="w-full bg-transparent focus:outline-none"
                  calendarPosition="bottom-right"
                  placeholder="تا تاریخ"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از مبلغ
              </label>
              <input
                type="number"
                value={filters.amountFrom}
                onChange={(e) =>
                  handleFilterChange("amountFrom", e.target.value)
                }
                placeholder="از مبلغ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا مبلغ
              </label>
              <input
                type="number"
                value={filters.amountTo}
                onChange={(e) => handleFilterChange("amountTo", e.target.value)}
                placeholder="تا مبلغ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات
              </label>
              <input
                type="text"
                value={filters.description}
                onChange={(e) =>
                  handleFilterChange("description", e.target.value)
                }
                placeholder="جستجو در توضیحات"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع تراکنش
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه</option>
                <option value="income">دریافتی</option>
                <option value="outcome">پرداختی</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پاک کردن فیلترها{" "}
              </label>
              <button
                onClick={clearFilters}
                className="w-full cursor-pointer px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">تراکنشی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                id="cash-transactions-table"
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedTransactions.size ===
                            filteredTransactions.length &&
                          filteredTransactions.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مبلغ (ریال)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاریخ تراکنش
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      پرداخت کننده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      دریافت کننده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شماره سند
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      توضیحات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اقدامات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction, idx) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`hover:bg-gray-50 ${
                        selectedTransactions.has(transaction._id)
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.has(transaction._id)}
                          onChange={() =>
                            handleSelectTransaction(transaction._id)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof transaction.paidBy === "object"
                          ? transaction.paidBy?.name
                          : transaction.paidBy || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof transaction.payTo === "object"
                          ? transaction.payTo?.name
                          : transaction.payTo || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.documentNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "دریافتی"
                            : "پرداختی"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction?.description?.slice(0, 30)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <div className="relative group">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
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
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setFormData({
                                  amount: transaction.amount.toString(),

                                  transactionDate: transaction.transactionDate
                                    ? new DateObject(
                                        new Date(transaction.transactionDate)
                                      )
                                    : null,
                                  description: transaction.description || "",
                                  documentNumber:
                                    transaction.documentNumber || "",
                                  documentDate: transaction.documentDate
                                    ? new DateObject(
                                        new Date(transaction.documentDate)
                                      )
                                    : null,
                                  paidBy:
                                    typeof transaction.paidBy === "object"
                                      ? transaction.paidBy._id
                                      : transaction.paidBy,
                                  payTo:
                                    typeof transaction.payTo === "object"
                                      ? transaction.payTo._id
                                      : transaction.payTo,
                                  type: transaction.type,
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="text-amber-600 border cursor-pointer hover:text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              ویرایش
                            </span>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
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
                              onClick={() => handleRowPng(transaction)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    ویرایش تراکنش نقدی
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTransaction(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <HiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مبلغ *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مبلغ تراکنش"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ تراکنش *
                    </label>
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-300">
                      <FaRegCalendarAlt className="text-gray-400" />
                      <DatePicker
                        value={formData.transactionDate}
                        onChange={(date: DateObject | DateObject[] | null) => {
                          if (
                            date &&
                            typeof date === "object" &&
                            "toDate" in date
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              transactionDate: date,
                            }));
                          }
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        format="YYYY/MM/DD"
                        inputClass="w-full bg-transparent focus:outline-none"
                        placeholder="انتخاب تاریخ"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      پرداخت کننده *
                    </label>
                    <select
                      value={formData.paidBy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paidBy: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">انتخاب کنید...</option>
                      {detailedAccounts.map((account) => (
                        <option
                          key={account._id.toString()}
                          value={account._id.toString()}
                        >
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      دریافت کننده *
                    </label>
                    <select
                      value={formData.payTo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          payTo: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">انتخاب کنید...</option>
                      {detailedAccounts.map((account) => (
                        <option
                          key={account._id.toString()}
                          value={account._id.toString()}
                        >
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره سند
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          documentNumber: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="شماره سند"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ سند
                    </label>
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-300">
                      <FaRegCalendarAlt className="text-gray-400" />
                      <DatePicker
                        value={formData.documentDate}
                        onChange={(date: DateObject | DateObject[] | null) => {
                          if (
                            date &&
                            typeof date === "object" &&
                            "toDate" in date
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              documentDate: date,
                            }));
                          }
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        format="YYYY/MM/DD"
                        inputClass="w-full bg-transparent focus:outline-none"
                        placeholder="انتخاب تاریخ"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع تراکنش *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as "income" | "outcome",
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="income">دریافتی</option>
                      <option value="outcome">پرداختی</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="توضیحات تراکنش"
                  />
                </div>

                <div className="mt-6 flex justify-start gap-3">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTransaction(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    ویرایش تراکنش
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedTransaction && (
          <div className="fixed inset-0 backdrop-blur-md flex -mt-120 items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg text-black shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    مشاهده جزئیات تراکنش نقدی
                  </h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <HiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات تراکنش
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">مبلغ:</span>
                          <span className="text-sm font-medium">
                            {formatAmount(selectedTransaction.amount)} ریال
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            تاریخ تراکنش:
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(selectedTransaction.transactionDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            شماره سند:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedTransaction.documentNumber || "-"}
                          </span>
                        </div>
                        {selectedTransaction.documentDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              تاریخ سند:
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(selectedTransaction.documentDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات طرفین
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            پرداخت کننده:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedTransaction.paidBy?.name || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            دریافت کننده:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedTransaction.payTo?.name || "-"}
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
                    {selectedTransaction.description || "توضیحاتی ثبت نشده است"}
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedTransaction && (
          <div className="fixed inset-0 backdrop-blur-md flex -mt-120 items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    حذف تراکنش
                  </h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <HiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    آیا از حذف تراکنش به مبلغ{" "}
                    <span className="font-medium">
                      {formatAmount(selectedTransaction.amount)} ریال
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
                    حذف تراکنش
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
