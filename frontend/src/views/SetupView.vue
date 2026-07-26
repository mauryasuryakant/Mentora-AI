<template>
  <div class="page">

    <!-- ─── STEP 1: Mode Selection ──────────────────────────────── -->
    <div v-if="step === 1">
      <h1 class="mb-1">👋 Welcome to Mentora AI</h1>
      <p class="mb-3">What are you here for? Choose the option that fits you.</p>

      <div class="mode-grid">
        <!-- Regular Study -->
        <button class="mode-card card" @click="selectMode('regular')">
          <div class="mode-icon">📚</div>
          <h3>Regular Study</h3>
          <p>Build skills at your own pace. No exam deadline needed.</p>
          <ul class="mode-features">
            <li>✓ 28-day rolling plan</li>
            <li>✓ Progressive skill building</li>
            <li>✓ Weekly reviews & quizzes</li>
          </ul>
        </button>

        <!-- Exam Preparation -->
        <button class="mode-card card" @click="selectMode('exam')">
          <div class="mode-icon">📝</div>
          <h3>Exam Preparation</h3>
          <p>Prepare for one or more exams with a smart unified timetable.</p>
          <ul class="mode-features">
            <li>✓ Multi-exam support</li>
            <li>✓ Prioritised by nearest exam</li>
            <li>✓ Auto-revision scheduling</li>
          </ul>
        </button>
      </div>

      <p class="mt-3 text-muted" style="font-size:.8rem;text-align:center">
        More modes coming soon: Certification · Language Learning · College Semester
      </p>
    </div>

    <!-- ─── STEP 2a: Regular Study Form ────────────────────────── -->
    <div v-else-if="step === 2 && mode === 'regular'">
      <div class="step-header">
        <button class="back-btn" @click="goBack(1)">← Back</button>
        <span class="badge badge-primary">📚 Regular Study</span>
      </div>

      <h1 class="mb-1 mt-2">Your Learning Profile</h1>
      <p class="mb-3">We'll build a personalised 28-day learning plan based on this.</p>

      <div class="card">

        <div class="form-group">
          <label class="form-label">
            Subject(s)
            <span class="field-hint">separate multiple with commas</span>
          </label>
          <input
            v-model="reg.subjectsRaw"
            class="form-input"
            placeholder="e.g. Python, Data Structures, Algorithms"
          />
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Hours Available per Day</label>
            <select v-model="reg.hoursPerDay" class="form-select">
              <option value="">Select</option>
              <option v-for="h in [1,2,3,4,5,6]" :key="h" :value="h">
                {{ h }} hour{{ h > 1 ? 's' : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Current Skill Level</label>
            <select v-model="reg.skillLevel" class="form-select">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button
          class="btn btn-primary btn-block mt-2"
          @click="submitRegular"
          :disabled="loading"
        >
          <span v-if="loading"><span class="btn-spinner"></span> Generating Plan…</span>
          <span v-else>🚀 Generate My Study Plan</span>
        </button>
      </div>
    </div>

    <!-- ─── STEP 2b: Exam — Basic Info ─────────────────────────── -->
    <div v-else-if="step === 2 && mode === 'exam'">
      <div class="step-header">
        <button class="back-btn" @click="goBack(1)">← Back</button>
        <span class="badge badge-primary">📝 Exam Preparation</span>
      </div>

      <h1 class="mb-1 mt-2">Exam Setup</h1>
      <p class="mb-3">Tell us about your exams so we can build the optimal plan.</p>

      <div class="card">
        <div class="alert alert-error mb-2" v-if="error">{{ error }}</div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Hours Available per Day</label>
            <select v-model="ex.hoursPerDay" class="form-select">
              <option value="">Select</option>
              <option v-for="h in [1,2,3,4,5,6]" :key="h" :value="h">
                {{ h }} hour{{ h > 1 ? 's' : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              Exam Name
              <span class="field-hint">e.g. Board Exam, Final Exam</span>
            </label>
            <input v-model="ex.examName" class="form-input" placeholder="e.g. Final Exam" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">How many exams do you have?</label>
          <div class="count-row">
            <button type="button" class="count-btn" @click="setCount(ex.count - 1)" :disabled="ex.count <= 1">−</button>
            <span class="count-num">{{ ex.count }}</span>
            <button type="button" class="count-btn" @click="setCount(ex.count + 1)" :disabled="ex.count >= 8">+</button>
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-block mt-1" @click="goToExamDetails">
          Next: Enter Subjects & Dates →
        </button>
      </div>
    </div>

    <!-- ─── STEP 3: Per-Exam Subject + Date ────────────────────── -->
    <div v-else-if="step === 3 && mode === 'exam'">
      <div class="step-header">
        <button class="back-btn" @click="goBack(2)">← Back</button>
        <span class="badge badge-primary">📝 Exam Details</span>
      </div>

      <h1 class="mb-1 mt-2">Subjects & Dates</h1>
      <p class="mb-3">
        Exam: <strong style="color:var(--text)">{{ ex.examName }}</strong>
        &nbsp;·&nbsp; Date is optional — Mentora auto-assigns it if missing.
      </p>

      <div class="alert alert-error mb-2" v-if="error">{{ error }}</div>

      <div class="card exam-row" v-for="(e, idx) in ex.exams" :key="idx">
        <span class="exam-idx">{{ idx + 1 }}</span>

        <div class="exam-fields">
          <div class="form-group" style="margin-bottom:.6rem">
            <label class="form-label">Subject</label>
            <input
              v-model="e.subject"
              class="form-input"
              :placeholder="'e.g. ' + placeholders[idx]"
            />
          </div>

          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">
              Exam Date
              <span class="field-hint">optional</span>
            </label>
            <input v-model="e.date" type="date" class="form-input" :min="today" />
            <span class="auto-note" v-if="!e.date">
              📅 Will be auto-assigned
            </span>
          </div>
        </div>
      </div>

      <button
        class="btn btn-primary btn-block mt-3"
        @click="submitExam"
        :disabled="loading"
      >
        <span v-if="loading"><span class="btn-spinner"></span> Building Unified Plan…</span>
        <span v-else>🚀 Generate Unified Study Plan</span>
      </button>
    </div>

    <!-- ─── Done ───────────────────────────────────────────────── -->
    <div v-else-if="step === 'done'" class="done-state text-center">
      <div style="font-size:3.5rem;margin-bottom:1rem">🎉</div>
      <h2 class="mb-1">Your plan is ready!</h2>
      <p class="mb-3">
        <span v-if="mode === 'exam'">Unified timetable created for all your exams.</span>
        <span v-else>Your personalised 28-day learning journey starts today.</span>
      </p>
      <div class="done-actions">
        <RouterLink to="/study-plan" class="btn btn-primary">📅 View Study Plan</RouterLink>
        <RouterLink to="/"           class="btn btn-outline">📊 Dashboard</RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api/index.js'
import { getProgress, saveProgress } from '../storage.js'

const step    = ref(1)
const mode    = ref('')
const loading = ref(false)
const error   = ref('')
const today   = new Date().toISOString().split('T')[0]
const placeholders = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics']

// ── Regular Study ─────────────────────────────────────────────────────────────
const reg = ref({ subjectsRaw: '', hoursPerDay: '', skillLevel: 'Beginner' })

// ── Exam Prep ─────────────────────────────────────────────────────────────────
const ex = ref({
  hoursPerDay: '', examName: '', count: 2,
  exams: [{ subject: '', date: '' }, { subject: '', date: '' }]
})

function goBack(n) {
  step.value = n
}

function selectMode(m) {
  mode.value = m
  step.value = 2
}

function setCount(n) {
  ex.value.count = Math.min(8, Math.max(1, n))
  while (ex.value.exams.length < ex.value.count) ex.value.exams.push({ subject: '', date: '' })
  while (ex.value.exams.length > ex.value.count) ex.value.exams.pop()
}

function goToExamDetails() {
  step.value = 3
}

async function submitRegular() {
  loading.value = true
  error.value   = ''
  try {
    const subjects = reg.value.subjectsRaw.split(',').map(s => s.trim()).filter(Boolean)
    const res = await api.studyPlan({
      mode: 'regular',
      student: {
        name:        'Student',    // placeholder — backend requires it for the prompt
        subjects,
        hoursPerDay: Number(reg.value.hoursPerDay),
        skillLevel:  reg.value.skillLevel
      }
    })
    const existing = getProgress()
    saveProgress({
      mode:       'regular',
      student:    { subjects, hoursPerDay: Number(reg.value.hoursPerDay), skillLevel: reg.value.skillLevel },
      exams:      null,
      plan:       res.plan,
      quizzes:    existing.quizzes    || [],
      weakTopics: existing.weakTopics || []
    })
    step.value = 'done'
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitExam() {
  loading.value = true
  error.value   = ''
  try {
    for (const e of ex.value.exams) {
      if (e.date && e.date < today) {
        throw new Error(`The exam date for "${e.subject || 'Exam'}" (${e.date}) cannot be in the past. Please select today (${today}) or a future date.`)
      }
    }
    const exams = ex.value.exams.map(e => ({
      subject: e.subject.trim(),
      name:    ex.value.examName.trim(),
      date:    e.date || null
    }))
    const res = await api.studyPlan({
      mode: 'exam',
      student: { name: 'Student', hoursPerDay: Number(ex.value.hoursPerDay) },
      exams
    })
    const existing = getProgress()
    saveProgress({
      mode:       'exam',
      student:    { hoursPerDay: Number(ex.value.hoursPerDay) },
      exams:      res.exams,
      plan:       res.plan,
      quizzes:    existing.quizzes    || [],
      weakTopics: existing.weakTopics || []
    })
    step.value = 'done'
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Mode cards ──────────────────────────────────────────────── */
.mode-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; align-items: stretch; }
@media (max-width: 650px) { .mode-grid { grid-template-columns: minmax(0, 1fr); } }

.mode-card {
  text-align: left;
  padding: 2rem;
  cursor: pointer;
  border: 1.5px solid var(--border);
  background: rgba(26, 29, 39, 0.6);
  backdrop-filter: blur(16px);
  color: inherit;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
  margin: 0 !important;
  height: 100%;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.mode-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 3px;
  background: var(--grad-primary);
  opacity: 0;
  transition: opacity 0.3s;
}
.mode-card:hover { 
  border-color: rgba(108, 99, 255, 0.6); 
  transform: translateY(-6px) scale(1.02); 
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(108, 99, 255, 0.15);
  background: rgba(35, 39, 54, 0.75);
}
.mode-card:hover::before { opacity: 1; }
.mode-card h3    { font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0; }
.mode-card p     { font-size: 0.92rem; color: var(--text-muted); margin: 0.25rem 0 0.5rem; line-height: 1.5; }
.mode-icon       { font-size: 2.5rem; margin-bottom: 0.25rem; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }

.mode-features {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 0.75rem;
}
.mode-features li { font-size: 0.85rem; color: #a29bfe; font-weight: 500; display: flex; align-items: center; gap: 0.4rem; }

/* ── Step header ─────────────────────────────────────────────── */
.step-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.back-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { border-color: var(--primary); color: #fff; background: rgba(108,99,255,0.15); transform: translateX(-2px); }

/* ── Field hint ──────────────────────────────────────────────── */
.field-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-muted);
  font-size: 0.78rem;
  margin-left: 0.5rem;
}

/* ── Exam count ──────────────────────────────────────────────── */
.count-row { display: flex; align-items: center; gap: 1rem; }
.count-btn {
  width: 44px; height: 44px;
  min-width: 44px; min-height: 44px;
  border: 1.5px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
  border-radius: 12px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  touch-action: manipulation;
}
.count-btn:hover:not(:disabled) { border-color: var(--primary); background: rgba(108,99,255,0.15); color: #fff; transform: scale(1.05); }
.count-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.count-num { font-size: 1.6rem; font-weight: 800; color: var(--primary); min-width: 2.5rem; text-align: center; }

/* ── Per-exam row ────────────────────────────────────────────── */
.exam-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s;
}
.exam-row:hover { border-color: rgba(108, 99, 255, 0.3); }
.exam-idx {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: var(--grad-primary);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2rem;
  box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3);
}
.exam-fields { flex: 1; }
.auto-note {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

/* ── Button spinner ──────────────────────────────────────────── */
.btn-spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

/* ── Done screen ─────────────────────────────────────────────── */
.done-state  { padding: 5rem 2rem; }
.done-actions { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }

@media (max-width: 550px) {
  .exam-row {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
  .exam-idx { margin-top: 0; }
  .done-state { padding: 2.5rem 1rem; }
  .done-actions .btn { width: 100%; }
}
</style>
