<template>
  <div class="absolute inset-0 z-[120] bg-slate-950 flex flex-col overflow-hidden">
    <BaseSearchFilter
      v-model:searchQuery="localSearchQuery"
      v-model:viewMode="localViewMode"
      placeholder="ADAY ARA (İSİM VEYA KOD)..."
      accent="emerald"
    >
      <template #extra-actions>
        <div class="flex items-center bg-slate-900 border border-slate-800 px-4 h-[38px] gap-3 shadow-inner">
          <span class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">BEKLEME SÜRESİ (AY):</span>
          <input 
            :value="minMonths" 
            @input="$emit('update:minMonths', parseInt($event.target.value))"
            type="number" 
            class="w-12 bg-transparent text-emerald-400 font-black outline-none border-b border-slate-700 focus:border-emerald-500 text-center" 
          />
        </div>
      </template>
    </BaseSearchFilter>

    <div class="flex-1 relative overflow-hidden mt-2 px-2 pb-2">
      <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center opacity-30 z-50">
        <Loader2 class="w-10 h-10 animate-spin mb-4" />
        <p class="text-[0.6rem] font-black uppercase tracking-widest">ADAYLAR HAZIRLANIYOR...</p>
      </div>

      <!-- List Mode -->
      <BaseTable 
        v-if="localViewMode === 'list'"
        :columns="[
          { key: 'profile', label: 'ÜYE BİLGİSİ' },
          { key: 'details', label: 'YAŞ / KAN / CİNSİYET', align: 'center' },
          { key: 'belts', label: 'KUŞAK SEÇİMİ', align: 'center' }
        ]"
        :items="filteredCandidates"
        :selected-ids="selectedCandidateIds"
        @rowClick="$emit('toggle-candidate', $event.id)"
        accent="emerald"
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

        <template #cell-details="{ item }">
          <div class="flex items-center justify-center gap-2">
            <span class="text-[0.6rem] text-slate-300 font-black uppercase tracking-widest">{{ item.birthDate ? calculateAge(item.birthDate) + ' Y' : '-' }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-700"></span>
            <span class="text-[0.6rem] text-rose-500 font-black uppercase tracking-widest">{{ item.bloodGroup || '-' }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-700"></span>
            <span class="text-[0.6rem] text-indigo-400 font-black uppercase tracking-widest">{{ item.gender === 'Erkek' || item.gender === 'M' ? 'ERKEK' : 'KADIN' }}</span>
          </div>
        </template>

        <template #cell-belts="{ item }">
          <div v-if="selectedCandidateIds.includes(item.id)" @click.stop class="flex flex-col items-center gap-1.5 py-1">
            <div class="flex items-center justify-center gap-2">
              <div class="flex flex-col gap-1">
                <select v-model="selections[item.id].fromBelt" class="bg-slate-950 border border-slate-800 text-[0.6rem] font-bold text-slate-400 px-2 py-1 outline-none uppercase cursor-pointer hover:border-slate-700">
                  <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
                </select>
                <div class="h-1 w-full border border-slate-800 shadow-sm" :style="getBeltStyle(selections[item.id].fromBelt)"></div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-emerald-500 mb-2" />
              <div class="flex flex-col gap-1">
                <select v-model="selections[item.id].toBelt" class="bg-slate-950 border border-emerald-500/30 text-[0.6rem] font-black text-emerald-400 px-2 py-1 outline-none uppercase cursor-pointer hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5">
                  <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
                </select>
                <div class="h-1 w-full border border-slate-800 shadow-sm" :style="getBeltStyle(selections[item.id].toBelt)"></div>
              </div>
            </div>
          </div>
          <div v-else class="text-[0.55rem] text-slate-700 font-black italic uppercase tracking-widest text-center">SEÇİM YAPINIZ</div>
        </template>
      </BaseTable>

      <!-- Grid Mode -->
      <div v-else class="h-full overflow-y-auto custom-scrollbar p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <BaseCard 
            v-for="item in filteredCandidates" 
            :key="item.id"
            :selected="selectedCandidateIds.includes(item.id)"
            accent="emerald"
            @click="$emit('toggle-candidate', item.id)"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-700 shadow-lg">
                  <img v-if="item.photo" :src="`${apiBaseUrl}${item.photo}`" class="w-full h-full object-cover" />
                  <span v-else class="text-[0.8rem] text-slate-500">{{ item.fullName[0] }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight">{{ item.fullName }}</span>
                  <span class="text-[0.55rem] font-bold text-slate-500 uppercase">{{ item.memberCode }}</span>
                </div>
              </div>

              <div v-if="selectedCandidateIds.includes(item.id)" @click.stop class="py-2 border-t border-slate-800/50 flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex-1 flex flex-col gap-0.5">
                    <span class="text-[0.5rem] font-black text-slate-600 uppercase">GELEN</span>
                    <select v-model="selections[item.id].fromBelt" class="w-full bg-slate-950 border border-slate-800 text-[0.6rem] font-bold text-slate-400 px-1 py-0.5 outline-none uppercase">
                      <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
                    </select>
                  </div>
                  <ArrowRight class="w-3 h-3 text-slate-700 mt-4" />
                  <div class="flex-1 flex flex-col gap-0.5">
                    <span class="text-[0.5rem] font-black text-emerald-600/60 uppercase text-right">HEDEF</span>
                    <select v-model="selections[item.id].toBelt" class="w-full bg-slate-950 border border-emerald-500/20 text-[0.6rem] font-black text-emerald-400 px-1 py-0.5 outline-none uppercase">
                      <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
                    </select>
                  </div>
                </div>
                <div class="flex gap-1 h-1">
                  <div class="flex-1 rounded-full" :style="getBeltStyle(selections[item.id].fromBelt)"></div>
                  <div class="flex-1 rounded-full" :style="getBeltStyle(selections[item.id].toBelt)"></div>
                </div>
              </div>
              <div v-else class="py-2 text-center border-t border-slate-800/30">
                <span class="text-[0.55rem] text-slate-600 font-bold uppercase italic tracking-tighter">SEÇİM BEKLENİYOR</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <BaseActionFooter local>
      <div class="flex items-center gap-3">
        <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="KAPAT">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-6 bg-slate-800 mx-1"></div>
        <BaseButton variant="success" size="icon" square @click="$emit('add')" :disabled="selectedCandidateIds.length === 0" title="ADAYLARI SINAVA EKLE">
          <template #icon><Save class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X, Loader2, ArrowRight, Save } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseCard from '../base/BaseCard.vue'

const props = defineProps({
  candidates: { type: Array, default: () => [] },
  selectedCandidateIds: { type: Array, default: () => [] },
  candidateSelections: { type: Object, default: () => ({}) },
  availableBelts: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  viewMode: { type: String, default: 'list' },
  minMonths: { type: Number, default: 3 },
  loading: { type: Boolean, default: false },
  exam: { type: Object, required: true }
})

const emit = defineEmits([
  'update:searchQuery', 
  'update:viewMode', 
  'update:minMonths',
  'toggle-candidate',
  'close',
  'add'
])

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
})

const localViewMode = computed({
  get: () => props.viewMode,
  set: (val) => emit('update:viewMode', val)
})

const selections = computed(() => props.candidateSelections)

const apiBaseUrl = `http://${window.location.hostname}:5000`

const filteredCandidates = computed(() => {
  let list = props.candidates.filter(can => !props.exam?.participants?.some(p => p.memberId === can.id))
  
  if (localSearchQuery.value) {
    const q = localSearchQuery.value.toLowerCase()
    list = list.filter(c => c.fullName.toLowerCase().includes(q) || c.memberCode.toLowerCase().includes(q))
  }
  
  return list
})

const calculateAge = (birthDate) => {
  if (!birthDate) return '-'
  const today = new Date()
  const bDate = new Date(birthDate)
  let age = today.getFullYear() - bDate.getFullYear()
  const m = today.getMonth() - bDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--
  return age
}

const getBeltStyle = (beltName) => {
  const name = beltName || ''
  const colors = {
    'Beyaz': '#ffffff', 'Sarı': '#facc15', 'Yeşil': '#22c55e', 'Mavi': '#2563eb', 
    'Kırmızı': '#dc2626', 'Turuncu': '#fb923c', 'Mor': '#9333ea', 
    'Kahverengi': '#92400e', 'Siyah': '#080808'
  }
  if (name.includes('-')) {
    const parts = name.split('-').map(p => p.trim())
    const c1 = colors[Object.keys(colors).find(k => parts[0].includes(k))] || '#334155'
    const c2 = colors[Object.keys(colors).find(k => parts[1].includes(k))] || '#334155'
    return { background: `linear-gradient(to bottom, ${c1} 50%, ${c2} 50%)` }
  }
  const match = Object.keys(colors).find(k => name.includes(k))
  const color = colors[match] || '#334155'
  return { backgroundColor: color, border: name.includes('Beyaz') ? '1px solid #475569' : 'none' }
}
</script>
