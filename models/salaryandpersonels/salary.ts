import mongoose, { Schema, Document, model, Types } from "mongoose";

export interface ISalary extends Document {
  staff: Types.ObjectId;
  month: number;
  year: number;
  workHurs: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance: number;
  seniority: number;
  overtimeHours: number;
  holidaywokrks: number;
  holidaywokrkspay: number;
  overtimePay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  dificits: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalarySchema: Schema = new Schema({
  // This creates the reference to the Staff model
  staff: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  workHurs: {
    type: Number,
    required: true,
    default: 0,
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  housingAllowance: {
    type: Number,
    default: 0,
  },
  workerVoucher: {
    type: Number,
    default: 0,
  },
  childAllowance: {
    type: Number,
    default: 0,
  },
  seniority: {
    type: Number,
    default: 0,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
  holidaywokrks: {
    type: Number,
    default: 0,
  },
  holidaywokrkspay: {
    type: Number,
    default: 0,
  },
  overtimePay: {
    type: Number,
    default: 0,
  },
  taxDeduction: {
    type: Number,
    default: 0,
  },
  insuranceDeduction: {
    type: Number,
    default: 0,
  },
  dificits: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  netPay: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Salary || model<ISalary>("Salary", SalarySchema);
