"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineX, HiOutlineDownload } from "react-icons/hi";
import { useTableToPng } from "../../hooks/useTableToPng";
import toast from "react-hot-toast";

interface Check {
  _id: string;
  checkNumber: number;
  seryNumber: number;
  amount: number;
  dueDate: string;
  toBank: {
    _id: string;
    name: string;
  };
  otherSideBank: {
    name: string;
    owner: string;
    accountNumber: string;
  }[];
}

interface BankCheckTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  bankName: string;
}

export default function BankCheckTableModal({
  isOpen,
  onClose,
  bankId,
  bankName,
}: BankCheckTableModalProps) {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(new Set());

  const { generateTablePng, isGenerating } = useTableToPng();

  const fetchChecks = async () => {
    if (!dateFrom || !dateTo) {
      toast.error("لطفا بازه تاریخ را انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      });

      const response = await fetch(`/api/transactions/cheks?${params}`);
      const data = await response.json();
      
      // Filter checks by bank ID
      const filteredChecks = (data.checkTransactions || []).filter(
        (check: Check) => check.toBank._id === bankId
      );
      
      setChecks(filteredChecks);
    } catch (error) {
      toast.error("خطا در دریافت چک ها");
      console.error("Error fetching checks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const selectedChecksList = checks.filter(check => selectedChecks.has(check._id));
    if (selectedChecksList.length === 0) {
      toast.error("لطفا حداقل یک چک را انتخاب کنید");
      return;
    }
    
    const headers = ["بانک چک", "شماره حساب", "سری چک", "شماره چک", "تاریخ سررسید", "مبلغ"];
    const tableData = selectedChecksList.map((check) => ({
      bankName: check.otherSideBank?.[0]?.name || check.toBank.name,
      accountNumber: check.otherSideBank?.[0]?.accountNumber || "-",
      seryNumber: check.seryNumber,
      checkNumber: check.checkNumber,
      dueDate: new Date(check.dueDate).toLocaleDateString("fa-IR"),
      amount: check.amount.toLocaleString("fa-IR"),
    }));

    generateTablePng(tableData, headers, {
      filename: `bank-${bankName}-selected-checks-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectAll = () => {
    if (selectedChecks.size === checks.length) {
      setSelectedChecks(new Set());
    } else {
      setSelectedChecks(new Set(checks.map(check => check._id)));
    }
  };

  const handleCheckSelect = (checkId: string) => {
    setSelectedChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setChecks([]);
      setDateFrom("");
      setDateTo("");
      setSelectedChecks(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            چک های بانک {bankName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchChecks}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "در حال جستجو..." : "جستجو"}
              </button>
            </div>
          </div>

          {checks.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {selectedChecks.size === checks.length ? "لغو انتخاب همه" : "انتخاب همه"}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedChecks.size} از {checks.length} انتخاب شده
                </span>
              </div>
              <button
                onClick={handlePrint}
                disabled={isGenerating || selectedChecks.size === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <HiOutlineDownload size={16} />
                {isGenerating ? "در حال ساخت..." : `دریافت عکس (${selectedChecks.size})`}
              </button>
            </div>
          )}

          <div className="overflow-auto max-h-96">
            {loading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : checks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                چکی یافت نشد
              </div>
            ) : (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedChecks.size === checks.length && checks.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      بانک چک
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      شماره حساب
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      سری چک
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      شماره چک
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      تاریخ سررسید
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-right">
                      مبلغ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) => (
                    <tr key={check._id} className={`hover:bg-gray-50 ${selectedChecks.has(check._id) ? 'bg-blue-50' : ''}`}>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedChecks.has(check._id)}
                          onChange={() => handleCheckSelect(check._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {check.otherSideBank?.[0]?.name || check.toBank.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {check.otherSideBank?.[0]?.accountNumber || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {check.seryNumber}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {check.checkNumber}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(check.dueDate).toLocaleDateString("fa-IR")}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {check.amount.toLocaleString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}