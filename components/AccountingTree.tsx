"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  FiChevronRight,
  FiFolder,
  FiFileText,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import {
  AccountingProvider,
  useAccounting,
} from "@/contexts/AccountingContext";
import DynamicModal from "@/components/global/DynamicModal";
import { ModalConfig } from "@/components/global/DynamicModal";
import toast from "react-hot-toast";

interface AccountBase {
  _id: string | { toString(): string };
  code: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt?: string;
}

type DetailedAccount = AccountBase;

interface FixedAccount extends AccountBase {
  howManyDetailedDoesItHave?: number;
  detailedAccounts?: DetailedAccount[];
}

interface TotalAccount extends AccountBase {
  fixedAccounts?: FixedAccount[];
}

interface AccountGroup extends AccountBase {
  totalAccounts?: TotalAccount[];
}

const fa = {
  addFixedAccount: "افزودن حساب معین",
  editTotalAccount: "ویرایش حساب کل",
  deleteTotalAccount: "حذف حساب کل",
  addDetailedAccount: "افزودن حساب معین",
  editFixedAccount: "ویرایش حساب ثابت",
  deleteFixedAccount: "حذف حساب ثابت",
  editDetailedAccount: "ویرایش حساب تفصیلی",
  deleteDetailedAccount: "حذف حساب معین",
  name: "نام",
  description: "توضیحات",
  type: "نوع",
  status: "وضعیت",
  active: "فعال",
  inactive: "غیرفعال",
  successAdd: "با موفقیت افزوده شد",
  successUpdate: "با موفقیت به‌روزرسانی شد",
  successDelete: "با موفقیت حذف شد",
  error: "عملیات ناموفق بود",
};

