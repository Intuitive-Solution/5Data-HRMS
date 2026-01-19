import * as XLSX from 'xlsx'
import api from '@/services/api'
import type { Project } from '@5data-hrms/shared'

interface Assignment {
  allocation?: number
  role?: string
  assigned_at?: string
  employee?: number
}

const billingTypeLabel = (type?: string) => {
  switch (type) {
    case 'fixed_price':
      return 'Fixed Price'
    case 'time_and_material':
      return 'Time & Material'
    case 'non_billable':
      return 'Non-Billable'
    default:
      return type || ''
  }
}

export const exportProjectAssignmentsToExcel = async () => {
  /* -------- Fetch data -------- */
  const [projectRes, employeeRes] = await Promise.all([
    api.get('/projects/'),
    api.get('/employees/'),
  ])

  const projects: Project[] = Array.isArray(projectRes.data)
    ? projectRes.data
    : projectRes.data?.results || []

  const employees = Array.isArray(employeeRes.data)
    ? employeeRes.data
    : employeeRes.data?.results || []

  const rows: Record<string, any>[] = []

  /* -------- Process projects -------- */
  for (const project of projects) {
    const res = await api.get(`/projects/${project.id}/assignments/`)
    const assignments: Assignment[] = Array.isArray(res.data)
      ? res.data
      : res.data?.results || []

    if (assignments.length === 0) {
      rows.push({
        'Project Name': project.name,
        Client: project.client,
        'Billing Type': billingTypeLabel(project.billing_type),
        Status:
          project.status?.charAt(0).toUpperCase() +
          project.status?.slice(1),
        'Start Date': new Date(project.start_date).toLocaleDateString(),
        'End Date': project.end_date
          ? new Date(project.end_date).toLocaleDateString()
          : '',
        'Employee Name': 'No Assignment',
        'Employee ID': '',
        Role: '',
        'Allocation (%)': '',
        'Assigned Date': '',
      })
      continue
    }

    assignments.forEach((a) => {
      const emp = employees.find(
        (e: any) => String(e.id) === String(a.employee)
      )

      rows.push({
        'Project Name': project.name,
        Client: project.client,
        'Billing Type': billingTypeLabel(project.billing_type),
        Status:
          project.status?.charAt(0).toUpperCase() +
          project.status?.slice(1),
        'Start Date': new Date(project.start_date).toLocaleDateString(),
        'End Date': project.end_date
          ? new Date(project.end_date).toLocaleDateString()
          : '',
        'Employee Name': emp
          ? `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim()
          : '',
        'Employee ID': emp?.employee_id || '',
        Role: a.role || '',
        'Allocation (%)': a.allocation_percentage ?? '',
        'Assigned Date': a.assigned_date
          ? new Date(a.assigned_date).toLocaleDateString()
          : '',
      })
    })
  }

  /* -------- Excel -------- */
  const sheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, sheet, 'Projects')
  XLSX.writeFile(workbook, 'Projects.xlsx')
}
