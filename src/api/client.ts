import type {
  CountryInsight,
  CountrySummary,
  Employee,
  EmployeeInput,
  EmployeeListParams,
  OrganizationSummary,
  PaginatedEmployees,
} from '../types/employee.js'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(typeof error.error === 'string' ? error.error : 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function toQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const api = {
  listEmployees(params: EmployeeListParams = {}) {
    return request<PaginatedEmployees>(`/api/employees${toQuery(params)}`)
  },

  getEmployee(id: string) {
    return request<Employee>(`/api/employees/${id}`)
  },

  createEmployee(input: EmployeeInput) {
    return request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateEmployee(id: string, input: EmployeeInput) {
    return request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  deleteEmployee(id: string) {
    return request<void>(`/api/employees/${id}`, { method: 'DELETE' })
  },

  getSummary() {
    return request<OrganizationSummary>('/api/insights/summary')
  },

  getCountries() {
    return request<CountrySummary[]>('/api/insights/countries')
  },

  getCountryInsight(country: string) {
    return request<CountryInsight>(`/api/insights/countries/${encodeURIComponent(country)}`)
  },

  getJobTitleInsight(country: string, jobTitle: string) {
    return request<{
      country: string
      jobTitle: string
      min: number
      max: number
      average: number
      count: number
    }>(
      `/api/insights/countries/${encodeURIComponent(country)}/job-titles/${encodeURIComponent(jobTitle)}`,
    )
  },
}

export function formatCurrency(value: number, country?: string) {
  const currency =
    country === 'India'
      ? 'INR'
      : country === 'UK'
        ? 'GBP'
        : country === 'Japan'
          ? 'JPY'
          : country === 'Germany'
            ? 'EUR'
            : 'USD'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
