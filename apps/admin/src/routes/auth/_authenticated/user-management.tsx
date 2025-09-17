import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_authenticated/user-management')({
  beforeLoad: () => {
    throw redirect({ to: '/users' })
  },
})
