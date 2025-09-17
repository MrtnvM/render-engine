import { createFileRoute } from '@tanstack/react-router'
import AvitoDesignSystem from '@/features/avito-design-system'

export const Route = createFileRoute('/_authenticated/avito-design-system')({
  component: AvitoDesignSystem,
})