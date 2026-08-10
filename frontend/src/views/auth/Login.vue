<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-medium ">
    <!-- Kiosk Mode Overlay -->
    <div v-if="isKioskMode" class="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-md">
      <div class="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center p-12 bg-slate-950 border-2 border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.3)] text-center space-y-12">
        <!-- Neon Corner Accents -->
        <div class="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-emerald-400"></div>
        <div class="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-emerald-400"></div>
        <div class="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-emerald-400"></div>
        <div class="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-emerald-400"></div>

        <div class="w-24 h-24 bg-emerald-500/10 border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center mx-auto animate-pulse">
          <Activity class="w-12 h-12 text-emerald-400" />
        </div>
        <div class="space-y-4">
          <h1 class="text-5xl font-black text-emerald-500 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">KIOSK TERMİNALİ</h1>
          <p class="text-white text-sm font-black uppercase tracking-[0.5em] animate-pulse">{{ kioskStatus }}</p>
        </div>
        
        <div class="flex items-center gap-4 justify-center py-4 border-y border-emerald-500/20">
          <div class="w-3 h-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
          <span class="text-[0.7rem] text-emerald-400 uppercase tracking-[0.4em] font-black">OTOMATİK ERİŞİM: AKTİF</span>
        </div>

        <div v-if="kioskStatus.includes('HATA')" class="pt-6">
           <button 
             @click="exitKiosk" 
             class="w-full py-4 bg-rose-600/10 text-rose-500 text-[0.7rem] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border-2 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
           >
             YAPILANDIRMAYI SONLANDIR VE SIFIRLA
           </button>
        </div>
      </div>
    </div>

    <div class="w-full max-w-sm min-h-[600px] bg-slate-950 border border-rose-500/30 p-10 shadow-[0_0_80px_rgba(0,0,0,1)] relative overflow-hidden group">
      <!-- Neon Corner Accents (Precision HUD) -->
      <div class="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>
      <div class="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>
      <div class="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>
      <div class="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>

      <!-- Animated Top Bar -->
      <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div>
      <!-- Background Glow (Industrial Style) -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/5 blur-3xl"></div>

      <div class="relative z-10">
        <div class="flex flex-col items-center mb-8">
          <h1 class="text-4xl font-black text-white tracking-[0.2em] uppercase italic" style="font-family: 'Arial Black', sans-serif;">
            <span class="text-rose-600">BEHA</span> <span class="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">SOFT</span>
          </h1>
          <div class="h-[1px] w-full bg-slate-800 my-6"></div>
          <p class="text-[0.55rem] text-slate-500 uppercase tracking-[0.5em] font-black italic">{{ is2FAStep ? 'GÜVENLİ DOĞRULAMA' : 'ERİŞİM ARAYÜZÜ' }}</p>
        </div>

        <!-- Login Type Tabs (Distinct Vibrant Colors) -->
        <div v-if="!is2FAStep" class="flex border border-slate-800 bg-black mb-10 overflow-x-auto no-scrollbar">
          <button 
            @click="loginType = 'STAFF'; focusOnInput()" 
            :class="loginType === 'STAFF' ? 'bg-rose-600 text-white border-b-2 border-rose-400 shadow-[0_0_25px_rgba(225,29,72,0.3)]' : 'text-rose-500 opacity-40 hover:opacity-100 hover:bg-rose-950/20'" 
            class="flex-1 py-5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-2 min-w-[100px] border-r border-slate-900"
          >
            <ShieldCheck class="w-4 h-4" /> YÖNETİM
          </button>
          <button 
            @click="loginType = 'MEMBER'; focusOnInput()" 
            :class="loginType === 'MEMBER' ? 'bg-indigo-600 text-white border-b-2 border-indigo-400 shadow-[0_0_25px_rgba(79,70,229,0.3)]' : 'text-indigo-500 opacity-40 hover:opacity-100 hover:bg-indigo-950/20'" 
            class="flex-1 py-5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-2 min-w-[100px] border-r border-slate-900"
          >
            <User class="w-4 h-4" /> PORTAL
          </button>
          <button 
            @click="loginType = 'SETUP'" 
            :class="loginType === 'SETUP' ? 'bg-amber-600 text-white border-b-2 border-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.3)]' : 'text-amber-500 opacity-40 hover:opacity-100 hover:bg-amber-950/20'" 
            class="flex-1 py-5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-2 min-w-[100px]"
          >
            <Settings class="w-4 h-4" /> KURULUM
          </button>
        </div>

        <!-- Staff Login Step -->
        <form v-if="!is2FAStep && loginType === 'STAFF'" @submit.prevent="handleInitialLogin" class="space-y-6">
          <div class="space-y-4">
            <div class="relative group/input">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-rose-500 transition-colors" />
              <input 
                v-model="username"
                type="text" 
                class="w-full bg-slate-900/50 border border-slate-700 py-5 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500/50 focus:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all text-[0.7rem] tracking-[0.3em] font-black shadow-inner uppercase"
                placeholder="KULLANICI KIMLIĞI (TC / ID)"
                required
              />
            </div>

            <div class="relative group/input">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-rose-500 transition-colors" />
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full bg-slate-900/50 border border-slate-700 py-5 pl-12 pr-12 text-white focus:outline-none focus:border-rose-500/50 focus:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all text-[0.8rem] tracking-[0.8em] font-black shadow-inner"
                placeholder="PAROLA"
                required
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
          </div>

          <div v-if="auth.error" class="p-3 bg-rose-600/10 border border-rose-500/20 text-rose-500 text-[0.65rem] uppercase font-medium tracking-widest text-center">
            HATA: {{ auth.error }}
          </div>

          <div class="space-y-6 pt-4">
             <button 
               type="submit"
               :disabled="auth.loading"
               class="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 text-[0.7rem] font-black uppercase tracking-[0.3em] rounded-none"
             >
               <Loader2 v-if="auth.loading" class="w-5 h-5 animate-spin" />
               <span v-else class="flex items-center gap-3">SİSTEME GİRİŞ YAP <LogIn class="w-4 h-4" /></span>
             </button>

             <!-- Forgot Password moved directly below button (20px gap approx mt-6) -->
             <div class="flex justify-center">
                <router-link to="/reset-password" class="text-[0.6rem] text-rose-500 hover:text-rose-400 font-black uppercase tracking-[0.4em] transition-all drop-shadow-[0_0_10px_rgba(225,29,72,0.4)]">ŞİFREMİ UNUTTUM</router-link>
             </div>
          </div>
        </form>

        <!-- Member Login Portalı (Simplified & HUD Focused) -->
        <form v-else-if="!is2FAStep && loginType === 'MEMBER'" @submit.prevent="handleCardLogin" class="space-y-10 py-4">
          <div class="space-y-8">
            <div class="space-y-2 text-center">
              <h3 class="text-lg font-black text-white uppercase tracking-widest italic">PORTAL</h3>
            </div>
            
            <div class="relative group/input">
              <QrCode class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-indigo-500 transition-colors" />
              <input 
                ref="memberInput"
                v-model="qrDataInput"
                @input="qrDataInput = qrDataInput.replace(/\D/g, '').slice(0, 15)"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full bg-slate-900/50 border border-slate-700 py-6 pl-14 pr-12 text-white text-center text-[0.8rem] font-black focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all shadow-inner uppercase tracking-[0.3em]"
                placeholder="KART OKUTUN VEYA KOD GİRİN"
                maxlength="15"
                required
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-500 transition-colors"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="auth.error" class="p-4 bg-rose-600/10 border border-rose-500/20 text-rose-500 text-[0.65rem] uppercase font-medium tracking-widest text-center">
            HATA: {{ auth.error }}
          </div>

          <button 
            type="submit"
            :disabled="auth.loading"
            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 shadow-[0_10px_20px_rgba(79,70,229,0.2)] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[0.7rem] active:scale-95"
          >
            <Loader2 v-if="auth.loading" class="w-5 h-5 animate-spin" />
            <span v-else>DOĞRULA VE GİRİŞ YAP</span>
          </button>
        </form>

        <!-- Kiosk Logic for Config Upload (Setup Mode) -->
        <div v-else-if="!is2FAStep && loginType === 'SETUP'" class="space-y-8 py-4">
           <div class="space-y-8">
              <div class="space-y-2 text-center">
                 <h3 class="text-md font-black text-white uppercase tracking-widest italic">SİSTEM YAPILANDIRMASI</h3>
              </div>
              
              <label class="block">
                 <input type="file" accept=".json" @change="handleKioskConfigUpload" class="hidden" />
                 <div class="w-full bg-slate-900/50 border border-dashed border-slate-700 hover:border-amber-500/50 py-12 cursor-pointer transition-all group/upload focus:shadow-[0_0_20px_rgba(217,119,6,0.1)]">
                    <div class="flex flex-col items-center gap-4">
                       <Activity class="w-6 h-6 text-slate-700 group-hover/upload:text-amber-500 group-hover/upload:animate-pulse" />
                       <span class="text-[0.6rem] font-black text-slate-600 group-hover/upload:text-amber-500 tracking-[0.3em] uppercase">AYAR DOSYASI YÜKLE</span>
                    </div>
                 </div>
              </label>
           </div>
        </div>

        <!-- 2FA Step -->
        <form v-else @submit.prevent="handleVerify2FA" class="space-y-8">
          <div class="text-center space-y-6">
            <p class="text-slate-500 text-[0.75rem] uppercase font-medium tracking-widest leading-relaxed ">
              E-POSTA ADRESİNİZE GÖNDERİLEN <br/> <span class="text-indigo-400">10 HANELİ</span> DOĞRULAMA KODUNU GİRİN.
            </p>
            <div class="relative group">
              <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                v-model="twoFactorCode"
                type="text" 
                maxlength="10"
                class="w-full bg-slate-950 border border-slate-800 py-4 pl-12 pr-4 text-white text-center text-lg font-medium tracking-[0.3em] focus:outline-none focus:border-emerald-600 transition-all shadow-inner"
                placeholder="0000000000"
                required
              />
            </div>
          </div>

          <div v-if="auth.error" class="p-4 bg-rose-600/10 border border-rose-500/20 text-rose-500 text-[0.75rem] uppercase font-medium tracking-widest text-center ">
            {{ auth.error }}
          </div>

          <button 
            type="submit"
            :disabled="auth.loading"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            <Loader2 v-if="auth.loading" class="w-5 h-5 animate-spin" />
            <CheckCircle v-else class="w-5 h-5" />
          </button>
          
          <button @click="is2FAStep = false" type="button" class="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 transition-all flex items-center justify-center active:scale-95">
            <ArrowLeft class="w-5 h-5" />
          </button>
        </form>




        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { Activity, User, Lock, Loader2, ShieldCheck, QrCode, Eye, EyeOff, LogIn, CheckCircle, ArrowLeft, Settings } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import Storage from '../../utils/Storage'

