"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import { useTableToPng } from "../../hooks/useTableToPng";
import BankCheckTableModal from "./BankCheckTableModal";
import { useBank } from "@/hooks/useBank";
import { Bank } from "@/types/type";

export default function BankManager() {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedBankForChecks, setSelectedBankForChecks] =
    useState<Bank | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [accountNumberFilter, setAccountNumberFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [selectedBanks, setSelectedBanks] = useState<Set<string>>(new Set());

  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error: pngError,
  } = useTableToPng();

  // Fetch banks using custom hook
  const {
    banks,
    pagination,
    isLoading,
    error: swrError,
    mutate,
  } = useBank({
    currentPage,
    recordsPerPage,
    nameFilter,
    branchFilter,
    ownerFilter,
    accountNumberFilter,
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    branchName: "",
    branchCode: "",
    accountNumber: "",
    ownerName: "",
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, branchFilter, ownerFilter, accountNumberFilter]);

  const clearFilters = () => {
    setNameFilter("");
    setBranchFilter("");
    setOwnerFilter("");
    setAccountNumberFilter("");
    setCurrentPage(1);
  };

  // Calculate total banks count
  const totalBanks = useMemo(() => {
    return banks.length;
  }, [banks]);

  // Handle create bank
  const handleCreate = async () => {
    try {
      const response = await fetch("/api/transactions/bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("بانک با موفقیت ایجاد شد");
        mutate();
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          description: "",
          branchName: "",
          branchCode: "",
          accountNumber: "",
          ownerName: "",
        });
      } else {
        toast.error("خطا در ایجاد بانک");
      }
    } catch (error) {
      toast.error("خطا در ایجاد بانک");
      console.error("Error creating bank:", error);
    }
  };

  // Handle update bank
  const handleUpdate = async () => {
    if (!selectedBank) return;

    try {
      const response = await fetch(`/api/transactions/bank`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          id: selectedBank._id,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("بانک با موفقیت ویرایش شد");
        mutate();
        setIsEditModalOpen(false);
        setSelectedBank(null);
      } else {
        toast.error("خطا در ویرایش بانک");
      }
    } catch (error) {
      toast.error("خطا در ویرایش بانک");
      console.error("Error updating bank:", error);
    }
  };

  // Handle delete bank
  const handleDelete = async () => {
    if (!selectedBank) return;

    try {
      const response = await fetch(`/api/transactions/bank`, {
        method: "DELETE",
        headers: {
          id: selectedBank._id,
        },
      });

      if (response.ok) {
        toast.success("بانک با موفقیت حذف شد");
        mutate();
        setIsDeleteModalOpen(false);
        setSelectedBank(null);
      } else {
        toast.error("خطا در حذف بانک");
      }
    } catch (error) {
      toast.error("خطا در حذف بانک");
      console.error("Error deleting bank:", error);
    }
  };

  const openEditModal = (bank: Bank) => {
    setSelectedBank(bank);
    setFormData({
      name: bank.name,
      description: bank.description,
      branchName: bank.branchName,
      branchCode: bank.branchCode,
      accountNumber: bank.accountNumber,
      ownerName: bank.ownerName,
    });
    setIsEditModalOpen(true);
  };

  // Handle PNG generation for single row
  const handleRowPng = (bank: Bank) => {
    const headers = [
      "#",
      "نام بانک",
      "شعبه",
      "کد شعبه",
      "شماره حساب",
      "صاحب حساب",
    ];
    const rowData = {
      index:
        (currentPage - 1) * recordsPerPage +
        banks.findIndex((b) => b._id === bank._id) +
        1,
      name: bank.name,
      branchName: bank.branchName,
      branchCode: bank.branchCode,
      accountNumber: bank.accountNumber,
      ownerName: bank.ownerName,
    };
    generateRowPng(rowData, headers, {
      filename: `bank-${bank.name}-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  // Handle PNG generation for entire table
  const handleTablePng = () => {
    const headers = [
      "#",
      "نام بانک",
      "شعبه",
      "کد شعبه",
      "شماره حساب",
      "صاحب حساب",
    ];
    const tableData = banks.map((bank, idx) => ({
      index: (currentPage - 1) * recordsPerPage + idx + 1,
      name: bank.name,
      branchName: bank.branchName,
      branchCode: bank.branchCode,
      accountNumber: bank.accountNumber,
      ownerName: bank.ownerName,
    }));
    generateTablePng(tableData, headers, {
      filename: `banks-table-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectBank = (bankId: string) => {
    setSelectedBanks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bankId)) {
        newSet.delete(bankId);
      } else {
        newSet.add(bankId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedBanks.size === banks.length) {
      setSelectedBanks(new Set());
    } else {
      setSelectedBanks(new Set(banks.map((bank) => bank._id)));
    }
  };

  const handleSelectedRowsPng = () => {
    const selectedData = banks
      .filter((bank) => selectedBanks.has(bank._id))
      .map((bank) => ({
        index:
          (currentPage - 1) * recordsPerPage +
          banks.findIndex((b) => b._id === bank._id) +
          1,
        name: bank.name,
        branchName: bank.branchName,
        branchCode: bank.branchCode,
        accountNumber: bank.accountNumber,
        ownerName: bank.ownerName,
      }));

    const headers = [
      "#",
      "نام بانک",
      "شعبه",
      "کد شعبه",
      "شماره حساب",
      "صاحب حساب",
    ];

    generateSelectedRowsPng(selectedData, headers, {
      filename: `selected-banks-${selectedBanks.size}-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleCheckPreparation = (bank: Bank) => {
    setSelectedBankForChecks(bank);
    setIsCheckModalOpen(true);
  };

  // Handle PNG generation from existing table DOM

  return (
    <div className="p-6 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">مدیریت بانک ها</h1>
          <div className="flex gap-2">
            <button
              onClick={handleTablePng}
              disabled={isGenerating || banks.length === 0}
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
              disabled={isGenerating || selectedBanks.size === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              انتخاب شده ({selectedBanks.size})
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              ایجاد بانک جدید
            </button>
          </div>
        </div>

        {/* Error display */}
        {(pngError || swrError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {pngError || swrError?.message}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس نام بانک
              </label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="نام بانک"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس شعبه
              </label>
              <input
                type="text"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                placeholder="نام شعبه"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس صاحب حساب
              </label>
              <input
                type="text"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                placeholder="نام صاحب حساب"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فیلتر بر اساس شماره حساب
              </label>
              <input
                type="text"
                value={accountNumberFilter}
                onChange={(e) => setAccountNumberFilter(e.target.value)}
                placeholder="شماره حساب"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پاک کردن فیلترها
              </label>
              <button
                onClick={clearFilters}
                className="w-full px-4 cursor-pointer py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* Banks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
            </div>
          ) : banks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">بانکی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                id="banks-table"
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedBanks.size === banks.length &&
                          banks.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نام بانک
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شعبه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کد شعبه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شماره حساب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      صاحب حساب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اقدامات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banks.map((bank, idx) => (
                    <motion.tr
                      key={bank._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`hover:bg-gray-50 ${
                        selectedBanks.has(bank._id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedBanks.has(bank._id)}
                          onChange={() => handleSelectBank(bank._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(currentPage - 1) * recordsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bank.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bank.branchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bank.branchCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bank.accountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bank.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <div className="relative group">
                            <button
                              onClick={() => {
                                setSelectedBank(bank);
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
                              onClick={() => openEditModal(bank)}
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
                                setSelectedBank(bank);
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
                              onClick={() => handleRowPng(bank)}
                              disabled={isGenerating}
                              className="text-purple-600 border cursor-pointer hover:text-purple-900 px-3 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                            >
                              <HiOutlineDownload className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              دانلود PNG
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleCheckPreparation(bank)}
                              className="text-green-600 border cursor-pointer hover:text-green-900 px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 flex items-center justify-center"
                            >
                              <HiOutlineClipboardCheck className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              چک پریپریشن
                            </span>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-right text-sm font-bold text-gray-900"
                    >
                      جمع کل:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {totalBanks} بانک
                    </td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  قبلی
                </button>
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 border rounded-md text-sm ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedBank && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg text-black shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    مشاهده جزئیات بانک
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

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات بانک
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            نام بانک:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            توضیحات بانک:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.description}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            نام شعبه:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.branchName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            کد شعبه:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.branchCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                        اطلاعات حساب
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            شماره حساب:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.accountNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            صاحب حساب:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedBank.ownerName}
                          </span>
                        </div>
                      </div>
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

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg text-black shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isCreateModalOpen ? "ایجاد بانک جدید" : "ویرایش بانک"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setFormData({
                        name: "",
                        description: "",
                        branchName: "",
                        branchCode: "",
                        accountNumber: "",
                        ownerName: "",
                        // detailedAccount: "",
                      });
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

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام بانک *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توضیحات بانک *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام شعبه *
                    </label>
                    <input
                      type="text"
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کد شعبه *
                    </label>
                    <input
                      type="text"
                      value={formData.branchCode}
                      onChange={(e) =>
                        setFormData({ ...formData, branchCode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره حساب *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صاحب حساب *
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({ ...formData, ownerName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-start gap-3">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setFormData({
                        name: "",
                        description: "",
                        branchName: "",
                        branchCode: "",
                        accountNumber: "",
                        ownerName: "",
                        // detailedAccount: "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={isCreateModalOpen ? handleCreate : handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {isCreateModalOpen ? "ایجاد بانک" : "ویرایش بانک"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedBank && (
          <div className="fixed inset-0 backdrop-blur-md -mt-120 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    حذف بانک
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
                    آیا از حذف بانک{" "}
                    <span className="font-medium">{selectedBank.name}</span>{" "}
                    شعبه{" "}
                    <span className="font-medium">
                      {selectedBank.branchName}
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
                    حذف بانک
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bank Check Table Modal */}
        {selectedBankForChecks && (
          <BankCheckTableModal
            isOpen={isCheckModalOpen}
            onClose={() => {
              setIsCheckModalOpen(false);
              setSelectedBankForChecks(null);
            }}
            bankId={selectedBankForChecks._id}
            bankName={selectedBankForChecks.name}
          />
        )}
      </div>
    </div>
  );
}
