import mongoose, { ClientSession } from "mongoose";
import WorkflowModel, { WorkflowDocument } from "../models/workflow";

// Dynamically import models from your models directory
// If you already have an index.ts exporting all models, just import that
import * as Models from "../models";

interface WorkflowTrigger {
  model: string;
  method: string;
  processType?: string;
}

type StepResults = Record<string, any>;

export async function runWorkflow(
  trigger: WorkflowTrigger,
  requestData: any,
  session: ClientSession
): Promise<StepResults | void> {
  console.log(`🔍 Looking for workflow with trigger:`, trigger);
  
  const workflow: WorkflowDocument | null = await WorkflowModel.findOne({
    "trigger.model": trigger.model,
    "trigger.method": trigger.method,
    ...(trigger.processType && { "trigger.processType": trigger.processType }),
  });

  if (!workflow) {
    console.log(`ℹ️ No workflow found for trigger: ${JSON.stringify(trigger)}`);
    return;
  }

  console.log(`⚙️ Running workflow: ${workflow.name}`);
  console.log(`📋 Workflow steps:`, workflow.steps.length);
  console.log(`📊 DailyBook config:`, !!workflow.dailyBookConfig);

  const stepResults: StepResults = {};

  for (const step of workflow.steps) {
    console.log(`➡️ Executing step: ${step.action} (${step.method} ${step.model})`);

    const Model = (Models as any)[step.model];
    if (!Model) {
      console.error(`❌ Model "${step.model}" not found in Models`);
      console.log(`📦 Available models:`, Object.keys(Models));
      throw new Error(`Model "${step.model}" not found`);
    }

    // Special handling for DailyBook with dailyBookConfig
    if (step.model === 'DailyBook' && workflow.dailyBookConfig) {
      console.log(`📚 Processing DailyBook with config...`);
      const mappedData = await createDailyBookEntries({}, requestData, stepResults, workflow, session);
      console.log(`📚 DailyBook entries created:`, {
        debitCount: mappedData.debitEntries?.length,
        creditCount: mappedData.creditEntries?.length,
        totalDebit: mappedData.totalDebit,
        totalCredit: mappedData.totalCredit
      });
      
      // Create DailyBook directly
      const result = await Model.create([mappedData], { session });
      stepResults[step.action] = result[0];
      console.log(`✅ Step "${step.action}" completed successfully`);
      continue;
    }
    
    // Regular data mapping for other models
    let mappedData = mapData(requestData, stepResults, step.dataMapping, step.model);
    
    // Skip step if no data mapping for non-DailyBook models
    if (!mappedData || Object.keys(mappedData).length === 0) {
      console.log(`⏭️ Skipping step ${step.action} - no data mapping`);
      continue;
    }

    let result: any;
    try {
      switch (step.method) {
        case "POST":
          result = await Model.create([mappedData], { session });
          result = result[0];
          break;

        case "PATCH":
          result = await Model.updateOne({ _id: mappedData.id }, mappedData, { session });
          break;

        case "DELETE":
          result = await Model.deleteOne({ _id: mappedData.id }, { session });
          break;

        case "GET":
          if ((step as any).findOne) {
            result = await Model.findOne(mappedData).session(session);
          } else {
            result = await Model.find(mappedData).session(session);
          }
          break;

        default:
          throw new Error(`Unsupported method: ${step.method}`);
      }

      stepResults[step.action] = result;
      console.log(`✅ Step "${step.action}" completed successfully`);
    } catch (stepError) {
      console.error(`❌ Step "${step.action}" failed:`, stepError);
      throw stepError;
    }
  }

  console.log(`🎉 Workflow "${workflow.name}" completed successfully`);
  return stepResults;
}

// Map request and step results to step input
// Field mappings for consistent naming
const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  CheckTransaction: {
    "debit": "paidBy",
    "credit": "payTo",
    "date": "dueDate"
  },
  Transaction: {
    "debit": "sourceAccount",
    "credit": "destinationAccount"
  },
  DailyBook: {
    "debit": "debitEntries",
    "credit": "creditEntries"
  }
};

