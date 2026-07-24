<template>
  <div class="page">
    <h1 class="mb-1">📅 Study Plan</h1>

    <div class="loading-box" v-if="loading">
      <div class="spinner"></div>
      <span>Loading your plan…</span>
    </div>

    <div v-else-if="!plan.length" class="card text-center" style="padding:3rem">
      <p class="mb-2">No study plan yet.</p>
      <RouterLink to="/setup" class="btn btn-primary">Generate a Plan</RouterLink>
    </div>

    <div v-else>
      <p class="mb-3 text-muted">
        {{ plan.length }}-day plan for
        <strong style="color:var(--text)">{{ student.subject }}</strong>
        · Exam on {{ formatDate(student.examDate) }}
      </p>

      <div
        class="day-card card"
        v-for="day in plan"
        :key="day.day"
        :class="{ 'day-done': isDone(day.day), 'day-today': isToday(day.day) }"
      >
        <div class="day-header">
          <div class="day-meta">
            <span class="day-num">Day {{ day.day }}</span>
            <span class="day-date text-muted">{{ day.date }}</span>
          </div>
          <span v-if="isDone(day.day)"  class="badge badge-success">✓ Done</span>
          <span v-else-if="isToday(day.day)" class="badge badge-primary">Today</span>
          <span v-else class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-muted)">Upcoming</span>
        </div>

        <p class="day-goal">🎯 {{ day.goal }}</p>

        <div class="topic-list">
          <span class="topic-tag" v-for="t in day.topics" :key="t">{{ t }}</span>
        </div>

        <div class="day-action" v-if="isToday(day.day)">
          <RouterLink
            :to="{ path: '/quiz', query: { topics: day.topics.join(','), day: day.day } }"
            class="btn btn-accent btn-sm"
          >
            📝 Take Today's Quiz →
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/index.js'

const loading = ref(true)
const plan    = ref([])
const student = ref({})
const doneSet = ref(new Set())

onMounted(async () => {
  try {
    const res = await api.progress()
    const p   = res.progress || {}
    plan.value    = p.plan    || []
    student.value = p.student || {}
    // Build set of completed day numbers from quizzes
    doneSet.value = new Set((p.quizzes || []).map(q => q.day))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function isDone(dayNum)  { return doneSet.value.has(dayNum) }
function isToday(dayNum) {
  const todayStr = new Date().toISOString().split('T')[0]
  const dayEntry = plan.value.find(d => d.day === dayNum)
  return dayEntry?.date === todayStr
}
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.day-card      { margin-bottom: 0.75rem; transition: border-color 0.2s; }
.day-card.day-today { border-color: var(--primary); }
.day-card.day-done  { opacity: 0.6; }

.day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.day-meta   { display: flex; align-items: center; gap: 0.75rem; }
.day-num    { font-weight: 700; font-size: 1rem; }
.day-date   { font-size: 0.8rem; }
.day-goal   { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem; }

.topic-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
.topic-tag  {
  background: rgba(108,99,255,0.12);
  color: var(--primary);
  border-radius: 6px;
  padding: 0.2rem 0.65rem;
  font-size: 0.8rem;
}
.day-action { margin-top: 0.5rem; }
</style>
