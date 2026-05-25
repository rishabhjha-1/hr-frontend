export type PayrollDayCounts = {
  present: number
  absent: number
  late: number
  remote: number
  onLeave: number
  total: number
}

export type PayrollLineItem = {
  employeeId: string
  fullName: string
  jobTitle: string
  department: string
  country: string
  annualSalary: number
  paidDays: number
  unpaidDays: number
  monthlySalary: number
  dailyRate: number
  grossPay: number
  deductions: number
  netPay: number
  attendanceRate: number
  dayCounts: PayrollDayCounts
}

export type PaginatedPayroll = {
  data: PayrollLineItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  period: { from: string; to: string }
}

export type PayrollPeriodSummary = {
  period: { from: string; to: string }
  employeeCount: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  averageNetPay: number
  totalPaidDays: number
  totalAbsentDays: number
}

export type PayrollListParams = {
  page?: number
  pageSize?: number
  from?: string
  to?: string
  department?: string
  search?: string
}
