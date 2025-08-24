export interface AccountGroup {
  _id: string;
  code: Number;
}

export interface TotalAccount {
  _id: string;
  accountGroup: AccountGroup;
}

export interface PopulatedFixedAccount {
  _id: string;
  totalAccount: TotalAccount;
}

export interface DailyBookResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface SaleTransactionParams {
  customerId: string;
  amount: number;
  description: string;
  documentNumber: string;
  fiscalYear: string;
  currency: string;
  userId: string;
}

export interface Account {
  _id: string;
  name: string;
  code?: string;
  accountGroup?: string | { _id: string };
  totalAccount?: string | { _id: string };
}

export interface WorkflowEntry {
  accountGroup: string;
  totalAccount: string;
  fixedAccounts: string;
  detailed1?: string;
  amountField: string;
  descriptionTemplate: string;
}

export interface AccountsCollection {
  groups?: Array<{
    _id: string | { toString(): string };
    name: string;
    accountGroup?: string | { _id: string };
  }>;
  totals?: Array<{
    _id: string | { toString(): string };
    name: string;
    accountGroup?: string | { _id: string };
  }>;
  fixed?: Array<{
    _id: string | { toString(): string };
    name: string;
    totalAccount?: string | { _id: string };
  }>;
  detailed?: Array<{
    _id: string | { toString(): string };
    name: string;
  }>;
}

export interface EntriesSectionProps {
  title: string;
  entries: WorkflowEntry[];
  type: 'debit' | 'credit';
  accounts: AccountsCollection;
  onAdd: () => void;
  onUpdate: (type: 'debit' | 'credit', index: number, field: string, value: string) => void;
  onRemove: (type: 'debit' | 'credit', index: number) => void;
  workflow: WorkflowData;
}

export interface EntryCardProps {
  entry: WorkflowEntry;
  index: number;
  type: 'debit' | 'credit';
  accounts: AccountsCollection;
  onUpdate: (type: 'debit' | 'credit', index: number, field: string, value: string) => void;
  onRemove: (type: 'debit' | 'credit', index: number) => void;
  workflow: WorkflowData;
}

export interface WorkflowData {
  name: string;
  trigger: { model: string; method: string };
  steps: WorkflowStep[];
  dailyBookConfig: {
    debitEntries: WorkflowEntry[];
    creditEntries: WorkflowEntry[];
    autoFiscalYear: boolean;
  };
}

export interface WorkflowStep {
  id: string;
  action: string;
  model: string;
  method: string;
  dataMapping: Record<string, string>;
}

export interface TypeOfDailyBookRow {
  _id: string;
  name: string;
  savedDebitAccount?: {
    name: string;
  };
  savedCreditAccount?: {
    name: string;
  };
  debitSampleDescriptions?: string[];
  creditSampleDescriptions?: string[];
}

import { DateObject } from "react-multi-date-picker";

export interface RenderFunction {
  (value: string | string[] | unknown, row?: TypeOfDailyBookRow): string;
}

export interface Bank {
  _id: string;
  name: string;
}

export interface DetailedAccount {
  _id: string;
  name: string;
  code: string;
}

export interface Loan extends Record<string, unknown> {
  _id: string;
  name: string;
  bank?: Bank;
  amount?: number;
  paidperson?: DetailedAccount;
  countOfIinstallments?: number;
  amountOfIinstallments?: number;
}

export interface PaymentDetail extends Record<string, unknown> {
  amount?: number;
  checkNumber?: number;
  seryNumber?: number;
  dueDate?: Date;
  documentNumber?: string;
  transactionDate?: DateObject;
  description?: string;
  documentDate?: DateObject;
  paidBy?: string;
  payTo?: string;
  type?: string;
  ourBank?: string;
  transferReference?: string;
  transferDate?: DateObject;
  toBank?: string;
  fromBank?: Array<{
    shobe: string;
    name: string;
    accountNumber: string;
  }>;
  selectedFromBank?: string;
  otherSideBank?: Array<{
    name: string;
    owner: string;
    accountNumber: string;
  }>;
  senderName?: string;
  receiverName?: string;
  status?: string;
  inboxStatus?: string;
}

export interface TransactionData extends Record<string, unknown> {
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  date: string;
  description: string;
}

export interface Workflow extends Record<string, unknown> {
  _id: string;
  name: string;
  trigger: {
    model: string;
    method: string;
  };
}

