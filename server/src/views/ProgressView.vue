<template>
  <div class="page">
    <h1 class="mb-1">📊 Progress</h1>

    <div v-if="!progress.student" class="card text-center" style="padding:3rem">
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
        <div class="table-responsive">
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
      </div>

      <div v-else class="card text-center" style="padding:2rem">
        <p>No quizzes completed yet. Head to the Quiz page to get started!</p>
        <RouterLink to="/quiz" class="btn btn-primary mt-2">Take a Quiz</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getProgress } from '../storage.js'

const progress = ref(getProgress())  // instant load from localStorage


const quizzes  = computed(() => progress.value.quizzes || [])
const avgScore = computed(() => {
  if (!quizzes.value.length) return 0
  return Math.round(quizzes.value.reduce((s, q) => s + q.percentage, 0) / quizzes.value.length)
})
const bestScore = computed(() =>
  quizzes.value.length ? Math.max(...quizzes.value.map(q => q.percentage)) : 0
)
const daysLeft = computed(() => {
  const exams = progress.value.exams || []
  const todayStr = new Date().toISOString().split('T')[0]
  // Find the nearest upcoming exam date
  const upcoming = exams
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!upcoming.length) return '—'
  const diff = new Date(upcoming[0].date) - new Date()
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
.summary-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; align-items: stretch; }
@media (max-width: 750px) { .summary-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 450px) { .summary-row { grid-template-columns: minmax(0, 1fr); } }
.summary-card { 
  text-align: center; 
  padding: 1.5rem 1rem;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  overflow: hidden;
  margin: 0 !important;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.summary-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--grad-primary);
  opacity: 0.7;
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 15px rgba(108,99,255,0.15);
}
.s-num { 
  font-size: 2.2rem; 
  font-weight: 800; 
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  line-height: 1.1;
}
.s-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-top: 0.35rem; text-transform: uppercase; letter-spacing: 0.04em; }

/* CSS Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 150px;
  padding: 1rem 0.5rem 0.5rem;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.bar-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 36px; height: 100%; justify-content: flex-end; }
.bar-fill { 
  width: 100%; 
  border-radius: 6px 6px 0 0; 
  min-height: 4px; 
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s; 
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}
.bar-item:hover .bar-fill { filter: brightness(1.2); box-shadow: 0 0 16px rgba(108,99,255,0.5); }
.bar-success { background: linear-gradient(180deg, #00e5bc 0%, var(--success) 100%); }
.bar-warning { background: linear-gradient(180deg, #ffd666 0%, var(--warning) 100%); }
.bar-danger  { background: linear-gradient(180deg, #ff8599 0%, var(--danger) 100%); }
.bar-label   { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }

/* Table */
.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.history-table { width: 100%; min-width: 500px; border-collapse: separate; border-spacing: 0; font-size: 0.92rem; }
.history-table th { text-align: left; color: var(--text-muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 0.75rem 0.8rem; border-bottom: 2px solid var(--border); }
.history-table td { padding: 0.85rem 0.8rem; border-bottom: 1px solid var(--border); transition: background 0.15s; }
.history-table tr:hover td { background: rgba(255,255,255,0.03); }
.history-table tr:last-child td { border-bottom: none; }

.tag-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
</style>
