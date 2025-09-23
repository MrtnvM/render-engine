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

export interface InputProps {
  value?: string
  placeholder?: string
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset?: 'default' | 'overlay'
  showCloseButton?: boolean
  onChange?: (value: string) => void
  onClear?: () => void
  disabled?: boolean
  className?: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  name?: string
  id?: string
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  readOnly?: boolean
}

export interface InputVariants {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  state: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset: 'default' | 'overlay'
  showCloseButton: boolean
}

export interface InputFieldSetProps {
  label?: string
  value?: string
  placeholder?: string
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset?: 'default' | 'overlay'
  statusText?: string
  statusType?: 'error' | 'hint' | 'success'
  showCloseButton?: boolean
  onChange?: (value: string) => void
  onClear?: () => void
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  name?: string
  id?: string
  autoComplete?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  readOnly?: boolean
  className?: string
}

export interface InputFieldSetVariants {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  state: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset: 'default' | 'overlay'
  statusType: 'error' | 'hint' | 'success'
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  placeholder?: string
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset?: 'default' | 'overlay'
  options: SelectOption[]
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  name?: string
  id?: string
  required?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface SelectVariants {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  state: 'default' | 'filled' | 'error' | 'error-filled' | 'disabled'
  preset: 'default' | 'overlay'
}

export interface SelectFieldsetProps {
  label: string
  placeholder?: string
  value?: string
  options?: Array<{ value: string; label: string }>
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'filled' | 'disabled' | 'error' | 'active'
  errorText?: string
  hintText?: string
  successText?: string
  className?: string
  onChange?: (value: string) => void
  onOpen?: () => void
  onClose?: () => void
}

export interface SelectFieldsetVariants {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  state: 'default' | 'filled' | 'disabled' | 'error' | 'active'
}

export interface StepperProps {
  value?: number
  min?: number
  max?: number
  step?: number
  size?: 's' | 'm' | 'l'
  state?: 'default' | 'active' | 'focus' | 'loading' | 'plus-disabled' | 'minus-disabled' | 'disabled' | 'error'
  preset?: 'default' | 'overlay'
  onChange?: (value: number) => void
  onIncrement?: () => void
  onDecrement?: () => void
  disabled?: boolean
  className?: string
  errorMessage?: string
  placeholder?: string
  name?: string
  id?: string
  required?: boolean
  readOnly?: boolean
}

export interface StepperVariants {
  size: 's' | 'm' | 'l'
  state: 'default' | 'active' | 'focus' | 'loading' | 'plus-disabled' | 'minus-disabled' | 'disabled' | 'error'
  preset: 'default' | 'overlay'
}