export interface BankAccount extends Record<string, unknown> {
  _id: string;
  name: string;
  branch?: string;
  branchName?: string;
  accountNumber?: string;
  ownerName?: string;
}

export interface Staff extends Record<string, unknown> {
  _id: string;
  title: string;
  name: string;
  fatherName: string;
  nationalId: string;
  idNumber: string;
  idIssuePlace: string;
  birthPlace: string;
  birthDate: string;
  insuranceNumber: string;
  address: string;
  postalCode: string;
  homePhone?: string;
  mobilePhone: string;
  position: string;
  workplace: string;
  educationLevel: string;
  fieldOfStudy: string;
  degreeYear?: string;
  workExperience?: string;
  hireDate: string;
  baseSalary: number;
}

export interface Rollcall extends Record<string, unknown> {
  _id: string;
  staff: {
    _id: string;
    name: string;
  };
  date: string;
  status: 'present' | 'absent' | 'late';
  entranceTime?: string;
  exitTime?: string;
  description?: string;
}

export interface Permission extends Record<string, unknown> {
  _id: string;
  staff: {
    _id: string;
    name: string;
  } | string;
  date: string;
  description: string;
}

export interface Invoice extends Record<string, unknown> {
  _id: string;
  code: string;
  customer?: {
    name: string;
  };
  priority?: {
    name: string;
  };
  price: number;
  status: 'pending' | 'in progress' | 'completed' | 'cancelled' | 'stop production';
  productionDate?: string;
}

export interface Deficit extends Record<string, unknown> {
  _id: string;
  staff: {
    _id: string;
    name: string;
  } | string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TypeOfDailyBookType extends Record<string, unknown> {
  _id: string;
  name: string;
  debitSampleDescriptions?: string[];
  creditSampleDescriptions?: string[];
}

export interface DailyBookEntry extends Record<string, unknown> {
  accountGroup: string;
  totalAccount: string;
  fixedAccounts: string;
  detailed1?: string;
  detailed2?: string;
  amount: number;
  description: string;
  fiscalYear: string;
  entryType?: 'debit' | 'credit';
}

export interface DailyBook extends Record<string, unknown> {
  _id?: string;
  documentNumber: string;
  type?: string;
  date: Date | string;
  description: string;
  debitEntries?: DailyBookEntry[];
  creditEntries?: DailyBookEntry[];
  status?: string;
}

export interface DocumentWithCode {
  code: string;
  _id: unknown;
  __v: number;
}
export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (
    value: string | number | boolean,
    row?: TableData
  ) => React.ReactNode;
}
export interface ProviderReportData extends TableData {
  _id: string;
  name: string;
  code: string;
  purchaseAmount: number;
  usedAmount: number;
  date: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
export interface TableData {
  _id?: string;
  name: string;
  // phone?  : string;
  // date?: string;
  [key: string]: string | number | boolean | undefined;
  code: string;
  type: number | string;
}
export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "textarea"
  | "select"
  | "date"
  | "checkbox"
  | "radio"
  | "multiselect"
  | "file"
  | "switch"
  | "modelRef" // New type for fields that reference other models
  | "hidden";
export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean; // Optional property to disable specific options
}
export type ValidationRule =
  | {
      type: "required";
      message: string;
      validator?: (value: FormFieldValue, formValues?: FormValues) => boolean;
    }
  | { type: "minLength"; value: number; message: string }
  | { type: "maxLength"; value: number; message: string }
  | { type: "min"; value: number; message: string }
  | { type: "max"; value: number; message: string }
  | { type: "pattern"; value: string; message: string }
  | { type: "email"; message: string }
  | {
      type: "custom";
      message: string;
      validator?: (value: FormFieldValue, formValues?: FormValues) => boolean;
    };

export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean; // Optional property to disable specific options
}

export interface FormFieldDependency {
  field: string;
  value: string | number | boolean;
}
export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | FileList
  | File
  | null;
export type FormValues = Record<string, FormFieldValue | undefined>;
export type SubmissionData = FormValues | FormData;

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  rows?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  options?: FormFieldOption[];
  validation?: ValidationRule[];
  dependency?: FormFieldDependency;
  disabled?: boolean;
  defaultValue?: FormFieldValue;
  accept?: string; // For file inputs, specify accepted file types
  className?: string;
  dependsOn?: {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "contains";
    value: string | number | boolean;
  };
  refModel?: string;
  multiple?: boolean;
  isRequired?: boolean;
}
