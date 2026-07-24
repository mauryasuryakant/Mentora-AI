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
          <label class="form-label">Your Name</label>
          <input v-model="reg.name" class="form-input" placeholder="e.g. Priya" />
        </div>

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

      <h1 class="mb-1 mt-2">Basic Information</h1>
      <p class="mb-3">Tell us about yourself and your exams.</p>

      <div class="card">
        <div class="alert alert-error mb-2" v-if="error">{{ error }}</div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input v-model="ex.name" class="form-input" placeholder="e.g. Arjun" />
          </div>

          <div class="form-group">
            <label class="form-label">Hours Available per Day</label>
            <select v-model="ex.hoursPerDay" class="form-select">
              <option value="">Select</option>
              <option v-for="h in [1,2,3,4,5,6]" :key="h" :value="h">
                {{ h }} hour{{ h > 1 ? 's' : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            Exam Name
            <span class="field-hint">shared across all your exams, e.g. Board Exam, Final Exam</span>
          </label>
          <input v-model="ex.examName" class="form-input" placeholder="e.g. Final Exam" />
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
        <RouterLink to="/dashboard"  class="btn btn-outline">📊 Dashboard</RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api/index.js'
import { saveProgress } from '../storage.js'

const step    = ref(1)
const mode    = ref('')
const loading = ref(false)
const today   = new Date().toISOString().split('T')[0]
const placeholders = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics']

// ── Regular Study ─────────────────────────────────────────────────────────────
const reg = ref({ name: '', subjectsRaw: '', hoursPerDay: '', skillLevel: 'Beginner' })

// ── Exam Prep ─────────────────────────────────────────────────────────────────
const ex = ref({
  name: '', hoursPerDay: '', examName: '', count: 2,
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
  try {
    const subjects = reg.value.subjectsRaw.split(',').map(s => s.trim()).filter(Boolean)
    await api.studyPlan({
      mode: 'regular',
      student: {
        name:        reg.value.name.trim(),
        subjects,
        hoursPerDay: Number(reg.value.hoursPerDay),
        skillLevel:  reg.value.skillLevel
      }
    })
    // Cache the full progress so other pages load instantly
    const prog = await api.progress()
    saveProgress(prog.progress)
    step.value = 'done'
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitExam() {
  loading.value = true
  try {
    const exams = ex.value.exams.map(e => ({
      subject: e.subject.trim(),
      name:    ex.value.examName.trim(),   // shared exam name
      date:    e.date || null
    }))
    await api.studyPlan({
      mode: 'exam',
      student: { name: ex.value.name.trim(), hoursPerDay: Number(ex.value.hoursPerDay) },
      exams
    })
    // Cache the full progress so other pages load instantly
    const prog = await api.progress()
    saveProgress(prog.progress)
    step.value = 'done'
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Mode cards ──────────────────────────────────────────────── */
.mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .mode-grid { grid-template-columns: 1fr; } }

.mode-card {
  text-align: left;
  padding: 1.75rem;
  cursor: pointer;
  border: 1.5px solid var(--border);
  background: none;
  color: inherit;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: border-color 0.2s, transform 0.15s;
}
.mode-card:hover { border-color: var(--primary); transform: translateY(-2px); }
.mode-card h3    { font-size: 1.1rem; color: var(--text); margin: 0; }
.mode-card p     { font-size: 0.875rem; color: var(--text-muted); margin: 0.15rem 0 0; }
.mode-icon       { font-size: 2rem; }

.mode-features {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.mode-features li { font-size: 0.8rem; color: var(--text-muted); }

/* ── Step header ─────────────────────────────────────────────── */
.step-header { display: flex; align-items: center; gap: 0.75rem; }
.back-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 8px;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.back-btn:hover { border-color: var(--primary); color: var(--primary); }

/* ── Field hint ──────────────────────────────────────────────── */
.field-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-left: 0.35rem;
}

/* ── Exam count ──────────────────────────────────────────────── */
.count-row { display: flex; align-items: center; gap: 1rem; }
.count-btn {
  width: 34px; height: 34px;
  border: 1.5px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: border-color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.count-btn:hover:not(:disabled) { border-color: var(--primary); }
.count-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.count-num { font-size: 1.5rem; font-weight: 700; color: var(--primary); min-width: 2rem; text-align: center; }

/* ── Per-exam row ────────────────────────────────────────────── */
.exam-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding: 1.1rem 1.25rem;
}
.exam-idx {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: rgba(108,99,255,0.15);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2rem;
}
.exam-fields { flex: 1; }
.auto-note {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

/* ── Button spinner ──────────────────────────────────────────── */
.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

/* ── Done screen ─────────────────────────────────────────────── */
.done-state  { padding: 4rem 1.5rem; }
.done-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
</style>
