# Render Engine

Фреймворк для создания Backend-Driven UI, который позволяет создавать динамические мобильные и веб-интерфейсы через серверные конфигурации. Создавайте, развертывайте и обновляйте UI-компоненты без релизов приложений.

## 📋 Обзор

Render Engine — это комплексное решение для Backend-Driven UI (BDUI), которое позволяет:

- 🎨 Определять UI-компоненты и макеты на стороне сервера
- 📱 Рендерить нативные iOS и Android интерфейсы динамически
- 🖥️ Управлять конфигурациями через административную панель
- 🚀 Развертывать обновления UI мгновенно без релизов в магазинах приложений
- ✅ Валидировать и тестировать конфигурации перед развертыванием

## 🏗️ Структура проекта

Это монорепозиторий, управляемый с помощью pnpm workspaces, содержащий следующие приложения и пакеты:

### Приложения

- **`apps/admin`** - Веб-административная панель для управления UI-конфигурациями (React + Vite + TanStack Router)
- **`apps/admin-backend`** - Backend API для административной панели (TypeScript + Drizzle ORM)
- **`apps/render-ios-playground`** - iOS playground приложение для тестирования конфигураций (Swift)
- **`apps/render-android-playground`** - Android playground приложение для тестирования конфигураций (Kotlin)
- **`apps/render-cli`** - Инструмент командной строки для управления конфигурациями

### Пакеты

- **`packages/domain`** - Основные доменные модели и бизнес-логика
- **`packages/application`** - Сервисы приложения и use cases
- **`packages/infrastructure`** - Реализации инфраструктуры (база данных, внешние сервисы)
- **`packages/render-admin-sdk`** - SDK для интеграции с админ-панелью
- **`packages/render-ios-sdk`** - Swift SDK для iOS приложений
- **`packages/eslint-config`** - Общая конфигурация ESLint

## 🚀 Начало работы

### Требования

- **Node.js** 22+ и **pnpm** 10.17.1+
- **iOS разработка**: Xcode 15+ (для iOS playground)
- **Android разработка**: Android Studio (для Android playground)

### Установка

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd render-engine
```

2. Установите зависимости:

```bash
pnpm install
```

### Разработка

Запустите все dev-серверы параллельно:

```bash
pnpm dev
```

Или запустите отдельные приложения:

```bash
# Административная панель
cd apps/admin
pnpm dev

# Backend админ-панели
cd apps/admin-backend
pnpm dev

# CLI инструмент
cd apps/render-cli
pnpm dev
```

## 📦 Доступные команды

Выполняйте эти команды из корневой директории:

- **`pnpm dev`** - Запустить все dev-серверы параллельно
- **`pnpm build`** - Собрать все пакеты и приложения
- **`pnpm test`** - Запустить все тесты во всех пакетах
- **`pnpm lint`** - Проверить все пакеты линтером
- **`pnpm format`** - Отформатировать весь код
- **`pnpm deploy`** - Собрать и развернуть все пакеты

## 🛠️ Технологический стек

### Frontend

- React + TypeScript
- Vite (инструмент сборки)
- TanStack Router (роутинг)
- ShadcnUI + TailwindCSS (UI-компоненты)
- Supabase Auth (аутентификация)

### Backend

- TypeScript + Node.js
- Drizzle ORM (база данных)

### Мобильные SDK

- Swift Package Manager (iOS)
- Kotlin + Gradle (Android)

### Инструменты разработки

- pnpm workspaces (управление монорепозиторием)
- ESLint + Prettier (качество кода)
- Vitest (тестирование)
- Husky + lint-staged (git хуки)

## 📖 Документация

Подробная документация доступна в директориях `/docs` и `/specs`:

- **[Дизайн-система](docs/design-system/)** - Спецификации дизайна компонентов
- **[Спецификации](specs/)** - Технические спецификации для доменных моделей и сервисов
- **[Документация iOS SDK](packages/render-ios-sdk/README.md)** - Руководство по использованию iOS SDK
- **[Документация Admin SDK](packages/render-admin-sdk/README.md)** - Руководство по использованию Admin SDK

## 🧪 Тестирование

Запустить тесты для всех пакетов:

```bash
pnpm test
```

Запустить тесты для конкретного пакета:

```bash
cd packages/domain
pnpm test
```

Pre-commit хуки автоматически:

- Отформатируют код с помощью Prettier
- Запустят проверки ESLint
- Валидируют commit-сообщения

## 🔗 Ресурсы

- [Материалы дизайн-системы Avito](resources/avito-design-materials/)
- [Спецификации проекта](specs/project/project.spec.md)
- [Domain-Driven Design домены](specs/project/ddd-domains.spec.md)

Сделано с ❤️ для Backend-Driven UI