const router = useRouter(); const auth = useAuthStore()
const loginType = ref('STAFF') // 'STAFF', 'MEMBER' or 'CARD'
const username = ref(''); const password = ref(''); const is2FAStep = ref(false); const twoFactorCode = ref(''); const loginUserId = ref(null)
const showPassword = ref(false)
const memberCode = ref(''); const phone = ref('');
const qrDataInput = ref('');
const isKioskMode = ref(false)
const kioskStatus = ref('')
const memberInput = ref(null)

const focusOnInput = () => {
  nextTick(() => {
    if (loginType.value === 'MEMBER' && memberInput.value) memberInput.value.focus()
  })
}
const connectionStatus = ref('checking') // 'checking', 'online', 'offline'
const serverAddress = ref(window.location.hostname)

// Kiosk Mode Auto-Login
onMounted(async () => {
  // İlk bağlantı kontrolü
  checkConnection()

  // Check for kiosk config in localStorage
  const kioskConfigStr = Storage.getItem('kioskConfig')
  if (kioskConfigStr) {
    try {
      const kioskConfig = JSON.parse(kioskConfigStr)
      serverAddress.value = kioskConfig.serverIP || window.location.hostname
      if (kioskConfig.kioskMode && kioskConfig.autoLogin) {
        isKioskMode.value = true
        kioskStatus.value = 'BAĞLANTI KONTROL EDİLİYOR...'
        await attemptKioskLogin(kioskConfig)
      }
    } catch (err) {
      console.error('Kiosk config parse error:', err)
    }
  }
})

