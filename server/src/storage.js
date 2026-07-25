// Simple localStorage helper for Mentora AI
// Saves only essential data — things that can be regenerated (goal, type) are stripped.

const KEY = 'mentora_progress'

/** Read progress from localStorage. Returns {} if nothing saved. */
export function getProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** Check if user has an active study plan. */
export function hasActivePlan() {
  const p = getProgress()
  return !!(p.plan && p.plan.length)
}

/**
 * Strip regenerable fields from plan entries before saving.
 * Keeps: day, date, topics, subject
 * Strips: goal, type, week (cosmetic / regenerable)
 */
function slimPlan(plan) {
  if (!Array.isArray(plan)) return plan
  return plan.map(d => ({
    day:     d.day,
    date:    d.date,
    topics:  d.topics,
    subject: d.subject,
  }))
}

/** Save the full progress object to localStorage, auto-slimming the plan. */
export function saveProgress(data) {
  try {
    const slim = { ...data }
    if (slim.plan) slim.plan = slimPlan(slim.plan)
    // Strip name from student if present
    if (slim.student) {
      const { name, ...rest } = slim.student
      slim.student = rest
    }
    localStorage.setItem(KEY, JSON.stringify(slim))
  } catch {
    // Storage quota exceeded — silent fail
  }
}

/** Wipe progress (e.g. on reset). */
export function clearProgress() {
  localStorage.removeItem(KEY)
}
