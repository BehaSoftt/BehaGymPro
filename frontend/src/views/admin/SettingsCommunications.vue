<template>
  <div class="h-full flex flex-row gap-6 animate-in">
    <!-- Branch selection side (List) -->
    <div class="w-1/3 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden min-w-[300px]">
      <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <span class="text-[0.6rem] font-bold text-slate-500 tracking-widest">Şube Listesi</span>
      </div>
      <div class="p-4 border-b border-slate-800 bg-slate-900/50">
         <div class="relative flex items-center">
            <Search class="absolute left-3 w-4 h-4 text-slate-500" />
            <input 
              v-model="branchCommSearchQuery" 
              type="text" 
              placeholder="Şube Ara..." 
              class="w-full bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs font-medium tracking-widest text-slate-200 outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              v-if="branchCommSearchQuery"
              @click="branchCommSearchQuery = ''"
              class="absolute right-3 text-slate-500 hover:text-rose-500 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
         </div>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar">
         <button 
           v-for="b in filteredBranchListComm" 
           :key="b.id"
           @click="selectCommBranch(b)"
           :class="selectedCommBranch?.id === b.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-800 border-l-2 border-l-transparent'"
           class="w-full p-3 flex items-center gap-3 transition-all text-left border-b border-slate-800/50 group"
         >
            <div class="w-9 h-9 rounded-none bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
               <Building2 class="w-5 h-5" />
            </div>
            <div class="flex-1 overflow-hidden">
               <p class="text-[0.7rem] font-bold text-slate-200 truncate">{{ b.name }}</p>
               <p class="text-[0.55rem] text-slate-500 font-medium tracking-widest truncate">{{ b.company?.name }}</p>
            </div>
         </button>
         
         <div v-if="filteredBranchListComm.length === 0" class="p-12 text-center opacity-30">
            <Search class="w-12 h-12 mx-auto mb-4" />
            <p class="text-[0.6rem] font-bold tracking-widest">Şube Bulunamadı</p>
         </div>
      </div>
    </div>

    <!-- Management Area (Settings) -->
    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
       <div v-if="selectedCommBranch" class="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8">
          
          <!-- Branch Header -->
          <div class="flex items-start justify-between">
             <div class="flex items-center gap-4 w-full">
                <div class="w-16 h-16 bg-slate-950 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-500 shadow-2xl shadow-indigo-500/5">
                   <Building2 class="w-8 h-8" />
                </div>
                <div class="space-y-0.5">
                   <h2 class="text-lg font-bold text-slate-100 tracking-tighter">
                     {{ selectedCommBranch.name }}
                   </h2>
                   <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 text-[0.55rem] font-bold tracking-widest border border-indigo-500/30">İletişim Yönetimi</span>
                      <span class="text-[0.6rem] text-slate-500 font-medium">{{ selectedCommBranch.company?.name }}</span>
                   </div>
                </div>
             </div>
          </div>

          <!-- Communication Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-rose-500/30">
             
             <!-- WhatsApp Section -->
             <div class="space-y-4">
                <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-emerald-500/30">
                   <MessageSquare class="w-3.5 h-3.5 text-emerald-400" />
                   <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">WhatsApp Servisi</span>
                </div>
                
                <div class="p-4 bg-slate-950 border border-emerald-500/20 space-y-4">
                   <div class="flex justify-between items-center">
                      <div class="space-y-0.5">
                         <p class="text-[0.65rem] font-bold text-slate-200">WhatsApp Bildirimleri</p>
                         <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Yoklama, Hatırlatma Ve Diğer Mesajlar</p>
                      </div>
                      
                      <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" v-model="communicationForm.isWhatsAppEnabled" class="sr-only peer">
                         <div class="w-14 h-7 bg-slate-800 border border-slate-700 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-800 after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                   </div>
                </div>
             </div>

             <!-- Email Section -->
             <div class="space-y-4">
                <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                   <Mail class="w-3.5 h-3.5 text-indigo-400" />
                   <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">E-Posta Servisi</span>
                </div>
                
                 <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                    <div class="flex justify-between items-center">
                       <div class="space-y-0.5">
                          <p class="text-[0.65rem] font-bold text-slate-200">E-Posta Bildirimleri</p>
                          <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Sistem Bilgilendirme E-Postaları</p>
                       </div>
                       
                       <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="communicationForm.isEmailEnabled" class="sr-only peer">
                          <div class="w-14 h-7 bg-slate-800 border border-slate-700 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-800 after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                 </div>
              </div>

              <!-- Birthday Section -->
              <div class="space-y-4">
                 <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-rose-500/30">
                    <Award class="w-3.5 h-3.5 text-rose-400" />
                    <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Doğum Günü Servisi</span>
                 </div>
                 
                 <div class="p-4 bg-slate-950 border border-rose-500/20 space-y-4">
                    <div class="flex justify-between items-center">
                       <div class="space-y-0.5">
                          <p class="text-[0.65rem] font-bold text-slate-200">Kutlama Mesajları</p>
                          <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Otomatik Doğum Günü Kutlaması</p>
                       </div>
                       
                       <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="communicationForm.isBirthdayMessageEnabled" class="sr-only peer">
                          <div class="w-14 h-7 bg-slate-800 border border-slate-700 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-800 after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                       </label>
                    </div>

                    <div v-if="communicationForm.isBirthdayMessageEnabled" class="space-y-2 pt-2 border-t border-rose-500/10">
                       <div class="flex justify-between items-center">
                          <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Kutlama Mesajı Şablonu</label>
                          <span class="text-[0.55rem] font-bold" :class="communicationForm.birthdayMessageTemplate?.length > 950 ? 'text-amber-500' : 'text-slate-600'">
                             {{ communicationForm.birthdayMessageTemplate?.length || 0 }} / 1024
                          </span>
                       </div>
                       <textarea 
                          v-model="communicationForm.birthdayMessageTemplate"
                          maxlength="1024"
                          :rows="4"
                          placeholder="Mutlu yıllar {adSoyad}..."
                          class="w-full bg-black/50 border border-slate-800 p-3 text-[0.7rem] text-slate-300 focus:border-rose-500/50 outline-none transition-colors resize-none placeholder:text-slate-800 font-medium"
                       ></textarea>
                       <div class="flex items-center gap-2 px-1 text-[0.55rem] text-slate-500 italic">
                          <p>📌 Kullanılabilir Etiketler: <span class="bg-rose-500/20 text-rose-300 px-1 rounded not-italic font-bold">{adSoyad}</span></p>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- WhatsApp Header Identity -->
              <div class="space-y-4">
                 <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                    <Monitor class="w-3.5 h-3.5 text-indigo-400" />
                    <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">WhatsApp Başlık Kimliği</span>
                 </div>
                 
                 <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                    <div class="space-y-3">
                       <div class="space-y-1.5">
                          <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Görünecek Şirket</label>
                          <select 
                            v-model="communicationForm.whatsappHeaderCompanyId"
                            @change="communicationForm.whatsappHeaderBranchId = ''"
                            class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                          >
                            <option value="">Varolan Şirket (Sistem Şirketi)</option>
                            <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
                          </select>
                       </div>
                       
                       <div class="space-y-1.5">
                          <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Görünecek Şube</label>
                          <select 
                            v-model="communicationForm.whatsappHeaderBranchId"
                            class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                          >
                            <option value="">Tümü / Ana Şube (Default)</option>
                            <option 
                              v-for="b in allBranches.filter(b => b.company?.id === communicationForm.whatsappHeaderCompanyId || !communicationForm.whatsappHeaderCompanyId)" 
                              :key="b.id" 
                              :value="b.id"
                            >{{ b.name }} ({{ b.company?.name }})</option>
                          </select>
                       </div>
                    </div>
                    <p class="text-[0.55rem] text-slate-600 font-medium italic">* Mesajların en üstünde görünecek bilgileri belirler. Boş bırakılırsa üyenin kendi şube bilgileri kullanılır.</p>
                 </div>
              </div>
           </div>

          <!-- Duyuru / Kampanya Gönderimi -->
          <div class="space-y-6 pt-6 border-t border-slate-800">
             <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-amber-500/30">
                <Megaphone class="w-3.5 h-3.5 text-amber-500" />
                <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Duyuru & Kampanya</span>
             </div>

              <div class="p-6 bg-slate-950 border border-slate-800 space-y-6">
                 <!-- Filtreler Paneli -->
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-900">
                    <div class="space-y-1.5">
                       <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">
                          <Filter class="w-3.5 h-3.5 text-indigo-500" /> Eğitim / Ders Tipi
                       </label>
                       <select 
                         v-model="broadcastFilters.lessonType"
                         class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                       >
                          <option value="">Tümü (Standart)</option>
                          <option value="GENERAL">Genel Üyelik</option>
                          <option value="PRIVATE">Özel Ders</option>
                          <option value="GROUP">Grup Dersi</option>
                       </select>
                    </div>
                    <div class="space-y-1.5">
                       <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">
                          <Users class="w-3.5 h-3.5 text-indigo-500" /> Seçilen Üye Sayısı: {{ broadcastFilters.memberIds.length }}
                       </label>
                       <div class="flex items-center gap-2">
                          <button 
                            @click="broadcastFilters.memberIds = []"
                            class="text-[0.55rem] font-bold text-rose-500 border border-rose-500/20 px-2 py-1 hover:bg-rose-500/10"
                          >Temizle</button>
                          <span class="text-[0.55rem] text-slate-600 font-medium">Listeden Seçim Yapabilirsiniz</span>
                       </div>
                    </div>
                 </div>

                 <div class="space-y-4">
                    <label class="block text-[0.7rem] font-bold text-slate-400 tracking-widest">Mesaj Metni (Toplu Whatsapp)</label>
                    <textarea 
                      v-model="broadcastMessage"
                      :rows="4"
                      placeholder="Üyelerinize göndermek istediğiniz kampanya veya duyuru metnini buraya yazın..."
                      class="w-full bg-slate-900 border border-slate-700 p-4 text-slate-200 outline-none focus:border-amber-500 transition-all text-xs font-medium tracking-wide leading-relaxed custom-scrollbar"
                    ></textarea>
                    
                    <!-- Üye Seçim Listesi (Geliştirilmiş 2 Sütun) -->
                    <div class="space-y-3">
                       <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                          <label class="text-[0.6rem] font-black text-slate-500 tracking-[0.2em]">Gönderilecek Üyeleri Seçin (Opsiyonel)</label>
                          <span class="text-[0.55rem] text-slate-600 font-bold">{{ broadcastFilters.memberIds.length }} Üye Seçili</span>
                       </div>
                       
                       <div class="max-h-[260px] overflow-y-auto custom-scrollbar border border-slate-800 bg-slate-950/40">
                          <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
                             <div 
                               v-for="m in branchMembers" 
                               :key="m.id"
                               class="flex items-center justify-between p-3 hover:bg-slate-800/40 transition-all group/item border-b border-slate-800/50"
                             >
                                <div class="flex items-center gap-4">
                                   <!-- Custom Switch -->
                                   <label class="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        :value="m.id" 
                                        v-model="broadcastFilters.memberIds"
                                        class="sr-only peer"
                                      >
                                      <div class="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 transition-all duration-300 
                                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 
                                                  after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white shadow-inner"></div>
                                   </label>
                                   
                                   <div class="flex flex-col">
                                      <span class="text-[0.65rem] font-bold text-slate-300 leading-none group-hover/item:text-indigo-400 transition-colors">{{ m.fullName }}</span>
                                      <span class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1.5">{{ m.phone || 'Numara Yok' }}</span>
                                   </div>
                                </div>

                                <div class="flex flex-wrap gap-1 justify-end max-w-[100px]">
                                   <span 
                                     v-for="lt in m.lessonTypes" 
                                     :key="lt"
                                     class="text-[0.45rem] px-1.5 py-0.5 bg-slate-950 text-indigo-400 border border-indigo-500/10 font-black"
                                   >{{ lt }}</span>
                                </div>
                             </div>
                          </div>
                          <div v-if="branchMembers.length === 0" class="p-8 text-center text-slate-700">
                             <p class="text-[0.6rem] font-black tracking-[0.3em]">Mesaj Gönderilebilecek Üye Bulunamadı</p>
                          </div>
                       </div>
                    </div>

                    <div class="flex items-center justify-between pt-4">
                       <div class="flex items-center gap-2 p-2 bg-amber-500/5 border border-amber-500/10">
                          <Info class="w-3.5 h-3.5 text-amber-500" />
                          <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">
                             {{ broadcastFilters.memberIds.length > 0 ? 'Sadece seçili üyelere gönderilecek.' : 'Kriterlere uyan tüm aktif üyelere gönderilecektir.' }}
                          </span>
                       </div>
                       
                       <button 
                         @click="sendBroadcastMessage"
                         :disabled="!broadcastMessage || loading"
                         class="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white text-[0.7rem] font-black tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-amber-600/20 disabled:opacity-50 active:scale-95"
                       >
                          <Send class="w-4 h-4" /> Duyuruyu Gönder
                       </button>
                    </div>
                 </div>
              </div>
          </div>

          <!-- Information Note -->
          <div class="p-6 bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-sm">
             <div class="flex gap-4">
               <BellRing class="w-8 h-8 text-indigo-400 opacity-50 flex-shrink-0" />
                <p class="text-[0.65rem] text-indigo-300/80 font-medium leading-relaxed tracking-widest">
                  * Önemli: Bu Ayarlar Şube Genelini Kapsar. Servisleri Kapatmanız Durumunda Sistem Otomatik Olarak Hiçbir Bildirim Göndermeyecektir.
                </p>
             </div>
          </div>

          <!-- Action Footer - Sticky -->
       </div>

       <!-- Empty State -->
       <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-slate-600 shadow-inner">
          <div class="relative">
             <BellRing class="w-24 h-24 mb-6 opacity-10 animate-pulse" />
             <MessageSquare class="w-8 h-8 absolute -top-2 -right-2 text-indigo-500 opacity-20" />
          </div>
          <p class="text-sm font-black tracking-[0.3em] opacity-40">Yönetilecek Şubeyi Seçin</p>
          <p class="text-[0.6rem] font-bold tracking-widest mt-2 opacity-20">Lütfen Sol Listeden Bir Seçim Yapın</p>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
