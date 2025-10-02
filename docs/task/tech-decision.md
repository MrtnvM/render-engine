# Техническое Решение: Backend-Driven UI Framework для Avito

**Дата:** 2 октября 2025  
**Статус:** Утверждено к разработке

---

## 1. Краткое описание проблемы

Avito сталкивается с проблемой медленной доставки изменений в мобильные приложения из-за:

- Необходимости прохождения модерации в App Store и Google Play
- Длительного цикла релиза (тестирование → постепенный раскат → финальный релиз)
- Невозможности быстрой итерации и A/B тестирования UI

**Цель:** Создать систему Backend-Driven UI (BDUI), которая позволит обновлять интерфейсы без релиза приложений.

---

## 2. Архитектурное решение

### 2.1. Общая архитектура

```
┌─────────────────┐
│  Admin Panel    │ ──── Создание и редактирование UI конфигураций
│  (React + shadcn)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend API    │ ──── Хранение, версионирование, валидация конфигов
│  (TypeScript)   │
│  + PostgreSQL   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│         Client Apps                 │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │   iOS   │ │ Android │ │   Web  ││ ──── Рендеринг UI из JSON/DSL
│  │ (Swift) │ │(Kotlin) │ │(React) ││
│  └─────────┘ └─────────┘ └────────┘│
└─────────────────────────────────────┘
         │
         ↓
┌─────────────────┐
│   Analytics     │ ──── Сбор метрик взаимодействия
│  (Firebase/     │
│   Amplitude)    │
└─────────────────┘
```

### 2.2. Ключевые компоненты

#### **A. Backend Service (TypeScript + PostgreSQL)**

- **API для конфигураций:**
  - `GET /api/screens/:id` - получение конфигурации экрана
  - `POST /api/screens` - создание новой конфигурации
  - `PUT /api/screens/:id` - обновление конфигурации
  - `GET /api/screens/:id/versions` - история версий
- **Хранение данных:**

  - PostgreSQL для конфигураций и метаданных
  - Версионирование конфигов (audit trail)
  - Индексирование для быстрого поиска

- **Валидация:**
  - JSON Schema валидация конфигов
  - Проверка безопасности (sanitization)
  - Контроль доступа (RBAC)

#### **B. Admin Panel (React + shadcn/ui)**

- **Visual Editor:**
  - Drag-and-drop интерфейс для сборки экранов
  - Live preview всех платформ
  - Управление стилями и свойствами компонентов
- **Функциональность:**
  - Библиотека компонентов Avito Design System
  - Управление версиями и откат
  - A/B тест конфигурация
  - Preview на реальных устройствах
  - История изменений

#### **C. SDK для клиентов**

**iOS SDK (Swift):**

```swift
// Packages/render-ios-sdk/
- RenderEngine: парсинг JSON → UIKit/SwiftUI компоненты
- StyleEngine: применение стилей из конфига
- NetworkManager: кеширование конфигов
- AnalyticsTracker: отправка событий
```

**Android SDK (Kotlin):**

```kotlin
// Аналогичная структура для Android
- RenderEngine: JSON → View components
- StyleEngine: применение стилей
- CacheManager: offline support
- AnalyticsModule
```

**Web SDK (React):**

```typescript
// packages/render-admin-sdk/
- Transpiler: JSX/JSON → React компоненты
- StyleSystem: CSS-in-JS
- ConfigLoader: fetch + cache
```

---

## 3. Технологический стек

### Backend

- **Runtime:** Node.js + TypeScript
- **Framework:** Express/Fastify
- **Database:** PostgreSQL 15+
- **ORM:** Drizzle ORM
- **Валидация:** Zod
- **Аутентификация:** JWT

### Admin Panel

- **Framework:** React 18 + TypeScript
- **Routing:** TanStack Router
- **UI Kit:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS

### Mobile SDK

- **iOS:** Swift 5.9+, SwiftUI + UIKit
- **Android:** Kotlin 1.9+, Jetpack Compose + Views

### DevOps

- **Монорепо:** pnpm workspaces
- **CI/CD:** GitHub Actions
- **Контейнеризация:** Docker
- **Мониторинг:** Prometheus + Grafana

### Analytics

- **Mobile:** Firebase Analytics
- **Web:** Amplitude / Mixpanel
- **Custom:** Собственная система событий

---

## 4. DSL и формат конфигурации

### 4.1. Подход: JSX → JSON

Мы используем **JSX как DSL** для описания UI, который транспилируется в JSON:

