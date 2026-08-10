<template>
  <div class="flex-1 bg-slate-950/30 xl:overflow-y-auto custom-scrollbar relative p-4 md:p-8 xl:p-12 min-h-[600px] xl:min-h-0">
     
     <div v-if="activeDayIndex !== null" class="w-full space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
        
        <!-- Day Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
           <div class="text-left">
              <div class="flex items-center gap-3 mb-2">
                 <span class="text-[0.65rem] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 border border-indigo-500/20 tracking-widest uppercase">{{ activeDayIndex + 1 }}. GÜN</span>
                 <span v-if="isRestDay" class="text-[0.65rem] font-black text-rose-500 bg-rose-500/10 px-3 py-1 border border-rose-500/20 tracking-widest uppercase">OFF GÜNÜ</span>
              </div>
              <h1 class="text-3xl font-black text-white uppercase tracking-tighter">{{ dayName }} <span class="text-slate-700">ANTRENMANI</span></h1>
           </div>

           <div class="flex items-center gap-2">
              <div v-if="!isRestDay" class="flex items-center gap-2 bg-slate-900 p-2 border border-slate-800 mr-4 shadow-lg">
                 <Clock class="w-3.5 h-3.5 text-emerald-400" />
                 <input v-model="dayData.startTime" type="time" class="bg-transparent text-xs font-black text-slate-100 outline-none w-14 [color-scheme:dark]" />
                 <span class="text-slate-700">-</span>
                 <input v-model="dayData.endTime" type="time" class="bg-transparent text-xs font-black text-slate-100 outline-none w-14 [color-scheme:dark]" />
              </div>
              
              <button @click.prevent="$emit('copyDay')" class="p-3 bg-slate-900 border border-slate-800 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90" title="Günü Kopyala">
                 <Copy class="w-4 h-4" />
              </button>
              
              <div class="flex items-center gap-4 bg-slate-900 p-2.5 border border-slate-800 shadow-lg">
                 <div class="text-right">
                    <p class="text-[0.65rem] font-black text-slate-100 uppercase tracking-widest leading-none">DİNLENME GÜNÜ</p>
                    <p class="text-[0.5rem] text-rose-500 uppercase font-bold mt-1">{{ isRestDay ? 'EVET' : 'HAYIR' }}</p>
                 </div>
                 <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="isRestDay" @change="$emit('toggleRestDay')" class="sr-only peer">
                    <div class="w-10 h-5 bg-slate-800 border border-slate-700 peer peer-checked:bg-rose-600 transition-all duration-300 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-4 after:w-4 
                                after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white shadow-inner"></div>
                 </label>
              </div>
           </div>
        </div>

        <!-- Exercises List -->
        <div v-if="!isRestDay" class="space-y-6 pb-20">
           


           <div class="grid grid-cols-1 gap-4">
              <div v-for="(item, itemIdx) in items" :key="itemIdx" class="bg-slate-900/80 border border-slate-800/80 p-5 flex flex-col gap-5 hover:border-indigo-500/30 transition-all group/card relative">
                 <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                       <div class="relative group/select">
                          <select v-model="item.exerciseId" @change="$emit('checkBulkAdd', item)" class="w-full bg-slate-950 border border-slate-800 px-5 py-3.5 text-sm font-bold text-slate-100 outline-none cursor-pointer uppercase tracking-tight appearance-none group-focus-within/select:border-indigo-500 transition-all">
                            <option value="" disabled>ANTRENMAN İSTASYONU SEÇİN...</option>
                            <optgroup v-for="(groupExs, groupName) in groupedExercises" :key="groupName" :label="groupName" class="bg-slate-900 text-slate-500 font-black">
                              <option :value="'BULK:' + groupName" class="text-indigo-400 font-black"> ➕ GRUP: {{ groupName }} ({{ groupExs.length }} ADET) </option>
                              <option v-for="ex in groupExs" :key="ex.id" :value="ex.id" class="text-slate-200"> {{ ex.name }} (L{{ ex.level || 1 }}) - {{ ex.criterionType }} </option>
                            </optgroup>
                          </select>
                          <LayoutGrid class="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/select:text-indigo-500 pointer-events-none" />
                       </div>
                    </div>
                    <button @click.prevent="$emit('removeItem', item)" class="p-4 bg-rose-600/5 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-600/10 transition-all active:scale-90" title="İstasyonu Kaldır">
                       <Trash2 class="w-5 h-5" />
                    </button>
                 </div>

                 <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mt-3 bg-slate-950/40 p-3 md:p-4 border border-slate-800/50">
                    <div v-show="['DURATION', 'ROUNDS_DURATION', 'HYBRID'].includes(getItemCriterion(item))" class="flex flex-col gap-1.5 text-left">
                       <label class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest pl-1">DAKİKA</label>
                       <div class="relative">
                          <Timer class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input v-model.number="item.durationMinutes" type="number" class="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all" />
                       </div>
                    </div>
                    <div v-show="['ROUNDS_DURATION', 'HYBRID'].includes(getItemCriterion(item))" class="flex flex-col gap-1.5 text-left">
                       <label class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest pl-1">RAUND</label>
                       <div class="relative">
                          <RefreshCw class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input v-model.number="item.rounds" type="number" class="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-black text-sky-400 outline-none focus:border-sky-500 transition-all" />
                       </div>
                    </div>
                    <div v-show="['SETS_REPS', 'REPS_ONLY', 'HYBRID'].includes(getItemCriterion(item))" class="flex flex-col gap-1.5 text-left">
                       <label class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest pl-1">SET</label>
                       <div class="relative">
                          <Layers class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input v-model.number="item.sets" type="number" class="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-black text-purple-400 outline-none focus:border-purple-500 transition-all" />
                       </div>
                    </div>
                    <div v-show="['SETS_REPS', 'REPS_ONLY', 'HYBRID'].includes(getItemCriterion(item))" class="flex flex-col gap-1.5 text-left">
                       <label class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest pl-1">TEKRAR</label>
                       <div class="relative">
                          <Hash class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input v-model.number="item.reps" type="number" class="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-black text-orange-400 outline-none focus:border-orange-500 transition-all" />
                       </div>
                    </div>
                    <div v-show="['SETS_REPS', 'HYBRID'].includes(getItemCriterion(item))" class="flex flex-col gap-1.5 text-left">
                       <label class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest pl-1">AĞIRLIK (KG)</label>
                       <div class="relative">
                          <Weight class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input v-model.number="item.weight" type="number" class="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs font-black text-rose-400 outline-none focus:border-rose-500 transition-all" />
                       </div>
                    </div>
                    <div class="flex flex-col justify-end">
                       <div class="bg-emerald-600/10 border border-emerald-500/20 py-2.5 px-3 text-center shadow-lg h-[36px] flex flex-col items-center justify-center">
                          <span class="block text-[0.45rem] font-black text-emerald-500/60 leading-none mb-0.5">ENERJİ</span>
                          <span class="text-[0.65rem] font-black text-emerald-400 tracking-tighter">{{ calculateItemCalories(item) }} KCAL</span>
                       </div>
                    </div>
                 </div>
                 <div class="relative mt-4">
                    <MessageSquare class="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input v-model="item.notes" type="text" placeholder="BU İSTASYON İÇİN ÖZEL NOTUNUZ VAR MI?" class="w-full bg-slate-950/50 border border-slate-800/50 pl-11 pr-4 py-3 text-[0.65rem] font-black text-slate-400 placeholder:text-slate-700 outline-none focus:border-indigo-500/40 uppercase tracking-widest transition-all" />
                 </div>
              </div>
           </div>

           <div v-if="items.length === 0" class="py-24 bg-slate-900/30 border-2 border-dashed border-slate-800 text-center group cursor-pointer hover:border-indigo-500/30 transition-all" @click="$emit('addItem')">
              <div class="inline-flex p-5 bg-slate-800 border border-slate-700 mb-4 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all">
                 <Plus class="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p class="text-xs font-black text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-[0.3em]">HİÇ İSTASYON EKLENMEDİ</p>
              <p class="text-[0.65rem] text-slate-700 uppercase tracking-widest mt-2">Ders içeriğini oluşturmak için tıkla veya butonu kullan</p>
           </div>
        </div>

        <!-- Rest Day View -->
        <div v-else class="flex flex-col items-center justify-center py-40 bg-slate-900/40 border border-slate-800 animate-pulse">
           <div class="p-8 bg-rose-600/5 mb-6">
              <BedDouble class="w-16 h-16 text-rose-500/20" />
           </div>
           <h2 class="text-xl font-black text-rose-500/40 uppercase tracking-[0.4em]">RECOVERY DAY</h2>
           <p class="text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest mt-4">Bu gün için herhangi bir antrenman tanımlanmadı</p>
           <button @click="$emit('toggleRestDay')" class="mt-8 px-8 py-4 bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all rounded-2xl text-[0.65rem] font-black uppercase tracking-widest">AKTİFLEŞTİR</button>
        </div>
     </div>
  </div>