import { 
  Building2, MessageSquare, Mail, Award, Monitor, Megaphone, 
  Filter, Users, Info, Send, Plus, Search, X, BellRing, Save, Loader2 
} from 'lucide-vue-next'
import api from '../../utils/api'
const { apiClient } = api
import Swal from 'sweetalert2'

const auth = useAuthStore()
const loading = ref(false)
const branches = ref([])
const companies = ref([])
const selectedCommBranch = ref(null)
const branchCommSearchQuery = ref('')
const broadcastMessage = ref('')
const branchMembers = ref([])
const broadcastFilters = ref({
   lessonType: '',
   memberIds: []
})

const communicationForm = ref({
  isWhatsAppEnabled: true,
  isEmailEnabled: true,
  isBirthdayMessageEnabled: true,
  birthdayMessageTemplate: '',
  whatsappHeaderCompanyId: '',
  whatsappHeaderBranchId: ''
})

const isSuperMaster = computed(() => {
  const user = auth.user;
  if (!user) return false;
  return user.username?.toLowerCase() === 'super_master' || 
         user.role?.toUpperCase() === 'SUPER_MASTER';
});

const fetchBranches = async () => {
  try {
    const res = await apiClient.get('/branches')
    branches.value = res.data
  } catch (err) {
    console.error('Şubeler yüklenemedi:', err)
  }
}

