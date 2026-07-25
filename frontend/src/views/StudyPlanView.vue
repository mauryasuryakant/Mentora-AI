<template>
  <div class="page">
    <h1 class="mb-1">📅 Study Plan</h1>

    <div v-if="!plan.length" class="card text-center" style="padding:3rem">
      <p class="mb-2">No study plan yet.</p>
      <RouterLink to="/setup" class="btn btn-primary">Generate a Plan</RouterLink>
    </div>

    <div v-else>
      <p class="mb-3 text-muted">
        {{ plan.length }}-day plan ·
        <strong style="color:var(--text)">{{ subjectList }}</strong>
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
            <span class="badge badge-primary" v-if="day.subject" style="font-size:.68rem">{{ day.subject }}</span>
          </div>
          <span v-if="isDone(day.day)"  class="badge badge-success">✓ Done</span>
          <span v-else-if="isToday(day.day)" class="badge badge-primary">Today</span>
          <span v-else class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-muted)">Upcoming</span>
        </div>

        <p class="day-goal" v-if="day.goal">🎯 {{ day.goal }}</p>

        <!-- Topics with individual "Learn" buttons -->
        <div class="topic-list">
          <div
            class="topic-item"
            v-for="t in day.topics"
            :key="t"
          >
            <span class="topic-tag">{{ t }}</span>
            <button
              class="topic-learn-btn"
              @click="learnTopic(t)"
              :title="`Get AI resources for: ${t}`"
            >
              📚 Resources
            </button>
          </div>
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
import { ref, computed, inject } from 'vue'
import { getProgress } from '../storage.js'

const cached  = getProgress()
const plan    = ref(cached.plan    || [])
const doneSet = ref(new Set((cached.quizzes || []).map(q => q.day)))

// Derive unique subject names from plan entries
const subjectList = computed(() => {
  const subjects = [...new Set(plan.value.map(d => d.subject).filter(Boolean))]
  return subjects.length ? subjects.join(' · ') : (cached.student?.subjects || []).join(', ') || 'Your Studies'
})

// Injected from App.vue – opens the global AI chat panel
const openAiChat = inject('openAiChat')

function learnTopic(topicName) {
  if (openAiChat) {
    openAiChat(`Give me study resources, key concepts, and tips to learn: "${topicName}"`)
  }
}

function isDone(dayNum)  { return doneSet.value.has(dayNum) }
function isToday(dayNum) {
  const todayStr = new Date().toISOString().split('T')[0]
  const dayEntry = plan.value.find(d => d.day === dayNum)
  return dayEntry?.date === todayStr
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

/* Topic list with resource buttons */
.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.topic-item {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(108,99,255,0.2);
}
.topic-tag {
  background: rgba(108,99,255,0.12);
  color: var(--primary);
  padding: 0.22rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 500;
}
.topic-learn-btn {
  background: rgba(108,99,255,0.0);
  border: none;
  border-left: 1px solid rgba(108,99,255,0.2);
  color: var(--text-muted);
  padding: 0.22rem 0.55rem;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  font-family: inherit;
  white-space: nowrap;
}
.topic-learn-btn:hover {
  background: rgba(108,99,255,0.18);
  color: var(--primary);
}

.day-action { margin-top: 0.5rem; }
</style>
