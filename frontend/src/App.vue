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
    </div>
  </nav>

  <RouterView />
</template>

<style scoped>
/* Nav handled in global style.css */
</style>
