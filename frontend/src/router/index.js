import { createRouter, createWebHistory } from 'vue-router'

import HomeView      from '../views/HomeView.vue'
import SetupView     from '../views/SetupView.vue'
import DashboardView from '../views/DashboardView.vue'
import StudyPlanView from '../views/StudyPlanView.vue'
import QuizView      from '../views/QuizView.vue'
import ProgressView  from '../views/ProgressView.vue'

const routes = [
  { path: '/',           name: 'Home',      component: HomeView      },
  { path: '/setup',      name: 'Setup',     component: SetupView     },
  { path: '/dashboard',  name: 'Dashboard', component: DashboardView },
  { path: '/study-plan', name: 'StudyPlan', component: StudyPlanView },
  { path: '/quiz',       name: 'Quiz',      component: QuizView      },
  { path: '/progress',   name: 'Progress',  component: ProgressView  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
