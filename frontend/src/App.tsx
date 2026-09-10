import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, ChartNoAxesCombined, CirclePlus, IndianRupee, Pencil, Search, Trash2, Users, X } from 'lucide-react'
import { employeeApi, type Employee, type EmployeePayload } from './api'

const departments = ['Engineering', 'Design', 'Marketing', 'Finance', 'Operations', 'IT']

const emptyForm: EmployeePayload = { name: '', department: 'Engineering', salary: 0 }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function getInitialRoute() {
  return window.location.pathname === '/insights' ? 'insights' : 'directory'
}

function Insights({ employees }: { employees: Employee[] }) {
  const totalPayroll = employees.reduce((total, employee) => total + employee.salary, 0)
  const averageSalary = employees.length ? totalPayroll / employees.length : 0
  const departmentData = Object.entries(employees.reduce<Record<string, { count: number; payroll: number }>>((result, employee) => {
    const current = result[employee.department] ?? { count: 0, payroll: 0 }
    result[employee.department] = { count: current.count + 1, payroll: current.payroll + employee.salary }
    return result
  }, {})).sort(([, first], [, second]) => second.count - first.count)
  const largestDepartment = departmentData[0]
  const highestSalary = Math.max(...employees.map((employee) => employee.salary), 0)
  const topEarners = [...employees].sort((first, second) => second.salary - first.salary).slice(0, 5)
  const salaryBands = [
    { label: 'Under 40k', count: employees.filter((employee) => employee.salary < 40000).length },
    { label: '40k - 75k', count: employees.filter((employee) => employee.salary >= 40000 && employee.salary < 75000).length },
    { label: '75k - 1L', count: employees.filter((employee) => employee.salary >= 75000 && employee.salary < 100000).length },
    { label: '1L+', count: employees.filter((employee) => employee.salary >= 100000).length },
  ]
  const maximumBand = Math.max(...salaryBands.map((band) => band.count), 1)

  return (
    <>
      <header className="topbar"><div><p className="eyebrow">People operations / 2026</p><h1>Team insights</h1></div><a className="primary-button" href="/"><ArrowLeft size={17} /> Back to directory</a></header>
      <div className="intro-row"><p>A clear read on team shape, payroll, and where your people sit.</p><span className="status-dot"><span /> Live analysis</span></div>
      <section className="metrics insights-metrics">
        <article className="metric-card accent"><div className="metric-icon"><IndianRupee size={19} /></div><span>Total payroll</span><strong>{formatCurrency(totalPayroll)}</strong><small>Combined employee salary</small></article>
        <article className="metric-card"><div className="metric-icon"><ChartNoAxesCombined size={19} /></div><span>Average salary</span><strong>{formatCurrency(averageSalary)}</strong><small>Across {employees.length} employees</small></article>
        <article className="metric-card"><div className="metric-icon"><BriefcaseBusiness size={19} /></div><span>Largest department</span><strong>{largestDepartment?.[0] ?? '—'}</strong><small>{largestDepartment?.[1].count ?? 0} people</small></article>
        <article className="metric-card"><div className="metric-icon"><Users size={19} /></div><span>Highest salary</span><strong>{highestSalary ? formatCurrency(highestSalary) : '—'}</strong><small>Current team maximum</small></article>
      </section>
      {employees.length === 0 ? <section className="empty-insights"><div className="metric-icon"><ChartNoAxesCombined size={22} /></div><h2>Your insights will appear here</h2><p>Add employees from the directory to see team patterns and payroll distribution.</p><a className="primary-button" href="/">Go to directory</a></section> : <div className="insights-grid">
        <section className="insight-panel department-panel"><div className="insight-heading"><div><p className="eyebrow">Team shape</p><h2>Department mix</h2></div><span>{departmentData.length} departments</span></div><div className="department-bars">{departmentData.map(([name, data]) => <div className="department-row" key={name}><div className="department-label"><strong>{name}</strong><span>{data.count} {data.count === 1 ? 'person' : 'people'}</span></div><div className="bar-track"><span style={{ width: `${(data.count / employees.length) * 100}%` }} /></div><strong className="department-percent">{Math.round((data.count / employees.length) * 100)}%</strong></div>)}</div></section>
        <section className="insight-panel"><div className="insight-heading"><div><p className="eyebrow">Compensation</p><h2>Salary bands</h2></div><span>Employee count</span></div><div className="salary-bars">{salaryBands.map((band) => <div className="salary-bar-column" key={band.label}><strong>{band.count}</strong><div className="salary-bar-track"><span style={{ height: `${(band.count / maximumBand) * 100}%` }} /></div><small>{band.label}</small></div>)}</div></section>
        <section className="insight-panel top-earners-panel"><div className="insight-heading"><div><p className="eyebrow">Recognition</p><h2>Top earners</h2></div><span>Highest salary first</span></div><div className="earner-list">{topEarners.map((employee, index) => <div className="earner-row" key={employee.id}><span className="rank">0{index + 1}</span><span className="avatar">{employee.name.slice(0, 2).toUpperCase()}</span><div className="earner-details"><strong>{employee.name}</strong><small>{employee.department}</small></div><strong className="earner-salary">{formatCurrency(employee.salary)}</strong></div>)}</div></section>
        <section className="insight-panel payroll-panel"><div className="insight-heading"><div><p className="eyebrow">Department view</p><h2>Payroll allocation</h2></div><span>Total: {formatCurrency(totalPayroll)}</span></div><div className="payroll-list">{departmentData.map(([name, data]) => <div className="payroll-row" key={name}><div className="payroll-label"><strong>{name}</strong><span>{formatCurrency(data.payroll)}</span></div><div className="bar-track light"><span style={{ width: `${totalPayroll ? (data.payroll / totalPayroll) * 100 : 0}%` }} /></div></div>)}</div></section>
      </div>}
    </>
  )
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeePayload>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [route, setRoute] = useState(getInitialRoute)

  async function loadEmployees() {
    setIsLoading(true)
    try {
      setEmployees(await employeeApi.list())
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load employees.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadEmployees() }, [])

  useEffect(() => {
    const handleRouteChange = () => setRoute(getInitialRoute())
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const matchesQuery = `${employee.name} ${employee.department}`.toLowerCase().includes(query.toLowerCase())
    const matchesDepartment = department === 'All departments' || employee.department === department
    return matchesQuery && matchesDepartment
  }), [employees, query, department])

  const totalPayroll = employees.reduce((total, employee) => total + employee.salary, 0)
  const averageSalary = employees.length ? totalPayroll / employees.length : 0
  const departmentCount = new Set(employees.map((employee) => employee.department)).size

  function openCreateModal() {
    setEditingEmployee(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  function openEditModal(employee: Employee) {
    setEditingEmployee(employee)
    setForm({ name: employee.name, department: employee.department, salary: employee.salary })
    setIsModalOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    try {
      if (editingEmployee) await employeeApi.update(editingEmployee.id, form)
      else await employeeApi.create(form)
      setIsModalOpen(false)
      await loadEmployees()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save employee.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this employee?')) return
    try {
      await employeeApi.remove(id)
      setEmployees((current) => current.filter((employee) => employee.id !== id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete employee.')
    }
  }

  function navigateTo(path: string) {
    window.history.pushState({}, '', path)
    setRoute(getInitialRoute())
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>peopleboard</span></div>
        <div className="sidebar-section-label">Workspace</div>
        <nav><a className={`nav-item ${route === 'directory' ? 'active' : ''}`} href="/" onClick={(event) => { event.preventDefault(); navigateTo('/') }}><Users size={18} /> Directory</a><a className={`nav-item ${route === 'insights' ? 'active' : ''}`} href="/insights" onClick={(event) => { event.preventDefault(); navigateTo('/insights') }}><ChartNoAxesCombined size={18} /> Insights</a></nav>
        <div className="sidebar-footer"><div className="profile-avatar">YS</div><div><strong>Yuvraj Singh</strong><span>Administrator</span></div></div>
      </aside>

      <section className="content" id={route}>
        {route === 'insights' ? <Insights employees={employees} /> : <>
        <header className="topbar"><div><p className="eyebrow">People operations / 2026</p><h1>Employee directory</h1></div><button className="primary-button" onClick={openCreateModal}><CirclePlus size={18} /> Add employee</button></header>
        <div className="intro-row"><p>Keep your team visible, organized, and moving in the same direction.</p><span className="status-dot"><span /> Live workspace</span></div>

        <section className="metrics">
          <article className="metric-card accent"><div className="metric-icon"><Users size={19} /></div><span>Team size</span><strong>{employees.length}</strong><small>Active employees</small></article>
          <article className="metric-card"><div className="metric-icon"><IndianRupee size={19} /></div><span>Total payroll</span><strong>{formatCurrency(totalPayroll)}</strong><small>Across the whole team</small></article>
          <article className="metric-card"><div className="metric-icon"><ChartNoAxesCombined size={19} /></div><span>Average salary</span><strong>{formatCurrency(averageSalary)}</strong><small>Per employee</small></article>
          <article className="metric-card"><div className="metric-icon"><BriefcaseBusiness size={19} /></div><span>Departments</span><strong>{departmentCount}</strong><small>Areas represented</small></article>
        </section>

        {error && <div className="error-banner">{error}<button aria-label="Dismiss error" onClick={() => setError('')}><X size={17} /></button></div>}
        <section className="directory-panel">
          <div className="panel-header"><div><h2>All employees</h2><span>{filteredEmployees.length} people in view</span></div><div className="filters"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" /></label><select value={department} onChange={(event) => setDepartment(event.target.value)}><option>All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></div></div>
          <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Salary</th><th aria-label="Actions" /></tr></thead><tbody>
            {isLoading && <tr><td colSpan={4} className="empty-state">Loading your directory...</td></tr>}
            {!isLoading && filteredEmployees.map((employee) => <tr key={employee.id}><td><div className="employee-cell"><span className="avatar">{employee.name.slice(0, 2).toUpperCase()}</span><div><strong>{employee.name}</strong><small>Employee #{employee.id}</small></div></div></td><td><span className="department-tag">{employee.department}</span></td><td className="salary">{formatCurrency(employee.salary)}</td><td><div className="actions"><button title="Edit employee" aria-label={`Edit ${employee.name}`} onClick={() => openEditModal(employee)}><Pencil size={17} /></button><button title="Delete employee" aria-label={`Delete ${employee.name}`} onClick={() => void handleDelete(employee.id)}><Trash2 size={17} /></button></div></td></tr>)}
            {!isLoading && filteredEmployees.length === 0 && <tr><td colSpan={4} className="empty-state">No employees match this view.</td></tr>}
          </tbody></table></div>
        </section>
        </>}
      </section>

      {isModalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsModalOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">Team record</p><h2 id="modal-title">{editingEmployee ? 'Edit employee' : 'Add employee'}</h2></div><button className="close-button" aria-label="Close dialog" onClick={() => setIsModalOpen(false)}><X size={20} /></button></div><form onSubmit={handleSubmit}><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Aisha Mehta" /></label><label>Department<select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label><label>Salary<input required min="0" type="number" value={form.salary || ''} onChange={(event) => setForm({ ...form, salary: Number(event.target.value) })} placeholder="50000" /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancel</button><button disabled={isSaving} className="primary-button" type="submit">{isSaving ? 'Saving...' : editingEmployee ? 'Save changes' : 'Create employee'}</button></div></form></section></div>}
    </main>
  )
}

export default App