const checkConnection = async () => {
  connectionStatus.value = 'checking'
  try {
    const baseUrl = `http://${serverAddress.value}:5000/api`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await fetch(baseUrl, { 
      method: 'GET',
      mode: 'no-cors', // Basic check doesn't need full CORS
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    connectionStatus.value = 'online'
  } catch (err) {
    console.error('Connection check failed:', err)
    connectionStatus.value = 'offline'
  }
}

const manualEditServerAddress = async () => {
  const { value: newAddress } = await Swal.fire({
    title: 'SUNUCU ADRESİNİ GÜNCELLE',
    text: 'Sunucu bilgisayar adı veya IP adresi değiştiyse buradan güncelleyebilirsiniz.',
    input: 'text',
    inputLabel: 'Yeni IP veya Bilgisayar Adı',
    inputValue: serverAddress.value,
    showCancelButton: true,
    cancelButtonText: 'İPTAL',
    confirmButtonText: 'GÜNCELLE',
    background: '#0f172a',
    color: '#fff',
    confirmButtonColor: '#4f46e5',
    inputValidator: (value) => {
      if (!value) return 'Bir adres girmelisiniz!'
    }
  })

  if (newAddress) {
    serverAddress.value = newAddress
    // localStorage'daki config'i de güncelle ki kalıcı olsun
    const kioskConfigStr = Storage.getItem('kioskConfig')
    if (kioskConfigStr) {
      try {
        const config = JSON.parse(kioskConfigStr)
        config.serverIP = newAddress
        Storage.setItem('kioskConfig', JSON.stringify(config))
      } catch (e) {
        Storage.setItem('kioskConfig', JSON.stringify({ serverIP: newAddress, kioskMode: true }))
      }
    } else {
       Storage.setItem('kioskConfig', JSON.stringify({ serverIP: newAddress, kioskMode: true }))
    }
    
    Swal.fire({
       icon: 'success',
       title: 'ADRES GÜNCELLENDİ',
       text: `Bağlantı adresi: ${newAddress}`,
       background: '#0f172a',
       color: '#fff',
       timer: 1500,
       showConfirmButton: false
    })
    
    checkConnection()
  }
}

const attemptKioskLogin = async (config) => {
  try {
    kioskStatus.value = 'SUNUCUYA BAĞLANILIYOR...'
    
    // Test server connection
    const serverUrl = `http://${config.serverIP}:5000/api`
    await fetch(`${serverUrl}/health`, { method: 'HEAD' }).catch(() => {
      throw new Error('Sunucu erişilemez')
    })
    
    kioskStatus.value = 'GİRİŞ YAPILIYOR...'
    
    // Check for missing credentials in config
    if (!config.terminalUsername || !config.terminalPassword) {
      kioskStatus.value = 'HATA: KIOSK KULLANICI ADI VEYA ŞİFRE EKSİKDİR (CONFIG)'
      return;
    }

    username.value = config.terminalUsername
    password.value = config.terminalPassword
    
    const result = await auth.login(username.value, password.value)
    
    if (result.status === 'SUCCESS') {
      kioskStatus.value = 'GİRİŞ BAŞARILI - YÖNLENDİRİLİYOR...'
      setTimeout(() => {
        router.push('/gate-sim')
      }, 500)
    } else {
      throw new Error(auth.error || 'Giriş başarısız')
    }
  } catch (err) {
    console.error('Kiosk auto-login error:', err)
    const errorMsg = err.message || 'Bilinmeyen hata'
    kioskStatus.value = `GİRİŞ HATASI: ${errorMsg}`
    
    // Stop retrying for specific irrecoverable errors
    const stopRetry = 
      errorMsg.includes('required') || 
      errorMsg.includes('Şifre') || 
      errorMsg.includes('password') || 
      errorMsg.includes('Geçersiz') ||
      errorMsg.includes('429') ||
      errorMsg.includes('too many') ||
      errorMsg.includes('locked')

    if (stopRetry) {
       kioskStatus.value += ' - LÜTFEN BİLGİLERİ KONTROL EDİN VEYA BEKLEYİN'
       return;
    }

    kioskStatus.value += ' - YENİDEN DENENİYOR...'
    setTimeout(() => {
      attemptKioskLogin(config)
    }, 15000)
  }
}

const exitKiosk = () => {
  Storage.removeItem('kioskConfig')
  isKioskMode.value = false
  window.location.reload()
}

const handleInitialLogin = async () => {
  const result = await auth.login(username.value, password.value)
  if (result.status === 'REQUIRE_2FA') { loginUserId.value = result.userId; is2FAStep.value = true } 
  else if (result.status === 'SUCCESS') {
    if (auth.isReceptionist) router.push('/gate-sim')
    else router.push('/')
  }
}

const handleVerify2FA = async () => { if (await auth.verify2FA(loginUserId.value, twoFactorCode.value)) router.push('/') }

const handleMemberLogin = async () => {
  const result = await auth.memberLogin(memberCode.value, phone.value)
  if (result.status === 'SUCCESS') router.push('/')
}

const handleCardLogin = async () => {
  const result = await auth.cardLogin(qrDataInput.value)
  if (result.status === 'SUCCESS') router.push('/')
  qrDataInput.value = ''
}

// File upload handler for kiosk config
const handleKioskConfigUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const config = JSON.parse(e.target.result)
      if (config.kioskMode) {
        Storage.setItem('kioskConfig', JSON.stringify(config))
        // Sayfayı yenile ki onMounted tekrar çalışsın
        window.location.reload()
      }
    } catch (err) {
      console.error('Config file parse error:', err)
      alert('Config dosyası okunamadı. Lütfen geçerli bir JSON dosyası seçin.')
    }
  }
  reader.readAsText(file)
}
</script>


