import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(auth)')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
