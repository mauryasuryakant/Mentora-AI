import { generateStudyPlan, generateQuiz, evaluateQuiz, mentorChat } from '../services/frontendServices.js'

/**
 * Mentora AI Client API Layer
 * 100% Frontend-only implementation replacing server HTTP endpoints.
 * Returns Promises matching the existing async component signatures.
 */

export const api = {
  health: () => Promise.resolve({ status: 'ok', message: 'Mentora AI frontend is running' }),
  studyPlan: (data) => Promise.resolve().then(() => generateStudyPlan(data)),
  quiz: (data) => Promise.resolve().then(() => generateQuiz(data)),
  evaluate: (data) => Promise.resolve().then(() => evaluateQuiz(data)),
  chat: (data) => Promise.resolve().then(() => mentorChat(data)),
}
