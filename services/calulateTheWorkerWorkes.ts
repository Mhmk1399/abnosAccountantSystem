import Salary from "@/models/salaryandpersonels/salary";
import Staff from "@/models/salaryandpersonels/staff";
import Rollcall from "@/models/salaryandpersonels/rollcall";
import Deficit from "@/models/salaryandpersonels/deficit";
import SalaryLaws from "@/models/salaryandpersonels/salaryLaws";
import ShamsiWorkingDaysService from "@/services/shamsiWorkingDaysService";
import connect from "@/lib/data";

export interface SalaryCalculationResult {
  staffId: string;
  month: number;
  year: number;
  workHours: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowances: number;
  seniority: number;
  totalEarnings: number;
  taxDeduction: number;
  insuranceDeduction: number;
  deficits: number;
  totalDeductions: number;
  netPay: number;
  MarriageAllowance: number;
  extraWorkPay: number;
  extraHours: number;
  workingDays: number;
  dailyBaseSalary:number
  extraWorkPayFee:number
}

// Jalali months with their day counts
const JALALI_MONTH_DAYS = {
  1: 31,
  2: 31,
  3: 31,
  4: 31,
  5: 31,
  6: 31,
  7: 30,
  8: 30,
  9: 30,
  10: 30,
  11: 30,
  12: 29, // 12th month can be 30 in leap years
};

const getJalaliMonthDays = (month: number): number => {
  return JALALI_MONTH_DAYS[month as keyof typeof JALALI_MONTH_DAYS] || 30;
};

