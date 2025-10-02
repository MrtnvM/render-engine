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
            <h2 className='text-3xl font-bold tracking-tight'>A/B Testing Platform</h2>
            <p className='text-muted-foreground mt-1'>
              Data-driven experimentation for schema optimization and user experience improvement
            </p>
          </div>
          <Button className='gap-2'>
            <IconFlask className='h-4 w-4' />
            Create New Experiment
          </Button>
        </div>

        {/* Feature Description */}
        <Card className='border-primary/20 from-primary/5 to-primary/10 mb-6 bg-gradient-to-br'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconFlask className='text-primary h-5 w-5' />
              About A/B Testing
            </CardTitle>
            <CardDescription>
              Enabling data-driven schema optimization through controlled experimentation
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm leading-relaxed'>
              A/B testing (also known as split testing) allows you to compare different versions of your UI schemas to
              determine which performs better with your users. This platform enables you to run controlled experiments,
              measure key performance metrics, and make informed decisions about your user interface changes.
            </p>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconTarget className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Targeted Testing</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Define specific user segments and audiences for your experiments. Test new features with power users
                  or specific geographic regions before wider rollout.
                </p>
              </div>

              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconChartPie className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Traffic Distribution</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Flexible distribution controls allow you to allocate traffic percentages across multiple variants.
                  Start small and scale up as confidence grows.
                </p>
              </div>

              <div className='bg-background/50 rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <IconChartBar className='text-primary h-5 w-5' />
                  <h4 className='font-semibold'>Statistical Analysis</h4>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Built-in statistical significance testing ensures your results are reliable. Track conversion rates,
                  click-through rates, and custom metrics.
                </p>
              </div>
            </div>

            <div className='border-primary bg-background/50 rounded-lg border-l-4 p-4'>
              <h4 className='mb-2 font-semibold'>Key Capabilities</h4>
              <ul className='grid gap-2 text-sm md:grid-cols-2'>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Real-time performance monitoring and metrics tracking</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Consistent user assignment across sessions</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Multi-variant testing (A/B/C/D...)</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Experiment isolation to prevent contamination</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>Success criteria definition and validation</span>
                </li>
                <li className='flex items-start gap-2'>
                  <IconCheck className='text-primary mt-0.5 h-4 w-4' />
                  <span>95% confidence interval statistical testing</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Experiments</CardTitle>
              <IconBrandSpeedtest className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{runningExperiments.length}</div>
              <p className='text-muted-foreground text-xs'>Currently running tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed Tests</CardTitle>
              <IconCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{completedExperiments.length}</div>
              <p className='text-muted-foreground text-xs'>Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Variants</CardTitle>
              <IconFlask className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {experimentList.reduce((acc, exp) => acc + exp.variants.length, 0)}
              </div>
              <p className='text-muted-foreground text-xs'>Across all experiments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Avg Success Rate</CardTitle>
              <IconTrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>68%</div>
              <p className='text-muted-foreground text-xs'>Experiments reach goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Experiments List */}
        <Tabs defaultValue='all' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='all'>All Experiments ({experimentList.length})</TabsTrigger>
            <TabsTrigger value='running'>Running ({runningExperiments.length})</TabsTrigger>
            <TabsTrigger value='draft'>Draft ({draftExperiments.length})</TabsTrigger>
            <TabsTrigger value='completed'>Completed ({completedExperiments.length})</TabsTrigger>
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
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Experiment Info */}
                    <div className='grid gap-4 md:grid-cols-3'>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconUsers className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Target Audience:</span>
                        <span className='font-medium'>{experiment.targetAudience.size.toLocaleString()}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconFlask className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Variants:</span>
                        <span className='font-medium'>{experiment.variants.length}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <IconTarget className='text-muted-foreground h-4 w-4' />
                        <span className='text-muted-foreground'>Goal:</span>
                        <span className='font-medium'>{experiment.successCriteria.metric}</span>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className='space-y-2'>
                      <h4 className='text-sm font-semibold'>Variants Performance</h4>
                      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                        {experiment.variants.map((variant) => (
                          <div key={variant.id} className='bg-background/50 rounded-lg border p-3'>
                            <div className='mb-2 flex items-center justify-between'>
                              <span className='text-sm font-medium'>{variant.name}</span>
                              {variant.isControl && (
                                <Badge variant='outline' className='text-xs'>
                                  Control
                                </Badge>
                              )}
                            </div>
                            <div className='space-y-1 text-xs'>
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>Distribution:</span>
                                <span className='font-medium'>{variant.distribution}%</span>
                              </div>
                              {variant.performanceMetrics && (
                                <>
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Conversion Rate:</span>
                                    <span className='font-medium'>
                                      {(variant.performanceMetrics.conversionRate! * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>Sample Size:</span>
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
                  <p className='text-muted-foreground'>No running experiments</p>
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
                        View Details
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
                  <p className='text-muted-foreground'>No draft experiments</p>
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
                        Edit Draft
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
                  <p className='text-muted-foreground'>No completed experiments</p>
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
                        View Results
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