</template>

<script setup>
import { Clock, Copy, Trash2, LayoutGrid, Timer, RefreshCw, Layers, Hash, Weight, MessageSquare, Plus, BedDouble } from 'lucide-vue-next'
import { computed } from 'vue'
import { useDataStore } from '../../store/data'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const { exercises: storeExercises } = storeToRefs(dataStore)

const props = defineProps({
  activeDayIndex: { type: Number, required: true },
  dayName: { type: String, required: true },
  dayData: { type: Object, required: true },
  isRestDay: { type: Boolean, required: true },
  items: { type: Array, default: () => [] },
  groupedExercises: { type: Object, default: () => ({}) },
  exercises: { type: Array, default: () => [] }
})

const emit = defineEmits(['copyDay', 'toggleRestDay', 'removeItem', 'checkBulkAdd', 'addItem'])

const getItemCriterion = (item) => {
  const actualExercises = props.exercises?.length ? props.exercises : storeExercises.value
  const ex = (actualExercises || []).find(e => e.id === item.exerciseId)
  return ex ? ex.criterionType : 'HYBRID'
}

const calculateItemCalories = (item) => {
  const actualExercises = props.exercises?.length ? props.exercises : storeExercises.value
  const ex = (actualExercises || []).find(e => e.id === item.exerciseId)
  if (!ex || !ex.caloriesPerMinute) return 0
  return (item.durationMinutes || 0) * ex.caloriesPerMinute
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); }
</style>
