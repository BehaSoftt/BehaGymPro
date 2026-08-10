<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-medium">
    <div class="w-full max-w-sm min-h-[600px] bg-slate-950 border border-slate-800 p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
      <!-- Sharp Edge Accents -->
      <div class="absolute top-0 left-0 w-8 h-8 border-t border-l border-rose-500/40"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t border-r border-rose-500/40"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-rose-500/40"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-rose-500/40"></div>

      <div class="relative z-10">
        <div class="flex flex-col items-center mb-10">
          <h1 class="text-4xl font-black text-white tracking-[0.2em] uppercase italic" style="font-family: 'Arial Black', sans-serif;">
            <span class="text-rose-600">BEHA</span> <span class="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">SOFT</span>
          </h1>
          <div class="h-[1px] w-full bg-slate-800 my-6"></div>
          <p class="text-[0.55rem] text-slate-500 uppercase tracking-[0.5em] font-black italic">ŞİFRE SIFIRLAMA SİSTEMİ</p>
        </div>

        <!-- Token varsa yeni şifre formu, yoksa email formu -->
        <form v-if="!token" @submit.prevent="requestReset" class="space-y-6">
          <div class="space-y-4">
            <div class="relative group/input">
              <input 
                v-model="email"
                type="email" 
                class="w-full bg-slate-900/50 border border-slate-800 py-5 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all text-sm tracking-widest font-black shadow-inner text-center uppercase"
                placeholder="E-POSTA ADRESİNİZ"
                required
              />
            </div>
          </div>

          <div v-if="message" :class="error ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500'" class="p-4 border text-[0.6rem] uppercase font-black tracking-widest text-center">
            {{ message }}
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 shadow-[0_10px_20px_rgba(225,29,72,0.2)] transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 text-[0.7rem] font-black uppercase tracking-[0.2em] gap-3"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <span v-else class="flex items-center gap-2">SIFIRLAMA BAĞLANTISI GÖNDER <Mail class="w-4 h-4" /></span>
          </button>

          <router-link to="/login" class="w-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-white py-4 transition-all flex items-center justify-center active:scale-95 text-[0.6rem] font-black uppercase tracking-widest gap-2">
            <ArrowLeft class="w-4 h-4" /> GİRİŞ EKRANINA DÖN
          </router-link>
        </form>

        <!-- Yeni Şifre Formu -->
        <form v-else @submit.prevent="resetPassword" class="space-y-6">
          <div class="space-y-4">
            <div class="relative group/input">
              <input 
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full bg-slate-900/50 border border-slate-800 py-5 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all text-sm tracking-[0.8em] font-black shadow-inner text-center rounded-none"
                placeholder="YENİ PAROLA"
                required
                minlength="6"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-rose-500 transition-colors"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>

            <div class="relative group/input">
              <input 
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full bg-slate-900/50 border border-slate-800 py-5 px-4 text-white focus:outline-none focus:border-rose-500/50 transition-all text-sm tracking-[0.8em] font-black shadow-inner text-center rounded-none"
                placeholder="PAROLA TEKRAR"
                required
                minlength="6"
              />
            </div>
          </div>

          <div v-if="message" :class="error ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500'" class="p-4 border text-[0.6rem] uppercase font-black tracking-widest text-center rounded-none">
            {{ message }}
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 text-[0.7rem] font-black uppercase tracking-[0.2em] gap-3 rounded-none"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <span v-else class="flex items-center gap-2">PAROLAYI GÜNCELLE <CheckCircle class="w-4 h-4" /></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2, Mail, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-vue-next'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const token = ref(route.query.token || null)
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref(false)

const requestReset = async () => {
  loading.value = true
  error.value = false
  message.value = ''

  try {
    const response = await axios.post(`http://${window.location.hostname}:5000/api/auth/request-password-reset`, {
      email: email.value.toLowerCase()
    })
    message.value = response.data.message
    error.value = false
  } catch (err) {
    message.value = err.response?.data?.message || 'Bir hata oluştu'
    error.value = true
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Şifreler eşleşmiyor'
    error.value = true
    return
  }

  loading.value = true
  error.value = false
  message.value = ''

  try {
    const response = await axios.post(`http://${window.location.hostname}:5000/api/auth/reset-password`, {
      token: token.value,
      newPassword: newPassword.value
    })
    message.value = response.data.message
    error.value = false
    
    // 2 saniye sonra login'e yönlendir
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    message.value = err.response?.data?.message || 'Şifre sıfırlanamadı'
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>
