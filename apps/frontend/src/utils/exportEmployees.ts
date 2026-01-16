import * as XLSX from 'xlsx'
import type { Employee } from '@5data-hrms/shared'
import { getUserRoles } from '../modules/employees/services/roleApi'

export const exportEmployeesToExcel = async (employees: Employee[]) => {
  const formattedData = await Promise.all(
    employees.map(async (e) => {
      let roles: string = 'No roles assigned'
      let assignedAt: string = 'N/A'

      if (e.user?.id) {
        try {
          const userRoles = await getUserRoles(e.user.id)
          if (userRoles.length > 0) {
            roles = userRoles.map((r) => r.role_display_name).join(', ')
            assignedAt = userRoles
              .map((r) => (r.assigned_at ? new Date(r.assigned_at).toLocaleDateString() : 'N/A'))
              .join(', ')
          }
        } catch (err) {
          console.error(`Failed to fetch roles for user ${e.user.id}`, err)
        }
      }

      return {
        // ===== Personal Info =====
        'Employee ID': e.employee_id,
        'First Name': e.user?.first_name || 'N/A',
        'Middle Name': e.middle_name || 'N/A',
        'Last Name': e.user?.last_name || 'N/A',
        'Official Email': e.user?.email || 'N/A',
        'Personal Email': e.personal_email || 'N/A',
        'Phone Number': e.phone_number || 'N/A',
        'Gender': e.gender ? e.gender.replace('_', ' ').toUpperCase() : 'N/A',
        'Date of Birth': e.date_of_birth ? new Date(e.date_of_birth).toLocaleDateString() : 'N/A',
        'Nationality': e.nationality || 'N/A',
        'Address': e.address || 'N/A',

        // ===== Job Info =====
        'Job Title': e.job_title || 'N/A',
        'Probation Policy': e.probation_policy || 'N/A',
        'Reporting Manager': e.reporting_manager
          ? `${e.reporting_manager.user.first_name} ${e.reporting_manager.user.last_name} (${e.reporting_manager.employee_id})`
          : 'N/A',

        // ===== Work Info =====
        'Department': e.department?.name || 'N/A',
        'Location': e.location?.name || 'N/A',
        'Shift': e.shift || 'N/A',
        'Employment Type': e.employment_type ? e.employment_type.replace('_', ' ').toUpperCase() : 'N/A',
        'Employment Status': e.employment_status || 'N/A',
        'Date of Joining': e.date_of_joining ? new Date(e.date_of_joining).toLocaleDateString() : 'N/A',
        'Contract End Date': e.contract_end_date ? new Date(e.contract_end_date).toLocaleDateString() : 'N/A',
        'Contractor Company': e.contractor_company || 'N/A',
        'Termination Date': e.termination_date ? new Date(e.termination_date).toLocaleDateString() : 'N/A',
        'Reason for Termination': e.termination_reason || 'N/A',

        // ===== Roles =====
        'Assigned Roles': roles,
        'Role Assigned Date': assignedAt,
      }
    })
  )

  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')
  XLSX.writeFile(workbook, 'employees.xlsx')
}