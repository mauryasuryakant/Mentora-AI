<template>
  <div class="page">

    <!-- STEP 1: Topic Selection / Loading Quiz -->
    <div v-if="phase === 'loading'">
      <h1 class="mb-1">📝 Generating Quiz…</h1>
      <div class="loading-box">
        <div class="spinner"></div>
        <span>Mentora is crafting your questions…</span>
      </div>
    </div>

    <!-- STEP 2: Answer Questions -->
    <div v-else-if="phase === 'answering'">
      <div class="quiz-header mb-3">
        <h1>📝 Quiz — Day {{ currentDay }}</h1>
        <span class="badge badge-primary">{{ questions.length }} Questions</span>
      </div>

      <div class="topics-line mb-3 text-muted" style="font-size:.875rem">
        Topics: <strong style="color:var(--text)">{{ topicsList }}</strong>
      </div>

      <div class="alert alert-error mb-2" v-if="error">{{ error }}</div>

      <div class="q-card card" v-for="(q, idx) in questions" :key="q.id">
        <div class="q-meta">
          <span class="q-num">Q{{ idx + 1 }}</span>
          <span class="badge badge-primary" style="font-size:.7rem;text-transform:uppercase">{{ q.type.replace('_',' ') }}</span>
          <span class="text-muted" style="font-size:.75rem">{{ q.topic }}</span>
        </div>
        <p class="q-text">{{ q.question }}</p>

        <!-- Multiple Choice -->
        <div v-if="q.type === 'multiple_choice'" class="options">
          <label
            v-for="opt in q.options" :key="opt"
            class="option-label"
            :class="{ selected: answers[q.id] === opt }"
          >
            <input type="radio" :name="'q' + q.id" :value="opt" v-model="answers[q.id]" />
            {{ opt }}
          </label>
        </div>

        <!-- True / False -->
        <div v-else-if="q.type === 'true_false'" class="options tf-options">
          <label class="option-label" :class="{ selected: answers[q.id] === 'True' }">
            <input type="radio" :name="'q' + q.id" value="True" v-model="answers[q.id]" /> True
          </label>
          <label class="option-label" :class="{ selected: answers[q.id] === 'False' }">
            <input type="radio" :name="'q' + q.id" value="False" v-model="answers[q.id]" /> False
          </label>
        </div>

        <!-- Short Answer -->
        <div v-else>
          <textarea
            v-model="answers[q.id]"
            class="form-input"
            rows="3"
            placeholder="Type your answer here…"
          ></textarea>
        </div>
      </div>

      <button class="btn btn-primary btn-block mt-3" @click="submitAnswers" :disabled="submitting">
        <span v-if="submitting"><span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> Evaluating…</span>
        <span v-else">✅ Submit Answers</span>
      </button>
    </div>

    <!-- STEP 3: Results -->
    <div v-else-if="phase === 'results'">
      <h1 class="mb-1">Results</h1>

      <!-- Score Card -->
      <div class="score-card card mb-3">
        <div class="score-big">{{ evaluation.score }}<span class="score-total">/{{ evaluation.total }}</span></div>
        <div :class="scoreClass(evaluation.percentage)">{{ evaluation.percentage }}%</div>
        <p class="mt-1 text-muted" style="font-size:.9rem">{{ evaluation.summary }}</p>

        <div class="progress-bar-wrap mt-2">
          <div class="progress-bar-fill" :style="{ width: evaluation.percentage + '%' }"></div>
        </div>
      </div>

      <!-- Motivation -->
      <div class="motivation-card card mb-3" v-if="motivation">
        <div class="motiv-icon">💬</div>
        <p class="motiv-text">{{ motivation }}</p>
      </div>

      <!-- Weak Topics -->
      <div class="card mb-3" v-if="evaluation.weakTopics?.length">
        <h3 class="mb-2">⚠️ Weak Topics</h3>
        <div class="tag-list">
          <span class="badge badge-warning" v-for="t in evaluation.weakTopics" :key="t">{{ t }}</span>
        </div>
      </div>

      <!-- Per-Question Breakdown -->
      <h3 class="mb-2 mt-3">Question Breakdown</h3>
      <div
        class="result-card card"
        v-for="(r, idx) in evaluation.results"
        :key="r.id"
        :class="r.correct ? 'result-correct' : 'result-wrong'"
      >
        <div class="result-header">
          <span>Q{{ idx + 1 }}. {{ questions[idx]?.question }}</span>
          <span class="badge" :class="r.correct ? 'badge-success' : 'badge-danger'">
            {{ r.correct ? '✓ Correct' : '✗ Wrong' }}
          </span>
        </div>
        <div class="result-detail" v-if="!r.correct">
          <div>Your answer: <strong>{{ r.studentAnswer || '(no answer)' }}</strong></div>
          <div>Correct answer: <strong style="color:var(--success)">{{ r.correctAnswer }}</strong></div>
        </div>
        <div class="result-explanation">{{ r.explanation }}</div>
      </div>

      <div class="result-actions mt-3">
        <RouterLink to="/study-plan" class="btn btn-outline">📅 Back to Plan</RouterLink>
        <RouterLink to="/progress"   class="btn btn-outline">📊 View Progress</RouterLink>
        <button class="btn btn-primary" @click="resetQuiz">🔁 Retry</button>
      </div>
    </div>

    <!-- No Setup -->
    <div v-else class="card text-center" style="padding:3rem">
      <p class="mb-2">No study plan found.</p>
      <RouterLink to="/setup" class="btn btn-primary">Get Started</RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/index.js'
