"use client";

import { useState, useEffect } from "react";
import { FormConfig, FormData, FormState, FormField } from "@/types/form";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";

interface DynamicFormProps {
  config: FormConfig;
  initialData?: FormData;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialData = {},
}) => {
  const [formState, setFormState] = useState<FormState>({
    data: initialData,
    errors: {},
    loading: false,
    success: false,
  });

  // Initialize form data with default values
  useEffect(() => {
    const initialFormData: FormData = { ...initialData };

    config.fields.forEach((field) => {
      if (field.defaultValue !== undefined && !initialFormData[field.name]) {
        initialFormData[field.name] = field.defaultValue;
      }
    });

    setFormState((prev) => ({ ...prev, data: initialFormData }));
  }, [config.fields]);

  const validateField = (
    field: FormField,
    value: string | number | boolean | File | string[]
  ): string | null => {
    // Skip validation for File type fields
    if (value instanceof File) {
      return null;
    }

    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, minLength, maxLength } = field.validation;
      const stringValue = String(value);

      if (minLength && stringValue.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }

      if (maxLength && stringValue.length > maxLength) {
        return `${field.label} must not exceed ${maxLength} characters`;
      }

      if (pattern && !new RegExp(pattern).test(stringValue)) {
        return `${field.label} format is invalid`;
      }

      if (field.type === "number") {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `${field.label} must not exceed ${max}`;
        }
      }
    }

    return null;
  };

  const handleInputChange = (
    fieldName: string,
    value: string | number | boolean | string[] // Add string[] for array values
  ) => {
    setFormState((prev) => ({
      ...prev,
      data: { ...prev.data, [fieldName]: value },
      errors: { ...prev.errors, [fieldName]: null },
    }));

    // Handle field changes and validation
    const field = config.fields.find((f) => f.name === fieldName);
    if (field?.onChange) {
      // For array values, pass the array directly
      if (Array.isArray(value)) {
        field.onChange(fieldName, value);
      } else {
        field.onChange(fieldName, value as string);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields (skip hidden fields validation for display)
    const errors: { [key: string]: string } = {};
    config.fields.forEach((field) => {
      // Skip validation for hidden fields if they have default values
      if (field.type === "hidden" && field.defaultValue !== undefined) {
        return;
      }
      const value = formState.data[field.name];
      const formattedValue =
        value instanceof Date ? value.toISOString() : value;
      const error = validateField(field, formattedValue);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      // Show validation error toast
      toast.error(
        config.validationErrorMessage || "لطفاً خطاهای فرم را بررسی کنید"
      );
      return;
    }

    setFormState((prev) => ({ ...prev, loading: true, errors: {} }));

    // Debug: Log the form data being submitted
    console.log("Submitting form data:", formState.data);

    try {
      const response = await fetch(config.endpoint, {
        method: config.method || "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Form submission failed");
      }

      setFormState((prev) => ({ ...prev, loading: false, success: true }));

      // Show success toast
      toast.success(config.successMessage || "فرم با موفقیت ارسال شد!");

      if (config.onSuccess) {
        config.onSuccess(result);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: { submit: errorMessage },
      }));

      // Show error toast
      toast.error(config.errorMessage || `خطا در ارسال فرم: ${errorMessage}`);

      if (config.onError) {
        config.onError(errorMessage);
      }
    }
  };

  const renderField = (field: FormField) => {
    const value = formState.data[field.name] || "";
    const error = formState.errors[field.name];
    const fieldId = `field-${field.name}`;

    // Don't render hidden fields
    if (field.type === "hidden" || field.hidden) {
      return null;
    }

    const baseClassName = `w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? "border-red-500" : "border-gray-300"
    } ${field.readonly ? "bg-gray-100 cursor-not-allowed" : ""} ${
      field.className || ""
    }`;

    switch (field.type) {
      case "select":
        return (
          <div key={field.name + field.label} className="mb-4" dir="rtl">
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldId}
              value={String(value)}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={baseClassName}
              required={field.required}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="mb-4" dir="rtl">
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={fieldId}
              value={String(value)}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`${baseClassName} h-24 resize-vertical`}
              required={field.required}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="mb-4" dir="rtl">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={fieldId}
                checked={Boolean(value)}
                onChange={(e) =>
                  handleInputChange(field.name, e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={fieldId} className="ml-4 text-sm text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.name} className="mb-4" dir="rtl">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </legend>
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`${fieldId}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={String(value) === option.value}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={`${fieldId}-${option.value}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </fieldset>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );

      case "checkbox-group":
        return (
          <div key={field.name} className="mb-4 space-y-3" dir="rtl">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-3">{field.description}</p>
            )}
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {field.options?.map((option) => {
                const isChecked = Array.isArray(formState.data[field.name])
                  ? (formState.data[field.name] as string[]).includes(
                      option.value
                    )
                  : false;

                return (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 space-x-reverse"
                  >
                    <input
                      type="checkbox"
                      id={`${field.name}-${option.value}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValues = Array.isArray(
                          formState.data[field.name]
                        )
                          ? (formState.data[field.name] as string[])
                          : [];

                        let newValues;
                        if (e.target.checked) {
                          newValues = [...currentValues, option.value];
                        } else {
                          newValues = currentValues.filter(
                            (val: string) => val !== option.value
                          );
                        }

                        handleInputChange(field.name, newValues);
                      }}
                      className="mt-1 ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`${field.name}-${option.value}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </label>
                      {option.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {formState.errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors[field.name]}
              </p>
            )}
          </div>
        );

      case "persian-date":
        return (
          <div key={field.name} className="mb-4" dir="rtl">
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-300">
              <FaRegCalendarAlt className="text-gray-400" />
              <DatePicker
                value={value ? new DateObject(value as Date) : null}
                onChange={(date: DateObject | DateObject[] | null) => {
                  if (date && typeof date === "object" && "toDate" in date) {
                    handleInputChange(field.name, date.toDate().toISOString());
                  } else if (
                    Array.isArray(date) &&
                    date[0] &&
                    "toDate" in date[0]
                  ) {
                    handleInputChange(
                      field.name,
                      date[0].toDate().toISOString()
                    );
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="w-full bg-transparent p-2 text-black focus:outline-none"
                calendarPosition="bottom-right"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4" dir="rtl">
            <label
              htmlFor={fieldId}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              value={String(value)}
              onChange={(e) => {
                const inputValue =
                  field.type === "number"
                    ? Number(e.target.value)
                    : e.target.value;
                handleInputChange(field.name, inputValue);
              }}
              placeholder={field.placeholder}
              className={baseClassName}
              required={field.required}
              readOnly={field.readonly}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {field.description && (
              <p className="text-gray-500 text-sm mt-1">{field.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-6 bg-white rounded-lg  ${
        config.className || ""
      }`}
      dir="rtl"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h2>
        {config.description && (
          <p className="text-gray-600">{config.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {config.fields.map(renderField)}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={formState.loading}
            className={`px-6 py-3 w-50 rounded-md cursor-pointer font-medium transition-colors ${
              formState.loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            } text-white`}
          >
            {formState.loading
              ? "در حال ارسال..."
              : config.submitButtonText || "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
