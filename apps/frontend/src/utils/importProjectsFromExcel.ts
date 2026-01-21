export const importProjectsFromExcel = async (
  rows: any[],
  createProjectMutation: any
) => {
  console.log('PROJECT IMPORT STARTED')

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]

    const payload = {
      name: r.name?.trim() || '',
      client: r.client?.trim() || '',
      billing_type: normalizeBillingType(r.billing_type),
      start_date: normalizeDate(r.start_date),
      end_date: normalizeDate(r.end_date),
      description: r.description?.trim() || '',
    }

    // Required field check
    if (!payload.name || !payload.client || !payload.start_date) {
      console.error(`Row ${i + 1} skipped: missing required fields`)
      continue
    }

    try {
      await createProjectMutation.mutateAsync(payload)
      console.log(`Row ${i + 1} inserted`)
    } catch (err: any) {
      console.error(`
        Row ${i + 1} failed,
        ${err?.response?.data || err}`
      )
    }
  }

  console.log('PROJECT IMPORT FINISHED')
}

const normalizeBillingType = (value: string) => {
  if (!value) return 'time_and_material'

  const map: Record<string, string> = {
    'time & material': 'time_and_material',
    'time and material': 'time_and_material',
    'time_and_material': 'time_and_material',

    'fixed price': 'fixed_price',
    'fixed_price': 'fixed_price',

    'non billable': 'non_billable',
    'non-billable': 'non_billable',
    'non_billable': 'non_billable',
  }

  return map[value.toLowerCase().trim()] ?? 'time_and_material'
}

const normalizeDate = (value: any) => {
  if (!value) return null

  // Excel numeric date
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }

  // DD/MM/YYYY
  if (typeof value === 'string' && value.includes('/')) {
    const [dd, mm, yyyy] = value.split('/')
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }

  return value
}