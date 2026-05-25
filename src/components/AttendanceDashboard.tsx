import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import type { Employee } from '../types/employee.js'
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_STYLES,
  type AttendanceInput,
  type AttendanceRecord,
  type AttendanceStatus,
  type AttendanceSummary,
} from '../types/attendance.js'

const STATUS_OPTIONS: AttendanceStatus[] = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'REMOTE',
  'ON_LEAVE',
]

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function weekAgoIsoDate() {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString().slice(0, 10)
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function AttendanceDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('')
  const [from, setFrom] = useState(weekAgoIsoDate())
  const [to, setTo] = useState(todayIsoDate())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [form, setForm] = useState<AttendanceInput>({
    employeeId: '',
    date: todayIsoDate(),
    status: 'PRESENT',
    checkIn: '',
    checkOut: '',
    notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [attendanceResult, summaryResult, employeeResult] = await Promise.all([
        api.listAttendance({
          page,
          pageSize: 10,
          status: statusFilter || undefined,
          from: from || undefined,
          to: to || undefined,
        }),
        api.getAttendanceSummary({ from: from || undefined, to: to || undefined }),
        api.listEmployees({ page: 1, pageSize: 100 }),
      ])

      setRecords(attendanceResult.data)
      setTotalPages(attendanceResult.totalPages)
      setSummary(summaryResult)
      setEmployees(employeeResult.data)

      if (!form.employeeId && employeeResult.data[0]) {
        setForm((current) => ({ ...current, employeeId: employeeResult.data[0]!.id }))
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [from, page, statusFilter, to])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function openCreateForm() {
    setEditingRecord(null)
    setForm({
      employeeId: employees[0]?.id ?? '',
      date: todayIsoDate(),
      status: 'PRESENT',
      checkIn: '',
      checkOut: '',
      notes: '',
    })
    setShowForm(true)
  }

  function openEditForm(record: AttendanceRecord) {
    setEditingRecord(record)
    setForm({
      employeeId: record.employeeId,
      date: record.date.slice(0, 10),
      status: record.status,
      checkIn: record.checkIn ? record.checkIn.slice(0, 16) : '',
      checkOut: record.checkOut ? record.checkOut.slice(0, 16) : '',
      notes: record.notes ?? '',
    })
    setShowForm(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const payload: AttendanceInput = {
      employeeId: form.employeeId,
      date: form.date,
      status: form.status,
      notes: form.notes || undefined,
      checkIn: form.checkIn ? new Date(form.checkIn).toISOString() : undefined,
      checkOut: form.checkOut ? new Date(form.checkOut).toISOString() : undefined,
    }

    if (editingRecord) {
      await api.updateAttendance(editingRecord.id, payload)
    } else {
      await api.createAttendance(payload)
    }

    setShowForm(false)
    setEditingRecord(null)
    await loadData()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this attendance record?')) return
    await api.deleteAttendance(id)
    await loadData()
  }

  return (
    <div className="space-y-6">
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attendance rate" value={`${summary.attendanceRate}%`} />
          <StatCard label="Present (+ late/remote)" value={summary.presentCount.toLocaleString()} />
          <StatCard label="Absent" value={summary.absentCount.toLocaleString()} />
          <StatCard label="On leave" value={summary.onLeaveCount.toLocaleString()} />
        </div>
      ) : null}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Attendance</h2>
            <p className="text-sm text-slate-600">
              Track daily presence, remote work, and leave across your workforce.
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
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1)
                setStatusFilter(event.target.value as AttendanceStatus | '')
              }}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {ATTENDANCE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Mark attendance
            </button>
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Employee</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Check-in</th>
                <th className="px-3 py-3">Check-out</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    Loading attendance...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No attendance records in this range.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{record.date.slice(0, 10)}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {record.employee.fullName}
                    </td>
                    <td className="px-3 py-3">{record.employee.department}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${ATTENDANCE_STATUS_STYLES[record.status]}`}
                      >
                        {ATTENDANCE_STATUS_LABELS[record.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">{formatDateTime(record.checkIn)}</td>
                    <td className="px-3 py-3">{formatDateTime(record.checkOut)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(record)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(record.id)}
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
      </section>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-slate-900">
              {editingRecord ? 'Edit attendance' : 'Mark attendance'}
            </h3>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Employee</span>
                <select
                  required
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, employeeId: event.target.value }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} — {employee.department}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Date</span>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AttendanceStatus,
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {ATTENDANCE_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-600">Check-in</span>
                  <input
                    type="datetime-local"
                    value={form.checkIn}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, checkIn: event.target.value }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-600">Check-out</span>
                  <input
                    type="datetime-local"
                    value={form.checkOut}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, checkOut: event.target.value }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={3}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Optional note"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingRecord(null)
                }}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
