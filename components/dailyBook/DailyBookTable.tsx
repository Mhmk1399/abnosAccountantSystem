"use client";

import React, { useState, useEffect } from "react";
import { useDailyBook } from "@/contexts/DailyBookContext";
import { FaSearch, FaCalendarAlt, FaFileExcel } from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { DateObject } from "react-multi-date-picker";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useTableToPng } from "@/hooks/useTableToPng";

interface DailyBookEntry {
  _id?: string;
  accountGroup: string;
  totalAccount: string;
  fixedAccounts: string;
  amount: number;
  description: string;
  detailed1?: string;
  detailed2?: string;
}

interface DailyBook {
  _id?: string;
  documentNumber: string;
  date: Date | string;
  description: string;
  type?: string;
  debitEntries?: DailyBookEntry[];
  creditEntries?: DailyBookEntry[];
}

type TableRowData = Record<
  string,
  string | number | boolean | null | undefined
>;

interface ExtendedEntry extends DailyBookEntry {
  entryType: "debit" | "credit";
}

interface DailyBookTableProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const DailyBookTable: React.FC<DailyBookTableProps> = ({
  onEdit,
  // onDelete,
}) => {
  const {
    dailyBooks,
    accountGroups,
    totalAccounts,
    fixedAccounts,
    detailedAccounts,
    loading,
    deleteDailyBook,
  } = useDailyBook();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedAccountGroup, setSelectedAccountGroup] = useState("");
  const [selectedTotalAccount, setSelectedTotalAccount] = useState("");
  const [selectedFixedAccount, setSelectedFixedAccount] = useState("");
  const [selectedDetailedAccount, setSelectedDetailedAccount] = useState("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");

  // State for expandable rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // State for row selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [deleteDocNumber, setDeleteDocNumber] = useState("");

  // PNG export hook
  const {
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error: pngError,
  } = useTableToPng();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);

  // Filtered data
  const [filteredData, setFilteredData] = useState(dailyBooks);

  // Apply filters
  useEffect(() => {
    if (dailyBooks[0]?.entries) {
    }

    let filtered = [...dailyBooks];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter((book) => {
        const docMatch = book.documentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const descMatch = book.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const debitMatch =
          book.debitEntries?.some((entry: DailyBookEntry) =>
            entry.description.toLowerCase().includes(searchTerm.toLowerCase())
          ) || false;
        const creditMatch =
          book.creditEntries?.some((entry: DailyBookEntry) =>
            entry.description.toLowerCase().includes(searchTerm.toLowerCase())
          ) || false;
        return docMatch || descMatch || debitMatch || creditMatch;
      });
    }

    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter((book) => {
        const bookDate = new Date(book.date);
        return bookDate >= startDate && bookDate <= endDate;
      });
    }

    // Account filters
    if (selectedAccountGroup) {
      filtered = filtered.filter((book) => {
        const debitMatch =
          book.debitEntries?.some(
            (entry: DailyBookEntry) =>
              entry.accountGroup === selectedAccountGroup
          ) || false;
        const creditMatch =
          book.creditEntries?.some(
            (entry: DailyBookEntry) =>
              entry.accountGroup === selectedAccountGroup
          ) || false;
        return debitMatch || creditMatch;
      });
    }

    if (selectedTotalAccount) {
      filtered = filtered.filter((book) => {
        const debitMatch =
          book.debitEntries?.some(
            (entry: DailyBookEntry) =>
              entry.totalAccount === selectedTotalAccount
          ) || false;
        const creditMatch =
          book.creditEntries?.some(
            (entry: DailyBookEntry) =>
              entry.totalAccount === selectedTotalAccount
          ) || false;
        return debitMatch || creditMatch;
      });
    }

    if (selectedFixedAccount) {
      filtered = filtered.filter((book) => {
        const debitMatch =
          book.debitEntries?.some(
            (entry: DailyBookEntry) =>
              entry.fixedAccounts === selectedFixedAccount
          ) || false;
        const creditMatch =
          book.creditEntries?.some(
            (entry: DailyBookEntry) =>
              entry.fixedAccounts === selectedFixedAccount
          ) || false;
        return debitMatch || creditMatch;
      });
    }

    if (selectedDetailedAccount) {
      filtered = filtered.filter((book) => {
        const debitMatch =
          book.debitEntries?.some(
            (entry: DailyBookEntry) =>
              entry.detailed1 === selectedDetailedAccount ||
              entry.detailed2 === selectedDetailedAccount
          ) || false;
        const creditMatch =
          book.creditEntries?.some(
            (entry: DailyBookEntry) =>
              entry.detailed1 === selectedDetailedAccount ||
              entry.detailed2 === selectedDetailedAccount
          ) || false;
        return debitMatch || creditMatch;
      });
    }

    // Amount range filter
    if (minAmount !== "" || maxAmount !== "") {
      filtered = filtered.filter((book) => {
        const debitMatch =
          book.debitEntries?.some((entry: DailyBookEntry) => {
            const amount = entry.amount;
            const minCheck = minAmount === "" || Number(amount) >= minAmount;
            const maxCheck = maxAmount === "" || Number(amount) <= maxAmount;
            return minCheck && maxCheck;
          }) || false;
        const creditMatch =
          book.creditEntries?.some((entry: DailyBookEntry) => {
            const amount = entry.amount;
            const minCheck = minAmount === "" || Number(amount) >= minAmount;
            const maxCheck = maxAmount === "" || Number(amount) <= maxAmount;
            return minCheck && maxCheck;
          }) || false;
        return debitMatch || creditMatch;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    JSON.stringify(dailyBooks),
    searchTerm,
    startDate,
    endDate,
    selectedAccountGroup,
    selectedTotalAccount,
    selectedFixedAccount,
    selectedDetailedAccount,
    minAmount,
    maxAmount,
  ]);

  // Pagination calculations
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (records: number) => {
    setRecordsPerPage(records);
    setCurrentPage(1);
  };

  // Format date function
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date).toLocaleDateString("fa-IR");
    return d;
  };

  // Handle row selection
  const handleSelectRow = (bookId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((book) => book._id || "")));
    }
  };

  // PNG export functions
  const handleTablePng = () => {
    const originalExpanded = new Set(expandedRows);
    setExpandedRows(new Set(paginatedData.map((book) => book._id || "")));

    setTimeout(() => {
      const headers = [
        "ردیف",
        "شماره سند",
        "تاریخ",
        "شرح سند",
        "نوع",
        "حساب",
        "بدهکار",
        "بستانکار",
        "شرح",
      ];
      const tableData: TableRowData[] = [];

      paginatedData.forEach((book, idx) => {
        const { totalDebit, totalCredit, balance } = calculateDocumentBalance(
          book.debitEntries || [],
          book.creditEntries || []
        );

        tableData.push({
          index: startIndex + idx + 1,
          documentNumber: book.documentNumber,
          date: formatDate(book.date),
          description: book.description,
          type: book.type || "-",
          account: "خلاصه سند",
          debit: totalDebit.toLocaleString(),
          credit: totalCredit.toLocaleString(),
          entryDescription: `مانده: ${Math.abs(balance).toLocaleString()}${
            balance === 0
              ? " (متعادل)"
              : balance > 0
              ? " (بدهکار)"
              : " (بستانکار)"
          }`,
        });

        const allEntries: ExtendedEntry[] = [
          ...(book.debitEntries || []).map((entry: DailyBookEntry) => ({
            ...entry,
            entryType: "debit" as const,
          })),
          ...(book.creditEntries || []).map((entry: DailyBookEntry) => ({
            ...entry,
            entryType: "credit" as const,
          })),
        ];

        allEntries.forEach((entry: ExtendedEntry) => {
          const accountInfo = `${getAccountName(
            entry.accountGroup,
            "group"
          )} > ${getAccountName(
            entry.totalAccount,
            "total"
          )} > ${getAccountName(entry.fixedAccounts, "fixed")}`;
          tableData.push({
            index: "",
            documentNumber: "",
            date: "",
            description: "",
            type: entry.entryType === "debit" ? "بدهکار" : "بستانکار",
            account: accountInfo,
            debit:
              entry.entryType === "debit" ? entry.amount.toLocaleString() : "-",
            credit:
              entry.entryType === "credit"
                ? entry.amount.toLocaleString()
                : "-",
            entryDescription: entry.description,
          });
        });
      });

      generateTablePng(tableData, headers, {
        filename: `daily-book-detailed-${Date.now()}.png`,
        backgroundColor: "#ffffff",
      });

      setTimeout(() => setExpandedRows(originalExpanded), 100);
    }, 100);
  };

  const handleSelectedRowsPng = () => {
    const originalExpanded = new Set(expandedRows);
    const selectedBooks = paginatedData.filter((book) =>
      selectedRows.has(book._id || "")
    );
    setExpandedRows(new Set(selectedBooks.map((book) => book._id || "")));

    setTimeout(() => {
      const headers = [
        "ردیف",
        "شماره سند",
        "تاریخ",
        "شرح سند",
        "نوع",
        "حساب",
        "بدهکار",
        "بستانکار",
        "شرح",
      ];
      const tableData: TableRowData[] = [];

      selectedBooks.forEach((book, idx) => {
        const { totalDebit, totalCredit, balance } = calculateDocumentBalance(
          book.debitEntries || [],
          book.creditEntries || []
        );

        tableData.push({
          index: idx + 1,
          documentNumber: book.documentNumber,
          date: formatDate(book.date),
          description: book.description,
          type: book.type || "-",
          account: "خلاصه سند",
          debit: totalDebit.toLocaleString(),
          credit: totalCredit.toLocaleString(),
          entryDescription: `مانده: ${Math.abs(balance).toLocaleString()}${
            balance === 0
              ? " (متعادل)"
              : balance > 0
              ? " (بدهکار)"
              : " (بستانکار)"
          }`,
        });

        const allEntries: ExtendedEntry[] = [
          ...(book.debitEntries || []).map((entry: DailyBookEntry) => ({
            ...entry,
            entryType: "debit" as const,
          })),
          ...(book.creditEntries || []).map((entry: DailyBookEntry) => ({
            ...entry,
            entryType: "credit" as const,
          })),
        ];

        allEntries.forEach((entry: ExtendedEntry) => {
          const accountInfo = `${getAccountName(
            entry.accountGroup,
            "group"
          )} > ${getAccountName(
            entry.totalAccount,
            "total"
          )} > ${getAccountName(entry.fixedAccounts, "fixed")}`;
          tableData.push({
            index: "",
            documentNumber: "",
            date: "",
            description: "",
            type: entry.entryType === "debit" ? "بدهکار" : "بستانکار",
            account: accountInfo,
            debit:
              entry.entryType === "debit" ? entry.amount.toLocaleString() : "-",
            credit:
              entry.entryType === "credit"
                ? entry.amount.toLocaleString()
                : "-",
            entryDescription: entry.description,
          });
        });
      });

      generateSelectedRowsPng(tableData, headers, {
        filename: `daily-book-selected-detailed-${Date.now()}.png`,
        backgroundColor: "#ffffff",
      });

      setTimeout(() => setExpandedRows(originalExpanded), 100);
    }, 100);
  };

  const handleRowPng = (book: DailyBook) => {
    const originalExpanded = new Set(expandedRows);
    setExpandedRows(new Set([book._id || ""]));

    setTimeout(() => {
      const headers = [
        "ردیف",
        "شماره سند",
        "تاریخ",
        "شرح سند",
        "نوع",
        "حساب",
        "بدهکار",
        "بستانکار",
        "شرح",
      ];
      const { totalDebit, totalCredit, balance } = calculateDocumentBalance(
        book.debitEntries || [],
        book.creditEntries || []
      );

      const tableData: TableRowData[] = [];

      tableData.push({
        index:
          paginatedData.findIndex((b) => b._id === book._id) + startIndex + 1,
        documentNumber: book.documentNumber,
        date: formatDate(book.date),
        description: book.description,
        type: book.type || "-",
        account: "خلاصه سند",
        debit: totalDebit.toLocaleString(),
        credit: totalCredit.toLocaleString(),
        entryDescription: `مانده: ${Math.abs(balance).toLocaleString()}${
          balance === 0
            ? " (متعادل)"
            : balance > 0
            ? " (بدهکار)"
            : " (بستانکار)"
        }`,
      });

      const allEntries: ExtendedEntry[] = [
        ...(book.debitEntries || []).map((entry: DailyBookEntry) => ({
          ...entry,
          entryType: "debit" as const,
        })),
        ...(book.creditEntries || []).map((entry: DailyBookEntry) => ({
          ...entry,
          entryType: "credit" as const,
        })),
      ];

      allEntries.forEach((entry: ExtendedEntry) => {
        const accountInfo = `${getAccountName(
          entry.accountGroup,
          "group"
        )} > ${getAccountName(entry.totalAccount, "total")} > ${getAccountName(
          entry.fixedAccounts,
          "fixed"
        )}`;
        tableData.push({
          index: "",
          documentNumber: "",
          date: "",
          description: "",
          type: entry.entryType === "debit" ? "بدهکار" : "بستانکار",
          account: accountInfo,
          debit:
            entry.entryType === "debit" ? entry.amount.toLocaleString() : "-",
          credit:
            entry.entryType === "credit" ? entry.amount.toLocaleString() : "-",
          entryDescription: entry.description,
        });
      });

      generateTablePng(tableData, headers, {
        filename: `daily-book-${
          book.documentNumber
        }-detailed-${Date.now()}.png`,
        backgroundColor: "#ffffff",
      });

      setTimeout(() => setExpandedRows(originalExpanded), 100);
    }, 100);
  };

  // Export to Excel
  const exportToExcel = () => {
    const allEntries = filteredData.flatMap((book) => {
      const debitEntries = (book.debitEntries || []).map(
        (entry: DailyBookEntry) => ({
          "شماره سند": book.documentNumber,
          تاریخ: formatDate(book.date),
          "شرح سند": book.description,
          نوع: "بدهکار",
          "گروه حساب": getAccountName(entry.accountGroup, "group"),
          "حساب کل": getAccountName(entry.totalAccount, "total"),
          "حساب معین": getAccountName(entry.fixedAccounts, "fixed"),
          مبلغ: entry.amount,
          شرح: entry.description,
        })
      );

      const creditEntries = (book.creditEntries || []).map(
        (entry: DailyBookEntry) => ({
          "شماره سند": book.documentNumber,
          تاریخ: formatDate(book.date),
          "شرح سند": book.description,
          نوع: "بستانکار",
          "گروه حساب": getAccountName(entry.accountGroup, "group"),
          "حساب کل": getAccountName(entry.totalAccount, "total"),
          "حساب معین": getAccountName(entry.fixedAccounts, "fixed"),
          مبلغ: entry.amount,
          شرح: entry.description,
        })
      );

      return [...debitEntries, ...creditEntries];
    });

    const worksheet = XLSX.utils.json_to_sheet(allEntries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "دفتر روزنامه");
    XLSX.writeFile(workbook, "DailyBook.xlsx");
  };

  // Helper function to get account names
  const getAccountName = (
    id: string,
    type: "group" | "total" | "fixed" | "detailed"
  ) => {
    if (!id) return "";

    switch (type) {
      case "group":
        return (
          accountGroups.find((group) => group._id.toString() === id)?.name || ""
        );
      case "total":
        return (
          totalAccounts.find((account) => account._id.toString() === id)
            ?.name || ""
        );
      case "fixed":
        return (
          fixedAccounts.find((account) => account._id.toString() === id)
            ?.name || ""
        );
      case "detailed":
        return (
          detailedAccounts.find((account) => account._id.toString() === id)
            ?.name || ""
        );
      default:
        return "";
    }
  };

  // Calculate document balance
  const calculateDocumentBalance = (
    debitEntries: DailyBookEntry[],
    creditEntries: DailyBookEntry[]
  ) => {
    const totalDebit = debitEntries.reduce((sum, entry) => {
      return sum + entry.amount;
    }, 0);

    const totalCredit = creditEntries.reduce((sum, entry) => {
      return sum + entry.amount;
    }, 0);

    const balance = totalDebit - totalCredit;

    return { totalDebit, totalCredit, balance };
  };

  // Toggle row expansion
  const toggleRowExpansion = (bookId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedRows(newExpanded);
  };

  // Calculate totals for all filtered data
  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    filteredData.forEach((book) => {
      if (book.debitEntries) {
        book.debitEntries.forEach((entry) => {
          totalDebit += entry.amount;
        });
      }

      if (book.creditEntries) {
        book.creditEntries.forEach((entry) => {
          totalCredit += entry.amount;
        });
      }
    });

    return { totalDebit, totalCredit, balance: totalDebit - totalCredit };
  };
  // Show delete modal
  const handleDeleteClick = (id: string, documentNumber: string) => {
    setDeleteId(id);
    setDeleteDocNumber(documentNumber);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await deleteDailyBook(deleteId);
      toast.success(" حذف سند");
      setShowDeleteModal(false);
      setDeleteId("");
      setDeleteDocNumber("");
    } catch (error) {
      console.error("Error deleting daily book:", error);
      toast.error("خطا در حذف سند");
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteDocNumber("");
  };

  // Edit daily book (placeholder - you can implement edit modal/form)
  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      alert("ویرایش در حال توسعه است");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">در حال بارگذاری...</div>;
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md h-full min-h-[70vh] p-6"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 text-black md:mb-0">
          دفتر روزنامه
        </h2>

        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaFileExcel className="ml-2" />
            خروجی اکسل
          </button>

          <button
            onClick={handleTablePng}
            disabled={isGenerating || paginatedData.length === 0}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
            ) : (
              <HiOutlineDownload className="ml-2" />
            )}
            دانلود جدول (PNG)
          </button>

          <button
            onClick={handleSelectedRowsPng}
            disabled={isGenerating || selectedRows.size === 0}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
            ) : (
              <HiOutlineDownload className="ml-2" />
            )}
            دانلود انتخاب شده ({selectedRows.size})
          </button>
        </div>
      </div>

      {pngError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{pngError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="جستجو..."
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div className="relative w-1/2">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <DatePicker
                value={startDate ? new DateObject(startDate) : null}
                onChange={(dateObj: DateObject | DateObject[] | null) => {
                  if (
                    dateObj &&
                    typeof dateObj === "object" &&
                    "toDate" in dateObj
                  ) {
                    setStartDate(dateObj.toDate());
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="w-full pr-10 px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="از تاریخ"
                calendarPosition="top-left"
              />
            </div>

            <div className="relative w-1/2">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <DatePicker
                value={endDate ? new DateObject(endDate) : null}
                onChange={(dateObj: DateObject | DateObject[] | null) => {
                  if (
                    dateObj &&
                    typeof dateObj === "object" &&
                    "toDate" in dateObj
                  ) {
                    setEndDate(dateObj.toDate());
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="w-full pr-10 px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="تا تاریخ"
                calendarPosition="top-right"
              />
            </div>
          </div>

          {/* Account Group Filter */}
          <div>
            <select
              value={selectedAccountGroup}
              onChange={(e) => setSelectedAccountGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه گروه‌های حساب</option>
              {accountGroups &&
                accountGroups.map((group) => (
                  <option
                    key={group._id.toString()}
                    value={group._id.toString()}
                  >
                    {group.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Total Account Filter */}
          <div>
            <select
              value={selectedTotalAccount}
              onChange={(e) => setSelectedTotalAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه حسابهای کل</option>
              {totalAccounts &&
                totalAccounts.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Fixed Account Filter */}
          <div>
            <select
              value={selectedFixedAccount}
              onChange={(e) => setSelectedFixedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه حسابهای معین</option>
              {fixedAccounts &&
                fixedAccounts.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Detailed Account Filter */}
          <div>
            <select
              value={selectedDetailedAccount}
              onChange={(e) => setSelectedDetailedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">همه حسابهای تفصیلی</option>
              {detailedAccounts &&
                detailedAccounts.map((account) => (
                  <option
                    key={account._id.toString()}
                    value={account._id.toString()}
                  >
                    {account.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount Range Filter */}
          <div className="flex space-x-2 space-x-reverse">
            <input
              type="number"
              value={minAmount}
              onChange={(e) =>
                setMinAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="حداقل مبلغ"
            />
            <input
              type="number"
              value={maxAmount}
              onChange={(e) =>
                setMaxAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="حداکثر مبلغ"
            />
          </div>

          {/* Records per page */}
          <div>
            <select
              value={recordsPerPage}
              onChange={(e) =>
                handleRecordsPerPageChange(Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 رکورد</option>
              <option value={20}>20 رکورد</option>
              <option value={50}>50 رکورد</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStartDate(null);
                setEndDate(null);
                setSelectedAccountGroup("");
                setSelectedTotalAccount("");
                setSelectedFixedAccount("");
                setSelectedDetailedAccount("");
                setMinAmount("");
                setMaxAmount("");
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" id="capture-area">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="px-4 py-2 border">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-2 border">ردیف</th>
              <th className="px-4 py-2 border">شماره سند</th>
              <th className="px-4 py-2 border">تاریخ</th>
              <th className="px-4 py-2 border">شرح سند</th>
              <th className="px-4 py-2 border">نوع</th>
              <th className="px-4 py-2 border">حساب</th>
              <th className="px-4 py-2 border">بدهکار</th>
              <th className="px-4 py-2 border">بستانکار</th>
              <th className="px-4 py-2 border">مانده</th>
              <th className="px-4 py-2 border">شرح</th>
              <th className="px-4 py-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-2 text-center border">
                  هیچ سندی یافت نشد
                </td>
              </tr>
            ) : (
              <>
                {paginatedData.flatMap((book, bookIndex) => {
                  const actualIndex = startIndex + bookIndex;
                  const { totalDebit, totalCredit, balance } =
                    calculateDocumentBalance(
                      book.debitEntries || [],
                      book.creditEntries || []
                    );
                  const isExpanded = expandedRows.has(book._id || "");
                  const allEntries: ExtendedEntry[] = [
                    ...(book.debitEntries || []).map((entry) => ({
                      ...entry,
                      entryType: "debit" as const,
                    })),
                    ...(book.creditEntries || []).map((entry) => ({
                      ...entry,
                      entryType: "credit" as const,
                    })),
                  ];

                  return [
                    // Main document row
                    <tr
                      key={`${book._id}-main`}
                      className={`text-black bg-blue-50 ${
                        selectedRows.has(book._id || "")
                          ? "ring-2 ring-blue-300"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-center border">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(book._id || "")}
                          onChange={() => handleSelectRow(book._id || "")}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-center border">
                        {actualIndex + 1}
                      </td>
                      <td className="px-4 py-2 text-center border">
                        {book.documentNumber}
                      </td>
                      <td className="px-4 py-2 text-center border">
                        {formatDate(book.date)}
                      </td>
                      <td className="px-4 py-2 border">{book.description}</td>
                      <td className="px-4 py-2 text-center border">
                        {book.type || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => toggleRowExpansion(book._id || "")}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {isExpanded ? "▼" : "▶"} جزئیات حساب‌ها
                        </button>
                      </td>
                      <td className="px-4 py-2 text-left border text-red-600 font-bold">
                        {totalDebit.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-left border text-green-600 font-bold">
                        {totalCredit.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-2 text-left border font-bold ${
                          balance === 0
                            ? "text-blue-600"
                            : balance > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {Math.abs(balance).toLocaleString()}
                        {balance === 0
                          ? " (متعادل)"
                          : balance > 0
                          ? " (بدهکار)"
                          : " (بستانکار)"}
                      </td>
                      <td className="px-4 py-2 border">خلاصه سند</td>
                      <td className="px-4 py-2 text-center border">
                        <div className="flex justify-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(book._id || "")}
                            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                book._id || "",
                                book.documentNumber
                              )
                            }
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                          >
                            حذف
                          </button>
                          <button
                            onClick={() => handleRowPng(book)}
                            disabled={isGenerating}
                            className="px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-xs disabled:opacity-50"
                            title="دانلود PNG"
                          >
                            <HiOutlineDownload className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>,

                    // Expanded entries
                    ...(isExpanded
                      ? allEntries.map((entry, entryIndex) => (
                          <tr
                            key={`${book._id}-${entryIndex}`}
                            className="text-black bg-gray-50"
                          >
                            <td className="px-4 py-2 text-center border"></td>
                            <td className="px-4 py-2 text-center border"></td>
                            <td className="px-4 py-2 text-center border"></td>
                            <td className="px-4 py-2 text-center border"></td>
                            <td className="px-4 py-2 border"></td>
                            <td className="px-4 py-2 text-center border text-xs">
                              {entry.entryType === "debit"
                                ? "بدهکار"
                                : "بستانکار"}
                            </td>
                            <td className="px-4 py-2 border text-sm">
                              <div className="space-y-1">
                                <div className="font-medium text-blue-700">
                                  گروه:{" "}
                                  {getAccountName(entry.accountGroup, "group")}
                                </div>
                                <div className="text-gray-600 mr-4">
                                  کل:{" "}
                                  {getAccountName(entry.totalAccount, "total")}
                                </div>
                                <div className="text-gray-600 mr-8">
                                  معین:{" "}
                                  {getAccountName(entry.fixedAccounts, "fixed")}
                                </div>
                                {(entry.detailed1 || entry.detailed2) && (
                                  <div className="text-gray-500 mr-12 text-xs">
                                    {entry.detailed1 && (
                                      <div>
                                        تفصیلی 1:{" "}
                                        {getAccountName(
                                          entry.detailed1,
                                          "detailed"
                                        )}
                                      </div>
                                    )}
                                    {entry.detailed2 && (
                                      <div>
                                        تفصیلی 2:{" "}
                                        {getAccountName(
                                          entry.detailed2,
                                          "detailed"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-left border">
                              {(() => {
                                return entry.entryType === "debit"
                                  ? entry.amount.toLocaleString()
                                  : "-";
                              })()}
                            </td>
                            <td className="px-4 py-2 text-left border">
                              {(() => {
                                return entry.entryType === "credit"
                                  ? entry.amount.toLocaleString()
                                  : "-";
                              })()}
                            </td>
                            <td className="px-4 py-2 text-left border">-</td>
                            <td className="px-4 py-2 border text-sm">
                              {entry.description}
                            </td>
                            <td className="px-4 py-2 text-center border"></td>
                          </tr>
                        ))
                      : []),
                  ];
                })}

                {/* Totals row */}
                <tr className="bg-yellow-100 font-bold text-black border-t-2 border-yellow-400">
                  <td colSpan={7} className="px-4 py-2 text-center border">
                    مجموع کل
                  </td>
                  <td className="px-4 py-2 text-left border text-red-700">
                    {calculateTotals().totalDebit.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-left border text-green-700">
                    {calculateTotals().totalCredit.toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-2 text-left border ${
                      calculateTotals().balance === 0
                        ? "text-blue-700"
                        : calculateTotals().balance > 0
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {Math.abs(calculateTotals().balance).toLocaleString()}
                    {calculateTotals().balance === 0
                      ? " (متعادل)"
                      : calculateTotals().balance > 0
                      ? " (بدهکار)"
                      : " (بستانکار)"}
                  </td>
                  <td colSpan={2} className="px-4 py-2 text-center border">
                    جمع کل اسناد
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            نمایش {startIndex + 1} تا {Math.min(endIndex, totalRecords)} از{" "}
            {totalRecords} رکورد
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              قبلی
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              بعدی
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">تأیید حذف</h3>
            <p className="text-center mb-6">
              آیا از حذف سند شماره <strong>{deleteDocNumber}</strong> اطمینان
              دارید؟
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                حذف
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBookTable;
