<script setup>
import { ref, computed, watch, provide, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'
import MemberDashboard from './views/member/MemberDashboard.vue'
import InstructorTracker from './views/instructor/InstructorTracker.vue'
import BaseSidebar from './components/base/BaseSidebar.vue'
import BaseGlobalFooter from './components/base/BaseGlobalFooter.vue'
import LicenseManager from './components/license/LicenseManager.vue'
import { useAlerts } from './utils/alerts'
import Storage from './utils/Storage'
import { 
  Activity, LayoutDashboard, Users, Calendar, 
  CreditCard, LogOut, Settings as SettingsIcon, 
  QrCode, Menu, X, ChevronLeft, ChevronRight, Package,
  Dumbbell, CalendarDays, GraduationCap, BookOpen, ShieldCheck, Home, Heart, Wallet,
  LayoutList, ShoppingCart, KeyRound, ClipboardCheck, Trophy
} from 'lucide-vue-next'

import { useDataStore } from './store/data'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()
const { confirm } = useAlerts()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(Storage.getItem('sidebarCollapsed') === 'true')
provide('sidebarCollapsed', sidebarCollapsed)

let refreshInterval = null

// Initialize global data
onMounted(() => {
  if (auth.isAuthenticated) {
    dataStore.initAppData()
  }

  // Global Auto Refresh (2 Dakikada bir tüm sistemi tazeleme tetikleyicisi)
  refreshInterval = setInterval(() => {
    if (auth.isAuthenticated && !document.hidden) {
      console.debug('[APP] Otomatik veri tazeleme tetiklendi...');
      dataStore.triggerGlobalRefresh()
    }
  }, 120000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// Watch auth status to load data after login
watch(() => auth.isAuthenticated, (val) => {
  if (val) dataStore.initAppData()
})

// Dynamic page subtitle — child views can inject and update this
const pageSubtitle = ref('')
provide('pageSubtitle', pageSubtitle)

const isLoginPage = computed(() => route.path === '/login' || route.path === '/reset-password')

const menuItems = [
  { to: '/', icon: LayoutDashboard, text: 'Dashboard', color: 'text-sky-400', perm: 'DASHBOARD_VIEW' },
  { 
    text: 'Üye Yönetimi', 
    icon: Users, 
    color: 'text-emerald-400', 
    perm: 'MEMBER_VIEW',
    subItems: [
      { to: '/members', text: 'Üye Tanımları', perm: 'MEMBER_VIEW' },
      { to: '/member-progress', text: 'Üye Gelişim Takibi', perm: 'MEASUREMENT_VIEW' },
      { to: '/packages', text: 'Üyelik Paketleri', perm: 'PACKAGE_VIEW' },
      { to: '/sport-groups', text: 'Takım / Grup Yönetimi', perm: 'SPORT_GROUP_VIEW' },
    ]
  },
  {
    text: 'Antrenman & Teknik',
    icon: Dumbbell,
    color: 'text-orange-400',
    perm: 'EXERCISE_VIEW',
    subItems: [
      { to: '/specialties', text: 'Branş Tanımları', perm: 'SPECIALTY_VIEW' },
      { to: '/exercises', text: 'İstasyon Tanımları', perm: 'EXERCISE_VIEW' },
      { to: '/training-plans', text: 'Antrenman Planları', perm: 'PLAN_VIEW' },
      { to: '/tactical-board', text: 'Taktik Tahtası', perm: 'TACTICAL_BOARD_VIEW' },
    ]
  },
  {
    text: 'Ders & Sınavlar',
    icon: BookOpen,
    color: 'text-rose-400',
    perm: 'CLASS_VIEW',
    subItems: [
      { to: '/lesson-calendar', text: 'Ders Takvimi', perm: 'CALENDAR_VIEW' },
      { to: '/group-classes', text: 'Grup Dersleri', perm: 'CLASS_VIEW' },
      { to: '/private-lessons', text: 'Özel Dersler', perm: 'CLASS_CREATE' },
      { to: '/belt-exams', text: 'Sınav Yönetimi', perm: 'BELT_EXAM_VIEW' },
    ]
  },
  {
    text: 'Personel & Takip',
    icon: GraduationCap,
    color: 'text-indigo-400',
    perm: 'INSTRUCTOR_VIEW',
    subItems: [
      { to: '/instructor-tracker', text: 'Eğitmen Takibi', perm: 'PLAN_VIEW' },
    ]
  },
  {
    text: 'Finans Yönetimi', 
    icon: Wallet,
    color: 'text-amber-400', 
    perm: 'FIN_ACC_VIEW',
    subItems: [
      { to: '/financial-accounts?tab=accounts', text: 'Cari Hesaplar', perm: 'FIN_ACC_VIEW' },
      { to: '/financial-accounts?tab=paymentPlans', text: 'Taksitli Ödemeler', perm: 'FIN_ACC_VIEW' },
    ]
  },
  { to: '/product-sales', icon: ShoppingCart, text: 'Self Satış', color: 'text-violet-400', perm: 'SALES_CREATE' }
]

const currentBreadcrumb = computed(() => {
  const fullPath = route.fullPath
  const path = route.path
  
  for (const item of menuItems) {
    if (item.to === path || item.to === fullPath) {
      return { parent: item.text, child: null }
    }
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (sub.to === fullPath || sub.to === path) {
          return { parent: item.text, child: sub.text }
        }
      }
    }
  }

  // Fallback for non-menu items (like /specialties/:id/formations)
  if (path.includes('/formations')) return { parent: 'Antrenman & Teknik', child: 'Saha Dizilimleri' }
  if (path === '/settings') return { parent: 'Sistem', child: 'Ayarlar' }

  return { parent: 'BEHAGYMPRO', child: null }
})

const finalMenuItems = computed(() => {
  const items = [...menuItems]
  if (auth.user?.email === 'behasoftt@gmail.com') {
    items.push({ 
      text: 'Sistem Yönetimi', 
      icon: KeyRound, 
      color: 'text-purple-400', 
      perm: null,
      subItems: [
        { to: '/license-generator', text: 'Lisans Oluşturucu', perm: null }
      ]
    })
  }
  return items
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

watch(() => route.path, () => {
  sidebarOpen.value = false
})

watch(sidebarCollapsed, (newValue) => {
  Storage.setItem('sidebarCollapsed', newValue)
})

const handleLogout = async () => {
  const result = await confirm('ÇIKIŞ YAPILIYOR', "Güvenli çıkış yapmak istediğinize emin misiniz?", 'EVET, GÜVENLİ ÇIKIŞ')

  if (result.isConfirmed) {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
@keyframes heartbeat {
  0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(244, 63, 94, 0.4)); }
  7% { transform: scale(1.3); filter: drop-shadow(0 0 10px rgba(225, 29, 72, 0.8)); color: #e11d48; }
  14% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(244, 63, 94, 0.4)); }
  21% { transform: scale(1.4); filter: drop-shadow(0 0 15px rgba(225, 29, 72, 0.9)); color: #ff0000; }
  35% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(244, 63, 94, 0.4)); }
  100% { transform: scale(1); }
}

.animate-heartbeat {
  animation: heartbeat 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

@keyframes flag-wave {
  0% { transform: perspective(500px) rotateY(15deg) skewY(-1deg); }
  25% { transform: perspective(500px) rotateY(0deg) skewY(2deg); }
  50% { transform: perspective(500px) rotateY(-15deg) skewY(-1deg); }
  75% { transform: perspective(500px) rotateY(0deg) skewY(2deg); }
  100% { transform: perspective(500px) rotateY(15deg) skewY(-1deg); }
}

@keyframes flag-shade {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-flag-wave {
  animation: flag-wave 2.5s infinite ease-in-out;
  transform-origin: left center;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.flag-shading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: flag-shade 2.5s infinite linear;
  pointer-events: none;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #020617; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: rgba(244, 63, 94, 0.4); 
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.3);
  border-radius: 10px;
}
</style>

<template>
  <LicenseManager />

  <div v-if="isLoginPage" class="min-h-screen bg-slate-950 font-medium ">
    <router-view />
  </div>

  <!-- Member Mobile Portal View -->
  <MemberDashboard v-else-if="auth.isMember" />

  <!-- Instructor Mobile/Desktop Portal View -->
  <InstructorTracker v-else-if="auth.isInstructor" class="h-screen overflow-hidden" />


  <!-- Staff / Master Application View -->
  <div v-else class="h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden font-medium ">
    <!-- Backdrop for Mobile Sidebar -->
    <div 
      v-if="sidebarOpen" 
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden transition-opacity"
    ></div>

    <!-- Top: Sub Navigation Bar -->
    <div v-if="!isLoginPage" class="shrink-0 bg-slate-950 border-b-2 border-rose-500/30 px-6 flex items-center justify-between z-[80] sticky top-0 shadow-[0_0_20px_rgba(244,63,94,0.1)]" style="height: 60px;">
      <!-- Left: Brand -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 font-medium tracking-tighter text-xl  select-none">
          <span class="text-rose-600">{{ auth.user?.Company?.name?.split(' ')[0] || 'Beha' }}</span>
          <span class="text-white">{{ auth.user?.Company?.name?.split(' ').slice(1).join(' ') || 'Gym' }}</span>
        </div>
        <div class="h-6 w-[2px] bg-slate-800 mx-2"></div>
        <Heart class="w-4 h-4 text-rose-600 animate-heartbeat" fill="white" :stroke-width="5" />
        <div class="flex items-center ml-1.5">
          <div class="w-8 h-5 animate-flag-wave drop-shadow-[0_0_10px_rgba(227,10,23,0.5)] rounded-[2px] overflow-hidden relative border border-white/10">
            <svg class="w-full h-full block" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
              <rect width="1200" height="800" fill="#e30a17"/>
              <circle cx="425" cy="400" r="200" fill="#fff"/>
              <circle cx="475" cy="400" r="160" fill="#e30a17"/>
              <polygon points="583.3,400 708.4,440.6 660.6,309.4 660.6,490.6 708.4,359.4" fill="#fff"/>
            </svg>
            <div class="flag-shading"></div>
          </div>
        </div>
      </div>
      <!-- Right: Breadcrumb & Logout -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3 text-[0.7rem] font-black tracking-[0.2em] uppercase">
          <div class="h-6 w-[2px] bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
          <span class="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{{ currentBreadcrumb.parent }}</span>
          <template v-if="currentBreadcrumb.child">
            <span class="text-slate-600">/</span>
            <span class="text-rose-400/80 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">{{ currentBreadcrumb.child }}</span>
          </template>
          <template v-if="pageSubtitle">
            <span class="text-slate-600">/</span>
            <span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{{ pageSubtitle }}</span>
          </template>
        </div>
        
        <div class="h-6 w-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
        
        <button @click="handleLogout" class="p-2 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] hover:text-yellow-400 hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] transition-all active:scale-95 group" title="Güvenli Çıkış">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Bottom row: Sidebar + Main Content -->
    <div class="flex flex-1 overflow-hidden">

      <BaseSidebar 
        v-model="sidebarOpen"
        v-model:collapsed="sidebarCollapsed"
        :menu-items="finalMenuItems"
        :current-path="route.fullPath"
        :has-permission="auth.hasPermission"
        @navigate="router.push($event)"
      />

      <!-- Main Content Area with "Base Model" Card Wrapper -->
      <main class="flex-1 min-w-0 overflow-hidden bg-slate-900 text-slate-100 flex flex-col p-2 relative">
        <div class="flex-1 flex flex-col bg-slate-950/40 border border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden relative">
          <!-- View Area -->
          <div class="flex-1 min-h-0 overflow-hidden">
            <router-view class="h-full" />
          </div>

          <!-- Base Action Footer Target (Inside the Base Model) -->
          <div id="action-footer-target" class="shrink-0"></div>
        </div>
      </main>
    </div>

    <!-- Base Global Footer -->
    <BaseGlobalFooter />
  </div>
</template>
