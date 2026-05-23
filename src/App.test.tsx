import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.js'

describe('App', () => {
  it('renders salary management navigation', () => {
    render(<App />)

    expect(screen.getByText('Salary Management')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
  })
})
