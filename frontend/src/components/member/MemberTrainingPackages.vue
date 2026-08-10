<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Active Packages -->
    <div class="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-6 space-y-4" v-if="packages.length > 0">
      <h3 class="text-slate-300 font-bold text-sm tracking-[0.2em] uppercase flex items-center gap-2 pb-4 border-b border-slate-800">
        <Package2 class="w-4 h-4 text-emerald-500" /> Sahip Olduğum Paketler
      </h3>
      <div class="space-y-3">
        <div v-for="pkg in packages" :key="pkg.id" class="bg-slate-950 p-4 border border-slate-800/80 rounded-none flex justify-between items-center group hover:border-emerald-500/50 transition-colors">
          <div>
            <p class="text-slate-200 text-sm font-bold tracking-wide uppercase">{{ pkg.package ? pkg.package.name : 'PAKET' }}</p>
            <p class="text-emerald-500 text-[0.65rem] font-bold tracking-widest mt-1 uppercase">{{ pkg.package ? (pkg.package.type === 'SESSION' ? pkg.remainingSessions + ' SEANS KALDI' : 'SÜRELİ ÜYELİK') : '' }}</p>
            <p v-if="pkg.instructor" class="text-slate-500 text-[0.65rem] font-medium tracking-widest mt-1 uppercase">EĞİTMEN: {{ pkg.instructor?.fullName || pkg.instructor?.user?.username || 'EĞİTMEN BİLGİSİ YOK' }}</p>
            <p v-if="pkg.expiryDate" class="text-slate-500 text-[0.65rem] font-medium tracking-widest mt-1 uppercase">BİTİŞ: {{ new Date(pkg.expiryDate).toLocaleDateString('tr-TR') }}</p>
            <div v-if="pkg.lessonDays && pkg.lessonDays.length > 0" class="flex gap-1 mt-2">
               <span v-for="dayIdx in pkg.lessonDays" :key="dayIdx" class="text-[0.6rem] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded tracking-tighter uppercase whitespace-nowrap">
                  {{ daysOfWeek[dayIdx]?.substring(0,3) }}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Training Plans -->
    <div class="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-4 md:p-6 space-y-4" v-if="trainingPlans.length > 0">
      <h3 class="text-slate-300 font-bold text-xs md:text-sm tracking-[0.2em] uppercase flex items-center gap-2 pb-4 border-b border-slate-800">
        <Dumbbell class="w-4 h-4 text-indigo-500" /> Antrenman Planlarım
      </h3>
      <div class="space-y-3">
        <div v-for="plan in trainingPlans" :key="plan.id" @click="$emit('view-plan', plan)" class="bg-slate-950 p-3 md:p-4 border border-slate-800/80 rounded-none flex justify-between items-center group hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div>
            <p class="text-slate-200 text-xs md:text-sm font-bold tracking-wide uppercase">{{ plan.title }}</p>
            <p class="text-slate-500 text-[0.55rem] md:text-[0.65rem] font-medium tracking-widest mt-1 uppercase">EĞİTMEN: {{ plan.instructor ? (plan.instructor.fullName || plan.instructor.user?.username) : 'SİSTEM YÖNETİCİSİ' }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package2, Dumbbell, ChevronRight } from 'lucide-vue-next'

defineProps({
  packages: { type: Array, default: () => [] },
  trainingPlans: { type: Array, default: () => [] }
})

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

defineEmits(['view-plan'])
</script>