const fetchCompanies = async () => {
  try {
    const res = await apiClient.get('/companies')
    companies.value = res.data
  } catch (err) {
    console.error('Şirketler yüklenemedi:', err)
  }
}

const allBranches = computed(() => {
  if (!branches.value || !Array.isArray(branches.value)) return [];
  return branches.value.map(br => ({
    ...br,
    company: br.Company || br.company || { name: 'SİSTEM' }
  }));
});

const filteredBranchListComm = computed(() => {
  let list = allBranches.value;
  if (!isSuperMaster.value) {
    const myBranchId = auth.user?.branchId;
    list = list.filter(b => b.id === myBranchId);
  }
  if (!branchCommSearchQuery.value) return list;
  const q = branchCommSearchQuery.value.toLowerCase();
  return list.filter(b => 
    b.name?.toLowerCase().includes(q) ||
    b.company?.name?.toLowerCase().includes(q)
  );
});

const selectCommBranch = async (branch) => {
  selectedCommBranch.value = branch
  communicationForm.value = {
    isWhatsAppEnabled: branch.isWhatsAppEnabled !== false,
    isEmailEnabled: branch.isEmailEnabled !== false,
    isBirthdayMessageEnabled: branch.isBirthdayMessageEnabled !== false,
    birthdayMessageTemplate: branch.birthdayMessageTemplate || '',
    whatsappHeaderCompanyId: branch.whatsappHeaderCompanyId || '',
    whatsappHeaderBranchId: branch.whatsappHeaderBranchId || ''
  }
  
  broadcastFilters.value = { lessonType: '', memberIds: [] }
  broadcastMessage.value = ''
  
  try {
     const res = await apiClient.get('/members', {
        params: { branchId: branch.id }
     });
     branchMembers.value = res.data;
  } catch (err) {
     console.error('Şube üyeleri yüklenemedi:', err);
     branchMembers.value = [];
  }
}

