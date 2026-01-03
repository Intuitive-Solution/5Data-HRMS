/**
 * Icon component based on file type
 */
import {
  DocumentTextIcon,
  DocumentIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  PhotoIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import type { DocumentFileType } from '../types'

interface FileTypeIconProps {
  fileType: DocumentFileType
  className?: string
}

const iconMap: Record<DocumentFileType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  pdf: DocumentTextIcon,
  docx: DocumentIcon,
  xlsx: TableCellsIcon,
  pptx: PresentationChartBarIcon,
  image: PhotoIcon,
  txt: DocumentTextIcon,
  csv: TableCellsIcon,
  zip: ArchiveBoxIcon,
  other: DocumentIcon,
}

const colorMap: Record<DocumentFileType, string> = {
  pdf: 'text-red-500',
  docx: 'text-blue-500',
  xlsx: 'text-green-500',
  pptx: 'text-orange-500',
  image: 'text-purple-500',
  txt: 'text-gray-500',
  csv: 'text-teal-500',
  zip: 'text-yellow-600',
  other: 'text-gray-400',
}

export default function FileTypeIcon({ fileType, className = 'w-5 h-5' }: FileTypeIconProps) {
  const Icon = iconMap[fileType] || iconMap.other
  const color = colorMap[fileType] || colorMap.other

  return <Icon className={`${className} ${color}`} />
}

