import React from "react";

export interface TableColumn {
  key: string;
  label?: string;
  header?: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "time"
    | "email"
    | "phone"
    | "status"
    | "custom"
    | "boolean"
    | "textarea";
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}
export interface CustomAction {
  label: string;
  icon?: string;
  className?: string;
  onClick: (row: any) => void;
  condition?: (row: any) => boolean;
}

export interface TableConfig {
  title: string;
  description?: string;
  endpoint: string;
  deleteEndpoint?: string;
  columns: TableColumn[];
  filters?: Record<string, any>;
  filterParams?: Record<string, string>;
  itemsPerPage?: number; // Frontend controls pagination size
  key?: string;
  actions?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    custom?: CustomAction[];
  };
  onView?: (row: any) => void;
  headers?: Record<string, string>; // ✅ Optional headers
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  className?: string;
  responseHandler?: (response: any) => any[]; // Custom handler for API responses
}

export interface DynamicTableProps {
  config: TableConfig;
}

export interface DynamicTableRef {
  refreshData: () => void;
  handleTablePng: () => void;
  handleSelectedRowsPng: () => void;
  selectedCount: number;
}

export interface ProviderReportData {
  _id: string;
  name: string;
  code: string;
  purchaseAmount?: number;
  usedAmount?: number;
  remainingAmount?: number;
  createdAt?: string;
  phone?: string;
  date?: string;
}

export interface SimpleDynamicTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  onRefresh?: () => void;
}
