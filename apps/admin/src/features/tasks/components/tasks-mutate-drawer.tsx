import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Task } from '../data/schema'
import { useCreateScenario, useUpdateScenario } from '../hooks/use-scenarios'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const formSchema = z.object({
  key: z
    .string()
    .min(1, 'Ключ обязателен.')
    .regex(/^[a-z0-9-]+$/, 'Используйте только строчные буквы, цифры и дефисы'),
  version: z
    .string()
    .min(1, 'Версия обязательна.')
    .regex(/^\d+\.\d+\.\d+$/, 'Формат версии: x.y.z'),
  build_number: z.number().min(1, 'Номер сборки должен быть больше 0'),
  mainComponent: z.string().min(1, 'Главный компонент обязателен.'),
})
type TasksForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const createMutation = useCreateScenario()
  const updateMutation = useUpdateScenario()

  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          key: currentRow.key,
          version: currentRow.version,
          build_number: currentRow.build_number,
          mainComponent: currentRow.mainComponent,
        }
      : {
          key: '',
          version: '1.0.0',
          build_number: 1,
          mainComponent: '',
        },
  })

  const onSubmit = async (data: TasksForm) => {
    try {
      if (isUpdate && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
          updates: {
            key: data.key,
            version: data.version,
            build_number: data.build_number,
            mainComponent: { type: data.mainComponent } as any,
          },
        })
      } else {
        await createMutation.mutateAsync({
          key: data.key,
          version: data.version,
          build_number: data.build_number,
          mainComponent: { type: data.mainComponent } as any,
          components: {},
          metadata: {},
        })
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isSubmitting) {
          onOpenChange(v)
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Обновить' : 'Создать'} сценарий</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Обновите сценарий, указав необходимую информацию.'
              : 'Добавьте новый сценарий, указав необходимую информацию.'}
            Нажмите "Сохранить" когда закончите.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form id='tasks-form' onSubmit={form.handleSubmit(onSubmit)} className='flex-1 space-y-5 px-4'>
            <FormField
              control={form.control}
              name='key'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Ключ сценария</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='main-feed' disabled={isUpdate} />
                  </FormControl>
                  <p className='text-muted-foreground text-xs'>
                    Уникальный идентификатор сценария (только строчные буквы, цифры, дефисы)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='version'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Версия</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='1.0.0' />
                  </FormControl>
                  <p className='text-muted-foreground text-xs'>Формат: x.y.z (например, 1.0.0)</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='build_number'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Номер сборки</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      placeholder='1'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='mainComponent'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Главный компонент</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='FeedScreen' />
                  </FormControl>
                  <p className='text-muted-foreground text-xs'>Название главного компонента экрана</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={isSubmitting}>
              Закрыть
            </Button>
          </SheetClose>
          <Button form='tasks-form' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
