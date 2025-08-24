"use client";
import DynamicForm from "@/components/global/DynamicForm";
import { Staff } from "@/types/finalTypes";
import { FormConfig } from "@/types/form";
import { useState, useEffect } from "react";

export default function NewDeficit() {
  const [staffs, setStaffs] = useState([]);

  const getStaffs = async () => {
    const response = await fetch("/api/staff");
    const data = await response.json();
    setStaffs(data.data);
  };

  useEffect(() => {
    getStaffs();
  }, []);
  const deficitFormConfig: FormConfig = {
    title: "فرم ثبت کسری جدید",
    description: "لطفاً اطلاعات کسری جدید را وارد کنید",
    endpoint: "/api/deficits",
    method: "POST",
    submitButtonText: "ثبت کسری",
    successMessage: "کسری با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت کسری",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    fields: [
      {
        name: "staff",
        label: "کارمند",
        type: "select",
        required: true,
        options: staffs.map((staff: Staff) => ({
          value: staff._id,
          label: staff.name,
        })),
        placeholder: "کارمند را انتخاب کنید",
      },
      {
        name: "amount",
        label: "مبلغ (تومان)",
        type: "number",
        required: true,
        placeholder: "مبلغ کسری را وارد کنید",
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        required: true,
        placeholder: "توضیحات کسری را وارد کنید",
      },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <DynamicForm config={deficitFormConfig} />
    </div>
  );
}
