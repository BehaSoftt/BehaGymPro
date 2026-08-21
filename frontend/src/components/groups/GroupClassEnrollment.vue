<template>
  <div class="absolute inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden">
    <BaseSearchFilter
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="ÜYE ARA..."
      accent="emerald"
    >
      <template #extra-actions>
         <div class="flex items-center bg-slate-900 overflow-hidden h-full rounded-sm">
            <button 
              v-for="tab in [
                { k: 'ALL', l: 'HEPSİ', c: memberList.length, activeClass: 'bg-indigo-600' },
                { k: 'ENROLLED', l: 'KAYITLI', c: enrolledCount, activeClass: 'bg-emerald-600' },
                { k: 'AVAILABLE', l: 'YENİ', c: memberList.length - enrolledCount, activeClass: 'bg-rose-600' }
              ]"
              :key="tab.k"
              @click="filterTab = tab.k"
              :class="filterTab === tab.k ? [tab.activeClass, 'text-white shadow-lg z-10'] : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'"
              class="px-5 h-full text-[0.65rem] font-black uppercase transition-all flex items-center gap-2 border-r border-slate-800/50 last:border-0"
            >
              <span>{{ tab.l }}</span>
              <span :class="filterTab === tab.k ? 'bg-white/20' : 'bg-slate-800'" class="px-2 py-0.5 rounded-full text-[0.55rem]">{{ tab.c }}</span>
            </button>
         </div>
      </template>
    </BaseSearchFilter>

    <div class="flex-1 relative overflow-hidden mt-2 px-2 pb-2">
       <BaseScroll v-if="viewMode === 'grid'" accent="emerald" direction="vertical" class="absolute inset-0 p-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
             <BaseCard
               v-for="m in filteredMembers"
               :key="m.id"
               :selected="selectedIds.includes(m.id)"
               accent="emerald"
               @click="toggleSelection(m.id)"
             >
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 bg-slate-950 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                      <img v-if="m.photo" :src="`${apiBaseUrl}${m.photo}`" class="w-full h-full object-cover" />
                      <span v-else class="text-sm font-black text-slate-500">{{ m.fullName[0] }}</span>
                   </div>
                   <div class="flex flex-col min-w-0 text-left">
                      <span class="text-[0.75rem] font-black text-slate-100 uppercase truncate leading-tight transition-colors">{{ m.fullName }}</span>
                      <span class="text-[0.6rem] text-slate-500 font-mono tracking-tighter">{{ m.memberCode }}</span>
                   </div>
                </div>

                <template #footer>
                   <div class="flex flex-col text-left">
                      <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">DURUM</span>
                      <span v-if="isEnrolled(m.id)" class="text-[0.55rem] font-black text-emerald-500 uppercase">KAYITLI</span>
                      <span v-else class="text-[0.55rem] font-black text-slate-500 uppercase">KAYITSIZ</span>
                   </div>
                   <div class="flex flex-col items-end">
                      <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">ÜYELİK</span>
                      <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-tighter">{{ m.membershipType }}</span>
                   </div>
                </template>
             </BaseCard>
          </div>
       </BaseScroll>

       <BaseTable 
         v-else
         :columns="[
           { key: 'profile', label: 'ÜYE BİLGİSİ' },
           { key: 'membershipType', label: 'TİP' },
           { key: 'status', label: 'KAYIT DURUMU', align: 'center' },
           { key: 'memberCode', label: 'MÜŞTERİ KODU', align: 'right' }
         ]"
         :items="filteredMembers"
         :selected-ids="selectedIds"
         accent="emerald"
         @rowClick="(item) => toggleSelection(item.id)"
         class="absolute inset-0"
       >
         <template #cell-profile="{ item }">
            <div class="flex items-center gap-2.5">
               <div class="w-8 h-8 bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <img v-if="item.photo" :src="`${apiBaseUrl}${item.photo}`" class="w-full h-full object-cover" />
                  <span v-else class="text-[0.6rem] font-bold text-slate-500">{{ item.fullName[0] }}</span>
               </div>
               <div class="flex flex-col text-left">
                  <span class="text-[0.7rem] font-black text-slate-100 uppercase leading-tight">{{ item.fullName }}</span>
                  <span class="text-[0.55rem] text-slate-500 font-mono tracking-tighter">{{ item.memberCode }}</span>
               </div>
            </div>
         </template>

         <template #cell-membershipType="{ item }">
            <span class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-tight">{{ item.membershipType }}</span>
         </template>

         <template #cell-status="{ item }">
            <span v-if="isEnrolled(item.id)" class="text-[0.5rem] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">KAYITLI</span>
            <span v-else class="text-[0.5rem] font-black text-slate-500 bg-slate-500/5 px-2 py-0.5 border border-slate-500/10">KAYITSIZ</span>
         </template>

         <template #cell-memberCode="{ item }">
            <span class="text-[0.65rem] font-mono text-slate-500 uppercase font-black">{{ item.memberCode }}</span>
         </template>
       </BaseTable>
    </div>

    <BaseActionFooter local shadow>
      <div class="flex items-center gap-4">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="VAZGEÇ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-8 bg-slate-800"></div>
        <transition name="fade-slide">
           <div v-if="selectedIds.length > 0" class="flex items-center gap-4 transition-all">
              <BaseButton 
                v-if="!isEnrolled(selectedIds[0])"
                variant="success" 
                size="icon" square
                :loading="loading"
                @click="$emit('enroll', selectedIds)"
                title="GRUBA EKLE"
              >
                <template #icon><UserPlus class="w-5 h-5" /></template>
              </BaseButton>

              <BaseButton 
                v-else
                variant="danger" 
                size="icon" square
                :loading="loading"
                @click="$emit('unenroll', selectedIds[0])"
                title="GRUPTAN ÇIKAR"
              >
                <template #icon><Trash2 class="w-5 h-5" /></template>
              </BaseButton>
           </div>
        </transition>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, UserPlus, Trash2 } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  group: { type: Object, required: true },
  members: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['enroll', 'unenroll', 'cancel'])

const apiBaseUrl = `http://${window.location.hostname}:5000`

const searchQuery = ref('')
const viewMode = ref('list')
const filterTab = ref('ALL')
const selectedIds = ref([])

const memberList = computed(() => {
  if (Array.isArray(props.members)) return props.members
  if (props.members && Array.isArray(props.members.members)) return props.members.members
  return []
})

const enrolledCount = computed(() => {
  return props.group?.enrolledMembers?.length || 0
})

const filteredMembers = computed(() => {
  let list = memberList.value.filter(m => m.isActive !== false)
  
  if (filterTab.value === 'ENROLLED') {
    list = list.filter(m => isEnrolled(m.id))
  } else if (filterTab.value === 'AVAILABLE') {
    list = list.filter(m => !isEnrolled(m.id))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m => (m.fullName || '').toLowerCase().includes(q) || (m.memberCode || '').toLowerCase().includes(q))
  }
  return list
})

const isEnrolled = (memberId) => {
  return props.group?.enrolledMembers?.some(m => m.id === memberId)
}

const toggleSelection = (id) => {
  selectedIds.value = selectedIds.value[0] === id ? [] : [id]
}
</script>
