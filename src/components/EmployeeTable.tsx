import { useCallback, useEffect, useState } from 'react'
import { api, formatCurrency } from '../api/client.js'
import type { Employee, EmployeeInput } from '../types/employee.js'
import { EmployeeForm } from './EmployeeForm.js'

export function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.listEmployees({
        page,
        pageSize: 10,
        search: search || undefined,
        country: country || undefined,
      })
      setEmployees(result.data)
      setTotalPages(result.totalPages)
      setTotal(result.total)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [country, page, search])

  useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  async function handleSave(input: EmployeeInput) {
    if (editingEmployee) {
      await api.updateEmployee(editingEmployee.id, input)
    } else {
      await api.createEmployee(input)
    }

    setShowForm(false)
    setEditingEmployee(null)
    await loadEmployees()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this employee?')) return
    await api.deleteEmployee(id)
    await loadEmployees()
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Employees</h2>
          <p className="text-sm text-slate-600">{total.toLocaleString()} total records</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.target.value)
            }}
            placeholder="Search name, email, role..."
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            value={country}
            onChange={(event) => {
              setPage(1)
              setCountry(event.target.value)
            }}
            placeholder="Filter by country"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null)
              setShowForm(true)
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Add Employee
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Job Title</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Department</th>
              <th className="px-3 py-3">Salary</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">{employee.fullName}</td>
                  <td className="px-3 py-3">{employee.jobTitle}</td>
                  <td className="px-3 py-3">{employee.country}</td>
                  <td className="px-3 py-3">{employee.department}</td>
                  <td className="px-3 py-3">{formatCurrency(employee.salary, employee.country)}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmployee(employee)
                          setShowForm(true)
                        }}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(employee.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {showForm ? (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
        />
      ) : null}
    </section>
  )
}
