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
                { k: 'ALL', l: 'HEPSİ', c: items.length, activeClass: 'bg-indigo-600' },
                { k: 'PRESENT', l: 'GELDİ', c: items.filter(m => m.attendanceStatus === 'PRESENT').length, activeClass: 'bg-emerald-600' },
                { k: 'ABSENT', l: 'GELMEDİ', c: items.filter(m => m.attendanceStatus === 'ABSENT').length, activeClass: 'bg-rose-600' },
                { k: 'EXCUSED', l: 'MAZERET', c: items.filter(m => m.attendanceStatus === 'EXCUSED').length, activeClass: 'bg-amber-600' }
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
               v-for="m in filteredItems"
               :key="m.id"
               accent="emerald"
               :selected="selectedIds.includes(m.id)"
               @click="toggleSelection(m.id)"
             >
                <div class="flex items-center gap-3 mb-4">
                   <div class="w-10 h-10 bg-slate-950 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                      <img v-if="m.photo" :src="`${apiBaseUrl}${m.photo}`" class="w-full h-full object-cover" />
                      <span v-else class="text-sm font-black text-slate-500">{{ m.fullName[0] }}</span>
                   </div>
                   <div class="flex flex-col min-w-0 text-left">
                      <span class="text-[0.75rem] font-black text-slate-100 uppercase truncate leading-tight">{{ m.fullName }}</span>
                      <span class="text-[0.6rem] text-slate-500 font-mono tracking-tighter">{{ m.memberCode }}</span>
                   </div>
                </div>

                <div class="flex flex-col gap-2">
                   <template v-if="!m.isLocked">
                      <div class="flex gap-1">
                         <BaseButton 
                           class="flex-1"
                           :variant="m.attendanceStatus === 'PRESENT' ? 'success' : 'dark'" 
                           size="sm"
                           @click.stop="m.attendanceStatus = 'PRESENT'"
                         >
                           <template #icon><Check class="w-3.5 h-3.5" /></template>
                           <span class="text-[0.6rem] font-black">GELDİ</span>
                         </BaseButton>
                         <BaseButton 
                           class="flex-1"
                           :variant="m.attendanceStatus === 'ABSENT' ? 'danger' : 'dark'" 
                           size="sm"
                           @click.stop="m.attendanceStatus = 'ABSENT'"
                         >
                           <template #icon><X class="w-3.5 h-3.5" /></template>
                           <span class="text-[0.6rem] font-black">GELMEDİ</span>
                         </BaseButton>
                      </div>
                      <BaseButton 
                        class="w-full"
                        :variant="m.attendanceStatus === 'EXCUSED' ? 'warning' : 'dark'" 
                        size="sm"
                        @click.stop="m.attendanceStatus = 'EXCUSED'"
                      >
                        <template #icon><Info class="w-3.5 h-3.5" /></template>
                        <span class="text-[0.6rem] font-black">MAZERETLİ</span>
                      </BaseButton>

                      <transition name="fade-slide">
                         <div v-if="m.attendanceStatus === 'EXCUSED'" class="mt-1">
                            <input 
                               v-model="m.excuse" 
                               type="text" 
                               placeholder="MAZERET SEBEBİ..." 
                               class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.6rem] text-slate-300 outline-none focus:border-amber-500 font-bold uppercase placeholder:text-slate-700 tracking-wider transition-all" 
                            />
                         </div>
                      </transition>
                   </template>
                   <template v-else>
                      <div class="flex flex-col items-center gap-2 bg-slate-950/80 border border-slate-800/50 p-3 rounded-sm shadow-inner mt-2">
                         <div class="flex flex-col gap-1 items-center justify-center w-full">
                            <div class="flex items-center gap-2">
                               <div v-if="m.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-400 font-black text-[0.65rem] uppercase">
                                  <CheckCircle class="w-4 h-4" /> GELDİ
                               </div>
                               <div v-else-if="m.attendanceStatus === 'ABSENT'" class="flex items-center gap-2 text-rose-400 font-black text-[0.65rem] uppercase">
                                  <XCircle class="w-4 h-4" /> GELMEDİ
                               </div>
                               <div v-else class="flex flex-col items-center">
                                  <div class="flex items-center gap-2 text-amber-400 font-black text-[0.65rem] uppercase">
                                     <Info class="w-4 h-4" /> MAZERETLİ
                                  </div>
                                  <span class="text-[0.55rem] text-slate-500 font-bold italic truncate max-w-[120px]">"{{ m.excuse }}"</span>
                               </div>
                            </div>
                            <span v-if="m.createdAt" class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mt-1">{{ formatDate(m.createdAt) }}</span>
                         </div>
                      </div>
                   </template>
                </div>
             </BaseCard>
          </div>
       </BaseScroll>

       <BaseTable 
         v-else
         :columns="[
           { key: 'profile', label: 'ÜYE BİLGİSİ' },
           { key: 'timestamp', label: 'İŞLEM ZAMANI', align: 'center' },
           { key: 'status', label: 'YOKLAMA GİRİŞİ', align: 'right' }
         ]"
         :items="filteredItems"
         :selected-ids="selectedIds"
         @rowClick="toggleSelection($event.id)"
         accent="emerald"
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

          <template #cell-timestamp="{ item }">
             <div class="flex items-center justify-center h-full">
                <span v-if="item.createdAt" class="text-[0.65rem] font-bold text-slate-400 font-mono tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-sm shadow-inner whitespace-nowrap">
                   {{ formatDate(item.createdAt) }}
                </span>
                <span v-else class="text-[0.65rem] font-bold text-slate-600 font-mono tracking-widest opacity-50 px-3 py-1 whitespace-nowrap">
                   --/--/---- --:--
                </span>
             </div>
          </template>

          <template #cell-status="{ item }">
            <div class="flex items-center justify-end gap-3 h-[55px]">
               <template v-if="!item.isLocked">
                   <div v-if="item.attendanceStatus === 'EXCUSED'" class="w-[450px] animate-in fade-in slide-in-from-right-2 duration-300 h-full">
                      <input 
                         v-model="item.excuse" 
                         type="text" 
                         placeholder="MAZERET SEBEBİ..." 
                         class="w-full h-full bg-slate-950 border border-slate-800 px-4 py-1 text-[0.65rem] text-slate-300 outline-none focus:border-amber-500 font-bold uppercase placeholder:text-slate-700 tracking-wider transition-all shadow-inner" 
                      />
                   </div>

                   <div class="flex bg-slate-950/50 border border-slate-800 p-0.5 rounded-sm h-full w-[450px]">
                      <button 
                         @click.stop="item.attendanceStatus = 'PRESENT'"
                         :class="item.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'"
                         class="flex-1 h-full transition-all border-r border-slate-800/50 last:border-0 flex items-center justify-center gap-2"
                      >
                         <Check class="w-4 h-4" />
                         <span class="text-[0.65rem] font-black uppercase">GELDİ</span>
                      </button>
                      <button 
                         @click.stop="item.attendanceStatus = 'ABSENT'"
                         :class="item.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'"
                         class="flex-1 h-full transition-all border-r border-slate-800/50 last:border-0 flex items-center justify-center gap-2"
                      >
                         <X class="w-4 h-4" />
                         <span class="text-[0.65rem] font-black uppercase">GELMEDİ</span>
                      </button>
                      <button 
                         @click.stop="item.attendanceStatus = 'EXCUSED'"
                         :class="item.attendanceStatus === 'EXCUSED' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'"
                         class="flex-1 h-full transition-all flex items-center justify-center gap-2"
                      >
                         <Info class="w-4 h-4" />
                         <span class="text-[0.65rem] font-black uppercase">MAZERET</span>
                      </button>
                   </div>
               </template>
               <template v-else>
                  <div class="flex items-center gap-6 bg-slate-900 border border-slate-800 h-full px-8 rounded-sm shadow-xl">
                      <div class="flex items-center gap-12">
                         <div class="flex flex-col justify-center items-start gap-0.5 w-full text-left">
                            <div v-if="item.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-400 font-black text-[0.7rem] uppercase tracking-widest">
                               <CheckCircle class="w-4.5 h-4.5" /> GELDİ İŞLENDİ
                            </div>
                            <div v-else-if="item.attendanceStatus === 'ABSENT'" class="flex items-center gap-2 text-rose-400 font-black text-[0.7rem] uppercase tracking-widest">
                               <XCircle class="w-4.5 h-4.5" /> GELMEDİ İŞLENDİ
                            </div>
                            <div v-else class="flex flex-col">
                               <div class="flex items-center gap-2 text-amber-400 font-black text-[0.7rem] uppercase tracking-widest">
                                  <Info class="w-4.5 h-4.5" /> MAZERETLİ İŞLENDİ
                               </div>
                               <span class="text-[0.55rem] text-slate-500 font-bold italic truncate max-w-[200px]">"{{ item.excuse }}"</span>
                            </div>
                         </div>
                      </div>
                  </div>
               </template>
            </div>
          </template>
       </BaseTable>
    </div>

    <BaseActionFooter local shadow>
      <div class="flex items-center gap-4">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="VAZGEÇ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-8 bg-slate-800"></div>
        
        <template v-if="items.some(m => m.isLocked && selectedIds.includes(m.id))">
           <BaseButton 
             variant="danger" 
             size="icon" square
             @click="$emit('undo', selectedIds)"
             :loading="loading"
             title="SEÇİLİ YOKLAMALARI DÜZELT (GERİ AL)"
           >
             <template #icon><RefreshCcw class="w-5 h-5" /></template>
           </BaseButton>
        </template>
        <template v-else-if="items.some(m => !m.isLocked)">
           <BaseButton 
             variant="success" 
             size="icon" square
             @click="$emit('save', items)"
             :loading="loading"
             title="KAYDET"
           >
             <template #icon><CheckCircle class="w-5 h-5" /></template>
           </BaseButton>
        </template>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, Check, Info, CheckCircle, XCircle, RefreshCcw } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'undo', 'cancel'])

const apiBaseUrl = `http://${window.location.hostname}:5000`

const searchQuery = ref('')
const viewMode = ref('list')
const filterTab = ref('ALL')
const selectedIds = ref([])

const filteredItems = computed(() => {
  let list = props.items

  if (filterTab.value === 'PRESENT') {
    list = list.filter(m => m.attendanceStatus === 'PRESENT')
  } else if (filterTab.value === 'ABSENT') {
    list = list.filter(m => m.attendanceStatus === 'ABSENT')
  } else if (filterTab.value === 'EXCUSED') {
    list = list.filter(m => m.attendanceStatus === 'EXCUSED')
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(member => 
      member.fullName?.toLowerCase().includes(q) || 
      member.memberCode?.toLowerCase().includes(q)
    )
  }
  return list
})

const toggleSelection = (id) => {
   const member = props.items.find(m => m.id === id)
   if (!member || !member.isLocked) return
   const idx = selectedIds.value.indexOf(id)
   if (idx > -1) selectedIds.value.splice(idx, 1)
   else selectedIds.value.push(id)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
         date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}
</script>
