<template>
  <div class="home">
    <div class="hero">
      <div class="hero-emoji">🎓</div>
      <h1>Meet <span class="highlight">Mentora AI</span></h1>
      <p class="hero-sub">
        Your personal AI study mentor. Build a smart study plan, take
        targeted quizzes, and track your progress — all powered by AI.
      </p>
      <div class="hero-actions">
        <RouterLink to="/setup" class="btn btn-primary">Get Started →</RouterLink>
        <RouterLink to="/dashboard" class="btn btn-outline">My Dashboard</RouterLink>
      </div>
    </div>

    <div class="features container">
      <div class="feature-card card">
        <div class="feature-icon">📅</div>
        <h3>Smart Study Plan</h3>
        <p>AI builds a day-by-day plan tailored to your exam date and available hours.</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">📝</div>
        <h3>Adaptive Quizzes</h3>
        <p>MCQ, True/False, and Short Answer questions generated from today's topics.</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">✅</div>
        <h3>Instant Evaluation</h3>
        <p>Get your score, explanations, and a clear list of weak topics to revisit.</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">📊</div>
        <h3>Progress Tracking</h3>
        <p>See your improvement over time, quiz history, and areas that need more work.</p>
      </div>
    </div>

    <div class="sdg-banner">
      <span>🌍 Supporting <strong>SDG 4 — Quality Education</strong></span>
    </div>
  </div>
</template>

<style scoped>
.home { padding-bottom: 3rem; }

.hero {
  text-align: center;
  padding: 4rem 1.25rem 3rem;
  max-width: 620px;
  margin: 0 auto;
}
.hero-emoji { font-size: 3.5rem; margin-bottom: 1rem; }
.hero h1    { font-size: 2.4rem; margin-bottom: 1rem; }
.highlight  { color: var(--primary); }
.hero-sub   { font-size: 1.05rem; color: var(--text-muted); margin-bottom: 2rem; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  padding-bottom: 2rem;
}
.feature-card { text-align: center; }
.feature-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.feature-card h3 { margin-bottom: 0.4rem; }

.sdg-banner {
  text-align: center;
  padding: 0.85rem;
  background: rgba(0, 201, 167, 0.08);
  border-top: 1px solid rgba(0, 201, 167, 0.2);
  color: var(--text-muted);
  font-size: 0.875rem;
}
.sdg-banner strong { color: var(--accent); }
</style>
