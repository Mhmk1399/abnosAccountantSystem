import mongoose from "mongoose";

export interface WorkflowDocument {
  name: string;
  trigger: {
    model: string;
    method: string;
  };
  steps: WorkflowStep[];
  dailyBookConfig: {
    debitEntries: Array<{
      accountGroup: string;
      totalAccount: string;
      fixedAccounts: string;
      detailed1?: string;
      detailed2?: string;
      amountField: string;
      descriptionTemplate: string;
    }>;
    creditEntries: Array<{
      accountGroup: string;
      totalAccount: string;
      fixedAccounts: string;
      detailed1?: string;
      detailed2?: string;
      amountField: string;
      descriptionTemplate: string;
    }>;
    autoFiscalYear: boolean;
  };
}

export interface WorkflowStep {
  action: string;
  model: string;
  method: string;
  dataMapping: Record<string, string>;
}

const StepSchema = new mongoose.Schema({
  action: String,
  model: String,
  method: String,
  dataMapping: Object,
});

const WorkflowSchema = new mongoose.Schema({
  name: String,
  trigger: {
    model: String,
    method: String,
  },
  steps: [StepSchema],
  dailyBookConfig: {
    debitEntries: [
      {
        accountGroup: {
          type: mongoose.Types.ObjectId,
          ref: "AccountGroup",
          required: true,
        },
        totalAccount: {
          type: mongoose.Types.ObjectId,
          ref: "TotalAccount",
          required: true,
        },
        fixedAccounts: {
          type: mongoose.Types.ObjectId,
          ref: "FixedAccount",
          required: true,
        },
        detailed1: { type: mongoose.Types.ObjectId, ref: "DetailedAccount" },
        detailed2: { type: mongoose.Types.ObjectId, ref: "DetailedAccount" },
        amountField: String,
        descriptionTemplate: String,
      },
    ],
    creditEntries: [
      {
        accountGroup: {
          type: mongoose.Types.ObjectId,
          ref: "AccountGroup",
          required: true,
        },
        totalAccount: {
          type: mongoose.Types.ObjectId,
          ref: "TotalAccount",
          required: true,
        },
        fixedAccounts: {
          type: mongoose.Types.ObjectId,
          ref: "FixedAccount",
          required: true,
        },
        detailed1: { type: mongoose.Types.ObjectId, ref: "DetailedAccount" },
        detailed2: { type: mongoose.Types.ObjectId, ref: "DetailedAccount" },
        amountField: String,
        descriptionTemplate: String,
      },
    ],
    autoFiscalYear: { type: Boolean, default: true },
  },
});

export default mongoose.models.Workflow ||
  mongoose.model("Workflow", WorkflowSchema);
