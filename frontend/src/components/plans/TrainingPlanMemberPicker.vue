<template>
  <div class="absolute inset-0 z-[110] bg-slate-950/98 backdrop-blur-3xl flex flex-col overflow-hidden">
    
    <!-- Sub Header: Search & Info (Matching Premium Style) -->
    <BaseSearchFilter 
      v-model:searchQuery="searchQuery" 
      v-model:viewMode="viewMode" 
      placeholder="ÜYE ARA (İSİM, KOD VEYA TEL)..." 
      accent="rose"
      class="!overflow-visible z-50 pt-4 w-[calc(100%-46px)] mx-auto"
    >
       <template #extra-left>
         <div class="h-full relative px-2 border-r border-slate-800/50">
           <button 
             type="button"
             @click.stop="isFilterOpen = !isFilterOpen"
             class="h-full px-4 flex items-center gap-2 hover:bg-slate-900/80 transition-all text-[0.65rem] font-black text-rose-400 uppercase cursor-pointer"
           >
             <span>{{ filterTab === 'all' ? 'TÜM ÜYELER' : (filterTab === 'template' ? 'GENEL ŞABLON' : 'FİLTRELİ LİSTE') }}</span>
             <ChevronDown class="w-3 h-3 text-rose-500/50 transition-transform duration-300" :class="{ 'rotate-180': isFilterOpen }" />
           </button>

           <Transition name="fade-slide">
             <div v-if="isFilterOpen" class="absolute top-[calc(100%+8px)] left-0 w-64 bg-slate-900 border-2 border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-xl p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
               <button 
                 @click="filterTab = 'all'; isFilterOpen = false"
                 :class="filterTab === 'all' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                 class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
               >
                 <div class="flex items-center gap-3">
                   <div class="w-1.5 h-1.5 rounded-full" :class="filterTab === 'all' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                   <span>TÜM ÜYELER</span>
                 </div>
               </button>
               <button 
                 @click="handleMemberSelect(null); isFilterOpen = false"
                 class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl transition-all text-left group"
               >
                 <div class="flex items-center gap-3">
                   <div class="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-400"></div>
                   <span>GENEL ŞABLON OLARAK SEÇ</span>
                 </div>
                 <Layers class="w-3.5 h-3.5 opacity-30 group-hover:opacity-100" />
               </button>
             </div>
           </Transition>
         </div>
       </template>
    </BaseSearchFilter>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden px-6 pb-6 pt-2">
      <div v-if="filteredMembers.length > 0" class="h-full">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 h-full overflow-y-auto custom-scrollbar pt-2 pr-2">
            <BaseCard 
              v-for="member in filteredMembers" 
              :key="member.id" 
              accent="indigo" 
              selectable 
              @click="handleMemberSelect(member)"
              :selected="selectedMemberId === member.id"
              :class="{ 'opacity-60 grayscale-[0.5]': safeExcludedIds.includes(member.id) }"
            >
               <div class="flex flex-col gap-4 text-center items-center py-4 relative">
                  <div v-if="safeExcludedIds.includes(member.id)" class="absolute top-0 right-0 z-10">
                    <span class="text-[0.45rem] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter">PLANI VAR</span>
                  </div>
                  <div class="relative">
                    <BaseMemberAvatar :src="member.photo" :name="member.fullName" size="lg" rounded />
                    <div v-if="selectedMemberId === member.id" class="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                      <Check class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div class="space-y-1">
                     <span class="text-[0.7rem] font-black text-slate-100 uppercase truncate w-full block">{{ member.fullName }}</span>
                     <span class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">{{ member.memberCode || 'KODSUZ' }}</span>
                  </div>
               </div>
            </BaseCard>
        </div>
        
        <!-- List View -->
        <BaseTable
           v-else
           :columns="[
              { key: 'photo', label: '', width: '50px' },
              { key: 'fullName', label: 'AD SOYAD' },
              { key: 'memberCode', label: 'KOD' },
              { key: 'phone', label: 'TELEFON' }
           ]"
           :items="filteredMembers"
           accent="rose"
           :selected-ids="selectedMemberId ? [selectedMemberId] : []"
           @rowClick="handleMemberSelect($event)"
           :row-class="(item) => safeExcludedIds.includes(item.id) ? 'opacity-60 grayscale-[0.5]' : ''"
        >
           <template #cell-photo="{ item }">
              <div class="relative">
                <BaseMemberAvatar :src="item.photo" :name="item.fullName" size="xs" />
                <div v-if="selectedMemberId === item.id" class="absolute -bottom-1 -right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center border border-slate-900">
                  <Check class="w-2 h-2 text-white" />
                </div>
              </div>
           </template>
           <template #cell-fullName="{ item, value }">
             <div class="flex items-center gap-2">
               <span class="text-[0.7rem] font-black text-white uppercase">{{ value }}</span>
               <span v-if="safeExcludedIds.includes(item.id)" class="text-[0.4rem] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 py-0.5 rounded uppercase tracking-tighter">PROGRAMI VAR</span>
             </div>
           </template>
           <template #cell-memberCode="{ value }"><span class="text-[0.6rem] font-bold text-slate-500">{{ value || '-' }}</span></template>
           <template #cell-phone="{ value }"><span class="text-[0.65rem] font-bold text-slate-400">{{ value || '-' }}</span></template>
        </BaseTable>
      </div>

      <!-- No Records -->
      <div v-else class="flex flex-col items-center justify-center py-40 opacity-10 gap-8 text-center uppercase">
        <Users class="w-32 h-32" />
        <span class="text-sm font-black tracking-[0.5em]">ÜYE BULUNAMADI</span>
      </div>
    </div>

    <!-- Modal Footer -->
    <BaseActionFooter local>
      <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="VAZGEÇ">
        <template #icon><X class="w-5 h-5" /></template>
      </BaseButton>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, X, Search, LayoutGrid, List, Check, Layers, ChevronDown } from 'lucide-vue-next'
import { useAlerts } from '../../utils/alerts'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseMemberAvatar from '../base/BaseMemberAvatar.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'

const props = defineProps({
  members: { type: Array, default: () => [] },
  selectedMemberId: { type: [String, Number], default: null },
  excludedIds: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'close'])
const { error: showAlertError } = useAlerts()

const searchQuery = ref('')
const viewMode = ref('list')
const isFilterOpen = ref(false)
const filterTab = ref('all')

const safeExcludedIds = computed(() => props.excludedIds || [])

const filteredMembers = computed(() => {
  let list = props.members || []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m => 
      (m.fullName || '').toLowerCase().includes(q) || 
      (m.memberCode || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q)
    )
  }
  return list
})

const handleMemberSelect = (member) => {
  if (!member) {
    emit('select', null)
    return
  }

  if (safeExcludedIds.value.includes(member.id)) {
    showAlertError(
      'UYARI', 
      `${member.fullName} isimli üyenin zaten henüz bitmemiş aktif bir antrenman planı bulunuyor. Lütfen önce mevcut planı kontrol edin veya silin.`
    )
    return
  }

  emit('select', member)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 63, 94, 0.2); }
</style>
