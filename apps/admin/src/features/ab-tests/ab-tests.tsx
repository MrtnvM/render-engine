import {
  IconFlask,
  IconChartBar,
  IconUsers,
  IconTrendingUp,
  IconCheck,
  IconX,
  IconClock,
  IconEdit,
  IconBrandSpeedtest,
  IconTarget,
  IconChartPie,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { experiments } from './data/experiments'
import { experimentListSchema } from './data/schema'

export default function ABTests() {
  const experimentList = experimentListSchema.parse(experiments)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'DRAFT':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
      case 'PAUSED':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <IconBrandSpeedtest className='h-4 w-4' />
      case 'COMPLETED':
        return <IconCheck className='h-4 w-4' />
      case 'DRAFT':
        return <IconEdit className='h-4 w-4' />
      case 'PAUSED':
        return <IconClock className='h-4 w-4' />
      case 'CANCELLED':
        return <IconX className='h-4 w-4' />
      default:
        return null
    }
  }

  const runningExperiments = experimentList.filter((exp) => exp.status === 'RUNNING')
  const completedExperiments = experimentList.filter((exp) => exp.status === 'COMPLETED')
  const draftExperiments = experimentList.filter((exp) => exp.status === 'DRAFT')

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
        <div className='mb-6 flex flex-wrap items-start justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Платформа A/B-тестирования</h2>
            <p className='text-muted-foreground mt-1'>
              Экспериментирование на основе данных для оптимизации схем и улучшения пользовательского опыта
            </p>
          </div>
          <Button className='gap-2'>
            <IconFlask className='h-4 w-4' />
            Создать новый эксперимент
          </Button>
        </div>

        {/* Feature Description */}
        <Card className='border-primary/20 from-primary/5 to-primary/10 mb-6 bg-gradient-to-br'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconFlask className='text-primary h-5 w-5' />О A/B-тестировании
            </CardTitle>
            <CardDescription>
              Оптимизация схем на основе данных с помощью контролируемого экспериментирования
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconTarget className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Целевое тестирование</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Определяйте конкретные сегменты пользователей и аудитории для ваших экспериментов. Тестируйте новые
                  функции с активными пользователями или в определенных географических регионах перед широким запуском.
                </p>
              </div>

              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconChartPie className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Распределение трафика</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Гибкие настройки распределения позволяют выделять процент трафика между несколькими вариантами.
                  Начинайте с малого и масштабируйтесь по мере роста уверенности.
                </p>
              </div>

              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconChartBar className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Статистический анализ</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Встроенное тестирование статистической значимости гарантирует надежность результатов. Отслеживайте
                  конверсию, CTR и пользовательские метрики.
                </p>
              </div>
            </div>

            <div className='border-primary bg-background/50 rounded-lg border-l-4 p-4'>
              <h4 className='mb-2 font-semibold'>Ключевые возможности</h4>
              <ul className='grid gap-2 text-sm md:grid-cols-2'>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Мониторинг производительности и отслеживание метрик в реальном времени</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Последовательное назначение пользователей между сеансами</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Мультивариантное тестирование (A/B/C/D...)</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Изоляция экспериментов для предотвращения перекрестного влияния</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Определение и валидация критериев успеха</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Статистическое тестирование с 95% доверительным интервалом</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Активные эксперименты</CardTitle>
              <IconBrandSpeedtest className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{runningExperiments.length}</div>
              <p className='text-muted-foreground text-xs'>Выполняются в данный момент</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Завершенные тесты</CardTitle>
              <IconCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{completedExperiments.length}</div>
              <p className='text-muted-foreground text-xs'>Успешно завершены</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Всего вариантов</CardTitle>
              <IconFlask className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {experimentList.reduce((acc, exp) => acc + exp.variants.length, 0)}
              </div>
              <p className='text-muted-foreground text-xs'>Во всех экспериментах</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Средняя успешность</CardTitle>
              <IconTrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>68%</div>
              <p className='text-muted-foreground text-xs'>Эксперименты достигают целей</p>
            </CardContent>
          </Card>
        </div>

        {/* Experiments List */}
        <Tabs defaultValue='all' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='all'>Все эксперименты ({experimentList.length})</TabsTrigger>
            <TabsTrigger value='running'>Активные ({runningExperiments.length})</TabsTrigger>
            <TabsTrigger value='draft'>Черновики ({draftExperiments.length})</TabsTrigger>
            <TabsTrigger value='completed'>Завершенные ({completedExperiments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='all' className='space-y-4'>
            {experimentList.map((experiment) => (
              <Card key={experiment.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <CardTitle>{experiment.name}</CardTitle>
                        <Badge className={getStatusColor(experiment.status)}>
                          <span className='flex items-center gap-1'>
                            {getStatusIcon(experiment.status)}
                            {experiment.status}
                          </span>
                        </Badge>
                      </div>
                      <CardDescription>{experiment.description}</CardDescription>
                    </div>
                    <Button variant='outline' size='sm'>
                      Подробнее
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Experiment Info */}
                    <div className='grid gap-4 md:grid-cols-3'>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconUsers className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Целевая аудитория:</span>
                        <span className='font-medium'>{experiment.targetAudience.size.toLocaleString()}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconFlask className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Варианты:</span>
                        <span className='font-medium'>{experiment.variants.length}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconTarget className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Цель:</span>
                        <span className='font-medium'>{experiment.successCriteria.metric}</span>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className='space-y-2'>
                      <h4 className='text-sm font-semibold'>Производительность вариантов</h4>
                      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                        {experiment.variants.map((variant) => (
                          <div key={variant.id} className='bg-background/50 rounded-lg border p-3'>
                            <div className='mb-2 flex items-center justify-between'>
                              <span className='text-sm font-medium'>{variant.name}</span>
                              {variant.isControl && (
                                <Badge variant='outline' className='text-xs'>
                                  Контроль
                                </Badge>
                              )}
                            </div>
                            <div className='space-y-1 text-xs'>
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>Распределение:</span>
                                <span className='font-medium'>{variant.distribution}%</span>
                              </div>
                              {variant.performanceMetrics && (
                                <>
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Конверсия:</span>
                                    <span className='font-medium'>
                                      {(variant.performanceMetrics.conversionRate! * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Размер выборки:</span>
                                    <span className='font-medium'>
                                      {variant.performanceMetrics.sampleSize?.toLocaleString()}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value='running' className='space-y-4'>
            {runningExperiments.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconBrandSpeedtest className='text-muted-foreground mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>Нет активных экспериментов</p>
                </CardContent>
              </Card>
            ) : (
              runningExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          <CardTitle>{experiment.name}</CardTitle>
                          <Badge className={getStatusColor(experiment.status)}>
                            <span className='flex items-center gap-1'>
                              {getStatusIcon(experiment.status)}
                              {experiment.status}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <Button variant='outline' size='sm'>
                        Подробнее
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value='draft' className='space-y-4'>
            {draftExperiments.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconEdit className='text-muted-foreground mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>Нет черновиков экспериментов</p>
                </CardContent>
              </Card>
            ) : (
              draftExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          <CardTitle>{experiment.name}</CardTitle>
                          <Badge className={getStatusColor(experiment.status)}>
                            <span className='flex items-center gap-1'>
                              {getStatusIcon(experiment.status)}
                              {experiment.status}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <Button variant='outline' size='sm'>
                        Редактировать
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value='completed' className='space-y-4'>
            {completedExperiments.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconCheck className='text-muted-foreground mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>Нет завершенных экспериментов</p>
                </CardContent>
              </Card>
            ) : (
              completedExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-2'>
                          <CardTitle>{experiment.name}</CardTitle>
                          <Badge className={getStatusColor(experiment.status)}>
                            <span className='flex items-center gap-1'>
                              {getStatusIcon(experiment.status)}
                              {experiment.status}
                            </span>
                          </Badge>
                        </div>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <Button variant='outline' size='sm'>
                        Посмотреть результаты
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
