// Simple localStorage helper for Mentora AI
// Saves and loads the full progress object

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

/** Save the full progress object to localStorage. */
export function saveProgress(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage quota exceeded — silent fail
  }
}

/** Wipe progress (e.g. on reset). */
export function clearProgress() {
  localStorage.removeItem(KEY)
}
