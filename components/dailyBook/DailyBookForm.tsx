"use client";

import React, { useState, useEffect } from "react";
import { useDailyBook } from "@/contexts/DailyBookContext";
import { useFiscalYear } from "@/contexts/FiscalYearContext";
import toast from "react-hot-toast";
import { DateObject } from "react-multi-date-picker";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { generateNextDocumentNumber } from "@/services/documentNumber";
import { IFixedAccount, ITotalAccount } from "@/types/models";
import { TypeOfDailyBookType, DailyBook } from "@/types/finalTypes";
import FormattedNumberInput from "@/utils/FormattedNumberInput";

interface DailyBookFormProps {
  onSuccess?: () => void;
  initialData?: DailyBook;
  userId: string;
  fiscalYearId?: string;
}

const DailyBookForm: React.FC<DailyBookFormProps> = ({
  onSuccess,
  // userId,
  // fiscalYearId
}) => {
  const {
    accountGroups,
    totalAccounts,
    fixedAccounts,
    detailedAccounts,
    loading,
    createDailyBook,
  } = useDailyBook();

  const { selectedFiscalYear, resetFiscalYear } = useFiscalYear();

  // Fetch typeOfDailyBook data and generate document number
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/typeOfDailyBook");
        const data = await response.json();
        setTypeOfDailyBooks(data.typeOfDailyBooks || []);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    const generateDocNumber = async () => {
      const docNumber = await generateNextDocumentNumber();
      setDocumentNumber(docNumber);
    };

    fetchTypes();
    generateDocNumber();
  }, []);

  // Handle type selection
  const handleTypeChange = (typeId: string) => {
    setSelectedTypeOfDailyBook(typeId);
    const type = typeOfDailyBooks.find((t) => t._id === typeId);
    setSelectedType(type || null);
  };

  // Form state
  const [documentNumber, setDocumentNumber] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [description, setDescription] = useState("");
  const [selectedTypeOfDailyBook, setSelectedTypeOfDailyBook] = useState("");
  const [typeOfDailyBooks, setTypeOfDailyBooks] = useState<
    TypeOfDailyBookType[]
  >([]);
  const [selectedType, setSelectedType] = useState<TypeOfDailyBookType | null>(
    null
  );

  // Debit entry state
  const [debitAccountGroup, setDebitAccountGroup] = useState("");
  const [debitTotalAccount, setDebitTotalAccount] = useState("");
  const [debitFixedAccount, setDebitFixedAccount] = useState("");
  const [debitDetailed1, setDebitDetailed1] = useState("");
  const [debitDetailed2, setDebitDetailed2] = useState("");
  const [debitAmount, setDebitAmount] = useState<number>(0);
  const [debitDescription, setDebitDescription] = useState("");
  const [showDebitDetailed, setShowDebitDetailed] = useState(false);

  // Credit entry state
  const [creditAccountGroup, setCreditAccountGroup] = useState("");
  const [creditTotalAccount, setCreditTotalAccount] = useState("");
  const [creditFixedAccount, setCreditFixedAccount] = useState("");
  const [creditDetailed1, setCreditDetailed1] = useState("");
  const [creditDetailed2, setCreditDetailed2] = useState("");
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditDescription, setCreditDescription] = useState("");
  const [showCreditDetailed, setShowCreditDetailed] = useState(false);

  // Dynamic rows state
  interface EntryRow {
    id: number;
    accountGroup: string;
    totalAccount: string;
    fixedAccount: string;
    detailed1: string;
    detailed2: string;
    amount: number;
    description: string;
    totalAccountOptions: ITotalAccount[];
    fixedAccountOptions: IFixedAccount[];
  }

  const [debitEntries, setDebitEntries] = useState<EntryRow[]>([
    {
      id: 1,
      accountGroup: "",
      totalAccount: "",
      fixedAccount: "",
      detailed1: "",
      detailed2: "",
      amount: 0,
      description: "",
      totalAccountOptions: [],
      fixedAccountOptions: [],
    },
  ]);
  const [creditEntries, setCreditEntries] = useState<EntryRow[]>([
    {
      id: 1,
      accountGroup: "",
      totalAccount: "",
      fixedAccount: "",
      detailed1: "",
      detailed2: "",
      amount: 0,
      description: "",
      totalAccountOptions: [],
      fixedAccountOptions: [],
    },
  ]);

  // Filtered options for dropdowns
  const [debitTotalAccountOptions, setDebitTotalAccountOptions] = useState<
    ITotalAccount[]
  >([]);
  const [debitFixedAccountOptions, setDebitFixedAccountOptions] = useState<
    IFixedAccount[]
  >([]);
  const [creditTotalAccountOptions, setCreditTotalAccountOptions] = useState<
    ITotalAccount[]
  >([]);
  const [creditFixedAccountOptions, setCreditFixedAccountOptions] = useState<
    IFixedAccount[]
  >([]);

  // Handle account group selection for debit
  const handleDebitAccountGroupChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const groupId = e.target.value;
    setDebitAccountGroup(groupId);

    // Filter total accounts for the selected group
    const filteredTotalAccounts = totalAccounts.filter(
      (account) =>
        account.accountGroup && account.accountGroup._id.toString() === groupId
    );

    setDebitTotalAccountOptions(filteredTotalAccounts);
    setDebitTotalAccount(""); // Reset total account selection
    setDebitFixedAccount(""); // Reset fixed account selection
  };

  // Handle total account selection for debit
  const handleDebitTotalAccountChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const totalId = e.target.value;
    setDebitTotalAccount(totalId);

    // Filter fixed accounts for the selected total account
    const filteredFixedAccounts = fixedAccounts.filter(
      (account) =>
        account.totalAccount && account.totalAccount._id.toString() === totalId
    );

    setDebitFixedAccountOptions(filteredFixedAccounts);
    setDebitFixedAccount(""); // Reset fixed account selection
  };

  // Handle account group selection for credit
  const handleCreditAccountGroupChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const groupId = e.target.value;
    setCreditAccountGroup(groupId);

    // Filter total accounts for the selected group
    const filteredTotalAccounts = totalAccounts.filter(
      (account) =>
        account.accountGroup && account.accountGroup._id.toString() === groupId
    );

    setCreditTotalAccountOptions(filteredTotalAccounts);
    setCreditTotalAccount(""); // Reset total account selection
    setCreditFixedAccount(""); // Reset fixed account selection
  };

  // Handle total account selection for credit
  const handleCreditTotalAccountChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const totalId = e.target.value;
    setCreditTotalAccount(totalId);

    // Filter fixed accounts for the selected total account
    const filteredFixedAccounts = fixedAccounts.filter(
      (account) =>
        account.totalAccount && account.totalAccount._id.toString() === totalId
    );

    setCreditFixedAccountOptions(filteredFixedAccounts);
    setCreditFixedAccount(""); // Reset fixed account selection
  };

  // Add new debit row
  const addDebitRow = () => {
    const newId = Math.max(...debitEntries.map((row) => row.id)) + 1;
    setDebitEntries([
      ...debitEntries,
      {
        id: newId,
        accountGroup: "",
        totalAccount: "",
        fixedAccount: "",
        detailed1: "",
        detailed2: "",
        amount: 0,
        description: "",
        totalAccountOptions: [],
        fixedAccountOptions: [],
      },
    ]);
  };

  // Add new credit row
  const addCreditRow = () => {
    const newId = Math.max(...creditEntries.map((row) => row.id)) + 1;
    setCreditEntries([
      ...creditEntries,
      {
        id: newId,
        accountGroup: "",
        totalAccount: "",
        fixedAccount: "",
        detailed1: "",
        detailed2: "",
        amount: 0,
        description: "",
        totalAccountOptions: [],
        fixedAccountOptions: [],
      },
    ]);
  };

  // Delete debit row
  const deleteDebitRow = (id: number) => {
    setDebitEntries(debitEntries.filter((entry) => entry.id !== id));
  };

  // Delete credit row
  const deleteCreditRow = (id: number) => {
    setCreditEntries(creditEntries.filter((entry) => entry.id !== id));
  };

  // Handle dynamic debit entry changes
  const handleDebitEntryChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setDebitEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          if (field === "accountGroup") {
            const filteredTotalAccounts = totalAccounts.filter(
              (account) =>
                account.accountGroup &&
                account.accountGroup._id.toString() === value
            );
            updated.totalAccountOptions = filteredTotalAccounts;
            updated.totalAccount = "";
            updated.fixedAccount = "";
            updated.fixedAccountOptions = [];
          } else if (field === "totalAccount") {
            const filteredFixedAccounts = fixedAccounts.filter(
              (account) =>
                account.totalAccount &&
                account.totalAccount._id.toString() === value
            );
            updated.fixedAccountOptions = filteredFixedAccounts;
            updated.fixedAccount = "";
          }
          return updated;
        }
        return entry;
      })
    );
  };

  // Handle dynamic credit entry changes
  const handleCreditEntryChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setCreditEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          if (field === "accountGroup") {
            const filteredTotalAccounts = totalAccounts.filter(
              (account) =>
                account.accountGroup &&
                account.accountGroup._id.toString() === value
            );
            updated.totalAccountOptions = filteredTotalAccounts;
            updated.totalAccount = "";
            updated.fixedAccount = "";
            updated.fixedAccountOptions = [];
          } else if (field === "totalAccount") {
            const filteredFixedAccounts = fixedAccounts.filter(
              (account) =>
                account.totalAccount &&
                account.totalAccount._id.toString() === value
            );
            updated.fixedAccountOptions = filteredFixedAccounts;
            updated.fixedAccount = "";
          }
          return updated;
        }
        return entry;
      })
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !documentNumber ||
      !date ||
      !description ||
      !selectedFiscalYear ||
      !debitAccountGroup ||
      !debitTotalAccount ||
      !debitFixedAccount ||
      !debitAmount ||
      !debitDescription ||
      !creditAccountGroup ||
      !creditTotalAccount ||
      !creditFixedAccount ||
      !creditAmount ||
      !creditDescription ||
      !selectedType
    ) {
      toast.error("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    // Calculate total debit and credit amounts
    const totalDebit =
      debitAmount +
      debitEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const totalCredit =
      creditAmount +
      creditEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    // Collect debit entries
    const debitEntriesData = [
      // Main debit entry
      {
        accountGroup: debitAccountGroup,
        totalAccount: debitTotalAccount,
        fixedAccounts: debitFixedAccount,
        detailed1: debitDetailed1 || undefined,
        detailed2: debitDetailed2 || undefined,
        amount: debitAmount,
        description: debitDescription,
        fiscalYear: selectedFiscalYear?._id,
      },
      // Additional debit entries - include ALL entries, not just slice(1)
      ...debitEntries
        .filter(
          (entry) =>
            entry.accountGroup &&
            entry.totalAccount &&
            entry.fixedAccount &&
            entry.amount > 0 &&
            entry.description
        )
        .map((entry) => ({
          accountGroup: entry.accountGroup,
          totalAccount: entry.totalAccount,
          fixedAccounts: entry.fixedAccount,
          detailed1: entry.detailed1 || undefined,
          detailed2: entry.detailed2 || undefined,
          amount: entry.amount,
          description: entry.description,
          fiscalYear: selectedFiscalYear?._id,
        })),
    ];

    // Collect credit entries
    const creditEntriesData = [
      // Main credit entry
      {
        accountGroup: creditAccountGroup,
        totalAccount: creditTotalAccount,
        fixedAccounts: creditFixedAccount,
        detailed1: creditDetailed1 || undefined,
        detailed2: creditDetailed2 || undefined,
        amount: creditAmount,
        description: creditDescription,
        fiscalYear: selectedFiscalYear?._id,
      },
      // Additional credit entries - include ALL entries, not just slice(1)
      ...creditEntries
        .filter(
          (entry) =>
            entry.accountGroup &&
            entry.totalAccount &&
            entry.fixedAccount &&
            entry.amount > 0 &&
            entry.description
        )
        .map((entry) => ({
          accountGroup: entry.accountGroup,
          totalAccount: entry.totalAccount,
          fixedAccounts: entry.fixedAccount,
          detailed1: entry.detailed1 || undefined,
          detailed2: entry.detailed2 || undefined,
          amount: entry.amount,
          description: entry.description,
          fiscalYear: selectedFiscalYear?._id,
        })),
    ];

    console.log("📊 Form Submission Data:");
    console.log("Total Debit Amount:", totalDebit);
    console.log("Total Credit Amount:", totalCredit);
    console.log("Debit Entries:", debitEntriesData);
    console.log("Credit Entries:", creditEntriesData);
    console.log("Debit Entries Count:", debitEntriesData.length);
    console.log("Credit Entries Count:", creditEntriesData.length);

    // Create daily book entry
    const dailyBookData = {
      documentNumber,
      type: selectedType.name,
      date,
      description,
      debitEntries: debitEntriesData,
      creditEntries: creditEntriesData,
      entries: [...debitEntriesData, ...creditEntriesData],
      status: "draft",
    };

    // Log the data being sent for debugging
    console.log("Sending data:", JSON.stringify(dailyBookData, null, 2));

    createDailyBook(dailyBookData as Parameters<typeof createDailyBook>[0])
      .then(async (response) => {
        console.log("Success response:", response);
        toast.success("سند حسابداری با موفقیت ثبت شد");

        // Reset form
        const newDocNumber = await generateNextDocumentNumber();
        setDocumentNumber(newDocNumber);
        setDate(new Date());
        setDescription("");
        setSelectedTypeOfDailyBook("");
        setSelectedType(null);
        setDebitAccountGroup("");
        setDebitTotalAccount("");
        setDebitFixedAccount("");
        setDebitDetailed1("");
        setDebitDetailed2("");
        setDebitAmount(0);
        setDebitDescription("");
        setCreditAccountGroup("");
        setCreditTotalAccount("");
        setCreditFixedAccount("");
        setCreditDetailed1("");
        setCreditDetailed2("");
        setCreditAmount(0);
        setCreditDescription("");
        setShowDebitDetailed(false);
        setShowCreditDetailed(false);
        // Reset dynamic entries to initial state
        setDebitEntries([
          {
            id: 1,
            accountGroup: "",
            totalAccount: "",
            fixedAccount: "",
            detailed1: "",
            detailed2: "",
            amount: 0,
            description: "",
            totalAccountOptions: [],
            fixedAccountOptions: [],
          },
        ]);
        setCreditEntries([
          {
            id: 1,
            accountGroup: "",
            totalAccount: "",
            fixedAccount: "",
            detailed1: "",
            detailed2: "",
            amount: 0,
            description: "",
            totalAccountOptions: [],
            fixedAccountOptions: [],
          },
        ]);

        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        console.log("Error details:", error);
        toast.error(`خطا در ثبت سند: ${error.message}`);
      });
  };

  if (loading) {
    return <div className="flex justify-center p-8">در حال بارگذاری...</div>;
  }

  return (
    <div
      className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6"
      dir="rtl"
    >
      <h1 className="text-2xl font-bold text-center mb-6 text-black">
        ثبت سند حسابداری جدید
      </h1>

      {/* Document Info Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع سند
          </label>
          <select
            value={selectedTypeOfDailyBook}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-[7px] border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">انتخاب کنید</option>
            {typeOfDailyBooks.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره سند
          </label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="شماره سند را وارد کنید"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تاریخ سند
          </label>
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-300">
            <FaRegCalendarAlt className="text-gray-400" />
            <DatePicker
              value={date ? new DateObject(date) : null}
              onChange={(dateObj: DateObject | DateObject[] | null) => {
                if (
                  dateObj &&
                  typeof dateObj === "object" &&
                  "toDate" in dateObj
                ) {
                  setDate(dateObj.toDate());
                }
              }}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full bg-transparent   text-black focus:outline-none placeholder:text-gray-400 text-black"
              calendarPosition="bottom-right"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شرح سند
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="شرح سند را وارد کنید"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سال مالی
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1  px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
              {selectedFiscalYear ? selectedFiscalYear.name : "انتخاب نشده"}
            </div>
            <button
              type="button"
              onClick={resetFiscalYear}
              className="px-3 py-3 text-xs bg-yellow-500 text-black rounded-md hover:bg-yellow-600 hover:text-white transition-colors"
            >
              حذف / تغییر
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            برای تغییر سال مالی روی دکمه تغییر کلیک کنید
          </p>
        </div>
      </div>

      {/* Table Headers */}
      <div
        className={`grid gap-2 mb-2 font-bold text-sm text-gray-600 border-b pb-2 ${
          showDebitDetailed ? "grid-cols-15" : "grid-cols-13"
        }`}
      >
        <div className="col-span-1"></div>
        <div className="col-span-2">گروه حساب</div>
        <div className="col-span-2">حساب کل</div>
        <div className="col-span-2 flex items-center gap-2">
          حساب معین
          <button
            type="button"
            onClick={() => setShowDebitDetailed(!showDebitDetailed)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            تفصیلی
          </button>
        </div>
        {showDebitDetailed && (
          <>
            <div className="col-span-1">تفصیلی 1</div>
            <div className="col-span-1">تفصیلی 2</div>
          </>
        )}
        <div className="col-span-2">مبلغ</div>
        <div className="col-span-3">شرح</div>
        <div className="col-span-1">حذف</div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Debit Row */}
        <div
          className={`grid gap-2 mb-4 items-center ${
            showDebitDetailed ? "grid-cols-15" : "grid-cols-13"
          }`}
        >
          <div className="col-span-1 h-full flex flex-row-reverse items-center justify-center gap-1">
            <div className="bg-red-100 text-red-800 h-full flex items-center justify-center px-2 py-4 rounded-r-md border-r-4 border-red-500 w-full">
              <span className="transform -rotate-90 whitespace-nowrap text-sm font-bold">
                بدهکار
              </span>
            </div>
            <button
              type="button"
              onClick={addDebitRow}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-red-600"
            >
              +
            </button>
          </div>

          <div className="col-span-2">
            <select
              value={debitAccountGroup}
              onChange={handleDebitAccountGroupChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">انتخاب کنید</option>
              {accountGroups && accountGroups.length > 0 ? (
                accountGroups.map((group) => (
                  <option
                    key={`debit-group-${group._id}`}
                    value={group._id.toString()}
                  >
                    {group.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  گروه حساب موجود نیست
                </option>
              )}
            </select>
          </div>

          <div className="col-span-2">
            <select
              value={debitTotalAccount}
              onChange={handleDebitTotalAccountChange}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!debitAccountGroup}
              required
            >
              <option value="">انتخاب کنید</option>
              {debitTotalAccountOptions &&
              debitTotalAccountOptions.length > 0 ? (
                debitTotalAccountOptions.map((account) => (
                  <option
                    key={`debit-total-${account._id}`}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  حساب کل موجود نیست
                </option>
              )}
            </select>
          </div>

          <div className="col-span-2">
            <select
              value={debitFixedAccount}
              onChange={(e) => setDebitFixedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!debitTotalAccount}
              required
            >
              <option value="">انتخاب کنید</option>
              {debitFixedAccountOptions &&
              debitFixedAccountOptions.length > 0 ? (
                debitFixedAccountOptions.map((account) => (
                  <option
                    key={`debit-fixed-${account._id}`}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  حساب معین موجود نیست
                </option>
              )}
            </select>
          </div>
          {showDebitDetailed && (
            <>
              <div className="col-span-1">
                <select
                  value={debitDetailed1}
                  onChange={(e) => setDebitDetailed1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب</option>
                  {detailedAccounts?.map((account) => (
                    <option
                      key={account._id.toString()}
                      value={account._id.toString()}
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <select
                  value={debitDetailed2}
                  onChange={(e) => setDebitDetailed2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب</option>
                  {detailedAccounts?.map((account) => (
                    <option
                      key={account._id.toString()}
                      value={account._id.toString()}
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="col-span-2">
            <FormattedNumberInput
              value={debitAmount}
              onChange={(amount) => setDebitAmount(amount)}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مبلغ"
            />
          </div>

          <div className="col-span-3">
            {selectedType &&
            selectedType.debitSampleDescriptions &&
            selectedType.debitSampleDescriptions.length > 0 ? (
              <select
                value={debitDescription}
                onChange={(e) => setDebitDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">انتخاب کنید</option>
                {selectedType.debitSampleDescriptions!.map(
                  (desc: string, index: number) => (
                    <option key={index} value={desc}>
                      {desc}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                type="text"
                value={debitDescription}
                onChange={(e) => setDebitDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="شرح بدهکار"
                required
              />
            )}
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Additional Debit Rows */}
        {debitEntries.slice(1).map((entry) => (
          <div
            key={`debit-${entry.id}`}
            className={`grid gap-2 mb-4 items-center ${
              showDebitDetailed ? "grid-cols-15" : "grid-cols-13"
            }`}
          >
            <div className="col-span-1"></div>
            <div className="col-span-2">
              <select
                value={entry.accountGroup}
                onChange={(e) =>
                  handleDebitEntryChange(
                    entry.id,
                    "accountGroup",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {accountGroups?.map((group) => (
                  <option
                    key={group._id.toString()}
                    value={group._id.toString()}
                  >
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select
                value={entry.totalAccount}
                onChange={(e) =>
                  handleDebitEntryChange(
                    entry.id,
                    "totalAccount",
                    e.target.value
                  )
                }
                disabled={!entry.accountGroup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {entry.totalAccountOptions?.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select
                value={entry.fixedAccount}
                onChange={(e) =>
                  handleDebitEntryChange(
                    entry.id,
                    "fixedAccount",
                    e.target.value
                  )
                }
                disabled={!entry.totalAccount}
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {entry.fixedAccountOptions?.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            {showDebitDetailed && (
              <>
                <div className="col-span-1">
                  <select
                    value={entry.detailed1}
                    onChange={(e) =>
                      handleDebitEntryChange(
                        entry.id,
                        "detailed1",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">انتخاب</option>
                    {detailedAccounts?.map((account) => (
                      <option
                        key={account._id.toString()}
                        value={account._id.toString()}
                      >
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <select
                    value={entry.detailed2}
                    onChange={(e) =>
                      handleDebitEntryChange(
                        entry.id,
                        "detailed2",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">انتخاب</option>
                    {detailedAccounts?.map((account) => (
                      <option
                        key={account._id.toString()}
                        value={account._id.toString()}
                      >
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="col-span-2">
              <FormattedNumberInput
                value={entry.amount}
                onChange={(amount) =>
                  handleDebitEntryChange(entry.id, "amount", amount)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مبلغ"
              />
            </div>
            <div className="col-span-3">
              {selectedType &&
              selectedType.debitSampleDescriptions &&
              selectedType.debitSampleDescriptions.length > 0 ? (
                <select
                  value={entry.description}
                  onChange={(e) =>
                    handleDebitEntryChange(
                      entry.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید</option>
                  {selectedType.debitSampleDescriptions!.map(
                    (desc: string, index: number) => (
                      <option key={index} value={desc}>
                        {desc}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) =>
                    handleDebitEntryChange(
                      entry.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="شرح بدهکار"
                />
              )}
            </div>
            <div className="col-span-1">
              <button
                type="button"
                onClick={() => deleteDebitRow(entry.id)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Credit Header */}
        <div
          className={`grid gap-2 mb-2 font-bold text-sm text-gray-600 border-b pb-2 ${
            showCreditDetailed ? "grid-cols-15" : "grid-cols-13"
          }`}
        >
          <div className="col-span-1"></div>
          <div className="col-span-2">گروه حساب</div>
          <div className="col-span-2">حساب کل</div>
          <div className="col-span-2 flex items-center gap-2">
            حساب معین
            <button
              type="button"
              onClick={() => setShowCreditDetailed(!showCreditDetailed)}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              تفصیلی
            </button>
          </div>
          {showCreditDetailed && (
            <>
              <div className="col-span-1">تفصیلی 1</div>
              <div className="col-span-1">تفصیلی 2</div>
            </>
          )}
          <div className="col-span-2">مبلغ</div>
          <div className="col-span-3">شرح</div>
        </div>

        {/* Credit Row */}
        <div
          className={`grid gap-2 mb-6 items-center ${
            showCreditDetailed ? "grid-cols-15" : "grid-cols-13"
          }`}
        >
          <div className="col-span-1 h-full flex flex-row-reverse items-center justify-center gap-1">
            <div className="bg-green-100 text-green-800 h-full flex items-center justify-center px-2 py-4 rounded-r-md border-r-4 border-green-500 w-full">
              <span className="transform -rotate-90 whitespace-nowrap text-sm font-bold">
                بستانکار
              </span>
            </div>
            <button
              type="button"
              onClick={addCreditRow}
              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-green-600"
            >
              +
            </button>
          </div>

          <div className="col-span-2">
            <select
              value={creditAccountGroup}
              onChange={handleCreditAccountGroupChange}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">انتخاب کنید</option>
              {accountGroups && accountGroups.length > 0 ? (
                accountGroups.map((group) => (
                  <option
                    key={`credit-group-${group._id}`}
                    value={group._id.toString()}
                  >
                    {group.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  گروه حساب موجود نیست
                </option>
              )}
            </select>
          </div>

          <div className="col-span-2">
            <select
              value={creditTotalAccount}
              onChange={handleCreditTotalAccountChange}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!creditAccountGroup}
              required
            >
              <option value="">انتخاب کنید</option>
              {creditTotalAccountOptions &&
              creditTotalAccountOptions.length > 0 ? (
                creditTotalAccountOptions.map((account) => (
                  <option
                    key={`credit-total-${account._id}`}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  حساب کل موجود نیست
                </option>
              )}
            </select>
          </div>

          <div className="col-span-2">
            <select
              value={creditFixedAccount}
              onChange={(e) => setCreditFixedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!creditTotalAccount}
              required
            >
              <option value="">انتخاب کنید</option>
              {creditFixedAccountOptions &&
              creditFixedAccountOptions.length > 0 ? (
                creditFixedAccountOptions.map((account) => (
                  <option
                    key={`credit-fixed-${account._id}`}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  حساب معین موجود نیست
                </option>
              )}
            </select>
          </div>
          {showCreditDetailed && (
            <>
              <div className="col-span-1">
                <select
                  value={creditDetailed1}
                  onChange={(e) => setCreditDetailed1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب</option>
                  {detailedAccounts?.map((account) => (
                    <option
                      key={account._id.toString()}
                      value={account._id.toString()}
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <select
                  value={creditDetailed2}
                  onChange={(e) => setCreditDetailed2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب</option>
                  {detailedAccounts?.map((account) => (
                    <option
                      key={account._id.toString()}
                      value={account._id.toString()}
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="col-span-2">
            <FormattedNumberInput
              value={creditAmount}
              onChange={(amount) => setCreditAmount(amount)}
              className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مبلغ"
            />
          </div>

          <div className="col-span-3">
            {selectedType &&
            selectedType.creditSampleDescriptions &&
            selectedType.creditSampleDescriptions.length > 0 ? (
              <select
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">انتخاب کنید</option>
                {selectedType.creditSampleDescriptions!.map(
                  (desc: string, index: number) => (
                    <option key={index} value={desc}>
                      {desc}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                type="text"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="شرح بستانکار"
                required
              />
            )}
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Additional Credit Rows */}
        {creditEntries.slice(1).map((entry) => (
          <div
            key={`credit-${entry.id}`}
            className={`grid gap-2 mb-6 items-center ${
              showCreditDetailed ? "grid-cols-15" : "grid-cols-13"
            }`}
          >
            <div className="col-span-1"></div>
            <div className="col-span-2">
              <select
                value={entry.accountGroup}
                onChange={(e) =>
                  handleCreditEntryChange(
                    entry.id,
                    "accountGroup",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {accountGroups?.map((group) => (
                  <option
                    key={group._id.toString()}
                    value={group._id.toString()}
                  >
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select
                value={entry.totalAccount}
                onChange={(e) =>
                  handleCreditEntryChange(
                    entry.id,
                    "totalAccount",
                    e.target.value
                  )
                }
                disabled={!entry.accountGroup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {entry.totalAccountOptions?.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select
                value={entry.fixedAccount}
                onChange={(e) =>
                  handleCreditEntryChange(
                    entry.id,
                    "fixedAccount",
                    e.target.value
                  )
                }
                disabled={!entry.totalAccount}
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {entry.fixedAccountOptions?.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            {showCreditDetailed && (
              <>
                <div className="col-span-1">
                  <select
                    value={entry.detailed1}
                    onChange={(e) =>
                      handleCreditEntryChange(
                        entry.id,
                        "detailed1",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">انتخاب</option>
                    {detailedAccounts?.map((account) => (
                      <option
                        key={account._id.toString()}
                        value={account._id.toString()}
                      >
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <select
                    value={entry.detailed2}
                    onChange={(e) =>
                      handleCreditEntryChange(
                        entry.id,
                        "detailed2",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">انتخاب</option>
                    {detailedAccounts?.map((account) => (
                      <option
                        key={account._id.toString()}
                        value={account._id.toString()}
                      >
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="col-span-2">
              <FormattedNumberInput
                value={entry.amount}
                onChange={(amount) =>
                  handleCreditEntryChange(entry.id, "amount", amount)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مبلغ"
              />
            </div>
            <div className="col-span-3">
              {selectedType &&
              selectedType.creditSampleDescriptions &&
              selectedType.creditSampleDescriptions.length > 0 ? (
                <select
                  value={entry.description}
                  onChange={(e) =>
                    handleCreditEntryChange(
                      entry.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">انتخاب کنید</option>
                  {selectedType.creditSampleDescriptions!.map(
                    (desc: string, index: number) => (
                      <option key={index} value={desc}>
                        {desc}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) =>
                    handleCreditEntryChange(
                      entry.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="شرح بستانکار"
                />
              )}
            </div>
            <div className="col-span-1">
              <button
                type="button"
                onClick={() => deleteCreditRow(entry.id)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Document Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-100 p-3 rounded">
              <div className="text-sm text-gray-600">مجموع بدهکار</div>
              <div className="text-lg font-bold text-red-700">
                {(
                  debitAmount +
                  debitEntries.reduce(
                    (sum, entry) => sum + (entry.amount || 0),
                    0
                  )
                ).toLocaleString()}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <div className="text-sm text-gray-600">مجموع بستانکار</div>
              <div className="text-lg font-bold text-green-700">
                {(
                  creditAmount +
                  creditEntries.reduce(
                    (sum, entry) => sum + (entry.amount || 0),
                    0
                  )
                ).toLocaleString()}
              </div>
            </div>
            <div
              className={`p-3 rounded ${
                Math.abs(
                  debitAmount +
                    debitEntries.reduce(
                      (sum, entry) => sum + (entry.amount || 0),
                      0
                    ) -
                    (creditAmount +
                      creditEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      ))
                ) === 0
                  ? "bg-blue-100"
                  : "bg-yellow-100"
              }`}
            >
              <div className="text-sm text-gray-600">مانده</div>
              <div
                className={`text-lg font-bold ${
                  Math.abs(
                    debitAmount +
                      debitEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      ) -
                      (creditAmount +
                        creditEntries.reduce(
                          (sum, entry) => sum + (entry.amount || 0),
                          0
                        ))
                  ) === 0
                    ? "text-blue-700"
                    : "text-yellow-700"
                }`}
              >
                {Math.abs(
                  debitAmount +
                    debitEntries.reduce(
                      (sum, entry) => sum + (entry.amount || 0),
                      0
                    ) -
                    (creditAmount +
                      creditEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      ))
                ).toLocaleString()}
                {Math.abs(
                  debitAmount +
                    debitEntries.reduce(
                      (sum, entry) => sum + (entry.amount || 0),
                      0
                    ) -
                    (creditAmount +
                      creditEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      ))
                ) === 0
                  ? " (متعادل)"
                  : debitAmount +
                      debitEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      ) >
                    creditAmount +
                      creditEntries.reduce(
                        (sum, entry) => sum + (entry.amount || 0),
                        0
                      )
                  ? " (بدهکار)"
                  : " (بستانکار)"}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            ثبت سند
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyBookForm;
