import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Editor from '@/features/editor'

const editorSearchSchema = z.object({
  scenarioId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/editor')({
  component: Editor,
  validateSearch: editorSearchSchema,
})
