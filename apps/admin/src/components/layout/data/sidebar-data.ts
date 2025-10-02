import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconCode,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Demo User',
    email: 'demo@demo.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Render Engine',
      logo: Command,
      plan: 'Backend-Driven UI',
    },
    {
      name: 'Render Engine Production',
      logo: GalleryVerticalEnd,
      plan: 'Продакшн',
    },
    {
      name: 'Render Engine Staging',
      logo: AudioWaveform,
      plan: 'Разработка',
    },
  ],
  navGroups: [
    {
      title: 'Основное',
      items: [
        {
          title: 'Панель управления',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Сценарии',
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Приложения',
          url: '/apps',
          icon: IconPackages,
        },
        {
          title: 'A/B-тесты',
          url: '/ab-tests',
          icon: IconUsers,
        },
        {
          title: 'Редактор',
          url: '/editor',
          icon: IconCode,
        },
        {
          title: 'Дизайн-система Avito',
          url: '/avito-design-system',
          icon: IconPalette,
        },
        // Clerk demo group removed
      ],
    },
    {
      title: 'Страницы',
      items: [
        {
          title: 'Ошибки',
          icon: IconBug,
          items: [
            {
              title: 'Неавторизован',
              url: '/401',
              icon: IconLock,
            },
            {
              title: 'Доступ запрещён',
              url: '/403',
              icon: IconUserOff,
            },
            {
              title: 'Не найдено',
              url: '/404',
              icon: IconError404,
            },
            {
              title: 'Ошибка сервера',
              url: '/500',
              icon: IconServerOff,
            },
            {
              title: 'Техническое обслуживание',
              url: '/503',
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: 'Прочее',
      items: [
        {
          title: 'Настройки',
          icon: IconSettings,
          items: [
            {
              title: 'Профиль',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Аккаунт',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Внешний вид',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Уведомления',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Отображение',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Центр помощи',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
