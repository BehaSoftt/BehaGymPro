<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    
    <!-- Tab Navigation -->
    <div ref="mainTabsScroll" class="flex-none flex items-center gap-1 mt-1 px-1 z-10 overflow-x-auto whitespace-nowrap pb-1 custom-red-scrollbar cursor-grab active:cursor-grabbing select-none flex-nowrap scroll-smooth">
      <button 
        v-for="tab in availableTabs" 
        :key="tab.id"
        @click="handleTabClick(tab.id, $event)"
        :class="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-indigo-500' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 border-slate-800 hover:border-slate-700'"
        class="flex items-center justify-center gap-2 px-6 py-3 border text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all active:scale-95 min-w-fit"
      >
        <component :is="tab.icon" class="w-4 h-4 flex-shrink-0" />
        <span class="px-2">{{ tab.label }}</span>
      </button>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden px-1 pb-1 mt-0">
      
      <!-- Security Tab Content (Global Control Center) -->
      <div v-if="activeTab === 'security'" class="h-full flex flex-col">
        <SettingsSecurity :is-super-master="canManageSystem" />
      </div>

      <!-- Companies Tab Content (Super Master Only) -->
      <div v-if="activeTab === 'companies'" class="h-full flex flex-col">
          <SettingsCompanies 
            :is-super-master="canManageSystem"
            @refresh-companies="fetchCompanies"
            @company-updated="fetchCompanies"
          />
      </div>

      <!-- Branches Tab Content (Super Master Only) -->
      <div v-if="activeTab === 'branches'" class="h-full flex flex-col">
          <SettingsBranches 
            :is-super-master="canManageSystem" 
            :companies="companies"
            @refresh-companies="fetchCompanies"
          />
      </div>

      <!-- Roles & Permissions Tab Content -->
      <div v-if="activeTab === 'roles'" class="h-full flex flex-col">
        <SettingsRoles :is-super-master="canManageSystem" />
      </div>

      <!-- Communications Tab Content -->
      <div v-if="activeTab === 'communications'" class="h-full flex flex-col">
          <SettingsCommunications />
      </div>

      <!-- ÜRÜN YÖNETİMİ TAB CONTENT -->
      <div v-if="activeTab === 'products'" class="h-full flex flex-col">
        <SettingsProducts />
      </div>

      <!-- KAMPANYA YÖNETİMİ TAB CONTENT -->
      <div v-if="activeTab === 'campaigns'" class="h-full flex flex-col">
        <SettingsCampaigns />
      </div>

      <!-- DUYURU YÖNETİMİ TAB CONTENT -->
      <div v-if="activeTab === 'announcements'" class="h-full flex flex-col">
        <SettingsAnnouncements />
      </div>

      <!-- Lisans Yönetimi Tab İçeriği -->
      <div v-if="activeTab === 'licenses'" class="h-full flex flex-col">
        <SettingsLicenses />
      </div>

      <!-- Management Panel Tab Content -->
      <div v-if="activeTab === 'admin_panel'" class="h-full flex flex-col gap-6 animate-in">
          <SettingsAdminPanel />
      </div> <!-- /admin_panel tab -->

    </div> <!-- /flex-1 main tab wrapper -->

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, inject } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'
import { 
  Users, Building2, ShieldCheck, MessageSquare, Shield, Megaphone, BellRing, Package, Key, X
} from 'lucide-vue-next'
import SettingsCampaigns from '../../components/settings/SettingsCampaigns.vue'
import SettingsAnnouncements from '../../components/settings/SettingsAnnouncements.vue'
import SettingsLicenses from '../../components/settings/SettingsLicenses.vue'
import SettingsProducts from '../../components/settings/SettingsProducts.vue'
import SettingsCompanies from '../../components/settings/SettingsCompanies.vue'
import SettingsBranches from '../../components/settings/SettingsBranches.vue'
import SettingsSecurity from '../../components/settings/SettingsSecurity.vue'
import SettingsRoles from '../../components/settings/SettingsRoles.vue'
import SettingsCommunications from '../../components/settings/SettingsCommunications.vue'
import SettingsAdminPanel from '../../components/settings/SettingsAdminPanel.vue'

import { companyService } from '../../services/admin/companyService'

const auth = useAuthStore()
const settingsStore = useSettingsStore()
const activeTab = ref('security')
const mainTabsScroll = ref(null)
const companies = ref([])

