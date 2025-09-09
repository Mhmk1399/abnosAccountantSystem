# Salary Calculation Service Documentation

## Overview
The `calculateTheWorkerWorkes.ts` service handles comprehensive salary calculations for staff members based on attendance, allowances, deductions, and overtime work.

## Main Functions

### `calculateStaffSalary(staffId, month, year)`
Calculates salary for a single staff member for a specific month and year.

### `calculateAllActiveStaffSalaries(month, year)`
Calculates salaries for all active staff members for a specific month and year.

## Calculation Process

### 1. Data Retrieval
- **Staff Data**: Retrieves staff information including base salary, marriage status, children count
- **Rollcall Data**: Gets attendance records for the specified month/year
- **Salary Laws**: Fetches salary regulations and rates for the year
- **Deficits**: Retrieves any salary deductions/advances

### 2. Work Hours Calculation
Processes daily attendance with different statuses:
- **Present**: Calculates actual hours worked (entry time - exit time - lunch time)
- **Permission**: Adds full working hours per day
- **Absent**: Subtracts working hours per day
- **Medical**: No change to hours

Formula: `workingDays = totalWorkHours / workHoursPerDay`

### 3. Salary Components

#### Base Salary
```
baseSalary = workingDays × (staff.baseSalary || salaryLaws.baseSalary)
```

#### Prorated Allowances
All allowances are prorated based on working days vs official month working days:

**Housing Allowance**:
```
housingAllowance = workingDays >= monthWorkingDays 
  ? salaryLaws.housingAllowance 
  : (salaryLaws.housingAllowance / monthWorkingDays) × workingDays
```

**Worker Voucher (Bon)**:
```
workerVoucher = workingDays >= monthWorkingDays 
  ? salaryLaws.workerVoucher 
  : (salaryLaws.workerVoucher / monthWorkingDays) × workingDays
```

**Child Allowances**:
```
childAllowances = workingDays >= monthWorkingDays 
  ? salaryLaws.childAllowance × staff.childrenCounts
  : (salaryLaws.childAllowance × staff.childrenCounts / monthWorkingDays) × workingDays
```

**Marriage Allowance** (only for married staff):
```
MarriageAllowance = staff.ismaried && workingDays >= monthWorkingDays 
  ? salaryLaws.MarriageAllowance 
  : (salaryLaws.MarriageAllowance / monthWorkingDays) × workingDays
```

#### Seniority Pay
```
seniority = staff.workExperience ? salaryLaws.seniorityPay : 0
```

#### Overtime Calculation
```
extraWorkingDays = workingDays - monthInfo.workingDays
extraHours = extraWorkingDays × salaryLaws.workHoursPerDay
hourlyRate = dailyBaseSalary / salaryLaws.workHoursPerDay
extraWorkPayFee = hourlyRate × salaryLaws.overtimeRate
extraWorkPay = extraWorkingDays × salaryLaws.workHoursPerDay × extraWorkPayFee
```

### 4. Total Earnings
```
totalEarnings = baseSalary + housingAllowance + workerVoucher + 
                childAllowances + seniority + MarriageAllowance + extraWorkPay
```

### 5. Deductions

#### Tax Deduction
```
taxDeduction = totalEarnings > salaryLaws.taxStandard 
  ? totalEarnings × salaryLaws.taxRate 
  : 0
```

#### Insurance Deduction
```
insuranceDeduction = totalEarnings × salaryLaws.insuranceRate
```

#### Total Deductions
```
totalDeductions = taxDeduction + insuranceDeduction + deficits
```

### 6. Net Pay
```
netPay = totalEarnings - totalDeductions
```

## Key Features

### Prorated Allowances
- Allowances are calculated proportionally based on actual working days
- Full allowances given if working days ≥ official month working days
- Partial allowances calculated using: `(allowance / monthWorkingDays) × actualWorkingDays`

### Attendance Status Handling
- **Present**: Actual hours calculation with lunch break deduction
- **Permission**: Counted as full working day
- **Absent**: Deducted from total hours
- **Medical**: No impact on hours

### Overtime Calculation
- Calculates extra working days beyond official month working days
- Applies overtime rate multiplier to hourly base salary
- Tracks both extra hours and extra pay amounts

### Tax Calculation
- Progressive tax: only applied if total earnings exceed tax standard
- Uses configurable tax rate from salary laws

## Return Interface
```typescript
interface SalaryCalculationResult {
  staffId: string;
  month: number;
  year: number;
  workHours: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowances: number;
  seniority: number;
  totalEarnings: number;
  taxDeduction: number;
  insuranceDeduction: number;
  deficits: number;
  totalDeductions: number;
  netPay: number;
  MarriageAllowance: number;
  extraWorkPay: number;
  extraHours: number;
  workingDays: number;
  dailyBaseSalary: number;
  extraWorkPayFee: number;
}
```

## Dependencies
- **Staff Model**: Employee information
- **Rollcall Model**: Attendance records
- **SalaryLaws Model**: Salary regulations and rates
- **Deficit Model**: Salary deductions/advances
- **ShamsiWorkingDaysService**: Official working days calculation

## Error Handling
- Validates staff existence
- Validates rollcall data availability
- Validates salary laws for the specified year
- Logs errors for individual staff calculations in batch processing