<template>
  <!-- Kırmızı Şerit Uyarı (Sona yaklaştığında) -->
  <div v-if="licenseWarning && !isExpired && auth.isAuthenticated && !isExempt" class="fixed top-0 left-0 w-full bg-rose-600/90 backdrop-blur-md border-b-2 border-rose-500 text-white p-2 z-[9999] flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(225,29,72,0.4)] px-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle animate-pulse text-yellow-300"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    <span class="text-sm font-black uppercase tracking-widest text-center shadow-black">
      DİKKAT! SİSTEM LİSANS SÜRENİZİN BİTMESİNE <span class="text-yellow-300 text-lg mx-1">{{ daysRemaining }}</span> GÜN KALDI! KESİNTİ YAŞAMAMAK İÇİN LÜTFEN YENİLEYİNİZ.
    </span>
  </div>

  <!-- Tam Ekran Kesinti - Lisans Bitti Modal (Sadece isAuthenticated durumlarında) -->
  <div v-if="isExpired && auth.isAuthenticated && !isExempt" class="fixed inset-0 z-[10000] bg-[#030712]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
     <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
     <div class="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-rose-600/10 rounded-full blur-[150px]"></div>

     <!-- Main Content -->
     <div class="relative z-10 w-full max-w-2xl bg-slate-900/60 border-2 border-rose-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(225,29,72,0.3)]">
        <div class="w-24 h-24 bg-rose-500/10 border-4 border-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(225,29,72,0.5)]">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert text-rose-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </div>
        
        <h1 class="text-3xl font-black text-rose-500 uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(225,29,72,0.5)] mb-2">LİSANS SÜRESİ DOLDU</h1>
        <p class="text-slate-300 mb-8 font-medium">BehaGym Pro kullanım lisansınız sona ermiştir. Güvenliğiniz için sistem erişimi durduruldu. Lütfen aktivasyon anahtarınızı girerek lisansınızı yenileyiniz.</p>

        <form @submit.prevent="activateLicense" class="space-y-4">
           <div class="relative">
              <input 
                 v-model="licenseKey" 
                 type="text" 
                 required 
                 placeholder="33 Haneli BEHA Anahtar Kodu (BEHA-XXXXX-...)" 
                 class="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-4 text-center font-mono text-sm text-emerald-400 placeholder:text-slate-600 uppercase tracking-widest transition-all"
              />
           </div>
           
           <div v-if="errorMsg" class="text-rose-400 text-sm font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              ✓ {{ errorMsg }}
           </div>

           <button 
              type="submit" 
              :disabled="loading || !licenseKey"
              class="w-full bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-4 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all flex justify-center items-center disabled:opacity-50"
           >
              {{ loading ? 'DOĞRULANIYOR...' : 'LİSANSI AKTİF ET' }}
           </button>
        </form>

        <p class="text-[0.6rem] text-slate-500 uppercase tracking-widest mt-6">Sistem Yöneticinizle iletişime geçebilirsiniz.</p>
     </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import Storage from '../../utils/Storage';

const { apiClient } = api;

const auth = useAuthStore();
const route = useRoute();

const isExpired = ref(false);
const licenseWarning = ref(false);
const daysRemaining = ref(0);
const licenseKey = ref('');
const errorMsg = ref('');
const loading = ref(false);

const isExempt = ref(false); // Sadece login, master yöneticisi vs muaf olabilir

const AUTH_ROUTES = ['/login', '/reset-password', '/verify-2fa', '/kiosk'];