function mapData(
  requestData: any,
  stepResults: StepResults,
  mapping: Record<string, string>,
  modelName: string
): Record<string, any> {
  const result: Record<string, any> = {};
  const fieldMapping = FIELD_MAPPINGS[modelName] || {};

  console.log(`🗺️ Mapping data for ${modelName}:`);
  console.log(`📝 Request data keys:`, Object.keys(requestData));
  console.log(`🔗 Mapping config:`, mapping);

  // If no mapping provided, skip this step (don't create duplicate records)
  if (!mapping || Object.keys(mapping).length === 0) {
    console.log(`⚠️ No mapping provided for ${modelName}, skipping step`);
    return {};
  }

  for (const [field, path] of Object.entries(mapping || {})) {
    let value = resolvePath(requestData, stepResults, path);
    console.log(`🔄 Mapping ${field} = ${path} -> ${value}`);

    // Auto ObjectId casting
    if (isLikelyObjectIdField(field, value)) {
      value = new mongoose.Types.ObjectId(value);
    }

    // Map standardized field names to model field names
    const actualField = fieldMapping[field] || field;
    result[actualField] = value;
  }

  console.log(`✅ Final mapped data:`, result);
  return result;
}

function resolvePath(
  requestData: any,
  stepResults: StepResults,
  path: string
): any {
  if (typeof path !== "string") return path;

  if (path.startsWith("request.")) {
    return getNested(requestData, path.replace("request.", ""));
  }
  if (path.startsWith("step:")) {
    const [_, stepName, ...fieldPath] = path.split(".");
    return getNested(stepResults[stepName], fieldPath.join("."));
  }
  return path; // literal value
}

function getNested(obj: any, keyPath: string) {
  return keyPath.split(".").reduce((acc, key) => acc?.[key], obj);
}

function isLikelyObjectIdField(field: string, value: any) {
  return (
    (field.toLowerCase().endsWith("id") || field === "_id") &&
    typeof value === "string" &&
    mongoose.isValidObjectId(value)
  );
}

// Create DailyBook entries with multiple debit/credit logic
async function createDailyBookEntries(
  mappedData: any,
  requestData: any,
  stepResults: StepResults,
  workflow: WorkflowDocument,
  session: ClientSession
): Promise<any> {
  const { dailyBookConfig } = workflow;
  const currentDate = new Date(requestData.date || requestData.dueDate || Date.now());
  
  // Calculate fiscal year
  const fiscalYear = dailyBookConfig.autoFiscalYear ? 
    await calculateFiscalYear(currentDate) : 
    null;
  
  // Create unified data set
  const unifiedData = createUnifiedDataSet(requestData, stepResults);
  
  // Process debit entries
  const debitEntries = dailyBookConfig.debitEntries.map(entry => {
    const amount = getFieldValue(unifiedData, entry.amountField);
    const description = generateDescription(entry.descriptionTemplate, unifiedData, stepResults);
    
    return {
      accountGroup: entry.accountGroup,
      totalAccount: entry.totalAccount,
      fixedAccounts: entry.fixedAccounts,
      detailed1: entry.detailed1,
      detailed2: entry.detailed2,
      amount: Number(amount) || 0,
      description,
      fiscalYear: fiscalYear
    };
  });
  
  // Process credit entries
  const creditEntries = dailyBookConfig.creditEntries.map(entry => {
    const amount = getFieldValue(unifiedData, entry.amountField);
    const description = generateDescription(entry.descriptionTemplate, unifiedData, stepResults);
    
    return {
      accountGroup: entry.accountGroup,
      totalAccount: entry.totalAccount,
      fixedAccounts: entry.fixedAccounts,
      detailed1: entry.detailed1,
      detailed2: entry.detailed2,
      amount: Number(amount) || 0,
      description,
      fiscalYear: fiscalYear
    };
  });
  
  const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Update account balances
  await updateAccountBalances(debitEntries, creditEntries, fiscalYear, session);
  
  return {
    ...mappedData,
    documentNumber: mappedData.documentNumber || generateDocumentNumber(fiscalYear || new Date().getFullYear()),
    date: currentDate,
    fiscalYear,
    description: generateDescription('سند شماره {documentNumber}', unifiedData, stepResults),
    debitEntries,
    creditEntries,
    totalDebit,
    totalCredit
  };
}

// Calculate fiscal year based on date - returns ObjectId of active fiscal year
async function calculateFiscalYear(date: Date): Promise<mongoose.Types.ObjectId | null> {
  const FiscalYear = (Models as any).FiscalYear;
  if (!FiscalYear) return null;
  
  // Find active fiscal year that contains the given date
  const fiscalYear = await FiscalYear.findOne({
    isActive: true,
    startDate: { $lte: date },
    endDate: { $gte: date }
  });
  
  return fiscalYear ? fiscalYear._id : null;
}

