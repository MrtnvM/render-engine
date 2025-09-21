export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  color?: 'default' | 'accent' | 'pay' | 'success' | 'danger'
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'disabled'
  round?: boolean
  preset?: 'default' | 'overlay' | 'inverse'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

export interface ButtonVariants {
  variant: 'primary' | 'secondary' | 'ghost'
  color: 'default' | 'accent' | 'pay' | 'success' | 'danger'
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  state: 'default' | 'disabled'
  round: boolean
  preset: 'default' | 'overlay' | 'inverse'
}
