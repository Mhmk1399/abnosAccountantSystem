"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  FieldOption,
  Glass,
  ProviderReportData,
  SideMaterial,
} from "@/types/type";

const AddInventory: React.FC = () => {
  // State for storing fetched data
  const [providers, setProviders] = useState<FieldOption[]>([]);
  const [glasses, setGlasses] = useState<FieldOption[]>([]);
  const [sideMaterials, setSideMaterials] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialType, setMaterialType] = useState<"glass" | "sideMaterial">(
    "glass"
  );
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    buyPrice: "",
    count: "",
    enterDate: "",
    provider: "",
    glass: "",
    sideMaterial: "",
    width: "", // Added width field
    height: "", // Added height field
  });

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch providers, glasses, and side materials on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data from the new endpoint
        const response = await fetch("/api/addInventoryAllData");
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();

        // Process providers
        const providersOptions = data.providers.providers.map(
          (provider: ProviderReportData) => ({
            label: provider.name,
            value: provider._id,
          })
        );
        setProviders(providersOptions);

        // Process glasses
        const glassesOptions = data.glasses.map((glass: Glass) => ({
          label: `${glass.name} (${glass.width}×${glass.height}×${glass.thickness})`,
          value: glass._id,
        }));
        setGlasses(glassesOptions);

        // Process side materials
        const sideMaterialsOptions = data.sideMaterials.map(
          (material: SideMaterial) => ({
            label: `${material.name} (${material.code})`,
            value: material._id,
          })
        );
        setSideMaterials(sideMaterialsOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle date change
  const handleDateChange = (date: DateObject | null) => {
    setSelectedDate(date);
    // Convert to ISO string for backend
    const dateObj = date?.unix ? new Date(date.unix * 1000) : new Date();
    setFormValues((prev) => ({
      ...prev,
      enterDate: dateObj.toISOString(),
    }));

    // Clear error for date field
    if (errors.enterDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.enterDate;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formValues.name) {
      newErrors.name = "نام محصول الزامی است";
    } else if (formValues.name.length < 2) {
      newErrors.name = "حداقل ۲ کاراکتر نیاز است";
    }

    // Validate buyPrice
    if (!formValues.buyPrice) {
      newErrors.buyPrice = "قیمت خرید الزامی است";
    } else if (Number(formValues.buyPrice) < 0) {
      newErrors.buyPrice = "قیمت خرید نمی‌تواند منفی باشد";
    }

    // Validate count
    if (!formValues.count) {
      newErrors.count = "تعداد الزامی است";
    } else if (Number(formValues.count) < 1) {
      newErrors.count = "تعداد باید حداقل ۱ باشد";
    }

    // Validate enterDate
    if (!formValues.enterDate) {
      newErrors.enterDate = "تاریخ ورود الزامی است";
    }

    // Validate provider
    if (!formValues.provider) {
      newErrors.provider = "انتخاب تأمین کننده الزامی است";
    }

    // Validate material based on type
    if (materialType === "glass" && !formValues.glass) {
      newErrors.glass = "انتخاب شیشه الزامی است";
    }

    if (materialType === "sideMaterial" && !formValues.sideMaterial) {
      newErrors.sideMaterial = "انتخاب متریال جانبی الزامی است";
    }

    // Validate width and height for glass type
    if (materialType === "glass") {
      if (!formValues.width) {
        newErrors.width = "عرض الزامی است";
      } else if (Number(formValues.width) <= 0) {
        newErrors.width = "عرض باید بزرگتر از صفر باشد";
      }

      if (!formValues.height) {
        newErrors.height = "ارتفاع الزامی است";
      } else if (Number(formValues.height) <= 0) {
        newErrors.height = "ارتفاع باید بزرگتر از صفر باشد";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a payload that only includes the relevant fields based on material type
      const payload: {
        name: string;
        buyPrice: string | number;
        count: number;
        enterDate: string;
        provider: string;
        glass?: string;
        sideMaterial?: string;
        width?: number;
        height?: number;
      } = {
        name: formValues.name,
        buyPrice: Number(formValues.buyPrice),
        count: Number(formValues.count),
        enterDate: formValues.enterDate,
        provider: formValues.provider,
      };

      // Only include the relevant material field based on the selected type
      if (materialType === "glass") {
        payload.glass = formValues.glass;
        payload.width = Number(formValues.width);
        payload.height = Number(formValues.height);
      } else {
        payload.sideMaterial = formValues.sideMaterial;
      }

      console.log("Sending payload:", payload);

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت موجودی");
      }

      const data = await response.json();
      console.log("موجودی با موفقیت اضافه شد", data);
      toast.success("موجودی با موفقیت اضافه شد");

      // Reset form after successful submission
      setFormValues({
        name: "",
        buyPrice: "",
        count: "",
        enterDate: "",
        provider: "",
        glass: "",
        sideMaterial: "",
        width: "",
        height: "",
      });
      setSelectedDate(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "خطا در ثبت موجودی");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormValues({
      name: "",
      buyPrice: "",
      count: "",
      enterDate: "",
      provider: "",
      glass: "",
      sideMaterial: "",
      width: "",
      height: "",
    });
    setSelectedDate(null);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        افزودن موجودی جدید
      </h2>

      {/* Material Type Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            type="button"
            onClick={() => setMaterialType("glass")}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              materialType === "glass"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            شیشه
          </button>
          <button
            type="button"
            onClick={() => setMaterialType("sideMaterial")}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              materialType === "sideMaterial"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            متریال جانبی
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-6 border-r-4 border-blue-500">
        <p className="text-blue-700">
          در حال افزودن {materialType === "glass" ? "شیشه" : "متریال جانبی"} به
          موجودی
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            نام راننده
          </label>
          <input
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            placeholder="نام محصول را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Code Field */}

        {/* Buy Price Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            قیمت خرید
          </label>
          <input
            type="number"
            name="buyPrice"
            value={formValues.buyPrice}
            onChange={handleInputChange}
            placeholder="قیمت خرید را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.buyPrice && (
            <p className="text-xs text-red-600 mt-1">{errors.buyPrice}</p>
          )}
        </div>

        {/* count Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تعداد
          </label>
          <input
            type="number"
            name="count"
            value={formValues.count}
            onChange={handleInputChange}
            placeholder="تعداد را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.count && (
            <p className="text-xs text-red-600 mt-1">{errors.count}</p>
          )}
        </div>

        {/* Enter Date Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ ورود
          </label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 text-black placeholder:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              width: "100%",
              height: "42px",
              fontSize: "14px",
              color: "black",
              padding: "8px 12px",
            }}
          />
          {errors.enterDate && (
            <p className="text-xs text-red-600 mt-1">{errors.enterDate}</p>
          )}
        </div>

        {/* Provider Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تأمین کننده
          </label>
          <select
            name="provider"
            value={formValues.provider}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">تأمین کننده را انتخاب کنید</option>
            {providers.map((provider, index) => (
              <option key={index} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="text-xs text-red-600 mt-1">{errors.provider}</p>
          )}
        </div>

        {/* Conditional Material Field */}
        {materialType === "glass" ? (
          <>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                شیشه
              </label>
              <select
                name="glass"
                value={formValues.glass}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">شیشه را انتخاب کنید</option>
                {glasses.map((glass, index) => (
                  <option key={index} value={glass.value}>
                    {glass.label}
                  </option>
                ))}
              </select>
              {errors.glass && (
                <p className="text-xs text-red-600 mt-1">{errors.glass}</p>
              )}
            </div>

            {/* Width Field - Only shown for glass type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                عرض (سانتی‌متر)
              </label>
              <input
                type="number"
                name="width"
                value={formValues.width}
                onChange={handleInputChange}
                placeholder="عرض را وارد کنید"
                className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.width && (
                <p className="text-xs text-red-600 mt-1">{errors.width}</p>
              )}
            </div>

            {/* Height Field - Only shown for glass type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                ارتفاع (سانتی‌متر)
              </label>
              <input
                type="number"
                name="height"
                value={formValues.height}
                onChange={handleInputChange}
                placeholder="ارتفاع را وارد کنید"
                className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.height && (
                <p className="text-xs text-red-600 mt-1">{errors.height}</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              متریال جانبی
            </label>
            <select
              name="sideMaterial"
              value={formValues.sideMaterial}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">متریال جانبی را انتخاب کنید</option>
              {sideMaterials.map((material, index) => (
                <option key={index} value={material.value}>
                  {material.label}
                </option>
              ))}
            </select>
            {errors.sideMaterial && (
              <p className="text-xs text-red-600 mt-1">{errors.sideMaterial}</p>
            )}
          </div>
        )}

        {/* Form Buttons */}
        <div className="flex justify-start space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "در حال ثبت..." : "ثبت موجودی"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 text-rose-500 hover:text-rose-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
