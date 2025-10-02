import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Plus, Pencil, Trash2, Play, Calendar, Hash, Code2 } from 'lucide-react'
import { scenarioService } from './api/scenarios'
import { ScenarioDialog } from './components/scenario-dialog'
import type { Scenario } from './types'

const topNav = [
  {
    title: 'Overview',
    href: '/scenarios',
    isActive: true,
  },
]

export default function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)

  const { data: scenarios = [], isLoading, refetch } = useQuery({
    queryKey: ['scenarios'],
    queryFn: scenarioService.getAll,
  })

  const handleCreateScenario = () => {
    setSelectedScenario(null)
    setDialogMode('create')
  }

  const handleEditScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setDialogMode('edit')
  }

  const handleDeleteScenario = async (scenario: Scenario) => {
    if (confirm(`Are you sure you want to delete "${scenario.key}"?`)) {
      try {
        await scenarioService.delete(scenario.key)
        refetch()
      } catch (error) {
        console.error('Failed to delete scenario:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Scenarios</h1>
            <p className='text-muted-foreground'>
              Manage your JSX scenarios and compile them to JSON schemas.
            </p>
          </div>
          <Button onClick={handleCreateScenario} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            New Scenario
          </Button>
        </div>

        <div className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Scenarios</CardTitle>
                <Hash className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{scenarios.length}</div>
                <p className='text-xs text-muted-foreground'>
                  {scenarios.filter(s => new Date(s.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} updated this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Active</CardTitle>
                <Play className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{scenarios.length}</div>
                <p className='text-xs text-muted-foreground'>All scenarios are active</p>
              </CardContent>
            </Card>
          </div>

          {/* Scenarios Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Scenarios</CardTitle>
              <CardDescription>
                View and manage all your JSX scenarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              ) : scenarios.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <Code2 className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold'>No scenarios yet</h3>
                  <p className='text-muted-foreground mb-4'>
                    Get started by creating your first JSX scenario.
                  </p>
                  <Button onClick={handleCreateScenario}>
                    <Plus className='h-4 w-4 mr-2' />
                    Create Scenario
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className='border rounded-lg p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold'>{scenario.key}</h3>
                            <Badge variant='secondary'>v{scenario.version}</Badge>
                            <Badge variant='outline'>Build #{scenario.buildNumber}</Badge>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              Updated {formatDate(scenario.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditScenario(scenario)}
                          >
                            <Pencil className='h-3 w-3 mr-1' />
                            Edit
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteScenario(scenario)}
                          >
                            <Trash2 className='h-3 w-3 mr-1' />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Create/Edit Dialog */}
      <ScenarioDialog
        mode={dialogMode}
        scenario={selectedScenario}
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null)
            setSelectedScenario(null)
          }
        }}
        onSuccess={() => {
          setDialogMode(null)
          setSelectedScenario(null)
          refetch()
        }}
      />
    </>
  )
}