const saveCommSettings = async () => {
  if (!selectedCommBranch.value) return
  
  loading.value = true
  try {
    const branchId = selectedCommBranch.value.id
    await apiClient.put(`/branches/${branchId}`, {
      isWhatsAppEnabled: communicationForm.value.isWhatsAppEnabled,
      isEmailEnabled: communicationForm.value.isEmailEnabled,
      isBirthdayMessageEnabled: communicationForm.value.isBirthdayMessageEnabled,
      birthdayMessageTemplate: communicationForm.value.birthdayMessageTemplate || null,
      whatsappHeaderCompanyId: communicationForm.value.whatsappHeaderCompanyId || null,
      whatsappHeaderBranchId: communicationForm.value.whatsappHeaderBranchId || null
    })
    
    await fetchBranches()

    const freshBranch = allBranches.value.find(b => b.id === branchId)
    if (freshBranch) {
      selectedCommBranch.value = freshBranch
    }

    Swal.fire({
      icon: 'success',
      title: 'BAŞARIYLA KAYDEDİLDİ',
      text: 'İletişim ayarlarınız güncellendi.',
      timer: 2000,
      showConfirmButton: false,
      background: '#1e293b',
      color: '#f1f5f9'
    })
  } catch (err) {
    console.error('İletişim ayarları kaydedilemedi:', err)
    Swal.fire({
      icon: 'error',
      title: 'HATA',
      text: 'Ayarlar kaydedilirken bir hata oluştu.',
      background: '#1e293b',
      color: '#f1f5f9'
    })
  } finally {
    loading.value = false
  }
}

