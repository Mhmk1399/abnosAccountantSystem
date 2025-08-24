"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDownload,
} from "react-icons/hi";
import { useTableToPng } from "../../hooks/useTableToPng";
import { useDailyBook } from "@/contexts/DailyBookContext";

interface Bank {
  _id: string;
  name: string;
  branchName: string;
  accountNumber: string;
  ownerName: string;
}

interface TransferTransaction {
  _id: string;
  ourBank:
    | {
        _id: string;
        name: string;
        branchName: string;
        accountNumber: string;
      }
    | string;
  paidBy:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  payTo:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  customerBank?: string;
  transferReference: string;
  transferDate: string;
  type: "income" | "outcome";
  createdAt: string;
  updatedAt: string;
}

const TransferTransactionManager: React.FC = () => {
  const { detailedAccounts } = useDailyBook();
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error,
  } = useTableToPng();
  const [transfers, setTransfers] = useState<TransferTransaction[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<
    TransferTransaction[]
  >([]);
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(
    new Set()
  );
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferTransaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    selectedBankId: "",
    transferReference: "",
    transferDate: null as DateObject | null,
    type: "income" as "income" | "outcome",
    paidBy: "",
    payTo: "",
  });

  const [filters, setFilters] = useState({
    dateFrom: null as DateObject | null,
    dateTo: null as DateObject | null,
    fromBank: "",
    toBank: "",
    type: "all" as string,
    paidBy: "",
    payTo: "",
  });

  useEffect(() => {
    fetchTransfers();
    fetchBanks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transfers, filters]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/transfer");
      const data = await response.json();
      setTransfers(data.transferTransactions || []);
      setFilteredTransfers(data.transferTransactions || []);
    } catch (error) {
      console.log(error);

      toast.error("خطا در دریافت لیست تراکنشهای انتقالی");
      setTransfers([]);
      setFilteredTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/transactions/bank");
      if (response.ok) {
        const data = await response.json();
        setBanks(data);
      }
    } catch (error) {
      console.log(error);

      toast.error("خطا در دریافت لیست بانکها");
    }
  };

  const applyFilters = () => {
    let filtered = [...transfers];

    if (filters.dateFrom) {
      const fromDate = filters.dateFrom.toDate();
      filtered = filtered.filter(
        (transfer) => new Date(transfer.transferDate) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = filters.dateTo.toDate();
      filtered = filtered.filter(
        (transfer) => new Date(transfer.transferDate) <= toDate
      );
    }

    if (filters.toBank) {
      filtered = filtered.filter((transfer) => {
        const bankName =
          typeof transfer.ourBank === "object"
            ? transfer.ourBank.name
            : transfer.ourBank;
        return bankName === filters.toBank;
      });
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((transfer) => transfer.type === filters.type);
    }

    if (filters.paidBy) {
      filtered = filtered.filter((transfer) => {
        const paidById =
          typeof transfer.paidBy === "object"
            ? transfer.paidBy._id
            : transfer.paidBy;
        return paidById === filters.paidBy;
      });
    }

    if (filters.payTo) {
      filtered = filtered.filter((transfer) => {
        const payToId =
          typeof transfer.payTo === "object"
            ? transfer.payTo._id
            : transfer.payTo;
        return payToId === filters.payTo;
      });
    }

    setFilteredTransfers(filtered);
  };

  const handleEdit = (transfer: TransferTransaction) => {
    setSelectedTransfer(transfer);
    setEditFormData({
      selectedBankId:
        typeof transfer.ourBank === "object"
          ? transfer.ourBank._id
          : transfer.ourBank,
      transferReference: transfer.transferReference,
      transferDate: new DateObject(new Date(transfer.transferDate)).convert(
        persian,
        persian_fa
      ),
      type: transfer.type,
      paidBy:
        typeof transfer.paidBy === "object"
          ? transfer.paidBy._id
          : transfer.paidBy,
      payTo:
        typeof transfer.payTo === "object"
          ? transfer.payTo._id
          : transfer.payTo,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    try {
      const transferData = {
        transferReference: editFormData.transferReference,
        transferDate: editFormData.transferDate?.toDate().toISOString(),
        type: editFormData.type,
        paidBy: editFormData.paidBy,
        payTo: editFormData.payTo,
        ourBank: editFormData.selectedBankId,
      };

      const response = await fetch(`/api/transactions/transfer`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: selectedTransfer._id,
        },
        body: JSON.stringify(transferData),
      });

      if (response.ok) {
        toast.success("تراکنش با موفقیت به‌روزرسانی شد");
        setIsEditModalOpen(false);
        setSelectedTransfer(null);
        fetchTransfers();
      } else {
        toast.error("خطا در به‌روزرسانی تراکنش");
      }
    } catch (error) {
      console.log(error);

      toast.error("خطا در ارسال درخواست");
    }
  };

  const handleDelete = async () => {
    if (!selectedTransfer) return;

    try {
      await fetch(`/api/transactions/transfer`, {
        method: "DELETE",
        headers: {
          id: selectedTransfer._id,
        },
      });
      toast.success("تراکنش با موفقیت حذف شد");
      setTransfers(
        transfers.filter((transfer) => transfer._id !== selectedTransfer._id)
      );
      setIsDeleteModalOpen(false);
      setSelectedTransfer(null);
    } catch (error) {
      console.log(error);
      toast.error("خطا در حذف تراکنش");
    }
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      fromBank: "",
      toBank: "",
      type: "all",
      paidBy: "",
      payTo: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const handleRowPng = (transfer: TransferTransaction) => {
    const headers = [
      "#",
      "شماره پیگیری",
      "بانک ما",
      "پرداخت کننده",
      "دریافت کننده",
      "تاریخ انتقال",
      "نوع",
      "تاریخ ایجاد",
    ];
    const rowData = {
      index: filteredTransfers.findIndex((t) => t._id === transfer._id) + 1,
      transferReference: transfer.transferReference || "نامشخص",
      ourBank:
        typeof transfer.ourBank === "object" ? transfer.ourBank.name : "نامشخص",
      paidBy:
        typeof transfer.paidBy === "object"
          ? `${transfer.paidBy.name} (${transfer.paidBy.code})`
          : "نامشخص",
      payTo:
        typeof transfer.payTo === "object"
          ? `${transfer.payTo.name} (${transfer.payTo.code})`
          : "نامشخص",
      transferDate: formatDate(transfer.transferDate),
      type: transfer.type === "income" ? "دریافتی" : "پرداختی",
      createdAt: formatDate(transfer.createdAt),
    };
    generateRowPng(rowData, headers, {
      filename: `transfer-${transfer.transferReference}-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleTablePng = () => {
    const headers = [
      "#",
      "شماره پیگیری",
      "بانک ما",
      "پرداخت کننده",
      "دریافت کننده",
      "تاریخ انتقال",
      "نوع",
      "تاریخ ایجاد",
    ];
    const tableData = filteredTransfers.map((transfer, idx) => ({
      index: idx + 1,
      transferReference: transfer.transferReference || "نامشخص",
      ourBank:
        typeof transfer.ourBank === "object" ? transfer.ourBank.name : "نامشخص",
      paidBy:
        typeof transfer.paidBy === "object"
          ? `${transfer.paidBy.name} (${transfer.paidBy.code})`
          : "نامشخص",
      payTo:
        typeof transfer.payTo === "object"
          ? `${transfer.payTo.name} (${transfer.payTo.code})`
          : "نامشخص",
      transferDate: formatDate(transfer.transferDate),
      type: transfer.type === "income" ? "دریافتی" : "پرداختی",
      createdAt: formatDate(transfer.createdAt),
    }));
    generateTablePng(tableData, headers, {
      filename: `transfers-table-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectTransfer = (transferId: string) => {
    setSelectedTransfers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTransfers.size === filteredTransfers.length) {
      setSelectedTransfers(new Set());
    } else {
      setSelectedTransfers(new Set(filteredTransfers.map((t) => t._id)));
    }
  };

  const handleSelectedRowsPng = () => {
    const headers = [
      "#",
      "شماره پیگیری",
      "بانک ما",
      "پرداخت کننده",
      "دریافت کننده",
      "تاریخ انتقال",
      "نوع",
      "تاریخ ایجاد",
    ];
    const selectedData = filteredTransfers
      .filter((transfer) => selectedTransfers.has(transfer._id))
      .map((transfer, idx) => ({
        index: idx + 1,
        transferReference: transfer.transferReference || "نامشخص",
        ourBank:
          typeof transfer.ourBank === "object"
            ? transfer.ourBank.name
            : "نامشخص",
        paidBy:
          typeof transfer.paidBy === "object"
            ? `${transfer.paidBy.name} (${transfer.paidBy.code})`
            : "نامشخص",
        payTo:
          typeof transfer.payTo === "object"
            ? `${transfer.payTo.name} (${transfer.payTo.code})`
            : "نامشخص",
        transferDate: formatDate(transfer.transferDate),
        type: transfer.type === "income" ? "دریافتی" : "پرداختی",
        createdAt: formatDate(transfer.createdAt),
      }));
    generateSelectedRowsPng(selectedData, headers, {
      filename: `selected-transfers-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  return (
    <div className="p-6 min-h-screen relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مدیریت تراکنشهای انتقالی
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTablePng}
              disabled={isGenerating || filteredTransfers.length === 0}
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
              disabled={isGenerating || selectedTransfers.size === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              انتخاب شده ({selectedTransfers.size})
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 justify-center items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس نوع
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
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
                value={filters.dateFrom}
                onChange={(date) => handleFilterChange("dateFrom", date)}
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
                value={filters.dateTo}
                onChange={(date) => handleFilterChange("dateTo", date)}
                placeholder="تا تاریخ"
                format="YYYY/MM/DD"
                inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس بانک
              </label>
              <select
                value={filters.toBank}
                onChange={(e) => handleFilterChange("toBank", e.target.value)}
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
                پرداخت کننده
              </label>
              <select
                value={filters.paidBy}
                onChange={(e) => handleFilterChange("paidBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه حسابها</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه حسابها</option>
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
                پاک کردن فیلترها
              </label>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 cursor-pointer border border-red-500 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">تراکنش انتقالی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                id="transfers-table"
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedTransfers.size === filteredTransfers.length &&
                          filteredTransfers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شماره پیگیری
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      بانک ما
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      پرداخت کننده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      دریافت کننده
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاریخ انتقال
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاریخ ایجاد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اقدامات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransfers.map((transfer, idx) => (
                    <motion.tr
                      key={transfer._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`hover:bg-gray-50 ${
                        selectedTransfers.has(transfer._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedTransfers.has(transfer._id)}
                          onChange={() => handleSelectTransfer(transfer._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfer.transferReference || "نامشخص"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof transfer.ourBank === "object"
                          ? transfer.ourBank.name
                          : "نامشخص"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof transfer.paidBy === "object"
                          ? `${transfer.paidBy.name} (${transfer.paidBy.code})`
                          : "نامشخص"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof transfer.payTo === "object"
                          ? `${transfer.payTo.name} (${transfer.payTo.code})`
                          : "نامشخص"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transfer.transferDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transfer.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {transfer.type === "income" ? "دریافتی" : "پرداختی"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transfer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <div className="relative group">
                            <button
                              onClick={() => {
                                setSelectedTransfer(transfer);
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
                              onClick={() => handleEdit(transfer)}
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
                                setSelectedTransfer(transfer);
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
                              onClick={() => handleRowPng(transfer)}
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

        {/* View Modal */}
        {isViewModalOpen && selectedTransfer && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg text-black shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    مشاهده جزئیات تراکنش انتقالی
                  </h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
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

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        شماره پیگیری:
                      </span>
                      <p className="text-sm font-medium">
                        {selectedTransfer.transferReference}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        تاریخ انتقال:
                      </span>
                      <p className="text-sm font-medium">
                        {formatDate(selectedTransfer.transferDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">بانک ما:</span>
                      <p className="text-sm font-medium">
                        {typeof selectedTransfer.ourBank === "object"
                          ? selectedTransfer.ourBank.name
                          : selectedTransfer.ourBank}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">نوع تراکنش:</span>
                      <p className="text-sm font-medium">
                        {selectedTransfer.type === "income"
                          ? "دریافتی"
                          : "پرداختی"}
                      </p>
                    </div>
                  </div>
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
        {isEditModalOpen && selectedTransfer && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    ویرایش تراکنش انتقالی
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
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

                <form onSubmit={handleEditSubmit} className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transaction Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع تراکنش
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="income"
                            checked={editFormData.type === "income"}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                type: e.target.value as "income" | "outcome",
                              }))
                            }
                            className="ml-2"
                          />
                          دریافتی (واریز به حساب)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="outcome"
                            checked={editFormData.type === "outcome"}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                type: e.target.value as "income" | "outcome",
                              }))
                            }
                            className="ml-2"
                          />
                          پرداختی (برداشت از حساب)
                        </label>
                      </div>
                    </div>

                    {/* Bank Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بانک ما
                      </label>
                      <select
                        value={editFormData.selectedBankId}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            selectedBankId: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">انتخاب بانک</option>
                        {banks.map((bank) => (
                          <option key={bank._id} value={bank._id}>
                            {bank.name} - {bank.branchName} (
                            {bank.accountNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transfer Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره پیگیری
                      </label>
                      <input
                        type="number"
                        value={editFormData.transferReference}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            transferReference: e.target.value,
                          }))
                        }
                        placeholder="شماره پیگیری تراکنش"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Transfer Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاریخ انتقال *
                      </label>
                      <DatePicker
                        value={editFormData.transferDate}
                        onChange={(date: DateObject | DateObject[] | null) => {
                          if (
                            date &&
                            typeof date === "object" &&
                            "toDate" in date
                          ) {
                            setEditFormData((prev) => ({
                              ...prev,
                              transferDate: date,
                            }));
                          } else if (
                            Array.isArray(date) &&
                            date[0] &&
                            "toDate" in date[0]
                          ) {
                            setEditFormData((prev) => ({
                              ...prev,
                              transferDate: date[0],
                            }));
                          } else {
                            setEditFormData((prev) => ({
                              ...prev,
                              transferDate: null,
                            }));
                          }
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        format="YYYY/MM/DD"
                        inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        calendarPosition="bottom-right"
                        placeholder="انتخاب تاریخ"
                      />
                    </div>

                    {/* Paid By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        پرداخت کننده *
                      </label>
                      <select
                        value={editFormData.paidBy}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            paidBy: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">انتخاب حساب پرداخت کننده</option>
                        {detailedAccounts.map((account) => (
                          <option
                            key={account._id.toString()}
                            value={account._id.toString()}
                          >
                            {account.name} - {account.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pay To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        دریافت کننده *
                      </label>
                      <select
                        value={editFormData.payTo}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            payTo: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">انتخاب حساب دریافت کننده</option>
                        {detailedAccounts.map((account) => (
                          <option
                            key={account._id.toString()}
                            value={account._id.toString()}
                          >
                            {account.name} - {account.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-start gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200"
                    >
                      بهروزرسانی تراکنش
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedTransfer && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
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
                    آیا از حذف تراکنش با شماره پیگیری{" "}
                    <span className="font-medium">
                      {selectedTransfer.transferReference}
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
};

export default TransferTransactionManager;
