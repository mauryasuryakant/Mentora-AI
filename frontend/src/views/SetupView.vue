<template>
  <div class="page">
    <h1 class="mb-1">👋 Let's get you set up</h1>
    <p class="mb-3">Tell Mentora a bit about yourself and your exam so it can build a personalised study plan.</p>

    <div class="card">
      <div class="alert alert-error" v-if="error">{{ error }}</div>

      <form @submit.prevent="submit">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input v-model="form.name" class="form-input" placeholder="e.g. Arjun" required />
          </div>
          <div class="form-group">
            <label class="form-label">Subject</label>
            <input v-model="form.subject" class="form-input" placeholder="e.g. Python Programming" required />
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Exam Name</label>
            <input v-model="form.examName" class="form-input" placeholder="e.g. Final Exam" />
          </div>
          <div class="form-group">
            <label class="form-label">Exam Date</label>
            <input v-model="form.examDate" type="date" class="form-input" :min="today" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Hours Available Per Day</label>
          <select v-model="form.hoursPerDay" class="form-select" required>
            <option value="">Select hours</option>
            <option v-for="h in [1,2,3,4,5,6]" :key="h" :value="h">{{ h }} hour{{ h > 1 ? 's' : '' }}</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading"><span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> Generating Plan…</span>
          <span v-else>🚀 Generate My Study Plan</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/index.js'

const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const today   = new Date().toISOString().split('T')[0]

const form = ref({
  name: '', subject: '', examName: '', examDate: '', hoursPerDay: ''
})

async function submit() {
  error.value   = ''
  loading.value = true
  try {
    const res = await api.studyPlan({
      name:       form.value.name,
      subject:    form.value.subject,
      examName:   form.value.examName,
      examDate:   form.value.examDate,
      hoursPerDay: Number(form.value.hoursPerDay)
    })
    if (res.success) {
      router.push('/study-plan')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
