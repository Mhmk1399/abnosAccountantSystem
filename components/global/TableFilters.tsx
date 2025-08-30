"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HiOutlineX, HiOutlineSearch } from "react-icons/hi";
import { FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FilterConfig {
  fields: FilterField[];
  onFiltersChange: (filters: Record<string, string | number>) => void;
  debounceMs?: number;
}

interface TableFiltersProps {
  config: FilterConfig;
}

const TableFilters: React.FC<TableFiltersProps> = ({ config }) => {
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  // Debounced filter change
  const debouncedFiltersChange = useCallback(
    debounce((newFilters) => {
      config.onFiltersChange(newFilters as Record<string, string | number>);
    }, config.debounceMs || 300),
    [config.onFiltersChange]
  );

  useEffect(() => {
    console.log("TableFilters - filters changed:", filters); // Debug log
    debouncedFiltersChange(filters);
  }, [filters, debouncedFiltersChange]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ""
  );

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.key] || "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(field.key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "date":
        return (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-300">
              <FaRegCalendarAlt className="text-gray-400" />
              <DatePicker
                value={value ? new DateObject(new Date(value)) : null}
                onChange={(dateObj: DateObject | DateObject[] | null) => {
                  if (dateObj && typeof dateObj === "object" && "toDate" in dateObj) {
                    handleFilterChange(field.key, dateObj.toDate().toISOString().split('T')[0]);
                  } else {
                    handleFilterChange(field.key, "");
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="w-full bg-transparent p-2 text-black focus:outline-none placeholder:text-gray-400"
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ"
              />
            </div>
          </div>
        );

      case "dateRange":
        return (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 flex-1">
                <FaRegCalendarAlt className="text-gray-400" />
                <DatePicker
                  value={filters[`${field.key}_from`] ? new DateObject(new Date(filters[`${field.key}_from`])) : null}
                  onChange={(dateObj: DateObject | DateObject[] | null) => {
                    if (dateObj && typeof dateObj === "object" && "toDate" in dateObj) {
                      handleFilterChange(`${field.key}_from`, dateObj.toDate().toISOString().split('T')[0]);
                    } else {
                      handleFilterChange(`${field.key}_from`, "");
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="w-full bg-transparent p-1 text-black focus:outline-none placeholder:text-gray-400 text-sm"
                  calendarPosition="bottom-right"
                  placeholder="از تاریخ"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 flex-1">
                <FaRegCalendarAlt className="text-gray-400" />
                <DatePicker
                  value={filters[`${field.key}_to`] ? new DateObject(new Date(filters[`${field.key}_to`])) : null}
                  onChange={(dateObj: DateObject | DateObject[] | null) => {
                    if (dateObj && typeof dateObj === "object" && "toDate" in dateObj) {
                      handleFilterChange(`${field.key}_to`, dateObj.toDate().toISOString().split('T')[0]);
                    } else {
                      handleFilterChange(`${field.key}_to`, "");
                    }
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  inputClass="w-full bg-transparent p-1 text-black focus:outline-none placeholder:text-gray-400 text-sm"
                  calendarPosition="bottom-right"
                  placeholder="تا تاریخ"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineSearch className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">فیلترها</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(v => v !== undefined && v !== null && v !== "").length} فعال
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
              >
                <HiOutlineX className="w-4 h-4" />
                پاک کردن
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {config.fields.map(renderFilterField)}
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default TableFilters;