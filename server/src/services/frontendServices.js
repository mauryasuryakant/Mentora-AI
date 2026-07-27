/**
 * Pure Browser-Native Frontend Services for Mentora AI
 * Replaces Express backend endpoints with client-side generation engines.
 */

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function addDaysSkippingSundays(dateStr, days) {
  const d = new Date(dateStr)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) added++ // 0 = Sunday
  }
  return d.toISOString().split('T')[0]
}

function assignMissingDates(exams) {
  const known = exams.filter(e => e.date).sort((a, b) => a.date.localeCompare(b.date))
  const missing = exams.filter(e => !e.date)

  if (!missing.length) return exams

  let anchor = known.length
    ? known[known.length - 1].date
    : new Date().toISOString().split('T')[0]

  for (const exam of missing) {
    anchor = addDaysSkippingSundays(anchor, 1)
    exam.date = anchor
  }

  return exams
}

function formatLocalDate(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getNextDateStr(startDateStr, daysToAdd) {
  const d = new Date(startDateStr)
  d.setDate(d.getDate() + daysToAdd)
  return formatLocalDate(d)
}

// ─── Study Plan Generator ──────────────────────────────────────────────────────

const TOPIC_LIBRARY = {
  default: [
    ['Foundations & Core Principles', 'Terminology & Definitions'],
    ['Primary Models & Frameworks', 'Key Rules & Properties'],
    ['Problem Solving Strategies', 'Standard Examples'],
    ['Intermediate Concepts', 'Comparative Analysis'],
    ['Common Pitfalls & Errors', 'Formula & Code Patterns'],
    ['Advanced Techniques', 'Complex Case Studies'],
    ['Comprehensive Review', 'Mock Exam Practice']
  ]
}

function getTopicsForSubject(subject, phaseIndex) {
  const cleanSub = subject.trim()
  const subLower = cleanSub.toLowerCase()

  if (subLower.includes('python') || subLower.includes('programming') || subLower.includes('coding') || subLower.includes('computer')) {
    const pythonPhases = [
      ['Variables, Data Types & Inputs', 'Control Flow (if/else, loops)'],
      ['Functions, Scope & Modules', 'Lists, Dictionaries & Tuples'],
      ['Object-Oriented Programming', 'File I/O & Error Handling'],
      ['Data Structures & Algorithms', 'Debugging & Optimization'],
      ['API Integration & Libraries', 'Asynchronous Programming'],
      ['Testing & Clean Code Patterns', 'Project Architecture'],
      ['Full Module Review', 'Coding Exercises & Practice']
    ]
    return pythonPhases[phaseIndex % pythonPhases.length].map(t => `${cleanSub}: ${t}`)
  }

  if (subLower.includes('math') || subLower.includes('calculus') || subLower.includes('algebra')) {
    const mathPhases = [
      ['Core Formulas & Definitions', 'Basic Simplification & Proofs'],
      ['Equation Solving Techniques', 'Graphing & Visual Analysis'],
      ['Intermediate Theorems', 'Step-by-Step Problem Solving'],
      ['Complex Problem Sets', 'Application to Real Scenarios'],
      ['Advanced Identities & Properties', 'Speed & Accuracy Training'],
      ['Tricky Edge Cases', 'Multi-step Problem Solving'],
      ['Comprehensive Formula Review', 'Full Exam Simulation']
    ]
    return mathPhases[phaseIndex % mathPhases.length].map(t => `${cleanSub}: ${t}`)
  }

  if (subLower.includes('physics') || subLower.includes('chemistry') || subLower.includes('biology') || subLower.includes('science')) {
    const sciencePhases = [
      ['Fundamental Laws & Key Terms', 'System Units & Variables'],
      ['Core Equations & Derivations', 'Diagram & Structure Analysis'],
      ['Experimental Setup & Methods', 'Quantitative Analysis'],
      ['Conceptual Questions & Cases', 'Process Workflows'],
      ['Advanced Systems & Interactions', 'Data Interpretation'],
      ['Synthesis & Critical Analysis', 'Numerical Problem Solving'],
      ['Key Diagram & Formula Review', 'Past Paper Practice']
    ]
    return sciencePhases[phaseIndex % sciencePhases.length].map(t => `${cleanSub}: ${t}`)
  }

  const defaultPhases = TOPIC_LIBRARY.default
  const selected = defaultPhases[phaseIndex % defaultPhases.length]
  return selected.map(t => `${cleanSub} - ${t}`)
}

export function generateStudyPlan({ mode, student, exams }) {
  const today = formatLocalDate(new Date())

  if (mode === 'exam') {
    if (!exams || !Array.isArray(exams) || exams.length === 0) {
      throw new Error('Exam mode requires at least one exam')
    }

    for (const exam of exams) {
      if (exam.date && exam.date < today) {
        throw new Error(`Exam date for "${exam.subject || 'Subject'}" (${exam.date}) cannot be in the past.`)
      }
    }

    const filledExams = assignMissingDates(exams.map(e => ({ ...e })))
    filledExams.sort((a, b) => a.date.localeCompare(b.date))

    const lastExamDate = filledExams[filledExams.length - 1].date
    const totalDays = Math.max(1, Math.ceil((new Date(lastExamDate) - new Date(today)) / (1000 * 60 * 60 * 24)) + 1)

    const plan = []

    for (let i = 0; i < totalDays; i++) {
      const dayNum = i + 1
      const currentDate = getNextDateStr(today, i)

      const activeExams = filledExams.filter(e => e.date >= currentDate)

      if (!activeExams.length) {
        break
      }

      const upcomingImminent = activeExams.find(e => {
        const diffDays = Math.ceil((new Date(e.date) - new Date(currentDate)) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 2
      })

      const targetExam = upcomingImminent || activeExams[i % activeExams.length]
      const diffDays = Math.ceil((new Date(targetExam.date) - new Date(currentDate)) / (1000 * 60 * 60 * 24))

      let type = 'study'
      let goal = `Study key topics for ${targetExam.subject}`

      if (diffDays === 0) {
        type = 'quiz_prep'
        goal = `Final Exam Day: ${targetExam.subject} (${targetExam.name})`
      } else if (diffDays <= 2) {
        type = 'revision'
        goal = `Focused revision for upcoming ${targetExam.subject} exam`
      } else if (i % 4 === 3) {
        type = 'practice'
        goal = `Practice questions & problem solving for ${targetExam.subject}`
      }

      const topics = getTopicsForSubject(targetExam.subject, i)

      plan.push({
        day: dayNum,
        date: currentDate,
        subject: targetExam.subject,
        topics,
        goal,
        type
      })
    }

    return { success: true, plan, exams: filledExams }
  }

  if (mode === 'regular') {
    if (!student || !student.subjects || !student.subjects.length) {
      throw new Error('Regular mode requires at least one subject')
    }

    const subjects = student.subjects
    const plan = []
    const totalDays = 28

    for (let i = 0; i < totalDays; i++) {
      const dayNum = i + 1
      const currentDate = getNextDateStr(today, i)
      const weekNum = Math.floor(i / 7) + 1
      const dayInWeek = (i % 7) + 1
      const currentSubject = subjects[i % subjects.length]

      let type = 'study'
      let goal = `Learn & practice concepts in ${currentSubject}`

      if (dayInWeek === 7) {
        type = 'review'
        goal = `Week ${weekNum} review & comprehensive assessment`
      } else if (dayInWeek === 4) {
        type = 'practice'
        goal = `Hands-on practice & exercises for ${currentSubject}`
      } else if (dayInWeek === 6) {
        type = 'quiz'
        goal = `Self-assessment quiz on ${currentSubject}`
      }

      const topics = getTopicsForSubject(currentSubject, Math.floor(i / subjects.length))

      plan.push({
        day: dayNum,
        date: currentDate,
        subject: currentSubject,
        topics,
        goal,
        type,
        week: weekNum
      })
    }

    return { success: true, plan }
  }

  throw new Error(`Unknown mode: ${mode}`)
}

// ─── Quiz Generator ────────────────────────────────────────────────────────────

export function generateQuiz({ topics, questionCount = 5 }) {
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    throw new Error('topics must be a non-empty array')
  }

  const questions = []
  const types = ['multiple_choice', 'true_false', 'short_answer']

  for (let i = 0; i < questionCount; i++) {
    const topic = topics[i % topics.length]
    const type = types[i % types.length]
    const id = i + 1

    if (type === 'multiple_choice') {
      questions.push({
        id,
        type: 'multiple_choice',
        topic,
        question: `Which statement best describes the core principle of "${topic}"?`,
        options: [
          `It is a foundational method for structuring and solving problems in ${topic}.`,
          `It is a secondary cosmetic tool used only for formatting.`,
          `It represents an outdated approach that is no longer recommended.`,
          `It applies exclusively to theoretical research without practical application.`
        ],
        answer: `It is a foundational method for structuring and solving problems in ${topic}.`
      })
    } else if (type === 'true_false') {
      questions.push({
        id,
        type: 'true_false',
        topic,
        question: `True or False: Mastering "${topic}" requires understanding both foundational concepts and practical application.`,
        answer: 'True'
      })
    } else {
      questions.push({
        id,
        type: 'short_answer',
        topic,
        question: `In 1-2 sentences, explain why "${topic}" is important in this subject.`,
        answer: `${topic} provides essential principles that enable efficient problem solving and clear understanding of core concepts.`
      })
    }
  }

  return { success: true, questions }
}

// ─── Quiz Evaluation & Motivation ─────────────────────────────────────────────

export function evaluateQuiz({ questions, studentAnswers, studentName = 'Student' }) {
  if (!questions || !studentAnswers) {
    throw new Error('questions and studentAnswers are required')
  }

  let score = 0
  const total = questions.length
  const results = []
  const weakTopics = new Set()

  questions.forEach(q => {
    const studentAns = (studentAnswers[q.id] || '').trim()
    const correctAns = (q.answer || '').trim()
    let isCorrect = false

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase()
    } else {
      isCorrect = studentAns.length >= 3
    }

    if (isCorrect) {
      score++
    } else {
      weakTopics.add(q.topic)
    }

    results.push({
      id: q.id,
      correct: isCorrect,
      studentAnswer: studentAns,
      correctAnswer: correctAns,
      explanation: isCorrect
        ? `Great job! Your answer accurately reflects the key concept of ${q.topic}.`
        : `Review required: The correct answer for ${q.topic} is "${correctAns}".`
    })
  })

  const percentage = Math.round((score / total) * 100)
  const weakTopicsArray = Array.from(weakTopics)

  let summary = ''
  if (percentage >= 80) {
    summary = 'Outstanding performance! You showed strong mastery across all tested topics.'
  } else if (percentage >= 50) {
    summary = 'Good effort! You have a solid grasp of most topics, with a few areas to polish.'
  } else {
    summary = 'Keep pushing forward! Reviewing the weak topics will boost your confidence for the next test.'
  }

  let motivation = ''
  if (percentage >= 80) {
    motivation = `Fantastic work, ${studentName}! Your strong score in ${questions.map(q => q.topic).slice(0, 2).join(', ')} proves your effort is paying off. Ready for the next challenge?`
  } else if (percentage >= 50) {
    motivation = `Solid effort today, ${studentName}! You did well overall. A quick review of ${weakTopicsArray.join(', ') || 'the key topics'} will make your next quiz a breeze.`
  } else {
    motivation = `Every study session is progress, ${studentName}. Taking on ${questions.map(q => q.topic).slice(0, 2).join(', ')} takes practice — review the explanations and try again!`
  }

  const evaluation = {
    score,
    total,
    percentage,
    results,
    weakTopics: weakTopicsArray,
    summary
  }

  return { success: true, evaluation, motivation }
}

