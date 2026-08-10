<template>
  <!-- Admin Panel View -->
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex-none px-2 mt-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_admin_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>
    <!-- Sub Tab Navigation -->
    <div ref="managementSubTabsScroll" class="flex border-b border-slate-800 bg-slate-900 overflow-x-auto whitespace-nowrap pb-1 custom-red-scrollbar cursor-grab active:cursor-grabbing select-none">
      <button 
        @click="managementSubTab = 'dashboard'"
        :class="managementSubTab === 'dashboard' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'"
        class="flex-1 min-w-[200px] py-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all"
      >
        DASHBOARD AYARLARI
      </button>
      <button 
        @click="managementSubTab = 'font'"
        :class="managementSubTab === 'font' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'"
        class="flex-1 min-w-[200px] py-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all"
      >
        YAZI TİPİ STİLİ
      </button>
    </div>

    <!-- Sub Tab Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div v-show="managementSubTab === 'font'">
        <BaseFont ref="fontRef" />
      </div>

      <div v-if="managementSubTab === 'dashboard'" class="space-y-6">

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <!-- Compact Grid Toggles with Ordering -->
          <template v-for="(panel, idx) in settingsStore.dashboardLayout" :key="panel?.id || idx">
            <BaseCard v-if="panel"
              :accent="panel.isVisible ? 'indigo' : null"
              class="h-44 !p-4 flex flex-col justify-between">
            <template #default>
              <!-- Top Bar: Order & Icon -->
              <div class="flex items-start justify-between relative z-10">
                <div class="flex flex-col gap-1">
                  <BaseButton @click="settingsStore.movePanel(idx, -1)" :disabled="idx === 0" variant="dark" class="px-2 py-1.5 rounded-md">
                    <ChevronUp class="w-4 h-4" />
                  </BaseButton>
                  <BaseButton @click="settingsStore.movePanel(idx, 1)" :disabled="idx === settingsStore.dashboardLayout.length - 1" variant="dark" class="px-2 py-1.5 rounded-md">
                    <ChevronDown class="w-4 h-4" />
                  </BaseButton>
                </div>
                <div class="flex flex-col items-end gap-4">
                  <div class="opacity-30 group-hover:opacity-100 transition-opacity">
                    <GripVertical class="w-4 h-4 text-white cursor-move" />
                  </div>
                  <BaseSwitch 
                    v-model="panel.isVisible" 
                    @change="settingsStore.saveLayout"
                  />
                </div>
              </div>

              <!-- Center Body: Label -->
              <div class="mt-auto pt-6">
                <span class="text-[0.65rem] font-black text-white uppercase tracking-widest leading-relaxed block min-h-[2.5rem]">
                  {{ panel.label }}
                </span>
                <span class="text-[0.55rem] text-rose-500 font-bold uppercase mt-1 block">SIRA: {{ idx + 1 }}</span>
              </div>
            </template>
          </BaseCard>
        </template>
        </div>
      </div>
    </div>

    <!-- SHARED ACTION FOOTER -->
    <BaseActionFooter>
       <div class="flex items-center gap-2">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
             <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>

          <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

         <!-- Reset Button -->
         <BaseButton 
           @click="handleGlobalReset"
           :disabled="settingsStore.dashboardSaving"
           variant="dark" 
           size="icon"
           square
           title="VARSAYILANA SIFIRLA"
         >
           <template #icon><RotateCcw class="w-5 h-5" /></template>
         </BaseButton>

         <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

         <!-- Save Button -->
         <BaseButton 
           @click="handleGlobalSave"
           :disabled="settingsStore.dashboardSaving"
           variant="primary" 
           size="icon"
           square
           :loading="settingsStore.dashboardSaving"
           title="AYARLARI VE DÜZENİ KAYDET"
         >
           <template #icon><Save class="w-5 h-5" /></template>
         </BaseButton>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../../store/settings'
import { useAuthStore } from '../../store/auth'
import { 
  Building, ChevronDown, ChevronUp, GripVertical, Info, RotateCcw, Save, Loader2, ArrowLeft
} from 'lucide-vue-next'
import BaseFont from '../base/BaseFont.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'
import { companyService } from '../../services/admin/companyService'
import { branchService } from '../../services/admin/branchService'
import { useAlerts } from '../../utils/alerts'

const settingsStore = useSettingsStore()
const auth = useAuthStore()
const router = useRouter()
const { toast } = useAlerts()

const managementSubTab = ref('dashboard')
const fontRef = ref(null)

const handleGlobalReset = () => {
  if (managementSubTab.value === 'dashboard') {
    settingsStore.resetLayout()
  } else if (managementSubTab.value === 'font' && fontRef.value) {
    fontRef.value.resetToDefaults()
  }
}

const handleGlobalSave = () => {
  if (managementSubTab.value === 'dashboard') {
    settingsStore.saveLayout()
  } else if (managementSubTab.value === 'font' && fontRef.value) {
    fontRef.value.applyAndSave()
  }
}

// Global Selection State
const globalSelection = ref({ companyId: '', branchId: '', remember: false })

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  // Dashboard configuration can be loaded here based on data.companyId/branchId
  // settingsStore.loadLayout(data.companyId, data.branchId)
}

const companies = ref([])
const branches = ref([])
const loading = ref(false)
const dashboardLayout = computed(() => settingsStore.dashboardLayout)

const fetchCompanies = async () => {
  try {
    companies.value = await companyService.getAll()
  } catch (err) {
    console.error('Şirketler yüklenemedi:', err)
  }
}

const fetchBranches = async () => {
  try {
    branches.value = await branchService.getAll()
  } catch (err) {
    console.error('Şubeler yüklenemedi:', err)
  }
}


const allBranches = computed(() => {
  if (!branches.value || !Array.isArray(branches.value)) return [];
  return branches.value.map(br => ({
    ...br,
    company: br.Company || br.company || { name: 'SİSTEM' }
  }));
})


onMounted(() => {
  // Eğer BehaAdmin değilse (selector gizliyse) direkt çekelim
  if (!auth.isBehaAdmin && auth.user) {
    globalSelection.value = {
      companyId: auth.user.companyId || '',
      branchId: auth.user.branchId || '',
      remember: true
    }
  }
  settingsStore.loadLayout()
})
</script>

<style scoped>
.custom-red-scrollbar::-webkit-scrollbar {
  height: 3px;
}
.custom-red-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.2);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.4);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
</style>
