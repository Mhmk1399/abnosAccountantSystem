"use client";
import React from "react";
import DynamicForm from "../global/DynamicForm";
import toast from "react-hot-toast";
import { FormField } from "@/types/form";

// Define form fields outside the component
const providerFormFields: FormField[] = [
  {
    name: "name",
    label: "نام تامین کننده",
    type: "text",
    placeholder: "نام تامین کننده را وارد کنید",
    required: true,
    validation: {
      minLength: 2
    },
  },
  {
    name: "info",
    label: "اطلاعات تکمیلی",
    type: "textarea",
    placeholder: "اطلاعات تکمیلی تامین کننده را وارد کنید",
    required: true,
  },
];

// Define the component
const AddProvider: React.FC = () => {
  // API endpoint for provider creation
  const endpoint = "/api/providerApi";

  // Success and error handlers
  const onSuccess = (data: { message: string }): void => {
    console.log("تامین کننده با موفقیت اضافه شد", data);
    toast.success("تامین کننده با موفقیت اضافه شد");
  };

  const onError = (error: Error | Response | unknown): void => {
    console.log("خطا در ثبت تامین کننده", error);
    toast.error("خطا در ثبت تامین کننده");
  };

  return (
    <DynamicForm
      config={{
        title: "افزودن تامین کننده جدید",
        description: "لطفا اطلاعات تامین کننده جدید را وارد کنید",
        fields: providerFormFields,
        endpoint: endpoint,
        method: "POST",
        submitButtonText: "ثبت تامین کننده",
        onSuccess: onSuccess,
        onError: onError
      }}
    />
  );
};

export default AddProvider;
