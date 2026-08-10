<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-6" v-if="stats">
    <!-- Active Plan -->
    <div class="bg-slate-950/40 border border-slate-800 p-4 md:p-6 flex flex-col items-center justify-center text-center gap-3 md:gap-4 rounded-none shadow-xl transition-all hover:scale-[1.05] hover:border-orange-500/50 group/stat">
      <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 border border-orange-500/30 rounded-none flex items-center justify-center group-hover/stat:bg-orange-500 group-hover/stat:text-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.1)]">
        <Dumbbell class="w-5 h-5 md:w-6 md:h-6 text-orange-400 group-hover/stat:text-black" />
      </div>
      <div class="flex flex-col">
        <span class="text-slate-500 text-[0.45rem] md:text-[0.55rem] uppercase tracking-[0.3em] font-black mb-1">AKTİF PLAN</span>
        <span class="text-slate-100 font-black text-lg md:text-xl italic tracking-tighter">{{ stats.activePlansCount }} ADET</span>
      </div>
    </div>

    <!-- Remaining Days -->
    <div class="bg-slate-950/40 border border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-4 rounded-none shadow-xl transition-all hover:scale-[1.05] hover:border-purple-500/50 group/stat">
      <div class="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-none flex items-center justify-center group-hover/stat:bg-purple-500 group-hover/stat:text-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <CalendarDays class="w-6 h-6 text-purple-400 group-hover/stat:text-black" />
      </div>
      <div class="flex flex-col">
        <span class="text-slate-500 text-[0.55rem] uppercase tracking-[0.3em] font-black mb-1">KALAN SÜRE</span>
        <span class="text-slate-100 font-black text-xl italic tracking-tighter">{{ stats.remainingDays }} GÜN</span>
      </div>
    </div>

    <!-- PT Sessions -->
    <div class="bg-slate-950/40 border border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-4 rounded-none shadow-xl transition-all hover:scale-[1.05] hover:border-sky-500/50 group/stat">
      <div class="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-none flex items-center justify-center group-hover/stat:bg-sky-500 group-hover/stat:text-black transition-all shadow-[0_0_20px_rgba(14,165,233,0.1)] text-sky-400">
        <Activity class="w-6 h-6 group-hover/stat:text-black" />
      </div>
      <div class="flex flex-col">
        <span class="text-slate-500 text-[0.55rem] uppercase tracking-[0.3em] font-black mb-1">ÖZEL DERS</span>
        <span class="text-slate-100 font-black text-xl italic tracking-tighter">{{ stats.remainingPrivateSessions }} DERS</span>
      </div>
    </div>

    <!-- Wallet balance -->
    <div class="bg-slate-950/40 border border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-4 rounded-none shadow-xl transition-all hover:scale-[1.05] hover:border-emerald-500/50 group/stat">
      <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-none flex items-center justify-center group-hover/stat:bg-emerald-500 group-hover/stat:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <Wallet class="w-6 h-6 text-emerald-400 group-hover/stat:text-black" />
      </div>
      <div class="flex flex-col">
        <span class="text-slate-500 text-[0.55rem] uppercase tracking-[0.3em] font-black mb-1">CÜZDANIM</span>
        <span class="text-slate-100 font-black text-xl italic tracking-tighter">₺{{ (stats.balance || 0).toLocaleString('tr-TR') }}</span>
      </div>
    </div>

    <!-- Debt -->
    <div class="bg-slate-950/40 border border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-4 rounded-none shadow-xl transition-all hover:scale-[1.05] hover:border-rose-500/50 group/stat">
      <div class="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-none flex items-center justify-center group-hover/stat:bg-rose-500 group-hover/stat:text-black transition-all shadow-[0_0_20px_rgba(244,63,94,0.1)]">
        <CreditCard class="w-6 h-6 text-rose-400 group-hover/stat:text-black" />
      </div>
      <div class="flex flex-col">
        <span class="text-slate-500 text-[0.55rem] uppercase tracking-[0.3em] font-black mb-1">GÜNCEL BORÇ</span>
        <span class="text-slate-100 font-black text-xl italic tracking-tighter">₺{{ (stats.totalDebt || 0).toLocaleString('tr-TR') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Dumbbell, CalendarDays, Activity, Wallet, CreditCard } from 'lucide-vue-next'

defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>
