<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand" @click="closeMobileMenu()">🎓 Mentora AI</RouterLink>

      <!-- Show nav links only when user has an active plan (Desktop) -->
      <div class="nav-links desktop-only" v-if="hasSetup">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/study-plan">Plan</RouterLink>
        <RouterLink to="/quiz">Quiz</RouterLink>
        <RouterLink to="/progress">Progress</RouterLink>
      </div>

      <!-- Actions: AI Chat button + Hamburger Menu Button (Mobile) -->
      <div class="nav-actions">
        <button
          id="open-ai-chat"
          class="nav-ai-btn"
          @click="openChat()"
          title="Chat with Mentora AI"
        >
          <span class="nav-ai-dot"></span>
          🤖 AI
        </button>

        <button
          v-if="hasSetup"
          class="hamburger-btn mobile-only"
          @click="toggleMobileMenu()"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <span v-if="!mobileMenuOpen" class="hamburger-icon">☰</span>
          <span v-else class="hamburger-icon">✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <Transition name="slide-down">
      <div class="mobile-menu" v-if="hasSetup && mobileMenuOpen">
        <RouterLink to="/" @click="closeMobileMenu()">📊 Dashboard</RouterLink>
        <RouterLink to="/study-plan" @click="closeMobileMenu()">📅 Study Plan</RouterLink>
        <RouterLink to="/quiz" @click="closeMobileMenu()">📝 Quizzes</RouterLink>
        <RouterLink to="/progress" @click="closeMobileMenu()">📈 Progress</RouterLink>
      </div>
    </Transition>
  </nav>

  <RouterView :key="$route.fullPath" />

  <!-- Global AI Chat Panel -->
  <AiChat
    :open="chatOpen"
    :initial-message="chatInitialMessage"
    @close="closeChat"
  />
</template>

<script setup>
import { ref, provide, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AiChat from './components/AiChat.vue'
import { hasActivePlan } from './storage.js'

const route = useRoute()

// Re-check on every route change so the nav updates after setup
const hasSetup = computed(() => {
  // Reading route.fullPath forces this to recompute on navigation
  void route.fullPath
  return hasActivePlan()
})

const chatOpen           = ref(false)
const chatInitialMessage = ref('')
const mobileMenuOpen     = ref(false)

function openChat(msg = '') {
  chatInitialMessage.value = msg
  chatOpen.value = true
}
function closeChat() {
  chatOpen.value = false
  chatInitialMessage.value = ''
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
function closeMobileMenu() {
  mobileMenuOpen.value = false
}

// Automatically close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Allow any child view to open the AI chat with an optional prefilled message
provide('openAiChat', openChat)
</script>

<style scoped>
/* Nav handled in global style.css */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.hamburger-btn {
  display: none;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.hamburger-icon {
  font-size: 1.25rem;
  line-height: 1;
}
.hamburger-btn:hover, .hamburger-btn:active {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  background: var(--surface-elevated);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 0.85rem 1rem 1.15rem;
  gap: 0.5rem;
  box-shadow: var(--shadow-lg);
}
.mobile-menu a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  min-height: 44px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--border);
  transition: background-color 0.15s ease, color 0.15s ease;
  text-decoration: none;
  touch-action: manipulation;
}
.mobile-menu a:hover, .mobile-menu a:active {
  color: var(--text-primary);
  background: var(--surface-hover);
}
.mobile-menu a.router-link-exact-active {
  background: var(--surface-active);
  color: var(--text-primary);
  border-color: var(--primary-border);
  font-weight: 600;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  max-height: 320px;
  opacity: 1;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  min-height: 36px;
  background: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid var(--primary-hover);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  flex-shrink: 0;
  touch-action: manipulation;
}
.nav-ai-btn:hover {
  background: var(--primary-hover);
  border-color: var(--primary-active);
}
.nav-ai-dot {
  width: 6px; height: 6px;
  background: #a5b4fc;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.8); }
}
</style>
