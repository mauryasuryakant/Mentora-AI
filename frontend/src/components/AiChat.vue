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
  background: rgba(0, 0, 0, 0.6);
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
  background: var(--surface-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 0.85rem; }
.ai-avatar {
  width: 36px; height: 36px;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.chat-title   { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.01em; }
.chat-subtitle { font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; }
.chat-close {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 30px; height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.chat-close:hover { background: var(--danger-subtle); border-color: rgba(239, 68, 68, 0.3); color: var(--danger); }

/* ── Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth;
  background: var(--bg-app);
}

/* Welcome state */
.chat-welcome {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.chat-welcome-icon { font-size: 2.2rem; margin-bottom: 0.75rem; }
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1.25rem;
}
.chip {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  font-family: inherit;
}
.chip:hover { background: var(--surface-hover); border-color: var(--primary-border); color: var(--text-primary); }

/* Message rows */
.msg-row {
  display: flex;
  gap: 0.65rem;
  align-items: flex-end;
  animation: fadeInMsg 0.2s ease;
}
@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px; height: 28px;
  flex-shrink: 0;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
}
.user-avatar { background: var(--surface-active); color: var(--text-primary); font-weight: 700; border: 1px solid var(--border-hover); }

.msg-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}
.msg-bubble.ai {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  color: var(--text-primary);
}
.msg-bubble.user {
  background: var(--primary);
  border-bottom-right-radius: 4px;
  color: var(--primary-foreground);
  font-weight: 500;
}
.msg-bubble.user .msg-time { color: rgba(255,255,255,0.7); text-align: right; }

.msg-text :deep(code) {
  background: var(--surface);
  padding: 0.15em 0.45em;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85em;
  color: var(--primary-lt);
  border: 1px solid var(--border);
}
.msg-time {
  font-size: 0.68rem;
  color: var(--text-tertiary);
  margin-top: 0.35rem;
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
  width: 6px; height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: bounce 1s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-6px); }
}

/* ── Error ── */
.chat-error {
  padding: 0.75rem 1.2rem;
  font-size: 0.85rem;
  background: var(--danger-subtle);
  color: #fca5a5;
  border-top: 1px solid rgba(239, 68, 68, 0.3);
  flex-shrink: 0;
  font-weight: 600;
}

/* ── Input Area ── */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  padding: 0.6rem 0.85rem;
  resize: none;
  outline: none;
  line-height: 1.4;
  font-family: inherit;
  transition: border-color 0.15s ease;
  max-height: 120px;
}
.chat-input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25); }
.chat-input::placeholder { color: var(--text-tertiary); }

.chat-send {
  width: 38px; height: 38px;
  min-width: 38px; min-height: 38px;
  flex-shrink: 0;
  background: var(--primary);
  border: 1px solid var(--primary-hover);
  border-radius: var(--radius-sm);
  color: var(--primary-foreground);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  touch-action: manipulation;
}
.chat-send:hover:not(:disabled) { background: var(--primary-hover); }
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Transitions ── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.slide-leave-active { transition: transform 0.2s ease, opacity 0.15s ease; }
.slide-enter-from   { transform: translateY(20px); opacity: 0; }
.slide-leave-to     { transform: translateY(15px); opacity: 0; }

@media (max-width: 600px) {
  .chat-panel {
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
  .chat-header {
    padding: 0.9rem 1rem;
  }
  .chat-input-area {
    padding: 0.75rem 1rem;
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  }
  .chat-input {
    font-size: 16px !important;
  }
}
</style>