import { getProgress, saveProgress } from '../storage.js'

const route      = useRoute()
const phase      = ref('loading')   // loading | answering | results | empty
const questions  = ref([])
const answers    = ref({})
const evaluation = ref(null)
const motivation = ref('')
const error      = ref('')
const submitting = ref(false)
const currentDay = ref(1)

const topicsList = computed(() =>
  questions.value.map(q => q.topic).filter((v, i, a) => a.indexOf(v) === i).join(', ')
)

onMounted(async () => {
  const qTopics = route.query.topics
  const qDay    = route.query.day

  if (qTopics) {
    const topics = qTopics.split(',').map(t => t.trim())
    currentDay.value = Number(qDay) || 1
    await loadQuiz(topics)
  } else {
    // Use localStorage first — no extra API call needed
    const p        = getProgress()
    const todayStr = new Date().toISOString().split('T')[0]
    const todayPlan = (p.plan || []).find(d => d.date === todayStr)
    if (todayPlan) {
      currentDay.value = todayPlan.day
      await loadQuiz(todayPlan.topics)
    } else if (p.plan?.length) {
      const done  = new Set((p.quizzes || []).map(q => q.day))
      const first = p.plan.find(d => !done.has(d.day))
      if (first) {
        currentDay.value = first.day
        await loadQuiz(first.topics)
      } else {
        phase.value = 'empty'
      }
    } else {
      phase.value = 'empty'
    }
  }
})

async function loadQuiz(topics) {
  phase.value = 'loading'
  try {
    const res      = await api.quiz({ topics, questionCount: 5 })
    questions.value = res.questions
    answers.value   = {}
    phase.value     = 'answering'
  } catch (e) {
    error.value = e.message
    phase.value = 'empty'
  }
}

async function submitAnswers() {
  error.value   = ''
  submitting.value = true
  try {
    const p = getProgress()
    const res = await api.evaluate({
      questions:      questions.value,
      studentAnswers: answers.value,
      studentName:    p.student?.name || 'Student'
    })
    evaluation.value = res.evaluation
    motivation.value = res.motivation
    phase.value      = 'results'

    // Save quiz result directly to localStorage
    const progress  = getProgress()
    const quizEntry = {
      day:        currentDay.value,
      date:       new Date().toISOString().split('T')[0],
      score:      res.evaluation.score,
      total:      res.evaluation.total,
      percentage: res.evaluation.percentage,
      weakTopics: res.evaluation.weakTopics || []
    }
    progress.quizzes = progress.quizzes || []
    progress.quizzes.push(quizEntry)
    const allWeak = new Set([...(progress.weakTopics || []), ...(res.evaluation.weakTopics || [])])
    progress.weakTopics = [...allWeak]
    saveProgress(progress)

  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

function resetQuiz() {
  phase.value      = 'loading'
  answers.value    = {}
  evaluation.value = null
  motivation.value = ''
  const topics = questions.value.map(q => q.topic).filter((v,i,a)=>a.indexOf(v)===i)
  loadQuiz(topics)
}

function scoreClass(pct) {
  if (pct >= 80) return 'text-success'
  if (pct >= 50) return 'text-warning'
  return 'text-danger'
}
</script>

<style scoped>
.quiz-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

.q-card     { margin-bottom: 1rem; }
.q-meta     { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; }
.q-num      { font-weight: 700; color: var(--primary); }
.q-text     { font-size: 1rem; color: var(--text); margin-bottom: 0.75rem; }

.options    { display: flex; flex-direction: column; gap: 0.5rem; }
.tf-options { flex-direction: row; }
.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  font-size: 0.9rem;
}
.option-label input { accent-color: var(--primary); }
.option-label:hover { border-color: var(--primary); background: rgba(108,99,255,0.06); }
.option-label.selected { border-color: var(--primary); background: rgba(108,99,255,0.12); }

/* Results */
.score-card { text-align: center; padding: 2rem; }
.score-big  { font-size: 3rem; font-weight: 800; color: var(--primary); }
.score-total { font-size: 1.5rem; color: var(--text-muted); }

.motivation-card { display: flex; gap: 1rem; align-items: flex-start; background: rgba(0,201,167,0.06); border-color: rgba(0,201,167,0.25); }
.motiv-icon { font-size: 1.5rem; flex-shrink: 0; }
.motiv-text { color: var(--text); font-size: 0.95rem; line-height: 1.6; }

.result-card    { margin-bottom: 0.75rem; }
.result-correct { border-left: 3px solid var(--success); }
.result-wrong   { border-left: 3px solid var(--danger); }
.result-header  { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; font-size:.9rem; }
.result-detail  { font-size:.85rem; color: var(--text-muted); margin-bottom: 0.4rem; }
.result-explanation { font-size:.85rem; color: var(--text-muted); font-style: italic; }

.result-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.tag-list       { display: flex; flex-wrap: wrap; gap: 0.5rem; }
</style>