const sendBroadcastMessage = async () => {
  if (!selectedCommBranch.value || !broadcastMessage.value) return
  
  const result = await Swal.fire({
    title: 'TOPLU DUYURU GÖNDERİLSİN Mİ?',
    text: broadcastFilters.value.memberIds.length > 0 
      ? `Seçtiğiniz ${broadcastFilters.value.memberIds.length} üyeye bu mesaj iletilecektir.`
      : `"${selectedCommBranch.value.name}" şubesindeki belirlenen kriterlere uyan TÜM üyelere bu mesaj iletilecektir.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'EVET, GÖNDER',
    cancelButtonText: 'İPTAL',
    background: '#1e293b',
    color: '#f1f5f9'
  })

  if (!result.isConfirmed) return
  
  loading.value = true
  try {
    const res = await apiClient.post('/test/broadcast-whatsapp', {
      branchId: selectedCommBranch.value.id,
      message: broadcastMessage.value,
      lessonType: broadcastFilters.value.lessonType || null,
      memberIds: broadcastFilters.value.memberIds.length > 0 ? broadcastFilters.value.memberIds : null
    })
    
    Swal.fire({
      icon: 'success',
      title: 'BAŞARILI',
      text: res.data.message || 'Duyuru başarıyla gönderildi.',
      background: '#1e293b',
      color: '#f1f5f9'
    })
    broadcastMessage.value = ''
  } catch (err) {
    console.error('Broadcast error:', err)
    Swal.fire({
      icon: 'error',
      title: 'GÖNDERİM HATASI',
      text: err.response?.data?.error || 'Duyuru gönderilemedi. WhatsApp bağlantısını kontrol edin.',
      background: '#1e293b',
      color: '#f1f5f9'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBranches()
  fetchCompanies()
})
</script>

<style scoped>
.custom-red-scrollbar::-webkit-scrollbar {
  height: 3px;
}
.custom-red-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.2);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.4);
}
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
</style>
