<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="open" class="chat-backdrop" @click="$emit('close')" />
  </Transition>

  <!-- Panel -->
  <Transition name="slide">
    <div v-if="open" class="chat-panel" role="dialog" aria-label="AI Study Assistant">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="ai-avatar">🤖</div>
          <div>
            <div class="chat-title">Mentora AI</div>
            <div class="chat-subtitle">Your personal study mentor</div>
          </div>
        </div>
        <button class="chat-close" @click="$emit('close')" aria-label="Close chat">✕</button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesEl">
        <!-- Welcome -->
        <div v-if="!messages.length" class="chat-welcome">
          <div class="chat-welcome-icon">✨</div>
          <p>Hi! I'm Mentora, your AI study mentor. Ask me anything about your studies!</p>
          <div class="chat-suggestions">
            <button
              v-for="s in suggestions"
              :key="s"
              class="chip"
              @click="sendSuggestion(s)"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Message bubbles -->
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="msg-row"
          :class="msg.role"
        >
          <div class="msg-avatar" v-if="msg.role === 'ai'">🤖</div>
          <div class="msg-bubble" :class="msg.role">
            <div class="msg-text" v-html="formatMessage(msg.text)"></div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
          <div class="msg-avatar user-avatar" v-if="msg.role === 'user'">👤</div>
        </div>

        <!-- Loading bubble -->
        <div v-if="loading" class="msg-row ai">
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble ai">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="error" class="chat-error">⚠️ {{ error }}</div>

      <!-- Input -->
      <div class="chat-input-area">
        <textarea
          ref="inputEl"
          v-model="inputText"
          class="chat-input"
          placeholder="Ask about any topic… (Enter to send)"
          rows="1"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        />
        <button
          class="chat-send"
          :disabled="!inputText.trim() || loading"
          @click="send"
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { api } from '../api/index.js'

const props = defineProps({
  open: Boolean,
  /** Optional pre-filled message sent automatically (e.g. from "Resources" button) */
  initialMessage: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close'])

const messages   = ref([])
const inputText  = ref('')
const loading    = ref(false)
const error      = ref('')
const messagesEl = ref(null)
const inputEl    = ref(null)

const suggestions = [
  'Explain recursion simply',
  'What is time complexity?',
  'How to study effectively?',
  'Tips for exam preparation',
]

// When panel opens with an initial message, auto-send it
watch(() => props.open, async (val) => {
  if (val) {
    await nextTick()
    if (props.initialMessage) {
      inputText.value = props.initialMessage
      await nextTick()
      send()
    } else {
      inputEl.value?.focus()
    }
  }
})

// Re-trigger if initialMessage changes while panel is open
watch(() => props.initialMessage, async (val) => {
  if (props.open && val) {
    inputText.value = val
    await nextTick()
    send()
  }
})

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', text, time: now() })
  inputText.value = ''
  error.value = ''
  loading.value = true
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
  }
  scrollToBottom()

  try {
    const data = await api.chat({ message: text })
    messages.value.push({ role: 'ai', text: data.reply, time: now() })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function sendSuggestion(s) {
  inputText.value = s
  send()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function autoResize() {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px'
}

/** Minimal markdown-like formatting: **bold**, `code`, newlines */
function formatMessage(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
/* ── Backdrop ── */
.chat-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 299;
}

/* ── Panel ── */
.chat-panel {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 400px;
  max-width: calc(100vw - 2rem);
  height: 600px;
  max-height: 82vh;
  background: rgba(22, 25, 35, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(108, 99, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 300;
}

/* ── Header ── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(108,99,255,0.25) 0%, rgba(0,201,167,0.12) 100%);
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 0.85rem; }
.ai-avatar {
  width: 40px; height: 40px;
  background: var(--grad-text);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.4);
}
.chat-title   { font-weight: 800; font-size: 1rem; color: #fff; letter-spacing: 0.02em; }
.chat-subtitle { font-size: 0.72rem; color: #a29bfe; font-weight: 600; }
.chat-close {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-muted);
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.chat-close:hover { background: rgba(255,83,112,0.2); border-color: var(--danger); color: #fff; transform: rotate(90deg); }

/* ── Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth;
}

/* Welcome state */
.chat-welcome {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.chat-welcome-icon { font-size: 2.5rem; margin-bottom: 0.75rem; filter: drop-shadow(0 4px 12px rgba(108,99,255,0.3)); }
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 1.25rem;
}
.chip {
  background: rgba(108,99,255,0.12);
  border: 1px solid rgba(108,99,255,0.3);
  color: #c3bdff;
  border-radius: 999px;
  padding: 0.4rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.chip:hover { background: var(--primary); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(108,99,255,0.4); }

/* Message rows */
.msg-row {
  display: flex;
  gap: 0.65rem;
  align-items: flex-end;
  animation: fadeInMsg 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 30px; height: 30px;
  flex-shrink: 0;
  background: var(--grad-primary);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.user-avatar { background: var(--grad-accent); color: #0f1117; font-weight: 800; }

.msg-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.6;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.msg-bubble.ai {
  background: rgba(35, 38, 54, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 4px;
  color: var(--text);
  backdrop-filter: blur(8px);
}
.msg-bubble.user {
  background: var(--grad-primary);
  border-bottom-right-radius: 4px;
  color: #fff;
  font-weight: 500;
}
.msg-bubble.user .msg-time { color: rgba(255,255,255,0.7); text-align: right; }

.msg-text :deep(code) {
  background: rgba(0,0,0,0.35);
  padding: 0.15em 0.45em;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85em;
  color: #00e5bc;
}
.msg-time {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 5px;
  align-items: center;
  height: 24px;
  padding: 0 0.5rem;
}
.typing-indicator span {
  width: 7px; height: 7px;
  background: var(--accent);
  border-radius: 50%;
  animation: bounce 1s infinite;
  box-shadow: 0 0 8px var(--accent);
}
.typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-8px); }
}

/* ── Error ── */
.chat-error {
  padding: 0.75rem 1.2rem;
  font-size: 0.85rem;
  background: rgba(255,83,112,0.15);
  color: #ff8599;
  border-top: 1px solid rgba(255,83,112,0.3);
  flex-shrink: 0;
  font-weight: 600;
}

/* ── Input Area ── */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  background: rgba(26, 29, 39, 0.7);
  flex-shrink: 0;
  backdrop-filter: blur(12px);
}
.chat-input {
  flex: 1;
  background: rgba(15, 17, 23, 0.8);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.92rem;
  padding: 0.65rem 1rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  font-family: inherit;
  transition: all 0.2s;
  max-height: 120px;
}
.chat-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.25); }
.chat-input::placeholder { color: var(--text-muted); }

.chat-send {
  width: 42px; height: 42px;
  flex-shrink: 0;
  background: var(--grad-primary);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
}
.chat-send:hover:not(:disabled) { transform: scale(1.08) translateY(-2px); box-shadow: 0 6px 20px rgba(108, 99, 255, 0.6); }
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }

/* ── Transitions ── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.slide-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.slide-enter-from   { transform: translateY(40px) scale(0.92); opacity: 0; }
.slide-leave-to     { transform: translateY(20px) scale(0.96); opacity: 0; }
</style>