const AccountingTree = () => {
  const { data, loading, error, refreshData } = useAccounting();
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);

  const handleOpenModal = (
    config: ModalConfig,
    item: Record<string, unknown>
  ) => {
    const originalOnClose = config.onClose;
    const originalOnSuccess = config.onSuccess;

    config.onClose = () => {
      if (originalOnClose) originalOnClose();
      setIsModalOpen(false);
    };

    config.onSuccess = (data) => {
      if (originalOnSuccess) originalOnSuccess(data);
      refreshData();
      setIsModalOpen(false);
    };

    setModalConfig(config);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="text-center p-8 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        در حال بارگذاری ساختار حسابداری...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg mx-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-4 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        خطا در دریافت اطلاعات: {error}
        <button
          onClick={refreshData}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center mx-auto"
        >
          <FiRefreshCw className="ml-2" />
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl text-nowrap font-bold text-gray-800">
          ساختار درختی حساب های حسابداری
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="bg-blue-500 text-white px-4 text-sm text-nowrap py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FiRefreshCw />
            بروزرسانی
          </button>
          <button
            onClick={() => {
              const config: ModalConfig = {
                title: "ایجاد گروه حساب جدید",
                type: "create",
                endpoint: "/api/accounts/accountGroups",
                method: "POST",
                fields: [
                  {
                    key: "name",
                    label: "نام گروه",
                    type: "text",
                    required: true,
                  },
                  {
                    key: "description",
                    label: "توضیحات",
                    type: "textarea",
                    required: true,
                  },
                  {
                    key: "type",
                    label: "نوع حساب",
                    type: "select",
                    required: true,
                    options: [
                      { label: "بدهکار", value: "debit" },
                      { label: "بستانکار", value: "credit" },
                    ],
                  },
                  {
                    key: "fiscalType",
                    label: "نوع گروه حساب",
                    type: "select",
                    required: true,
                    options: [
                      { label: "دائم", value: "permanat" },
                      { label: "غیر دائم", value: "temparary" },
                    ],
                  },
                  {
                    key: "status",
                    label: "وضعیت",
                    type: "select",
                    required: true,
                    options: [
                      { label: "فعال", value: "active" },
                      { label: "غیرفعال", value: "inactive" },
                    ],
                  },
                ],
                onSuccess: () => toast.success("گروه حساب با موفقیت ایجاد شد"),
                onError: (err: string) => toast.error("خطا: " + err),
              };
              handleOpenModal(config, {});
            }}
            className="bg-green-500 text-white px-4 text-sm text-nowrap py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FiPlus />
            ایجاد گروه جدید
          </button>
          <button
            onClick={() => {
              const config: ModalConfig = {
                title: "ایجاد حساب تفضیلی جدید",
                type: "create",
                endpoint: "/api/accounts/detailed",
                method: "POST",
                fields: [
                  {
                    key: "name",
                    label: "نام حساب تفضیلی",
                    type: "text",
                    required: true,
                  },
                  {
                    key: "description",
                    label: "توضیحات",
                    type: "textarea",
                    required: true,
                  },
                  {
                    key: "fiscalType",
                    label: "نوع حساب تفضیلی",
                    type: "select",
                    required: true,
                    options: [
                      { label: "دائم", value: "permanat" },
                      { label: "غیر دائم", value: "temparary" },
                    ],
                  },
                  {
                    key: "type",
                    label: "نوع",
                    type: "select",
                    required: true,
                    options: [
                      { label: "بدهکار", value: "debit" },
                      { label: "بستانکار", value: "credit" },
                    ],
                  },
                  {
                    key: "status",
                    label: "وضعیت",
                    type: "select",
                    required: true,
                    options: [
                      { label: "فعال", value: "active" },
                      { label: "غیرفعال", value: "inactive" },
                    ],
                  },
                ],
                onSuccess: () => toast.success("حساب معین با موفقیت ایجاد شد"),
                onError: (err: string) => toast.error("خطا: " + err),
              };
              handleOpenModal(config, {});
            }}
            className="bg-purple-500 text-white text-sm text-nowrap px-4 py-2 rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FiPlus />
            ایجاد حساب تفضیلی
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/accounts/detailed");
                const data = await response.json();

                const config: ModalConfig = {
                  title: "لیست حساب‌های تفضیلی",
                  type: "list",
                  size: "xl",
                  data: data.detailedAccounts,
                  columns: [
                    { key: "code", label: "کد" },
                    { key: "name", label: "نام" },
                    { key: "type", label: "نوع" },
                    {
                      key: "fiscalType",
                      label: "نوع حساب",
                    },
                    { key: "status", label: "وضعیت" },
                    { key: "description", label: "توضیحات" },
                    { key: "createdAt", label: "تاریخ ایجاد" },
                  ],
                  actions: {
                    edit: {
                      endpoint: "/api/accounts/detailed/id",
                      method: "PATCH",
                      fields: [
                        {
                          key: "name",
                          label: "نام حساب تفضیلی",
                          type: "text",
                          required: true,
                        },
                        {
                          key: "description",
                          label: "توضیحات",
                          type: "textarea",
                          required: true,
                        },
                        {
                          key: "fiscalType",
                          label: "نوع حساب تفضیلی",
                          type: "select",
                          required: true,
                          options: [
                            { label: "دائم", value: "permanat" },
                            { label: "غیر دائم", value: "temparary" },
                          ],
                        },
                        {
                          key: "type",
                          label: "نوع",
                          type: "select",
                          required: true,
                          options: [
                            { label: "بدهکار", value: "debit" },
                            { label: "بستانکار", value: "credit" },
                          ],
                        },
                        {
                          key: "status",
                          label: "وضعیت",
                          type: "select",
                          required: true,
                          options: [
                            { label: "فعال", value: "active" },
                            { label: "غیرفعال", value: "inactive" },
                          ],
                        },
                      ],
                      onSuccess: () => {
                        toast.success("حساب تفضیلی با موفقیت ویرایش شد");
                        // Refresh the list data
                        fetch("/api/accounts/detailed")
                          .then((res) => res.json())
                          .then((freshData) => {
                            setModalConfig((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    data: freshData.detailedAccounts,
                                  }
                                : null
                            );
                          })
                          .catch(() => {});
                      },
                      onError: (err: string) =>
                        toast.error("خطا در ویرایش: " + err),
                    },
                  },
                  onSuccess: () => {},
                  onError: (err: string) => toast.error("خطا: " + err),
                };
                handleOpenModal(config, {});
              } catch (error) {
                console.log(error);
                toast.error("خطا در دریافت حساب‌های معین");
              }
            }}
            className="bg-indigo-500 text-white text-sm text-nowrap px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FiFileText />
            نمایش حساب‌های تفضیلی
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            هیچ گروه حسابی یافت نشد
          </div>
        ) : (
          data.map((group) => (
            <AccountGroup
              key={group._id.toString()}
              group={group as unknown as Record<string, unknown>}
              level={0}
              onAction={handleOpenModal}
            />
          ))
        )}
      </div>

      {isModalOpen && modalConfig && (
        <DynamicModal
          isOpen={isModalOpen}
          config={modalConfig}
          itemId={selectedItem?._id as string}
          initialData={selectedItem || undefined}
        />
      )}
    </div>
  );
};

