"use client";
import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";
import { useState, useEffect } from "react";

export default function NewRollcall() {
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
  const rollcallFormConfig: FormConfig = {
    title: "فرم ثبت حضور و غیاب جدید",
    description: "لطفاً اطلاعات حضور و غیاب را وارد کنید",
    endpoint: "/api/rollcall",
    method: "POST",
    submitButtonText: "ثبت حضور و غیاب",
    successMessage: "حضور و غیاب با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت حضور و غیاب",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    fields: [
      {
        name: "staff",
        label: "کارمند",
        type: "select",
        required: true,
        placeholder: "کارمند را انتخاب کنید",
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
        name: "status",
        label: "وضعیت",
        type: "select",
        required: true,
        options: [
          { value: "present", label: "حاضر" },
          { value: "absent", label: "غایب" },
          { value: "late", label: "تاخیر" },
        ],
      },
      {
        name: "entranceTime",
        label: "زمان ورود",
        type: "time",
        description: "در صورت حضور یا تاخیر وارد کنید",
      },
      {
        name: "exitTime",
        label: "زمان خروج",
        type: "time",
        description: "در صورت حضور یا تاخیر وارد کنید",
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات تکمیلی را وارد کنید",
      },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <DynamicForm config={rollcallFormConfig} />
    </div>
  );
}
