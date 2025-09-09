"use client";

import React, { useState, useImperativeHandle, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDownload,
} from "react-icons/hi";
import { TableColumn, DynamicTableProps } from "@/types/tables";
import { useTableToPng } from "@/hooks/useTableToPng";
import { DateObject } from "react-multi-date-picker";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useTableData } from "@/hooks/useTable";

const DynamicTable = React.forwardRef(({ config }: DynamicTableProps, ref) => {
  type RowType = {
    [key: string]: unknown;
    _id?: string | number;
    id?: string | number;
  };
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | string;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [localFilters, setLocalFilters] = useState<
    Record<
      string,
      string | number | boolean | [string, string] | [number, number] | null
    >
  >(config.filters || {});
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error: pngError,
  } = useTableToPng();

  // استفاده از هوک useTableData برای دریافت داده‌ها
  const { data, pagination, error, isLoading, mutate } = useTableData(
    config.endpoint,
    config.headers,
    { ...config.filters, ...localFilters },
    currentPage,
    config.responseHandler
  );

  const debouncedUpdateFilter = useCallback(
    (
      key: string,
      value:
        | string
        | number
        | boolean
        | [string, string]
        | [number, number]
        | null
    ) => {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    },
    [currentPage]
  );

  const handleSort = (key: string) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const formatCellValue = (
    value: unknown,
    column: TableColumn,
    row: string | number | object | unknown
  ): React.ReactNode => {
    if (column.render) {
      return column.render(value, row as Record<string, unknown>);
    }

    if (column.key.includes(".")) {
      const keys = column.key.split(".");
      let nestedValue = row;
      for (const key of keys) {
        if (
          nestedValue &&
          typeof nestedValue === "object" &&
          nestedValue !== null &&
          key in nestedValue
        ) {
          nestedValue = (nestedValue as Record<string, unknown>)[key];
        } else {
          nestedValue = null;
          break;
        }
      }
      value = nestedValue;
    }

    switch (column.type) {
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString("fa-IR");
        }
        if (typeof value === "string" || typeof value === "number") {
          const date = new Date(value);
          return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fa-IR");
        }
        return "-";
      case "time":
        if (value instanceof Date) {
          return value.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
        if (typeof value === "string" || typeof value === "number") {
          const date = new Date(value);
          return isNaN(date.getTime())
            ? "-"
            : date.toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
        }
        return "-";
      case "phone":
        return value ? String(value) : "-";
      case "email":
        return value ? String(value) : "-";
      case "status":
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value === "active" ? "فعال" : "غیرفعال"}
          </span>
        );
      default:
        return value !== undefined && value !== null ? String(value) : "-";
    }
  };

  const refreshData = () => {
    mutate();
  };

  const clearFilters = () => {
    setLocalFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderFilterField = (field: TableColumn) => {
    const value = localFilters[field.key];

    switch (field.filterType) {
      case "text":
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => {
              const inputValue = e.target.value;
              debouncedUpdateFilter(
                field.key,
                inputValue === "" ? null : inputValue
              );
            }}
            placeholder={field.placeholder || `جستجو ${field.label}`}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        );
      case "select":
        return (
          <select
            value={String(value || "")}
            onChange={(e) => {
              const selectValue = e.target.value;
              debouncedUpdateFilter(
                field.key,
                selectValue === "" ? null : selectValue
              );
            }}
            className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          >
            <option value="">{field.placeholder || "انتخاب کنید"}</option>
            {field.filterOptions?.map(
              (option: { value: string; label: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={String(value || "")}
            onChange={(e) =>
              debouncedUpdateFilter(field.key, Number(e.target.value))
            }
            placeholder={field.placeholder}
            min={field.min || 0}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        );
      case "numberRange":
        const numRange = Array.isArray(value)
          ? (value as [number, number])
          : ([0, 0] as [number, number]);
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={String(numRange[0] || "")}
              onChange={(e) =>
                debouncedUpdateFilter(field.key, [
                  Number(e.target.value) || 0,
                  Number(numRange[1]) || 0,
                ])
              }
              placeholder="حداقل"
              className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
            <span className="flex items-center text-gray-400">-</span>
            <input
              type="number"
              value={String(numRange[1] || "")}
              onChange={(e) =>
                debouncedUpdateFilter(field.key, [
                  Number(numRange[0]) || 0,
                  Number(e.target.value) || 0,
                ])
              }
              placeholder="حداکثر"
              className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>
        );
      case "date":
        return (
          <div className="relative">
            <DatePicker
              value={value ? new DateObject(new Date(String(value))) : null}
              onChange={(val) => {
                const dateValue = val
                  ? val.toDate().toISOString().split("T")[0]
                  : "";
                debouncedUpdateFilter(field.key, dateValue || null);
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              placeholder="انتخاب تاریخ"
              inputClass="w-full p-3 pr-4 pl-8 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-right"
              calendarPosition="bottom-center"
              containerClassName="w-full"
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              📅
            </div>
          </div>
        );
      case "dateRange":
        const dateRange = Array.isArray(value)
          ? (value as [string, string])
          : (["", ""] as [string, string]);
        return (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DatePicker
                value={
                  dateRange[0] ? new DateObject(new Date(dateRange[0])) : null
                }
                onChange={(val) => {
                  const fromDate = val
                    ? val.toDate().toISOString().split("T")[0]
                    : "";
                  const newRange: [string, string] = [fromDate, dateRange[1]];
                  debouncedUpdateFilter(
                    field.key,
                    fromDate || dateRange[1] ? newRange : null
                  );
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                placeholder="از تاریخ"
                inputClass="w-full p-3 pr-4 pl-8 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-right"
                calendarPosition="bottom-center"
                containerClassName="w-full"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                📅
              </div>
            </div>
            <div className="relative flex-1">
              <DatePicker
                value={
                  dateRange[1] ? new DateObject(new Date(dateRange[1])) : null
                }
                onChange={(val) => {
                  const toDate = val
                    ? val.toDate().toISOString().split("T")[0]
                    : "";
                  const newRange: [string, string] = [dateRange[0], toDate];
                  debouncedUpdateFilter(
                    field.key,
                    dateRange[0] || toDate ? newRange : null
                  );
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                placeholder="تا تاریخ"
                inputClass="w-full p-3 pr-4 pl-8 border border-gray-300 rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-right"
                calendarPosition="bottom-center"
                containerClassName="w-full"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                📅
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const formatValueForPng = (
    value: unknown,
    column: TableColumn,
    row: object
  ): string => {
    if (column.render && typeof column.render === "function") {
      const rendered = column.render(value, row as Record<string, unknown>);
      if (React.isValidElement(rendered)) {
        if (column.type === "date") {
          if (value instanceof Date) {
            return value.toLocaleDateString("fa-IR");
          }
          if (typeof value === "string" || typeof value === "number") {
            const date = new Date(value);
            return isNaN(date.getTime())
              ? "-"
              : date.toLocaleDateString("fa-IR");
          }
        }
        return String(value || "-");
      } else {
        return String(rendered || "-");
      }
    } else {
      if (column.type === "date") {
        if (value instanceof Date) {
          return value.toLocaleDateString("fa-IR");
        }
        if (typeof value === "string" || typeof value === "number") {
          const date = new Date(value);
          return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fa-IR");
        }
        return "-";
      }
      return String(value || "-");
    }
  };

  const handleSelectRow = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(sortedData.map((row: RowType) => String(row._id || row.id)))
      );
    }
  };

  const handleTablePng = () => {
    const headers = config.columns.map((col) => col.label || col.header || "");
    const tableData = sortedData.map((row: RowType, idx: number) => {
      const rowData: Record<
        string,
        string | number | boolean | null | undefined
      > = {
        index: idx + 1,
      };
      config.columns.forEach((col) => {
        const value = row[col.key];
        rowData[col.key] = formatValueForPng(value, col, row);
      });
      return rowData;
    });
    generateTablePng(tableData, ["#", ...headers], {
      filename: `${config.title.replace(/\s+/g, "-")}-table-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleSelectedRowsPng = () => {
    const headers = config.columns.map((col) => col.label || col.header || "");
    const selectedData = sortedData
      .filter((row: RowType) => selectedRows.has(String(row._id || row.id)))
      .map((row: RowType, idx: number) => {
        const rowData: Record<
          string,
          string | number | boolean | null | undefined
        > = {
          index: idx + 1,
        };
        config.columns.forEach((col) => {
          const value = row[col.key];
          rowData[col.key] = formatValueForPng(value, col, row);
        });
        return rowData;
      });
    generateSelectedRowsPng(selectedData, ["#", ...headers], {
      filename: `${config.title.replace(
        /\s+/g,
        "-"
      )}-selected-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  const handleRowPng = (row: RowType) => {
    const headers = config.columns.map((col) => col.label || col.header || "");
    const rowData: Record<
      string,
      string | number | boolean | null | undefined
    > = {
      index:
        sortedData.findIndex(
          (r: RowType) => (r._id || r.id) === (row._id || row.id)
        ) + 1,
    };
    config.columns.forEach((col) => {
      const value = row[col.key];
      rowData[col.key] = formatValueForPng(value, col, row);
    });
    generateRowPng(rowData, ["#", ...headers], {
      filename: `${config.title.replace(/\s+/g, "-")}-row-${Date.now()}.png`,
      backgroundColor: "#ffffff",
    });
  };

  useImperativeHandle(ref, () => ({
    refreshData,
    handleTablePng,
    handleSelectedRowsPng,
    handleRowPng,
    selectedCount: selectedRows.size,
  }));

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">خطا در بارگذاری داده‌ها: {error}</p>
        <button
          onClick={refreshData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${config.className || ""}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            {config.description && (
              <p className="text-gray-600 mt-1">{config.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTablePng}
              disabled={isGenerating || sortedData.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              دانلود جدول (PNG)
            </button>
            <button
              onClick={handleSelectedRowsPng}
              disabled={isGenerating || selectedRows.size === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              دانلود انتخاب شده ({selectedRows.size})
            </button>
          </div>
        </div>
        {pngError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{pngError}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      {config.enableFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center lg:grid-cols-6 gap-4">
            {config.columns
              .filter((col) => col.filterable)
              .map((column) => (
                <div key={column.key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {column.label}
                  </label>
                  {renderFilterField(column)}
                </div>
              ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      )}

      {/* Table with overlay loading */}
      <div className="relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === sortedData.length &&
                    sortedData.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {config.columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    {column.label}
                    {column.sortable && (
                      <span className="ml-2">
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(config.actions?.view ||
                config.actions?.edit ||
                config.actions?.delete ||
                (config.actions?.custom &&
                  config.actions.custom.length > 0)) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  هیچ داده‌ای یافت نشد
                </td>
              </tr>
            ) : (
              sortedData.map((row: RowType, index: number) => {
                const rowId = String(row._id || row.id || index);
                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-gray-50 ${
                      selectedRows.has(rowId) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={() => handleSelectRow(rowId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pagination
                        ? (pagination.currentPage - 1) *
                            pagination.itemsPerPage +
                          index +
                          1
                        : index + 1}
                    </td>
                    {config.columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {formatCellValue(row[column.key], column, row)}
                      </td>
                    ))}
                    {(config.actions?.view ||
                      config.actions?.edit ||
                      config.actions?.delete ||
                      (config.actions?.custom &&
                        config.actions.custom.length > 0)) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          {config.actions?.view && (
                            <div className="relative group">
                              <button
                                onClick={() => config.onView?.(row)}
                                className="text-blue-600 border cursor-pointer hover:text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlineEye className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                مشاهده جزئیات
                              </span>
                            </div>
                          )}
                          {config.actions?.edit && (
                            <div className="relative group">
                              <button
                                onClick={() => config.onEdit?.(row)}
                                className="text-amber-600 border cursor-pointer hover:text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlinePencilAlt className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                ویرایش
                              </span>
                            </div>
                          )}
                          {config.actions?.delete && (
                            <div className="relative group">
                              <button
                                onClick={() => config.onDelete?.(row)}
                                className="text-red-600 border cursor-pointer hover:text-red-900 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                حذف
                              </span>
                            </div>
                          )}
                          <div className="relative group">
                            <button
                              onClick={() => handleRowPng(row)}
                              disabled={isGenerating}
                              className="text-purple-600 border cursor-pointer hover:text-purple-900 px-3 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                            >
                              <HiOutlineDownload className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              دانلود PNG
                            </span>
                          </div>
                          {config.actions?.custom?.map((action, index) => (
                            <div key={index} className="relative group">
                              <button
                                onClick={() => action.onClick(row)}
                                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                  action.className ||
                                  "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                                style={{
                                  display: action.condition
                                    ? action.condition(row)
                                      ? "flex"
                                      : "none"
                                    : "flex",
                                }}
                              >
                                <span className="w-4 h-4 text-sm flex items-center justify-center">
                                  {action.icon}
                                </span>
                              </button>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                {action.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            نمایش {sortedData.length} آیتم
          </div>
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mt-6 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm gap-3 sm:gap-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center text-xs sm:text-sm font-medium text-gray-600">
            <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-center">
              <span className="hidden sm:inline">
                نمایش{" "}
                <span className="font-bold text-blue-600">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                تا{" "}
                <span className="font-bold text-blue-600">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-green-600">
                  {pagination.totalItems}
                </span>{" "}
                نتیجه
              </span>
              <span className="sm:hidden">
                <span className="font-bold text-blue-600">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                از{" "}
                <span className="font-bold text-green-600">
                  {pagination.totalItems}
                </span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              whileHover={pagination.hasPrevPage ? { scale: 1.05 } : {}}
              whileTap={pagination.hasPrevPage ? { scale: 0.95 } : {}}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                pagination.hasPrevPage
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              قبلی
            </motion.button>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md">
              {pagination.currentPage} / {pagination.totalPages}
            </div>
            <motion.button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              whileHover={pagination.hasNextPage ? { scale: 1.05 } : {}}
              whileTap={pagination.hasNextPage ? { scale: 0.95 } : {}}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                pagination.hasNextPage
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              بعدی
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
});

DynamicTable.displayName = "DynamicTable";

export default DynamicTable;
