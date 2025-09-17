import { createFileRoute } from '@tanstack/react-router'
import Editor from '@/features/editor'

export const Route = createFileRoute('/_authenticated/editor')({
  component: Editor,
})