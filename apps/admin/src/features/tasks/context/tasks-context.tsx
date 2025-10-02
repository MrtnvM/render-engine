import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Task } from '../data/schema'
import { useScenarios, useDeleteScenario, useDeleteScenarios } from '../hooks/use-scenarios'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  scenarios: Task[]
  isLoading: boolean
  isError: boolean
  deleteScenario: (id: string) => void
  deleteScenarios: (ids: string[]) => void
}

const TasksContext = React.createContext<TasksContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TasksProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)

  // Fetch scenarios from Supabase
  const { data: scenarios = [], isLoading, isError } = useScenarios()
  const deleteScenarioMutation = useDeleteScenario()
  const deleteScenariosMutation = useDeleteScenarios()

  const handleDeleteScenario = (id: string) => {
    deleteScenarioMutation.mutate(id)
  }

  const handleDeleteScenarios = (ids: string[]) => {
    deleteScenariosMutation.mutate(ids)
  }

  return (
    <TasksContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        scenarios,
        isLoading,
        isError,
        deleteScenario: handleDeleteScenario,
        deleteScenarios: handleDeleteScenarios,
      }}
    >
      {children}
    </TasksContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
