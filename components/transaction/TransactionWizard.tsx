"use client";

import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useDailyBook } from "@/contexts/DailyBookContext";
import FormattedNumberInput from "@/utils/FormattedNumberInput";
import {
  PaymentDetail,
  TransactionData,
  BankAccount,
  Account,
} from "@/types/finalTypes";
import { GroupDetailAccount } from "@/types/type";

interface TransactionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WizardState {
  step: number;
  transactionType: "outcome" | "income" | "";
  paymentType: "cash" | "check" | "transfer" | "";
  paymentDetail: PaymentDetail;
  paymentDetailId: string | null;
  transactionData: {
    sourceAccount: string;
    destinationAccount: string;
    amount: number;
    date: string;
    description: string;
  };
}

const TransactionWizard: React.FC<TransactionWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { detailedAccounts } = useDailyBook();

  const [wizardState, setWizardState] = useState<WizardState>({
    step: 1,
    transactionType: "",
    paymentType: "",
    paymentDetail: {},
    paymentDetailId: null,
    transactionData: {
      sourceAccount: "",
      destinationAccount: "",
      amount: 0,
      date: "",
      description: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleNext = useCallback(() => {
    setWizardState((prev) => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const handleBack = useCallback(() => {
    setWizardState((prev) => ({ ...prev, step: prev.step - 1 }));
  }, []);

  const handleTransactionTypeSelect = useCallback(
    (type: "outcome" | "income") => {
      setWizardState((prev) => ({ ...prev, transactionType: type }));
      handleNext();
    },
    [handleNext]
  );

  const handlePaymentTypeSelect = useCallback(
    (type: "cash" | "check" | "transfer") => {
      setWizardState((prev) => ({ ...prev, paymentType: type }));
      handleNext();
    },
    [handleNext]
  );

  const handlePaymentDetailSubmit = async (paymentData: PaymentDetail) => {
    setLoading(true);
    try {
      const endpointMap: Record<string, string> = {
        cash: "/api/transactions/cash",
        check: "/api/transactions/cheks",
        transfer: "/api/transactions/transfer",
      };

      const endpoint = endpointMap[wizardState.paymentType];
      let requestData = { ...paymentData, type: wizardState.transactionType };

      if (wizardState.paymentType === "check") {
        requestData = {
          ...paymentData,
          type: wizardState.transactionType,
          amount: Number(paymentData.amount),
          checkNumber: Number(paymentData.checkNumber),
          seryNumber: Number(paymentData.seryNumber),
          documentNumber: paymentData.documentNumber || `CHK-${Date.now()}`,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to create transaction");
      }

      const result = await response.json();
      let paymentDetailId = "";

      if (wizardState.paymentType === "cash" && result.cashTransaction) {
        paymentDetailId = result.cashTransaction._id;
        toast.success("تراکنش نقدی با موفقیت ثبت شد!");
      } else if (
        wizardState.paymentType === "check" &&
        result.checkTransaction
      ) {
        paymentDetailId = result.checkTransaction._id;
        toast.success("چک با موفقیت ثبت شد!");
      } else if (
        wizardState.paymentType === "transfer" &&
        result.transferTransaction
      ) {
        paymentDetailId = result.transferTransaction._id;
        toast.success("تراکنش انتقالی با موفقیت ثبت شد!");
      }

      setWizardState((prev) => ({
        ...prev,
        paymentDetail: paymentData,
        paymentDetailId: paymentDetailId,
      }));

      handleNext();
    } catch (error) {
      console.error("Error creating payment detail:", error);
      toast.error("خطا در ایجاد تراکنش");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (transactionData: TransactionData) => {
    setLoading(true);
    try {
      const payTypeModelMap: Record<string, string> = {
        cash: "CashTransaction",
        check: "CheckTransaction",
        transfer: "TransferTransaction",
      };

      const finalTransactionData = {
        type: wizardState.transactionType,
        payType: wizardState.paymentType,
        payTypeModel: payTypeModelMap[wizardState.paymentType] || "",
        payDetail: wizardState.paymentDetailId,
        ...transactionData,
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalTransactionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      toast.success("تراکنش با موفقیت ایجاد شد");
      onSuccess();
      handleClose();
    } catch (error) {
      console.log("Error creating transaction:", error);
      toast.error("ایجاد تراکنش ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setWizardState({
      step: 1,
      transactionType: "",
      paymentType: "",
      paymentDetail: {},
      paymentDetailId: null,
      transactionData: {
        sourceAccount: "",
        destinationAccount: "",
        amount: 0,
        date: "",
        description: "",
      },
    });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex -mt-40 items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-scroll animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💳</span>
            </div>
            ساخت تراکنش
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 text-gray-600 hover:text-gray-800"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    wizardState.step >= step
                      ? "bg-blue-500 text-white shadow-lg scale-110"
                      : wizardState.step === step - 1
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {wizardState.step > step ? "✓" : step}
                </div>
                {step < 4 && (
                  <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        wizardState.step > step
                          ? "bg-blue-500 w-full"
                          : "bg-gray-200 w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span
              className={
                wizardState.step >= 1 ? "text-blue-600" : "text-gray-500"
              }
            >
              نوع تراکنش
            </span>
            <span
              className={
                wizardState.step >= 2 ? "text-blue-600" : "text-gray-500"
              }
            >
              روش پرداخت
            </span>
            <span
              className={
                wizardState.step >= 3 ? "text-blue-600" : "text-gray-500"
              }
            >
              جزئیات پرداخت
            </span>
            <span
              className={
                wizardState.step >= 4 ? "text-blue-600" : "text-gray-500"
              }
            >
              اطلاعات تراکنش
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 min-h-[400px] overflow-y-auto">
          <div className="animate-in slide-in-from-right-4 duration-300">
            {wizardState.step === 1 && (
              <TransactionTypeStep onSelect={handleTransactionTypeSelect} />
            )}
            {wizardState.step === 2 && (
              <PaymentTypeStep
                onSelect={handlePaymentTypeSelect}
                onBack={handleBack}
              />
            )}
            {wizardState.step === 3 && (
              <PaymentDetailStep
                paymentType={wizardState.paymentType}
                transactionType={wizardState.transactionType}
                accounts={detailedAccounts as unknown as Account[]}
                onSubmit={handlePaymentDetailSubmit}
                onBack={handleBack}
                loading={loading}
              />
            )}
            {wizardState.step === 4 && (
              <TransactionDetailStep
                accounts={detailedAccounts as unknown as Account[]}
                onSubmit={handleFinalSubmit}
                onBack={handleBack}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: Transaction Type Selection
const TransactionTypeStep = memo<{
  onSelect: (type: "income" | "outcome") => void;
}>(({ onSelect }) => {
  return (
    <div className="text-center space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          انتخاب نوع تراکنش
        </h3>
        <p className="text-gray-600">نوع تراکنش مورد نظر خود را انتخاب کنید</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          onClick={() => onSelect("outcome")}
          className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
            💸
          </div>
          <div className="font-bold text-lg text-gray-800 mb-2">پرداخت شده</div>
          <div className="text-sm text-gray-600">پول پرداخت کرده‌اید</div>
        </button>
        <button
          onClick={() => onSelect("income")}
          className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
            💰
          </div>
          <div className="font-bold text-lg text-gray-800 mb-2">دریافت شده</div>
          <div className="text-sm text-gray-600">پول دریافت کرده‌اید</div>
        </button>
      </div>
    </div>
  );
});

// Step 2: Payment Type Selection
const PaymentTypeStep = memo<{
  onSelect: (type: "cash" | "check" | "transfer") => void;
  onBack: () => void;
}>(({ onSelect, onBack }) => {
  return (
    <div className="text-center space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">روش پرداخت</h3>
        <p className="text-gray-600">نحوه انجام تراکنش را مشخص کنید</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <button
          onClick={() => onSelect("cash")}
          className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            💵
          </div>
          <div className="font-bold text-lg text-gray-800 mb-1">نقد</div>
          <div className="text-sm text-gray-600">پرداخت نقدی</div>
        </button>
        <button
          onClick={() => onSelect("check")}
          className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            🏦
          </div>
          <div className="font-bold text-lg text-gray-800 mb-1">چک</div>
          <div className="text-sm text-gray-600">چک بانکی</div>
        </button>
        <button
          onClick={() => onSelect("transfer")}
          className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg bg-white"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            🔄
          </div>
          <div className="font-bold text-lg text-gray-800 mb-1">انتقال</div>
          <div className="text-sm text-gray-600">انتقال بانکی</div>
        </button>
      </div>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium"
      >
        ← برگشت
      </button>
    </div>
  );
});

// Step 3: Payment Detail Form
const PaymentDetailStep = memo<{
  paymentType: string;
  transactionType: string;
  accounts: Account[];
  onSubmit: (data: PaymentDetail) => void;
  onBack: () => void;
  loading: boolean;
}>(({ paymentType, transactionType, accounts, onSubmit, onBack, loading }) => {
  const [formData, setFormData] = useState<PaymentDetail>({});

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleInputChange = useCallback((key: string, value: unknown) => {
    setFormData((prev: PaymentDetail) => ({ ...prev, [key]: value }));
  }, []);

  const paymentTypeTitle = useMemo(() => {
    const titles = {
      cash: "نقدی",
      check: "چک",
      transfer: "انتقال بانکی",
    };
    return titles[paymentType as keyof typeof titles] || paymentType;
  }, [paymentType]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          جزئیات پرداخت {paymentTypeTitle}
        </h3>
        <p className="text-gray-600">اطلاعات مربوط به پرداخت را وارد کنید</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {paymentType === "cash" && (
            <CashForm
              formData={formData}
              accounts={accounts}
              onChange={handleInputChange}
            />
          )}
          {paymentType === "check" && (
            <CheckForm
              formData={formData}
              transactionType={transactionType}
              accounts={accounts}
              onChange={handleInputChange}
            />
          )}
          {paymentType === "transfer" && (
            <TransferForm
              formData={formData}
              accounts={accounts}
              onChange={handleInputChange}
            />
          )}

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              ← برگشت
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 min-w-[120px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ساخت...
                </>
              ) : (
                <>بعدی →</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Step 4: Transaction Detail Form
const TransactionDetailStep = memo<{
  accounts: Account[];
  onSubmit: (data: TransactionData) => void;
  onBack: () => void;
  loading: boolean;
}>(({ accounts, onSubmit, onBack, loading }) => {
  const [formData, setFormData] = useState({
    sourceAccount: "",
    destinationAccount: "",
    amount: 0,
    date: "",
    description: "",
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleInputChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          اطلاعات نهایی تراکنش
        </h3>
        <p className="text-gray-600">جزئیات کامل تراکنش را وارد کنید</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                حساب منبع *
              </label>
              <select
                value={formData.sourceAccount}
                onChange={(e) =>
                  handleInputChange("sourceAccount", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">حساب منبع را انتخاب کنید</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                حساب مقصد *
              </label>
              <select
                value={formData.destinationAccount}
                onChange={(e) =>
                  handleInputChange("destinationAccount", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">حساب مقصد را انتخاب کنید</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                مقدار (ریال) *
              </label>
              <FormattedNumberInput
                value={formData.amount}
                onChange={(value) => handleInputChange("amount", value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="مبلغ را وارد کنید"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                تاریخ *
              </label>
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300">
                <FaRegCalendarAlt className="text-gray-400" />
                <DatePicker
                  onChange={(date: DateObject | DateObject[] | null) => {
                    if (date && typeof date === "object" && "toDate" in date) {
                      handleInputChange("date", date.toDate().toISOString());
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              توضیحات *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={4}
              placeholder="توضیحات تراکنش را وارد کنید"
              required
            />
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              ← برگشت
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 min-w-[160px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ایجاد...
                </>
              ) : (
                <>✓ ایجاد تراکنش</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Cash Form Component
const CashForm = memo<{
  formData: PaymentDetail;
  accounts: Account[];
  onChange: (key: string, value: unknown) => void;
}>(({ formData, accounts, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            مبلغ (ریال) *
          </label>
          <FormattedNumberInput
            value={formData.amount || 0}
            onChange={(value) => onChange("amount", value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="مبلغ تراکنش"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            تاریخ تراکنش *
          </label>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={formData.transactionDate}
              onChange={(date: DateObject | DateObject[] | null) => {
                if (date && typeof date === "object" && "toDate" in date) {
                  onChange("transactionDate", date);
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            پرداخت کننده *
          </label>
          <select
            value={formData.paidBy || ""}
            onChange={(e) => onChange("paidBy", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب کنید...</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            دریافت کننده *
          </label>
          <select
            value={formData.payTo || ""}
            onChange={(e) => onChange("payTo", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب کنید...</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            شماره سند
          </label>
          <input
            type="text"
            value={formData.documentNumber || ""}
            onChange={(e) => onChange("documentNumber", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="شماره سند"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            تاریخ سند
          </label>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={formData.documentDate}
              onChange={(date: DateObject | DateObject[] | null) => {
                if (date && typeof date === "object" && "toDate" in date) {
                  onChange("documentDate", date);
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
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          توضیحات
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          rows={3}
          placeholder="توضیحات تراکنش"
        />
      </div>
    </div>
  );
});

// Check Form Component
const CheckForm = memo<{
  formData: PaymentDetail;
  transactionType: string;
  accounts: Account[];
  onChange: (key: string, value: unknown) => void;
}>(({ formData, transactionType, onChange }) => {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [groupDetailAccounts, setGroupDetailAccounts] = useState<
    GroupDetailAccount[]
  >([]);

  // Fetch banks for selection
  const fetchBanks = useCallback(async () => {
    setLoadingBanks(true);
    try {
      const response = await fetch("/api/transactions/bank");
      if (response.ok) {
        const data = await response.json();
        setBanks(data.banks || data || []);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  }, []);

  const fetchGroupDetailAccounts = async () => {
    try {
      const response = await fetch("/api/accounts/groupDetailAccount");
      if (response.ok) {
        const data = await response.json();
        setGroupDetailAccounts(data.groupDetailAccounts || []);
      }
    } catch (error) {
      console.error("Error fetching group detail accounts:", error);
    }
  };

  // Fetch banks and group detail accounts on component mount
  useEffect(() => {
    fetchBanks();
    fetchGroupDetailAccounts();
  }, [fetchBanks]);

  // Set transaction type automatically
  useEffect(() => {
    if (transactionType && !formData.type) {
      onChange("type", transactionType);
    }
  }, [transactionType, formData.type, onChange]);

  // Set default status for income transactions
  useEffect(() => {
    if (transactionType === "income" && !formData.status) {
      onChange("status", "nazeSandogh");
    }
  }, [transactionType, formData.status, onChange]);

  return (
    <div className="space-y-6">
      {/* Check Number and Serial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            شماره چک *
          </label>
          <input
            type="number"
            value={formData.checkNumber || ""}
            onChange={(e) => onChange("checkNumber", Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="شماره چک"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            شماره سری
          </label>
          <input
            type="number"
            value={formData.seryNumber || ""}
            onChange={(e) => onChange("seryNumber", Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="شماره سری"
          />
        </div>
      </div>

      {/* Bank Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            بانک *
          </label>
          <select
            value={formData.selectedFromBank || ""}
            onChange={(e) => {
              const selectedBank = banks.find(
                (bank) => bank._id === e.target.value
              );
              if (selectedBank) {
                onChange("fromBank", [
                  {
                    shobe: selectedBank.branch || "",
                    name: selectedBank.name,
                    accountNumber: selectedBank.accountNumber || "",
                  },
                ]);
                onChange("toBank", selectedBank._id);
                onChange("selectedFromBank", e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب بانک از چک‌های موجود</option>
            {loadingBanks ? (
              <option disabled>در حال بارگذاری...</option>
            ) : (
              banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name} {bank.branch && `- ${bank.branch}`}{" "}
                  {bank.accountNumber && `(${bank.accountNumber})`}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Amount and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            مبلغ (ریال) *
          </label>
          <FormattedNumberInput
            value={formData.amount || 0}
            onChange={(value) => onChange("amount", value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="مبلغ چک"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            تاریخ سررسید *
          </label>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              onChange={(date: DateObject | DateObject[] | null) => {
                if (date && typeof date === "object" && "toDate" in date) {
                  onChange("dueDate", date.toDate());
                }
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full bg-transparent focus:outline-none"
              calendarPosition="bottom-right"
              placeholder="انتخاب تاریخ سررسید"
            />
          </div>
        </div>
      </div>

      {/* Payer and Payee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            پرداخت کننده *
          </label>
          <select
            value={formData.paidBy || ""}
            onChange={(e) => onChange("paidBy", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب حساب پرداخت کننده</option>
            {(() => {
              const targetFlag = transactionType === "income" ? "CUST" : "SAND";
              const targetGroup = groupDetailAccounts.find(
                (group) => group.flag === targetFlag
              );
              return (
                targetGroup?.detailedAccounts?.map((account) => (
                  <option  key={account._id} value={account._id}>
                    {account.name} ({account.code})
                  </option>
                )) || []
              );
            })()}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            دریافت کننده *
          </label>
          <select
            value={formData.payTo || ""}
            onChange={(e) => onChange("payTo", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب حساب دریافت کننده</option>
            {(() => {
              const targetFlag = transactionType === "income" ? "SAND" : "CUST";
              const targetGroup = groupDetailAccounts.find(
                (group) => group.flag === targetFlag
              );
              return (
                targetGroup?.detailedAccounts?.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} ({account.code})
                  </option>
                )) || []
              );
            })()}
          </select>
        </div>
      </div>

      {/* Other Side Bank Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">
          {transactionType === "outcome"
            ? "اطلاعات بانک مقصد"
            : "اطلاعات بانک مبدا"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              نام بانک *
            </label>
            <input
              type="text"
              value={formData.otherSideBank?.[0]?.name || ""}
              onChange={(e) => {
                const otherSideBank = formData.otherSideBank || [
                  { name: "", owner: "", accountNumber: "" },
                ];
                otherSideBank[0] = {
                  ...otherSideBank[0],
                  name: e.target.value,
                };
                onChange("otherSideBank", otherSideBank);
              }}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder={
                transactionType === "outcome"
                  ? "نام بانک مقصد"
                  : "نام بانک مبدا"
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              صاحب حساب *
            </label>
            <input
              type="text"
              value={formData.otherSideBank?.[0]?.owner || ""}
              onChange={(e) => {
                const otherSideBank = formData.otherSideBank || [
                  { name: "", owner: "", accountNumber: "" },
                ];
                otherSideBank[0] = {
                  ...otherSideBank[0],
                  owner: e.target.value,
                };
                onChange("otherSideBank", otherSideBank);
              }}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="نام صاحب حساب"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              شماره حساب *
            </label>
            <input
              type="number"
              value={formData.otherSideBank?.[0]?.accountNumber || ""}
              onChange={(e) => {
                const otherSideBank = formData.otherSideBank || [
                  { name: "", owner: "", accountNumber: "" },
                ];
                otherSideBank[0] = {
                  ...otherSideBank[0],
                  accountNumber: e.target.value,
                };
                onChange("otherSideBank", otherSideBank);
              }}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="شماره حساب"
              required
            />
          </div>
        </div>
      </div>

      {/* Sender and Receiver Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            نام صادرکننده *
          </label>
          <input
            type="text"
            value={formData.senderName || ""}
            onChange={(e) => onChange("senderName", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="نام صادرکننده چک"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            نام دریافت کننده *
          </label>
          <input
            type="text"
            value={formData.receiverName || ""}
            onChange={(e) => onChange("receiverName", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="نام دریافت کننده چک"
            required
          />
        </div>
      </div>

      {/* Check Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            وضعیت چک *
          </label>
          <select
            value={
              formData.status ||
              (transactionType === "income" ? "nazeSandogh" : "")
            }
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="nazeSandogh">نزد صندوق</option>
            <option value="darJaryanVosool">در جریان وصول</option>
            <option value="vosoolShode">وصول شده</option>
            <option value="bargashti">برگشتی</option>
            <option value="enteghalDadeShode">انتقال داده شده</option>
          </select>
        </div>
        {formData.status === "nazeSandogh" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              وضعیت در صندوق
            </label>
            <select
              value={formData.inboxStatus || "darJaryanVosool"}
              onChange={(e) => onChange("inboxStatus", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="darJaryanVosool">در جریان وصول</option>
              <option value="vosoolShode">وصول شده</option>
              <option value="bargashti">برگشتی</option>
              <option value="enteghalDadeShode">انتقال داده شده</option>
            </select>
          </div>
        )}
      </div>

      {/* Description and Document Number */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          توضیحات
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          rows={3}
          placeholder="توضیحات چک"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          شماره سند
        </label>
        <input
          type="text"
          value={formData.documentNumber || ""}
          onChange={(e) => onChange("documentNumber", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="شماره سند (اختیاری)"
        />
      </div>
    </div>
  );
});

// Transfer Form Component
const TransferForm = memo<{
  formData: PaymentDetail;
  onChange: (key: string, value: unknown) => void;
  accounts: Account[];
}>(({ formData, onChange, accounts }) => {
  const [banks, setBanks] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/transactions/bank");
      if (response.ok) {
        const data = await response.json();
        setBanks(data.banks || data);
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در دریافت لیست بانکها");
    }
  };

  const selectedBank = banks.find((bank) => bank._id === formData.ourBank);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            نوع تراکنش *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                checked={formData.type === "income"}
                onChange={(e) => onChange("type", e.target.value)}
                className="ml-2 text-blue-600"
              />
              دریافتی (واریز به حساب)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="outcome"
                checked={formData.type === "outcome"}
                onChange={(e) => onChange("type", e.target.value)}
                className="ml-2 text-blue-600"
              />
              پرداختی (برداشت از حساب)
            </label>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {formData.type === "income" ? "به حساب *" : "از حساب *"}
          </label>
          <select
            value={formData.ourBank || ""}
            onChange={(e) => onChange("ourBank", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        {/* Transfer Reference */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            شماره پیگیری *
          </label>
          <input
            type="number"
            value={formData.transferReference || ""}
            onChange={(e) => onChange("transferReference", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="شماره پیگیری تراکنش"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            مقدار انتقال *
          </label>
          <FormattedNumberInput
            value={Number(formData.amount) || 0}
            onChange={(value) => onChange("amount", value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="مقدار انتقال به ریال"
          />
        </div>

        {/* Transfer Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            تاریخ انتقال *
          </label>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={formData.transferDate}
              onChange={(date: DateObject | DateObject[] | null) => {
                if (date && typeof date === "object" && "toDate" in date) {
                  onChange("transferDate", date);
                } else if (
                  Array.isArray(date) &&
                  date[0] &&
                  "toDate" in date[0]
                ) {
                  onChange("transferDate", date[0]);
                } else {
                  onChange("transferDate", null);
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

        {/* Paid By */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            پرداخت کننده *
          </label>
          <select
            value={formData.paidBy || ""}
            onChange={(e) => onChange("paidBy", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب حساب پرداخت کننده</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pay To */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            دریافت کننده *
          </label>
          <select
            value={formData.payTo || ""}
            onChange={(e) => onChange("payTo", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">انتخاب حساب دریافت کننده</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Bank Info Card */}
      {selectedBank && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">
            اطلاعات حساب انتخاب شده:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">نام بانک:</span>
              <span className="text-gray-800">{selectedBank.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">شعبه:</span>
              <span className="text-gray-800">{selectedBank.branchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">شماره حساب:</span>
              <span className="text-gray-800">
                {selectedBank.accountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">نام صاحب حساب:</span>
              <span className="text-gray-800">{selectedBank.ownerName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TransactionTypeStep.displayName = "TransactionTypeStep";
PaymentTypeStep.displayName = "PaymentTypeStep";
PaymentDetailStep.displayName = "PaymentDetailStep";
TransactionDetailStep.displayName = "TransactionDetailStep";
CashForm.displayName = "CashForm";
CheckForm.displayName = "CheckForm";
TransferForm.displayName = "TransferForm";

export default memo(TransactionWizard);
