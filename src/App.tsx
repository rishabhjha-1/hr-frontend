import { useState } from 'react'
import { AttendanceDashboard } from './components/AttendanceDashboard.js'
import { EmployeeTable } from './components/EmployeeTable.js'
import { InsightsDashboard } from './components/InsightsDashboard.js'
import { PayrollDashboard } from './components/PayrollDashboard.js'

type Tab = 'employees' | 'attendance' | 'payroll' | 'insights'

export default function App() {
  const [tab, setTab] = useState<Tab>('employees')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
              HR Portal
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Workforce Hub</h1>
            <p className="text-sm text-slate-600">
              Manage employees, track attendance, run payroll, and explore salary insights.
            </p>
          </div>

          <nav className="flex gap-2">
            {[
              ['employees', 'Employees'],
              ['attendance', 'Attendance'],
              ['payroll', 'Payroll'],
              ['insights', 'Insights'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as Tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  tab === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === 'employees' ? (
          <EmployeeTable />
        ) : tab === 'attendance' ? (
          <AttendanceDashboard />
        ) : tab === 'payroll' ? (
          <PayrollDashboard />
        ) : (
          <InsightsDashboard />
        )}
      </main>
    </div>
  )
}
