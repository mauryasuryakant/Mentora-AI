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
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 299;
}

/* ── Panel ── */
.chat-panel {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  width: 380px;
  max-width: calc(100vw - 2rem);
  max-height: 82vh;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.55);
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
  background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.08));
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 0.75rem; }
.ai-avatar {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.chat-title   { font-weight: 700; font-size: 0.95rem; color: var(--text); }
.chat-subtitle { font-size: 0.7rem; color: var(--text-muted); }
.chat-close {
  background: rgba(255,255,255,0.06);
  border: none;
  color: var(--text-muted);
  width: 30px; height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.chat-close:hover { background: rgba(255,83,112,0.15); color: var(--danger); }

/* ── Messages ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scroll-behavior: smooth;
}

/* Welcome state */
.chat-welcome {
  text-align: center;
  padding: 1.5rem 0.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}
.chat-welcome-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}
.chip {
  background: rgba(108,99,255,0.1);
  border: 1px solid rgba(108,99,255,0.25);
  color: var(--primary);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.chip:hover { background: rgba(108,99,255,0.22); }

/* Message rows */
.msg-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px; height: 28px;
  flex-shrink: 0;
  background: rgba(108,99,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
}
.user-avatar { background: rgba(0,201,167,0.15); }

.msg-bubble {
  max-width: 78%;
  padding: 0.65rem 0.9rem;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.55;
}
.msg-bubble.ai {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  color: var(--text);
}
.msg-bubble.user {
  background: linear-gradient(135deg, var(--primary), #8b82ff);
  border-bottom-right-radius: 4px;
  color: #fff;
}
.msg-bubble.user .msg-time { color: rgba(255,255,255,0.6); }

.msg-text :deep(code) {
  background: rgba(0,0,0,0.25);
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.82em;
}
.msg-time {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}
.typing-indicator span {
  width: 6px; height: 6px;
  background: var(--primary);
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
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  background: rgba(255,83,112,0.1);
  color: var(--danger);
  border-top: 1px solid rgba(255,83,112,0.2);
  flex-shrink: 0;
}

/* ── Input Area ── */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  background: var(--bg-input);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.875rem;
  padding: 0.55rem 0.85rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  font-family: inherit;
  transition: border-color 0.2s;
  max-height: 120px;
}
.chat-input:focus { border-color: var(--primary); }
.chat-input::placeholder { color: var(--text-muted); }

.chat-send {
  width: 38px; height: 38px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), #8b82ff);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.15s;
}
.chat-send:hover:not(:disabled) { opacity: 0.88; transform: scale(1.06); }
.chat-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* ── Transitions ── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.slide-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease; }
.slide-leave-active { transition: transform 0.22s ease, opacity 0.2s ease; }
.slide-enter-from   { transform: translateY(30px) scale(0.95); opacity: 0; }
.slide-leave-to     { transform: translateY(20px) scale(0.97); opacity: 0; }
</style>