const AccountGroup = ({
  group,
  level,
  onAction,
}: {
  group: Record<string, unknown>;
  level: number;
  onAction: (config: ModalConfig, item: Record<string, unknown>) => void;
}) => {
  const [isOpen, setIsOpen] = useState(level === 1 ? true : false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.3,
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  const handleAction = (
    type: "add" | "edit" | "delete",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    let config: ModalConfig;
    switch (type) {
      case "add":
        config = {
          title: "ایجاد حساب کل جدید",
          type: "create",
          endpoint: "/api/accounts/totalAccounts",
          method: "POST",
          fields: [
            { key: "name", label: "نام حساب", type: "text", required: true },
            {
              key: "description",
              label: "توضیحات",
              type: "textarea",
              required: true,
            },
            {
              key: "type",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "fiscalType",
              label: "نوع حساب کل",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "status",
              label: "وضعیت",
              type: "select",
              required: true,
              options: [
                { label: "فعال", value: "active" },
                { label: "غیرفعال", value: "inactive" },
              ],
            },
          ],
          onSuccess: () => toast.success("حساب کل با موفقیت ایجاد شد"),
          onError: (err: string) => toast.error("خطا در ایجاد حساب کل " + err),
        };
        onAction(config, { accountGroup: group._id });
        break;
      case "edit":
        config = {
          title: "ویرایش گروه حساب",
          type: "edit",
          endpoint: `/api/accounts/accountGroups/id`,
          method: "PATCH",
          fields: [
            { key: "name", label: "نام گروه", type: "text", required: true },
            {
              key: "description",
              label: "توضیحات",
              type: "textarea",
              required: true,
            },
            {
              key: "fiscalType",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "type",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "status",
              label: "وضعیت",
              type: "select",
              required: true,
              options: [
                { label: "فعال", value: "active" },
                { label: "غیرفعال", value: "inactive" },
              ],
            },
          ],
          onSuccess: () => toast.success("گروه حساب با موفقیت ویرایش شد"),
          onError: (err: string) =>
            toast.error("خطا در ویرایش گروه حساب: " + err),
        };
        onAction(config, group);
        break;
      case "delete":
        config = {
          title: "حذف گروه حساب",
          type: "delete",
          endpoint: `/api/accounts/accountGroups/id`,
          method: "DELETE",
          confirmText: "آیا از حذف این گروه حساب اطمینان دارید؟",
          onSuccess: () => toast.success("گروه حساب با موفقیت حذف شد"),
          onError: (err: string) => toast.error("خطا در حذف گروه حساب: " + err),
        };
        onAction(config, group);
        break;
    }
  };

  return (
    <div className="mb-3 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div
        className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          level === 0 ? "bg-gray-50" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={`ml-3 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          <FiChevronRight className="text-gray-500" />
        </div>
        <div className="flex-1 flex items-center">
          <FiFolder
            className={`ml-3 ${
              level === 0
                ? "text-blue-500"
                : level === 1
                ? "text-green-500"
                : "text-purple-500"
            }`}
          />
          <div>
            <span className="font-mono text-sm text-gray-500 ml-2">
              {String(group.code)}
            </span>
            <span className="font-medium text-gray-800">
              {String(group.name)}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleAction("add", e)}
            className="p-1.5 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
            title="افزودن حساب کل"
          >
            <FiPlus />
          </button>
          <button
            onClick={(e) => handleAction("edit", e)}
            className="p-1.5 rounded-full text-amber-500 hover:bg-amber-50 transition-colors"
            title="ویرایش گروه حساب"
          >
            <FiEdit />
          </button>
          <button
            onClick={(e) => handleAction("delete", e)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
            title="حذف گروه حساب"
          >
            <FiTrash2 />
          </button>
        </div>
        {(group.totalAccounts as unknown[])?.length > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full mr-2">
            {(group.totalAccounts as unknown[])?.length} حساب
          </span>
        )}
      </div>

      <div ref={contentRef} className="overflow-hidden h-0 opacity-0 pr-8">
        {(group.totalAccounts as Record<string, unknown>[])?.map(
          (account: Record<string, unknown>) => (
            <TotalAccount
              key={(account._id as { toString(): string }).toString()}
              account={account}
              level={level + 1}
              onAction={onAction}
            />
          )
        )}
      </div>
    </div>
  );
};

const TotalAccount = ({
  account,
  level,
  onAction,
}: {
  account: Record<string, unknown>;
  level: number;
  onAction: (config: ModalConfig, item: Record<string, unknown>) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.3,
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  const handleAction = (
    type: "add" | "edit" | "delete",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    let config: ModalConfig;
    switch (type) {
      case "add":
        config = {
          title: fa.addFixedAccount,
          type: "create",
          endpoint: "/api/accounts/fixedAccounts",
          method: "POST",
          fields: [
            { key: "name", label: fa.name, type: "text", required: true },
            {
              key: "description",
              label: fa.description,
              type: "textarea",
              required: true,
            },
            {
              key: "type",
              label: fa.type,
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "fiscalType",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "howManyDetailedDoesItHave",
              label: "تعداد سطح حساب‌های تفضیلی",
              type: "number",
              required: true,
            },
            {
              key: "status",
              label: fa.status,
              type: "select",
              required: true,
              options: [
                { label: fa.active, value: "active" },
                { label: fa.inactive, value: "inactive" },
              ],
            },
          ],
          onSuccess: () => {
            toast.success(fa.successAdd);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, { totalAccount: account._id });
        break;
      case "edit":
        config = {
          title: "ویرایش حساب کل",
          type: "edit",
          endpoint: `/api/accounts/totalAccounts/id`,
          method: "PATCH",
          fields: [
            { key: "name", label: fa.name, type: "text", required: true },
            {
              key: "description",
              label: fa.description,
              type: "textarea",
              required: true,
            },
            {
              key: "fiscalType",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "type",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "status",
              label: fa.status,
              type: "select",
              required: true,
              options: [
                { label: fa.active, value: "active" },
                { label: fa.inactive, value: "inactive" },
              ],
            },
          ],
          onSuccess: () => {
            toast.success(fa.successUpdate);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
      case "delete":
        config = {
          title: fa.deleteTotalAccount,
          type: "delete",
          endpoint: `/api/accounts/totalAccounts/id`,
          method: "DELETE",
          onSuccess: () => {
            toast.success(fa.successDelete);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
    }
  };

  return (
    <div
      className="my-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      dir="rtl"
    >
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={`ml-3 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          <FiChevronRight className="text-gray-400" />
        </div>
        <div className="flex-1 flex items-center">
          <FiFolder className="ml-3 text-green-600" />
          <div className="text-right">
            <span className="font-mono text-xs text-gray-500 ml-2">
              {String(account.code)}
            </span>
            <span className="text-gray-800 font-medium">
              {String(account.name)}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleAction("add", e)}
            className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label={fa.addFixedAccount}
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={(e) => handleAction("edit", e)}
            className="p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors"
            aria-label={fa.editTotalAccount}
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={(e) => handleAction("delete", e)}
            className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            aria-label={fa.deleteTotalAccount}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
        {(account.fixedAccounts as unknown[])?.length > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
            {(account.fixedAccounts as unknown[])?.length}
          </span>
        )}
      </div>

      <div ref={contentRef} className="overflow-hidden h-0 opacity-0 pr-8">
        {(account.fixedAccounts as Record<string, unknown>[])?.map(
          (fixed: Record<string, unknown>) => (
            <FixedAccount
              key={(fixed._id as { toString(): string }).toString()}
              account={fixed}
              level={level + 1}
              onAction={onAction}
            />
          )
        )}
      </div>
    </div>
  );
};

