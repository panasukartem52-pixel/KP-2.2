
<template>
  <f7-toolbar bottom class="app-tabbar">
    <div class="taskflow-nav">
      <f7-link href="/" :class="{ 'app-link-active': active === 'home' }">
        <f7-icon f7="house_fill" />
        <span class="app-tab-label">Головна</span>
      </f7-link>

      <f7-link href="/tasks/" :class="{ 'app-link-active': active === 'tasks' }">
        <f7-icon f7="square_list_fill" />
        <span class="app-tab-label">Завдання</span>
      </f7-link>

      <f7-link href="/about/" :class="{ 'app-link-active': active === 'about' }">
        <f7-icon f7="info_circle_fill" />
        <span class="app-tab-label">Про застосунок</span>
      </f7-link>
    </div>
  </f7-toolbar>
</template>

<script setup>
defineProps({
  active: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.taskflow-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  height: 100%;
}

.taskflow-nav :deep(.link) {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 6px;
  min-width: 0;
  padding: 4px;
  box-sizing: border-box;
}

.taskflow-nav :deep(.icon) {
  position: static;
  display: block;
  flex-shrink: 0;
  font-size: 22px;
  line-height: 24px;
  margin: 0;
}

.taskflow-nav .app-tab-label {
  display: block;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}

.taskflow-nav :deep(.app-link-active) {
  color: #2563eb;
}
</style>
