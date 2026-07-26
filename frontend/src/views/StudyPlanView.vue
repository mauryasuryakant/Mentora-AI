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

      <div class="plan-list">
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
.plan-list { display: flex; flex-direction: column; gap: 1rem; }
.day-card { 
  margin: 0 !important;
  width: 100%;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}
.day-card:hover { 
  transform: translateX(4px) translateY(-2px); 
  border-color: rgba(255,255,255,0.18);
  box-shadow: 0 10px 25px rgba(0,0,0,0.35);
}
.day-card.day-today { 
  border-left-color: var(--primary); 
  background: linear-gradient(90deg, rgba(108,99,255,0.1) 0%, rgba(26,29,39,0.75) 100%);
  box-shadow: 0 0 24px rgba(108,99,255,0.15);
}
.day-card.day-done { 
  opacity: 0.65; 
  border-left-color: var(--success);
}
.day-card.day-done:hover { opacity: 0.9; }

.day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.day-meta   { display: flex; align-items: center; gap: 0.75rem; }
.day-num    { 
  font-weight: 800; 
  font-size: 1.1rem; 
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.day-date   { font-size: 0.82rem; font-weight: 600; }
.day-goal   { font-size: 0.92rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5; }

/* Topic list with resource buttons */
.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.topic-item {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(108,99,255,0.3);
  background: rgba(108,99,255,0.08);
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.topic-item:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(108,99,255,0.3);
  transform: translateY(-1px);
}
.topic-tag {
  color: #fff;
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.topic-learn-btn {
  background: rgba(108,99,255,0.2);
  border: none;
  border-left: 1px solid rgba(108,99,255,0.3);
  color: #c3bdff;
  padding: 0.45rem 0.85rem;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  touch-action: manipulation;
}
.topic-learn-btn:hover {
  background: var(--primary);
  color: #fff;
}

.day-action { margin-top: 0.75rem; }

@media (max-width: 500px) {
  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .day-action .btn {
    width: 100%;
  }
}
</style>
