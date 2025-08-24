"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import DescriptionMaker from "./DescriptionMaker";
import { useDailyBook } from "@/contexts/DailyBookContext";
import { WorkflowData, WorkflowStep, WorkflowEntry, AccountsCollection, EntriesSectionProps, EntryCardProps } from "@/types/finalTypes";

// Get all models from index
const MODELS = [
  "CheckTransaction",
  "Transaction",
  "DailyBook",
  "Bank",
  "Customer",
  "AccountGroup",
  "TotalAccount",
  "FixedAccount",
  "DetailedAccount",
  "CashTransaction",
  "TransferTransaction",
  "Staff",
  "Salary",
];
const METHODS = ["POST", "PATCH", "DELETE", "GET"];



const WorkflowBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    accountGroups,
    totalAccounts,
    fixedAccounts,
    detailedAccounts,
  } = useDailyBook();
  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: "",
    trigger: { model: "", method: "" },
    steps: [],
    dailyBookConfig: {
      debitEntries: [],
      creditEntries: [],
      autoFiscalYear: true,
    },
  });

  // Create accounts object for compatibility
  const accounts = {
    groups: accountGroups,
    totals: totalAccounts,
    fixed: fixedAccounts,
    detailed: detailedAccounts,
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const addStep = (model: string, method: string) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      action: `${method}_${model}`,
      model,
      method,
      dataMapping: {},
    };
    setWorkflow((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const addDebitEntry = () => {
    setWorkflow((prev) => ({
      ...prev,
      dailyBookConfig: {
        ...prev.dailyBookConfig,
        debitEntries: [
          ...prev.dailyBookConfig.debitEntries,
          {
            accountGroup: "",
            totalAccount: "",
            fixedAccounts: "",
            detailed1: "",
            amountField: "",
            descriptionTemplate: "",
          },
        ],
      },
    }));
  };

  const addCreditEntry = () => {
    setWorkflow((prev) => ({
      ...prev,
      dailyBookConfig: {
        ...prev.dailyBookConfig,
        creditEntries: [
          ...prev.dailyBookConfig.creditEntries,
          {
            accountGroup: "",
            totalAccount: "",
            fixedAccounts: "",
            detailed1: "",
            amountField: "",
            descriptionTemplate: "",
          },
        ],
      },
    }));
  };

  const updateEntry = (
    type: "debit" | "credit",
    index: number,
    field: string,
    value: string
  ) => {
    setWorkflow((prev) => ({
      ...prev,
      dailyBookConfig: {
        ...prev.dailyBookConfig,
        [`${type}Entries`]: (prev.dailyBookConfig[`${type}Entries` as keyof typeof prev.dailyBookConfig] as WorkflowEntry[]).map(
          (entry: WorkflowEntry, i: number) =>
            i === index ? { ...entry, [field]: value } : entry
        ),
      },
    }));
  };

  const removeEntry = (type: "debit" | "credit", index: number) => {
    setWorkflow((prev) => ({
      ...prev,
      dailyBookConfig: {
        ...prev.dailyBookConfig,
        [`${type}Entries`]: (prev.dailyBookConfig[`${type}Entries` as keyof typeof prev.dailyBookConfig] as WorkflowEntry[]).filter(
          (_: WorkflowEntry, i: number) => i !== index
        ),
      },
    }));
  };

  const saveWorkflow = async () => {
    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });

      if (response.ok) {
        toast.success("ورکفلو با موفقیت ذخیره شد");
        setCurrentStep(1);
        setWorkflow({
          name: "",
          trigger: { model: "", method: "" },
          steps: [],
          dailyBookConfig: {
            debitEntries: [],
            creditEntries: [],
            autoFiscalYear: true,
          },
        });
      } else {
        throw new Error("Failed to save workflow");
      }
    } catch (error) {
      console.log(error)
      toast.error("خطا در ذخیره ورکفلو");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">سازنده ورکفلو</h1>

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">مرحله 1: اطلاعات پایه</h3>
            <input
              type="text"
              placeholder="نام ورکفلو"
              value={workflow.name}
              onChange={(e) =>
                setWorkflow((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-3 border rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={workflow.trigger.model}
                onChange={(e) =>
                  setWorkflow((prev) => ({
                    ...prev,
                    trigger: { ...prev.trigger, model: e.target.value },
                  }))
                }
                className="w-full p-3 border rounded"
              >
                <option value="">انتخاب مدل</option>
                {MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <select
                value={workflow.trigger.method}
                onChange={(e) =>
                  setWorkflow((prev) => ({
                    ...prev,
                    trigger: { ...prev.trigger, method: e.target.value },
                  }))
                }
                className="w-full p-3 border rounded"
              >
                <option value="">انتخاب متد</option>
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={nextStep}
                disabled={
                  !workflow.name ||
                  !workflow.trigger.model ||
                  !workflow.trigger.method
                }
                className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Models */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">مرحله 2: افزودن مدلها</h3>
            <div className="grid grid-cols-3 gap-4">
              {MODELS.map((model) => (
                <div key={model} className="border rounded p-3">
                  <h4 className="font-medium mb-2">{model}</h4>
                  <div className="space-y-1">
                    {METHODS.map((method) => (
                      <button
                        key={`${model}-${method}`}
                        onClick={() => addStep(model, method)}
                        className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-blue-100 rounded"
                      >
                        {method} {model}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-2">مراحل انتخاب شده:</h4>
              {workflow.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex justify-between items-center p-2 bg-white rounded mb-1"
                >
                  <span>
                    {index + 1}. {step.action}
                  </span>
                  <button
                    onClick={() =>
                      setWorkflow((prev) => ({
                        ...prev,
                        steps: prev.steps.filter((s) => s.id !== step.id),
                      }))
                    }
                    className="text-red-500"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                قبلی
              </button>
              <button
                onClick={nextStep}
                disabled={workflow.steps.length === 0}
                className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}

        {/* Step 3: DailyBook Entries */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              مرحله 3: تنظیم بدهکار و بستانکار
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <EntriesSection
                title="بدهکارها"
                entries={workflow.dailyBookConfig.debitEntries}
                type="debit"
                accounts={accounts as unknown as AccountsCollection}
                onAdd={addDebitEntry}
                onUpdate={updateEntry}
                onRemove={removeEntry}
                workflow={workflow}
              />
              <EntriesSection
                title="بستانکارها"
                entries={workflow.dailyBookConfig.creditEntries}
                type="credit"
                accounts={accounts as unknown as AccountsCollection}
                onAdd={addCreditEntry}
                onUpdate={updateEntry}
                onRemove={removeEntry}
                workflow={workflow}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                قبلی
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-500 text-white px-6 py-2 rounded"
              >
                بعدی
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Description Maker */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">مرحله 4: سازنده توضیحات</h3>
            <DescriptionMaker
              workflow={workflow}
              value={
                workflow.dailyBookConfig.debitEntries[0]?.descriptionTemplate ||
                ""
              }
              onChange={(value) => {
                if (workflow.dailyBookConfig.debitEntries.length > 0) {
                  updateEntry("debit", 0, "descriptionTemplate", value);
                }
              }}
            />
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                قبلی
              </button>
              <button
                onClick={saveWorkflow}
                className="bg-green-500 text-white px-6 py-2 rounded"
              >
                ذخیره ورکفلو
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Entries Section Component
const EntriesSection = ({
  title,
  entries,
  type,
  accounts,
  onAdd,
  onUpdate,
  onRemove,
  workflow,
}: EntriesSectionProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">{title}</h4>
        <button
          onClick={onAdd}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          + افزودن
        </button>
      </div>
      {entries.map((entry: WorkflowEntry, index: number) => (
        <EntryCard
          key={index}
          entry={entry}
          index={index}
          type={type}
          accounts={accounts}
          onUpdate={onUpdate}
          onRemove={onRemove}
          workflow={workflow}
        />
      ))}
    </div>
  );
};

// Entry Card Component
const EntryCard = ({
  entry,
  index,
  type,
  accounts,
  onUpdate,
  onRemove,
  workflow,
}: EntryCardProps) => {
  // Debug logs
  console.log("EntryCard accounts:", accounts);
  console.log("EntryCard entry:", entry);
  console.log("EntryCard workflow:", workflow);

  // Get available fields from workflow models (like DescriptionMaker)
  const getAvailableFields = () => {
    const fields: string[] = [];

    // Add request fields
    fields.push(
      "request.amount",
      "request.checkNumber",
      "request.senderName",
      "request.receiverName",
      "request.basicSalary",
      "request.overtime",
      "request.bonus",
      "request.netSalary"
    );

    // Add step fields
    workflow.steps.forEach((step: WorkflowStep) => {
      if (step.model === "CheckTransaction") {
        fields.push(
          `step.${step.action}.checkNumber`,
          `step.${step.action}.senderName`,
          `step.${step.action}.amount`
        );
      }
      if (step.model === "Transaction") {
        fields.push(`step.${step.action}._id`, `step.${step.action}.amount`);
      }
      if (step.model === "Salary") {
        fields.push(
          `step.${step.action}.basicSalary`,
          `step.${step.action}.overtime`,
          `step.${step.action}.bonus`,
          `step.${step.action}.netSalary`
        );
      }
    });

    return fields;
  };

  return (
    <div className="border rounded p-3 mb-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">
          {type === "debit" ? "بدهکار" : "بستانکار"} {index + 1}
        </span>
        <button
          onClick={() => onRemove(type, index)}
          className="text-red-500 text-sm"
        >
          حذف
        </button>
      </div>

      <div className="space-y-2">
        <select
          value={entry.accountGroup || ""}
          onChange={(e) => {
            onUpdate(type, index, "accountGroup", e.target.value);
            onUpdate(type, index, "totalAccount", "");
            onUpdate(type, index, "fixedAccounts", "");
            onUpdate(type, index, "detailed1", "");
          }}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">انتخاب گروه حساب</option>
          {accounts.groups?.map((group) => (
            <option key={group._id.toString()} value={group._id.toString()}>
              {group.name}
            </option>
          ))}
        </select>

        <select
          value={entry.totalAccount || ""}
          onChange={(e) => {
            onUpdate(type, index, "totalAccount", e.target.value);
            onUpdate(type, index, "fixedAccounts", "");
            onUpdate(type, index, "detailed1", "");
          }}
          disabled={!entry.accountGroup}
          className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
        >
          <option value="">انتخاب حساب کل</option>
          {accounts.totals
            ?.filter((total) => {
              console.log(
                "Filtering total:",
                total,
                "against accountGroup:",
                entry.accountGroup
              );
              const totalAccountGroupId = typeof total.accountGroup === 'object' ? total.accountGroup._id : total.accountGroup;
              return (
                totalAccountGroupId === entry.accountGroup ||
                total.accountGroup === entry.accountGroup
              );
            })
            .map((total) => (
              <option key={total._id.toString()} value={total._id.toString()}>
                {total.name}
              </option>
            ))}
        </select>

        <select
          value={entry.fixedAccounts || ""}
          onChange={(e) => {
            onUpdate(type, index, "fixedAccounts", e.target.value);
            onUpdate(type, index, "detailed1", "");
          }}
          disabled={!entry.totalAccount}
          className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
        >
          <option value="">انتخاب حساب معین</option>
          {accounts.fixed
            ?.filter((fixed) => {
              const fixedTotalAccountId = typeof fixed.totalAccount === 'object' ? fixed.totalAccount._id : fixed.totalAccount;
              return (
                fixedTotalAccountId === entry.totalAccount ||
                fixed.totalAccount === entry.totalAccount
              );
            })
            .map((fixed) => (
              <option key={fixed._id.toString()} value={fixed._id.toString()}>
                {fixed.name}
              </option>
            ))}
        </select>

        <select
          value={entry.detailed1 || ""}
          onChange={(e) => onUpdate(type, index, "detailed1", e.target.value)}
          disabled={!entry.fixedAccounts}
          className="w-full p-2 border rounded text-sm disabled:bg-gray-200"
        >
          <option value="">انتخاب حساب تفصیلی</option>
          {accounts.detailed?.map((detailed) => (
            <option key={detailed._id.toString()} value={detailed._id.toString()}>
              {detailed.name}
            </option>
          ))}
        </select>

        <div>
          <label className="block text-sm font-medium mb-1">فیلد مبلغ:</label>
          <div className="flex flex-wrap gap-1 p-2 bg-gray-100 rounded border min-h-[40px] mb-2">
            {getAvailableFields().map((field) => (
              <div
                key={field}
                onClick={() => onUpdate(type, index, "amountField", field)}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  entry.amountField === field
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-100"
                }`}
              >
                {field}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={entry.amountField || ""}
            onChange={(e) =>
              onUpdate(type, index, "amountField", e.target.value)
            }
            className="w-full p-2 border rounded text-sm"
            placeholder="یا فیلد دلخواه بنویسید"
          />
        </div>

        <div className="border-t pt-2">
          <label className="block text-sm font-medium mb-1">توضیحات:</label>
          <DescriptionMaker
            workflow={workflow}
            value={entry.descriptionTemplate || ""}
            onChange={(value) =>
              onUpdate(type, index, "descriptionTemplate", value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
