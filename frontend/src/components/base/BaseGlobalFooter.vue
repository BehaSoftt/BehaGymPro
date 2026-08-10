<template>
  <div class="bg-slate-900/95 backdrop-blur-xl shrink-0 z-50 sticky bottom-0 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t-2 border-rose-600/40 flex items-center justify-between px-4" style="height: 55px;">
    <!-- Left: user info -->
    <div class="flex items-center gap-6 h-full text-[0.65rem] font-black uppercase tracking-widest pl-4">
      <!-- User -->
      <div class="flex items-center gap-2">
        <span class="text-yellow-500">{{ displayName }}</span>
      </div>

      <div class="h-4 w-[1px] bg-slate-800"></div>

      <!-- Company -->
      <div class="flex items-center gap-2">
        <span class="text-emerald-400">{{ companyName }}</span>
      </div>

      <div class="h-4 w-[1px] bg-slate-800"></div>

      <!-- Branch -->
      <div class="flex items-center gap-2">
        <span class="text-sky-400">{{ branchName }}</span>
      </div>
    </div>

    <!-- Middle: Action Slot -->
    <div class="flex-1 flex justify-center items-center">
      <div id="global-footer-actions"></div>
    </div>

    <!-- Right: License & status indicator -->
    <div class="flex items-center gap-6 pr-6">
      <!-- License Info (Single Line + Button) -->
      <div v-if="licenseData" 
           class="flex items-center gap-4 px-4 py-2 bg-slate-950/80 border rounded-none border-indigo-500/30 group transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
        
        <div class="flex items-center gap-3">
          <span class="text-[0.6rem] font-bold text-slate-500 tracking-[0.1em] uppercase">Lisans Kalan Süre:</span>
           <span v-if="licenseData.daysRemaining >= 9999" class="text-[0.85rem] font-black text-emerald-400 tracking-wider">SÜRESİZ LİSANS</span>
           <template v-else>
             <div class="flex items-baseline gap-1">
               <span :class="licenseData.daysRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'" 
                     class="text-[0.9rem] font-black tracking-tight tabular-nums">
                 {{ licenseData.daysRemaining }}
               </span>
               <span :class="licenseData.daysRemaining <= 5 ? 'text-rose-500/70' : 'text-indigo-400'" 
                     class="text-[0.6rem] font-black tracking-widest uppercase">GÜN</span>
             </div>
           </template>
        </div>

        <div class="w-[1px] h-4 bg-slate-800"></div>

        <button 
          @click="handleExtendLicense"
          class="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white transition-all rounded shadow-lg shadow-indigo-900/20 active:scale-95"
          title="LİSANS YENİLE"
        >
          <PlusCircle class="w-4 h-4" />
        </button>
      </div>

      <div class="h-8 w-[1px] bg-slate-800" v-if="licenseData"></div>

      <!-- System status indicator -->
      <div class="flex items-center gap-3 group cursor-help" title="SİSTEM AKTİF">
         <span class="text-[0.55rem] font-black text-emerald-500 tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all uppercase">Sistem Aktif</span>
         <div class="relative flex h-3.5 w-3.5">
           <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
           <div class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"></div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { PlusCircle } from 'lucide-vue-next'
import api from '../../utils/api'
import Swal from 'sweetalert2'

const { apiClient } = api
const auth = useAuthStore()
const licenseData = ref(null)

const displayName = computed(() => {
  return auth.user?.instructorProfile?.fullName || 
         auth.user?.memberProfile?.fullName || 
         auth.user?.username || 
         'MISAFIR'
})

const companyName = computed(() => {
  return auth.user?.Company?.name || 'BELIRTILMEDI'
})

const branchName = computed(() => {
  return auth.user?.Branch?.name || 'TUM SUBELER'
})

const fetchLicenseStatus = async () => {
  try {
    const res = await apiClient.get('/licenses/status')
    if (res.data.success) {
      licenseData.value = res.data
    }
  } catch (err) {
    console.error('License status could not be fetched:', err)
  }
}

const handleExtendLicense = async () => {
  const { value: licenseKey } = await Swal.fire({
    title: 'LİSANS YENİLEME',
    text: 'Yeni lisans anahtarınızı giriniz:',
    input: 'text',
    inputPlaceholder: 'BEHA-XXXX-XXXX...',
    showCancelButton: true,
    confirmButtonText: 'AKTİVE ET',
    cancelButtonText: 'VAZGEÇ',
    confirmButtonColor: '#4f46e5',
    background: '#0f172a',
    color: '#f1f5f9',
    inputAttributes: {
      autocapitalize: 'off'
    },
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage('Lisans anahtarı boş olamaz!')
      }
      return value
    }
  })

  if (licenseKey) {
    try {
      Swal.fire({
        title: 'İşleniyor...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() },
        background: '#0f172a',
        color: '#f1f5f9'
      })

      const res = await apiClient.post('/licenses/activate', { licenseKey })
      
      if (res.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'BAŞARILI',
          text: `Lisansınız başarıyla uzatıldı. Yeni bitiş tarihi: ${new Date(res.data.data.endDate).toLocaleDateString('tr-TR')}`,
          background: '#0f172a',
          color: '#f1f5f9'
        })
        fetchLicenseStatus()
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'HATA',
        text: err.response?.data?.message || 'Lisans aktive edilemedi.',
        background: '#0f172a',
        color: '#f1f5f9'
      })
    }
  }
}

onMounted(() => {
  if (auth.isAuthenticated) {
    fetchLicenseStatus()
  }
})
</script>