const isSuperMaster = computed(() => {
  const user = auth.user;
  if (!user) return false;
  return user.username?.toLowerCase() === 'super_master' || 
         user.role?.toUpperCase() === 'SUPER_MASTER';
});

const isBehaAdmin = computed(() => auth.user?.email === 'behasoftt@gmail.com');

const canManageSystem = computed(() => isBehaAdmin.value || isSuperMaster.value);

const availableTabs = computed(() => {
  const tabs = [
    { id: 'security', label: 'Kullanıcı Yönetimi', icon: Users }
  ];

  if (isBehaAdmin.value || isSuperMaster.value || auth.hasPermission('COMPANY_MANAGE')) {
    tabs.push({ id: 'companies', label: 'Şirket Yönetimi', icon: Building2 });
  }

  if (isBehaAdmin.value || isSuperMaster.value || auth.hasPermission('BRANCH_MANAGE')) {
    tabs.push({ id: 'branches', label: 'Şube Yönetimi', icon: Building2 });
  }

  if (isBehaAdmin.value || isSuperMaster.value || auth.hasPermission('ROLE_MANAGE')) {
    tabs.push({ id: 'roles', label: 'Rol ve Yetki', icon: ShieldCheck });
  }
  
  tabs.push({ id: 'communications', label: 'İleti Yönetimi', icon: MessageSquare });
  
  if (auth.hasPermission('DASHBOARD_CONFIG_MANAGE')) {
    tabs.push({ id: 'admin_panel', label: 'Yönetim Paneli', icon: Shield });
  }

  if (auth.hasPermission('CAMPAIGN_MANAGE')) {
    tabs.push({ id: 'campaigns', label: 'Kampanya Yönetimi', icon: Megaphone });
  }

  if (auth.hasPermission('ANNOUNCEMENT_MANAGE')) {
    tabs.push({ id: 'announcements', label: 'Duyuru Yönetimi', icon: BellRing });
  }

  if (auth.hasPermission('PRODUCT_VIEW')) {
     tabs.push({ id: 'products', label: 'Ürün Yönetimi', icon: Package });
  }

  if (isBehaAdmin.value || auth.hasPermission('LICENSE_MANAGE')) {
    tabs.push({ id: 'licenses', label: 'Lisans Yönetimi', icon: Key });
  }
  
  return tabs;
});

const pageSubtitle = inject('pageSubtitle')

watch(activeTab, (newTab) => {
  const currentTab = availableTabs.value.find(t => t.id === newTab);
  if (currentTab && pageSubtitle) {
    pageSubtitle.value = currentTab.label;
  }
}, { immediate: true });

const handleTabClick = (tabId, event) => {
  activeTab.value = tabId
  scrollToTab(event.currentTarget)
}

const scrollToTab = (target) => {
  if (!mainTabsScroll.value || !target) return
  
  const container = mainTabsScroll.value
  const targetRect = target.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  
  const scrollLeft = target.offsetLeft - (containerRect.width / 2) + (targetRect.width / 2)
  
  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth'
  })
}

const initDragToScroll = (el) => {
  if (!el) return
  let isDown = false
  let startX
  let scrollLeft

  el.addEventListener('mousedown', (e) => {
    isDown = true
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
    el.classList.remove('scroll-smooth') // Drag sırasında smooth scroll kapat
  })

  el.addEventListener('mouseleave', () => {
    isDown = true
    el.classList.add('scroll-smooth')
  })

  el.addEventListener('mouseup', () => {
    isDown = false
    el.classList.add('scroll-smooth')
  })

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 2 
    el.scrollLeft = scrollLeft - walk
  })
}

import { useDataStore } from '../../store/data'

const dataStore = useDataStore()

const fetchCompanies = async () => {
  try {
    await dataStore.fetchCompanies(true)
    companies.value = dataStore.companies
  } catch (err) {
    console.error('Şirketler yüklenemedi:', err)
  }
}

onMounted(async () => {
  if (mainTabsScroll.value) initDragToScroll(mainTabsScroll.value)
  fetchCompanies()
})

onUnmounted(() => {
  if (pageSubtitle) pageSubtitle.value = '';
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); }

.custom-red-scrollbar::-webkit-scrollbar { height: 3px; }
.custom-red-scrollbar::-webkit-scrollbar-track { background: rgba(225, 29, 72, 0.05); }
.custom-red-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.5); border-radius: 10px; }
.custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(225, 29, 72, 0.8); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
