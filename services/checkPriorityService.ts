export interface Check {
  _id: string;
  checkNumber: number;
  seryNumber: number;
  fromBank: Array<{
    shobe?: string;
    name?: string;
    accountNumber?: string;
    _id?: string;
  }>;
  status:
    | "nazeSandogh"
    | "darJaryanVosool"
    | "vosoolShode"
    | "bargashti"
    | "enteghalDadeShode";
  inboxStatus?:
    | "darJaryanVosool"
    | "vosoolShode"
    | "bargashti"
    | "enteghalDadeShode"
    | null;
  toBank: string;
  amount: number;
  dueDate: string;
  description?: string;
  documentNumber?: string;
  paidBy: string | { _id: string; name: string; code: string };
  payTo: { _id: string; name: string; code: string };
  receiverName?: string;
  senderName?: string;
  type: "income" | "outcome";
  createdAt: string;
  updatedAt: string;
}

export interface CheckPriority {
  level: "critical" | "high" | "medium" | "low";
  days: number;
  color: string;
}

export class CheckPriorityService {
  static convertPersianToEnglish(str: string): string {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result = str;
    for (let i = 0; i < persianDigits.length; i++) {
      result = result.replace(
        new RegExp(persianDigits[i], "g"),
        englishDigits[i]
      );
    }
    return result;
  }

  static getDaysUntilDue(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const englishDate = this.convertPersianToEnglish(dateStr);
    let dueDate: Date;

    if (englishDate.includes("/")) {
      const parts = englishDate.split("/");
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        if (year > 1400) {
          const gregorianYear = year - 979;
          dueDate = new Date(gregorianYear, month - 1, day);
        } else {
          dueDate = new Date(year, month - 1, day);
        }
      } else {
        dueDate = new Date(englishDate);
      }
    } else {
      dueDate = new Date(englishDate);
    }

    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log("📅 محاسبه تاریخ:", {
      original: dateStr,
      dueDate: dueDate.toISOString().split("T")[0],
      today: today.toISOString().split("T")[0],
      daysUntilDue:
        daysUntilDue > 0
          ? `${daysUntilDue} روز مانده`
          : `${Math.abs(daysUntilDue)} روز معوقه`,
    });

    return daysUntilDue;
  }

  static getCheckPriority(dueDate: string): CheckPriority {
    const daysUntilDue = this.getDaysUntilDue(dueDate);

    if (daysUntilDue <= 1)
      return {
        level: "critical",
        days: daysUntilDue,
        color: "bg-red-100 text-red-800 border-red-200",
      };
    if (daysUntilDue <= 3)
      return {
        level: "high",
        days: daysUntilDue,
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    if (daysUntilDue <= 7)
      return {
        level: "medium",
        days: daysUntilDue,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return {
      level: "low",
      days: daysUntilDue,
      color: "bg-green-100 text-green-800 border-green-200",
    };
  }

  static getOverdueChecks(checks: Check[]): Check[] {
    const upcomingChecks = checks.filter((check) => {
      // if (check.type !== "income") {
      //   return false;
      // }

      if (
        check.status !== "nazeSandogh" &&
        check.status !== "darJaryanVosool"
      ) {
        return false;
      }

      const daysUntilDue = this.getDaysUntilDue(check.dueDate);
      const isDueSoon = daysUntilDue >= 1 && daysUntilDue <= 7;

      return isDueSoon;
    });

    return upcomingChecks.sort((a, b) => {
      const aDaysUntilDue = this.getDaysUntilDue(a.dueDate);
      const bDaysUntilDue = this.getDaysUntilDue(b.dueDate);
      return aDaysUntilDue - bDaysUntilDue;
    });
  }
  static getChecksDueInAWeek(checks: Check[]): Check[] {
    return checks
      .filter((check) => {
        // if (check.type !== "income") return false;

        if (
          check.status !== "nazeSandogh" &&
          check.status !== "darJaryanVosool"
        )
          return false;

        const daysUntilDue = this.getDaysUntilDue(check.dueDate);

        // منفی یعنی موعد نرسیده، و |daysPastDue| <= 7 یعنی 7 روز یا کمتر مونده
        return daysUntilDue >= 1 && daysUntilDue <= 7;
      })
      .sort((a, b) => {
        const aDays = this.getDaysUntilDue(a.dueDate);
        const bDays = this.getDaysUntilDue(b.dueDate);
        return aDays - bDays; // نزدیک‌تر به امروز اول
      });
  }

  static getBorderColor(priority: CheckPriority): string {
    if (priority.level === "critical") return "border-r-red-500";
    if (priority.level === "high") return "border-r-orange-500";
    if (priority.level === "medium") return "border-r-yellow-500";
    return "border-r-green-500";
  }

  static getDaysText(days: number): string {
    if (days < 0) return `${Math.abs(days)} روز معوقه`;
    if (days === 0) return "امروز سررسید";
    return `${days} روز مانده`;
  }
}
