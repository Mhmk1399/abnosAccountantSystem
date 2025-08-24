"use client";

import { useState, useEffect } from "react";
import {  FaTrash, FaEye } from "react-icons/fa";
import { useDailyBook } from "@/contexts/DailyBookContext";


interface Workflow {
  _id: string;
  name: string;
  trigger: {
    model: string;
    method: string;
  };
  steps: Array<{
    action: string;
    model: string;
    method: string;
    dataMapping: Record<string, string>;
  }>;
  dailyBookConfig?: {
    debitEntries: Array<{
      accountGroup: string;
      totalAccount: string;
      fixedAccounts: string;
      detailed1?: string;
      amountField: string;
      descriptionTemplate: string;
    }>;
    creditEntries: Array<{
      accountGroup: string;
      totalAccount: string;
      fixedAccounts: string;
      detailed1?: string;
      amountField: string;
      descriptionTemplate: string;
    }>;
    autoFiscalYear: boolean;
  };
}

const WorkflowTable = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflow");
      const data = await response.json();
      console.log("Fetched workflows:", data);
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (confirm("آیا از حذف این ورکفلو اطمینان دارید؟")) {
      try {
        await fetch("/api/workflow", {
          method: "DELETE",
          headers: { id }
        });
        fetchWorkflows();
      } catch (error) {
        console.error("Error deleting workflow:", error);
      }
    }
  };

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">لیست ورکفلوها</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-right">نام</th>
                  <th className="p-3 text-right">تریگر</th>
                  <th className="p-3 text-right">تعداد مراحل</th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr 
                    key={workflow._id} 
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      selectedWorkflow?._id === workflow._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <td className="p-3 font-medium">{workflow.name || 'بدون نام'}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {workflow.trigger?.method || 'N/A'} {workflow.trigger?.model || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">{workflow.steps?.length || 0}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedWorkflow(workflow)}
                          className="text-blue-500 hover:text-blue-700"
                          title="مشاهده جزئیات"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteWorkflow(workflow._id)}
                          className="text-red-500 hover:text-red-700"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {workflows.length === 0 && !loading && (
              <div className="text-center p-8 text-gray-500">
                هیچ ورکفلویی یافت نشد
              </div>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">جزئیات ورکفلو</h2>
          </div>
          <div className="p-4">
            {selectedWorkflow ? (
              <WorkflowDetails workflow={selectedWorkflow} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                یک ورکفلو را برای مشاهده جزئیات انتخاب کنید
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowDetails = ({ workflow }: { workflow: Workflow }) => {
  const { accountGroups, totalAccounts, fixedAccounts, detailedAccounts } = useDailyBook();

  const getAccountName = (id: string, type: 'group' | 'total' | 'fixed' | 'detailed') => {
    if (!id) return '';
    const accounts = {
      group: accountGroups,
      total: totalAccounts,
      fixed: fixedAccounts,
      detailed: detailedAccounts,
    };
    return accounts[type]?.find((acc: { _id: string | { toString(): string }; name: string }) => acc._id.toString() === id)?.name || id;
  };

  return (
    <div className="space-y-4">
      {/* Workflow Info */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">{workflow.name}</h3>
        <p className="text-sm text-gray-600">
          تریگر: {workflow.trigger.method} {workflow.trigger.model}
        </p>
      </div>

      {/* Steps Flow */}
      <div className="space-y-3">
        <h4 className="font-bold">مراحل اجرا:</h4>
        {workflow.steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                  مرحله {index + 1}
                </span>
                <span className="font-medium">
                  {step.method} {step.model}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                عملیات: {step.action}
              </div>

              {/* Data Mapping */}
              {step.dataMapping && Object.keys(step.dataMapping).length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    نگاشت داده:
                  </div>
                  <div className="bg-white p-2 rounded border text-xs">
                    {Object.entries(step.dataMapping || {}).map(([field, value]) => (
                      <div key={field} className="flex justify-between">
                        <span className="font-medium">{field}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Arrow to next step */}
            {index < workflow.steps.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DailyBook Configuration */}
      {workflow.dailyBookConfig && (
        <div className="space-y-3">
          <h4 className="font-bold">تنظیمات دفتر روزنامه:</h4>
          
          {/* Debit Entries */}
          {workflow.dailyBookConfig.debitEntries?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-medium text-red-800 mb-2">بدهکارها:</h5>
              {workflow.dailyBookConfig.debitEntries.map((entry, index) => (
                <div key={index} className="bg-white p-3 rounded border mb-2 text-sm">
                  <div><strong>حسابها:</strong> {getAccountName(entry.accountGroup, 'group')} / {getAccountName(entry.totalAccount, 'total')} / {getAccountName(entry.fixedAccounts, 'fixed')} {entry.detailed1 ? `/ ${getAccountName(entry.detailed1, 'detailed')}` : ''}</div>
                  <div><strong>فیلد مبلغ:</strong> {entry.amountField}</div>
                  {entry.descriptionTemplate && (
                    <div><strong>توضیحات:</strong> {entry.descriptionTemplate}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Credit Entries */}
          {workflow.dailyBookConfig.creditEntries?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-2">بستانکارها:</h5>
              {workflow.dailyBookConfig.creditEntries.map((entry, index) => (
                <div key={index} className="bg-white p-3 rounded border mb-2 text-sm">
                  <div><strong>حسابها:</strong> {getAccountName(entry.accountGroup, 'group')} / {getAccountName(entry.totalAccount, 'total')} / {getAccountName(entry.fixedAccounts, 'fixed')} {entry.detailed1 ? `/ ${getAccountName(entry.detailed1, 'detailed')}` : ''}</div>
                  <div><strong>فیلد مبلغ:</strong> {entry.amountField}</div>
                  {entry.descriptionTemplate && (
                    <div><strong>توضیحات:</strong> {entry.descriptionTemplate}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <div className="text-sm">
          <strong>خلاصه:</strong> این ورکفلو شامل {workflow.steps.length} مرحله است که با تریگر{" "}
          <code className="bg-gray-200 px-1 rounded">
            {workflow.trigger.method} {workflow.trigger.model}
          </code>{" "}
          اجرا می‌شود.
          {workflow.dailyBookConfig && (
            <div className="mt-2">
              <strong>دفتر روزنامه:</strong> {workflow.dailyBookConfig.debitEntries?.length || 0} بدهکار، {workflow.dailyBookConfig.creditEntries?.length || 0} بستانکار
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowTable;