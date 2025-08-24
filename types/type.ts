// --------------------------------- CustomertTypes ---------------------------------
export interface CustomerType {
  _id: string;
  name: string;
  code: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}
export interface CustomerTypeData {
  _id: string;
  name: string;
  code: string;
  percentage?: number;
}

export interface CustomerTypeTableData extends TableData {
  _id: string;
  code: string;
  name: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
  date: string;
}

// ------------------------------ Customer -------------------------------------------

export interface Customer {
  _id: string;
  name: string;
  code: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
  address?: string;
  nationalId?: string;
  postalCode?: string;
  enName?: string;
  invoice?: string;
  password?: string;
  [key: string]: string | number | undefined;
  date?: string;
  invoiceCount?: number;
  totalSales?: number;
}
export interface CustomerInvoiceData {
  _id: string;
  name: string;
  code: string;
  type: {
    _id: string;
    name: string;
    percentage: number;
  };
}
export interface CustomerReports extends TableData {
  _id: string;
  name: string;
  code: string;
  phone: string;
  totalSales: number;
  invoiceCount: number;
  doubleGlassCount: number;
  comboGlassCount: number;
  laminateGlassCount: number;
  date: string;
}
export interface CustomerListType {
  _id: string;
  name: string;
  enName: string;
  code: string;
  phone: string;
  password: string;
  address: string;
  nationalId: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
  invoice?: string;
  type?: {
    // Make this optional
    _id: string;
    percentage: number;
    name: string;
  } | null; // Allow null values
}

export interface CustomerTableData extends TableData {
  _id: string;
  name: string;
  enName: string;
  code: string;
  type: string;
  typePercentage: number;
  typeName: string;
  phone?: string;
  // password?: string;
  address: string;
  nationalId: string;
  postalCode: string;
  // invoice?: string;
  createdAt: string;
  updatedAt: string;
  date?: string;
}
export interface CustomerInvoiceData {
  _id: string;
  name: string;
  code: string;
  type: {
    _id: string;
    name: string;
    percentage: number;
  };
}

// ------------------------------ Design -----------------------------------------

export interface Design {
  _id: string;
  name: string;
  code: string;
  url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
// ------------------------------ Inventory -------------------------------------

export interface Inventory {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  provider:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  glass:
    | {
        _id: string;
        name: string;
        code: string;
        // width: number;
        // height: number;
        thickness: number;
        sellPrice: number;
      }
    | string;
  sideMaterial:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  enterDate: string;
  count: number;
  createdAt: string;
  updatedAt: string;
  phone?: number | string;
  date?: string | Date;
  type?: number; // Changed from string to number to match InventoryTableData
}
export interface InventoryReports extends TableData {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  count: number;
  totalArea: number;
  usedAmount: number;
  usedArea: number;
  date: string;
  phone: string; // Required by TableData interface
}
export interface InventoryReports extends TableData {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  count: number;
  totalArea: number;
  usedAmount: number;
  usedArea: number;
  date: string;
  phone: string; // Required by TableData interface
}
export interface InventoryFormData {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  count: number;
  provider: string;
  materialType: "glass" | "sideMaterial";
  glass?: string;
  sideMaterial?: string;
  width?: number;
  height?: number;
  enterDate: string;
}
export interface InventoryEditFormProps {
  inventoryId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: InventoryFormData;
}
export interface InventoryHook {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  provider: {
    _id: string;
    name: string;
  };
  glass: {
    _id: string;
    name: string;
  };
  sideMaterial?: {
    _id: string;
    name: string;
  };
  enterDate: string;
  createdAt: string;
  updatedAt: string;
  width?: number;
  height?: number;
  count: number;
}

// Extended interface for inventory table data
export interface InventoryTableData extends TableData {
  _id: string;
  name: string;
  code: string;
  buyPrice: number;
  count: number;
  providerName: string;
  materialType: string;
  materialName: string;
  dimensions: string;
  provider: string;
  glass: string;
  sideMaterial: string;
  width: number;
  height: number;
  enterDate: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  phone: string;
  type: number;
}
export interface FieldOption {
  label: string;
  value: string;
}

// ------------------------------ Glass -----------------------------------------

export interface GlassTable {
  code: string;
  name: string;
  thickness: string;
  sellPrice: string | number;
  _id: string;
}
export interface Glass {
  _id: string;
  name: string;
  code: string;
  // width: number;
  // height: number;
  thickness: number | string;
  sellPrice: number;
  createdAt: string;
  updatedAt: string;
  type: number | string;
  date: string;
  [key: string]: string | number | boolean | undefined;
}
export interface GlassInvoiceData {
  code: string;
  name: string;
  thickness: string;
  sellPrice: string | number;
  _id: string;
  width: string;
  height: string;
  createdAt: string;
  updatedAt: string;
}
export interface GlassUsageStats {
  _id: string;
  name: string;
  code: string;
  usageCount: number;
  totalAmount: number;
  consumedArea: number;
  date: string;
  phone: string;
  [key: string]: string | number;
  purchaseDate: string;
  type: string;
}
export interface GlassData {
  _id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  sellPrice?: number;
}

// ------------------------------ sidematerial -----------------------------------------

export interface SideMaterialFormData {
  name: string;
  code: string;
  serviceFeeType: "percentage" | "number";
  serviceFeeValue: number;
  [key: string]: string | number | undefined;
}
export interface SideMaterial {
  _id: string;
  name: string;
  code: string;
  count: number;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  date?: string;
}

export interface SideMaterialStats {
  _id: string;
  name: string;
  code: string;
  usageCount: number;
  totalAmount: number;
  purchasedQuantity: number;
  consumedQuantity: number;
  purchaseDate: string;
  date: string;
  phone: string;
  [key: string]: string | number | boolean | undefined;
  type: string; // Optional field for type
}
export interface SideMaterialInvoiceData {
  _id?: string;
  name: string;
  code: string;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}

export interface SideMaterialTable {
  _id?: string;
  name: string;
  code: string;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}
export interface SideMaterialData {
  _id: string;
  name: string;
  code: string;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
  createdAt: string;
  updatedAt: string;
  type: "sideMaterial";
  phone: string;
  date: string;
}
export interface SideMaterialFormDatas {
  _id: string;
  name: string;
  code: string;
  serviceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}

// ------------------------------ Treatment -----------------------------------------
export interface Treatment {
  _id: string;
  name: string;
  code: string;
  price: number;
  createdAt: string;
  count: number;
  updatedAt: string;
  type: string; // Assuming type is a number, adjust if needed
  date: string; // Assuming date is a string, adjust if needed

  treatment:
    | string
    | {
        name: boolean;
        _id: string;
      };
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}
export interface TreatmentReports extends TableData {
  _id: string;
  name: string;
  code: string;
  usageCount: number;
  totalAmount: number;
  phone: string;
  date: string;
}
export interface TreatmentTable {
  _id: string;
  name: string;
  code: string;
  count: number;
  price: number;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
  createdAt: string;
  updatedAt: string;
  date: string;
  type: string; // Assuming type is a string, adjust if needed
  treatment: string;
}
export interface TreatmentWithDetails {
  treatment: {
    count: number;
    _id: string;
    name: string;
    code: string;
    treatment: Treatment;
    ServiceFee: {
      serviceFeeValue: number;
      serviceFeeType: "percentage" | "number";
    };
  };
  count: number;
  useMeasurement: boolean;
  measurements: TreatmentMeasurement[];
  totalMeasurementPrice: number;
}
export interface TreatmentMeasurement {
  width: string;
  height: string;
}
export interface TreatmentOption {
  name: string;
  price: number | string;
  type?: string; // Optional type property
}
export interface TreatmentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatmentOptions: Treatment[];
  selectedTreatments: Treatment[];
  // Add these new props to store and restore measurement data
  savedMeasurements?: Record<string, TreatmentMeasurement[]>;
  savedCounts?: Record<string, number>;
  savedUseMeasurement?: Record<string, boolean>;
  onSave: (
    selectedTreatmentsWithDetails: TreatmentWithDetails[],
    measurementsData: {
      measurements: Record<string, TreatmentMeasurement[]>;
      counts: Record<string, number>;
      useMeasurement: Record<string, boolean>;
    }
  ) => void;
}

export interface ServiceFee {
  serviceFeeType: "percentage" | "number";
  serviceFeeValue: number;
}

export interface TreatmentItem {
  _id: string;
  name: string;
  code: string;
  ServiceFee: ServiceFee;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentFormData {
  _id: string;
  name: string;
  code: string;
  serviceFeeType: "percentage" | "number";
  serviceFeeValue: number;
}

// ------------------------------ Product -----------------------------------------
export interface ProductInvoiceData {
  _id: string;
  name: string;
  code: string;
  layers: LayerInvoiceData;
  sideMaterials: SideMaterial[];
  productLine: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  type: string; // Assuming type is a string, adjust if needed
}

export interface ProductTable {
  _id: string;
  name: string;
  code: string;
  sideMaterials: SideMaterialTable[];
  createdAt: string;
  updatedAt: string;
}

// ------------------------------ Invoice -----------------------------------------

export interface Invoice {
  _id: string;
  code: string;
  customerId: string;
  status: "pending" | "completed" | "cancelled";
  layers: Layer[];
  sideMaterials?: {
    materialId: string;
    quantity?: number;
    price?: number;
  }[];
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  totalAmount: number;
  priority: PriorityData;
  customer: Customer;
  type: string;
  designNumber: string;
  count: number;
  price: number;
}
export interface ActualInvoiceStructure {
  _id: string;
  layers: {
    _id: string;
    treatment: Treatment[];
    width: number;
    height: number;
  }[];
  // Other fields can be included as needed
}
export interface InvoiceFormData {
  invoiceNumber: string;
  customerCode?: string;
  customerId?: string;
  customerName?: string;
  creator: string;
  creatorId: string;
  productType: string;
  wallCount: number;
  mapFile: string;
  designs: string;
  layers: LayerInvoiceData[];
  glassList: GlassInvoiceData[]; // Changed from Glass[] to GlassInvoiceData[]
  priority: PriorityTable | null;
  sideMaterial: SideMaterialInvoiceData | null; // Changed from string to match usage
  sideMaterials: SideMaterialInvoiceData[];
  rowTotalPrices: number[];
  calculatedBaseTotal: number;
  treatments: TreatmentTable[]; // Changed from Treatment[] to TreatmentTable[]
  glassAllocationCount: number; // Changed from Record<string, number> to number
}
export interface Option {
  value: "pdf" | "png";
  label: string;
  icon: React.ReactNode;
}
export interface SelectWithIconProps {
  selected: "pdf" | "png";
  onChange: (value: "pdf" | "png") => void;
}
export interface InvoiceDataTableProps {
  data: {
    invoiceNumber: string;
    customerCode: string;
    customerId: string;
    customerName: string;
    creator: string;
    creatorId: string | number;
    productType: string;
    wallCount: number;
    mapFile: File | null;
    designs: File | null;
    layers: Array<{
      glass: string;
      treatments: Array<{
        treatment: string;
        count: number;
      }>;
      width: string;
      height: string;
    }>;
    glassList: GlassInvoiceData[];
    priority: string;
    sideMaterial: string;
    sideMaterials: string[];
    rowTotalPrices: number[];
    calculatedBaseTotal: number;
    treatments: string[];
    glassAllocationCount: number | null;
  };
}

// ----------------------------- Layer ---------------------------------------------
export interface Layer {
  _id: string;
  width: number;
  height: number;
  treatment: Treatment[];
  glassId: string;
  glass: Glass;
  count: number;
  price?: number; // Optional field for price
}
export interface LayerInvoiceData {
  minCount: number;
  maxCount: number;
}
export interface LayersInvoiceData {
  height: string;
  width: string;
  selectedTreatments: { _id: string; count: number }[];
  glassId: string;
}
export interface LayersTable {
  height: string;
  width: string;
  selectedTreatments: { _id: string; count: number }[];
  glassId: string;
}

// ----------------------------- Provider ---------------------------------------------

export interface ProviderReportData extends TableData {
  _id: string;
  name: string;
  code: string;
  totalPurchaseAmount: number;
  totalItems: number;
  orderCount: number;
  avgPrice: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  phone?: string;
  date?: string;
}
export interface ProviderTableData extends TableData {
  _id: string;
  name: string;
  code: string;
  info: string;
  createdAt: string;
  updatedAt: string;
  date: string;
}

// ----------------------------- Priority ---------------------------------------------

export interface PriorityData {
  _id: string;
  name: string;
  code: string;
}
export interface PriorityInvoiceData {
  _id?: string;
  name: string;
  code: string;
  date: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}
export interface PriorityTable {
  _id?: string;
  name: string;
  code: string;
  date: number;
  price: number;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
  createdAt: string;
  updatedAt: string;
}
export interface PriorityTableData extends TableData {
  _id: string;
  name: string;
  code: string;
  date: string;
  serviceFeeType: "percentage" | "number";
  serviceFeeValue: number;
  updatedAt: string;
  createdAt: string;
  phone: string;
  type: number;
}

// Interface for form data
export interface PriorityFormData {
  _id: string;
  name: string;
  code: string;
  date: string;
  serviceFeeType: "percentage" | "number";
  serviceFeeValue: number;
  [key: string]: string | number; // Add index signature
}

// Interface for transformed data (API format)
export interface PriorityApiData {
  _id: string;
  name: string;
  code: string;
  date: string;
  ServiceFee: {
    serviceFeeType: "percentage" | "number";
    serviceFeeValue: number;
  };
}

// ----------------------------- Seller ---------------------------------------------
export interface Seller {
  _id: string;
  username?: string;
  phoneNumber: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  type: string;
  phone?: string;
  date: string;
  password?: string;
  name?: string;
}
// ----------------------------- Auth ---------------------------------------------
export interface User {
  _id: string;
  username: string;
  phoneNumber: string;
  role: "seller" | "manager" | "supervisor";
  code?: string;
  createdAt: string;
  updatedAt: string;
}
export interface AuthResponse {
  users: User[];
  message?: string;
}
export interface AuthUpdateResponse {
  user: User;
  message: string;
}
export interface UserUpdateFormData {
  selectedUserId: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  role?: "seller" | "manager" | "supervisor";
}

// ----------------------------- Allocation ---------------------------------------------
export interface AllocationData {
  _id?: string;
  glassId: string | GlassData;
  customerTypeId: string | CustomerTypeData;
  count: number;
}
export interface AllocationDataProiprity {
  _id?: string;
  glassId: string | GlassData;
  priorityId: string | PriorityData;
  count: number; // This represents the direct price value
}

// ----------------------------- Production Line ---------------------------------------------

export interface ProductionLine {
  _id: string;
  name: string;
  code: string;
}

export interface ProductEditFormProps {
  productId: string;
  initialValues: {
    name: string;
    sideMaterials: string[];
    layers: {
      minCount: number;
      maxCount: number;
    };
    productType: string;
    productLine: string;
    code: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}
export interface ProductLine {
  _id?: string;
  name?: string;
  line?: string;
  title?: string;
}

export interface LayersData {
  minCount?: number;
  maxCount?: number;
  count?: number;
  value?: string | number;
}

// ----------------------------- Production Type ---------------------------------------------
export interface ProductType {
  _id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  type: string;
  title: string;
}

// ----------------------------- CheckBox ---------------------------------------------
export interface CheckBoxProps {
  options: TreatmentOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

// ----------------------------- EditeLayersModal -------------------------------------------
export interface EditLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: DataRow;
  onSave: (updatedRows: DataRow[]) => void;
  glassList: GlassTable[];
  treatmentOptions: TreatmentTable[];
}
// ------------------- non standard types --------------

export interface NonStandardDimensionModalProps {
  dimension: NonStandardDimension | null;
  onClose: () => void;
  glassData?: GlassNonStandardDimension | null;
}
export interface DimensionReference {
  _id: string;
  name?: string;
  width?: number;
  height?: number;
}
export interface GlassNonStandardDimension {
  _id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  sellPrice: number;
  code: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface HeightRange {
  dimensions: {
    min: number;
    max: number;
  };
  price: number;
  _id?: string;
}

export interface NonStandardDimension {
  _id?: string;
  name: string;
  code: string;
  glass?: string | GlassNonStandardDimension;
  width: {
    min: number;
    max: number;
  };
  height: HeightRange[];
  createdAt?: string;
  updatedAt?: string;
}
export interface HeightRangeRditForm {
  min: number | string;
  max: number | string;
}

export interface NonStandardDimensionEditFormProps {
  dimensionId: string;
  initialValues: {
    name: string;
    code: string;
    width: {
      min: number | string;
      max: number | string;
    };
    height: HeightRangeRditForm[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

interface Height {
  _id: string;
  min: number;
  max: number;
}

export interface Dimension {
  _id: string;
  name: string;
  code: string;
  width: {
    min: number;
    max: number;
  };
  height: Height[];
}

export interface HeightRangeReference {
  _id: string;
  name?: string;
  minHeight?: number;
  maxHeight?: number;
}

export interface PriceData {
  _id?: string;
  dimensionId: string;
  heightRangeId: string;
  price: number;
}

export interface PriceItem {
  _id: string;
  dimensionId: string | DimensionReference;
  heightRangeId: string | HeightRangeReference;
  price: number;
}

export interface ProcessedPrice {
  _id: string;
  dimensionId: string;
  heightRangeId: string;
  price: number;
}

export interface DataRow {
  code: string;
  glass: string;
  height: string;
  width: string;
  thickness: string | number;
  price: string | number;
  originalPrice?: string | number;
  isNegotiatedPrice?: boolean;
  totalPrice?: number;
  pricePerSqMeter?: number; // Add this property
  treatments?: Record<string, number>;
  selectedTreatments: TreatmentTable[] | Treatment[];
  glassId?: string;
  basicPrice?: number;
  treatmentDetails?: TreatmentWithDetails[];
  areaRow?: number;
}

// ----------------------------- DynamicTreatmentTablePropsTable ---------------------------------------------
export interface DynamicTreatmentTablePropsTable {
  onTotalPriceChange?: (prices: number[]) => void;
  onRowCountChange?: (count: number) => void;
  setLayers?: (layers: LayersTable[]) => void;
  glassList?: GlassTable[];
  treatmentOptions?: TreatmentTable[];
  sideMaterialList?: SideMaterialTable[];
  selectedPriority?: PriorityTable | null;
  selectedSideMaterial?: SideMaterialTable | null;
  selectedSideMaterials?: SideMaterialTable[];
  customerPercentage?: number;
  products?: ProductTable;
  onGlassSelect?: (glassId: string) => void; // New prop for glass selection
  glassAllocationCount: number | null;
  customerAllocationCount: number;
}

// ----------------------------- nonStandardPriceCalculator In Utils ---------------------------

export interface PriceResult {
  price: number;
  dimensionName?: string;
  dimensionCode?: string;
  heightRange?: {
    min: number;
    max: number;
  };
  widthRange?: {
    min: number;
    max: number;
  };
  found: boolean;
  message?: string;
}
export interface HeightDimensions {
  min: number;
  max: number;
}

export interface HeightRangeCalculate {
  dimensions: HeightDimensions;
  price: number;
}

// ----------------------------- DynamicFormTypes ---------------------------
export interface DynamicFormProps<TFormData = FormValues> {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
  submitButtonText?: string;
  cancelButtonText?: string;
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: ApiError) => void;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
  encType?:
    | "application/json"
    | "multipart/form-data"
    | "application/x-www-form-urlencoded";
  className?: string;
  initialValues?: FormValues;
  onFieldChange?: (name: string, value: FormFieldValue) => void;
  transformFormData?: (formData: TFormData) => Partial<TFormData>;
  transformData?: (data: FormValues) => FormValues;
}

// ----------------------------- Forms ---------------------------

export interface UseDynamicFormReturn {
  formValues: FormValues;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    field: FormField
  ) => void;
  validateForm: () => boolean;
  handleSubmit: (
    submissionFn: (data: FormValues | FormData) => Promise<Response>
  ) => Promise<void>;
  resetForm: () => void;
  setFormValues: (values: FormValues) => void;
  isSubmitting: boolean;
  initialValues?: FormValues;
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

export interface ApiError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
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

// ----------------------------- DynamicTableTypes ---------------------------
export interface DynamicTableProps {
  columns: TableColumn[];
  data: TableData[];
  loading?: boolean;
  initialSort?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string, direction: "asc" | "desc") => void;
  formFields?: FormField[];
  endpoint?: string;
  formTitle?: string;
  formSubtitle?: string;
  onRefresh?: () => void;
  transformForEdit?: (item: TableData) => FormValues;
  onEditSuccess?: (data: ApiResponse) => void;
  onEditError?: (error: ApiError) => void;
  resetAfterSubmit?: boolean;
  onEditClick?: (item: TableData) => boolean | void;
  transformData?: (data: FormValues) => FormValues;
  showActions?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
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

export interface TableData {
  _id?: string;
  name: string;
  // phone?  : string;
  // date?: string;
  [key: string]: string | number | boolean | undefined;
  code: string;
  type: number | string;
}
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: FormValues;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

// --------------------------- codeGenerator ------------------------
export interface DocumentWithCode {
  code: string;
  _id: unknown;
  __v: number;
}

// ----------------------------- pagination ---------------------------
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
