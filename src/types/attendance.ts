export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'REMOTE' | 'ON_LEAVE'

export type AttendanceRecord = {
  id: string
  employeeId: string
  date: string
  status: AttendanceStatus
  checkIn: string | null
  checkOut: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    fullName: string
    department: string
    jobTitle: string
  }
}

export type AttendanceInput = {
  employeeId: string
  date: string
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
  notes?: string
}

export type PaginatedAttendance = {
  data: AttendanceRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type AttendanceSummary = {
  totalRecords: number
  presentCount: number
  absentCount: number
  lateCount: number
  remoteCount: number
  onLeaveCount: number
  attendanceRate: number
  byStatus: Array<{ status: AttendanceStatus; count: number }>
}

export type AttendanceListParams = {
  page?: number
  pageSize?: number
  employeeId?: string
  status?: AttendanceStatus
  from?: string
  to?: string
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  REMOTE: 'Remote',
  ON_LEAVE: 'On leave',
}

export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-amber-100 text-amber-800',
  REMOTE: 'bg-sky-100 text-sky-800',
  ON_LEAVE: 'bg-violet-100 text-violet-800',
}