// Generate description from template with variables
function generateDescription(
  template: string,
  requestData: any,
  stepResults: StepResults
): string {
  if (!template) return requestData.description || '';
  
  let description = template;
  
  // Replace request variables: {request.field}
  description = description.replace(/\{request\.(\w+)\}/g, (match, field) => {
    return requestData[field] || match;
  });
  
  // Replace step variables: {step.action.field}
  description = description.replace(/\{step\.(\w+)\.(\w+)\}/g, (match, action, field) => {
    return stepResults[action]?.[field] || match;
  });
  
  return description;
}

// Generate document number
function generateDocumentNumber(fiscalYear: number | mongoose.Types.ObjectId): string {
  const timestamp = Date.now().toString().slice(-6);
  const yearStr = typeof fiscalYear === 'number' ? fiscalYear : fiscalYear.toString().slice(-4);
  return `${yearStr}-${timestamp}`;
}

// Create unified data set from request and step results
function createUnifiedDataSet(requestData: any, stepResults: StepResults): any {
  const unified = { ...requestData };
  
  // Add step results to unified data
  Object.entries(stepResults).forEach(([stepName, result]) => {
    unified[stepName] = result;
    // Also add with step prefix for template access
    if (result && typeof result === 'object') {
      Object.entries(result).forEach(([key, value]) => {
        unified[`${stepName}.${key}`] = value;
      });
    }
  });
  
  return unified;
}

// Get field value from unified data using dot notation
function getFieldValue(data: any, fieldPath: string): any {
  if (!fieldPath) return null;
  
  // Handle direct field access
  if (data[fieldPath] !== undefined) {
    return data[fieldPath];
  }
  
  // Handle dot notation (e.g., 'step.field' or 'request.amount')
  return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
}

// Update account balances based on debit/credit entries
async function updateAccountBalances(
  debitEntries: any[],
  creditEntries: any[],
  fiscalYear: mongoose.Types.ObjectId | null,
  session: ClientSession
): Promise<void> {
  const AccountsBalance = (Models as any).AccountsBalance;
  if (!AccountsBalance) {
    console.log(`⚠️ AccountsBalance model not found, skipping balance updates`);
    return;
  }
  
  console.log(`💰 Updating account balances for ${debitEntries.length} debits, ${creditEntries.length} credits`);
  
  // Process debit entries
  for (const entry of debitEntries) {
    if (entry.fixedAccounts) {
      await updateAccountBalance(
        entry.fixedAccounts,
        'fixed',
        'FixedAccount',
        entry.amount,
        0,
        fiscalYear,
        session
      );
    }
  }
  
  // Process credit entries
  for (const entry of creditEntries) {
    if (entry.fixedAccounts) {
      await updateAccountBalance(
        entry.fixedAccounts,
        'fixed',
        'FixedAccount',
        0,
        entry.amount,
        fiscalYear,
        session
      );
    }
  }
}

// Update individual account balance
async function updateAccountBalance(
  accountRef: string,
  accountLevel: string,
  accountModel: string,
  debitAmount: number,
  creditAmount: number,
  fiscalYear: mongoose.Types.ObjectId | null,
  session: ClientSession
): Promise<void> {
  const AccountsBalance = (Models as any).AccountsBalance;
  if (!AccountsBalance || !accountRef || !fiscalYear) return;
  
  console.log(`🔄 Updating balance for ${accountLevel} account ${accountRef}: +${debitAmount} debit, +${creditAmount} credit`);
  
  const filter = {
    accountRef: new mongoose.Types.ObjectId(accountRef),
    accountLevel,
    accountModel,
    fiscalYear: fiscalYear
  };
  
  const update = {
    $inc: {
      totalDebit: debitAmount,
      totalCredit: creditAmount,
      net: debitAmount - creditAmount
    },
    $set: {
      lastUpdated: new Date()
    },
    $setOnInsert: {
      accountRef: new mongoose.Types.ObjectId(accountRef),
      accountLevel,
      accountModel,
      fiscalYear: fiscalYear,
      createdAt: new Date()
    }
  };
  
  try {
    const result = await AccountsBalance.updateOne(filter, update, { 
      upsert: true, 
      session 
    });
    console.log(`✅ Account balance updated:`, result.modifiedCount > 0 ? 'modified' : 'created');
  } catch (error) {
    console.error(`❌ Failed to update account balance:`, error);
    throw error;
  }
}
