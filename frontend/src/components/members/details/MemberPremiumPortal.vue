<template>
  <BaseModal 
    v-model="localShow" 
    :title="member?.fullName?.toUpperCase() + ' - PREMİUM PORTAL'" 
    subtitle="GELİŞİM ANALİZİ VE PROGRAM YÖNETİMİ"
    hideClose
    class="premium-portal-modal"
  >
    <template #icon>
       <div class="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Activity class="w-6 h-6 text-emerald-400" />
       </div>
    </template>

    <template #extra-header>
       <div class="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 ml-auto">
          <button 
            @click="activeTab = 'program'"
            class="px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-2"
            :class="activeTab === 'program' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'"
          >
             <Layers class="w-3.5 h-3.5" /> ANTRENMAN
          </button>
          <button 
            @click="activeTab = 'analysis'"
            class="px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-2"
            :class="activeTab === 'analysis' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'"
          >
             <Activity class="w-3.5 h-3.5" /> ANALİZ
          </button>
          <button 
            @click="activeTab = 'career'"
            class="px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-2"
            :class="activeTab === 'career' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'"
          >
             <Trophy class="w-3.5 h-3.5" /> SPORTİF
          </button>
       </div>
    </template>

    <div class="space-y-6 min-h-[500px]">
      <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-3 opacity-50">
         <Loader2 class="w-10 h-10 animate-spin text-emerald-500" />
         <p class="text-[0.65rem] font-black uppercase tracking-[0.3em]">ÜYE VERİLERİ SENKRONİZE EDİLİYOR...</p>
      </div>

      <div v-else class="space-y-6">
          <!-- Tab 1: Program Viewer -->
          <div v-if="activeTab === 'program'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div v-if="planDetails" class="space-y-6">
                  <!-- Plan Summary -->
                  <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between relative overflow-hidden group">
                     <div class="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/5 rotate-12 blur-3xl rounded-full"></div>
                     <div class="flex items-center gap-5 relative z-10">
                        <div class="w-14 h-14 bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center rounded-2xl">
                           <Layers class="w-7 h-7 text-rose-500" />
                        </div>
                        <div>
                           <p class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-[0.4em] mb-1">PROGRAM DOSYASI</p>
                           <h2 class="text-xl font-black text-white uppercase tracking-tighter italic leading-none">{{ planDetails.title }}</h2>
                        </div>
                     </div>
                     <div class="text-right flex flex-col items-end">
                        <span class="text-[0.5rem] text-slate-500 font-black uppercase tracking-widest block mb-1">TAMAMLANAN</span>
                        <span class="text-2xl font-black text-emerald-400 italic tracking-tighter tabular-nums">{{ completedDays.length }} GÜN</span>
                     </div>
                  </div>

                  <!-- Days Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div v-for="day in planDetails.days" :key="day.dayOfWeek" 
                          class="bg-slate-950 border border-slate-800 p-4 rounded-[2rem] flex flex-col gap-3 group/day relative overflow-hidden"
                          :class="day.isRestDay ? 'opacity-30 grayscale' : 'hover:border-rose-500/50 transition-all'">
                        
                        <div class="flex items-center justify-between">
                           <span class="text-lg font-black uppercase italic tracking-tighter" :class="day.isRestDay ? 'text-slate-600' : 'text-white'">{{ daysOfWeek[day.dayOfWeek === 7 ? 6 : day.dayOfWeek - 1] }}</span>
                           <div v-if="!day.isRestDay">
                              <div v-if="completedDays.some(d => d.endsWith(`-${day.dayOfWeek}`))" class="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                                 <Check class="w-3 h-3 text-emerald-400" />
                              </div>
                           </div>
                        </div>

                        <div v-if="!day.isRestDay" class="space-y-1.5 flex-1">
                           <div v-for="ex in planDetails.items.filter(i => i.dayOfWeek === day.dayOfWeek)" :key="ex.id" 
                                class="p-2 bg-slate-900 border border-slate-800/50 rounded-xl border-l-[3px] border-l-rose-500">
                              <p class="text-[0.6rem] font-bold text-slate-200 uppercase truncate">{{ ex.exercise?.name }}</p>
                              <p class="text-[0.5rem] font-black text-emerald-500/70 tabular-nums">{{ ex.sets }}x{{ ex.reps || ex.durationMinutes }} {{ ex.reps ? 'TKR' : 'DK' }}</p>
                           </div>
                        </div>
                        <div v-else class="flex-1 flex items-center justify-center py-6">
                           <Moon class="w-8 h-8 text-slate-800" />
                        </div>
                     </div>
                  </div>
              </div>
              <div v-else class="py-20 flex flex-col items-center justify-center gap-4 opacity-20 border-4 border-dashed border-slate-800 rounded-[2rem] italic">
                  <MonitorOff class="w-16 h-16" />
                  <p class="text-xs font-black uppercase tracking-widest">BU ÜYE İÇİN AKTİF BİR PROGRAM BULUNAMADI.</p>
              </div>
          </div>

          <!-- Tab 2: Analysis Dashboard -->
          <div v-else-if="activeTab === 'analysis'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- BMI -->
                  <div class="bg-indigo-600/10 p-6 border border-indigo-500/30 rounded-3xl relative overflow-hidden">
                     <div class="flex items-center gap-2 mb-4">
                        <Activity class="w-5 h-5 text-indigo-400" />
                        <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">BKİ DURUMU</span>
                     </div>
                     <div class="flex items-baseline gap-3 mb-1">
                        <span class="text-4xl font-black text-white italic tabular-nums">{{ measurements[0]?.bmi || '-' }}</span>
                        <span :class="getBmiClass(measurements[0]?.bmi)" class="text-[0.6rem] font-black uppercase tracking-widest border border-white/5 bg-black/40 px-2 py-1 rounded">
                           {{ getBMIStatus(measurements[0]?.bmi).label }}
                        </span>
                     </div>
                     <div class="w-full h-1 bg-slate-950 rounded-full mt-4">
                        <div class="h-full bg-indigo-500" :style="{width: (measurements[0]?.bmi ? (measurements[0].bmi/40)*100 : 0) + '%'}"></div>
                     </div>
                  </div>

                  <div class="bg-emerald-600/10 p-6 border border-emerald-500/30 rounded-3xl relative overflow-hidden">
                     <div class="flex items-center gap-2 mb-4">
                        <Zap class="w-5 h-5 text-emerald-400" />
                        <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">GÜNCEL BAŞARI</span>
                     </div>
                     <div class="flex items-baseline gap-3">
                        <span class="text-4xl font-black text-white italic tabular-nums">{{ successRate }}%</span>
                        <span class="text-[0.6rem] text-emerald-500 font-black uppercase tracking-widest italic">İLERLEME</span>
                     </div>
                  </div>

                  <div class="bg-rose-600/10 p-6 border border-rose-500/30 rounded-3xl relative overflow-hidden">
                     <div class="flex items-center gap-2 mb-4">
                        <History class="w-5 h-5 text-rose-400" />
                        <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">KAYIT ADEDİ</span>
                     </div>
                     <div class="flex items-baseline gap-3">
                        <span class="text-4xl font-black text-white italic tabular-nums">{{ measurements.length }}</span>
                        <span class="text-[0.6rem] text-rose-500 font-black uppercase tracking-widest italic text-right">ÖLÇÜM</span>
                     </div>
                  </div>
              </div>

              <!-- Measurement Table -->
              <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div class="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
                     <span class="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <History class="w-4 h-4" /> ÖLÇÜM GEÇMİŞİ
                     </span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left">
                      <thead>
                        <tr class="bg-slate-950/20 text-[0.6rem] font-black text-slate-500 border-b border-slate-800">
                          <th class="px-6 py-3 uppercase tracking-widest">TARİH</th>
                          <th class="px-6 py-3 uppercase tracking-widest">KİLO</th>
                          <th class="px-6 py-3 uppercase tracking-widest">BKİ</th>
                          <th class="px-6 py-3 uppercase tracking-widest">DURUM</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/5">
                        <tr v-for="m in measurements" :key="m.id" class="hover:bg-white/[0.02] transition-colors">
                          <td class="px-6 py-4 text-xs font-mono text-slate-300">{{ new Date(m.measurementDate).toLocaleDateString('tr-TR') }}</td>
                          <td class="px-6 py-4 text-sm font-black text-white italic tracking-tighter">{{ m.weight }} <span class="text-[0.6rem] text-slate-500">KG</span></td>
                          <td class="px-6 py-4 text-sm font-black text-slate-200 tabular-nums">{{ m.bmi }}</td>
                          <td class="px-6 py-4">
                            <span :class="getBmiClass(m.bmi)" class="text-[0.6rem] font-black uppercase tracking-widest">{{ getBMIStatus(m.bmi).label }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="measurements.length === 0" class="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                      <Scale class="w-8 h-8" />
                      <p class="text-[0.6rem] font-black uppercase tracking-widest italic text-center px-10">HENÜZ BİR KAYIT BULUNMUOR.</p>
                  </div>
              </div>
          </div>

          <!-- Tab 3: Sport Career Viewer -->
          <div v-else-if="activeTab === 'career'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <!-- Career Hero Cards -->
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Position Card -->
                  <div class="bg-emerald-600/10 p-6 border border-emerald-500/30 rounded-3xl relative overflow-hidden group">
                    <div class="flex items-center gap-3 mb-4">
                       <ShieldCheck class="w-5 h-5 text-emerald-400" />
                       <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">AKTİF MEVKİ</span>
                    </div>
                    <div class="flex items-baseline gap-3">
                       <span class="text-4xl font-black text-white italic tracking-tighter">{{ getMemberPosition(member) || 'BELİRSİZ' }}</span>
                       <span v-if="member.specialty" class="text-[0.6rem] text-emerald-500 font-black uppercase tracking-widest">{{ member.specialty.name }}</span>
                    </div>
                  </div>

                  <!-- Level Card -->
                  <div class="bg-amber-600/10 p-6 border border-amber-500/30 rounded-3xl relative overflow-hidden group">
                    <div class="flex items-center gap-3 mb-4">
                       <Zap class="w-5 h-5 text-amber-400" />
                       <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">SPORCU SEVİYESİ</span>
                    </div>
                    <div class="flex items-baseline gap-3">
                       <span class="text-4xl font-black text-white italic tracking-tighter">{{ getMemberSportLevel(member) }}</span>
                    </div>
                  </div>

                  <!-- Average Rating -->
                  <div class="bg-indigo-600/10 p-6 border border-indigo-500/30 rounded-3xl relative overflow-hidden group">
                    <div class="flex items-center gap-3 mb-4">
                       <Activity class="w-5 h-5 text-indigo-400" />
                       <span class="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest">ORT. PERFORMANS</span>
                    </div>
                    <div class="flex items-baseline gap-3">
                       <span class="text-4xl font-black text-white italic tracking-tighter">{{ averageRating }}</span>
                       <span class="text-[0.6rem] text-indigo-500 font-black uppercase tracking-widest italic">PUAN</span>
                    </div>
                  </div>
               </div>

               <!-- Match / Event History -->
               <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div class="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
                     <span class="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Trophy class="w-4 h-4 text-emerald-500" /> MAÇ VE ETKİNLİK GEÇMİŞİ
                     </span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left">
                      <thead>
                        <tr class="bg-slate-950/20 text-[0.6rem] font-black text-slate-500 border-b border-slate-800">
                          <th class="px-6 py-3 uppercase tracking-widest">TARİH</th>
                          <th class="px-6 py-3 uppercase tracking-widest">ETKİNLİK</th>
                          <th class="px-6 py-3 uppercase tracking-widest">RAKİB / KONUM</th>
                          <th class="px-6 py-3 uppercase tracking-widest">SONUÇ</th>
                          <th class="px-6 py-3 uppercase tracking-widest">PERFORMANS</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/5">
                        <tr v-for="perf in performances" :key="perf.id" class="hover:bg-white/[0.02] transition-colors">
                          <td class="px-6 py-4 text-xs font-mono text-slate-300">{{ new Date(perf.event?.date).toLocaleDateString('tr-TR') }}</td>
                          <td class="px-6 py-4">
                            <p class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight">{{ perf.event?.title || 'Bilinmeyen Etkinlik' }}</p>
                            <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">{{ perf.event?.type || 'MATCH' }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <p class="text-[0.65rem] font-bold text-slate-300">{{ perf.event?.opponent || 'RAKİP YOK' }}</p>
                            <span class="text-[0.5rem] font-bold text-slate-600 uppercase">{{ perf.event?.location || 'SAHA BELİRTİLMEMİŞ' }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-[0.65rem] font-black italic shadow-sm px-2 py-0.5 rounded bg-black/40 border border-white/5" 
                                  :class="perf.event?.result?.toUpperCase().includes('G') || perf.event?.result?.toUpperCase().includes('W') ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'">
                              {{ perf.event?.result || '-' }}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                              <div class="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-indigo-500" :style="{width: (perf.coachRating * 10) + '%'}"></div>
                              </div>
                              <span class="text-[0.65rem] font-black text-indigo-400 tabular-nums">{{ perf.coachRating }}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="performances.length === 0" class="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                      <Trophy class="w-8 h-8" />
                      <p class="text-[0.6rem] font-black uppercase tracking-widest italic text-center px-10">BU ÜYENİN HENÜZ KAYITLI BİR MAÇ VEYA ETKİNLİK PERFORMANSI BULUNMUYOR.</p>
                  </div>
               </div>
          </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex items-center justify-between">
         <div class="flex items-center gap-3">
           <div class="p-0.5 bg-rose-500/10 border border-rose-500/30 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]">
             <BaseMemberAvatar 
               :src="member?.photo" 
               :name="member?.fullName" 
               size="md"
             />
           </div>
           <div>
             <p class="text-[0.65rem] font-black text-slate-100 uppercase tracking-tight italic">{{ member?.fullName }}</p>
             <p class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">{{ member?.membershipType }} ÜYE</p>
           </div>
         </div>

         <div class="flex gap-2">
            <BaseButton variant="warning" size="sm" @click="$emit('edit', member)">
              <template #icon><Edit class="w-4 h-4" /></template>
              PROFİLİ DÜZENLE
            </BaseButton>
            <BaseButton variant="dark" size="sm" @click="$emit('qr', member)">
              <template #icon><QrCode class="w-4 h-4" /></template>
              QR KOD
            </BaseButton>
            <div class="w-px h-8 bg-slate-800 mx-1"></div>
            <BaseButton variant="dark" size="sm" @click="localShow = false">
              <template #icon><X class="w-4 h-4" /></template>
              KAPAT
            </BaseButton>
         </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { 
  Activity, Layers, Trophy, Check, Moon, MonitorOff, 
  Zap, History, Scale, Loader2, Edit, QrCode, X, ShieldCheck
} from 'lucide-vue-next'
import BaseModal from '../../base/BaseModal.vue'
import BaseButton from '../../base/BaseButton.vue'
import BaseMemberAvatar from '../../base/BaseMemberAvatar.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  member: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'edit', 'qr'])

const localShow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('program')
const loading = ref(false)
const measurements = ref([])
const planDetails = ref(null)
const performances = ref([])
const completedDays = ref([])
const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

watch(() => props.modelValue, (val) => {
  if (val && props.member) {
    loadPortalData()
  }
})

const loadPortalData = async () => {
  if (!props.member) return
  loading.value = true
  try {
    const memberId = props.member.id
    
    // measurements
    const mResp = await axios.get(`http://${window.location.hostname}:5000/api/body-measurements?memberId=${memberId}`)
    measurements.value = mResp.data
    
    // training plan
    const pResp = await axios.get(`http://${window.location.hostname}:5000/api/training-plans/active?memberId=${memberId}`)
    if (pResp.data) {
        await fetchPlanDetails(pResp.data)
    } else {
        planDetails.value = null
    }
    
    // performances
    const perfResp = await axios.get(`http://${window.location.hostname}:5000/api/sport-performances/member/${memberId}`)
    performances.value = perfResp.data
    
  } catch (err) {
    console.error('Portal data load error:', err)
  } finally {
    loading.value = false
  }
}

const fetchPlanDetails = async (plan) => {
  try {
    const response = await axios.get(`http://${window.location.hostname}:5000/api/training-plans/${plan.id}`)
    const details = response.data
    
    const dayNames = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR']
    const planDays = Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (i + 1) % 7 || 7
      const existing = details.items.find(item => item.dayOfWeek === dayIdx)
      return {
          dayOfWeek: dayIdx,
          isRestDay: !existing,
          startTime: existing?.startTime || '09:00',
          endTime: existing?.endTime || '10:30'
      }
    }).sort((a,b) => (a.dayOfWeek === 7 ? 6.5 : a.dayOfWeek - 1) - (b.dayOfWeek === 7 ? 6.5 : b.dayOfWeek - 1))

    planDetails.value = {
        ...details,
        days: planDays
    }
    
    const logsResp = await axios.get(`http://${window.location.hostname}:5000/api/training-logs?planId=${plan.id}&week=1`)
    completedDays.value = logsResp.data.map(log => `${log.planId}-${log.week}-${log.dayOfWeek}`)
  } catch (err) {
    console.error('Plan details error:', err)
  }
}

