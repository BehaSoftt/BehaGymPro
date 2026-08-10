<template>
  <div class="flex flex-col items-center gap-3 p-1 bg-slate-900 shadow-2xl relative">
    <!-- QR Container (Matched to Photo Size: 128x128) -->
    <div 
      class="w-32 h-32 bg-white border border-slate-100 relative group overflow-hidden flex items-center justify-center p-2" 
      ref="qrContainer"
    >
      <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-600"></div>
      <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-600"></div>
      <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-600"></div>
      <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-600"></div>
      
      <img 
        :src="qrUrl" 
        class="h-full grayscale group-hover:grayscale-0 transition-all cursor-zoom-in" 
        @click="showModal = true"
      />
    </div>

    <!-- Actions (Side by Side - Icons Only) -->
    <div class="flex items-center gap-1.5">
      <BaseButton variant="dark" size="sm" class="flex-1 min-w-0" @click="handlePrint" title="PDF OLARAK KAYDET">
        <template #icon><Printer class="w-5 h-5" /></template>
      </BaseButton>
      <BaseButton variant="ghost" size="sm" class="flex-1 min-w-0 border-slate-700" @click="handleDownload" title="GÖRSELİ İNDİR">
        <template #icon><FileDown class="w-5 h-5 text-rose-500" /></template>
      </BaseButton>
    </div>

    <!-- Print-only Hidden Layout -->
    <div ref="printArea" class="hidden print:flex flex-col items-center justify-center h-screen bg-white">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black mb-2">{{ title }}</h1>
      </div>
      <img :src="qrUrl" class="w-[450px] h-[450px]" />
      <div class="mt-8 text-xs font-bold text-slate-400 border-t pt-4 w-[450px] text-center">
        BEHA GYM KULLANICI DİJİTAL KİMLİK TANIMLAMASI
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Printer, FileDown, Camera } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  value: { type: String, required: true }, // The data to encode in QR
  title: String,
  subtitle: String,
  size: { type: Number, default: 200 }
})

const qrUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${props.size}x${props.size}&data=${encodeURIComponent(props.value)}`
})

const handlePrint = () => {
  window.print()
}

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = `QR_${props.value}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
@media print {
  body * { display: none !important; }
  .print\:flex { display: flex !important; }
}
</style>
