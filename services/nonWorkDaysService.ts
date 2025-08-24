import Rollcall from "@/models/salaryandpersonels/rollcall";
import connect from "@/lib/data";

export interface NonWorkDaysSummary {
  staffId: string;
  absent: number;
  permission: number;
  medical: number;
  total: number;
  period: string;
}

export const calculateNonWorkDays = async (
  staffId: string,
  year: number,
  month?: number
): Promise<NonWorkDaysSummary> => {
  await connect();

  const filter: any = { staff: staffId, year };
  if (month) filter.month = month;

  const rollcalls = await Rollcall.find(filter);
  console.log(rollcalls);
  let absent = 0;
  let permission = 0;
  let medical = 0;

  rollcalls.forEach((rollcall) => {
    rollcall.days.forEach((day: { status: string }) => {
      if (day.status === "absent") absent++;
      else if (day.status === "permission") permission++;
      else if (day.status === "medical") medical++;
    });
  });

  const period = month ? `${year}/${month}` : `${year}`;

  return {
    staffId,
    absent,
    permission,
    medical,
    total: absent + permission + medical,
    period,
  };
};
