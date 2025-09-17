import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function Editor() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Editor</h2>
            <p className='text-muted-foreground'>Code editor with live preview for React components</p>
          </div>
        </div>
        <div className='flex-1 overflow-auto px-4 py-1'>
          <div className='h-[calc(100vh-12rem)]'>
            <iframe
              src="/editor-page"
              className="w-full h-full border rounded-lg"
              title="Editor"
            />
          </div>
        </div>
      </Main>
    </>
  )
}