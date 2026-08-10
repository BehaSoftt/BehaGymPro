<template>
  <div class="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-6 space-y-4">
    <h3 class="text-slate-300 font-bold text-sm tracking-[0.2em] uppercase flex items-center gap-2 pb-4 border-b border-slate-800">
      <ShoppingBag class="w-4 h-4 text-indigo-500" /> Son Ürün Alışlarım
    </h3>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
       <div v-for="sale in recentSales" :key="sale.id" 
            class="bg-slate-950 p-4 md:p-5 border border-slate-800 rounded-none flex flex-col justify-between group hover:border-indigo-500 transition-all hover:scale-[1.02] shadow-xl shadow-black/40 relative overflow-hidden">
          <div class="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/5 rotate-12 rounded-none group-hover:bg-indigo-500/10 transition-colors"></div>
          
          <div class="flex flex-col gap-4 relative z-10">
             <!-- Date & Time -->
             <div class="flex flex-col">
                <span class="text-[0.45rem] md:text-[0.5rem] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">İŞLEM TARİHİ</span>
                <div class="flex items-center gap-2">
                   <Clock class="w-3 h-3 text-indigo-500" />
                   <span class="text-slate-200 text-[0.65rem] md:text-[0.7rem] font-black tracking-tighter uppercase">{{ new Date(sale.transactionDate).toLocaleDateString('tr-TR') }}</span>
                </div>
                <span class="text-slate-500 text-[0.55rem] md:text-[0.6rem] ml-5 font-bold">{{ new Date(sale.transactionDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}</span>
             </div>

             <!-- Content/Items -->
             <div class="flex flex-wrap gap-1.5 min-h-[40px]">
                <span v-for="item in sale.items" :key="item.id" 
                      class="bg-slate-900 text-slate-400 text-[0.5rem] md:text-[0.55rem] font-black px-2 py-0.5 border border-slate-800 uppercase tracking-tighter rounded-none flex items-center gap-1.5">
                   {{ item.productName || 'ÜRÜN' }} <span class="text-indigo-500 font-black">X{{ item.quantity }}</span>
                </span>
             </div>
          </div>

          <!-- Total Amount -->
          <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between relative z-10">
             <div class="flex flex-col">
                <span class="text-[0.45rem] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">TOPLAM</span>
                <span class="text-indigo-400 font-black text-base md:text-lg italic tracking-tighter drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">₺{{ (sale.totalAmount || 0).toLocaleString('tr-TR') }}</span>
             </div>
             <div class="w-7 h-7 md:w-8 md:h-8 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/50 transition-all">
                <ShoppingBag class="w-3 md:w-3.5 h-3 md:h-3.5" />
             </div>
          </div>
       </div>
       
       <div v-if="recentSales.length === 0" 
          class="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-20 border-4 border-dashed border-slate-800 rounded-none italic text-center w-full">
          <ShoppingBag class="w-16 h-16" />
          <p class="text-xs font-black uppercase tracking-[0.3em]">HİÇBİR ALIŞVERİŞ KAYDINIZ BULUNMUYOR</p>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingBag, Clock } from 'lucide-vue-next'

defineProps({
  recentSales: { type: Array, default: () => [] }
})
</script>