```tsx
// В Admin Panel разработчики пишут:
<Screen id="cart">
  <Container padding={16}>
    <Text style={styles.title}>Корзина</Text>
    <ProductList />
    <Button onPress="checkout">Оформить заказ</Button>
  </Container>
</Screen>
```

**Транспилируется в JSON:**

```json
{
  "type": "Screen",
  "id": "cart",
  "children": [
    {
      "type": "Container",
      "props": { "padding": 16 },
      "children": [
        {
          "type": "Text",
          "props": { "style": "title" },
          "children": ["Корзина"]
        },
        { "type": "ProductList" },
        {
          "type": "Button",
          "props": { "onPress": "checkout" },
          "children": ["Оформить заказ"]
        }
      ]
    }
  ]
}
```

### 4.2. Преимущества подхода

✅ **Для разработчиков:**

- Знакомый синтаксис (React/JSX)
- TypeScript поддержка и автодополнение
- Легкая валидация на этапе написания

✅ **Для системы:**

- JSON удобен для передачи по сети
- Легко парсится на любой платформе
- Возможность кеширования и оптимизации

---

## 5. Система компонентов

### 5.1. Базовые компоненты (MVP)

| Компонент   | Описание                         | Платформы         |
| ----------- | -------------------------------- | ----------------- |
| `Container` | Контейнер с layout               | iOS, Android, Web |
| `Text`      | Текст с стилями                  | iOS, Android, Web |
| `Image`     | Изображение                      | iOS, Android, Web |
| `Button`    | Кнопка с действием               | iOS, Android, Web |
| `Input`     | Поле ввода                       | iOS, Android, Web |
| `List`      | Скроллируемый список             | iOS, Android, Web |
| `Stack`     | Вертикальный/горизонтальный стек | iOS, Android, Web |

### 5.2. Avito-специфичные компоненты

- `ProductCard` - карточка товара
- `UserAvatar` - аватар пользователя
- `PriceTag` - отображение цены
- `CategorySelector` - выбор категории
- `SearchBar` - строка поиска
- `Rating` - рейтинг и отзывы

### 5.3. Система стилей

```typescript
{
  "styles": {
    "title": {
      "fontSize": 24,
      "fontWeight": "bold",
      "fontFamily": "Avito Sans",
      "color": "#000000"
    },
    "button": {
      "backgroundColor": "#0AF",
      "borderRadius": 8,
      "padding": [12, 24]
    }
  }
}
```

**Поддержка:**

- Responsive design (breakpoints)
- Dark mode
- Platform-specific overrides

---

## 6. Ключевые функции

### 6.1. Версионирование и откат

```typescript
interface ScreenVersion {
  id: string
  screenId: string
  version: number
  config: JSONConfig
  createdAt: Date
  createdBy: string
  isActive: boolean
}
```

- Каждое изменение = новая версия
- Возможность отката к предыдущей версии
- Git-like diff для просмотра изменений

### 6.2. A/B тестирование

```typescript
interface ABTest {
  id: string
  screenId: string
  variants: {
    control: ScreenVersion
    treatment: ScreenVersion
  }
  distribution: number // 0.5 = 50/50
  startDate: Date
  endDate: Date
}
```

### 6.3. Условный рендеринг

```tsx
<Container>
  <If condition="user.isPremium">
    <PremiumBadge />
  </If>
  <Text>Привет, {user.name}!</Text>
</Container>
```

### 6.4. Кеширование и offline

- **Стратегия:** Cache-first с фоновым обновлением
- **TTL:** Настраиваемый per-screen
- **Fallback:** Последняя закешированная версия

### 6.5. Analytics

**Автоматические метрики:**

- Screen views
- Component impressions
- Button clicks
- Time on screen
- Navigation flows

**Кастомные события:**

```json
{
  "type": "Button",
  "props": {
    "onPress": "checkout",
    "analytics": {
      "event": "cart_checkout_clicked",
      "properties": {
        "cart_value": "${cart.total}"
      }
    }
  }
}
```

---

## 7. Безопасность

### 7.1. Валидация конфигов

- **JSON Schema:** Структурная валидация
- **Content Security:** Санитизация строк
- **Logic Restrictions:** Ограничение на выполнение произвольного кода

### 7.2. Права доступа

```typescript
enum Role {
  VIEWER = 'viewer', // Просмотр
  EDITOR = 'editor', // Редактирование
  PUBLISHER = 'publisher', // Публикация
  ADMIN = 'admin', // Полный доступ
}
```

