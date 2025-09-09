import type { Metadata } from "next";
import "./globals.css";
import { ray } from "@/next-persian-fonts/ray";
import { Toaster } from "react-hot-toast";
import { DailyBookProvider } from "@/contexts/DailyBookContext";
import { FiscalYearProvider } from "@/contexts/FiscalYearContext";
import FiscalYearModalHandler from "@/components/global/FiscalYearModalHandler";

export const metadata: Metadata = {
  title: "سامانه حسابداری ابنوس",
  description: "سامانه حسابداری ابنوس - مدیریت تراکنش‌ها، چک‌ها و گزارشات مالی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ray.className}>
        <Toaster
          gutter={12}
          position="top-center"
          reverseOrder={false}
          containerStyle={{
            direction: "rtl",
          }}
        />
        <FiscalYearProvider>
          <DailyBookProvider> {children}</DailyBookProvider>
          <FiscalYearModalHandler />
        </FiscalYearProvider>
      </body>
    </html>
  );
}
