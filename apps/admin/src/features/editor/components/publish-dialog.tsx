import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, Upload } from 'lucide-react'
import { usePublishScenario } from '../hooks/use-publish-scenario'

interface PublishDialogProps {
  compiledScenario: any
  disabled?: boolean
}

export function PublishDialog({ compiledScenario, disabled }: PublishDialogProps) {
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState(compiledScenario?.version || '1.0.0')
  const [description, setDescription] = useState('')
  const publishMutation = usePublishScenario()

  const handlePublish = () => {
    if (!compiledScenario) return

    publishMutation.mutate(
      {
        key: compiledScenario.key,
        version,
        mainComponent: compiledScenario.main,
        components: compiledScenario.components,
        stores: compiledScenario.stores,
        actions: compiledScenario.actions,
        metadata: {
          description,
          publishedBy: 'admin',
        },
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            setOpen(false)
            setDescription('')
          }, 2000)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || !compiledScenario} variant='default'>
          <Upload className='mr-2 h-4 w-4' />
          Опубликовать
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Публикация сценария</DialogTitle>
          <DialogDescription>
            Опубликуйте скомпилированный сценарий в базу данных. Он станет доступен для мобильных приложений.
          </DialogDescription>
        </DialogHeader>

        {publishMutation.isError && (
          <Alert variant='destructive'>
            <XCircle className='h-4 w-4' />
            <AlertDescription>{publishMutation.error.error || 'Ошибка публикации'}</AlertDescription>
          </Alert>
        )}

        {publishMutation.isSuccess && (
          <Alert className='border-green-200 dark:border-green-800'>
            <CheckCircle2 className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-700 dark:text-green-400'>
              Сценарий успешно опубликован! Build #{publishMutation.data.buildNumber}
            </AlertDescription>
          </Alert>
        )}

        {!publishMutation.isSuccess && (
          <>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='key'>Ключ сценария</Label>
                <Input id='key' value={compiledScenario?.key || ''} disabled />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='version'>Версия</Label>
                <Input
                  id='version'
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder='1.0.0'
                  pattern='^\d+\.\d+\.\d+$'
                />
                <p className='text-xs text-muted-foreground'>Формат: major.minor.patch (например, 1.0.0)</p>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='description'>Описание (опционально)</Label>
                <Input
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Краткое описание изменений'
                />
              </div>

              <div className='bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm space-y-1'>
                <div>
                  <span className='font-semibold'>Компоненты:</span>{' '}
                  {Object.keys(compiledScenario?.components || {}).length}
                </div>
                {compiledScenario?.stores && (
                  <div>
                    <span className='font-semibold'>Stores:</span> {compiledScenario.stores.length}
                  </div>
                )}
                {compiledScenario?.actions && (
                  <div>
                    <span className='font-semibold'>Actions:</span> {compiledScenario.actions.length}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type='submit' onClick={handlePublish} disabled={publishMutation.isPending || !version}>
                {publishMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {publishMutation.isPending ? 'Публикация...' : 'Опубликовать'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
