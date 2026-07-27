<template>
  <div class="home">
    <div class="hero-container">
      <!-- Top Badge -->
      <div class="hero-badge">
        <span class="badge-dot"></span>
        <span>Next-Gen AI Study Mentor</span>
      </div>

      <!-- Main Headline -->
      <h1 class="hero-title">
        Master Any Subject Faster With
        <span class="headline-accent">Mentora AI</span>
      </h1>

      <!-- Subtitle -->
      <p class="hero-sub">
        Your intelligent personal tutor. Experience custom day-by-day study timetables,
        adaptive quiz generation, and instant feedback — tailored precisely to your schedule.
      </p>

      <!-- Action CTA -->
      <div class="hero-actions">
        <RouterLink to="/setup" class="cta-btn">
          <span>Start Learning Now</span>
          <svg class="cta-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </RouterLink>
      </div>

      <!-- Live Feature Pills -->
      <div class="feature-pills">
        <div class="pill">
          <span class="pill-icon">⚡</span>
          <span>Personalised Timetables</span>
        </div>
        <div class="pill">
          <span class="pill-icon">🧠</span>
          <span>Adaptive AI Quizzes</span>
        </div>
        <div class="pill">
          <span class="pill-icon">🎯</span>
          <span>Instant Weakness Analysis</span>
        </div>
      </div>
    </div>

    <!-- Minimal Footer / SDG Banner -->
    <div class="hero-footer">
      <div class="footer-stat">
        <strong>100% Free & Open</strong> · Powered by Advanced Llama 3 AI
      </div>
      <div class="sdg-tag">
        🌍 Supporting <strong>SDG 4 — Quality Education</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  height: calc(100vh - 54px);
  max-height: calc(100vh - 54px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: 1rem 1.25rem 0.75rem;
}

/* ── Hero Container ── */
.hero-container {
  max-width: 680px;
  margin: auto;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Sleek Badge ── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  background: var(--primary-subtle);
  border: 1px solid var(--primary-border);
  border-radius: 999px;
  color: var(--primary-lt);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: 1rem;
}
.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
}

/* ── Typography ── */
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 0.85rem;
  color: var(--text-primary);
}

.headline-accent {
  color: var(--primary-lt);
  display: inline-block;
}

.hero-sub {
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: var(--text-secondary);
  line-height: 1.65;
  max-width: 580px;
  margin: 0 auto 1.5rem;
}

/* ── CTA Button ── */
.hero-actions {
  margin-bottom: 1.75rem;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 2rem;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 1rem;
  font-weight: 600;
  border-radius: 999px;
  text-decoration: none;
  border: 1px solid var(--primary-hover);
  box-shadow: var(--shadow-sm);
  transition: background-color 0.15s ease, border-color 0.15s ease;
  position: relative;
  overflow: hidden;
}
.cta-btn:hover {
  background: var(--primary-hover);
  border-color: var(--primary-active);
  box-shadow: var(--shadow-md);
}
.cta-btn:active {
  transform: translateY(1px);
}
.cta-icon {
  transition: transform 0.2s ease;
}
.cta-btn:hover .cta-icon {
  transform: translateX(4px);
}

/* ── Feature Pills ── */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  color: var(--text-secondary);
  transition: border-color 0.15s ease, color 0.15s ease;
}
.pill:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}
.pill-icon {
  font-size: 0.95rem;
}

/* ── Footer / SDG Bar ── */
.hero-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-secondary);
}
@media (max-width: 600px) {
  .hero-footer {
    flex-direction: column;
    text-align: center;
    gap: 0.4rem;
  }
}
.footer-stat strong {
  color: var(--text-primary);
}
.sdg-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
}
.sdg-tag strong {
  color: var(--text-primary);
}
</style>
