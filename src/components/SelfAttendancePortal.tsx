import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_STYLES,
  type AttendanceRecord,
} from '../types/attendance.js'
import type { SelfEmployee, SelfSession } from '../types/self.js'

const STORAGE_KEY = 'hr-portal-self-email'

function formatTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SelfAttendancePortal() {
  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [session, setSession] = useState<SelfSession | null>(null)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [workMode, setWorkMode] = useState<'office' | 'remote'>('office')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const refresh = useCallback(async (employeeEmail: string) => {
    const [sessionResult, historyResult] = await Promise.all([
      api.selfIdentify(employeeEmail),
      api.selfAttendanceHistory(employeeEmail),
    ])
    setSession(sessionResult)
    setHistory(historyResult.records)
  }, [])

  useEffect(() => {
    if (!email) return
    void refresh(email).catch(() => undefined)
  }, [email, refresh])

  async function handleIdentify(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await refresh(email.trim())
      localStorage.setItem(STORAGE_KEY, email.trim())
      setMessage('Welcome back. You can check in from this device.')
    } catch (identifyError) {
      setSession(null)
      setHistory([])
      setError(identifyError instanceof Error ? identifyError.message : 'Could not find employee')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn() {
    if (!email) return
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await api.selfCheckIn(email, workMode)
      await refresh(email)
      setMessage(workMode === 'remote' ? 'Remote check-in recorded.' : 'Checked in successfully.')
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!email) return
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await api.selfCheckOut(email)
      await refresh(email)
      setMessage('Checked out. Have a great evening.')
    } catch (checkOutError) {
      setError(checkOutError instanceof Error ? checkOutError.message : 'Check-out failed')
    } finally {
      setLoading(false)
    }
  }

  function handleSignOut() {
    localStorage.removeItem(STORAGE_KEY)
    setEmail('')
    setSession(null)
    setHistory([])
    setMessage(null)
    setError(null)
  }

  const today = session?.today
  const canCheckIn = !today?.checkIn
  const canCheckOut = Boolean(today?.checkIn && !today?.checkOut)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">My attendance</h2>
        <p className="mt-2 text-sm text-slate-600">
          Check in and out from your phone or laptop using your work email.
        </p>

        {!session ? (
          <form onSubmit={(event) => void handleIdentify(event)} className="mt-6 space-y-4">
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Work email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="rounded-lg border border-slate-300 px-3 py-3 text-base"
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <EmployeeCard employee={session.employee} />

            {today ? (
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Today</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${ATTENDANCE_STATUS_STYLES[today.status]}`}
                  >
                    {ATTENDANCE_STATUS_LABELS[today.status]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Check-in</p>
                    <p className="font-medium text-slate-900">{formatTime(today.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Check-out</p>
                    <p className="font-medium text-slate-900">{formatTime(today.checkOut)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                No attendance recorded yet today.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading || !canCheckIn}
                onClick={() => void handleCheckIn()}
                className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                Check in
              </button>
              <button
                type="button"
                disabled={loading || !canCheckOut}
                onClick={() => void handleCheckOut()}
                className="rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-40"
              >
                Check out
              </button>
            </div>

            <fieldset className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-medium text-slate-700">Work mode</legend>
              <div className="mt-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workMode"
                    checked={workMode === 'office'}
                    onChange={() => setWorkMode('office')}
                  />
                  Office
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workMode"
                    checked={workMode === 'remote'}
                    onChange={() => setWorkMode('remote')}
                  />
                  Remote
                </label>
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Use a different email
            </button>
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
      </section>

      {session && history.length > 0 ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent days</h3>
          <ul className="mt-4 space-y-3">
            {history.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3 text-sm"
              >
                <span className="text-slate-700">{record.date.slice(0, 10)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANCE_STATUS_STYLES[record.status]}`}
                >
                  {ATTENDANCE_STATUS_LABELS[record.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function EmployeeCard({ employee }: { employee: SelfEmployee }) {
  return (
    <div className="rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
      <p className="text-lg font-semibold text-indigo-950">{employee.fullName}</p>
      <p className="text-sm text-indigo-900/80">
        {employee.jobTitle} · {employee.department}
      </p>
    </div>
  )
}
