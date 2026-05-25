import type { AttendanceRecord } from './attendance.js'

export type SelfEmployee = {
  id: string
  fullName: string
  jobTitle: string
  department: string
  country: string
  email: string
}

export type SelfSession = {
  employee: SelfEmployee
  today: AttendanceRecord | null
}

export type SelfAttendanceHistory = {
  employee: SelfEmployee
  records: AttendanceRecord[]
}
