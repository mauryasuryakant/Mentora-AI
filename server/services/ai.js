import Groq from 'groq-sdk'
import dotenv from 'dotenv'

dotenv.config()

// ─── Single place to configure the AI provider ───────────────────────────────
// Swap this file out if you switch from Groq to OpenAI / Gemini / etc.

const groq = new Groq({ apiKey: process.env.GROQ })

const MODEL = 'llama-3.3-70b-versatile'

/**
 * Send a prompt to the AI and get a text response back.
 * @param {string} systemPrompt  - The system/role instruction
 * @param {string} userMessage   - The user content
 * @returns {Promise<string>}    - The AI's text reply
 */
export async function askAI(systemPrompt, userMessage) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  })

  return response.choices[0].message.content.trim()
}
