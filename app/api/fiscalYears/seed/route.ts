import data from "@/lib/data";
import { NextResponse } from "next/server";
import FiscalYear from "@/models/fiscalYear";

// POST: Seed fiscal years data for testing
export const POST = async () => {
  await data();
  try {
    // Clear existing data
    await FiscalYear.deleteMany({});

    const fiscalYearsData = [
      {
        name: "سال مالی 1400",
        startDate: new Date("2021-03-21"),
        endDate: new Date("2022-03-20"),
        isActive: false
      },
      {
        name: "سال مالی 1401",
        startDate: new Date("2022-03-21"),
        endDate: new Date("2023-03-20"),
        isActive: false
      },
      {
        name: "سال مالی 1402",
        startDate: new Date("2023-03-21"),
        endDate: new Date("2024-03-20"),
        isActive: true
      },
      {
        name: "سال مالی 1403",
        startDate: new Date("2024-03-21"),
        endDate: new Date("2025-03-20"),
        isActive: true
      },
      {
        name: "دوره مالی ویژه 1400",
        startDate: new Date("2021-01-01"),
        endDate: new Date("2021-12-31"),
        isActive: false
      },
      {
        name: "دوره مالی ویژه 1401",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2022-12-31"),
        isActive: false
      },
      {
        name: "سال مالی آزمایشی 1399",
        startDate: new Date("2020-03-21"),
        endDate: new Date("2021-03-20"),
        isActive: false
      },
      {
        name: "دوره حسابداری 1402",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2024-03-31"),
        isActive: true
      },
      {
        name: "سال مالی پیشنویس 1404",
        startDate: new Date("2025-03-21"),
        endDate: new Date("2026-03-20"),
        isActive: false
      },
      {
        name: "دوره مالی کوتاهمدت",
        startDate: new Date("2023-07-01"),
        endDate: new Date("2023-12-31"),
        isActive: false
      },
      {
        name: "سال مالی اصلی 1403",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        isActive: true
      },
      {
        name: "دوره انتقالی 1401-1402",
        startDate: new Date("2022-12-01"),
        endDate: new Date("2023-05-31"),
        isActive: false
      },
      {
        name: "سال مالی تجمیعی 1400-1401",
        startDate: new Date("2021-01-01"),
        endDate: new Date("2022-12-31"),
        isActive: false
      },
      {
        name: "دوره مالی فوقالعاده",
        startDate: new Date("2023-10-01"),
        endDate: new Date("2024-09-30"),
        isActive: true
      },
      {
        name: "سال مالی بودجه 1405",
        startDate: new Date("2026-03-21"),
        endDate: new Date("2027-03-20"),
        isActive: false
      }
    ];

    const createdFiscalYears = await FiscalYear.insertMany(fiscalYearsData);

    return NextResponse.json({
      message: `${createdFiscalYears.length} fiscal years created successfully`,
      count: createdFiscalYears.length
    }, { status: 201 });

  } catch (error) {
    console.error("Error seeding fiscal years:", error);
    return NextResponse.json(
      { error: "Failed to seed fiscal years" },
      { status: 500 }
    );
  }
};