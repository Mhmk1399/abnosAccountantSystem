"use client";

import { useRouter } from "next/navigation";
import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";

const PermissionForm = () => {
  const router = useRouter();

  const permissionFormConfig: FormConfig = {
    title: "فرم ثبت مرخصی جدید",
    description: "لطفاً اطلاعات مرخصی جدید را وارد کنید",
    endpoint: "/api/permissions",
    method: "POST",
    submitButtonText: "ثبت مرخصی",
    successMessage: "مرخصی با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت مرخصی",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    onSuccess: () => {
      router.push("/permission");
    },
    fields: [
      {
        name: "staff",
        label: "کارمند",
        type: "select",
        required: true,
        endpoint: "/api/staff",
        valueField: "_id",
        labelField: "name",
        responseHandler: (response) => response.staff || [],
        placeholder: "کارمند را انتخاب کنید",
      },
      {
        name: "date",
        label: "تاریخ",
        type: "date",
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

  return <DynamicForm config={permissionFormConfig} />;
};

export default PermissionForm;
