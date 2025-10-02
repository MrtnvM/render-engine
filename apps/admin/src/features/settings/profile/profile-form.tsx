import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  username: z
    .string('Please enter your username.')
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.email({
    error: (iss) => (iss.input === undefined ? 'Please select an email to display.' : undefined),
  }),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.url('Please enter a valid URL.'),
      }),
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: 'I own a computer.',
  urls: [{ value: 'https://shadcn.com' }, { value: 'http://twitter.com/shadcn' }],
}

export default function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => showSubmittedData(data))} className='space-y-8'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя пользователя</FormLabel>
              <FormControl>
                <Input placeholder='demo_user' {...field} />
              </FormControl>
              <FormDescription>
                Это ваше публичное имя. Это может быть ваше настоящее имя или псевдоним. Вы можете изменить его только
                раз в 30 дней.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите подтвержденный email для отображения' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='demo@demo.com'>demo@demo.com</SelectItem>
                  <SelectItem value='demo@avito.ru'>demo@avito.ru</SelectItem>
                  <SelectItem value='demo@example.com'>demo@example.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Вы можете управлять подтвержденными email адресами в <Link to='/'>настройках email</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>О себе</FormLabel>
              <FormControl>
                <Textarea placeholder='Расскажите немного о себе' className='resize-none' {...field} />
              </FormControl>
              <FormDescription>
                Вы можете использовать <span>@упоминания</span> других пользователей и организаций для ссылки на них.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>URL-адреса</FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    Добавьте ссылки на ваш веб-сайт, блог или профили в социальных сетях.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type='button' variant='outline' size='sm' className='mt-2' onClick={() => append({ value: '' })}>
            Добавить URL
          </Button>
        </div>
        <Button type='submit'>Обновить профиль</Button>
      </form>
    </Form>
  )
}
