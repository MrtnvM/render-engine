import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection title='Профиль' desc='Так другие будут видеть вас на сайте.'>
      <ProfileForm />
    </ContentSection>
  )
}
