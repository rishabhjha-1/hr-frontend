import { useEffect, useState } from 'react'
import type { Employee, EmployeeInput } from '../types/employee.js'

type EmployeeFormProps = {
  employee?: Employee | null
  onSubmit: (input: EmployeeInput) => Promise<void>
  onCancel: () => void
}

const emptyForm: EmployeeInput = {
  fullName: '',
  jobTitle: '',
  country: '',
  salary: 0,
  department: '',
  email: '',
  hireDate: new Date().toISOString().slice(0, 10),
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeInput>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName,
        jobTitle: employee.jobTitle,
        country: employee.country,
        salary: employee.salary,
        department: employee.department,
        email: employee.email,
        hireDate: employee.hireDate.slice(0, 10),
      })
    } else {
      setForm(emptyForm)
    }
  }, [employee])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await onSubmit(form)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          {employee ? 'Edit Employee' : 'Add Employee'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['fullName', 'Full Name', 'text'],
            ['jobTitle', 'Job Title', 'text'],
            ['country', 'Country', 'text'],
            ['department', 'Department', 'text'],
            ['email', 'Email', 'email'],
            ['salary', 'Salary', 'number'],
            ['hireDate', 'Hire Date', 'date'],
          ].map(([field, label, type]) => (
            <label key={field} className="block text-sm text-slate-700">
              {label}
              <input
                type={type}
                required
                value={String(form[field as keyof EmployeeInput] ?? '')}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field]:
                      type === 'number' ? Number(event.target.value) : event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : employee ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
