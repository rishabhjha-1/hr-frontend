export type Employee = {
  id: string
  fullName: string
  jobTitle: string
  country: string
  salary: number
  department: string
  email: string
  hireDate: string
  createdAt: string
  updatedAt: string
}

export type EmployeeInput = {
  fullName: string
  jobTitle: string
  country: string
  salary: number
  department: string
  email: string
  hireDate: string
}

export type PaginatedEmployees = {
  data: Employee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type CountrySummary = {
  country: string
  count: number
  min: number
  max: number
  average: number
}

export type JobTitleSummary = {
  jobTitle: string
  count: number
  averageSalary: number
}

export type CountryInsight = CountrySummary & {
  jobTitles: JobTitleSummary[]
}

export type OrganizationSummary = {
  totalEmployees: number
  minSalary: number
  maxSalary: number
  averageSalary: number
  countryCount: number
  topDepartments: Array<{ department: string; count: number }>
}

export type EmployeeListParams = {
  page?: number
  pageSize?: number
  search?: string
  country?: string
  jobTitle?: string
}
