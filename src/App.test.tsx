import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.js'

describe('App', () => {
  it('renders salary management navigation', () => {
    render(<App />)

    expect(screen.getByText('HR Portal', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Workforce Hub' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Attendance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Payroll' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
  })
})