const FixedAccount = ({
  account,
  onAction,
}: {
  account: Record<string, unknown>;
  level: number;
  onAction: (config: ModalConfig, item: Record<string, unknown>) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.3,
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  const handleAction = (
    type: "assign" | "edit" | "delete",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    let config: ModalConfig;
    switch (type) {
      case "assign":
        // Fetch detailed accounts for dropdown
        fetch("/api/accounts/detailed")
          .then((res) => res.json())
          .then((data) => {
            const detailedOptions =
              data.detailedAccounts?.map((acc: Record<string, unknown>) => ({
                value: acc._id,
                label: `${acc.code} - ${acc.name}`,
              })) || [];

            config = {
              title: "افزودن حساب تفصیلی به حساب معین",
              type: "create",
              endpoint: `/api/accounts/fixedAccounts`,
              method: "POST",
              fields: [
                {
                  key: "detailedAccountIds",
                  label: "حساب‌های تفصیلی",
                  type: "select",
                  required: true,
                  options: detailedOptions,
                  multiple: true,
                },
              ],
              onSuccess: () => {
                toast.success("حساب‌های معین با موفقیت افزوده شد");
              },
              onError: () => toast.error("خطا در افزودن حساب‌ها"),
            };
            onAction(config, { fixedAccountId: account._id });
          })
          .catch(() => {
            toast.error("خطا در دریافت حساب‌های معین");
          });
        return;

      case "edit":
        config = {
          title: fa.editFixedAccount,
          type: "edit",
          endpoint: `/api/accounts/fixedAccounts/id`,
          method: "PATCH",
          fields: [
            { key: "name", label: fa.name, type: "text", required: true },
            {
              key: "description",
              label: fa.description,
              type: "textarea",
              required: true,
            },
            {
              key: "type",
              label: fa.type,
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "fiscalType",
              label: "نوع حساب",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "howManyDetailedDoesItHave",
              label: "تعداد سطح حساب‌های تفضیلی",
              type: "number",
              required: true,
            },
            {
              key: "status",
              label: fa.status,
              type: "select",
              required: true,
              options: [
                { label: fa.active, value: "active" },
                { label: fa.inactive, value: "inactive" },
              ],
            },
          ],
          onSuccess: () => {
            toast.success(fa.successUpdate);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
      case "delete":
        config = {
          title: fa.deleteFixedAccount,
          type: "delete",
          endpoint: `/api/accounts/fixedAccounts/id`,
          method: "DELETE",
          onSuccess: () => {
            toast.success(fa.successDelete);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
    }
  };

  return (
    <div
      className="my-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      dir="rtl"
    >
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={`ml-3 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          <FiChevronRight className="text-gray-400" />
        </div>
        <div className="flex-1 flex items-center">
          <FiFolder className="ml-3 text-purple-600" />
          <div className="text-right">
            <span className="font-mono text-xs text-gray-500 ml-2">
              {String(account.code)}
            </span>
            <span className="text-gray-800 font-medium">
              {String(account.name)}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleAction("assign", e)}
            className="p-1.5 rounded-full text-green-600 hover:bg-green-50 transition-colors"
            title="اختصاص حساب معین"
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={(e) => handleAction("edit", e)}
            className="p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors"
            aria-label={fa.editFixedAccount}
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={(e) => handleAction("delete", e)}
            className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            aria-label={fa.deleteFixedAccount}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
        {(account.detailedAccounts as unknown[])?.length > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
            {(account.detailedAccounts as unknown[])?.length}
          </span>
        )}
      </div>

      <div ref={contentRef} className="overflow-hidden h-0 opacity-0 pr-8">
        {(account.detailedAccounts as Record<string, unknown>[])?.map(
          (detailed: Record<string, unknown>) => (
            <DetailedAccount
              key={(detailed._id as { toString(): string }).toString()}
              account={detailed}
              onAction={onAction}
            />
          )
        )}
      </div>
    </div>
  );
};

const DetailedAccount = ({
  account,
  onAction,
}: {
  account: Record<string, unknown>;
  onAction: (config: ModalConfig, item: Record<string, unknown>) => void;
}) => {
  const handleAction = (type: "edit" | "delete", e: React.MouseEvent) => {
    e.stopPropagation();

    let config: ModalConfig;
    switch (type) {
      case "edit":
        config = {
          title: fa.editDetailedAccount,
          type: "edit",
          endpoint: `/api/accounts/detailed/id`,
          method: "PATCH",
          fields: [
            {
              key: "name",
              label: "نام حساب تفضیلی",
              type: "text",
              required: true,
            },
            {
              key: "description",
              label: "توضیحات",
              type: "textarea",
              required: true,
            },
            {
              key: "fiscalType",
              label: "نوع حساب تفضیلی",
              type: "select",
              required: true,
              options: [
                { label: "دائم", value: "permanat" },
                { label: "غیر دائم", value: "temparary" },
              ],
            },
            {
              key: "type",
              label: "نوع",
              type: "select",
              required: true,
              options: [
                { label: "بدهکار", value: "debit" },
                { label: "بستانکار", value: "credit" },
              ],
            },
            {
              key: "status",
              label: "وضعیت",
              type: "select",
              required: true,
              options: [
                { label: "فعال", value: "active" },
                { label: "غیرفعال", value: "inactive" },
              ],
            },
          ],
          onSuccess: () => {
            toast.success(fa.successUpdate);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
      case "delete":
        config = {
          title: fa.deleteDetailedAccount,
          type: "delete",
          endpoint: `/api/accounts/detailed/id`,
          method: "DELETE",
          onSuccess: () => {
            toast.success(fa.successDelete);
          },
          onError: () => toast.error(fa.error),
        };
        onAction(config, account);
        break;
    }
  };

  return (
    <div
      className="flex items-center p-3 my-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      dir="rtl"
    >
      <FiFileText className="ml-3 text-orange-600" />
      <div className="flex-1 text-right">
        <span className="font-mono text-xs text-gray-500 ml-2">
          {account.code as string}
        </span>
        <span className="text-gray-800 font-medium">
          {account.name as string}
        </span>
      </div>
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleAction("edit", e)}
          className="p-1.5 rounded-full text-amber-600 hover:bg-amber-50 transition-colors"
          aria-label={fa.editDetailedAccount}
        >
          <FiEdit size={16} />
        </button>
        <button
          onClick={(e) => handleAction("delete", e)}
          className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
          aria-label={fa.deleteDetailedAccount}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const Page = () => (
  <AccountingProvider>
    <AccountingTree />
  </AccountingProvider>
);

export default Page;
