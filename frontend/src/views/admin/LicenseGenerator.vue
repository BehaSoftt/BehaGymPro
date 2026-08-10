<template>
  <div class="h-screen w-full bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Dekoratif Arka Plan -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
    </div>

    <div class="w-full max-w-3xl bg-[#0a1120]/80 backdrop-blur-xl border-t-[3px] border-purple-500 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] relative z-10 overflow-hidden flex flex-col">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">BEHASOFT <span class="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">LİSANS_ÜRETİCİSİ</span></h2>
          <p class="text-xs text-cyan-400 mt-1 uppercase tracking-[0.2em]">Sadece Sistem Yöneticisi</p>
        </div>
        <router-link to="/dashboard" class="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </router-link>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Error & Success Messages -->
        <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-bold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <div v-if="successKey" class="p-6 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex flex-col items-center justify-center gap-4 text-center">
          <p class="text-emerald-400 text-sm font-black uppercase tracking-widest">LİSANS BAŞARIYLA ÜRETİLDİ</p>
          <div class="w-full bg-black/40 p-4 rounded-lg border border-emerald-500/20 relative group">
            <span class="text-2xl font-mono font-black text-emerald-300 tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] select-all">{{ successKey }}</span>
            <button @click="copyToClipboard(successKey)" class="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg text-emerald-300 transition-all opacity-0 group-hover:opacity-100">
               Kopyala
            </button>
          </div>
          <p v-if="copySuccess" class="text-emerald-400 text-xs mt-1">✓ Panoya Kopyalandı</p>
        </div>

        <!-- Form  -->
        <form v-else @submit.prevent="generateLicense" class="space-y-6">
          
          <div class="grid grid-cols-2 gap-4">
             <!-- Şirket Seçimi -->
             <div class="space-y-2">
                <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Hedef Şirket</label>
                <select v-model="form.companyId" required @change="fetchBranches" class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all appearance-none">
                   <option value="" disabled>Seçiniz...</option>
                   <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
             </div>

             <!-- Şube Seçimi (Opsiyonel) -->
             <div class="space-y-2">
                <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Hedef Şube (Tümü İçin Boş Bırak)</label>
                <select v-model="form.branchId" :disabled="!form.companyId || branches.length === 0" class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all appearance-none disabled:opacity-50">
                   <option value="">Tüm Şirket (Global)</option>
                   <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
             </div>
          </div>

          <!-- Paket Seçimi -->
          <div class="space-y-2">
            <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Lisans Paketi</label>
            <div class="grid grid-cols-3 gap-3">
               <button type="button" v-for="pkg in packages" :key="pkg.id" 
                  @click="form.packageType = pkg.id"
                  :class="form.packageType === pkg.id ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'"
                  class="p-4 border-[2px] rounded-xl flex flex-col items-center justify-center transition-all">
                  <span class="font-black text-sm tracking-widest">{{ pkg.label }}</span>
                  <span class="text-[0.6rem] uppercase mt-1 opacity-70">{{ pkg.desc }}</span>
               </button>
            </div>
          </div>

          <!-- Özel Tarih (Sadece CUSTOM seçiliyse) -->
          <div v-if="form.packageType === 'CUSTOM'" class="grid grid-cols-2 gap-4 animate-fade-in-up">
             <div class="space-y-2">
                <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Başlangıç Tarihi</label>
                <input type="date" v-model="form.customStartDate" required class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" />
             </div>
             <div class="space-y-2">
                <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Bitiş Tarihi (En az 30 gün)</label>
                <input type="date" v-model="form.customEndDate" required class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all" />
             </div>
          </div>

          <!-- Opsiyonel Notlar -->
          <div class="space-y-2 animate-fade-in-up">
            <label class="text-xs uppercase font-bold text-gray-400 tracking-wider">Lisans Notu (Opsiyonel)</label>
            <textarea v-model="form.notes" rows="2" placeholder="Örn: Bu lisans yıl sonu anlaşmasına istinaden kesilmiştir." class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none"></textarea>
          </div>

          <div class="pt-4 border-t border-white/10">
            <button type="submit" :disabled="loading" class="w-full py-4 bg-purple-600 hover:bg-purple-500 font-black text-white rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50">
               <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span v-else>LİSANS_ANAHTARI_ÜRET</span>
            </button>
          </div>
        </form>

        <div v-if="successKey" class="pt-4 border-t border-white/10 flex justify-center">
             <button @click="resetForm" class="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-1">
                 Yeni Üretim Yap
             </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../utils/api'
const { apiClient } = api
import { useAuthStore } from '../../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const companies = ref([]);
const branches = ref([]);
const loading = ref(false);
const errorMsg = ref('');
const successKey = ref('');
const copySuccess = ref(false);

const packages = [
   { id: 'DEMO_15', label: 'DEMO', desc: '15 Gün Sınırlı' },
   { id: '1_MONTH', label: 'AYLIK', desc: '1 Ay Standard' },
   { id: '3_MONTHS', label: '3 AYLIK', desc: 'Çeyrek Dönem' },
   { id: '6_MONTHS', label: '6 AYLIK', desc: 'Yarı Yıl' },
   { id: '1_YEAR',   label: 'YILLIK', desc: 'Tam Yıl' },
   { id: 'CUSTOM',   label: 'ÖZEL', desc: 'Tarih Gir' }
];

const form = ref({
   companyId: '',
   branchId: '',
   packageType: '1_MONTH',
   customStartDate: '',
   customEndDate: '',
   notes: ''
});

onMounted(async () => {
   // Güvenlik Duvarı
   if (authStore.user?.email !== 'behasoftt@gmail.com') {
      router.push('/dashboard');
      return;
   }
   
   // Şirketleri Çek
   try {
      const res = await apiClient.get('/companies');
      companies.value = res.data.data || [];
   } catch (error) {
      errorMsg.value = 'Şirketler listesi alınamadı.';
   }
});

const fetchBranches = async () => {
   form.value.branchId = '';
   branches.value = [];
   if(!form.value.companyId) return;

   try {
      const res = await apiClient.get(`/branches?companyId=${form.value.companyId}`);
      branches.value = res.data.data || [];
   } catch (error) {
      console.error('Şubeler alınamadı', error);
   }
}

const generateLicense = async () => {
   errorMsg.value = '';
   loading.value = true;
   successKey.value = '';
   copySuccess.value = false;

   try {
      const res = await apiClient.post('/licenses/generate', form.value);
      successKey.value = res.data.data.licenseKey;
   } catch (error) {
      errorMsg.value = error.response?.data?.message || 'Lisans oluşturulurken bir hata meydana geldi.';
   } finally {
      loading.value = false;
   }
}

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        copySuccess.value = true;
        setTimeout(() => copySuccess.value = false, 2000);
    });
};

const resetForm = () => {
   form.value = { ...form.value, packageType: '1_MONTH', customStartDate: '', customEndDate: '', notes: '' };
   successKey.value = '';
   errorMsg.value = '';
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
