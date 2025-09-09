"use client";

import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useDailyBook } from "@/contexts/DailyBookContext";

interface TransactionFormProps {
  transactionType: "paied" | "recived" | "";
  paymentType: "cash" | "check" | "transfer" | "";
  onSubmit: (data: object) => void;
  loading: boolean;
  onBack: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transactionType,
  paymentType,
  onSubmit,
  loading,
  onBack,
}) => {
  const { detailedAccounts } = useDailyBook();

  const [formData, setFormData] = useState({
    sourceAccount: "",
    destinationAccount: "",
    amount: 0,
    date: new Date(),
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">اطلاعات تراکنش</h3>
        <p className="text-sm text-gray-600 mt-2">
          نوع: {transactionType === "recived" ? "دریافت" : "پرداخت"} - روش:{" "}
          {paymentType === "cash"
            ? "نقدی"
            : paymentType === "check"
            ? "چک"
            : "انتقال"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حساب مبدا *
            </label>
            <select
              name="sourceAccount"
              value={formData.sourceAccount}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب حساب مبدا</option>
              {detailedAccounts.map((account) => (
                <option
                  key={account._id.toString()}
                  value={account._id.toString()}
                >
                  {account.name} ({account.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حساب مقصد *
            </label>
            <select
              name="destinationAccount"
              value={formData.destinationAccount}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب حساب مقصد</option>
              {detailedAccounts.map((account) => (
                <option
                  key={account._id.toString()}
                  value={account._id.toString()}
                >
                  {account.name} ({account.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ (ریال) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ *
            </label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.date}
              onChange={(date) =>
                setFormData({ ...formData, date: date?.toDate() || new Date() })
              }
              format="YYYY/MM/DD"
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            بازگشت
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "در حال ثبت..." : "تکمیل تراکنش"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
