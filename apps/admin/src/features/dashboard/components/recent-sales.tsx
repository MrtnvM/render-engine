import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function RecentSales() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9 bg-blue-100 dark:bg-blue-900'>
          <AvatarFallback className='bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'>🏠</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Недвижимость</p>
            <p className='text-muted-foreground text-sm'>Аренда и продажа</p>
          </div>
          <div className='font-medium'>2,847</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 bg-red-100 dark:bg-red-900'>
          <AvatarFallback className='bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'>🚗</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Авто</p>
            <p className='text-muted-foreground text-sm'>Автомобили и запчасти</p>
          </div>
          <div className='font-medium'>2,523</div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9 bg-green-100 dark:bg-green-900'>
          <AvatarFallback className='bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'>
            💼
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Работа</p>
            <p className='text-muted-foreground text-sm'>Вакансии и резюме</p>
          </div>
          <div className='font-medium'>1,998</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9 bg-purple-100 dark:bg-purple-900'>
          <AvatarFallback className='bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'>
            🛠️
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Услуги</p>
            <p className='text-muted-foreground text-sm'>Бытовые услуги</p>
          </div>
          <div className='font-medium'>1,567</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9 bg-orange-100 dark:bg-orange-900'>
          <AvatarFallback className='bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'>
            👕
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Личные вещи</p>
            <p className='text-muted-foreground text-sm'>Одежда и аксессуары</p>
          </div>
          <div className='font-medium'>1,345</div>
        </div>
      </div>
    </div>
  )
}
