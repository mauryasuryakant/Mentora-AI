<template>
  <div class="page">

    <!-- No setup yet -->
    <div v-if="!progress.student" class="empty-state card text-center">
      <div style="font-size:3rem;margin-bottom:1rem">🎓</div>
      <h2 class="mb-1">Welcome to Mentora AI</h2>
      <p class="mb-3">You haven't set up your study profile yet. Let's get started!</p>
      <RouterLink to="/setup" class="btn btn-primary">Get Started →</RouterLink>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <!-- Header -->
      <div class="dash-header mb-3">
        <div>
          <h1>Welcome back 👋</h1>
          <p v-if="isExamMode">{{ examSubjectList }} · {{ exams.length }} exam{{ exams.length > 1 ? 's' : '' }}</p>
          <p v-else>{{ subjectList }} · Continuous Learning</p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-outline btn-sm" @click="openAiChat()">🤖 Ask AI</button>
          <RouterLink to="/quiz" class="btn btn-accent">📝 Start Quiz</RouterLink>
        </div>
      </div>

      <!-- ── EXAM MODE ──────────────────────────────────────────── -->
      <template v-if="isExamMode">
        <!-- Upcoming Exams countdown -->
        <div class="section-title mb-2">📅 Upcoming Exams</div>
        <div class="exam-list mb-3">
          <div
            class="exam-countdown-card card"
            v-for="e in upcomingExams"
            :key="e.subject"
            :class="{ urgent: daysUntil(e.date) <= 3 }"
          >
            <div class="exam-info">
              <span class="exam-subject">{{ e.subject }}</span>
              <span class="exam-name text-muted">{{ e.name }}</span>
            </div>
            <div class="exam-right">
              <div class="countdown-num" :class="countdownClass(daysUntil(e.date))">
                {{ daysUntil(e.date) }}
              </div>
              <div class="countdown-label">{{ daysUntil(e.date) === 1 ? 'day' : 'days' }}</div>
              <div class="exam-date text-muted">{{ formatDate(e.date) }}</div>
            </div>
          </div>
          <div class="card text-center" v-if="!upcomingExams.length" style="padding:1rem;opacity:.6">
            All exams completed 🎉
          </div>
        </div>

        <!-- Stats row -->
        <div class="stats-row mb-3">
          <div class="stat-card card">
            <div class="stat-num">{{ quizzesDone }}</div>
            <div class="stat-label">Quizzes Done</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num" :class="avgScore >= 70 ? 'text-success' : avgScore >= 50 ? 'text-warning' : 'text-danger'">
              {{ avgScore }}%
            </div>
            <div class="stat-label">Avg Score</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num">{{ planDays }}</div>
            <div class="stat-label">Plan Days</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num">{{ exams.length }}</div>
            <div class="stat-label">Total Exams</div>
          </div>
        </div>
      </template>

      <!-- ── REGULAR MODE ───────────────────────────────────────── -->
      <template v-else>
        <!-- Streak + weekly goal -->
        <div class="stats-row mb-3">
          <div class="stat-card card">
            <div class="stat-num">{{ streak }} 🔥</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num">{{ quizzesDone }}</div>
            <div class="stat-label">Quizzes Done</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num" :class="avgScore >= 70 ? 'text-success' : avgScore >= 50 ? 'text-warning' : 'text-danger'">
              {{ avgScore }}%
            </div>
            <div class="stat-label">Avg Score</div>
          </div>
          <div class="stat-card card">
            <div class="stat-num">{{ weeklyGoalPct }}%</div>
            <div class="stat-label">Weekly Goal</div>
          </div>
        </div>

        <!-- Weekly goal progress -->
        <div class="card mb-3">
          <div class="flex mb-2" style="justify-content:space-between;align-items:center">
            <h3>Weekly Goal</h3>
            <span class="text-muted" style="font-size:.8rem">{{ quizzesThisWeek }} / 5 sessions this week</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: weeklyGoalPct + '%' }"></div>
          </div>
        </div>
      </template>

      <!-- Overall Plan Progress (shared) -->
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

      <!-- Today's Tasks -->
      <div class="card mb-3" v-if="todaysPlan">
        <h3 class="mb-2">📌 Today's Tasks — Day {{ todaysPlan.day }}</h3>
        <div class="topic-list">
          <span class="topic-tag" v-for="t in todaysPlan.topics" :key="t">{{ t }}</span>
        </div>
        <RouterLink
          :to="{ path: '/quiz', query: { topics: todaysPlan.topics.join(','), day: todaysPlan.day } }"
          class="btn btn-accent btn-sm mt-2"
        >
          📝 Quiz on Today's Topics →
        </RouterLink>
      </div>

      <!-- Weak Topics -->
      <div class="card mb-3" v-if="progress.weakTopics?.length">
        <h3 class="mb-2">⚠️ Topics Needing Work</h3>
        <div class="tag-list">
          <span class="badge badge-warning" v-for="t in progress.weakTopics" :key="t">{{ t }}</span>
        </div>
      </div>

      <!-- Recent Quizzes -->
      <div class="card mb-3" v-if="recentQuizzes.length">
        <h3 class="mb-2">Recent Quizzes</h3>
        <div class="quiz-row" v-for="q in recentQuizzes" :key="q.date + q.day">
          <span class="text-muted" style="font-size:.85rem">Day {{ q.day }} · {{ q.date }}</span>
          <span :class="scoreClass(q.percentage)">{{ q.score }}/{{ q.total }} ({{ q.percentage }}%)</span>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <RouterLink to="/study-plan" class="btn btn-outline">📅 View Full Plan</RouterLink>
        <RouterLink to="/progress"   class="btn btn-outline">📊 Progress Report</RouterLink>
        <RouterLink to="/setup"      class="reset-link">↺ Reset & Start Over</RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { getProgress } from '../storage.js'

