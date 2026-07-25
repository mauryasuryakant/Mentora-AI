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

      <div class="questions-list">
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
    const res = await api.evaluate({
      questions:      questions.value,
      studentAnswers: answers.value,
      studentName:    'Student'
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
.quiz-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; justify-content: space-between; }

.questions-list { display: flex; flex-direction: column; gap: 1.25rem; }
.q-card { 
  margin: 0 !important;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
}
.q-card:hover { border-color: rgba(108,99,255,0.3); }
.q-meta { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
.q-num  { 
  font-weight: 800; 
  background: var(--grad-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.1rem;
}
.q-text { font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 1rem; line-height: 1.5; }

.options    { display: flex; flex-direction: column; gap: 0.6rem; }
.tf-options { flex-direction: row; gap: 1rem; }
.option-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  border: 1.5px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 0.95rem;
  color: var(--text-muted);
}
.option-label input { accent-color: var(--primary); width: 18px; height: 18px; }
.option-label:hover { border-color: var(--primary); background: rgba(108,99,255,0.1); color: #fff; transform: translateX(3px); }
.option-label.selected { 
  border-color: var(--primary); 
  background: linear-gradient(90deg, rgba(108,99,255,0.2) 0%, rgba(26,29,39,0.5) 100%);
  color: #fff; 
  font-weight: 600;
  box-shadow: 0 0 15px rgba(108,99,255,0.2);
}

/* Results */
.score-card { 
  text-align: center; 
  padding: 3rem 2rem; 
  position: relative;
  overflow: hidden;
}
.score-big { 
  font-size: 3.5rem; 
  font-weight: 800; 
  background: var(--grad-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  display: inline-block;
  filter: drop-shadow(0 4px 12px rgba(108,99,255,0.3));
}
.score-total { font-size: 1.75rem; color: var(--text-muted); font-weight: 700; }

.motivation-card { 
  display: flex; 
  gap: 1.25rem; 
  align-items: center; 
  background: linear-gradient(135deg, rgba(0,201,167,0.12) 0%, rgba(26,29,39,0.7) 100%); 
  border: 1px solid rgba(0,201,167,0.35); 
  box-shadow: 0 8px 24px rgba(0,201,167,0.15);
}
.motiv-icon { font-size: 2.2rem; flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(0,201,167,0.5)); }
.motiv-text { color: #fff; font-size: 1.05rem; line-height: 1.6; font-weight: 500; }

.result-card { 
  margin-bottom: 1rem; 
  transition: all 0.2s;
}
.result-card:hover { transform: translateY(-2px); }
.result-correct { 
  border-left: 4px solid var(--success); 
  background: linear-gradient(90deg, rgba(0,201,167,0.06) 0%, var(--bg-card) 100%);
}
.result-wrong { 
  border-left: 4px solid var(--danger); 
  background: linear-gradient(90deg, rgba(255,83,112,0.06) 0%, var(--bg-card) 100%);
}
.result-header  { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.6rem; font-size: 0.95rem; font-weight: 600; color: #fff; }
.result-detail  { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.result-explanation { font-size: 0.88rem; color: #a29bfe; background: rgba(108,99,255,0.08); padding: 0.75rem 1rem; border-radius: 8px; border-left: 2px solid var(--primary); margin-top: 0.5rem; line-height: 1.5; }

.result-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
.tag-list       { display: flex; flex-wrap: wrap; gap: 0.6rem; }
</style>