const checkLicense = async () => {
    // Auth sayfalarında kontrol yapma
    if (AUTH_ROUTES.some(r => route.path.startsWith(r))) return;

    // Sadece BEHASOFT süper yöneticisi (SUPER_MASTER) muaf olabilir
    const isSuperMaster = auth.user?.role === 'SUPER_MASTER' || auth.user?.email === 'behasoftt@gmail.com';
    
    if (isSuperMaster) {
        console.log('✅ [LICENSE] User is exempt (Master Admin)');
        isExempt.value = true;
        isExpired.value = false;
        licenseWarning.value = false;
        return;
    }

    if (!auth.isAuthenticated) return;

    try {
        const res = await apiClient.get('/licenses/status');
        const data = res.data;

        if (data.valid === false) {
            isExpired.value = true;
            licenseWarning.value = false;
        } else {
            isExpired.value = false;
            licenseWarning.value = data.warning;
            daysRemaining.value = data.daysRemaining;

            if (data.daysRemaining <= 0) {
               isExpired.value = true;
            }
        }
    } catch(err) {
        console.error('[LICENSE] Kontrol hatası:', err.response?.status, err.message);
    }
}

const activateLicense = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        const res = await apiClient.post('/licenses/activate', { licenseKey: licenseKey.value });
        if(res.data.success) {
            const d = res.data.data;
            const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

            // Verilerin gelmeme ihtimaline karşı fallbackler
            const cName = d.companyName || d.Company?.name || 'BELİRLENEMEDİ';
            const bName = d.branchName || d.Branch?.name || 'TÜM ŞUBELER';
            const remains = d.daysRemaining !== undefined ? d.daysRemaining : 0;

            // Önce overlay'i kapat, sonra Swal göster (z-index çakışmasını önle)
            isExpired.value = false;
            licenseWarning.value = false;

            await Swal.fire({
                icon: 'success',
                title: '✅ LİSANS AKTİF EDİLDİ!',
                html: `
                    <div style="text-align:left; font-family: monospace; font-size: 0.8rem; color: #94a3b8;">
                        <div style="display:grid; gap:8px; margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
                                <span style="color:#64748b; font-weight:bold;">🏭 ŞİRKET</span>
                                <span style="color:#f1f5f9; font-weight:bold;">${cName}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
                                <span style="color:#64748b; font-weight:bold;">🏠 ŞUBE</span>
                                <span style="color:#f1f5f9; font-weight:bold;">${bName}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
                                <span style="color:#64748b; font-weight:bold;">📅 BAŞLANGIÇ</span>
                                <span style="color:#34d399; font-weight:bold;">${fmt(d.startDate)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
                                <span style="color:#64748b; font-weight:bold;">⌚ BİTİŞ</span>
                                <span style="color:#f87171; font-weight:bold;">${fmt(d.endDate)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
                                <span style="color:#64748b; font-weight:bold;">⏳ KALAN SÜRE</span>
                                <span style="color:#818cf8; font-weight:bold; font-size:1rem;">${remains === 9999 ? 'SÜRESİZ' : remains + ' GÜN'}</span>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonText: 'SİSTEME GİRİŞ YAP',
                background: '#1e293b',
                color: '#f1f5f9',
                confirmButtonColor: '#6366f1',
                allowOutsideClick: false,
                allowEscapeKey: false
            });

            window.location.href = '/dashboard';
        }
    } catch(err) {
        errorMsg.value = err.response?.data?.message || 'Aktivasyon sırasında bilinmeyen bir hata oluştu.';
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    // Auth zaten hazırsa hemen kontrol et
    if (auth.isAuthenticated) {
        checkLicense();
    }
    
    // Her 1 saatte bir arka planda sessizce check et
    setInterval(() => {
        if (auth.isAuthenticated && !isExpired.value) {
            checkLicense();
        }
    }, 1000 * 60 * 60); 
});

// ❗ KRİTİK FİX: Auth state localStorage'dan yüklendiğinde de çalıştır
// (LicenseManager mount'landığında auth henüz hazır olmayabilir — race condition)
watch(() => auth.isAuthenticated, (isAuth) => {
    if (isAuth) {
        checkLicense();
    } else {
        // Çıkış yapılınca sıfırla
        isExpired.value = false;
        isExempt.value = false;
    }
}, { immediate: true }); // immediate: true → mount anında da çalışır

// Route değiştikçe kontrol
watch(() => route.path, () => {
    if (auth.isAuthenticated && !isExpired.value) {
        checkLicense();
    }
});

</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