const progress = ref(getProgress())  // instant load from localStorage — no API call needed

const openAiChat = inject('openAiChat')

// ── Mode helpers ──────────────────────────────────────────────────────────────
const isExamMode = computed(() => progress.value.mode === 'exam')
const exams      = computed(() => progress.value.exams || [])

const examSubjectList = computed(() => exams.value.map(e => e.subject).join(' · '))
const subjectList     = computed(() => (progress.value.student?.subjects || []).join(', '))

// ── Exam mode: upcoming exams with countdowns ─────────────────────────────────
const today          = new Date().toISOString().split('T')[0]
const upcomingExams  = computed(() =>
  exams.value.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
)

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
function countdownClass(days) {
  if (days <= 3)  return 'text-danger'
  if (days <= 7)  return 'text-warning'
  return 'text-success'
}

// ── Regular mode: streak + weekly goal ───────────────────────────────────────
const streak = computed(() => {
  // Count consecutive quiz days ending today
  const quizDates = [...new Set((progress.value.quizzes || []).map(q => q.date))].sort().reverse()
  let count = 0
  let check = new Date()
  for (const d of quizDates) {
    const dayStr = check.toISOString().split('T')[0]
    if (d === dayStr) { count++; check.setDate(check.getDate() - 1) }
    else break
  }
  return count
})

const quizzesThisWeek = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return (progress.value.quizzes || []).filter(q => new Date(q.date) >= weekAgo).length
})
const weeklyGoalPct = computed(() => Math.min(100, Math.round((quizzesThisWeek.value / 5) * 100)))

// ── Shared stats ──────────────────────────────────────────────────────────────
const planDays    = computed(() => progress.value.plan?.length || 0)
const quizzesDone = computed(() => progress.value.quizzes?.length || 0)
const avgScore    = computed(() => {
  const q = progress.value.quizzes
  if (!q?.length) return 0
  return Math.round(q.reduce((s, x) => s + x.percentage, 0) / q.length)
})
const overallPct = computed(() =>
  planDays.value ? Math.min(100, Math.round((quizzesDone.value / planDays.value) * 100)) : 0
)
const recentQuizzes = computed(() =>
  [...(progress.value.quizzes || [])].reverse().slice(0, 5)
)

// ── Today's plan entry ────────────────────────────────────────────────────────
const todaysPlan = computed(() => {
  const plan = progress.value.plan || []
  return plan.find(d => d.date === today) || plan.find(d => {
    // fallback: first incomplete day
    const done = new Set((progress.value.quizzes || []).map(q => q.day))
    return !done.has(d.day)
  }) || null
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function scoreClass(pct) {
  if (pct >= 80) return 'text-success'
  if (pct >= 50) return 'text-warning'
  return 'text-danger'
}
</script>

<style scoped>
.dash-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.dash-actions { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }

.section-title { font-weight: 600; color: var(--text-muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; }

/* Exam countdown cards */
.exam-list { display: flex; flex-direction: column; gap: 0.6rem; }
.exam-countdown-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  transition: border-color 0.2s;
}
.exam-countdown-card.urgent { border-color: var(--danger); background: rgba(255,83,112,0.04); }
.exam-info   { display: flex; flex-direction: column; gap: 0.15rem; }
.exam-subject { font-weight: 600; font-size: 1rem; }
.exam-name   { font-size: .8rem; }
.exam-right  { text-align: right; }
.countdown-num   { font-size: 1.75rem; font-weight: 800; line-height: 1; }
.countdown-label { font-size: .7rem; color: var(--text-muted); text-transform: uppercase; }
.exam-date   { font-size: .75rem; margin-top: .2rem; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr 1fr; } }
.stat-card  { text-align: center; padding: 1.25rem; }
.stat-num   { font-size: 1.8rem; font-weight: 700; color: var(--primary); }
.stat-label { font-size: .8rem; color: var(--text-muted); margin-top: .25rem; }

/* Topic tags */
.topic-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: .5rem; }
.topic-tag  {
  background: rgba(108,99,255,0.12);
  color: var(--primary);
  border-radius: 6px;
  padding: 0.2rem 0.65rem;
  font-size: .8rem;
}

.quiz-row { display: flex; justify-content: space-between; padding: .5rem 0; border-bottom: 1px solid var(--border); }
.quiz-row:last-child { border-bottom: none; }
.tag-list { display: flex; flex-wrap: wrap; gap: .5rem; }
.quick-links { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
.empty-state { padding: 3rem 1.5rem; }

/* Reset link — subtle and small */
.reset-link {
  font-size: .78rem;
  color: var(--text-muted);
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  padding: 0.4rem 0;
}
.reset-link:hover { opacity: 1; color: var(--danger); }
</style>
