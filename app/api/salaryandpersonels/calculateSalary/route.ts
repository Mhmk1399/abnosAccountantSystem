import { NextRequest, NextResponse } from 'next/server';
import { calculateStaffSalary, calculateAllActiveStaffSalaries } from '@/services/calulateTheWorkerWorkes';
import Staff from '@/models/salaryandpersonels/staff';
import connect from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { staffId, month, year, calculateAll } = await request.json();

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    if (calculateAll) {
      const results = await calculateAllActiveStaffSalaries(month, year);
      const staffData = await Staff.find({
        $or: [
          { contractendDate: { $exists: false } },
          { contractendDate: { $gte: new Date() } },
        ],
      });

      const enrichedResults = results.map(result => {
        const staff = staffData.find(s => s._id.toString() === result.staffId);
        return {
          ...result,
          staffName: staff ? `${staff.title} ${staff.name}` : `کارمند ${result.staffId}`,
          childAllowance: result.childAllowances,

        };
      });

      return NextResponse.json({ results: enrichedResults });
    }

    if (!staffId) {
      return NextResponse.json(
        { error: 'Staff ID is required for individual calculation' },
        { status: 400 }
      );
    }

    const result = await calculateStaffSalary(staffId, month, year);
    const staff = await Staff.findById(staffId);
    
    const enrichedResult = {
      ...result,
      staffName: staff ? `${staff.title} ${staff.name}` : `کارمند ${result.staffId}`,
      childAllowance: result.childAllowances,
      overtimeHours: 0,
      overtimePay: 0,
      holidayWorks: 0,
      holidayWorksPay: 0,
    };

    return NextResponse.json({ result: enrichedResult });

  } catch (error) {
    console.error('Error calculating salary:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();
    const staff = await Staff.find({
      $or: [
        { contractendDate: { $exists: false } },
        { contractendDate: { $gte: new Date() } },
      ],
    }).select('_id title name position');

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}