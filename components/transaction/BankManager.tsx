"use client";

import { useState, useEffect } from "react";
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

export interface Bank {
  _id: string;
  name: string;
  description: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  ownerName: string;
  detailedAccount?: {
    _id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BankManager() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedBankForChecks, setSelectedBankForChecks] = useState<Bank | null>(null);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    branchName: "",
    branchCode: "",
    accountNumber: "",
    ownerName: "",
    // detailedAccount: "",
  });

  // PNG generation hook
  const [selectedBanks, setSelectedBanks] = useState<Set<string>>(new Set());
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error,
  } = useTableToPng();

  // Fetch banks from API
  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/bank");
      const data = await response.json();
      setBanks(data || []);
      setFilteredBanks(data || []);
    } catch (error) {
      toast.error("خطا در دریافت لیست بانک ها");
      console.error("Error fetching banks:", error);
      setBanks([]);
      setFilteredBanks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter banks
  const applyFilters = () => {
    let filtered = [...banks];

    if (nameFilter) {
      filtered = filtered.filter((bank) =>
        bank.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (branchFilter) {
      filtered = filtered.filter((bank) =>
        bank.branchName.toLowerCase().includes(branchFilter.toLowerCase())
      );
    }

    if (ownerFilter) {
      filtered = filtered.filter((bank) =>
        bank.ownerName.toLowerCase().includes(ownerFilter.toLowerCase())
      );
    }

    setFilteredBanks(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [banks, nameFilter, branchFilter, ownerFilter]);

  useEffect(() => {
    fetchBanks();
  }, []);

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
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          description: "",
          branchName: "",
          branchCode: "",
          accountNumber: "",
          ownerName: "",
          // detailedAccount: "",
        });
        fetchBanks();
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
        setIsEditModalOpen(false);
        setSelectedBank(null);
        fetchBanks();
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
        setBanks(banks.filter((bank) => bank._id !== selectedBank._id));
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
      // detailedAccount: bank.detailedAccount._id,
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
      index: filteredBanks.findIndex((b) => b._id === bank._id) + 1,
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
    const tableData = filteredBanks.map((bank, idx) => ({
      index: idx + 1,
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
    if (selectedBanks.size === filteredBanks.length) {
      setSelectedBanks(new Set());
    } else {
      setSelectedBanks(new Set(filteredBanks.map((bank) => bank._id)));
    }
  };

  const handleSelectedRowsPng = () => {
    const selectedData = filteredBanks
      .filter((bank) => selectedBanks.has(bank._id))
      .map((bank) => ({
        index: filteredBanks.findIndex((b) => b._id === bank._id) + 1,
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
              disabled={isGenerating || filteredBanks.length === 0}
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                پاک کردن فیلترها
              </label>
              <button
                onClick={() => {
                  setNameFilter("");
                  setBranchFilter("");
                  setOwnerFilter("");
                }}
                className="w-full px-4 cursor-pointer py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>

        {/* Banks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال دریافت اطلاعات...</p>
            </div>
          ) : filteredBanks.length === 0 ? (
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
                          selectedBanks.size === filteredBanks.length &&
                          filteredBanks.length > 0
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
                  {filteredBanks.map((bank, idx) => (
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
                        {idx + 1}
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
              </table>
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
