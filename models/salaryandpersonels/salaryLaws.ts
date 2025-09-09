import mongoose, { Schema, Document, model } from "mongoose";

export interface ISalaryLaws extends Document {
  year: number;
  workHoursPerDay: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance1: number;
  childAllowance2: number;
  seniorityPay: number;
  overtimeRate: number;
  holidayRate: number;
  taxRate: number;
  insuranceRate: number;
  MarriageAllowance: number;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryLawsSchema: Schema = new Schema(
  {
    year: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
    },
    workHoursPerDay: {
      type: Number,
      required: true,
      default: 7.33,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    housingAllowance: {
      type: Number,
      required: true,
    },
    workerVoucher: {
      type: Number,
      required: true,
    },
    childAllowance: {
      type: Number,
      required: true,
    },
    seniorityPay: {
      type: Number,
      required: true,
    },
    overtimeRate: {
      type: Number,
      required: true,
    },
    holidayRate: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 0.1,
    },
    insuranceRate: {
      type: Number,
      required: true,
      default: 0.07,
    },
    MarriageAllowance: {
      type: Number,
    },
    taxStandard: {
      type: Number,
      default: 20000000,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SalaryLaws ||
  model<ISalaryLaws>("SalaryLaws", SalaryLawsSchema);
