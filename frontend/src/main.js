import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './store/auth'
import globalComponents from './plugins/globalComponents'
import Storage from './utils/Storage'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(globalComponents)

// Axios Defaults
const token = Storage.getItem('token')
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Add a response interceptor
axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response && error.response.status === 401) {
            const auth = useAuthStore();
            auth.logout();
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('./views/dashboard/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/members',
            component: () => import('./views/member/Members.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/member-progress',
            component: () => import('./views/member/MemberProgress.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            component: () => import('./views/admin/Settings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/qr',
            component: () => import('./views/member/MemberQR.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/packages',
            component: () => import('./views/lesson/Packages.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/specialties',
            component: () => import('./views/sport/SportBranches.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/specialties/:id/formations',
            component: () => import('./views/sport/SportSpecialtyFormations.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/exercises',
            component: () => import('./views/training/Exercises.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/training-plans',
            component: () => import('./views/training/TrainingPlans.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/instructors',
            component: () => import('./views/instructor/Instructors.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/group-classes',
            component: () => import('./views/lesson/GroupClasses.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/private-lessons',
            component: () => import('./views/lesson/PrivateLessons.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/lesson-calendar',
            component: () => import('./views/lesson/LessonCalendar.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/instructor-tracker',
            component: () => import('./views/instructor/InstructorTracker.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/belt-exams',
            component: () => import('./views/admin/BeltExams.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/financial-accounts',
            component: () => import('./views/finance/FinancialAccounts.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/payment-plans',
            component: () => import('./views/finance/PaymentPlans.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/product-sales',
            component: () => import('./views/finance/ProductSales.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/license-generator',
            component: () => import('./views/admin/LicenseGenerator.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/tactical-board',
            component: () => import('./views/sport/TacticalBoard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/sport-groups',
            component: () => import('./views/sport/SportGroups.vue'),
            meta: { requiresAuth: true }
        },
        { path: '/login', component: () => import('./views/auth/Login.vue') },
        { path: '/reset-password', component: () => import('./views/auth/ResetPassword.vue') }
    ]
})

router.beforeEach(async (to, from) => {
    const auth = useAuthStore()

    // Wait for auth to initialize if it's the very first load and we don't know the state yet
    // Since we're using pinia we usually have state, but just in case
    // No async wait needed here typically for basic pinia sync stores


    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    } else if (to.path === '/login' && auth.isAuthenticated) {
        return '/'
    }
})

app.use(router)

router.isReady().then(() => {
    app.mount('#app')
})
