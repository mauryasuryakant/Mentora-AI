<template>
  <div class="page">
    <!-- Loading -->
    <div class="loading-box" v-if="loading">
      <div class="spinner"></div>
      <span>Loading your dashboard…</span>
    </div>

    <!-- No student yet -->
    <div v-else-if="!progress.student" class="empty-state card text-center">
      <div style="font-size:3rem;margin-bottom:1rem">🎓</div>
      <h2 class="mb-1">Welcome to Mentora AI</h2>
      <p class="mb-3">You haven't set up your study profile yet. Let's get started!</p>
      <RouterLink to="/setup" class="btn btn-primary">Set Up My Profile</RouterLink>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <div class="dash-header mb-3">
        <div>
          <h1>Hi, {{ progress.student.name }} 👋</h1>
          <p>{{ progress.student.subject }} · Exam: {{ formatDate(progress.student.examDate) }}</p>
        </div>
        <RouterLink to="/quiz" class="btn btn-accent">Start Today's Quiz</RouterLink>
      </div>

      <!-- Stats Row -->
      <div class="stats-row mb-3">
        <div class="stat-card card">
          <div class="stat-num">{{ daysLeft }}</div>
          <div class="stat-label">Days to Exam</div>
        </div>
        <div class="stat-card card">
          <div class="stat-num">{{ quizzesDone }}</div>
          <div class="stat-label">Quizzes Done</div>
        </div>
        <div class="stat-card card">
          <div class="stat-num">{{ avgScore }}%</div>
          <div class="stat-label">Avg Score</div>
        </div>
        <div class="stat-card card">
          <div class="stat-num">{{ planDays }}</div>
          <div class="stat-label">Plan Days</div>
        </div>
      </div>

      <!-- Overall Progress -->
      <div class="card mb-3" v-if="planDays > 0">
        <h3 class="mb-2">Overall Progress</h3>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: overallPct + '%' }"></div>
        </div>
        <div class="flex mt-1" style="justify-content:space-between">
          <span class="text-muted" style="font-size:.8rem">{{ quizzesDone }} of {{ planDays }} days studied</span>
          <span class="text-muted" style="font-size:.8rem">{{ overallPct }}%</span>
        </div>
      </div>

      <!-- Weak Topics -->
      <div class="card mb-3" v-if="progress.weakTopics && progress.weakTopics.length">
        <h3 class="mb-2">⚠️ Topics Needing Work</h3>
        <div class="tag-list">
          <span class="badge badge-warning" v-for="t in progress.weakTopics" :key="t">{{ t }}</span>
        </div>
      </div>

      <!-- Recent Quizzes -->
      <div class="card" v-if="recentQuizzes.length">
        <h3 class="mb-2">Recent Quizzes</h3>
        <div class="quiz-row" v-for="q in recentQuizzes" :key="q.date + q.day">
          <span class="text-muted" style="font-size:.85rem">Day {{ q.day }} · {{ q.date }}</span>
          <span :class="scoreClass(q.percentage)">{{ q.score }}/{{ q.total }} ({{ q.percentage }}%)</span>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links mt-3">
        <RouterLink to="/study-plan" class="btn btn-outline">📅 View Study Plan</RouterLink>
        <RouterLink to="/progress"   class="btn btn-outline">📊 Full Progress</RouterLink>
        <RouterLink to="/setup"      class="btn btn-outline" style="font-size:.8rem;opacity:.6">↺ Reset Setup</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/index.js'

const loading  = ref(true)
const progress = ref({})

onMounted(async () => {
  try {
    const res  = await api.progress()
    progress.value = res.progress || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const daysLeft = computed(() => {
  if (!progress.value.student?.examDate) return '—'
  const diff = new Date(progress.value.student.examDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})
const planDays    = computed(() => progress.value.plan?.length || 0)
const quizzesDone = computed(() => progress.value.quizzes?.length || 0)
const avgScore    = computed(() => {
  const q = progress.value.quizzes
  if (!q || !q.length) return 0
  return Math.round(q.reduce((s, x) => s + x.percentage, 0) / q.length)
})
const overallPct  = computed(() =>
  planDays.value ? Math.min(100, Math.round((quizzesDone.value / planDays.value) * 100)) : 0
)
const recentQuizzes = computed(() =>
  [...(progress.value.quizzes || [])].reverse().slice(0, 5)
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function scoreClass(pct) {
  if (pct >= 80) return 'text-success'
  if (pct >= 50) return 'text-warning'
  return 'text-danger'
}
</script>

<style scoped>
.dash-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.stats-row   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr 1fr; } }
.stat-card   { text-align: center; padding: 1.25rem; }
.stat-num    { font-size: 1.8rem; font-weight: 700; color: var(--primary); }
.stat-label  { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }
.quiz-row    { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
.quiz-row:last-child { border-bottom: none; }
.tag-list    { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.quick-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.empty-state { padding: 3rem 1.5rem; }
</style>
