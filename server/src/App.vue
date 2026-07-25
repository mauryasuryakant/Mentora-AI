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
  width: 42px;
  height: 42px;
  min-width: 42px;
  min-height: 42px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.hamburger-icon {
  font-size: 1.35rem;
  line-height: 1;
}
.hamburger-btn:hover, .hamburger-btn:active {
  background: rgba(108, 99, 255, 0.25);
  border-color: var(--primary);
  transform: scale(1.05);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  background: rgba(20, 23, 33, 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.85rem 1rem 1.15rem;
  gap: 0.5rem;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
}
.mobile-menu a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  min-height: 48px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  touch-action: manipulation;
}
.mobile-menu a:hover, .mobile-menu a:active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}
.mobile-menu a.router-link-exact-active {
  background: var(--grad-primary);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.35);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  min-height: 40px;
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
  touch-action: manipulation;
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