const successRate = computed(() => {
    if (!props.member || !measurements.value || measurements.value.length < 2) return 0;
    const initial = measurements.value[measurements.value.length - 1].weight;
    const current = measurements.value[0].weight;
    const target = props.member.targetWeight || (initial - 5);
    const progress = Math.abs(initial - current);
    const totalGoal = Math.abs(initial - target);
    if (totalGoal <= 0) return 0;
    return Math.min(Math.round((progress / totalGoal) * 100), 100);
})

const averageRating = computed(() => {
  if (!performances.value || performances.value.length === 0) return '0.0'
  const total = performances.value.reduce((acc, p) => acc + Number(p.coachRating), 0)
  return (total / performances.value.length).toFixed(1)
})

const getBMIStatus = (bmi) => {
  if (!bmi) return { label: '-', color: 'text-slate-500' }
  const val = Number(bmi)
  if (val < 18.5) return { label: 'ZAYIF', color: 'text-sky-400' }
  if (val < 25) return { label: 'NORMAL', color: 'text-emerald-400' }
  if (val < 30) return { label: 'KİLOLU', color: 'text-amber-400' }
  return { label: 'OBEZ', color: 'text-rose-500' }
}

const getBmiClass = (bmi) => {
  if (!bmi) return 'text-slate-500'
  const val = Number(bmi)
  if (val < 18.5) return 'text-sky-400'
  if (val < 25) return 'text-emerald-400'
  if (val < 30) return 'text-amber-400'
  return 'text-rose-500'
}

const getMemberPosition = (member) => {
  if (!member?.specialtyId || !member?.sportProfiles) return null
  const profile = member.sportProfiles.find(p => p.specialtyId === member.specialtyId)
  return profile?.extraData?.position || null
}

const getMemberSportLevel = (member) => {
  if (!member?.specialtyId || !member?.sportProfiles) return 'AMATÖR'
  const profile = member.sportProfiles.find(p => p.specialtyId === member.specialtyId)
  return profile ? profile.level : 'AMATÖR'
}
</script>

<style scoped>
.premium-portal-modal :deep(.modal-content) {
  max-width: 1000px !important;
}
</style>
