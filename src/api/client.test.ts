import { describe, expect, it } from 'vitest'
import { formatCurrency } from '../api/client.js'

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(120000)).toContain('120')
  })

  it('formats INR for India', () => {
    expect(formatCurrency(900000, 'India')).toMatch(/₹|INR/)
  })
})