### 7.3. Аудит

- Логирование всех изменений
- История действий пользователей
- Автоматические бэкапы

---

## 8. Производительность

### 8.1. Метрики

| Метрика                | Целевое значение | Критичное значение |
| ---------------------- | ---------------- | ------------------ |
| Время загрузки конфига | < 200ms          | < 500ms            |
| Время первого рендера  | < 100ms          | < 300ms            |
| Размер конфига         | < 50KB           | < 200KB            |
| Memory footprint       | < 10MB           | < 30MB             |

### 8.2. Оптимизации

- **Gzip compression** для конфигов
- **Lazy loading** компонентов
- **Virtual scrolling** для списков
- **Image optimization** и lazy loading
- **Bundle splitting** для Web

---

## 9. План разработки

### Фаза 1: MVP (2-3 недели)

- ✅ Backend API для хранения конфигов
- ✅ Базовая админ-панель с редактором
- ✅ iOS SDK с базовыми компонентами
- ✅ Transpiler JSX → JSON
- ⬜ Демо экрана из Figma

### Фаза 2: Базовая функциональность (1-2 недели)

- ⬜ Android SDK
- ⬜ Web SDK
- ⬜ Analytics интеграция
- ⬜ Версионирование и откат
- ⬜ Улучшенный UI админ-панели

### Фаза 3: Продвинутые функции (2-3 недели)

- ⬜ A/B тестирование
- ⬜ Условный рендеринг
- ⬜ Интернационализация (i18n)
- ⬜ Feature flags
- ⬜ Шаблоны и переиспользование

### Фаза 4: Production-ready (1-2 недели)

- ⬜ Мониторинг и алерты
- ⬜ Performance оптимизации
- ⬜ Документация
- ⬜ E2E тесты
- ⬜ CI/CD pipeline

---

## 10. Риски и митигации

| Риск                                              | Вероятность | Влияние | Митигация                                                               |
| ------------------------------------------------- | ----------- | ------- | ----------------------------------------------------------------------- |
| Проблемы производительности на старых устройствах | Средняя     | Высокое | Бюджеты производительности, профилирование, fallback к нативным экранам |
| Сложность отладки UI багов                        | Высокая     | Среднее | Детальное логирование, preview в админке, source maps                   |
| Ограничения DSL для сложных UI                    | Средняя     | Среднее | Гибридный подход: BDUI + нативные компоненты                            |
| Проблемы с кешированием                           | Низкая      | Среднее | Версионирование конфигов, cache invalidation стратегия                  |
| Недостаточная безопасность                        | Низкая      | Высокое | Code review, security audit, ограничения DSL                            |

---

## 11. Метрики успеха

### Технические метрики

- **Время доставки изменений:** с 2-3 недель → до **1 дня**
- **Uptime backend:** > 99.9%
- **Latency API:** p95 < 200ms
- **Client render time:** p95 < 100ms

### Бизнес-метрики

- **Скорость итераций:** увеличение числа A/B тестов на 300%
- **Время сборки экрана:** < 1 час для простого экрана
- **Developer satisfaction:** NPS > 8/10

### Качество кода

- **Test coverage:** > 80%
- **Linting:** 0 ошибок
- **TypeScript:** strict mode

---

## 12. Дальнейшее развитие

### Краткосрочные планы (3-6 месяцев)

- Поддержка анимаций и переходов
- Визуальный редактор с drag-and-drop
- Библиотека готовых шаблонов экранов
- Интеграция с CMS

### Долгосрочные планы (6-12 месяцев)

- AI-ассистент для генерации UI
- Автоматическая оптимизация производительности
- Cross-platform компоненты с единым кодом
- Visual regression testing

---

## 13. Заключение

Предложенное решение позволит Avito:

1. ✅ **Ускорить доставку:** Обновления UI без релизов в App Store
2. ✅ **Снизить нагрузку:** Меньше нативного кода, больше переиспользования
3. ✅ **Увеличить гибкость:** Быстрое A/B тестирование и эксперименты
4. ✅ **Улучшить аналитику:** Детальные данные о взаимодействии с UI
5. ✅ **Масштабироваться:** Единая система для iOS, Android и Web

**Технологический стек** основан на проверенных решениях и современных практиках.

**Архитектура** обеспечивает гибкость, производительность и безопасность.

**План разработки** позволяет поэтапно доставлять ценность с быстрым MVP.

---

**Подготовил:** Render Engine Team  
**Дата:** 2 октября 2025  
**Статус:** Ready for Implementation
