import { NextResponse, NextRequest } from "next/server";
import Rollcall from "@/models/salaryandpersonels/rollcall";
import staff from "@/models/salaryandpersonels/staff";
import connect from "@/lib/data";

// GET: Get rollcall data for a specific month/year
export const GET = async (req: NextRequest) => {
  await connect();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const staffId = searchParams.get("staffId");

  try {
    const query: Record<string, unknown> = {};

    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    if (staffId) {
      query.staff = staffId;
    }

    const rollcallData = await Rollcall.find(query).populate(
      "staff",
      "name title position"
    );
    return NextResponse.json(rollcallData);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create or update rollcall for staff members
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const { month, year, staffId, days } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    // If staffId is provided, create/update for specific staff
    if (staffId) {
      const existingRollcall = await Rollcall.findOne({
        staff: staffId,
        month,
        year,
      });

      if (existingRollcall) {
        existingRollcall.days = days;
        await existingRollcall.save();
        return NextResponse.json({ rollcall: existingRollcall });
      } else {
        const newRollcall = await Rollcall.create({
          staff: staffId,
          month,
          year,
          days: days || [],
        });
        return NextResponse.json({ rollcall: newRollcall }, { status: 201 });
      }
    }

    // Create rollcall for all staff members
    const allStaff = await staff.find();
    const daysInMonth = new Date(year, month, 0).getDate();

    const rollcallPromises = allStaff.map(async (staffMember) => {
      const existingRollcall = await Rollcall.findOne({
        staff: staffMember._id,
        month,
        year,
      });

      if (!existingRollcall) {
        // Create default days array for the month
        const defaultDays = Array.from({ length: daysInMonth }, (_, index) => ({
          day: index + 1,
          status: "absent" as const,
          entryTime: "",
          launchtime: "1:00",
          exitTime: "",
          description: "",
        }));

        return Rollcall.create({
          staff: staffMember._id,
          month,
          year,
          days: defaultDays,
        });
      }
      return existingRollcall;
    });

    const rollcallData = await Promise.all(rollcallPromises);
    return NextResponse.json({ rollcalls: rollcallData }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update specific day attendance
export const PATCH = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const { staffId, month, year, day, dayData } = body;

    if (!staffId || !month || !year || !day) {
      return NextResponse.json(
        { error: "Staff ID, month, year, and day are required" },
        { status: 400 }
      );
    }

    const rollcall = await Rollcall.findOne({
      staff: staffId,
      month,
      year,
    });

    if (!rollcall) {
      return NextResponse.json(
        { error: "Rollcall record not found" },
        { status: 404 }
      );
    }

    // Find and update the specific day
    const dayIndex = rollcall.days.findIndex(
      (d: { day: number }) => d.day === day
    );
    if (dayIndex !== -1) {
      rollcall.days[dayIndex] = { ...rollcall.days[dayIndex], ...dayData };
    } else {
      rollcall.days.push({ day, ...dayData });
    }

    await rollcall.save();
    return NextResponse.json({ rollcall });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
