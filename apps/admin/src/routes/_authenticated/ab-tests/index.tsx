import { createFileRoute } from '@tanstack/react-router'
import ABTests from '@/features/ab-tests'

export const Route = createFileRoute('/_authenticated/ab-tests/')({
  component: ABTests,
})
