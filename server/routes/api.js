import express from 'express'
import { askAI } from '../services/ai.js'
import { examPlannerPrompt, regularPlannerPrompt } from '../prompts/studyPlanner.js'
import quizGeneratorPrompt from '../prompts/quizGenerator.js'
import evaluationPrompt    from '../prompts/evaluation.js'
import motivationPrompt    from '../prompts/motivation.js'

const router = express.Router()

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mentora AI backend is running' })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Add N calendar days to a date, skipping Sundays.
 */
function addDaysSkippingSundays(dateStr, days) {
  const d = new Date(dateStr)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) added++ // 0 = Sunday
  }
  return d.toISOString().split('T')[0]
}

/**
 * Auto-assign missing exam dates.
 * Rules:
 *  - Start after the latest known exam date.
 *  - If no dates at all, start from tomorrow.
 *  - Skip Sundays.
 *  - Assign dates consecutively.
 */
function assignMissingDates(exams) {
  // Separate known and missing
  const known   = exams.filter(e => e.date).sort((a, b) => a.date.localeCompare(b.date))
  const missing = exams.filter(e => !e.date)

  if (!missing.length) return exams // nothing to do

  // Find the anchor: latest known date, or today if none
  let anchor = known.length
    ? known[known.length - 1].date
    : new Date().toISOString().split('T')[0]

  // Assign a date to each missing exam
  for (const exam of missing) {
    anchor    = addDaysSkippingSundays(anchor, 1)
    exam.date = anchor
  }

  return exams
}

// ─── POST /api/study-plan ─────────────────────────────────────────────────────
// Returns the generated plan; frontend saves it to localStorage.
router.post('/study-plan', async (req, res) => {
  try {
    const { mode, student, exams } = req.body

    if (!mode || !student || !student.hoursPerDay) {
      return res.status(400).json({ error: 'Missing required fields: mode, student.hoursPerDay' })
    }

    // Name is optional — default to 'Student'
    const studentName = student.name?.trim() || 'Student'

    const today = new Date().toISOString().split('T')[0]
    let aiResponse, parsed

    // ── EXAM mode ─────────────────────────────────────────────────────────────
    if (mode === 'exam') {
      if (!exams || !Array.isArray(exams) || exams.length === 0) {
        return res.status(400).json({ error: 'Exam mode requires at least one exam' })
      }

      for (const exam of exams) {
        if (exam.date && exam.date < today) {
          return res.status(400).json({ error: `Exam date for "${exam.subject || 'Subject'}" (${exam.date}) cannot be in the past. Please select today (${today}) or a future date.` })
        }
      }

      // Auto-fill missing dates
      const filledExams = assignMissingDates(
        exams.map(e => ({ ...e })) // shallow copy
      )

      // Sort by date
      filledExams.sort((a, b) => a.date.localeCompare(b.date))

      const lastExamDate = filledExams[filledExams.length - 1].date
      const totalDays    = Math.max(1, Math.ceil((new Date(lastExamDate) - new Date(today)) / (1000 * 60 * 60 * 24)))

      const userMessage = `
Student name: ${studentName}
Hours available per day: ${student.hoursPerDay}
Today's date: ${today}
Total days until last exam: ${totalDays}

Exams to prepare for (sorted by date):
${filledExams.map((e, i) => `  ${i + 1}. Subject: ${e.subject} | Exam: ${e.name} | Date: ${e.date}`).join('\n')}

Please create a single unified study plan covering all exams.
Remember: prioritize by nearest exam, increase revision before each exam date,
and do not schedule study sessions after an exam's date.
      `.trim()

      aiResponse = await askAI(examPlannerPrompt, userMessage)
      parsed     = JSON.parse(aiResponse)

      return res.json({ success: true, plan: parsed.plan, exams: filledExams })
    }

    // ── REGULAR mode ──────────────────────────────────────────────────────────
    if (mode === 'regular') {
      if (!student.subjects || !student.subjects.length) {
        return res.status(400).json({ error: 'Regular mode requires at least one subject' })
      }

      const userMessage = `
Student name: ${studentName}
Subjects: ${student.subjects.join(', ')}
Hours available per day: ${student.hoursPerDay}
Skill level: ${student.skillLevel || 'Beginner'}
Today's date: ${today}
Plan duration: 28 days

Please create a 28-day continuous learning plan for this student.
Focus on progressive skill building, not exam pressure.
      `.trim()

      aiResponse = await askAI(regularPlannerPrompt, userMessage)
      parsed     = JSON.parse(aiResponse)

      return res.json({ success: true, plan: parsed.plan })
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}. Use "exam" or "regular".` })

  } catch (err) {
    console.error('[/study-plan]', err.message)
    res.status(500).json({ error: 'Failed to generate study plan. Please try again.' })
  }
})

// ─── POST /api/quiz ───────────────────────────────────────────────────────────
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
// Evaluates answers via AI only. Frontend handles saving quiz results to localStorage.
router.post('/evaluate', async (req, res) => {
  try {
    const { questions, studentAnswers, studentName } = req.body

    if (!questions || !studentAnswers) {
      return res.status(400).json({ error: 'questions and studentAnswers are required' })
    }

    const pairs = questions.map(q => ({
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

    // Generate motivation
    const motivMsg = `
Student name: ${studentName || 'Student'}
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


// ─── POST /api/chat ───────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    const systemPrompt = `You are Mentora, a helpful AI study mentor for students.
Your job is to help students learn, understand topics, and prepare for exams.

When asked for resources or how to learn a topic, respond with:
- 📌 A brief overview of the topic (2-3 sentences)
- 🔑 3-5 key concepts to understand
- 📚 2-3 recommended free resources (name them clearly, e.g. "Khan Academy", "MDN Docs", "GeeksForGeeks", YouTube channels, etc.)
- 💡 2-3 practical study tips specific to the topic

For general study questions, keep answers concise and actionable.
If the question is completely unrelated to studying or education, politely redirect the student back to their studies.
Use **bold** for important terms and \`code\` for code snippets when relevant.`

    const reply = await askAI(systemPrompt, message)
    res.json({ success: true, reply })

  } catch (err) {
    console.error('[/chat]', err.message)
    res.status(500).json({ error: 'Failed to get response. Please try again.' })
  }
})

export default router
