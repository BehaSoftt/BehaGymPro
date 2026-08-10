<template>
  <div class="w-full lg:w-[350px] xl:w-[400px] flex-none bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col lg:overflow-hidden relative z-10 shadow-2xl">
     <div class="lg:flex-1 lg:overflow-y-auto custom-scrollbar p-5 lg:p-6 space-y-8">
        
        <!-- General Info Panel -->
        <div class="space-y-6 bg-slate-950/50 p-5 border border-slate-800 shadow-inner">
           <div class="flex items-center gap-2 mb-2">
              <Settings class="w-3.5 h-3.5 text-slate-500" />
              <span class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">GENEL AYARLAR</span>
           </div>
            
            <div class="space-y-4 pt-1">
               <!-- Plan Durumu Toggle -->
               <div class="flex items-center justify-between p-3 bg-slate-900 border border-slate-800">
                  <div class="text-left">
                     <p class="text-[0.65rem] font-black text-slate-100 uppercase tracking-widest leading-none">PLAN DURUMU</p>
                     <p class="text-[0.5rem] text-slate-500 uppercase font-bold mt-1.5">{{ modelValue.isActive ? 'AKTİF' : 'PASİF' }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" v-model="internalPlan.isActive" class="sr-only peer">
                     <div class="w-9 h-5 bg-slate-800 border border-slate-700 peer peer-checked:bg-emerald-600 transition-all duration-300 
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-4 after:w-4 
                                 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white shadow-inner"></div>
                  </label>
               </div>
               
                <div>
                   <label class="flex items-center justify-between mb-1 ml-1">
                      <span class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Plan Başlığı</span>
                      <span v-if="!internalPlan.title" class="text-[0.5rem] font-black text-rose-500 animate-pulse">ZORUNLU ALAN</span>
                   </label>
                   <input 
                      v-model="internalPlan.title" 
                      type="text" 
                      placeholder="PROGRAM BAŞLIĞI GİRİNİZ..." 
                      :class="[!internalPlan.title ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800 bg-slate-900/80 focus:border-indigo-500']"
                      class="w-full border px-4 py-3 text-slate-100 outline-none font-bold uppercase text-xs tracking-tight transition-all shadow-inner" 
                   />
                </div>

               <div class="grid grid-cols-2 gap-3">
                  <div>
                     <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Şube</label>
                     <div class="relative">
                        <select v-model="internalPlan.branchId" class="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 font-bold uppercase text-xs appearance-none transition-all">
                           <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                        <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                     </div>
                  </div>
                  <div>
                     <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Seviye</label>
                     <div class="relative">
                        <select v-model.number="internalPlan.level" class="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 font-bold uppercase text-xs appearance-none transition-all">
                           <option v-for="n in 20" :key="n" :value="n">Lv {{ n }}</option>
                        </select>
                        <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                     </div>
                  </div>
               </div>

               <div>
                  <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Branş</label>
                  <div class="relative">
                     <select v-model="internalPlan.specialtyId" class="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 font-bold uppercase text-xs appearance-none transition-all">
                        <option :value="null">BRANŞ SEÇİN...</option>
                        <option v-for="s in specialties" :key="s.id" :value="s.id">{{ s.name }}</option>
                     </select>
                     <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  </div>
               </div>

               <div>
                   <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Sorumlu Eğitmen</label>
                   <div class="relative">
                      <select v-model="internalPlan.instructorId" class="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 font-bold uppercase text-xs appearance-none transition-all">
                         <option :value="null">EĞİTMEN SEÇİN...</option>
                         <option v-for="inst in instructors" :key="inst.id" :value="inst.id">{{ inst.displayName || inst.fullName }}</option>
                      </select>
                      <ChevronDown class="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                   </div>
                </div>

               <div>
                  <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">İlgili Üye</label>
                  <button type="button" @click="$emit('openMemberPicker')" class="w-full bg-slate-900 border border-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 font-bold uppercase text-xs transition-all flex items-center justify-between group">
                     <span :class="internalPlan.memberId ? 'text-indigo-400' : 'text-slate-500'">{{ selectedMemberName }}</span>
                     <Search class="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                  </button>
               </div>

              <div v-show="internalPlan.memberId">
                 <label class="block text-[0.65rem] text-left font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Plan Dönemi (Ay Seviyesi)</label>
                 <div class="grid grid-cols-3 gap-2">
                    <button 
                       v-for="(month, idx) in timelineMonths.slice(0, 6)" :key="idx" @click.prevent="$emit('selectMonth', month)"
                       :class="[ 'py-2.5 border text-[0.65rem] font-black uppercase transition-all', isMonthSelected(month) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : isMonthHasExistingPlan(month) ? 'bg-slate-800 border-amber-500/50 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700' ]"
                    >
                       {{ month.label }}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <!-- Day Selection List -->
        <div class="space-y-4 pb-12">
           <div class="flex items-center gap-2 mb-2 pl-1">
              <CalendarDays class="w-3.5 h-3.5 text-slate-500" />
              <span class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">ANTRENMAN TAKVİMİ</span>
           </div>
           <div class="grid grid-cols-1 gap-2">
              <button 
                 v-for="(day, idx) in daysOfWeek" :key="idx" 
                 @click="$emit('update:activeDayIndex', idx)"
                 :class="[
                    'flex items-center justify-between p-4 border transition-all rounded-2xl group',
                    activeDayIndex === idx ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 translate-x-2' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
                 ]"
              >
                 <div class="flex items-center gap-3">
                    <div :class="activeDayIndex === idx ? 'bg-white/20' : 'bg-slate-900'" class="w-8 h-8 rounded-lg flex items-center justify-center text-[0.6rem] font-black">
                       {{ idx + 1 }}
                    </div>
                    <div class="text-left">
                       <span class="block text-[0.7rem] font-black uppercase tracking-widest leading-none">{{ day }}</span>
                       <span class="block text-[0.55rem] mt-1 uppercase font-bold text-indigo-400 group-hover:text-indigo-300" v-if="!isDayRest(idx)">{{ getDayFocus(idx) }}</span>
                       <span class="block text-[0.55rem] mt-1 uppercase font-bold text-rose-500/60" v-else>DİNLENME GÜNÜ</span>
                    </div>
                 </div>
                 <div v-if="!isDayRest(idx)" class="flex flex-col items-end">
                    <span class="text-[0.6rem] font-bold opacity-60">{{ getDayItemsCount(idx) }} İstasyon</span>
                    <span class="text-[0.5rem] font-black tracking-tighter">{{ getDayCalories(idx) }} KCAL</span>
                 </div>
                 <BedDouble v-else class="w-4 h-4 text-rose-500/40" />
              </button>
           </div>
        </div>
     </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Settings, ChevronDown, Search, CalendarDays, BedDouble } from 'lucide-vue-next'
