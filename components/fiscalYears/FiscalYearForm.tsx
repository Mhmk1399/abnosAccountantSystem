"use client";

import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";

interface FiscalYearFormProps {
  onSuccess?: () => void;
}

const FiscalYearForm = ({ onSuccess }: FiscalYearFormProps) => {
  const fiscalYearFormConfig: FormConfig = {
    title: "فرم ثبت سال مالی جدید",
    description: "لطفاً اطلاعات سال مالی جدید را وارد کنید",
    endpoint: "/api/fiscalYears",
    method: "POST",
    submitButtonText: "ثبت سال مالی",
    successMessage: "سال مالی با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت سال مالی",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    onSuccess: onSuccess,

    fields: [
      {
        name: "name",
        label: "نام سال مالی",
        type: "text",
        required: true,
        placeholder: "نام سال مالی را وارد کنید",
      },
      {
        name: "startDate",
        label: "تاریخ شروع",
        type: "persian-date",
        required: true,
      },
      {
        name: "taxRate",
        label: "نرخ مالیات (%)",
        type: "number",
        required: true,
      },
      {
        name: "endDate",
        label: "تاریخ پایان",
        type: "persian-date",
        required: true,
      },
      {
        name: "isActive",
        label: "فعال",
        type: "checkbox",
        description: "آیا این سال مالی فعال است؟",
      },
    ],
  };

  return <DynamicForm config={fiscalYearFormConfig} />;
};

export default FiscalYearForm;
