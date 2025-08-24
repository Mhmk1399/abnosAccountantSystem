"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { DateObject } from "react-multi-date-picker";
import {
  Glass,
  InventoryEditFormProps,
  ProviderReportData,
  SideMaterial,
} from "@/types/type";

const InventoryEditForm: React.FC<InventoryEditFormProps> = ({
  inventoryId,
  onSuccess,
  onCancel,
  initialValues,
}) => {
  // Individual state for each form field
  const [name, setName] = useState(initialValues?.name || "");
  const [code, setCode] = useState(initialValues?.code || "");
  const [buyPrice, setBuyPrice] = useState(initialValues?.buyPrice || "");
  const [count, setCount] = useState(initialValues?.count || ""); // Added count field
  const [provider, setProvider] = useState(initialValues?.provider || "");
  const [materialType, setMaterialType] = useState(
    initialValues?.materialType || ""
  );
  const [glass, setGlass] = useState(initialValues?.glass || "");
  const [sideMaterial, setSideMaterial] = useState(
    initialValues?.sideMaterial || ""
  );
  const [width, setWidth] = useState(initialValues?.width || ""); // Added width field
  const [height, setHeight] = useState(initialValues?.height || ""); // Added height field
  const [enterDate, setEnterDate] = useState<DateObject | null>(null);

  // Options for dropdowns
  const [providers, setProviders] = useState<
    { label: string; value: string }[]
  >([]);
  const [glasses, setGlasses] = useState<{ label: string; value: string }[]>(
    []
  );
  const [sideMaterials, setSideMaterials] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch providers, glasses, and side materials for form fields
  const fetchFormOptions = async () => {
    try {
      // Fetch providers
      const providersResponse = await fetch("/api/providerApi");
      const providersData = await providersResponse.json();
      const providersOptions = providersData.map(
        (provider: ProviderReportData) => ({
          label: provider.name,
          value: provider._id,
        })
      );
      setProviders(providersOptions);

      // Fetch glasses
      const glassesResponse = await fetch("/api/glass");
      const glassesData = await glassesResponse.json();
      const glassesOptions = glassesData.map((glass: Glass) => ({
        label: `${glass.name}`,
        value: glass._id,
      }));
      setGlasses(glassesOptions);

      // Fetch side materials
      const sideMaterialsResponse = await fetch("/api/sideMaterial");
      const sideMaterialsData = await sideMaterialsResponse.json();
      const sideMaterialsOptions = sideMaterialsData.map(
        (material: SideMaterial) => ({
          label: `${material.name} (${material.code})`,
          value: material._id,
        })
      );
      setSideMaterials(sideMaterialsOptions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching form options:", error);
      toast.error("خطا در دریافت اطلاعات فرم");
      setLoading(false);
    }
  };

  // Initialize form with initial values
  // Add a ref to track if the component is mounted

  // First effect: Handle initialValues changes with deep comparison
  useEffect(() => {
    fetchFormOptions();
    // Only update state if initialValues actually changed in a meaningful way
    if (initialValues) {
      // Use JSON.stringify for deep comparison
      const currentValues = {
        name,
        code,
        buyPrice,
        count,
        provider,
        materialType,
        glass,
        sideMaterial,
        width,
        height,
        // Don't include enterDate in comparison as it's a complex object
      };

      const newValues = {
        name: initialValues.name || "",
        code: initialValues.code || "",
        buyPrice: initialValues.buyPrice || "",
        count: initialValues.count || "",
        provider: initialValues.provider || "",
        materialType: initialValues.materialType || "",
        glass: initialValues.glass || "",
        sideMaterial: initialValues.sideMaterial || "",
        width: initialValues.width || "",
        height: initialValues.height || "",
      };

      // Only update if values actually changed
      if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
        setName(newValues.name);
        setCode(newValues.code);
        setBuyPrice(newValues.buyPrice);
        setCount(newValues.count);
        setProvider(newValues.provider);
        setMaterialType(newValues.materialType);
        setGlass(newValues.glass);
        setSideMaterial(newValues.sideMaterial);
        setWidth(newValues.width);
        setHeight(newValues.height);

        // Handle date separately
        if (initialValues.enterDate) {
          try {
            const dateObj = new DateObject({
              date: new Date(initialValues.enterDate),
              calendar: persian,
              locale: persian_fa,
            });
            setEnterDate(dateObj);
          } catch (error) {
            console.error("Error parsing date:", error);
          }
        }
      }
    }
  }, [initialValues]);

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name) {
      newErrors.name = "نام الزامی است";
    } else if (name.length < 2) {
      newErrors.name = "حداقل ۲ کاراکتر نیاز است";
    }

    // Validate code

    // Validate buyPrice
    if (!buyPrice) {
      newErrors.buyPrice = "قیمت خرید الزامی است";
    } else if (Number(buyPrice) < 0) {
      newErrors.buyPrice = "قیمت نمی‌تواند منفی باشد";
    }

    // Validate count
    if (!count) {
      newErrors.count = "تعداد الزامی است";
    } else if (Number(count) < 1) {
      newErrors.count = "تعداد باید حداقل ۱ باشد";
    }

    // Validate provider
    if (!provider) {
      newErrors.provider = "انتخاب تامین کننده الزامی است";
    }

    // Validate materialType
    if (!materialType) {
      newErrors.materialType = "انتخاب نوع مواد الزامی است";
    }

    // Validate glass or sideMaterial based on materialType
    if (materialType === "glass" && !glass) {
      newErrors.glass = "انتخاب شیشه الزامی است";
    }

    if (materialType === "sideMaterial" && !sideMaterial) {
      newErrors.sideMaterial = "انتخاب مواد جانبی الزامی است";
    }

    // Validate width and height for glass type
    if (materialType === "glass") {
      if (!width) {
        newErrors.width = "عرض الزامی است";
      } else if (Number(width) <= 0) {
        newErrors.width = "عرض باید بزرگتر از صفر باشد";
      }

      if (!height) {
        newErrors.height = "ارتفاع الزامی است";
      } else if (Number(height) <= 0) {
        newErrors.height = "ارتفاع باید بزرگتر از صفر باشد";
      }
    }

    // Validate enterDate
    if (!enterDate) {
      newErrors.enterDate = "تاریخ ورود الزامی است";
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
      // Convert Persian date to ISO format for the API
      let formattedDate = "";
      if (enterDate) {
        // Convert to Gregorian date for the API
        const gregorianDate = new Date(enterDate.toDate());
        formattedDate = gregorianDate.toISOString().split("T")[0];
      }

      // Prepare form data
      const formData = {
        id: inventoryId, // Use 'id' as expected by the API
        name,
        code,
        buyPrice,
        count,
        provider,
        // Keep the original values if they exist in initialValues
        glass: materialType === "glass" ? glass : initialValues?.glass || null,
        sideMaterial:
          materialType === "sideMaterial"
            ? sideMaterial
            : initialValues?.sideMaterial || null,
        width: materialType === "glass" ? width : null,
        height: materialType === "glass" ? height : null,
        enterDate: formattedDate,
      };

      // Submit form data
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("موجودی با موفقیت بروزرسانی شد");
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(`خطا در بروزرسانی موجودی: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("خطا در بروزرسانی موجودی");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">نام</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Buy Price Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            قیمت خرید
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="قیمت خرید را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.buyPrice && (
            <p className="text-xs text-red-600 mt-1">{errors.buyPrice}</p>
          )}
        </div>

        {/* Count Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تعداد
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="تعداد را وارد کنید"
            className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.count && (
            <p className="text-xs text-red-600 mt-1">{errors.count}</p>
          )}
        </div>

        {/* Provider Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تامین کننده
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">تامین کننده را انتخاب کنید</option>
            {providers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="text-xs text-red-600 mt-1">{errors.provider}</p>
          )}
        </div>

        {/* Material Type Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            نوع مواد
          </label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">نوع مواد را انتخاب کنید</option>
            <option value="glass">شیشه</option>
            <option value="sideMaterial">مواد جانبی</option>
          </select>
          {errors.materialType && (
            <p className="text-xs text-red-600 mt-1">{errors.materialType}</p>
          )}
        </div>

        {/* Glass Field - Only shown when materialType is "glass" */}
        {materialType === "glass" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              شیشه
            </label>
            <select
              value={glass}
              onChange={(e) => setGlass(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">شیشه را انتخاب کنید</option>
              {glasses.map(
                (option) => (
                  console.log(option),
                  (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                )
              )}
            </select>
            {errors.glass && (
              <p className="text-xs text-red-600 mt-1">{errors.glass}</p>
            )}
          </div>
        )}

        {/* Width Field - Only shown when materialType is "glass" */}
        {materialType === "glass" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              عرض (سانتی‌متر)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="عرض را وارد کنید"
              className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.width && (
              <p className="text-xs text-red-600 mt-1">{errors.width}</p>
            )}
          </div>
        )}

        {/* Height Field - Only shown when materialType is "glass" */}
        {materialType === "glass" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              ارتفاع (سانتی‌متر)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="ارتفاع را وارد کنید"
              className="w-full px-3 py-2 border placeholder:text-black/40 text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.height && (
              <p className="text-xs text-red-600 mt-1">{errors.height}</p>
            )}
          </div>
        )}

        {/* Side Material Field - Only shown when materialType is "sideMaterial" */}
        {materialType === "sideMaterial" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              مواد جانبی
            </label>
            <select
              value={sideMaterial}
              onChange={(e) => setSideMaterial(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">مواد جانبی را انتخاب کنید</option>
              {sideMaterials.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.sideMaterial && (
              <p className="text-xs text-red-600 mt-1">{errors.sideMaterial}</p>
            )}
          </div>
        )}

        {/* Enter Date Field - Persian Date Picker */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ ورود
          </label>
          <DatePicker
            value={enterDate}
            onChange={(date) => setEnterDate(date as DateObject)}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="تاریخ ورود را انتخاب کنید"
          />
          {errors.enterDate && (
            <p className="text-xs text-red-600 mt-1">{errors.enterDate}</p>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex justify-start space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "در حال ارسال..." : "بروزرسانی"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-rose-500 hover:text-rose-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryEditForm;
