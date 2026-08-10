<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Upcoming Exams -->
    <div class="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-6 space-y-4">
      <h3 class="text-slate-300 font-bold text-sm tracking-[0.2em] uppercase flex items-center gap-2 pb-4 border-b border-slate-800">
        <GraduationCap class="w-4 h-4 text-amber-500" /> Yaklaşan Sınavlarım
      </h3>
      <div class="space-y-3">
        <div v-for="ex in upcomingExams" :key="ex.id" class="bg-slate-950 p-4 border border-slate-800/80 rounded-none flex justify-between items-center group transition-colors">
          <div>
            <p class="text-slate-200 text-sm font-black uppercase">{{ ex.exam?.examName || 'KUŞAK SINAVI' }}</p>
            <p class="text-amber-500 text-[0.65rem] font-bold tracking-widest mt-1 uppercase">HEDEF: {{ ex.toBelt || 'YENİ KUŞAK' }}</p>
            <p class="text-slate-500 text-[0.6rem] font-medium mt-1 uppercase">{{ new Date(ex.exam?.examDate).toLocaleDateString('tr-TR') }} - {{ ex.exam?.examTime }}</p>
          </div>
          <div class="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[0.6rem] font-black uppercase tracking-tighter">BEKLİYOR</div>
        </div>
        <p v-if="upcomingExams.length === 0" class="text-center py-6 text-[0.65rem] text-slate-600 font-bold uppercase tracking-widest">PLANLANMIŞ SINAVINIZ YOK</p>
      </div>
    </div>

    <!-- Upcoming Payments -->
    <div class="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-4 md:p-6 space-y-4">
      <h3 class="text-slate-300 font-bold text-xs md:text-sm tracking-[0.2em] uppercase flex items-center gap-2 pb-4 border-b border-slate-800">
        <History class="w-4 h-4 text-emerald-500" /> Gelecek Taksitim
      </h3>
      <div class="space-y-3">
        <div v-if="nextPayment" class="bg-slate-950 p-4 md:p-5 border-2 border-indigo-500/20 rounded-none flex flex-col gap-4 relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 rotate-12 rounded-none"></div>
          <div class="flex justify-between items-start">
            <div>
              <p class="text-slate-400 text-[0.55rem] md:text-[0.6rem] font-black uppercase tracking-widest mb-1">SON ÖDEME TARİHİ</p>
              <p class="text-slate-100 font-black text-base md:text-lg">{{ new Date(nextPayment.dueDate).toLocaleDateString('tr-TR') }}</p>
            </div>
            <div class="text-right">
              <p class="text-slate-400 text-[0.55rem] md:text-[0.6rem] font-black uppercase tracking-widest mb-1">TUTAR</p>
              <p class="text-indigo-400 font-black text-lg md:text-xl">₺{{ nextPayment.amount }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-[0.55rem] md:text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-3">
            <Clock class="w-3 h-3 text-indigo-500" />
            {{ nextPayment.plan?.description || 'TAKSİT ÖDEMESİ' }}
          </div>
        </div>
        <p v-else class="text-center py-10 text-[0.65rem] text-slate-600 font-bold uppercase tracking-widest">BEKLEYEN TAKSİTİNİZ BULUNMUYOR</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraduationCap, History, Clock } from 'lucide-vue-next'

defineProps({
  upcomingExams: { type: Array, default: () => [] },
  nextPayment: { type: Object, default: null }
})
</script>
