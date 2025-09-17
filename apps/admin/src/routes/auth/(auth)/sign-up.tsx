import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(auth)/sign-up')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
