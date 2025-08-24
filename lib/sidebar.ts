import { MdAccountBalance, MdPeople, MdSwapHoriz } from "react-icons/md";
import {
  FaUsers,
  FaCalendarAlt,
  FaBook,
  FaSitemap,
  FaExchangeAlt,
  FaPager,
  FaCogs,
} from "react-icons/fa";

export const navMenuItems = [
  {
    id: "accountsManeger",
    title: "مدیریت حساب ها",
    icon: MdAccountBalance,
    children: [
      { id: "AccountGroup", title: "گروه حساب", icon: FaSitemap },
      { id: "FiscalYears", title: "سال مالی", icon: FaCalendarAlt },
      { id: "dailyBook", title: "دفتر روزنامه", icon: FaBook },
      { id: "typeOfDocs", title: " انواع سند", icon: FaBook },
    ],
  },
  {
    id: "Personnel",
    title: "مدیریت پرسنل",
    icon: MdPeople,
    children: [{ id: "staff", title: "حقوق و دستمزد", icon: FaUsers }],
  },
  {
    id: "transactions",
    title: "تراکنش ها",
    icon: MdSwapHoriz,
    children: [
      {
        id: "TransactionManager",
        title: "نقل و انتقالات مالی",
        icon: FaExchangeAlt,
      },
    ],
  },
   {
    id: "invoice",
    title: " سفارشات",
    icon: FaPager,
    children: [
      {
        id: "invoice",
        title: " سفارشات  ",
        icon: FaPager,
      },
    ],
  },
  {
    id: "inventory",
    title: " مدیریت موجودی",
    icon: FaPager,
    children: [
      {
        id: "inventory",
        title: "  مدیریت موجودی",
        icon: FaPager,
      },
    ],
  },
  {
    id: "workflow",
    title: "ورکفلو",
    icon: FaCogs,
    children: [
      {
        id: "workflow",
        title: "مدیریت ورکفلو",
        icon: FaCogs,
      },
    ],
  },
  {
    id: "provider",
    title: "تامین کنندگان",
    icon: FaPager,
    children: [
      {
        id: "provider",
        title: "مدیریت تامین کنندگان",
        icon: FaPager,
      }
    ],
  }

];
export const quickAccessItems = [
  {
    id: "staff",
    title: "حقوق و دستمزد",
    description: "مدیریت پرسنل و حقوق",
    icon: FaUsers,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100 hover:border-indigo-300",
    shadowColor: "rgba(99, 102, 241, 0.1)",
  },
  {
    id: "FiscalYears",
    title: "سال مالی",
    description: "مدیریت سال های مالی",
    icon: FaCalendarAlt,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100 hover:border-purple-300",
    shadowColor: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "dailyBook",
    title: "دفتر روزنامه",
    description: "مدیریت دفتر روزنامه",
    icon: FaBook,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100 hover:border-blue-300",
    shadowColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: "AccountGroup",
    title: "گروه حساب",
    description: "مدیریت گروه های حسابداری",
    icon: FaSitemap,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100 hover:border-green-300",
    shadowColor: "rgba(16, 185, 129, 0.1)",
  },
  {
    id: "TransactionManager",
    title: "نقل و انتقالات مالی",
    description: "مدیریت تراکنش های مالی",
    icon: FaExchangeAlt,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100 hover:border-amber-300",
    shadowColor: "rgba(245, 158, 11, 0.1)",
  },
   {
    id: "invoice",
    title: " سفارشات  ",
    description: " سفارشات  ",
    icon: FaExchangeAlt,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100 hover:border-amber-300",
    shadowColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "workflow",
    title: "ورکفلو",
    description: "مدیریت فرآیندهای خودکار",
    icon: FaCogs,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100 hover:border-red-300",
    shadowColor: "rgba(239, 68, 68, 0.1)",
  },
  {
    id: "provider",
    title: "تامین کنندگان",
    description: "مدیریت تامین کنندگان و گزارشات",
    icon: FaPager,
    iconColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-100 hover:border-gray-300",
    shadowColor: "rgba(156, 163, 175, 0.1)",
  },
];
