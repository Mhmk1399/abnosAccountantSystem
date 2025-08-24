interface MonthInfo {
  monthNumber: number;
  monthName: string;
  totalDays: number;
  workingDays: number;
  fridays: number;
  holidays: number;
  holidayDates: number[];
}

interface HolidayData {
  date: string;
  is_holiday: boolean;
}

class ShamsiWorkingDaysService {
  private static readonly SHAMSI_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  private static readonly MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  private static async fetchHolidayData(year: number): Promise<HolidayData[]> {
    const response = await fetch(`https://raw.githubusercontent.com/hasan-ahani/shamsi-holidays/main/holidays/${year}.json`);
    return response.json();
  }

  static isLeapYear(year: number): boolean {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    let jp = breaks[0], jump = 0;
    for (let j = 1; j <= breaks.length; j++) {
      const jm = breaks[j];
      jump = jm - jp;
      if (year < jm) break;
      jp = jm;
    }
    let n = year - jp;
    if (n < jump) {
      n = n - Math.floor(n / 33) * 8;
      if (Math.floor(n % 33) % 4 === 1 && Math.floor(n % 33) !== 1) return true;
    }
    return false;
  }

  static async calculateWorkingDays(monthNumber: number, year: number): Promise<MonthInfo> {
    if (monthNumber < 1 || monthNumber > 12) {
      throw new Error('Month number must be between 1 and 12');
    }

    const totalDays = monthNumber === 12 && this.isLeapYear(year) ? 30 : this.MONTH_DAYS[monthNumber - 1];
    const holidayData = await this.fetchHolidayData(year);
    
    const monthHolidays = holidayData.filter(day => {
      const [y, m] = day.date.split('-').map(Number);
      return y === year && m === monthNumber && day.is_holiday;
    });

    const fridays = Math.floor(totalDays / 7) + (totalDays % 7 >= 6 ? 1 : 0);
    const holidays = monthHolidays.length;
    const holidayDates = monthHolidays.map(h => parseInt(h.date.split('-')[2]));
    const workingDays = totalDays - fridays - holidays;

    return {
      monthNumber,
      monthName: this.SHAMSI_MONTHS[monthNumber - 1],
      totalDays,
      workingDays,
      fridays,
      holidays,
      holidayDates
    };
  }

  static async getAllMonthsWorkingDays(year: number): Promise<MonthInfo[]> {
    const results = [];
    for (let month = 1; month <= 12; month++) {
      results.push(await this.calculateWorkingDays(month, year));
    }
    return results;
  }
}

export default ShamsiWorkingDaysService;
export type { MonthInfo };