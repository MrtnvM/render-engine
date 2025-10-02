import ContentSection from '../components/content-section'
import { AccountForm } from './account-form'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='Аккаунт'
      desc='Обновите настройки аккаунта. Установите предпочитаемый язык и
          часовой пояс.'
    >
      <AccountForm />
    </ContentSection>
  )
}
