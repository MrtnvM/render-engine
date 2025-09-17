import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_authenticated')({
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})
