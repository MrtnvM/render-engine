import {
  IconBrowserCheck,
  IconChecklist,
  IconCode,
  IconHelp,
  IconLayoutDashboard,
  IconNotification,
  IconPackages,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
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
