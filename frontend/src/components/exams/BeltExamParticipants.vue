<template>
  <div class="absolute inset-0 z-40 bg-slate-800 flex flex-col overflow-hidden border-t border-slate-700 shadow-2xl">
    <div class="flex-1 overflow-hidden flex flex-col p-0 bg-slate-900">
      <!-- Modern Search & Filter for Modal -->
      <BaseSearchFilter
        v-model:searchQuery="localSearchQuery"
        v-model:viewMode="localViewMode"
        placeholder="KATILIMCI ARA..."
        accent="rose"
        class="!bg-slate-950/20"
      />

      <div class="flex-1 overflow-hidden">
        <!-- List View -->
        <div v-if="localViewMode === 'list'" class="h-full overflow-y-auto custom-scrollbar border border-slate-800 bg-slate-900/40 shadow-2xl">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-slate-950 z-20 border-b border-rose-500/50">
              <tr class="text-[0.7rem] font-black text-white uppercase tracking-[0.2em]">
                <th class="px-6 py-4">AD SOYAD</th>
                <th class="px-6 py-4">BRANŞ / YAŞ / KAN</th>
                <th class="px-6 py-4 text-center">YOKLAMA</th>
                <th class="px-6 py-4 text-center">KUŞAK DEĞİŞİMİ</th>
                <th class="px-6 py-4 text-center">SONUÇ</th>
                <th class="px-6 py-4 text-center">YENİ KUŞAK</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/30">
              <tr v-for="p in filteredParticipants" :key="p.id" 
                  @click="$emit('select-participant', p.id)"
                  :class="selectedParticipantId === p.id ? 'bg-rose-500/10' : 'hover:bg-slate-800/50'"
                  class="transition-colors group cursor-pointer">
                <td class="px-6 py-4 font-black">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-700">
                      <img v-if="p.member?.photo" :src="apiBaseUrl + p.member.photo" class="w-full h-full object-cover" />
                      <span v-else class="text-[0.8rem] text-slate-500">{{ p.member?.fullName[0] }}</span>
                    </div>
                    <span class="text-sm font-black text-slate-100 uppercase tracking-tight group-hover:text-rose-400 transition-colors">{{ p.member?.fullName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <span class="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest">{{ exam.specialty?.name }}</span>
                    <span class="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span class="text-[0.7rem] text-slate-200 font-black tracking-widest">{{ p.member?.birthDate ? calculateAge(p.member.birthDate) + ' Y' : '-' }}</span>
                    <span class="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span class="text-[0.7rem] text-rose-500 font-black uppercase tracking-widest">{{ p.member?.bloodGroup || '-' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex flex-col items-center">
                    <template v-if="p.attendance === 'PRESENT'">
                      <CheckCircle class="w-4 h-4 text-emerald-500" />
                      <span class="text-[0.55rem] font-black text-emerald-500 uppercase">KATILDI</span>
                    </template>
                    <template v-else-if="p.attendance === 'ABSENT'">
                      <XCircle class="w-4 h-4 text-rose-500" />
                      <span class="text-[0.55rem] font-black text-rose-500 uppercase">GELMEDİ</span>
                    </template>
                    <template v-else-if="p.attendance === 'EXCUSED'">
                      <Info class="w-4 h-4 text-amber-500" />
                      <span class="text-[0.55rem] font-black text-amber-500 uppercase">MAZERETLİ</span>
                    </template>
                    <span v-else class="text-[0.55rem] text-slate-600 font-bold uppercase italic tracking-widest">-</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <div class="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg">
                      <div class="w-4 h-2" :style="getBeltStyle(p.fromBelt)"></div>
                      <span class="text-[0.7rem] font-black text-slate-300 uppercase tracking-widest">{{ p.fromBelt }}</span>
                    </div>
                    <ArrowRight class="w-5 h-5 text-white drop-shadow-sm" />
                    <div class="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg">
                      <div class="w-4 h-2" :style="getBeltStyle(p.toBelt)"></div>
                      <span class="text-[0.7rem] font-black text-emerald-400 uppercase tracking-widest">{{ p.toBelt }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="p.status !== 'PENDING'" :class="p.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'" class="text-[0.75rem] font-black uppercase tracking-[0.2em]">
                    {{ p.status === 'PASSED' ? 'BAŞARILI' : 'KALDI' }}
                  </span>
                  <span v-else class="text-[0.6rem] text-slate-600 font-bold uppercase italic tracking-widest">BEKLEMEDE</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div v-if="p.status === 'PASSED'" class="flex flex-col items-center gap-1.5">
                    <div class="w-8 h-3 border border-slate-700 shadow-md" :style="getBeltStyle(p.toBelt)"></div>
                    <span class="text-[0.65rem] font-black text-rose-50 uppercase tracking-tighter">{{ p.toBelt }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Grid View -->
        <div v-else class="h-full overflow-y-auto custom-scrollbar p-6 bg-slate-900/40">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
            <BaseCard 
              v-for="p in filteredParticipants" 
              :key="p.id"
              :selected="selectedParticipantId === p.id"
              accent="rose"
              @click="$emit('select-participant', p.id)"
            >
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-700 shadow-xl">
                    <img v-if="p.member?.photo" :src="apiBaseUrl + p.member.photo" class="w-full h-full object-cover" />
                    <span v-else class="text-[1rem] text-slate-500">{{ p.member?.fullName[0] }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-100 uppercase tracking-tight">{{ p.member?.fullName }}</span>
                    <span class="text-[0.6rem] font-bold text-slate-500 uppercase">{{ p.member?.birthDate ? calculateAge(p.member.birthDate) + ' YAŞ' : '-' }}</span>
                  </div>
                </div>
                <div class="py-3 border-y border-slate-800/50 flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[0.6rem] font-black text-slate-600 uppercase">HEDEF KUŞAK:</span>
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-1.5" :style="getBeltStyle(p.toBelt)"></div>
                      <span class="text-[0.65rem] font-black text-slate-300">{{ p.toBelt }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-center pt-2">
                  <span v-if="p.status !== 'PENDING'" :class="p.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'" class="text-[0.8rem] font-black uppercase tracking-widest">
                    {{ p.status === 'PASSED' ? 'BAŞARILI' : 'KALDI' }}
                  </span>
                  <span v-else class="text-[0.6rem] text-slate-700 font-bold uppercase italic tracking-widest">BEKLEMEDE</span>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Footer -->
    <BaseActionFooter local>
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="KAPAT">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <BaseButton variant="warning" size="icon" square @click="$emit('open-attendance')" title="YOKLAMA AL">
          <template #icon><CheckCircle class="w-5 h-5" /></template>
        </BaseButton>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <template v-if="selectedParticipantId">
          <BaseButton variant="warning" size="icon" square @click="$emit('edit-participant', selectedParticipantId)" title="DÜZENLE">
            <template #icon><Edit3 class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton variant="success" size="icon" square @click="$emit('set-result', { id: selectedParticipantId, status: 'PASSED' })" title="BAŞARILI">
            <template #icon><CheckCircle class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton variant="danger" size="icon" square @click="$emit('set-result', { id: selectedParticipantId, status: 'FAILED' })" title="BAŞARISIZ">
            <template #icon><XCircle class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton variant="indigo" size="icon" square @click="$emit('send-whatsapp', selectedParticipantId)" title="WHATSAPP">
            <template #icon><Send class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton variant="ghost" size="icon" square @click="$emit('delete-participant', selectedParticipantId)" title="SİL">
            <template #icon><Trash2 class="w-5 h-5" /></template>
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton variant="success" size="icon" square @click="$emit('add-candidate')" title="ADAY EKLE">
            <template #icon><UserPlus class="w-5 h-5" /></template>
          </BaseButton>

          <template v-if="exam.status !== 'COMPLETED'">
            <div class="w-px h-6 bg-slate-800 mx-1"></div>
            <BaseButton variant="indigo" size="icon" square @click="$emit('complete-exam')" title="SINAVI SONLANDIR" :disabled="!canComplete">
              <template #icon><CheckCircle class="w-5 h-5" /></template>
            </BaseButton>
          </template>
        </template>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  X, CheckCircle, XCircle, Info, ArrowRight, UserPlus, 
  Edit3, Send, Trash2 
} from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseCard from '../base/BaseCard.vue'

const props = defineProps({
  exam: { type: Object, required: true },
  selectedParticipantId: { type: [String, Number], default: null },
  participantSearchQuery: { type: String, default: '' },
  participantViewMode: { type: String, default: 'list' },
  canComplete: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:participantSearchQuery', 
  'update:participantViewMode', 
  'select-participant',
  'close',
  'open-attendance',
  'edit-participant',
  'set-result',
  'send-whatsapp',
  'delete-participant',
  'add-candidate',
  'complete-exam'
])

const localSearchQuery = computed({
  get: () => props.participantSearchQuery,
  set: (val) => emit('update:participantSearchQuery', val)
})

const localViewMode = computed({
  get: () => props.participantViewMode,
  set: (val) => emit('update:participantViewMode', val)
})

const apiBaseUrl = `http://${window.location.hostname}:5000`

const filteredParticipants = computed(() => {
  if (!props.exam) return []
  if (!localSearchQuery.value) return props.exam.participants
  const q = localSearchQuery.value.toLowerCase()
  return props.exam.participants.filter(p => 
    p.member?.fullName?.toLowerCase().includes(q)
  )
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
