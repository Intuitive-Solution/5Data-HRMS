export const importEmployeesFromExcel = async (
  rows: any[],
  createEmployeeMutation: any
) => {
  console.log('IMPORT STARTED')

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]

    const payload = {
      email: r.email?.trim() || '',
      first_name: r.first_name?.trim() || '',
      last_name: r.last_name?.trim() || '',
      employee_id: r.employee_id?.trim() || '',

      job_title: r.job_title?.trim() || '',
      department: r.department?.trim() || '',

      employment_type: normalizeEmploymentType(r.employment_type),
      date_of_joining: normalizeDate(r.date_of_joining),

      middle_name: r.middle_name?.trim() || '',
      personal_email: r.personal_email?.trim() || '',
      phone_number: r.phone_number ? String(r.phone_number) : '',

      gender: normalizeGender(r.gender),
      address: r.address?.trim() || '',
      date_of_birth: normalizeDate(r.date_of_birth),
      nationality: r.nationality?.trim() || '',

      picture: undefined, 

      probation_policy: r.probation_policy?.trim() || '',
      reporting_manager_id: r.reporting_manager_id
        ? Number(r.reporting_manager_id)
        : undefined,

      location: r.location?.trim() || '',
      shift: r.shift?.trim() || '',

      contract_end_date: normalizeDate(r.contract_end_date),
      contractor_company: r.contractor_company?.trim() || '',

      termination_date: normalizeDate(r.termination_date),
      termination_reason: r.termination_reason?.trim() || '',
    }

    try {
      await createEmployeeMutation.mutateAsync(payload)
      console.log(`Row ${i + 1} inserted`)
    } catch (err: any) {
      console.error(`Row ${i + 1} failed`, err?.response?.data || err)
    }
  }

  console.log('IMPORT FINISHED')
}
const normalizeEmploymentType = (value: string) => {
  if (!value) return 'full_time'

  const map: Record<string, string> = {
    'full time': 'full_time',
    'full_time': 'full_time',
    'part time': 'part_time',
    'part_time': 'part_time',
    intern: 'intern',
    contract: 'contract',
  }

  return map[value.toLowerCase().trim()] ?? 'full_time'
}

const normalizeGender = (value: string) => {
  if (!value) return undefined

  const map: Record<string, string> = {
    male: 'male',
    female: 'female',
    other: 'other',
  }

  return map[value.toLowerCase().trim()]
}

const normalizeDate = (value: any) => {
  if (!value) return null

  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }

  if (typeof value === 'string' && value.includes('/')) {
    const [dd, mm, yyyy] = value.split('/')
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }

  return value
}
