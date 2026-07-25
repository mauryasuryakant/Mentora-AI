<template>
  <div class="home">
    <!-- Background Glow Orbs -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>

    <div class="hero-container">
      <!-- Top Badge -->
      <div class="hero-badge">
        <span class="badge-dot"></span>
        <span>Next-Gen AI Study Mentor</span>
      </div>

      <!-- Main Headline -->
      <h1 class="hero-title">
        Master Any Subject Faster With
        <span class="gradient-text">Mentora AI</span>
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

/* ── Ambient Background Glows ── */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  pointer-events: none;
  opacity: 0.35;
}
.orb-1 {
  width: 380px;
  height: 380px;
  background: var(--primary);
  top: -80px;
  left: 50%;
  transform: translateX(-80%);
  animation: float-slow 12s ease-in-out infinite alternate;
}
.orb-2 {
  width: 320px;
  height: 320px;
  background: var(--accent);
  top: 60px;
  left: 50%;
  transform: translateX(-10%);
  animation: float-slow 14s ease-in-out infinite alternate-reverse;
}
@keyframes float-slow {
  0%   { transform: translate(-70%, 0) scale(1); }
  100% { transform: translate(-30%, 40px) scale(1.15); }
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
  padding: 0.4rem 0.9rem;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.3);
  border-radius: 999px;
  color: #a29bfe;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 1rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.15);
}
.badge-dot {
  width: 7px;
  height: 7px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}

/* ── Typography ── */
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 0.85rem;
  color: var(--text);
}

.gradient-text {
  background: linear-gradient(135deg, #a8a2ff 0%, var(--primary) 40%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  filter: drop-shadow(0 2px 16px rgba(108, 99, 255, 0.25));
}

.hero-sub {
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: var(--text-muted);
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
  padding: 0.85rem 2.2rem;
  background: linear-gradient(135deg, var(--primary), #574fd6);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 999px;
  text-decoration: none;
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.45);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.cta-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}
.cta-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(108, 99, 255, 0.65);
}
.cta-btn:hover::before {
  left: 100%;
}
.cta-btn:active {
  transform: translateY(-1px) scale(0.99);
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
  padding: 0.45rem 0.9rem;
  background: rgba(26, 29, 39, 0.7);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.82rem;
  color: var(--text-muted);
  backdrop-filter: blur(6px);
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
}
.pill:hover {
  border-color: rgba(108, 99, 255, 0.4);
  color: var(--text);
  transform: translateY(-2px);
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
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.8rem;
  color: var(--text-muted);
}
@media (max-width: 600px) {
  .hero-footer {
    flex-direction: column;
    text-align: center;
    gap: 0.4rem;
  }
}
.footer-stat strong {
  color: var(--text);
}
.sdg-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  background: rgba(0, 201, 167, 0.08);
  border: 1px solid rgba(0, 201, 167, 0.2);
  border-radius: 8px;
  color: var(--text-muted);
}
.sdg-tag strong {
  color: var(--accent);
}
</style>
