'use client';

import { useRef, useState } from 'react';
import DynamicTable from '@/components/global/DynamicTable';
import TableFilters, { FilterConfig } from '@/components/global/TableFilters';
import { TableConfig } from '@/types/tables';
import toast from 'react-hot-toast';
import type { Invoice } from '@/types/finalTypes';

export default function InvoiceStatusManager() {
  const [filters, setFilters] = useState<Record<string, string | number>>({});
  const tableRef = useRef<{ refreshData: () => void }>(null);

  const updateStatus = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoice', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: invoice._id,
          status: 'in progress',
        }),
      });

      if (response.ok) {
        toast.success('وضعیت فاکتور به در حال انجام تغییر یافت');
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } else {
        const errorData = await response.json();
        toast.error(`خطا: ${errorData.message || 'خطا در بروزرسانی وضعیت فاکتور'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('خطا در بروزرسانی وضعیت فاکتور');
    }
  };

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "code",
        label: "کد فاکتور",
        type: "text",
        placeholder: "جستجو در کد فاکتور..."
      },
      {
        key: "customer",
        label: "مشتری",
        type: "text",
        placeholder: "جستجو در نام مشتری..."
      },
      {
        key: "status",
        label: "وضعیت",
        type: "select",
        options: [
          { value: "pending", label: "در انتظار" },
          { value: "in progress", label: "در حال انجام" },
          { value: "completed", label: "تکمیل شده" },
          { value: "cancelled", label: "لغو شده" },
          { value: "stop production", label: "توقف تولید" }
        ]
      },
      {
        key: "productionDate",
        label: "تاریخ تولید",
        type: "dateRange"
      }
    ],
    onFiltersChange: setFilters
  };

  const tableConfig: TableConfig = {
    title: 'مدیریت وضعیت فاکتورها',
    description: 'مدیریت فاکتورهای در انتظار و بروزرسانی وضعیت آنها',
    endpoint: '/api/invoice',
    responseHandler: (data) => data.invoices || [],
    filters,
    itemsPerPage: 10,
    columns: [
      {
        key: 'code',
        label: 'کد',
        sortable: true,
      },
      {
        key: 'customer.name',
        label: 'مشتری',
        render: (value, row) => row.customer?.name || 'ندارد',
      },
      {
        key: 'priority.name',
        label: 'اولویت',
        render: (value, row) => row.priority?.name || 'ندارد',
      },
      {
        key: 'price',
        label: 'قیمت',
        render: (value) => `${value} تومان`,
      },
      {
        key: 'status',
        label: 'وضعیت',
        render: (value) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            value === 'in progress' ? 'bg-blue-100 text-blue-800' :
            value === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {value === 'pending' ? 'در انتظار' :
             value === 'in progress' ? 'در حال انجام' :
             value === 'completed' ? 'تکمیل شده' :
             value === 'cancelled' ? 'لغو شده' :
             value === 'stop production' ? 'توقف تولید' : value}
          </span>
        ),
      },
      {
        key: 'productionDate',
        label: 'تاریخ تولید',
        type: 'date',
      },
      {
        key: 'action',
        label: 'عملیات',
        render: (value, row) => (
          <button
            onClick={() => updateStatus(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            شروع پردازش
          </button>
        ),
      },
    ],
  };

  return (
    <div className="container mx-auto py-8" dir="rtl">
      <TableFilters config={filterConfig} />
      <DynamicTable ref={tableRef} config={tableConfig} />
    </div>
  );
}