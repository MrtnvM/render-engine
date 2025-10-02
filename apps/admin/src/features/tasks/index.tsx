import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider, { useTasks } from './context/tasks-context'

function TasksContent() {
  const { scenarios, isLoading, isError } = useTasks()

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
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Render Engine - Сценарии</h2>
            <p className='text-muted-foreground'>Управление вашими UI сценариями</p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-muted-foreground'>Загрузка сценариев...</p>
            </div>
          ) : isError ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-red-500'>Ошибка загрузки сценариев. Проверьте подключение к базе данных.</p>
            </div>
          ) : (
            <DataTable data={scenarios} columns={columns} />
          )}
        </div>
      </Main>

      <TasksDialogs />
    </>
  )
}

export default function Tasks() {
  return (
    <TasksProvider>
      <TasksContent />
    </TasksProvider>
  )
}
