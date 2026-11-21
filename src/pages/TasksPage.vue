
<script setup>
import { computed, nextTick, ref } from 'vue'
import AppTabbar from '../components/AppTabbar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskCounter from '../components/TaskCounter.vue'
import TaskForm from '../components/TaskForm.vue'
import {
  taskState,
  addTask,
  updateTask,
  setTaskStatus,
  setTaskPriority
} from '../store/tasks'

import '../css/task-components.css'
import '../css/task-form.css'

const selectedStatus = ref('all')
const selectedPriority = ref('all')
const selectedSort = ref('high')
const selectedTask = ref(null)
const searchQuery = ref('')

const formVisible = ref(false)
const editingId = ref(null)
const formAnchor = ref(null)
const feedback = ref('')

const statusOptions = [
  { value: 'all', label: 'Усі' },
  { value: 'todo', label: 'Заплановано' },
  { value: 'progress', label: 'У роботі' },
  { value: 'done', label: 'Виконано' }
]

const priorityOptions = [
  { value: 'all', label: 'Усі' },
  { value: 'low', label: 'Низький' },
  { value: 'medium', label: 'Середній' },
  { value: 'high', label: 'Високий' }
]

const sortOptions = [
  { value: 'high', label: 'Від високого до низького' },
  { value: 'low', label: 'Від низького до високого' }
]

const filteredTasks = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('uk-UA')

  return taskState.tasks.filter((task) => (
    (selectedStatus.value === 'all' ||
      task.status === selectedStatus.value) &&
    (selectedPriority.value === 'all' ||
      task.priority === selectedPriority.value) &&
    task.title.toLocaleLowerCase('uk-UA').includes(query)
  ))
})

const sortedTasks = computed(() => {
  const priorityOrder = {
    low: 1,
    medium: 2,
    high: 3
  }

  return [...filteredTasks.value].sort((a, b) => {
    const difference =
      priorityOrder[a.priority] - priorityOrder[b.priority]

    if (difference === 0) return a.id - b.id

    return selectedSort.value === 'high'
      ? -difference
      : difference
  })
})

const editingTask = computed(() =>
  taskState.tasks.find(
    (task) => task.id === editingId.value
  ) ?? null
)

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

async function createTask() {
  editingId.value = null
  formVisible.value = true
  feedback.value = ''

  await scrollToForm()
}

async function editTask(id) {
  editingId.value = id
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
    ? updateTask({ id: editingId.value, ...data })
    : addTask(data)

  if (!saved) {
    feedback.value =
      'Не вдалося зберегти завдання. Перевірте дані форми.'
    return
  }

  feedback.value = isEditing
    ? `Завдання «${saved.title}» оновлено.`
    : `Завдання «${saved.title}» створено.`

  cancelForm()

  selectedStatus.value = 'all'
  selectedPriority.value = 'all'
  searchQuery.value = ''
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

        <h1>Мої завдання</h1>

        <p>
          Керуйте завданнями, статусами та пріоритетами.
        </p>

        <button
          type="button"
          class="tf4-new-task"
          @click="createTask"
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

      <section class="tf3-filters">
        <div class="tf3-filter-group">
          <div class="tf3-filter-title">
            Пошук завдань за назвою
          </div>

          <input
            id="tf4-search"
            v-model="searchQuery"
            class="tf4-search-input"
            type="search"
            aria-label="Пошук завдань за назвою"
            placeholder="Введіть назву завдання..."
          />

          <small class="tf4-search-hint">
            Результати оновлюються автоматично.
          </small>
        </div>

        <div class="tf3-filter-group">
          <div class="tf3-filter-title">
            Фільтр за статусом
          </div>

          <div class="tf3-filter-buttons">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="tf3-filter-button"
              :class="{
                'is-active': selectedStatus === option.value
              }"
              :aria-pressed="selectedStatus === option.value"
              @click="selectedStatus = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="tf3-filter-group">
          <div class="tf3-filter-title">
            Фільтр за пріоритетом
          </div>

          <div class="tf3-filter-buttons">
            <button
              v-for="option in priorityOptions"
              :key="option.value"
              type="button"
              class="tf3-filter-button"
              :class="{
                'is-active': selectedPriority === option.value
              }"
              :aria-pressed="selectedPriority === option.value"
              @click="selectedPriority = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="tf3-filter-group">
          <div class="tf3-filter-title">
            Сортування за пріоритетом
          </div>

          <div class="tf3-filter-buttons">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              type="button"
              class="tf3-filter-button"
              :class="{
                'is-active': selectedSort === option.value
              }"
              :aria-pressed="selectedSort === option.value"
              @click="selectedSort = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </section>

      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">
              TASK LIST
            </div>

            <h2>Список завдань</h2>
          </div>

          <TaskCounter :count="sortedTasks.length" />
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
          v-if="sortedTasks.length"
          class="tf3-task-grid"
        >
          <TaskCard
            v-for="task in sortedTasks"
            :key="task.id"
            :task="task"
            :editable="true"
            @status-change="handleStatusChange"
            @priority-change="handlePriorityChange"
            @task-select="handleTaskSelect"
            @edit="editTask"
          />
        </div>

        <div v-else class="tf3-empty">
          За обраними фільтрами завдань не знайдено.
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

.tf4-search-input {
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  padding: 12px 15px;
  border: 1px solid #42617d;
  border-radius: 9px;
  background: #0c192b;
  color: #f4f9ff;
  font-family: inherit;
  font-size: 14px;
}

.tf4-search-input::placeholder {
  color: #8fa7bf;
}

.tf4-search-input:focus {
  outline: 2px solid #49bce7;
  outline-offset: 1px;
}

.tf4-search-hint {
  color: #9fb3ca;
  font-size: 11px;
}
</style>
