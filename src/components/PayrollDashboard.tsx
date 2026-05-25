import { useCallback, useEffect, useState } from 'react'
import { api, formatCurrency } from '../api/client.js'
import type { PaginatedPayroll, PayrollPeriodSummary } from '../types/payroll.js'

function weekAgoIsoDate() {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString().slice(0, 10)
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function PayrollDashboard() {
  const [payroll, setPayroll] = useState<PaginatedPayroll | null>(null)
  const [summary, setSummary] = useState<PayrollPeriodSummary | null>(null)
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState(weekAgoIsoDate())
  const [to, setTo] = useState(todayIsoDate())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPayroll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [payrollResult, summaryResult] = await Promise.all([
        api.listPayroll({
          page,
          pageSize: 10,
          from,
          to,
          search: search || undefined,
        }),
        api.getPayrollSummary({ from, to }),
      ])
      setPayroll(payrollResult)
      setSummary(summaryResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load payroll')
    } finally {
      setLoading(false)
    }
  }, [from, page, search, to])

  useEffect(() => {
    void loadPayroll()
  }, [loadPayroll])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-100">
        <h2 className="text-lg font-semibold text-indigo-950">How payroll is calculated</h2>
        <p className="mt-2 text-sm text-indigo-900/80">
          Net pay uses each employee&apos;s annual salary, attendance in the selected period, and a
          standard month of {22} working days. Present, late, remote, and on-leave days are paid;
          absent days are deducted.
        </p>
      </div>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total net pay"
            value={formatCurrency(summary.totalNetPay, 'USA')}
          />
          <StatCard
            label="Employees with attendance"
            value={summary.employeeCount.toLocaleString()}
          />
          <StatCard label="Paid days" value={summary.totalPaidDays.toLocaleString()} />
          <StatCard label="Absent days" value={summary.totalAbsentDays.toLocaleString()} />
        </div>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Payroll</h2>
            <p className="text-sm text-slate-600">
              {payroll
                ? `Period ${payroll.period.from} to ${payroll.period.to}`
                : 'Attendance-based pay for the selected period'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setPage(1)
                setFrom(event.target.value)
              }}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setPage(1)
                setTo(event.target.value)
              }}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={search}
              onChange={(event) => {
                setPage(1)
                setSearch(event.target.value)
              }}
              placeholder="Search employee..."
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Employee</th>
                <th className="px-3 py-3">Paid days</th>
                <th className="px-3 py-3">Absent</th>
                <th className="px-3 py-3">Daily rate</th>
                <th className="px-3 py-3">Gross pay</th>
                <th className="px-3 py-3">Deductions</th>
                <th className="px-3 py-3">Net pay</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    Loading payroll...
                  </td>
                </tr>
              ) : payroll?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No employees match this period or search.
                  </td>
                </tr>
              ) : (
                payroll?.data.map((row) => (
                  <tr key={row.employeeId} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{row.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {row.jobTitle} · {row.department}
                      </p>
                    </td>
                    <td className="px-3 py-3">{row.paidDays}</td>
                    <td className="px-3 py-3">{row.unpaidDays}</td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.dailyRate, row.country)}
                    </td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.grossPay, row.country)}
                    </td>
                    <td className="px-3 py-3 text-red-600">
                      {formatCurrency(row.deductions, row.country)}
                    </td>
                    <td className="px-3 py-3 font-semibold text-emerald-700">
                      {formatCurrency(row.netPay, row.country)}
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
            Page {page} of {payroll?.totalPages ?? 1}
          </span>
          <button
            type="button"
            disabled={!payroll || page >= payroll.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}
