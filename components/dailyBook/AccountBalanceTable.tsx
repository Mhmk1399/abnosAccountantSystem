"use client";

import React, { useState, useEffect } from "react";
import { useDailyBook } from "@/contexts/DailyBookContext";
import {
  FaSearch,
  FaFileExcel,
  FaSync,
  FaChartBar,
  FaChartPie,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface AccountBalance {
  detailedAccount: {
    _id: string;
    name: string;
    totalDebit: number;
    totalCredit: number;
    net: number;
  };
  fixedAccount?: {
    _id: string;
    name: string;
    totalDebit: number;
    totalCredit: number;
    net: number;
  };
  totalAccount?: {
    _id: string;
    name: string;
    totalDebit: number;
    totalCredit: number;
    net: number;
  };
  accountGroup?: {
    _id: string;
    name: string;
    totalDebit: number;
    totalCredit: number;
    net: number;
  };
}

interface BalanceData {
  accountLevel: string;
  accountRef: Account;
  totalDebit: number;
  totalCredit: number;
  net: number;
}

interface Account {
  _id: string;
  name: string;
  totalDebit: number;
  totalCredit: number;
  net: number;
  accountGroup?: string;
  totalAccount?: string;
  detailedAccounts?: string[];
}

interface Balance {
  totalDebit: number;
  totalCredit: number;
  net: number;
}

interface FixedAccount {
  account: Account;
  detailedAccounts: AccountBalance[];
  balance: Balance;
}

interface TotalAccount {
  account: Account;
  fixedAccounts: FixedAccount[];
  balance: Balance;
}

interface GroupedBalance {
  group: Account;
  totalAccounts: TotalAccount[];
  balance: Balance;
}

const AccountBalanceTable: React.FC = () => {
  const { loading: contextLoading } = useDailyBook();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountGroup, setSelectedAccountGroup] = useState("");
  const [selectedTotalAccount, setSelectedTotalAccount] = useState("");
  const [selectedFixedAccount, setSelectedFixedAccount] = useState("");
  const [selectedDetailedAccount, setSelectedDetailedAccount] = useState("");
  const [balanceType, setBalanceType] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [groupedBalances, setGroupedBalances] = useState<GroupedBalance[]>([]);
  const [loading, setLoading] = useState(false);
 
  const fetchAccountBalances = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts/group-balances");
      if (response.ok) {
        const data = await response.json();
        const balances = data.balances || [];
        const grouped = groupBalancesByHierarchy(balances);
        setGroupedBalances(grouped);
      } else {
        toast.error("خطا در دریافت مانده حسابها");
      }
    } catch (error) {
      console.error("Error fetching account balances:", error);
      toast.error("خطا در دریافت مانده حسابها");
    } finally {
      setLoading(false);
    }
  };

  const groupBalancesByHierarchy = (
    balances: BalanceData[]
  ): GroupedBalance[] => {
    const groupMap = new Map<
      string,
      {
        group: Account;
        balance: Balance;
        totalAccounts: Map<
          string,
          {
            account: Account;
            balance: Balance;
            fixedAccounts: Map<
              string,
              {
                account: Account;
                balance: Balance;
                detailedAccounts: AccountBalance[];
              }
            >;
          }
        >;
      }
    >();

    // Process groups
    balances.forEach((balance) => {
      if (balance.accountLevel === "group") {
        const { accountRef, totalDebit, totalCredit, net } = balance;
        groupMap.set(accountRef._id, {
          group: { ...accountRef, totalDebit, totalCredit, net },
          balance: { totalDebit, totalCredit, net },
          totalAccounts: new Map(),
        });
      }
    });

    // Process total accounts
    balances.forEach((balance) => {
      if (balance.accountLevel === "total") {
        const { accountRef, totalDebit, totalCredit, net } = balance;
        const groupId = accountRef.accountGroup;
        if (groupId && groupMap.has(groupId)) {
          const group = groupMap.get(groupId)!;
          group.totalAccounts.set(accountRef._id, {
            account: { ...accountRef, totalDebit, totalCredit, net },
            balance: { totalDebit, totalCredit, net },
            fixedAccounts: new Map(),
          });
        }
      }
    });

    // Process fixed accounts
    balances.forEach((balance) => {
      if (balance.accountLevel === "fixed") {
        const { accountRef, totalDebit, totalCredit, net } = balance;
        const totalId = accountRef.totalAccount;
        const groupId =
          accountRef.accountGroup || findGroupIdForTotal(balances, totalId);

        if (groupId && totalId && groupMap.has(groupId)) {
          const group = groupMap.get(groupId)!;
          if (group.totalAccounts.has(totalId)) {
            const totalAccount = group.totalAccounts.get(totalId)!;
            totalAccount.fixedAccounts.set(accountRef._id, {
              account: { ...accountRef, totalDebit, totalCredit, net },
              balance: { totalDebit, totalCredit, net },
              detailedAccounts: [],
            });
          }
        }
      }
    });

    // Process detailed accounts
    balances.forEach((balance) => {
      if (balance.accountLevel === "detailed") {
        const { accountRef, totalDebit, totalCredit, net } = balance;
        const fixedBalance = balances.find(
          (b) =>
            b.accountLevel === "fixed" &&
            b.accountRef.detailedAccounts &&
            b.accountRef.detailedAccounts.includes(accountRef._id)
        );

        if (fixedBalance) {
          const fixedId = fixedBalance.accountRef._id;
          const totalId = fixedBalance.accountRef.totalAccount;
          const groupId =
            fixedBalance.accountRef.accountGroup ||
            findGroupIdForTotal(balances, totalId);

          if (groupId && totalId && groupMap.has(groupId)) {
            const group = groupMap.get(groupId)!;
            if (group.totalAccounts.has(totalId)) {
              const totalAccount = group.totalAccounts.get(totalId)!;
              if (totalAccount.fixedAccounts.has(fixedId)) {
                const fixedAccount = totalAccount.fixedAccounts.get(fixedId)!;
                fixedAccount.detailedAccounts.push({
                  detailedAccount: {
                    ...accountRef,
                    totalDebit,
                    totalCredit,
                    net,
                  },
                });
              }
            }
          }
        }
      }
    });

    // Convert Maps to arrays
    return Array.from(groupMap.values()).map((group) => ({
      group: group.group,
      balance: group.balance,
      totalAccounts: Array.from(group.totalAccounts.values()).map((total) => ({
        account: total.account,
        balance: total.balance,
        fixedAccounts: Array.from(total.fixedAccounts.values()).map(
          (fixed) => ({
            account: fixed.account,
            balance: fixed.balance,
            detailedAccounts: fixed.detailedAccounts,
          })
        ),
      })),
    }));
  };

  const findGroupIdForTotal = (
    balances: BalanceData[],
    totalId: string | undefined
  ): string | undefined => {
    if (!totalId) return undefined;
    const totalBalance = balances.find(
      (b) => b.accountLevel === "total" && b.accountRef._id === totalId
    );
    return totalBalance?.accountRef.accountGroup;
  };

  const filteredGroupedBalances = groupedBalances
    .map((group) => {
      const filteredTotalAccounts = group.totalAccounts
        .map((total) => {
          const filteredFixedAccounts = total.fixedAccounts
            .map((fixed) => {
              const filteredDetailedAccounts = fixed.detailedAccounts.filter(
                (detailed) => {
                  if (
                    selectedDetailedAccount &&
                    detailed.detailedAccount._id !== selectedDetailedAccount
                  )
                    return false;
                  return true;
                }
              );
              return { ...fixed, detailedAccounts: filteredDetailedAccounts };
            })
            .filter((fixed) => {
              if (
                selectedFixedAccount &&
                fixed.account._id !== selectedFixedAccount
              )
                return false;
              return (
                fixed.detailedAccounts.length > 0 || !selectedDetailedAccount
              );
            });

          return { ...total, fixedAccounts: filteredFixedAccounts };
        })
        .filter((total) => {
          if (
            selectedTotalAccount &&
            total.account._id !== selectedTotalAccount
          )
            return false;

          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const hasMatch =
              total.account.name.toLowerCase().includes(searchLower) ||
              total.fixedAccounts.some(
                (fixed) =>
                  fixed.account.name.toLowerCase().includes(searchLower) ||
                  fixed.detailedAccounts.some((detailed) =>
                    detailed.detailedAccount.name
                      .toLowerCase()
                      .includes(searchLower)
                  )
              );
            if (!hasMatch) return false;
          }

          if (balanceType !== "all") {
            const net = total.balance.net;
            if (balanceType === "debit" && net <= 0) return false;
            if (balanceType === "credit" && net >= 0) return false;
            if (balanceType === "balanced" && net !== 0) return false;
          }

          const absNet = Math.abs(total.balance.net);
          if (minAmount && absNet < parseFloat(minAmount)) return false;
          if (maxAmount && absNet > parseFloat(maxAmount)) return false;

          return (
            total.fixedAccounts.length > 0 ||
            (!selectedFixedAccount && !selectedDetailedAccount)
          );
        });

      return { ...group, totalAccounts: filteredTotalAccounts };
    })
    .filter((group) => {
      if (selectedAccountGroup && group.group._id !== selectedAccountGroup)
        return false;
      return group.totalAccounts.length > 0;
    });

  const calculateSummary = () => {
    return filteredGroupedBalances.reduce(
      (acc, group) => {
        acc.totalDebit += group.balance.totalDebit;
        acc.totalCredit += group.balance.totalCredit;
        acc.net += group.balance.net;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0, net: 0 }
    );
  };

  const summary = calculateSummary();

  useEffect(() => {
    fetchAccountBalances();
  }, []);

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString("fa-IR");
  };

  const getBalanceInfo = (net: number) => {
    if (net === 0)
      return { text: "متعادل", color: "text-blue-600", bg: "bg-blue-50" };
    return net > 0
      ? { text: "بدهکار", color: "text-red-600", bg: "bg-red-50" }
      : { text: "بستانکار", color: "text-green-600", bg: "bg-green-50" };
  };

  const exportToExcel = () => {
    const flatData: Record<string, string | number>[] = [];
    groupedBalances.forEach((group) => {
      group.totalAccounts.forEach((total) => {
        total.fixedAccounts.forEach((fixed) => {
          fixed.detailedAccounts.forEach((detailed) => {
            flatData.push({
              "گروه حساب": group.group.name,
              "حساب کل": total.account.name,
              "حساب معین": fixed.account.name,
              "حساب تفصیلی": detailed.detailedAccount.name,
              "مجموع بدهکار": detailed.detailedAccount.totalDebit,
              "مجموع بستانکار": detailed.detailedAccount.totalCredit,
              مانده: Math.abs(detailed.detailedAccount.net),
              "نوع مانده": getBalanceInfo(detailed.detailedAccount.net).text,
            });
          });
        });
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "مانده حسابها");
    XLSX.writeFile(workbook, "AccountBalances.xlsx");
  };

  // const toggleGroup = (groupId: string) => {
  //   const newExpanded = new Set(expandedGroups);
  //   if (newExpanded.has(groupId)) {
  //     newExpanded.delete(groupId);
  //   } else {
  //     newExpanded.add(groupId);
  //   }
  //   setExpandedGroups(newExpanded);
  // };

  if (contextLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      dir="rtl"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="text-blue-100 text-sm mb-1">کل حسابها</div>
          <div className="text-2xl font-bold">{groupedBalances.length}</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <div className="text-red-100 text-sm mb-1">مجموع بدهکار</div>
          <div className="text-xl font-bold">
            {formatAmount(summary.totalDebit)}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="text-green-100 text-sm mb-1">مجموع بستانکار</div>
          <div className="text-xl font-bold">
            {formatAmount(summary.totalCredit)}
          </div>
        </div>
        <div
          className={`bg-gradient-to-r ${
            summary.net >= 0
              ? "from-orange-500 to-orange-600"
              : "from-purple-500 to-purple-600"
          } text-white p-4 rounded-lg`}
        >
          <div className="text-white text-opacity-80 text-sm mb-1">
            مانده خالص
          </div>
          <div className="text-xl font-bold">
            {formatAmount(summary.net)}
            <span className="text-sm font-normal mr-2">
              ({getBalanceInfo(summary.net).text})
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FaChartBar className="text-blue-600 ml-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              نمودار میلهای مانده حسابها
            </h3>
          </div>
          <BarChart
            data={filteredGroupedBalances.slice(0, 8)}
            formatAmount={formatAmount}
          />
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-green-600 ml-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              نمودار دایرهای توزیع مانده
            </h3>
          </div>
          <PieChart
            data={filteredGroupedBalances.slice(0, 6)}
            formatAmount={formatAmount}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">مانده حسابها</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileExcel className="ml-2" />
            خروجی اکسل
          </button>
          <button
            onClick={fetchAccountBalances}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSync className="ml-2" />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full ">
        <div className="grid grid-cols-1  w-full justify-center items-center lg:grid-cols-8 gap-2">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="جستجو  ..."
            />
          </div>

          <select
            value={selectedTotalAccount}
            onChange={(e) => setSelectedTotalAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=""> حسابهای کل</option>
            {groupedBalances.flatMap((group) =>
              group.totalAccounts.map((total) => (
                <option key={total.account._id} value={total.account._id}>
                  {total.account.name}
                </option>
              ))
            )}
          </select>
          <select
            value={selectedFixedAccount}
            onChange={(e) => setSelectedFixedAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=""> حسابهای معین</option>
            {groupedBalances.flatMap((group) =>
              group.totalAccounts.flatMap((total) =>
                total.fixedAccounts.map((fixed) => (
                  <option key={fixed.account._id} value={fixed.account._id}>
                    {fixed.account.name}
                  </option>
                ))
              )
            )}
          </select>
          <select
            value={selectedDetailedAccount}
            onChange={(e) => setSelectedDetailedAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=""> حسابهای تفصیلی</option>
            {groupedBalances.flatMap((group) =>
              group.totalAccounts.flatMap((total) =>
                total.fixedAccounts.flatMap((fixed) =>
                  fixed.detailedAccounts.map((detailed) => (
                    <option
                      key={detailed.detailedAccount._id}
                      value={detailed.detailedAccount._id}
                    >
                      {detailed.detailedAccount.name}
                    </option>
                  ))
                )
              )
            )}
          </select>
          <select
            value={balanceType}
            onChange={(e) => setBalanceType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">همه انواع</option>
            <option value="debit">بدهکار</option>
            <option value="credit">بستانکار</option>
            <option value="balanced">متعادل</option>
          </select>

          <input
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="حداقل مبلغ"
          />
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="حداکثر مبلغ"
          />
          <div className=" ">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAccountGroup("");
                setSelectedTotalAccount("");
                setSelectedFixedAccount("");
                setSelectedDetailedAccount("");
                setBalanceType("all");
                setMinAmount("");
                setMaxAmount("");
              }}
              className="px-12 py-3 text-xs cursor-pointer font-bold text-nowrap border border-red-500 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-700">
            <div className="col-span-1"></div>
            <div className="col-span-4">نام حساب</div>
            <div className="col-span-2 text-center">بدهکار</div>
            <div className="col-span-2 text-center">بستانکار</div>
            <div className="col-span-2 text-center">مانده</div>
            <div className="col-span-1 text-center">نوع</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredGroupedBalances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              هیچ حسابی یافت نشد
            </div>
          ) : (
            <>
              {filteredGroupedBalances.flatMap((groupBalance) =>
                groupBalance.totalAccounts.map((totalAccount, index) => (
                  <TotalAccountRow
                    key={
                      totalAccount.account._id ||
                      `${groupBalance.group._id}-${index}`
                    }
                    totalAccount={totalAccount}
                    formatAmount={formatAmount}
                    getBalanceInfo={getBalanceInfo}
                  />
                ))
              )}
              {/* Summary Row */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 border-t-2 border-gray-300 font-bold">
                <div className="col-span-1"></div>
                <div className="col-span-4 text-gray-800">جمع کل:</div>
                <div className="col-span-2 text-center text-red-600">
                  {formatAmount(
                    filteredGroupedBalances.reduce(
                      (sum, group) =>
                        sum +
                        group.totalAccounts.reduce(
                          (totalSum, total) => totalSum + total.balance.totalDebit,
                          0
                        ),
                      0
                    )
                  )}
                </div>
                <div className="col-span-2 text-center text-green-600">
                  {formatAmount(
                    filteredGroupedBalances.reduce(
                      (sum, group) =>
                        sum +
                        group.totalAccounts.reduce(
                          (totalSum, total) => totalSum + total.balance.totalCredit,
                          0
                        ),
                      0
                    )
                  )}
                </div>
                <div className="col-span-2 text-center text-gray-800">
                  {formatAmount(
                    Math.abs(
                      filteredGroupedBalances.reduce(
                        (sum, group) =>
                          sum +
                          group.totalAccounts.reduce(
                            (totalSum, total) => totalSum + total.balance.net,
                            0
                          ),
                        0
                      )
                    )
                  )}
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      getBalanceInfo(
                        filteredGroupedBalances.reduce(
                          (sum, group) =>
                            sum +
                            group.totalAccounts.reduce(
                              (totalSum, total) => totalSum + total.balance.net,
                              0
                            ),
                          0
                        )
                      ).bg
                    } ${
                      getBalanceInfo(
                        filteredGroupedBalances.reduce(
                          (sum, group) =>
                            sum +
                            group.totalAccounts.reduce(
                              (totalSum, total) => totalSum + total.balance.net,
                              0
                            ),
                          0
                        )
                      ).color
                    }`}
                  >
                    {getBalanceInfo(
                      filteredGroupedBalances.reduce(
                        (sum, group) =>
                          sum +
                          group.totalAccounts.reduce(
                            (totalSum, total) => totalSum + total.balance.net,
                            0
                          ),
                        0
                      )
                    ).text}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    
  );
};

// Total Account Row Component
const TotalAccountRow = ({
  totalAccount,
  formatAmount,
  getBalanceInfo,
}: {
  totalAccount: TotalAccount;
  formatAmount: (amount: number) => string;
  getBalanceInfo: (net: number) => { text: string; color: string; bg: string };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const balanceInfo = getBalanceInfo(totalAccount.balance.net);

  return (
    <>
      {/* Total Account Row */}
      <div
        className="grid grid-cols-12 gap-4 p-4 hover:bg-white cursor-pointer transition-colors border-r-4 border-green-400"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="col-span-1 flex items-center pr-4">
          {isExpanded ? (
            <FaMinus className="text-green-600" />
          ) : (
            <FaPlus className="text-green-600" />
          )}
        </div>
        <div className="col-span-4 font-medium text-gray-700 flex items-center">
          {totalAccount.account.name}
          <span className="mr-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            {totalAccount.fixedAccounts.length} حساب معین
          </span>
        </div>
        <div className="col-span-2 text-center text-red-600">
          {formatAmount(totalAccount.balance.totalDebit)}
        </div>
        <div className="col-span-2 text-center text-green-600">
          {formatAmount(totalAccount.balance.totalCredit)}
        </div>
        <div className="col-span-2 text-center font-semibold">
          <span className={balanceInfo.color}>
            {formatAmount(totalAccount.balance.net)}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span
            className={`px-2 py-1 rounded text-xs ${balanceInfo.bg} ${balanceInfo.color}`}
          >
            {balanceInfo.text}
          </span>
        </div>
      </div>

      {/* Fixed Accounts */}
      {isExpanded && (
        <div className="bg-white">
          {totalAccount.fixedAccounts.map(
            (fixedAccount: FixedAccount, index: number) => (
              <FixedAccountRow
                key={fixedAccount.account._id || index}
                fixedAccount={fixedAccount}
                formatAmount={formatAmount}
                getBalanceInfo={getBalanceInfo}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

// Fixed Account Row Component
const FixedAccountRow = ({
  fixedAccount,
  formatAmount,
  getBalanceInfo,
}: {
  fixedAccount: FixedAccount;
  formatAmount: (amount: number) => string;
  getBalanceInfo: (net: number) => { text: string; color: string; bg: string };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const balanceInfo = getBalanceInfo(fixedAccount.balance.net);

  return (
    <>
      {/* Fixed Account Row */}
      <div
        className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-r-4 border-purple-400"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="col-span-1 flex items-center pr-8">
          {isExpanded ? (
            <FaMinus className="text-purple-600" />
          ) : (
            <FaPlus className="text-purple-600" />
          )}
        </div>
        <div className="col-span-4 text-gray-600 flex items-center">
          {fixedAccount.account.name}
          <span className="mr-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
            {fixedAccount.detailedAccounts.length} حساب تفصیلی
          </span>
        </div>
        <div className="col-span-2 text-center text-red-600">
          {formatAmount(fixedAccount.balance.totalDebit)}
        </div>
        <div className="col-span-2 text-center text-green-600">
          {formatAmount(fixedAccount.balance.totalCredit)}
        </div>
        <div className="col-span-2 text-center font-medium">
          <span className={balanceInfo.color}>
            {formatAmount(fixedAccount.balance.net)}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span
            className={`px-2 py-1 rounded text-xs ${balanceInfo.bg} ${balanceInfo.color}`}
          >
            {balanceInfo.text}
          </span>
        </div>
      </div>

      {/* Detailed Accounts */}
      {isExpanded && (
        <div className="bg-gray-50">
          {fixedAccount.detailedAccounts.map(
            (detailed: AccountBalance, index: number) => (
              <div
                key={detailed.detailedAccount._id || index}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-white transition-colors border-r-4 border-gray-300"
              >
                <div className="col-span-1"></div>
                <div className="col-span-4 text-gray-600 pr-12">
                  {detailed.detailedAccount.name}
                </div>
                <div className="col-span-2 text-center text-red-600">
                  {formatAmount(detailed.detailedAccount.totalDebit)}
                </div>
                <div className="col-span-2 text-center text-green-600">
                  {formatAmount(detailed.detailedAccount.totalCredit)}
                </div>
                <div className="col-span-2 text-center font-medium">
                  <span
                    className={
                      getBalanceInfo(detailed.detailedAccount.net).color
                    }
                  >
                    {formatAmount(detailed.detailedAccount.net)}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      getBalanceInfo(detailed.detailedAccount.net).bg
                    } ${getBalanceInfo(detailed.detailedAccount.net).color}`}
                  >
                    {getBalanceInfo(detailed.detailedAccount.net).text}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
};

// Bar Chart Component
const BarChart = ({
  data,
  formatAmount,
}: {
  data: GroupedBalance[];
  formatAmount: (amount: number) => string;
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        دادهای برای نمایش وجود ندارد
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(
        Math.abs(item.balance.totalDebit),
        Math.abs(item.balance.totalCredit)
      )
    )
  );

  return (
    <div className="space-y-3">
      {data.map((group, index) => {
        const debitWidth =
          maxValue > 0
            ? (Math.abs(group.balance.totalDebit) / maxValue) * 100
            : 0;
        const creditWidth =
          maxValue > 0
            ? (Math.abs(group.balance.totalCredit) / maxValue) * 100
            : 0;

        return (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-800 text-sm">
                {group.group.name.length > 20
                  ? group.group.name.substring(0, 20) + "..."
                  : group.group.name}
              </span>
              <span className="text-xs text-gray-600">
                {group.totalAccounts.length} حساب
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-12 text-xs text-red-600">بدهکار</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${debitWidth}%` }}
                  ></div>
                </div>
                <div className="w-16 text-xs text-red-600 text-left">
                  {formatAmount(group.balance.totalDebit)}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 text-xs text-green-600">بستانکار</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${creditWidth}%` }}
                  ></div>
                </div>
                <div className="w-16 text-xs text-green-600 text-left">
                  {formatAmount(group.balance.totalCredit)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Pie Chart Component
const PieChart = ({
  data,
  formatAmount,
}: {
  data: GroupedBalance[];
  formatAmount: (amount: number) => string;
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        دادهای برای نمایش وجود ندارد
      </div>
    );
  }

  const chartData = data
    .map((group) => ({
      name: group.group.name,
      value: Math.abs(group.balance.net),
      color:
        group.balance.net > 0
          ? "#ef4444"
          : group.balance.net < 0
          ? "#22c55e"
          : "#3b82f6",
    }))
    .filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const createPath = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <svg
          width="200"
          height="200"
          viewBox="0 0 100 100"
          className="drop-shadow-sm"
        >
          {chartData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360 - 90;
            const path = createPath(percentage, startAngle);
            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke="white"
                strokeWidth="1"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full ml-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span
                  className="text-sm text-gray-700 truncate"
                  title={item.name}
                >
                  {item.name.length > 15
                    ? item.name.substring(0, 15) + "..."
                    : item.name}
                </span>
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-800">
                  {percentage}%
                </div>
                <div className="text-xs text-gray-600">
                  {formatAmount(item.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountBalanceTable;
