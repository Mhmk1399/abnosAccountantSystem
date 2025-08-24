// src/app/api/salaryandpersonels/leave/route.ts
import { NextResponse } from "next/server";
import staff from "@/models/salaryandpersonels/staff";
import rollcall, { IDailyRecord } from "@/models/salaryandpersonels/rollcall";
import connect from "@/lib/data";
import jalaali from "jalaali-js";

// تعداد روزهای هر ماه شمسی
const getDaysInJalaaliMonth = (jy: number, jm: number) => {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
};

// محاسبه مرخصی بر اساس روز
const calculateMonthlyLeave = (
  contractDate: Date,
  contractEndDate: Date | null,
  persianYear: number
) => {
  const annualLeave = 26;
  const monthlyLeave = annualLeave / 12;
  const leavePerMonth = Array(12).fill(0);

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getDaysInJalaaliMonth(persianYear, month);
    const {
      gy: sGy,
      gm: sGm,
      gd: sGd,
    } = jalaali.toGregorian(persianYear, month, 1);
    const {
      gy: eGy,
      gm: eGm,
      gd: eGd,
    } = jalaali.toGregorian(persianYear, month, daysInMonth);

    const monthStart = new Date(sGy, sGm - 1, sGd);
    const monthEnd = new Date(eGy, eGm - 1, eGd);

    const activeStart = contractDate > monthStart ? contractDate : monthStart;
    const activeEnd =
      contractEndDate && contractEndDate < monthEnd
        ? contractEndDate
        : monthEnd;

    const activeDays =
      activeEnd.getTime() >= activeStart.getTime()
        ? Math.floor(
            (activeEnd.getTime() - activeStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 0;

    leavePerMonth[month - 1] = (activeDays / daysInMonth) * monthlyLeave;
  }

  return leavePerMonth;
};

export const GET = async (req: Request) => {
  await connect();
  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const jy = yearParam ? parseInt(yearParam) : jalaali.toJalaali(new Date()).jy;

  try {
    const staffMembers = await staff.find({ isActive: true });
    const leaveData: Array<{
      staffId: string;
      name: string;
      position: string;
      contracthireDate: Date;
      contractendDate: Date | null;
      annualLeave: number;
      leavePerMonth: number[];
      usedLeavePerMonth: number[];
      remainingLeavePerMonth: number[];
      totalUsedLeave: number;
      totalRemainingLeave: number;
    }> = [];

    for (const staffMember of staffMembers) {
      const contractDate = new Date(staffMember.contracthireDate);
      const contractEndDate = staffMember.contractendDate
        ? new Date(staffMember.contractendDate)
        : null;

      const leavePerMonth = calculateMonthlyLeave(
        contractDate,
        contractEndDate,
        jy
      );

      const rollcallData = await rollcall.find({
        staff: staffMember._id,
        year: jy,
      });

      const usedLeavePerMonth = Array(12).fill(0);
      rollcallData.forEach((monthData) => {
        monthData.days.forEach((day: IDailyRecord) => {
          if (["medical", "absent", "permission"].includes(day.status)) {
            usedLeavePerMonth[monthData.month - 1]++;
          }
        });
      });

      const remainingLeavePerMonth = leavePerMonth.map(
        (val, idx) => val - usedLeavePerMonth[idx]
      );

      leaveData.push({
        staffId: staffMember._id,
        name: staffMember.name,
        position: staffMember.position,
        contracthireDate: staffMember.contracthireDate,
        contractendDate: staffMember.contractendDate,
        annualLeave: 26,
        leavePerMonth,
        usedLeavePerMonth,
        remainingLeavePerMonth,
        totalUsedLeave: usedLeavePerMonth.reduce((a, b) => a + b, 0),
        totalRemainingLeave: remainingLeavePerMonth.reduce((a, b) => a + b, 0),
      });
    }

    return NextResponse.json({ leaveData });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
