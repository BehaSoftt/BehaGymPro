<template>
  <div class="h-full flex flex-col items-center justify-center px-4 space-y-10">
    <div class="text-center space-y-3 uppercase ">
      <h2 class="text-4xl font-medium text-white  tracking-tighter">Giriş QR Kodu</h2>
      <p class="text-[0.75rem] text-slate-500 font-medium tracking-[0.3em]">Bu kodu okuyucuya yaklaştırarak giriş yapabilirsiniz.</p>
    </div>

    <!-- QR Card -->
    <div class="bg-white p-12 shadow-2xl shadow-indigo-500/10 flex flex-col items-center space-y-8 relative overflow-hidden group">
      <div class="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
      
      <div v-if="loading" class="w-72 h-72 bg-slate-50 flex items-center justify-center border border-slate-100  font-medium text-slate-200">
        <Loader2 class="w-12 h-12 animate-spin" />
      </div>
      
      <div v-else class="relative p-4 bg-white border-2 border-slate-100 group-hover:border-indigo-100 transition-colors">
         <div class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-600"></div>
         <div class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-600"></div>
         <div class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-600"></div>
         <div class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-600"></div>
         <img :src="qrImage" alt="Entry QR" class="w-64 h-64 object-contain" />
      </div>

      <div class="text-center">
        <div class="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-50 text-indigo-600 text-[0.75rem] font-medium uppercase tracking-widest  border border-indigo-100">
          <Clock class="w-4 h-4" />
          {{ countdown }} Saniye İçinde Yenilenecek
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="bg-indigo-600/5 border border-indigo-500/20 p-8 flex gap-6 max-w-lg">
      <ShieldCheck class="w-8 h-8 text-indigo-500 shrink-0" />
      <div class="space-y-1 uppercase ">
         <p class="text-[0.85rem] font-medium text-indigo-400 tracking-widest leading-relaxed">
           GÜVENLİĞİNİZ İÇİN BU KOD HER 60 SANİYEDE BİR OTOMATİK OLARAK YENİLENİR. EKRAN GÖRÜNTÜSÜ ALMANIZA GEREK YOKTUR.
         </p>
         <p class="text-[0.65rem] text-slate-600 font-normal tracking-tighter">SECURE ACCESS TOKEN v2.1</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Clock, ShieldCheck, Loader2 } from 'lucide-vue-next'
import api from '../../utils/api'
const { apiClient } = api

const qrImage = ref('')
const loading = ref(true)
const countdown = ref(60)
let timer = null

const fetchQR = async () => {
  try {
    const response = await apiClient.get('/qr/generate')
    qrImage.value = response.data.qrImage
    countdown.value = 60
    loading.value = false
  } catch (err) { console.error(err) }
}

onMounted(() => {
  fetchQR()
  timer = setInterval(() => { if (countdown.value > 0) countdown.value--; else fetchQR() }, 1000)
})

onUnmounted(() => { clearInterval(timer) })
</script>


