<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Days Grid -->
    <div v-if="loading" class="h-80 flex flex-col items-center justify-center gap-4 opacity-50">
      <Loader2 class="w-12 h-12 animate-spin text-rose-500" />
      <p class="text-xs font-black uppercase tracking-[0.3em]">Program Hazırlanıyor...</p>
    </div>

    <div v-else-if="filteredDays.length === 0" class="h-80 flex flex-col items-center justify-center gap-3 opacity-30 italic border-4 border-dashed border-slate-800 rounded-none">
      <Dumbbell class="w-16 h-16" />
      <p class="text-[0.7rem] font-black uppercase tracking-widest">BU KRİTERDE BİR KAYIT BULUNAMADI</p>
      <button @click="$emit('clear-filter')" class="text-sky-400 text-[0.6rem] font-bold border-b border-sky-400/30 uppercase tracking-widest">TÜM LİSTEYİ GÖSTER</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      <div v-for="day in filteredDays" :key="day.dayOfWeek" 
           :class="['group rounded-none border flex flex-col overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl relative', getDayCardClass(day)]">
        
        <!-- Day Header -->
        <div :class="['px-6 py-4 flex flex-col gap-1 relative overflow-hidden', getDayHeaderClass(day)]">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-none"></div>
          <div class="flex items-start justify-between relative z-10">
            <div class="flex flex-col">
              <h3 class="text-xl font-black uppercase tracking-tighter text-white italic leading-none">
                {{ daysOfWeek[day.dayOfWeek] }}
              </h3>
              <span class="text-[0.55rem] font-black text-slate-100/50 tracking-[0.2em] mt-1 italic uppercase">{{ day.isRestDay ? 'DİNLENME GÜNÜ' : 'PROGRAM GÜNÜ' }}</span>
            </div>
            <!-- Status Icon -->
            <div v-if="!day.isRestDay" class="flex-none">
              <div v-if="isDayCompleted(day.dayOfWeek)" class="w-8 h-8 rounded-none bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Check class="w-4 h-4 text-emerald-400" />
              </div>
              <div v-else-if="isDayMissed(day.dayOfWeek)" class="w-8 h-8 rounded-none bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <X class="w-4 h-4 text-rose-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div v-if="!day.isRestDay" class="p-5 flex-1 flex flex-col gap-4">
           <div class="flex items-center justify-between">
             <div class="flex items-center gap-2">
                <Clock class="w-3.5 h-3.5 text-slate-500" />
                <span class="text-[0.7rem] font-black text-slate-300 tracking-wider">
                   {{ (day.startTime || '09:00').substring(0,5) }} – {{ (day.endTime || '10:30').substring(0,5) }}
                </span>
             </div>
              <div class="flex gap-1 flex-wrap justify-end">
                 <span 
                   v-for="branch in getDayCategories(day.dayOfWeek)" 
                   :key="branch.name" 
                   @click="$emit('open-image', branch)"
                   :class="[
                     'text-[0.65rem] font-black px-3 py-1 rounded-none uppercase shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-all',
                     branch.image ? 'cursor-pointer bg-indigo-500/20 border-2 border-indigo-400 hover:bg-indigo-500 hover:text-white hover:scale-105 active:scale-95 text-indigo-300' : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 tracking-wider'
                   ]"
                 >
                    {{ branch.name }}
                    <BookOpen v-if="branch.image" class="w-3 h-3 inline-block ml-1 opacity-60" />
                 </span>
              </div>
           </div>

           <div class="space-y-2 flex-1">
              <div v-for="ex in planItems.filter(i => i.dayOfWeek === day.dayOfWeek)" :key="ex.id" 
                   class="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 rounded-none hover:border-slate-600 transition-all border-l-4 border-l-rose-600 shadow-sm group/ex">
                 <div class="flex items-center gap-3 min-w-0">
                    <div class="w-2 h-2 rounded-none bg-rose-600/40 group-hover/ex:bg-rose-500 transition-colors"></div>
                    <span class="text-[0.65rem] font-black text-slate-100 uppercase italic truncate">{{ ex.exercise?.name }}</span>
                 </div>
                 <div class="flex-none flex items-center gap-2 text-[0.6rem] font-black text-emerald-400 tabular-nums bg-slate-900 px-2 py-1 rounded">
                    {{ ex.sets }}x{{ ex.reps || ex.durationMinutes }} {{ ex.reps ? 'TKR' : 'DK' }}
                 </div>
              </div>
           </div>

            <button
              v-if="!isDayCompleted(day.dayOfWeek)"
              @click="$emit('toggle-completion', day.dayOfWeek)"
              :disabled="isFutureDay(day.dayOfWeek)"
              :class="[
                isDayMissed(day.dayOfWeek) ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500',
                isFutureDay(day.dayOfWeek) ? 'opacity-30 cursor-not-allowed grayscale !shadow-none !scale-100' : 'shadow-xl active:scale-95 shadow-emerald-900/10'
              ]"
              class="w-full py-3 text-[0.65rem] font-black uppercase tracking-widest text-white rounded-none transition-all"
            >
               <span v-if="isFutureDay(day.dayOfWeek)">GELECEK DERS</span>
               <span v-else>{{ isDayMissed(day.dayOfWeek) ? 'TELAFİ ONAYI' : 'ANTRENMANI BİTİR' }}</span>
            </button>
            <button v-else-if="Number(day.dayOfWeek) === ((new Date().getDay() + 6) % 7)"
              @click="$emit('toggle-completion', day.dayOfWeek)"
              class="w-full py-3 text-[0.65rem] font-black uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 rounded-none hover:text-rose-400 hover:border-rose-400 transition-all"
            >
               GERİ AL
            </button>
            <div v-else class="w-full py-3 text-[0.65rem] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-none flex items-center justify-center gap-2">
               <Check class="w-4 h-4" />
               TAMAMLANDI
            </div>
        </div>

        <!-- Rest Day Large View -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-10 opacity-30 italic">
           <div class="w-20 h-20 bg-indigo-500/5 border border-indigo-500/20 rounded-none flex items-center justify-center mb-4 shadow-inner">
              <Moon class="w-10 h-10 text-indigo-500/30" />
           </div>
           <span class="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-800 pb-1">KAS DİNLENMESİ</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader2, Dumbbell, Check, X, Clock, BookOpen, Moon } from 'lucide-vue-next'

const props = defineProps({
  loading: Boolean,
  filteredDays: Array,
  isDayCompleted: Function,
  isDayMissed: Function,
  isFutureDay: Function,
  getDayCardClass: Function,
  getDayHeaderClass: Function,
  getDayCategories: Function,
  planItems: Array
})

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

defineEmits(['clear-filter', 'open-image', 'toggle-completion'])
</script>
