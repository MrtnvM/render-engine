import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Task } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'key',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ключ' />,
    cell: ({ row }) => <div className='w-[120px] font-mono text-sm'>{row.getValue('key')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'version',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Версия' />,
    cell: ({ row }) => (
      <div className='flex items-center space-x-2'>
        <Badge variant='secondary'>{row.getValue('version')}</Badge>
        <span className='text-muted-foreground text-xs'>#{row.original.build_number}</span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'build_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Билд' />,
    cell: ({ row }) => <div className='w-[80px] text-center'>#{row.getValue('build_number')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Дата обновления' />,
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date
      return (
        <div className='w-[160px] text-sm'>
          {date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'componentsCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Компонентов' />,
    cell: ({ row }) => <div className='w-[80px] text-center'>{row.getValue('componentsCount')}</div>,
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
