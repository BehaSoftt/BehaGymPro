<template>
  <div class="absolute inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
    <BaseSearchFilter
      v-model:searchQuery="localSearchQuery"
      v-model:viewMode="localViewMode"
      placeholder="ÜYE ARA..."
      accent="rose"
    >
      <template #extra-actions>
        <div class="flex items-center bg-slate-900 overflow-hidden h-full rounded-sm">
          <button 
            v-for="tab in [
              { k: 'ALL', l: 'HEPSİ', c: participants.length, activeClass: 'bg-indigo-600' },
              { k: 'PRESENT', l: 'GELDİ', c: participants.filter(m => m.attendanceStatus === 'PRESENT').length, activeClass: 'bg-emerald-600' },
              { k: 'ABSENT', l: 'GELMEDİ', c: participants.filter(m => m.attendanceStatus === 'ABSENT').length, activeClass: 'bg-rose-600' },
              { k: 'EXCUSED', l: 'MAZERET', c: participants.filter(m => m.attendanceStatus === 'EXCUSED').length, activeClass: 'bg-amber-600' }
            ]"
            :key="tab.k"
            type="button"
            @click="localFilterTab = tab.k"
            :class="localFilterTab === tab.k ? [tab.activeClass, 'text-white shadow-lg z-10'] : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'"
            class="px-5 h-full text-[0.65rem] font-black uppercase transition-all flex items-center gap-2 border-r border-slate-800/50 last:border-0"
          >
            <span>{{ tab.l }}</span>
            <span :class="localFilterTab === tab.k ? 'bg-white/20' : 'bg-slate-800'" class="px-2 py-0.5 rounded-full text-[0.55rem]">{{ tab.c }}</span>
          </button>
        </div>
      </template>
    </BaseSearchFilter>

    <div class="flex-1 relative overflow-hidden mt-2 px-2 pb-14">
      <BaseTable 
        v-if="localViewMode === 'list'"
        :columns="[
          { key: 'profile', label: 'ÜYE BİLGİSİ' },
          { key: 'status', label: 'YOKLAMA GİRİŞİ', align: 'right' }
        ]"
        :items="filteredMembers"
        :selected-ids="selectedAttendanceIds"
        @rowClick="$emit('toggle-selection', $event.id)"
        accent="rose"
        class="absolute inset-0"
      >
        <template #cell-profile="{ item }">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              <img v-if="item.photo" :src="`${apiBaseUrl}${item.photo}`" class="w-full h-full object-cover" />
              <span v-else class="text-[0.6rem] font-bold text-slate-500">{{ item.fullName[0] }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[0.7rem] font-black text-slate-100 uppercase leading-tight">{{ item.fullName }}</span>
              <span class="text-[0.55rem] text-slate-500 font-mono tracking-tighter">{{ item.memberCode }}</span>
            </div>
          </div>
        </template>

        <template #cell-status="{ item }">
          <div class="flex items-center justify-end gap-3 h-[55px]">
            <template v-if="!item.isLocked">
              <div v-if="item.attendanceStatus === 'EXCUSED'" class="w-[450px] animate-in fade-in slide-in-from-right-2 duration-300 h-full">
                <input v-model="item.excuse" type="text" placeholder="MAZERET SEBEBİ..." class="w-full h-full bg-slate-950 border border-slate-800 px-4 py-1 text-[0.65rem] text-slate-300 outline-none focus:border-amber-500 font-bold uppercase placeholder:text-slate-700 tracking-wider transition-all shadow-inner" />
              </div>

              <div class="flex bg-slate-950/50 border border-slate-800 p-0.5 rounded-sm h-full w-[450px]">
                <button @click="item.attendanceStatus = 'PRESENT'" :class="item.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 h-full transition-all border-r border-slate-800/50 last:border-0 flex items-center justify-center gap-2">
                  <Check class="w-4 h-4" /> <span class="text-[0.65rem] font-black uppercase">GELDİ</span>
                </button>
                <button @click="item.attendanceStatus = 'ABSENT'" :class="item.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 h-full transition-all border-r border-slate-800/50 last:border-0 flex items-center justify-center gap-2">
                  <X class="w-4 h-4" /> <span class="text-[0.65rem] font-black uppercase">GELMEDİ</span>
                </button>
                <button @click="item.attendanceStatus = 'EXCUSED'" :class="item.attendanceStatus === 'EXCUSED' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 h-full transition-all flex items-center justify-center gap-2">
                  <Info class="w-4 h-4" /> <span class="text-[0.65rem] font-black uppercase">MAZERET</span>
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-6 bg-slate-900 border border-slate-800 h-full px-8 rounded-sm shadow-xl min-w-[300px]">
                <div v-if="item.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-400 font-black text-[0.7rem] uppercase tracking-widest">
                  <CheckCircle class="w-4.5 h-4.5" /> GELDİ İŞLENDİ
                </div>
                <div v-else-if="item.attendanceStatus === 'ABSENT'" class="flex items-center gap-2 text-rose-400 font-black text-[0.7rem] uppercase tracking-widest">
                  <XCircle class="w-4.5 h-4.5" /> GELMEDİ İŞLENDİ
                </div>
                <div v-else class="flex flex-col">
                  <div class="flex items-center gap-2 text-amber-400 font-black text-[0.7rem] uppercase tracking-widest">
                    <Info class="w-4.5 h-4.5" /> MAZERETLİ
                  </div>
                  <span class="text-[0.55rem] text-slate-500 font-bold italic truncate max-w-[200px]">"{{ item.excuse }}"</span>
                </div>
              </div>
            </template>
          </div>
        </template>
      </BaseTable>

      <BaseScroll v-else accent="rose" direction="vertical" class="absolute inset-0 p-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <BaseCard v-for="m in filteredMembers" :key="m.id" accent="rose" :selected="selectedAttendanceIds.includes(m.id)" @click="$emit('toggle-selection', m.id)">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-slate-950 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                <img v-if="m.photo" :src="`${apiBaseUrl}${m.photo}`" class="w-full h-full object-cover" />
                <span v-else class="text-sm font-black text-slate-500">{{ m.fullName[0] }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[0.75rem] font-black text-slate-100 uppercase leading-none mb-1">{{ m.fullName }}</span>
                <span class="text-[0.6rem] font-bold text-slate-500">{{ m.memberCode }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <template v-if="!m.isLocked">
                <button @click.stop="m.attendanceStatus = 'PRESENT'" :class="m.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500'" class="w-full py-2 text-[0.6rem] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check class="w-3 h-3" /> GELDİ
                </button>
                <button @click.stop="m.attendanceStatus = 'ABSENT'" :class="m.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-500'" class="w-full py-2 text-[0.6rem] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <X class="w-3 h-3" /> GELMEDİ
                </button>
              </template>
              <template v-else>
                <div :class="m.attendanceStatus === 'PRESENT' ? 'text-emerald-400' : 'text-rose-400'" class="w-full py-2 border border-slate-800 text-[0.6rem] font-black uppercase tracking-widest text-center">
                  {{ m.attendanceStatus === 'PRESENT' ? 'GELDİ İŞLENDİ' : 'GELMEDİ İŞLENDİ' }}
                </div>
              </template>
            </div>
          </BaseCard>
        </div>
      </BaseScroll>
    </div>

    <BaseActionFooter local>
       <div class="flex items-center gap-3">
          <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="KAPAT">
            <template #icon><X class="w-5 h-5" /></template>
          </BaseButton>
          <div class="w-px h-6 bg-slate-800 mx-1"></div>
          <BaseButton v-if="selectedAttendanceIds.length > 0" variant="warning" size="icon" square @click="$emit('undo-selected')" title="YOKLAMAYI GERİ AL">
            <template #icon><RefreshCcw class="w-5 h-5" /></template>
          </BaseButton>
          <BaseButton variant="success" size="icon" square @click="$emit('submit')" title="YOKLAMAYI KAYDET">
            <template #icon><Save class="w-5 h-5" /></template>
          </BaseButton>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, X, Info, CheckCircle, XCircle, RefreshCcw, Save } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseCard from '../base/BaseCard.vue'

const props = defineProps({
  participants: { type: Array, default: () => [] },
  selectedAttendanceIds: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  viewMode: { type: String, default: 'list' },
  filterTab: { type: String, default: 'ALL' }
})

const emit = defineEmits([
  'update:searchQuery', 
  'update:viewMode', 
  'update:filterTab',
  'toggle-selection',
  'close',
  'undo-selected',
  'submit'
])

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
})

const localViewMode = computed({
  get: () => props.viewMode,
  set: (val) => emit('update:viewMode', val)
})

const localFilterTab = computed({
  get: () => props.filterTab,
  set: (val) => emit('update:filterTab', val)
})

const apiBaseUrl = `http://${window.location.hostname}:5000`

const filteredMembers = computed(() => {
  let list = props.participants
  if (localSearchQuery.value) {
    const q = localSearchQuery.value.toLowerCase()
    list = list.filter(m => m.fullName.toLowerCase().includes(q) || m.memberCode.toLowerCase().includes(q))
  }
  if (localFilterTab.value !== 'ALL') {
    list = list.filter(m => m.attendanceStatus === localFilterTab.value)
  }
  return list
})
</script>
