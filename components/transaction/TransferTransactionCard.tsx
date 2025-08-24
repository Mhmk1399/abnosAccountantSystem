"use client";

import React, { useState, useEffect } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt, FaExchangeAlt } from "react-icons/fa";
import toast from "react-hot-toast";

interface Bank {
  _id: string;
  name: string;
  branchName: string;
  accountNumber: string;
  ownerName: string;
}

interface TransferTransactionCardProps {
  onSuccess?: () => void;
}

const TransferTransactionCard: React.FC<TransferTransactionCardProps> = ({
  onSuccess,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    selectedBankId: "",
    transferReference: "",
    transferDate: null as DateObject | null,
    type: "income" as "income" | "outcome",
    amount: "",
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/transactions/bank");
      if (response.ok) {
        const data = await response.json();
        setBanks(data);
      }
    } catch (error) {
                  console.log(error)

      toast.error("خطا در دریافت لیست بانک‌ها");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedBankId || !formData.transferReference || !formData.transferDate) {
      toast.error("لطفا تمام فیلدهای الزامی را پر کنید");
      return;
    }

    setLoading(true);

    try {
      const transferData = {
        transferReference: formData.transferReference,
        transferDate: formData.transferDate.toDate().toISOString(),
        type: formData.type,
        // Logic based on transaction type
        ...(formData.type === "income" 
          ? { toBank: formData.selectedBankId, fromBank: "external" }
          : { fromBank: formData.selectedBankId, toBank: "external" }
        ),
      };

      const response = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      if (response.ok) {
        toast.success("تراکنش انتقالی با موفقیت ثبت شد");
        setFormData({
          selectedBankId: "",
          transferReference: "",
          transferDate: null,
          type: "income",
          amount: "",
        });
        onSuccess?.();
      } else {
        toast.error("خطا در ثبت تراکنش");
      }
    } catch (error) {
            console.log(error)

      toast.error("خطا در ارسال درخواست");
    } finally {
      setLoading(false);
    }
  };

  const selectedBank = banks.find(bank => bank._id === formData.selectedBankId);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6" dir="rtl">
      <div className="flex items-center justify-center mb-6">
        <FaExchangeAlt className="text-blue-600 text-2xl ml-3" />
        <h2 className="text-2xl font-bold text-gray-800">تراکنش انتقالی کارت به کارت</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                checked={formData.type === "income"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "income" | "outcome" }))}
                className="ml-2"
              />
              دریافتی (واریز به حساب)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="outcome"
                checked={formData.type === "outcome"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "income" | "outcome" }))}
                className="ml-2"
              />
              پرداختی (برداشت از حساب)
            </label>
          </div>
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.type === "income" ? "به حساب" : "از حساب"}
          </label>
          <select
            value={formData.selectedBankId}
            onChange={(e) => setFormData(prev => ({ ...prev, selectedBankId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">انتخاب بانک</option>
            {banks.map((bank) => (
              <option key={bank._id} value={bank._id}>
                {bank.name} - {bank.branchName} ({bank.accountNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Bank Info Card */}
        {selectedBank && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-800 mb-2">اطلاعات حساب انتخاب شده:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">نام بانک:</span> {selectedBank.name}</div>
              <div><span className="font-medium">شعبه:</span> {selectedBank.branchName}</div>
              <div><span className="font-medium">شماره حساب:</span> {selectedBank.accountNumber}</div>
              <div><span className="font-medium">نام صاحب حساب:</span> {selectedBank.ownerName}</div>
            </div>
          </div>
        )}

        {/* Transfer Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            شماره پیگیری *
          </label>
          <input
            type="text"
            value={formData.transferReference}
            onChange={(e) => setFormData(prev => ({ ...prev, transferReference: e.target.value }))}
            placeholder="شماره پیگیری تراکنش"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Transfer Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاریخ انتقال *
          </label>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={formData.transferDate}
              onChange={(date: DateObject | DateObject[] | null) => {
                if (date && typeof date === "object" && "toDate" in date) {
                  setFormData(prev => ({ ...prev, transferDate: date }));
                } else if (Array.isArray(date) && date[0] && "toDate" in date[0]) {
                  setFormData(prev => ({ ...prev, transferDate: date[0] }));
                } else {
                  setFormData(prev => ({ ...prev, transferDate: null }));
                }
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full bg-transparent focus:outline-none"
              calendarPosition="bottom-right"
              placeholder="انتخاب تاریخ"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
        >
          {loading ? "در حال ثبت..." : "ثبت تراکنش انتقالی"}
        </button>
      </form>
    </div>
  );
};

export default TransferTransactionCard;