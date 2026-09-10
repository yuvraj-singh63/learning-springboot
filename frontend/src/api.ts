export type Employee = {
  id: number
  name: string
  department: string
  salary: number
}

export type EmployeePayload = Omit<Employee, 'id'>

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? 'Something went wrong. Please try again.')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const employeeApi = {
  list: () => request<Employee[]>('/employees'),
  create: (payload: EmployeePayload) => request<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id: number, payload: EmployeePayload) => request<Employee>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id: number) => request<void>(`/employees/${id}`, { method: 'DELETE' }),
}