export const calculateStaffSalary = async (
  staffId: string,
  month: number,
  year: number
): Promise<SalaryCalculationResult> => {
  await connect();

  const staff = await Staff.findById(staffId);
  if (!staff) throw new Error("Staff not found");
  const rollcallyear = year + 621;
  // Get rollcall data
  const rollcall = await Rollcall.findOne({
    staff: staffId,
    month,
    year: year,
  });
  if (!rollcall) throw new Error("Rollcall data not found");

  // Get salary laws for the year
  const salaryLaws = await SalaryLaws.findOne({ year: year });
  if (!salaryLaws) throw new Error(`Salary laws not found for year ${year}`);
  // Calculate work hours based on attendance rules
  let totalWorkHours = 0;
  rollcall.days.forEach(
    (day: {
      status: string;
      entryTime: string;
      exitTime: string;
      launchtime: string;
    }) => {
      if (day.status === "present" && day.entryTime && day.exitTime) {
        const [entryHour, entryMin] = day.entryTime.split(":").map(Number);
        const [exitHour, exitMin] = day.exitTime.split(":").map(Number);
        const [lunchHour, lunchMin] = (day.launchtime || "1:00")
          .split(":")
          .map(Number);
        const dailyHours =
          exitHour +
          exitMin / 60 -
          (entryHour + entryMin / 60) -
          (lunchHour + lunchMin / 60);
        totalWorkHours += dailyHours;
      } else if (day.status === "permission") {
        totalWorkHours += salaryLaws.workHoursPerDay;
      } else if (day.status === "absent") {
        totalWorkHours -= salaryLaws.workHoursPerDay;
      }
      // medical status: no change to hours
    }
  );
  // console.log(totalWorkHours,"totalWorkHours")
  const workHours = Math.max(0, totalWorkHours);
  const workingDays = workHours / salaryLaws.workHoursPerDay;

  // Get official working days for the month
  const monthInfo = await ShamsiWorkingDaysService.calculateWorkingDays(
    month,
    year
  );
  const extraWorkingDays = workingDays - monthInfo.workingDays;

  // Get deficits
  const deficits = await Deficit.find({
    staff: staffId,
    mont: month,
    year: year,
  });
  const totalDeficits = deficits.reduce((sum, d) => sum + d.amount, 0);

  // Get month working days for proration
  const monthWorkingDays =  monthInfo.workingDays
  console.log( monthInfo.workingDays, "monthWorkingDays");
  // Calculate salary components
  const dailyBaseSalary = staff.baseSalary || salaryLaws.baseSalary;
  const baseSalary = workingDays * dailyBaseSalary; //salary without calculating extra pay
  
  // Prorate allowances based on working days
  const housingAllowance = workingDays >= monthWorkingDays 
    ? salaryLaws.housingAllowance 
    : (salaryLaws.housingAllowance / monthWorkingDays) * workingDays;
    
  const workerVoucher = workingDays >= monthWorkingDays 
    ? salaryLaws.workerVoucher 
    : (salaryLaws.workerVoucher / monthWorkingDays) * workingDays;

  const childAllowances = workingDays >= monthWorkingDays 
    ? Number(salaryLaws.childAllowance) * Number(staff.childrenCounts)
    : (Number(salaryLaws.childAllowance) * Number(staff.childrenCounts) / monthWorkingDays) * workingDays;

  const seniority = staff.workExperience ? salaryLaws.seniorityPay : 0; //mazaya personel
  let extraWorkPay = 0;
  const exitTimePay = dailyBaseSalary / salaryLaws.workHoursPerDay;
  let extraHours = 0;
  if (extraWorkingDays > 0) {
    extraHours = extraWorkingDays * salaryLaws.workHoursPerDay;
  }
 const extraWorkPayFee=exitTimePay*salaryLaws.overtimeRate
  console.log(exitTimePay);
  if (extraWorkingDays > 0) {
    extraWorkPay =
      extraWorkingDays *
      salaryLaws.workHoursPerDay *
      extraWorkPayFee;
  } //calculate extra payment base hours
  // const overtimePay = overtimeHours * salaryLaws.overtimeRate;
  let MarriageAllowance;
  if (staff.ismaried) {
    MarriageAllowance = workingDays >= monthWorkingDays 
      ? salaryLaws.MarriageAllowance 
      : (salaryLaws.MarriageAllowance / monthWorkingDays) * workingDays;
  } else {
    MarriageAllowance = 0;
  }

  const totalEarnings =
    baseSalary +
    housingAllowance +
    workerVoucher +
    childAllowances +
    seniority +
    MarriageAllowance +
    extraWorkPay;
  console.log(totalEarnings, "totalEarnings");
  let taxDeduction;
  if (totalEarnings > salaryLaws.taxStandard) {
    taxDeduction = totalEarnings * salaryLaws.taxRate;
  } else {
    taxDeduction = 0;
  }
  const insuranceDeduction = totalEarnings * salaryLaws.insuranceRate;
  const totalDeductions = taxDeduction + insuranceDeduction + totalDeficits;

  const netPay = totalEarnings - totalDeductions;

  return {
    staffId,
    dailyBaseSalary,
    month,
    year,
    workHours,
    baseSalary,
    housingAllowance,
    workerVoucher,
    childAllowances,
    seniority,
    totalEarnings,
    extraWorkPay,
    taxDeduction,
    insuranceDeduction,
    deficits: totalDeficits,
    totalDeductions,
    MarriageAllowance,
    extraHours,
    netPay,
    extraWorkPayFee,
    workingDays,
  };
};

export const calculateAllActiveStaffSalaries = async (
  month: number,
  year: number
): Promise<SalaryCalculationResult[]> => {
  await connect();

  const activeStaff = await Staff.find({
    $or: [
      { contractendDate: { $exists: false } },
      { contractendDate: { $gte: new Date() } },
    ],
  });

  const results: SalaryCalculationResult[] = [];

  for (const staff of activeStaff) {
    try {
      const calculation = await calculateStaffSalary(
        staff._id.toString(),
        month,
        year
      );
      results.push(calculation);
    } catch (error) {
      console.error(`Error calculating salary for staff ${staff._id}:`, error);
    }
  }

  return results;
};
