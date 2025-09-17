import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor-page')({
  component: () => import('../editor-page.tsx').then(m => m.default),
})