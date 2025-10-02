import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTasks } from '../context/tasks-context'
import { TasksImportDialog } from './tasks-import-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteScenario } = useTasks()

  const handleDelete = () => {
    if (currentRow) {
      deleteScenario(currentRow.id)
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
    }
  }

  return (
    <>
      <TasksMutateDrawer key='task-create' open={open === 'create'} onOpenChange={() => setOpen('create')} />

      <TasksImportDialog key='tasks-import' open={open === 'import'} onOpenChange={() => setOpen('import')} />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`Удалить сценарий: ${currentRow.key}?`}
            desc={
              <>
                Вы собираетесь удалить сценарий с ключом <strong>{currentRow.key}</strong> (версия {currentRow.version}
                ). <br />
                Это действие не может быть отменено.
              </>
            }
            confirmText='Удалить'
          />
        </>
      )}
    </>
  )
}
