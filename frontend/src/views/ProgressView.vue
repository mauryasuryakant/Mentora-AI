<template>
  <div class="page">
    <h1 class="mb-1">📊 Progress</h1>

    <div class="loading-box" v-if="loading">
      <div class="spinner"></div>
      <span>Loading progress…</span>
    </div>

    <div v-else-if="!progress.student" class="card text-center" style="padding:3rem">
      <p class="mb-2">No data yet. Complete your first quiz to see progress.</p>
      <RouterLink to="/setup" class="btn btn-primary">Get Started</RouterLink>
    </div>

    <div v-else>
      <!-- Summary Row -->
      <div class="summary-row mb-3">
        <div class="card summary-card">
          <div class="s-num">{{ quizzes.length }}</div>
          <div class="s-label">Quizzes Completed</div>
        </div>
        <div class="card summary-card">
          <div class="s-num" :class="scoreClass(avgScore)">{{ avgScore }}%</div>
          <div class="s-label">Average Score</div>
        </div>
        <div class="card summary-card">
          <div class="s-num" :class="scoreClass(bestScore)">{{ bestScore }}%</div>
          <div class="s-label">Best Score</div>
        </div>
        <div class="card summary-card">
          <div class="s-num">{{ daysLeft }}</div>
          <div class="s-label">Days to Exam</div>
        </div>
      </div>

      <!-- Overall Progress Bar -->
      <div class="card mb-3" v-if="progress.plan?.length">
        <h3 class="mb-2">Study Plan Progress</h3>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: overallPct + '%' }"></div>
        </div>
        <div class="flex mt-1" style="justify-content:space-between">
          <span class="text-muted" style="font-size:.8rem">
            {{ quizzes.length }} of {{ progress.plan.length }} days completed
          </span>
          <span class="text-muted" style="font-size:.8rem">{{ overallPct }}%</span>
        </div>
      </div>

      <!-- Weak Topics -->
      <div class="card mb-3" v-if="progress.weakTopics?.length">
        <h3 class="mb-2">⚠️ Topics to Review</h3>
        <div class="tag-list">
          <span class="badge badge-warning" v-for="t in progress.weakTopics" :key="t">{{ t }}</span>
        </div>
      </div>

      <!-- Score History -->
      <div class="card mb-3" v-if="quizzes.length">
        <h3 class="mb-2">Quiz History</h3>

        <!-- Simple bar chart using CSS -->
        <div class="bar-chart mb-3">
          <div
            class="bar-item"
            v-for="q in quizzes"
            :key="q.day"
            :title="`Day ${q.day}: ${q.percentage}%`"
          >
            <div class="bar-fill" :style="{ height: q.percentage + '%' }" :class="barClass(q.percentage)"></div>
            <span class="bar-label">D{{ q.day }}</span>
          </div>
        </div>

        <!-- Table -->
        <table class="history-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Weak Topics</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in quizzes" :key="q.day">
              <td>Day {{ q.day }}</td>
              <td class="text-muted">{{ q.date }}</td>
              <td>{{ q.score }}/{{ q.total }}</td>
              <td :class="scoreClass(q.percentage)">{{ q.percentage }}%</td>
              <td>
                <span
                  class="badge badge-warning"
                  style="font-size:.7rem;margin-right:.25rem"
                  v-for="t in (q.weakTopics || [])"
                  :key="t"
                >{{ t }}</span>
                <span v-if="!q.weakTopics?.length" class="text-muted" style="font-size:.8rem">None</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="card text-center" style="padding:2rem">
        <p>No quizzes completed yet. Head to the Quiz page to get started!</p>
        <RouterLink to="/quiz" class="btn btn-primary mt-2">Take a Quiz</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/index.js'
import { getProgress, saveProgress } from '../storage.js'

const loading  = ref(false)
const progress = ref(getProgress())

onMounted(async () => {
  try {
    const res      = await api.progress()
    progress.value = res.progress || {}
    saveProgress(res.progress || {})
  } catch (e) {
    console.error(e)
  }
})

const quizzes  = computed(() => progress.value.quizzes || [])
const avgScore = computed(() => {
  if (!quizzes.value.length) return 0
  return Math.round(quizzes.value.reduce((s, q) => s + q.percentage, 0) / quizzes.value.length)
})
const bestScore = computed(() =>
  quizzes.value.length ? Math.max(...quizzes.value.map(q => q.percentage)) : 0
)
const daysLeft = computed(() => {
  if (!progress.value.student?.examDate) return '—'
  const diff = new Date(progress.value.student.examDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})
const overallPct = computed(() => {
  const total = progress.value.plan?.length || 0
  if (!total) return 0
  return Math.min(100, Math.round((quizzes.value.length / total) * 100))
})

function scoreClass(pct) {
  if (pct >= 80) return 'text-success'
  if (pct >= 50) return 'text-warning'
  return 'text-danger'
}
function barClass(pct) {
  if (pct >= 80) return 'bar-success'
  if (pct >= 50) return 'bar-warning'
  return 'bar-danger'
}
</script>

<style scoped>
.summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 600px) { .summary-row { grid-template-columns: 1fr 1fr; } }
.summary-card { text-align: center; padding: 1.25rem; }
.s-num  { font-size: 1.8rem; font-weight: 700; }
.s-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }

/* CSS Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 100px;
  padding: 0 0.25rem;
  border-bottom: 1px solid var(--border);
}
.bar-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 24px; height: 100%; justify-content: flex-end; }
.bar-fill { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s ease; }
.bar-success { background: var(--success); }
.bar-warning { background: var(--warning); }
.bar-danger  { background: var(--danger); }
.bar-label   { font-size: 0.65rem; color: var(--text-muted); }

/* Table */
.history-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.history-table th { text-align: left; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: .04em; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--border); }
.history-table td { padding: 0.6rem; border-bottom: 1px solid var(--border); }
.history-table tr:last-child td { border-bottom: none; }

.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
</style>