// ─── AI Mentor Chat Assistant ──────────────────────────────────────────────────

export function mentorChat({ message }) {
  if (!message) {
    throw new Error('message is required')
  }

  const query = message.trim()
  const lower = query.toLowerCase()

  let reply = ''

  if (lower.includes('recursion') || lower.includes('recursive')) {
    reply = `📌 **Overview of Recursion**
Recursion is a programming and mathematical technique where a function calls itself to solve a smaller instance of the same problem.

🔑 **Key Concepts to Understand**
- **Base Case**: The stopping condition that prevents infinite loops.
- **Recursive Step**: Reducing the problem into smaller sub-problems.
- **Call Stack**: How memory tracks function calls execution order.

📚 **Recommended Free Resources**
- **Khan Academy**: Introduction to Algorithms & Recursion
- **MDN Web Docs**: Functions and Call Stacks
- **FreeCodeCamp YouTube Channel**: Recursion Visualized

💡 **Practical Study Tips**
1. Always write down the **base case** first before coding.
2. Draw the call stack tree on paper for a small input (e.g. factorial of 3).`
  } else if (lower.includes('complexity') || lower.includes('big o')) {
    reply = `📌 **Overview of Time & Space Complexity**
Time complexity measures how runtime grows with input size (N), while space complexity measures memory usage growth.

🔑 **Key Concepts to Understand**
- **O(1) Constant**: Execution time stays the same regardless of N.
- **O(N) Linear**: Time grows proportionally with input size.
- **O(N²) Quadratic**: Nested loops over the input data.

📚 **Recommended Free Resources**
- **Big-O Cheat Sheet**: Visual comparison charts
- **GeeksforGeeks**: Analysis of Algorithms Tutorial
- **CS50 (Harvard YouTube)**: Algorithmic Efficiency

💡 **Practical Study Tips**
1. Count how many times your core loops execute.
2. Focus on worst-case scenarios for reliable code design.`
  } else if (lower.includes('effectively') || lower.includes('study tip') || lower.includes('how to study')) {
    reply = `📌 **Overview of Effective Study Methods**
Scientific research shows that active learning techniques yield much higher retention than passive reading.

🔑 **Key Concepts to Understand**
- **Active Recall**: Testing yourself rather than re-reading notes.
- **Spaced Repetition**: Reviewing material at increasing time intervals.
- **Feynman Technique**: Explaining concepts in simple plain English.

📚 **Recommended Free Resources**
- **Ali Abdaal (YouTube)**: Evidence-based study techniques
- **Anki**: Open-source flashcard app built on spaced repetition

💡 **Practical Study Tips**
1. Use 25-minute Pomodoro study intervals with 5-minute breaks.
2. Solve practice quizzes immediately after reading a topic.`
  } else {
    reply = `📌 **Overview: ${query}**
Studying **${query}** effectively involves breaking down complex terms into manageable core concepts and practicing active problem solving.

🔑 **Key Concepts to Understand**
- **Core Definition**: Understanding the fundamental terminology and rules.
- **Practical Application**: Solving real-world exercises and examples.
- **Common Mistakes**: Identifying tricky edge cases and frequent errors.

📚 **Recommended Free Resources**
- **Khan Academy**: Free interactive courses and video tutorials
- **MDN Web Docs & GeeksForGeeks**: Comprehensive explanations and guides
- **YouTube Education**: Visual walk-throughs and step-by-step demos

💡 **Practical Study Tips**
1. Summarize key ideas in your own words right after studying.
2. Take a quick quiz on Mentora AI to test your understanding!`
  }

  return { success: true, reply }
}
