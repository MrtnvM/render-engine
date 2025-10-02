import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTasks } from '../context/tasks-context'
import { Task } from '../data/schema'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0
  const { deleteScenarios } = useTasks()

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const ids = selectedRows.map((row) => (row.original as Task).id)
    deleteScenarios(ids)
    table.resetRowSelection()
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Поиск по ключу...'
          value={(table.getColumn('key')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('key')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {hasSelection && (
          <Button variant='destructive' size='sm' onClick={handleBulkDelete} className='h-8'>
            Удалить выбранные ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
        {isFiltered && (
          <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
            Сбросить
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
