
<script setup>
import { computed, nextTick, ref } from 'vue'
import AppTabbar from '../components/AppTabbar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'
import TaskListControls from '../components/TaskListControls.vue'

import {
  taskState,
  addTask,
  updateTask,
  deleteTask,
  setTaskStatus,
  setTaskPriority
} from '../store/tasks'

import '../css/task-components.css'
import '../css/task-form.css'
import '../css/task-list.css'

const searchText = ref('')
const selectedStatus = ref('all')
const selectedPriority = ref('all')
const sortOrder = ref('newest')
const onlyIncomplete = ref(false)

const selectedTask = ref(null)
const formVisible = ref(false)
const editingId = ref(null)
const formAnchor = ref(null)
const feedback = ref('')

const editingTask = computed(() =>
  taskState.tasks.find(
    (task) => task.id === editingId.value
  ) ?? null
)

const visibleTasks = computed(() => {
  const search = searchText.value
    .trim()
    .toLocaleLowerCase('uk-UA')

  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1
  }

  const statusWeight = {
    progress: 0,
    todo: 1,
    done: 2
  }

  const result = taskState.tasks.filter((task) => {
    const text = `${task.title} ${task.description ?? ''}`
      .toLocaleLowerCase('uk-UA')

    const matchesSearch =
      !search || text.includes(search)

    const matchesStatus =
      selectedStatus.value === 'all' ||
      task.status === selectedStatus.value

    const matchesPriority =
      selectedPriority.value === 'all' ||
      task.priority === selectedPriority.value

    const matchesIncomplete =
      !onlyIncomplete.value ||
      task.status !== 'done'

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesIncomplete
    )
  })

  return result.sort((a, b) => {
    if (sortOrder.value === 'title') {
      return (
        a.title.localeCompare(b.title, 'uk-UA') ||
        a.id - b.id
      )
    }

    if (sortOrder.value === 'priority') {
      return (
        priorityWeight[b.priority] -
        priorityWeight[a.priority] ||
        b.id - a.id
      )
    }

    if (sortOrder.value === 'status') {
      return (
        statusWeight[a.status] -
        statusWeight[b.status] ||
        b.id - a.id
      )
    }

    if (sortOrder.value === 'dueDate') {
      const first = a.dueDate || '9999-12-31'
      const second = b.dueDate || '9999-12-31'

      return (
        first.localeCompare(second) ||
        b.id - a.id
      )
    }

    if (sortOrder.value === 'dueDateDesc') {
      if (!a.dueDate && !b.dueDate) {
        return b.id - a.id
      }

      if (!a.dueDate) return 1
      if (!b.dueDate) return -1

      return (
        b.dueDate.localeCompare(a.dueDate) ||
        b.id - a.id
      )
    }

    return b.id - a.id
  })
})

const visibleCompletedCount = computed(() =>
  visibleTasks.value.filter(
    (task) => task.status === 'done'
  ).length
)

const visibleCompletedPercent = computed(() => {
  const total = visibleTasks.value.length

  if (total === 0) return 0

  return Math.round(
    (visibleCompletedCount.value / total) * 100
  )
})

function resetFilters() {
  searchText.value = ''
  selectedStatus.value = 'all'
  selectedPriority.value = 'all'
  sortOrder.value = 'newest'
  onlyIncomplete.value = false
}

function handleStatusChange(payload) {
  setTaskStatus(payload)
}

function handlePriorityChange(payload) {
  setTaskPriority(payload)
}

function handleTaskSelect(payload) {
  selectedTask.value = payload
}

