<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 class="w-12 h-12 text-rose-500 animate-spin" />
      <p class="text-[0.7rem] font-black text-slate-500 uppercase tracking-widest">BESLENME PROGRAMI YÜKLENİYOR...</p>
    </div>
    
    <div v-else-if="!plan" class="flex flex-col items-center justify-center py-20 text-center bg-slate-900/50 rounded-none border-2 border-dashed border-slate-800">
      <div class="w-20 h-20 bg-slate-800 rounded-none flex items-center justify-center mb-6 opacity-40">
        <Utensils class="w-10 h-10 text-slate-400" />
      </div>
      <h3 class="text-xl font-black text-slate-300 uppercase italic">BESLENME PLANI ATANMAMIŞ</h3>
      <p class="text-sm text-slate-500 mt-2 max-w-md">Henüz size özel bir beslenme veya takviye programı oluşturulmamış. Lütfen hocanızla iletişime geçin.</p>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
      <!-- Nutrition Details Column -->
      <div class="space-y-8">
         <!-- Daily Habits -->
         <div class="bg-slate-900/50 border-2 border-slate-800 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10 border-b border-white/5 pb-4">
               <div class="w-10 h-10 md:w-12 md:h-12 bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center rounded-none">
                  <Activity class="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
               </div>
               <span class="text-[0.5rem] md:text-[0.7rem] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">GÜNLÜK ALIŞKANLIKLAR</span>
            </div>
            
            <div class="grid grid-cols-3 gap-3 md:gap-6 relative z-10">
               <div class="flex flex-col items-center justify-center p-3 md:p-6 bg-slate-950 border border-slate-800 rounded-none shadow-inner">
                  <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-widest mb-2 md:mb-3">ÖĞÜN SAYISI</span>
                  <div class="flex items-baseline gap-1 md:gap-2">
                     <span class="text-xl md:text-3xl font-black text-emerald-400 italic tabular-nums leading-none">{{ plan.mealCount || '-' }}</span>
                     <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-bold uppercase">ÖĞÜN</span>
                  </div>
               </div>
               <div class="flex flex-col items-center justify-center p-3 md:p-6 bg-slate-950 border border-slate-800 rounded-none shadow-inner">
                  <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-widest mb-2 md:mb-3">UYKU SÜRESİ</span>
                  <div class="flex items-baseline gap-1 md:gap-2">
                     <span class="text-xl md:text-3xl font-black text-indigo-400 italic tabular-nums leading-none">{{ plan.sleepDuration || '-' }}</span>
                     <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-bold uppercase">SAAT</span>
                  </div>
               </div>
               <div class="flex flex-col items-center justify-center p-3 md:p-6 bg-slate-950 border border-slate-800 rounded-none shadow-inner">
                  <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-widest mb-2 md:mb-3">SIVI TÜKETİMİ</span>
                  <div class="flex items-baseline gap-1 md:gap-2">
                     <span class="text-xl md:text-3xl font-black text-sky-400 italic tabular-nums leading-none">{{ plan.fluidIntake || '-' }}</span>
                     <span class="text-[0.35rem] md:text-[0.5rem] text-slate-500 font-bold uppercase">LİTRE</span>
                  </div>
               </div>
            </div>
         </div>

         <!-- Food Density -->
         <div class="bg-slate-900/50 border-2 border-slate-800 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-4 mb-8 relative z-10 border-b border-white/5 pb-4">
               <div class="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center rounded-none">
                  <Apple class="w-6 h-6 text-indigo-500" />
               </div>
               <span class="text-[0.7rem] font-black text-white uppercase tracking-[0.3em]">GIDA YOĞUNLUĞU</span>
            </div>

            <div class="grid grid-cols-2 gap-4 relative z-10">
               <div v-for="(val, key) in plan.foodCategories" :key="key" class="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-none">
                  <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{{ key === 'redMeat' ? 'KIRMIZI ET' : key === 'whiteMeat' ? 'BEYAZ ET' : key === 'vegetables' ? 'SEBZE GRUBU' : 'MEYVE GRUBU' }}</span>
                  <span class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1.5 rounded-none border border-indigo-500/10 italic">
                     {{ val === 'high' ? 'YÜKSEK' : val === 'medium' ? 'ORTA' : val === 'low' ? 'DÜŞÜK' : 'YOK' }}
                  </span>
               </div>
            </div>
         </div>
      </div>

      <!-- Restrictions Column -->
      <div class="space-y-8">
         <!-- Restricted Foods -->
         <div class="bg-rose-900/10 border-2 border-rose-500/20 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/5 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-4 mb-6 relative z-10 border-b border-rose-500/10 pb-4">
               <div class="w-12 h-12 bg-rose-600/10 border border-rose-500/20 flex items-center justify-center rounded-none">
                  <XCircle class="w-6 h-6 text-rose-500" />
               </div>
               <span class="text-[0.7rem] font-black text-rose-500 uppercase tracking-[0.3em]">YASAKLI GIDALAR</span>
            </div>
            <div class="p-6 bg-slate-950/60 border border-rose-500/10 rounded-none min-h-[120px] relative z-10">
               <p class="text-sm text-slate-300 font-medium italic whitespace-pre-wrap leading-relaxed">{{ plan.avoidFoods || 'Herhangi bir yasaklı gıda belirtilmemiş.' }}</p>
            </div>
         </div>

         <!-- Additional Suggestions -->
         <div class="bg-indigo-900/10 border-2 border-indigo-500/20 rounded-none p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-none group-hover:scale-110 transition-transform"></div>
            <div class="flex items-center gap-4 mb-6 relative z-10 border-b border-indigo-500/10 pb-4">
               <div class="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center rounded-none">
                  <BookOpen class="w-6 h-6 text-indigo-400" />
               </div>
               <span class="text-[0.7rem] font-black text-indigo-400 uppercase tracking-[0.3em]">EK ÖNERİLER VE TAKVİYELER</span>
            </div>
            <div class="p-6 bg-slate-950/60 border border-indigo-500/10 rounded-none min-h-[120px] relative z-10">
               <p class="text-sm text-slate-300 font-medium italic whitespace-pre-wrap leading-relaxed">{{ plan.additionalNotes || 'Herhangi bir ek not veya takviye önerisi bulunmuyor.' }}</p>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader2, Utensils, Activity, Apple, XCircle, BookOpen } from 'lucide-vue-next'

defineProps({
  loading: Boolean,
  plan: Object
})
</script>
