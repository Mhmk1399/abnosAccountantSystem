"use client";

import { useRouter } from "next/navigation";
import DynamicForm from "@/components/global/DynamicForm";
import { FormConfig } from "@/types/form";

const StaffForm = () => {
  const router = useRouter();

  const staffFormConfig: FormConfig = {
    title: "فرم ثبت کارمند جدید",
    description: "لطفاً اطلاعات کارمند جدید را وارد کنید",
    endpoint: "/api/staff",
    method: "POST",
    submitButtonText: "ثبت کارمند",
    successMessage: "کارمند با موفقیت ثبت شد",
    errorMessage: "خطا در ثبت کارمند",
    validationErrorMessage: "لطفاً فیلدهای الزامی را تکمیل کنید",
    onSuccess: () => {
      router.push("/staff");
    },
    fields: [
      {
        name: "title",
        label: "عنوان",
        type: "select",
        required: true,
        options: [
          { value: "خانم", label: "خانم" },
          { value: "آقاي", label: "آقای" },
        ],
      },
      {
        name: "name",
        label: "نام و نام خانوادگی",
        type: "text",
        required: true,
        placeholder: "نام و نام خانوادگی کارمند را وارد کنید",
      },
      {
        name: "fatherName",
        label: "نام پدر",
        type: "text",
        required: true,
        placeholder: "نام پدر را وارد کنید",
      },
      {
        name: "idNumber",
        label: "شماره شناسنامه",
        type: "text",
        required: true,
        placeholder: "شماره شناسنامه را وارد کنید",
      },
      {
        name: "idIssuePlace",
        label: "محل صدور شناسنامه",
        type: "text",
        required: true,
        placeholder: "محل صدور شناسنامه را وارد کنید",
      },
      {
        name: "birthPlace",
        label: "محل تولد",
        type: "text",
        required: true,
        placeholder: "محل تولد را وارد کنید",
      },
      {
        name: "birthDate",
        label: "تاریخ تولد",
        type: "date",
        required: true,
      },
      {
        name: "nationalId",
        label: "کد ملی",
        type: "text",
        required: true,
        placeholder: "کد ملی را وارد کنید",
        validation: {
          pattern: "^[0-9]{10}$",
          minLength: 10,
          maxLength: 10,
        },
        description: "کد ملی باید 10 رقم باشد",
      },
      {
        name: "personalNumber",
        label: "شماره پرسنلی",
        type: "text",
        placeholder: "شماره پرسنلی را وارد کنید",
      },
      {
        name: "insuranceNumber",
        label: "شماره بیمه",
        type: "text",
        required: true,
        placeholder: "شماره بیمه را وارد کنید",
      },
      {
        name: "address",
        label: "آدرس",
        type: "textarea",
        required: true,
        placeholder: "آدرس کامل را وارد کنید",
      },
      {
        name: "postalCode",
        label: "کد پستی",
        type: "text",
        required: true,
        placeholder: "کد پستی را وارد کنید",
        validation: {
          pattern: "^[0-9]{10}$",
          minLength: 10,
          maxLength: 10,
        },
        description: "کد پستی باید 10 رقم باشد",
      },
      {
        name: "homePhone",
        label: "تلفن ثابت",
        type: "tel",
        placeholder: "تلفن ثابت را وارد کنید",
      },
      {
        name: "mobilePhone",
        label: "تلفن همراه",
        type: "tel",
        required: true,
        placeholder: "تلفن همراه را وارد کنید",
        validation: {
          pattern: "^09[0-9]{9}$",
          minLength: 11,
          maxLength: 11,
        },
        description: "شماره موبایل باید با 09 شروع شود و 11 رقم باشد",
      },
      {
        name: "position",
        label: "سمت",
        type: "text",
        required: true,
        placeholder: "سمت کارمند را وارد کنید",
      },
      {
        name: "workplace",
        label: "محل کار",
        type: "text",
        required: true,
        placeholder: "محل کار را وارد کنید",
      },
      {
        name: "educationLevel",
        label: "سطح تحصیلات",
        type: "select",
        required: true,
        options: [
          { value: "زیر دیپلم", label: "زیر دیپلم" },
          { value: "دیپلم", label: "دیپلم" },
          { value: "کاردانی", label: "کاردانی" },
          { value: "کارشناسی", label: "کارشناسی" },
          { value: "کارشناسی ارشد", label: "کارشناسی ارشد" },
          { value: "دکتری", label: "دکتری" },
        ],
      },
      {
        name: "fieldOfStudy",
        label: "رشته تحصیلی",
        type: "text",
        required: true,
        placeholder: "رشته تحصیلی را وارد کنید",
      },
      {
        name: "degreeYear",
        label: "سال اخذ مدرک",
        type: "number",
        placeholder: "سال اخذ مدرک را وارد کنید",
      },
      {
        name: "workExperience",
        label: "سابقه کار",
        type: "textarea",
        placeholder: "سابقه کار را وارد کنید",
      },
      {
        name: "hireDate",
        label: "تاریخ استخدام",
        type: "date",
        required: true,
      },
      {
        name: "probationStart",
        label: "تاریخ شروع دوره آزمایشی",
        type: "date",
      },
      {
        name: "confirmedStartDate",
        label: "تاریخ شروع قطعی",
        type: "date",
      },
      {
        name: "trainingResult",
        label: "نتیجه دوره آموزشی",
        type: "textarea",
        placeholder: "نتیجه دوره آموزشی را وارد کنید",
      },
      {
        name: "baseSalary",
        label: "حقوق پایه (تومان)",
        type: "number",
        required: true,
        placeholder: "حقوق پایه را وارد کنید",
      },
      {
        name: "benefits",
        label: "مزایا",
        type: "checkbox-group",
        options: [
          { value: "بیمه تکمیلی", label: "بیمه تکمیلی" },
          { value: "حق مسکن", label: "حق مسکن" },
          { value: "حق ایاب و ذهاب", label: "حق ایاب و ذهاب" },
          { value: "بن خرید", label: "بن خرید" },
          { value: "حق غذا", label: "حق غذا" },
        ],
      },
      {
        name: "coefficients.regional",
        label: "ضریب منطقه‌ای",
        type: "number",
        placeholder: "ضریب منطقه‌ای را وارد کنید",
      },
      {
        name: "coefficients.feature",
        label: "ضریب ویژگی",
        type: "number",
        placeholder: "ضریب ویژگی را وارد کنید",
      },
      {
        name: "coefficients.combination",
        label: "ضریب ترکیب",
        type: "number",
        placeholder: "ضریب ترکیب را وارد کنید",
      },
      {
        name: "coefficients.specialty",
        label: "ضریب تخصص",
        type: "number",
        placeholder: "ضریب تخصص را وارد کنید",
      },
      {
        name: "coefficients.supervision",
        label: "ضریب سرپرستی",
        type: "number",
        placeholder: "ضریب سرپرستی را وارد کنید",
      },
      {
        name: "coefficients.computer",
        label: "ضریب کامپیوتر",
        type: "number",
        placeholder: "ضریب کامپیوتر را وارد کنید",
      },
      {
        name: "coefficients.retention",
        label: "ضریب ماندگاری",
        type: "number",
        placeholder: "ضریب ماندگاری را وارد کنید",
      },
      {
        name: "referrer.name",
        label: "نام معرف",
        type: "text",
        placeholder: "نام معرف را وارد کنید",
      },
      {
        name: "referrer.relationship",
        label: "نسبت معرف",
        type: "text",
        placeholder: "نسبت معرف را وارد کنید",
      },
      {
        name: "referrer.phone",
        label: "تلفن معرف",
        type: "tel",
        placeholder: "تلفن معرف را وارد کنید",
      },
      {
        name: "emergencyContact.name",
        label: "نام تماس اضطراری",
        type: "text",
        placeholder: "نام تماس اضطراری را وارد کنید",
      },
      {
        name: "emergencyContact.relationship",
        label: "نسبت تماس اضطراری",
        type: "text",
        placeholder: "نسبت تماس اضطراری را وارد کنید",
      },
      {
        name: "emergencyContact.phone",
        label: "تلفن تماس اضطراری",
        type: "tel",
        placeholder: "تلفن تماس اضطراری را وارد کنید",
      },
      {
        name: "bloodType",
        label: "گروه خونی",
        type: "select",
        options: [
          { value: "A+", label: "A+" },
          { value: "A-", label: "A-" },
          { value: "B+", label: "B+" },
          { value: "B-", label: "B-" },
          { value: "AB+", label: "AB+" },
          { value: "AB-", label: "AB-" },
          { value: "O+", label: "O+" },
          { value: "O-", label: "O-" },
        ],
      },
      {
        name: "eyeColor",
        label: "رنگ چشم",
        type: "text",
        placeholder: "رنگ چشم را وارد کنید",
      },
      {
        name: "height",
        label: "قد (سانتی‌متر)",
        type: "number",
        placeholder: "قد را وارد کنید",
      },
      {
        name: "hairColor",
        label: "رنگ مو",
        type: "text",
        placeholder: "رنگ مو را وارد کنید",
      },
      {
        name: "additionalInfo",
        label: "اطلاعات تکمیلی",
        type: "textarea",
        placeholder: "اطلاعات تکمیلی را وارد کنید",
      },
      {
        name: "isActive",
        label: "وضعیت فعالیت",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "فعال" },
          { value: "false", label: "غیرفعال" },
        ],
      },
    ],
  };

  return <DynamicForm config={staffFormConfig} />;
};

export default StaffForm;
