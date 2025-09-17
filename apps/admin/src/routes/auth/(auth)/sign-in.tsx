import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(auth)/sign-in')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
