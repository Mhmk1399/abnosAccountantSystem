"use client";
import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";
import { useState, useEffect } from "react";

export default function NewPermission() {
  const [staffs, setStaffs] = useState([]);

  const getStaffs = async () => {
    const response = await fetch("/api/staff");
    const data = await response.json();
    setStaffs(data.data || []);
    console.log(data.data);
  };
  useEffect(() => {
    getStaffs();
  }, []);
  const permissionFormConfig: FormConfig = {
    title: "فرم ثبت مرخصی جدید",
    description: "لطفاً اطلاعات مرخصی جدید را وارد کنید",
    endpoint: "/api/permissions",
    method: "POST",
    submitButtonText: "ثبت مرخصی",
    successMessage: "مرخصی با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت مرخصی",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    fields: [
      {
        name: "staff",
        label: "کارمند",
        type: "select",
        required: true,
        options: staffs.map(
          (staff: { _id: string; name: string }, index: number) => ({
            label: staff.name,
            value: staff._id,
            index: index,
          })
        ),
      },
      {
        name: "date",
        label: "تاریخ",
        type: "persian-date",
        required: true,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        required: true,
        placeholder: "توضیحات مرخصی را وارد کنید",
      },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <DynamicForm config={permissionFormConfig} />
    </div>
  );
}
