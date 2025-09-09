import FiscalYear from "@/models/fiscalYear";

export const findFiscalYearByDate = async (date: Date | string) => {
  return await FiscalYear.findOne({
    startDate: { $lte: date },
    endDate: { $gte: date },
  });
};
