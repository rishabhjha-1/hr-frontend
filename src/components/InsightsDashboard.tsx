import { useEffect, useState } from 'react'
import { api, formatCurrency } from '../api/client.js'
import type { CountryInsight, CountrySummary, OrganizationSummary } from '../types/employee.js'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function InsightsDashboard() {
  const [summary, setSummary] = useState<OrganizationSummary | null>(null)
  const [countries, setCountries] = useState<CountrySummary[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countryInsight, setCountryInsight] = useState<CountryInsight | null>(null)
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [jobTitleAverage, setJobTitleAverage] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOverview() {
      try {
        const [summaryData, countryData] = await Promise.all([
          api.getSummary(),
          api.getCountries(),
        ])
        setSummary(summaryData)
        setCountries(countryData)
        if (countryData[0]) {
          setSelectedCountry(countryData[0].country)
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load insights')
      }
    }

    void loadOverview()
  }, [])

  useEffect(() => {
    if (!selectedCountry) return

    async function loadCountryInsight() {
      try {
        const insight = await api.getCountryInsight(selectedCountry)
        setCountryInsight(insight)
        setSelectedJobTitle(insight.jobTitles[0]?.jobTitle ?? '')
        setJobTitleAverage(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load country insight')
      }
    }

    void loadCountryInsight()
  }, [selectedCountry])

  useEffect(() => {
    if (!selectedCountry || !selectedJobTitle) return

    async function loadJobTitleInsight() {
      try {
        const insight = await api.getJobTitleInsight(selectedCountry, selectedJobTitle)
        setJobTitleAverage(insight.average)
      } catch {
        setJobTitleAverage(null)
      }
    }

    void loadJobTitleInsight()
  }, [selectedCountry, selectedJobTitle])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Salary Insights</h2>
        <p className="text-sm text-slate-600">
          Organization-wide and country-level compensation analytics for HR planning.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {summary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Employees" value={summary.totalEmployees.toLocaleString()} />
          <StatCard
            label="Average Salary"
            value={formatCurrency(summary.averageSalary)}
          />
          <StatCard label="Min Salary" value={formatCurrency(summary.minSalary)} />
          <StatCard label="Max Salary" value={formatCurrency(summary.maxSalary)} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">By Country</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2">Country</th>
                  <th className="py-2">Count</th>
                  <th className="py-2">Min</th>
                  <th className="py-2">Max</th>
                  <th className="py-2">Avg</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr
                    key={country.country}
                    className={`border-b border-slate-100 ${
                      selectedCountry === country.country ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCountry(country.country)}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {country.country}
                      </button>
                    </td>
                    <td className="py-2">{country.count}</td>
                    <td className="py-2">{formatCurrency(country.min, country.country)}</td>
                    <td className="py-2">{formatCurrency(country.max, country.country)}</td>
                    <td className="py-2">{formatCurrency(country.average, country.country)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {selectedCountry || 'Country'} Detail
          </h3>

          {countryInsight ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Min</p>
                  <p className="font-semibold">
                    {formatCurrency(countryInsight.min, countryInsight.country)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Max</p>
                  <p className="font-semibold">
                    {formatCurrency(countryInsight.max, countryInsight.country)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Average</p>
                  <p className="font-semibold">
                    {formatCurrency(countryInsight.average, countryInsight.country)}
                  </p>
                </div>
              </div>

              <label className="block text-sm text-slate-700">
                Job Title
                <select
                  value={selectedJobTitle}
                  onChange={(event) => setSelectedJobTitle(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {countryInsight.jobTitles.map((jobTitle) => (
                    <option key={jobTitle.jobTitle} value={jobTitle.jobTitle}>
                      {jobTitle.jobTitle} ({formatCurrency(jobTitle.averageSalary, countryInsight.country)})
                    </option>
                  ))}
                </select>
              </label>

              {jobTitleAverage !== null ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  Average salary for <strong>{selectedJobTitle}</strong> in{' '}
                  <strong>{selectedCountry}</strong>:{' '}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(jobTitleAverage, selectedCountry)}
                  </span>
                </p>
              ) : null}

              {summary?.topDepartments.length ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Top Departments</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {summary.topDepartments.map((department) => (
                      <li key={department.department}>
                        {department.department}: {department.count.toLocaleString()} employees
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a country to view details.</p>
          )}
        </div>
      </div>
    </section>
  )
}
