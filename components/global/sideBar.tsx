"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Sunrise,
  Sun,
  Moon,
  SunDimIcon,
} from "lucide-react";
import { navMenuItems, quickAccessItems } from "@/lib/sidebar";
import AccountingTree from "../AccountingTree";
import FiscalYearWrapper from "../fiscalYears/FiscalYearWrapper";
import DailyBookWrapper from "../dailyBook/DailyBookWrapper";
import TypeOfDailyBookWrapper from "../typeOfDailyBook/TypeOfDailyBookWrapper";
import TransactionWrapper from "../transaction/TransactionWrapper";
import SalaryAndPersonelWrapper from "../salaryandpersonels/SalaryAndPersonelWrapper";
import InvoiceStatusManager from "../invoice/InvoiceStatusManager";
import WorkflowWrapper from "../workflow/WorkflowWrapper";
import ProviderTabs from "../provider/ProviderTabs";
import InventoryTabs from "../inventory/InventoryTabs";
import { useAuth } from "@/contexts/AuthContext";
import GroupDetailAccount from "../accounts/GroupDetailAccount";

const WelcomeScreen: React.FC<{
  setActiveChild: (childId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  user: string;
}> = ({ setActiveChild, setIsOpen, user }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Logo animation
    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotation: -180 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      }
    )
      // Greeting animation
      .fromTo(
        greetingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      // Title animation
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      )
      // Description animation
      .fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      )
      // Grid items stagger animation
      .fromTo(
        gridRef.current?.children || [],
        { opacity: 0, y: 50, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      )
      // Footer animation
      .fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );

    // Continuous logo glow animation
    const glowElement = logoRef.current?.querySelector(".glow");
    if (glowElement) {
      gsap.to(glowElement, {
        opacity: 0.6,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: "صبح بخیر",
        icon: <Sunrise className="text-amber-500 mr-2" size={20} />,
        color: "text-amber-500",
      };
    if (hour < 16)
      return {
        text: "ظهر بخیر",
        icon: <SunDimIcon className="text-amber-500 mr-2" size={20} />,
        color: "text-amber-500",
      };
    if (hour < 18)
      return {
        text: "عصر بخیر",
        icon: <Sun className="text-orange-500 mr-2" size={20} />,
        color: "text-orange-500",
      };
    return {
      text: "شب بخیر",
      icon: <Moon className="text-indigo-400 mr-2" size={20} />,
      color: "text-indigo-400",
    };
  };

  const greeting = getGreeting();

  const handleItemClick = (itemId: string) => {
    setActiveChild(itemId);
    setIsOpen(false);
  };

  const handleItemHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: -12,
      scale: 1.05,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(e.currentTarget.querySelector(".icon-container"), {
      rotation: 360,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={containerRef}
      className="p-4 md:px-8 text-gray-700 flex flex-col justify-center items-center min-h-screen"
    >
      {/* Logo Section */}
      <div ref={logoRef} className="relative mb-16">
        <div className="glow absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-xl opacity-30" />
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-full shadow-2xl relative z-10">
          <Image
            src="/assets/images/logo.png"
            alt="آبنوس سیستم"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Greeting Section */}
      <div className="text-center mb-8">
        <div
          ref={greetingRef}
          className={`flex items-center justify-center ${greeting.color} font-medium text-lg mb-4`}
        >
          {greeting.icon}
          <span className="mr-1 text-black">{greeting.text}</span>
        </div>

        <h2
          ref={titleRef}
          className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-6"
        >
          {user} عزیز به آبنوس سیستم خوش آمدید
        </h2>

        <p ref={descRef} className="text-gray-600 text-center mb-8 text-lg">
          لطفاً یک مورد از منو را برای نمایش انتخاب کنید یا از{" "}
          <span className="font-bold text-rose-500 animate-pulse">
            دسترسی سریع
          </span>{" "}
          زیر استفاده نمایید.
        </p>
      </div>

      {/* Quick Access Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-8 gap-6   mb-12"
      >
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg border-2 ${item.borderColor} cursor-pointer transition-all duration-300 hover:border-opacity-100`}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={handleItemHover}
              onMouseLeave={handleItemLeave}
            >
              <div
                className={`icon-container ${item.bgColor} p-4 rounded-xl mb-4 shadow-md`}
              >
                <Icon className={item.iconColor} size={40} />
              </div>
              <span className="text-base font-semibold text-gray-800 text-center">
                {item.title}
              </span>
              <span className="text-sm text-gray-500 mt-2 text-center">
                {item.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div ref={footerRef} className="text-center text-sm text-gray-400">
        <div className="px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer">
          نسخه ۱.۰.۰ - آبنوس سیستم
        </div>
      </div>
    </div>
  );
};

const renderChildComponent = (
  childId: string | null,
  setActiveChild: (childId: string) => void,
  setIsOpen: (isOpen: boolean) => void,
  user: string
) => {
  try {
    switch (childId) {
      case "staff":
        return <SalaryAndPersonelWrapper />;
      case "FiscalYears":
        return <FiscalYearWrapper />;
      case "dailyBook":
        return <DailyBookWrapper />;
      case "typeOfDocs":
        return <TypeOfDailyBookWrapper />;
      case "AccountGroup":
        return <AccountingTree />;
      case "TransactionManager":
        return <TransactionWrapper />;
      case "invoice":
        return <InvoiceStatusManager />;
      case "workflow":
        return <WorkflowWrapper />;
      case "provider":
        return <ProviderTabs />;
      case "inventory":
        return <InventoryTabs />;
      case "groupDetail":
        return <GroupDetailAccount />;
      default:
        return (
          <WelcomeScreen
            setActiveChild={setActiveChild}
            user={user}
            setIsOpen={setIsOpen}
          />
        );
    }
  } catch (error) {
    console.error("Error rendering child component:", error);
    return (
      <div className="p-4 text-red-600">
        <h2 className="text-lg font-bold">خطا در بارگذاری</h2>
        <p>لطفاً دوباره تلاش کنید.</p>
      </div>
    );
  }
};

const SideBar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);

  // Handle URL hash changes and browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const validChildIds = navMenuItems
        .flatMap((item) => item.children?.map((child) => child.id) || [])
        .concat(quickAccessItems.map((item) => item.id));

      if (hash && validChildIds.includes(hash)) {
        setActiveChild(hash);
        // Auto-open parent dropdown if needed
        const parentItem = navMenuItems.find((item) =>
          item.children?.some((child) => child.id === hash)
        );
        if (parentItem) {
          setOpenDropdown(parentItem.id);
        }
      } else if (!hash) {
        setActiveChild(null);
        setOpenDropdown(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  // Update URL when activeChild changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHash = window.location.hash.slice(1);

      if (activeChild && currentHash !== activeChild) {
        window.history.pushState(null, "", `#${activeChild}`);
      } else if (activeChild === null && currentHash) {
        window.history.pushState(null, "", window.location.pathname);
      }
    }
  }, [activeChild]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Open animations
      gsap.set(sidebarRef.current, { display: "block" });
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        sidebarRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" }
      );
      gsap.fromTo(
        contentRef.current?.children || [],
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, delay: 0.2 }
      );
    } else {
      // Close animations
      gsap.to(contentRef.current?.children || [], {
        opacity: 0,
        x: 50,
        duration: 0.2,
        stagger: 0.03,
      });
      gsap.to(sidebarRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        onComplete: () => setIsOpen(false),
      });
    }
  };

  const handleDropdownToggle = (itemId: string) => {
    const isCurrentlyOpen = openDropdown === itemId;
    const newOpenDropdown = isCurrentlyOpen ? null : itemId;
    setOpenDropdown(newOpenDropdown);

    // Animate dropdown
    const dropdownElement = document.querySelector(
      `[data-dropdown="${itemId}"]`
    );
    if (dropdownElement) {
      if (!isCurrentlyOpen) {
        gsap.fromTo(
          dropdownElement,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(
          dropdownElement.children,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.2, stagger: 0.05, delay: 0.1 }
        );
      } else {
        gsap.to(dropdownElement.children, {
          opacity: 0,
          y: -10,
          duration: 0.15,
          stagger: 0.03,
        });
        gsap.to(dropdownElement, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          delay: 0.1,
        });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        toggleSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="flex h-full" dir="rtl">
      {/* Toggle Button */}
      <button
        ref={toggleButtonRef}
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
        aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      {isOpen && (
        <div
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 border-l border-gray-200"
        >
          <div ref={contentRef} className="h-full flex flex-col py-6 px-4">
            {/* Header */}
            <div className="mt-16 mb-8 px-4">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer"
                onClick={() => setActiveChild(null)}
              >
                <h1 className="text-xl font-bold text-white">آبنوس پلتفورم</h1>
                <div className="bg-white p-2 rounded-full">
                  <Image
                    src="/assets/images/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 overflow-y-auto">
              <ul className="space-y-3">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isDropdownOpen = openDropdown === item.id;
                  return (
                    <li key={item.id} className="rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleDropdownToggle(item.id)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-right rounded-xl transition-all duration-300 ${
                          isDropdownOpen
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="ml-3 bg-white p-2 rounded-lg shadow-sm">
                            <Icon size={18} />
                          </div>
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {item.children && (
                        <div
                          data-dropdown={item.id}
                          className={`overflow-hidden ${
                            isDropdownOpen ? "" : "h-0 opacity-0"
                          }`}
                        >
                          <ul className="ml-6 mt-2 space-y-1 border-r-2 border-indigo-200 pr-4">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <li key={child.id}>
                                  <button
                                    onClick={() => {
                                      setActiveChild(child.id);
                                      toggleSidebar();
                                    }}
                                    className={`flex items-center w-full text-right px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                                      activeChild === child.id
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md"
                                        : "text-gray-500 hover:bg-gray-100"
                                    }`}
                                  >
                                    <div className="ml-2 opacity-80">
                                      <ChildIcon size={14} />
                                    </div>
                                    {child.title}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="mt-auto py-4 px-3">
              <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold ml-3 shadow-md">
                  {user?.username}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-indigo-800">
                    {user?.username || "کاربر مهمان"}
                  </span>
                </div>
                <button
                  className="mr-auto text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/auth";
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>

              <div className="mt-4 text-center text-xs text-gray-400 flex justify-center items-center gap-2">
                <span className="px-2 py-1 bg-indigo-50 rounded-full">
                  نسخه ۱.۰.۰
                </span>
                <span>•</span>
                <span>آبنوس سیستم</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 p-4">
        <main className="w-full">
          {renderChildComponent(
            activeChild,
            setActiveChild,
            setIsOpen,
            user?.username || "کاربر مهمان"
          )}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