async function scrollToForm() {
  await nextTick()

  formAnchor.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

async function startCreate() {
  editingId.value = null
  formVisible.value = true
  feedback.value = ''

  await scrollToForm()
}

async function startEdit(id) {
  const task = taskState.tasks.find(
    (item) => item.id === Number(id)
  )

  if (!task) return

  editingId.value = task.id
  formVisible.value = true
  feedback.value = ''

  await scrollToForm()
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

function saveTask(data) {
  const isEditing = editingId.value !== null

  const saved = isEditing
    ? updateTask({ ...data, id: editingId.value })
    : addTask(data)

  if (!saved) {
    feedback.value =
      'Не вдалося зберегти завдання. Перевірте введені дані.'
    return
  }

  feedback.value = isEditing
    ? `Завдання «${saved.title}» оновлено.`
    : `Завдання «${saved.title}» створено.`

  if (selectedTask.value?.id === saved.id) {
    selectedTask.value = {
      id: saved.id,
      title: saved.title
    }
  }

  cancelForm()
  resetFilters()
}

function handleDelete(id) {
  const task = taskState.tasks.find(
    (item) => item.id === Number(id)
  )

  if (!task) return

  const confirmed = window.confirm(
    `Видалити завдання «${task.title}»?`
  )

  if (!confirmed) return

  const deleted = deleteTask(task.id)

  if (!deleted) {
    feedback.value = 'Не вдалося видалити завдання.'
    return
  }

  if (editingId.value === task.id) {
    cancelForm()
  }

  if (selectedTask.value?.id === task.id) {
    selectedTask.value = null
  }

  feedback.value =
    `Завдання «${task.title}» видалено.`
}
</script>

<template>
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />

    <div class="tf3-container">
      <section class="tf3-hero">
        <div class="tf3-eyebrow">
          TASKFLOW / TASK MANAGER
        </div>

        <h1>Керування завданнями</h1>

        <p>
          Створюйте, редагуйте, знаходьте,
          сортуйте та видаляйте завдання.
        </p>

        <button
          type="button"
          class="tf4-new-task"
          @click="startCreate"
        >
          + Додати завдання
        </button>
      </section>

      <p
        v-if="feedback"
        class="tf4-feedback"
        role="status"
      >
        {{ feedback }}
      </p>

      <section
        v-if="formVisible"
        ref="formAnchor"
        class="tf4-form-section"
      >
        <TaskForm
          :key="editingId ?? 'new'"
          :task="editingTask"
          @save="saveTask"
          @cancel="cancelForm"
        />
      </section>

      <TaskListControls
        v-model:search="searchText"
        v-model:status="selectedStatus"
        v-model:priority="selectedPriority"
        v-model:sort="sortOrder"
        v-model:onlyIncomplete="onlyIncomplete"
        @reset="resetFilters"
      />

      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">
              TASK LIST
            </div>

            <h2>Список завдань</h2>
          </div>

          <div class="tf3-counter tf5-results">
            <span>
              Показано: {{ visibleTasks.length }}
              із {{ taskState.tasks.length }}
            </span>

            <strong>
              Виконано: {{ visibleCompletedPercent }}%
            </strong>
          </div>
        </div>

        <div
          v-if="selectedTask"
          class="tf3-selected-task"
          role="status"
        >
          Вибрано завдання №{{ selectedTask.id }}:
          <strong>{{ selectedTask.title }}</strong>
        </div>

        <div
          v-if="visibleTasks.length"
          class="tf3-task-grid"
        >
          <TaskCard
            v-for="task in visibleTasks"
            :key="task.id"
            :task="task"
            :editable="true"
            @status-change="handleStatusChange"
            @priority-change="handlePriorityChange"
            @task-select="handleTaskSelect"
            @edit="startEdit"
            @delete="handleDelete"
          />
        </div>

        <div
          v-else-if="taskState.tasks.length === 0"
          class="tf5-empty"
        >
          <h3>Список завдань порожній</h3>

          <p>
            Усі завдання видалено.
            Зараз у TaskFlow немає жодного запису.
            Створіть нове завдання, щоб почати роботу.
          </p>

          <button
            type="button"
            class="tf5-btn"
            @click="startCreate"
          >
            + Створити завдання
          </button>
        </div>

        <div
          v-else
          class="tf5-empty"
        >
          <h3>Завдань не знайдено</h3>

          <p>
            За поточними умовами пошуку
            та фільтрації завдань немає.
          </p>

          <button
            type="button"
            class="tf5-btn"
            @click="resetFilters"
          >
            Показати всі завдання
          </button>
        </div>
      </section>
    </div>

    <AppTabbar active="tasks" />
  </f7-page>
</template>

<style scoped>
.tf3-selected-task {
  margin-bottom: 16px;
  padding: 15px;
  background: #153d50;
  border: 1px solid #35b4e5;
  border-radius: 10px;
  color: #edf4ff;
}

.tf5-results {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #395a7c;
  border-radius: 10px;
  background: #192d46;
  color: #e7f3ff;
  font-size: 12px;
}

.tf5-results strong {
  color: #59d2ff;
  font-weight: 700;
}

.tf5-empty {
  padding: 26px;
  border: 1px dashed #527090;
  border-radius: 14px;
  color: #dae7f6;
  text-align: center;
}

.tf5-empty h3 {
  margin: 0 0 12px;
  color: #173a59;
  font-size: 20px;
}

.tf5-empty p {
  margin: 0 0 14px;
  color: #42617b;
  line-height: 1.6;
}

.tf5-empty .tf5-btn {
  margin-top: 12px;
}
</style>
