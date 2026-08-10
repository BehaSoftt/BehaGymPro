<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Analysis Indicators -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- BKİ CARD -->
        <div class="bg-indigo-600/10 p-5 md:p-8 border-2 border-indigo-500/30 rounded-none shadow-2xl relative overflow-hidden group hover:border-indigo-500 transition-all cursor-pointer">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-3 mb-6 relative z-10">
                <Activity class="w-6 h-6 text-indigo-400 animate-pulse" />
                <span class="text-[0.55rem] md:text-[0.6rem] text-slate-400 font-black uppercase tracking-[0.4em]">VÜCUT KİTLE ENDEKSİ</span>
            </div>
            <div class="relative z-10">
               <div class="flex items-baseline justify-between">
                 <span class="text-3xl md:text-5xl font-black text-indigo-500 tracking-tighter tabular-nums italic">{{ latestMeasurement.bmi || '-' }}</span>
                 <span :class="getBmiClass(latestMeasurement.bmi)" class="text-[0.65rem] md:text-[0.8rem] font-black italic tracking-widest uppercase">
                   {{ getBMIStatus(latestMeasurement.bmi).label }}
                 </span>
               </div>
               <div class="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-none overflow-hidden mt-4 shadow-inner">
                 <div class="bg-indigo-500 h-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" :style="{width: (latestMeasurement.bmi ? Math.min((latestMeasurement.bmi/40)*100, 100) : 0) + '%'}"></div>
               </div>
            </div>
        </div>

        <!-- BMR CARD -->
        <div class="bg-emerald-600/10 p-5 md:p-8 border-2 border-emerald-500/30 rounded-none shadow-2xl relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-3 mb-6 relative z-10">
                <Zap class="w-6 h-6 text-emerald-400 animate-bounce-slow" />
                <span class="text-[0.55rem] md:text-[0.6rem] text-slate-400 font-black uppercase tracking-[0.4em]">BAZAL METABOLİZMA</span>
            </div>
            <div class="relative z-10 flex items-baseline gap-2">
               <span class="text-3xl md:text-5xl font-black text-emerald-500 tracking-tighter tabular-nums italic">{{ latestMeasurement.bmr || '-' }}</span>
               <span class="text-[0.65rem] md:text-[0.8rem] text-slate-400 font-black italic tracking-widest uppercase">KCAL / GÜN</span>
            </div>
        </div>

        <!-- PROGRESS CARD -->
        <div class="bg-rose-600/10 p-5 md:p-8 border-2 border-rose-500/30 rounded-none shadow-2xl relative overflow-hidden group hover:border-rose-500 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-3 mb-6 relative z-10">
                <TrendingDown class="w-6 h-6 text-rose-400" />
                <span class="text-[0.55rem] md:text-[0.6rem] text-slate-400 font-black uppercase tracking-[0.4em]">HAFTALIK BAŞARI</span>
            </div>
            <div class="relative z-10">
               <div class="flex items-baseline gap-2">
                  <span class="text-3xl md:text-5xl font-black text-rose-500 tracking-tighter tabular-nums italic">{{ completionRate }}%</span>
                  <span class="text-[0.65rem] md:text-[0.8rem] text-slate-400 font-black italic tracking-widest uppercase">TAMAM</span>
               </div>
               <div class="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-none overflow-hidden mt-6 shadow-inner">
                 <div class="bg-rose-600 h-full shadow-[0_0_15px_rgba(225,29,72,0.8)]" :style="{width: completionRate + '%' }"></div>
               </div>
            </div>
        </div>
    </div>

    <!-- Measurement History List -->
    <div class="bg-slate-900 border-2 border-slate-800 rounded-none p-8 shadow-2xl relative">
        <div class="flex items-center justify-between mb-8">
           <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-slate-800 rounded-none flex items-center justify-center border border-slate-700">
                 <History class="w-5 h-5 text-slate-400" />
              </div>
              <h3 class="text-xl font-black text-white uppercase tracking-tighter italic">ÖLÇÜM GEÇMİŞİ</h3>
           </div>
            <div class="flex items-center gap-3">
              <span class="text-[0.6rem] text-slate-500 font-black uppercase tracking-[0.2em]">{{ measurements.length }} KAYIT LİSTELENDİ</span>
              <button @click="$emit('add-measurement')" class="w-10 h-10 flex items-center justify-center bg-indigo-600 border border-indigo-400/50 text-white rounded-none hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10 active:scale-95 group/add" title="Yeni Ölçüm Ekle">
                 <Plus class="w-5 h-5 group-hover/add:scale-110 transition-transform" />
              </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           <div v-for="m in measurements" :key="m.id" class="p-5 bg-slate-950/60 border border-slate-800 rounded-none group hover:border-indigo-500/50 transition-all hover:bg-slate-950">
              <div class="flex justify-between items-center mb-4">
                 <div class="flex flex-col">
                    <span class="text-[0.5rem] text-slate-600 font-black uppercase tracking-widest">TARİH</span>
                    <span class="text-[0.7rem] font-bold text-slate-300 font-mono">{{ new Date(m.measurementDate).toLocaleDateString('tr-TR') }}</span>
                 </div>
                 <BaseBadge type="indigo" class="text-[0.5rem]">{{ m.period || 'Haftalık' }}</BaseBadge>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4 bg-slate-900/40 p-3 rounded-none border border-white/5 shadow-inner">
                 <div class="flex flex-col">
                    <span class="text-[0.45rem] text-slate-500 font-black tracking-widest uppercase mb-1">KİLO</span>
                    <span class="text-lg font-black text-white italic tracking-tighter tabular-nums">{{ m.weight }}<span class="text-[0.55rem] text-slate-500 ml-1">KG</span></span>
                 </div>
                 <div class="flex flex-col border-l border-slate-800 pl-4 text-right">
                    <span class="text-[0.45rem] text-slate-500 font-black tracking-widest uppercase mb-1">BKİ</span>
                    <span :class="getBmiClass(m.bmi)" class="text-lg font-black italic tracking-tighter tabular-nums">{{ m.bmi }}</span>
                 </div>
              </div>
              <div class="grid grid-cols-2 gap-2 mb-4">
                 <div class="flex flex-col p-2 bg-slate-900/50 border border-white/5">
                    <span class="text-[0.4rem] text-slate-500 font-black uppercase tracking-widest">GÖĞÜS/BEL</span>
                    <span class="text-[0.65rem] font-black text-rose-400 italic tabular-nums leading-none">{{ m.chest || '-' }}/{{ m.waist || '-' }}</span>
                 </div>
                 <div class="flex flex-col p-2 bg-slate-900/50 border border-white/5">
                    <span class="text-[0.4rem] text-slate-500 font-black uppercase tracking-widest">KALÇA/PAZU</span>
                    <span class="text-[0.65rem] font-black text-emerald-400 italic tabular-nums leading-none">{{ m.hips || '-' }}/{{ m.rightBicep || '-' }}</span>
                 </div>
              </div>
              <div class="flex items-center justify-center p-2 bg-slate-900/50 rounded-none border border-slate-800">
                 <span :class="getBmiClass(m.bmi)" class="text-[0.55rem] font-black uppercase tracking-widest">{{ getBMIStatus(m.bmi).label }}</span>
              </div>
           </div>
        </div>

        <div v-if="measurements.length === 0" class="py-20 flex flex-col items-center justify-center gap-4 opacity-20 border-4 border-dashed border-slate-800 rounded-[2rem] italic">
           <Scale class="w-16 h-16" />
           <p class="text-xs font-black uppercase tracking-widest">Henüz bir ölçüm kaydınız bulunmuyor.</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { Activity, Zap, TrendingDown, History, Plus, Scale } from 'lucide-vue-next'
import BaseBadge from '../base/BaseBadge.vue'

defineProps({
  latestMeasurement: Object,
  measurements: {
    type: [Array, Object],
    default: () => []
  },
  completionRate: Number,
  getBmiClass: Function,
  getBMIStatus: Function
})

defineEmits(['add-measurement'])
</script>
