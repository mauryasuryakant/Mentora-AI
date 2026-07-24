import express from 'express'
import { askAI } from '../services/ai.js'
import { readProgress, writeProgress } from '../services/store.js'
import studyPlannerPrompt  from '../prompts/studyPlanner.js'
import quizGeneratorPrompt from '../prompts/quizGenerator.js'
import evaluationPrompt    from '../prompts/evaluation.js'
import motivationPrompt    from '../prompts/motivation.js'

const router = express.Router()

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mentora AI backend is running' })
})

// ─── POST /api/study-plan ─────────────────────────────────────────────────────
// Generate a day-by-day study plan for the student
router.post('/study-plan', async (req, res) => {
  try {
    const { name, subject, examName, examDate, hoursPerDay } = req.body

    if (!name || !subject || !examDate || !hoursPerDay) {
      return res.status(400).json({ error: 'Missing required fields: name, subject, examDate, hoursPerDay' })
    }

    const today    = new Date().toISOString().split('T')[0]
    const daysLeft = Math.max(1, Math.ceil((new Date(examDate) - new Date(today)) / (1000 * 60 * 60 * 24)))

    const userMessage = `
Student name: ${name}
Subject: ${subject}
Exam name: ${examName || subject + ' Exam'}
Exam date: ${examDate}
Today's date: ${today}
Days available: ${daysLeft}
Hours available per day: ${hoursPerDay}

Please create a complete study plan for this student.
    `.trim()

    const aiResponse = await askAI(studyPlannerPrompt, userMessage)
    const parsed     = JSON.parse(aiResponse)

    // Save student info + plan to progress store
    const progress = readProgress()
    progress.student  = { name, subject, examName, examDate, hoursPerDay }
    progress.plan     = parsed.plan
    progress.quizzes  = progress.quizzes  || []
    progress.weakTopics = progress.weakTopics || []
    writeProgress(progress)

    res.json({ success: true, plan: parsed.plan })

  } catch (err) {
    console.error('[/study-plan]', err.message)
    res.status(500).json({ error: 'Failed to generate study plan. Please try again.' })
  }
})

// ─── POST /api/quiz ───────────────────────────────────────────────────────────
// Generate quiz questions for given topics
router.post('/quiz', async (req, res) => {
  try {
    const { topics, questionCount = 5 } = req.body

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'topics must be a non-empty array' })
    }

    const userMessage = `
Topics to quiz on: ${topics.join(', ')}
Number of questions to generate: ${questionCount}
Mix the question types (multiple_choice, true_false, short_answer).
    `.trim()

    const aiResponse = await askAI(quizGeneratorPrompt, userMessage)
    const parsed     = JSON.parse(aiResponse)

    res.json({ success: true, questions: parsed.questions })

  } catch (err) {
    console.error('[/quiz]', err.message)
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' })
  }
})

// ─── POST /api/evaluate ───────────────────────────────────────────────────────
// Evaluate student answers and generate motivation
router.post('/evaluate', async (req, res) => {
  try {
    const { questions, studentAnswers, day } = req.body

    if (!questions || !studentAnswers) {
      return res.status(400).json({ error: 'questions and studentAnswers are required' })
    }

    // Build evaluation request
    const pairs = questions.map((q, i) => ({
      id:            q.id,
      type:          q.type,
      question:      q.question,
      correctAnswer: q.answer,
      studentAnswer: studentAnswers[q.id] || '',
      topic:         q.topic
    }))

    const evalMessage = `
Please evaluate these quiz answers:
${JSON.stringify(pairs, null, 2)}
    `.trim()

    const aiResponse = await askAI(evaluationPrompt, evalMessage)
    const evaluation = JSON.parse(aiResponse)

    // Save quiz result to progress
    const progress = readProgress()
    progress.quizzes = progress.quizzes || []
    progress.quizzes.push({
      day:       day || progress.quizzes.length + 1,
      date:      new Date().toISOString().split('T')[0],
      score:     evaluation.score,
      total:     evaluation.total,
      percentage: evaluation.percentage,
      weakTopics: evaluation.weakTopics
    })

    // Merge weak topics (deduplicated)
    const allWeak = new Set([...(progress.weakTopics || []), ...(evaluation.weakTopics || [])])
    progress.weakTopics = [...allWeak]
    writeProgress(progress)

    // Generate motivation message
    const student    = progress.student || {}
    const motivMsg   = `
Student name: ${student.name || 'Student'}
Topics studied today: ${questions.map(q => q.topic).join(', ')}
Score: ${evaluation.score} out of ${evaluation.total} (${evaluation.percentage}%)
Weak topics: ${evaluation.weakTopics.join(', ') || 'none'}
    `.trim()

    const motivation = await askAI(motivationPrompt, motivMsg)

    res.json({ success: true, evaluation, motivation })

  } catch (err) {
    console.error('[/evaluate]', err.message)
    res.status(500).json({ error: 'Failed to evaluate answers. Please try again.' })
  }
})

// ─── GET /api/progress ────────────────────────────────────────────────────────
// Return all stored progress data
router.get('/progress', (req, res) => {
  try {
    const progress = readProgress()
    res.json({ success: true, progress })
  } catch (err) {
    console.error('[/progress]', err.message)
    res.status(500).json({ error: 'Failed to read progress.' })
  }
})

// ─── POST /api/chat ───────────────────────────────────────────────────────────
// General Q&A chat with Mentora (study-related only)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    const systemPrompt = `You are Mentora, a helpful AI study mentor.
Answer only study-related questions. Keep answers concise and easy to understand.
If the question is not related to studying or education, politely redirect the student back to their studies.`

    const reply = await askAI(systemPrompt, message)
    res.json({ success: true, reply })

  } catch (err) {
    console.error('[/chat]', err.message)
    res.status(500).json({ error: 'Failed to get response. Please try again.' })
  }
})

export default router