import { useDataStore } from '../../store/data'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const { exercises: storeExercises } = storeToRefs(dataStore)

const props = defineProps({
  modelValue: { type: Object, required: true },
  activeDayIndex: { type: Number, default: 0 },
  branches: { type: Array, default: () => [] },
  specialties: { type: Array, default: () => [] },
  instructors: { type: Array, default: () => [] },
  timelineMonths: { type: Array, default: () => [] },
  selectedMemberName: { type: String, default: 'GENEL ŞABLON' },
  daysOfWeek: { type: Array, required: true },
  plans: { type: Array, default: () => [] },
  exercises: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'update:activeDayIndex', 'openMemberPicker', 'selectMonth'])

const internalPlan = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isDayRest = (idx) => {
  const day = internalPlan.value.days.find(d => d.dayOfWeek === idx)
  return day ? day.isRestDay : false
}

const getDayItemsCount = (idx) => {
  return internalPlan.value.items.filter(i => i.dayOfWeek === idx).length
}

const getDayFocus = (idx) => {
  const dayItems = internalPlan.value.items.filter(i => i.dayOfWeek === idx)
  if (!dayItems.length) return 'BİLEŞEN YOK'
  
  const counts = {}
  const actualExercises = props.exercises?.length ? props.exercises : storeExercises.value
  
  dayItems.forEach(item => {
    const ex = (actualExercises || []).find(e => e.id === item.exerciseId)
    const catName = ex?.category?.name || 'GENEL'
    counts[catName] = (counts[catName] || 0) + 1
  })
  
  return Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0]?.toUpperCase() || 'ODAKLANIYOR...'
}

const getDayCalories = (idx) => {
  const dayItems = internalPlan.value.items.filter(i => i.dayOfWeek === idx)
  const actualExercises = props.exercises?.length ? props.exercises : storeExercises.value
  
  return dayItems.reduce((sum, item) => {
    const ex = (actualExercises || []).find(e => e.id === item.exerciseId)
    return sum + ((item.durationMinutes || 0) * (ex?.caloriesPerMinute || 0))
  }, 0)
}

const isMonthSelected = (month) => {
  return internalPlan.value.startDate === month.startDate && internalPlan.value.endDate === month.endDate
}

const isMonthHasExistingPlan = (month) => {
  if (!internalPlan.value.memberId) return false
  return props.plans.some(p => 
    p.memberId === internalPlan.value.memberId && 
    p.startDate?.split('T')[0] === month.startDate && 
    p.endDate?.split('T')[0] === month.endDate
  )
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); }
</style>
