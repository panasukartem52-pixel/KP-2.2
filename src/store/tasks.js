
import { reactive } from 'vue'
import initialTasks from '../data/tasks'

const allowedStatuses = ['todo', 'progress', 'done']
const allowedPriorities = ['low', 'medium', 'high']
const allowedCategories = ['study', 'work', 'personal']

export const taskState = reactive({
  tasks: initialTasks.map((task) => ({
    category: 'study',
    ...task
  }))
})

function validDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const date = new Date(`${value}T12:00:00`)

  return !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value
}

function getToday() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeTaskData(data) {
  if (!data || typeof data !== 'object') return null

  const title = typeof data.title === 'string'
    ? data.title.trim()
    : ''

  const description = typeof data.description === 'string'
    ? data.description.trim()
    : ''

  const category = data.category ?? 'study'

  if (title.length < 3 || title.length > 80) return null
  if (description.length > 300) return null
  if (!allowedStatuses.includes(data.status)) return null
  if (!allowedPriorities.includes(data.priority)) return null
  if (!allowedCategories.includes(category)) return null
  if (!validDate(data.dueDate)) return null

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    category,
    dueDate: data.dueDate
  }
}

export function addTask(data) {
  const normalized = normalizeTaskData(data)
  if (!normalized) return null

  if (normalized.dueDate < getToday()) {
    return null
  }

  const nextId = taskState.tasks.reduce(
    (maxId, task) => Math.max(maxId, task.id),
    0
  ) + 1

  const newTask = {
    id: nextId,
    ...normalized
  }

  taskState.tasks.push(newTask)

  return newTask
}

export function updateTask({ id, ...data }) {
  const normalized = normalizeTaskData(data)
  if (!normalized) return null

  const task = taskState.tasks.find(
    (item) => item.id === id
  )

  if (!task) return null

  Object.assign(task, normalized)

  return task
}

export function setTaskStatus({ id, status }) {
  if (!allowedStatuses.includes(status)) return

  const task = taskState.tasks.find(
    (item) => item.id === id
  )

  if (task) task.status = status
}

export function setTaskPriority({ id, priority }) {
  if (!allowedPriorities.includes(priority)) return

  const task = taskState.tasks.find(
    (item) => item.id === id
  )

  if (task) task.priority = priority
}
