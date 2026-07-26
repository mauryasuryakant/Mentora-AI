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
          <h1 class="dash-title">Welcome back <span class="wave">👋</span></h1>
          <p class="dash-sub" v-if="isExamMode"><span class="badge badge-primary">📝 Exam Mode</span> {{ examSubjectList }} · {{ exams.length }} exam{{ exams.length > 1 ? 's' : '' }}</p>
          <p class="dash-sub" v-else><span class="badge badge-primary">📚 Regular Mode</span> {{ subjectList }} · Continuous Learning</p>
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
.dash-header { 
  display: flex; 
  align-items: flex-start; 
  justify-content: space-between; 
  flex-wrap: wrap; 
  gap: 1.25rem; 
  padding: 1.25rem 1.5rem;
  background: rgba(26, 29, 39, 0.4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
}
.dash-title {
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  font-weight: 800;
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
.wave {
  display: inline-block;
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
}
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-8deg); }
  50% { transform: rotate(0deg); }
}
.dash-sub { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.4rem; font-size: 0.95rem; }
.dash-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

.section-title { 
  font-weight: 700; 
  color: var(--text-muted); 
  font-size: 0.82rem; 
  text-transform: uppercase; 
  letter-spacing: 0.08em; 
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Exam countdown cards */
.exam-list { display: flex; flex-direction: column; gap: 0.85rem; }
.exam-countdown-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  border-left: 4px solid var(--primary);
  margin: 0 !important;
  width: 100%;
}
.exam-countdown-card:hover {
  transform: translateX(4px) translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  border-left-color: var(--accent);
}
.exam-countdown-card.urgent { 
  border-left-color: var(--danger); 
  background: linear-gradient(90deg, rgba(255,83,112,0.1) 0%, rgba(26,29,39,0.75) 100%);
  box-shadow: 0 0 24px rgba(255,83,112,0.15);
}
.exam-info   { display: flex; flex-direction: column; gap: 0.25rem; }
.exam-subject { font-weight: 700; font-size: 1.15rem; color: #fff; }
.exam-name   { font-size: 0.85rem; }
.exam-right  { text-align: right; }
.countdown-num { 
  font-size: 2.2rem; 
  font-weight: 800; 
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
}
.countdown-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.exam-date   { font-size: 0.78rem; margin-top: 0.25rem; font-weight: 500; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; align-items: stretch; }
@media (max-width: 750px) { .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 450px) { .stats-row { grid-template-columns: minmax(0, 1fr); } }
.stat-card  { 
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
.stat-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--grad-primary);
  opacity: 0.7;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 15px rgba(108,99,255,0.15);
}
.stat-num   { 
  font-size: 2.2rem; 
  font-weight: 800; 
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  line-height: 1.1;
}
.stat-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-top: 0.35rem; text-transform: uppercase; letter-spacing: 0.04em; }

/* Topic tags */
.topic-list { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 0.75rem 0; }
.topic-tag  {
  background: rgba(108,99,255,0.15);
  color: #c3bdff;
  border: 1px solid rgba(108,99,255,0.3);
  border-radius: 8px;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.topic-tag:hover {
  background: var(--primary);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108,99,255,0.4);
}

.quiz-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 0.75rem 0.5rem; 
  border-bottom: 1px solid var(--border); 
  transition: background 0.2s, padding 0.2s;
  border-radius: 6px;
}
.quiz-row:hover { background: rgba(255,255,255,0.03); padding-left: 0.8rem; padding-right: 0.8rem; }
.quiz-row:last-child { border-bottom: none; }
.tag-list { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.5rem; }
.quick-links { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin-top: 1rem; }
.empty-state { padding: 4rem 1.5rem; }

/* Reset link — subtle and small */
.reset-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  opacity: 0.6;
  transition: all 0.2s;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  touch-action: manipulation;
}
.reset-link:hover { opacity: 1; color: var(--danger); background: rgba(255,83,112,0.1); }

@media (max-width: 600px) {
  .dash-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .dash-actions {
    width: 100%;
  }
  .dash-actions .btn {
    flex: 1;
  }
  .exam-countdown-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .exam-right {
    text-align: left;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
}
</style>
