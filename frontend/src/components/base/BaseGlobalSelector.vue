<template>
  <div class="bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-end gap-6 shadow-lg animate-in mb-4">
    <div v-if="showCompany" class="flex-1 min-w-[200px] space-y-1.5">
      <label class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest pl-1">Şirket Seçimi</label>
      <select v-model="selectedCompanyId" class="w-full bg-slate-950 border border-slate-700 px-4 py-2 text-[0.7rem] font-bold text-slate-100 outline-none focus:border-indigo-500 transition-all uppercase appearance-none">
        <option value="">TÜM ŞİRKETLER</option>
        <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>
    <div v-if="showBranch" class="flex-1 min-w-[200px] space-y-1.5">
      <label class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest pl-1">Şube Seçimi</label>
      <select v-model="selectedBranchId" class="w-full bg-slate-950 border border-slate-700 px-4 py-2 text-[0.7rem] font-bold text-slate-100 outline-none focus:border-indigo-500 transition-all uppercase appearance-none">
        <option value="">TÜM ŞUBELER</option>
        <option v-for="b in filteredBranches" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
    </div>
    <div class="flex items-center gap-3 pb-2 cursor-pointer group" @click="isRememberEnabled = !isRememberEnabled">
      <div :class="isRememberEnabled ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800'" class="w-5 h-5 border flex items-center justify-center transition-all">
        <Check v-if="isRememberEnabled" class="w-3.5 h-3.5 text-white" />
      </div>
      <span class="text-[0.65rem] font-black text-slate-400 group-hover:text-slate-200 uppercase tracking-widest transition-colors">SEÇİMİ HATIRLA</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { useDataStore } from '../../store/data'
import { useAuthStore } from '../../store/auth'
import Storage from '../../utils/Storage'
import { storeToRefs } from 'pinia'

const props = defineProps({
  storageKey: { type: String, required: true },
  showCompany: { type: Boolean, default: true },
  showBranch: { type: Boolean, default: true }
})

const emit = defineEmits(['change'])

const dataStore = useDataStore()
const auth = useAuthStore()
const companies = computed(() => dataStore.companies || [])
const branches = computed(() => dataStore.branches || [])

const selectedCompanyId = ref('')
const selectedBranchId = ref('')
const isRememberEnabled = ref(false)

const filteredBranches = computed(() => {
  if (!selectedCompanyId.value) return branches.value
  return branches.value.filter(b => b.companyId === selectedCompanyId.value || b.CompanyId === selectedCompanyId.value)
})

const initSelections = () => {
  const savedSettings = Storage.getItem(props.storageKey)
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    if (parsed.remember) {
      isRememberEnabled.value = true
      selectedCompanyId.value = parsed.companyId || ''
      selectedBranchId.value = parsed.branchId || ''
    }
  } else if (auth.user) {
    // Default to user's branch/company if nothing saved
    if (auth.user.companyId || auth.user.CompanyId) {
      selectedCompanyId.value = auth.user.companyId || auth.user.CompanyId
    }
    if (auth.user.branchId || auth.user.BranchId) {
      selectedBranchId.value = auth.user.branchId || auth.user.BranchId
    }
  }
}

watch([selectedCompanyId, selectedBranchId, isRememberEnabled], () => {
  const data = {
    companyId: selectedCompanyId.value,
    branchId: selectedBranchId.value,
    remember: isRememberEnabled.value
  }

  if (isRememberEnabled.value) {
    Storage.setItem(props.storageKey, JSON.stringify(data))
  } else {
    Storage.removeItem(props.storageKey)
  }
  
  emit('change', data)
})

onMounted(async () => {
  if (!companies.value.length) await dataStore.fetchCompanies()
  if (!branches.value.length) await dataStore.fetchBranches()
  initSelections()
  // Trigger initial emit
  emit('change', {
    companyId: selectedCompanyId.value,
    branchId: selectedBranchId.value,
    remember: isRememberEnabled.value
  })
})
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
