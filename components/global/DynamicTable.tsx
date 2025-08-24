"use client";

import React, { useState, useEffect, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDownload,
} from "react-icons/hi";
import { TableColumn, DynamicTableProps } from "@/types/tables";
import { useTableToPng } from "@/hooks/useTableToPng";

const DynamicTable = React.forwardRef(({ config }: DynamicTableProps, ref) => {
  type RowType = {
    [key: string]: unknown; // Allow any type for flexibility
    _id?: string | number;
    id?: string | number;
  };
  const [data, setData] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  type SortConfig = { key: string; direction: "asc" | "desc" | string } | null;
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error: pngError,
  } = useTableToPng();

  useEffect(() => {
    fetchData();
  }, [config.endpoint, config.filters]);

  const handlePageChange = (page: number) => {
    const url = new URL(config.endpoint, window.location.origin);
    url.searchParams.set('page', String(page));
    const newEndpoint = url.pathname + url.search;
    
    // Update the config endpoint and fetch new data
    config.endpoint = newEndpoint;
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build URL with filters
      let url = config.endpoint;
      if (config.filters && Object.keys(config.filters).length > 0) {
        const params = new URLSearchParams();
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      console.log("Fetching URL:", url); // Debug log

      const options: RequestInit = {
        method: "GET",
        headers: config.headers ? { ...config.headers } : {},
      };
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      // Handle pagination if present
      if (result.pagination) {
        setPagination(result.pagination);
      }

      // Use responseHandler if provided, otherwise check for common response structures
      if (config.responseHandler) {
        setData(config.responseHandler(result) || []);
      } else if (result.accountGroups) {
        // Special case for accountGroups API
        setData(result.accountGroups || []);
      } else if (result.totalAccounts) {
        // Special case for totalAccounts API
        setData(result.totalAccounts || []);
      } else if (result.permissions) {
        // Special case for permissions API
        setData(result.permissions || []);
      } else if (result.rollcalls) {
        // Special case for rollcalls API
        setData(result.rollcalls || []);
      } else if (result.deficits) {
        // Special case for deficits API
        setData(result.deficits || []);
      } else if (result.checks) {
        // Special case for transactions API
        setData(result.checks || []);
      } else if (result.inventoryReports) {
        // Special case for inventory reports API
        setData(result.inventoryReports || []);
      } else if (result.inventory) {
        // Special case for inventory API
        setData(result.inventory || []);
      } else if (result.providers) {
        // Special case for providers API
        setData(result.providers || []);
      } else if (result.providerReports) {
        // Special case for provider reports API
        setData(result.providerReports || []);
      } else {
        setData(result.data || []);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

      // Handle null/undefined values
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
    row: string|number|object|unknown
  ): React.ReactNode => {
    // If a custom render function is provided, use it with the raw value
    if (column.render) {
      return column.render(value, row);
    }

    // Handle nested properties (e.g., "staff.name")
    if (column.key.includes(".")) {
      const keys = column.key.split(".");
      let nestedValue = row;
      for (const key of keys) {
        if (nestedValue && typeof nestedValue === 'object' && nestedValue !== null && key in nestedValue) {
          nestedValue = (nestedValue as Record<string, unknown>)[key];
        } else {
          nestedValue = null;
          break;
        }
      }
      value = nestedValue;
    }

    // Handle different column types
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
    fetchData();
  };

  const formatValueForPng = (
    value: unknown,
    column: TableColumn,
    row: object
  ): string => {
    if (column.render && typeof column.render === "function") {
      const rendered = column.render(value, row);
      if (React.isValidElement(rendered)) {
        // For date columns, format the original value
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
      // Handle date formatting for non-rendered columns
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
        new Set(sortedData.map((row) => String(row._id || row.id)))
      );
    }
  };

  const handleTablePng = () => {
    const headers = config.columns.map((col) => col.label || col.header || "");
    const tableData = sortedData.map((row, idx) => {
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
      .filter((row) => selectedRows.has(String(row._id || row.id)))
      .map((row, idx) => {
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
        sortedData.findIndex((r) => (r._id || r.id) === (row._id || row.id)) +
        1,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">خطا در بارگذاری داده‌ها: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white  rounded-lg shadow-md ${config.className || ""}`}>
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

      {/* Table */}
      <div className="overflow-x-auto">
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
                config.actions?.delete) && (
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
              sortedData.map((row, index) => {
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
                      config.actions?.delete) && (
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
            onClick={fetchData}
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
              onClick={() => {
                const newUrl = new URL(config.endpoint, window.location.origin);
                newUrl.searchParams.set('page', String(pagination.currentPage - 1));
                config.endpoint = newUrl.pathname + newUrl.search;
                fetchData();
              }}
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
              onClick={() => {
                const newUrl = new URL(config.endpoint, window.location.origin);
                newUrl.searchParams.set('page', String(pagination.currentPage + 1));
                config.endpoint = newUrl.pathname + newUrl.search;
                fetchData();
              }}
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
