<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand">🎓 Mentora AI</RouterLink>
      <div class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/study-plan">Plan</RouterLink>
        <RouterLink to="/quiz">Quiz</RouterLink>
        <RouterLink to="/progress">Progress</RouterLink>
      </div>
      <!-- AI Chat button -->
      <button
        id="open-ai-chat"
        class="nav-ai-btn"
        @click="openChat()"
        title="Chat with Mentora AI"
      >
        <span class="nav-ai-dot"></span>
        🤖 AI
      </button>
    </div>
  </nav>

  <RouterView />

  <!-- Global AI Chat Panel -->
  <AiChat
    :open="chatOpen"
    :initial-message="chatInitialMessage"
    @close="closeChat"
  />
</template>

<script setup>
import { ref, provide } from 'vue'
import AiChat from './components/AiChat.vue'

const chatOpen           = ref(false)
const chatInitialMessage = ref('')

function openChat(msg = '') {
  chatInitialMessage.value = msg
  chatOpen.value = true
}
function closeChat() {
  chatOpen.value = false
  chatInitialMessage.value = ''
}

// Allow any child view to open the AI chat with an optional prefilled message
provide('openAiChat', openChat)
</script>

<style scoped>
/* Nav handled in global style.css */
.nav-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, var(--primary), #8b82ff);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(108,99,255,0.35);
  position: relative;
  flex-shrink: 0;
}
.nav-ai-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(108,99,255,0.5);
}
.nav-ai-dot {
  width: 7px; height: 7px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}
</style>
