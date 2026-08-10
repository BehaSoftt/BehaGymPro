<template>
  <div class="h-full flex flex-col animate-in">
    <!-- Full-Width Toolbar Area -->
    <div class="flex-none px-2 mt-2 animate-in slide-in-from-top-1 duration-500 pb-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_security_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-row gap-6 overflow-hidden px-4 pb-2">
      <!-- User selection side (List) -->
      <div class="w-1/3 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden min-w-[300px]">
            <!-- Sub-Tab Navigation -->
            <div class="-mt-4">
              <BaseTabs :tabs="userTabs" v-model:activeTab="securitySubTab" />
            </div>
            <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
               <span class="text-[0.6rem] font-bold text-slate-500 tracking-widest uppercase">KULLANICI LİSTESİ</span>
            </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
         <button 
           v-for="u in filteredUsers" 
           :key="u.id"
           @click="selectUser(u)"
           :class="selectedUser?.id === u.id ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 hover:bg-slate-800 border-slate-800/50'"
           class="w-full p-4 flex items-center gap-4 transition-all text-left border rounded-xl group relative overflow-hidden"
         >
             <!-- Highlight Accent -->
             <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-transform origin-left" :class="selectedUser?.id === u.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'"></div>

             <div class="shrink-0">
                <BaseMemberAvatar 
                   :src="u.instructorProfile?.photo || u.personnelProfile?.photo" 
                   :name="u.memberProfile?.fullName || u.personnelProfile?.fullName || u.instructorProfile?.fullName || u.username"
                   size="lg"
                />
             </div>
              <div class="flex-1 overflow-hidden">
                 <p class="text-[0.75rem] font-black text-slate-100 truncate tracking-wide">
                   {{ u.memberProfile?.fullName || u.personnelProfile?.fullName || u.instructorProfile?.fullName || u.username }}
                 </p>
                 <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span class="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded text-[0.5rem] font-bold tracking-[0.1em] uppercase shadow-inner">{{ getSystemRoleLabel(u.role) }}</span>
                    <span :class="u.Role?.name ? 'text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded' : 'text-slate-500 font-medium bg-slate-900 border border-slate-800 px-2 py-0.5 rounded'" class="text-[0.5rem] tracking-[0.1em] uppercase shadow-inner">{{ u.Role?.name || 'Rol Atanmamış' }}</span>
                    <span v-if="u.memberProfile || u.personnelProfile" class="text-[0.55rem] font-medium text-slate-500 truncate min-w-0">({{ u.username }})</span>
                 </div>
              </div>
            <div class="shrink-0 flex items-center gap-3">
               <ShieldCheck v-if="u.isTwoFactorEnabled" class="w-4 h-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="İki Aşamalı Doğrulama Aktif" />
            </div>
         </button>
      </div>
    </div>

    <!-- Management Area (Form) -->
    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
       <div v-if="selectedUser" class="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8">
          

          <!-- Terminal Settings (Kiosk Mode) -->
          <div v-if="isTerminal(selectedUser)" class="grid grid-cols-1 gap-6">
            <!-- Content for terminals -->
            <div class="space-y-4">

                <div v-if="selectedUser.kioskConfig" class="p-6 bg-slate-950 border border-amber-500/10 space-y-6">
                   <!-- Primary Toggles -->
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800">
                         <div>
                            <p class="text-[0.65rem] font-bold text-slate-200 tracking-widest">Kiosk Modu</p>
                            <p class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1">Tam Ekran Çalışma</p>
                         </div>
                         <BaseSwitch v-model="selectedUser.kioskConfig.kioskMode" />
                      </div>
                      <div class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800">
                         <div>
                            <p class="text-[0.65rem] font-bold text-slate-200 tracking-widest">Oto-Giriş</p>
                            <p class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1">Şifresiz Açılış</p>
                         </div>
                         <BaseSwitch v-model="selectedUser.kioskConfig.autoLogin" />
                      </div>
                      <div class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800">
                         <div>
                            <p class="text-[0.65rem] font-bold text-slate-200 tracking-widest">Sanal Klavye</p>
                            <p class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1">Dokunmatik Destek</p>
                         </div>
                         <BaseSwitch v-model="selectedUser.kioskConfig.showVirtualKeyboard" />
                      </div>
                      <div class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800">
                         <div>
                            <p class="text-[0.65rem] font-bold text-slate-200 tracking-widest">Oto-Yenileme</p>
                            <p class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1">Günlük Yeniden Başlat</p>
                         </div>
                         <BaseSwitch v-model="selectedUser.kioskConfig.autoRestart" />
                      </div>
                    </div>
 
                       <BaseInput 
                         v-model="selectedUser.kioskConfig.serverIP" 
                         type="text" 
                         label="Sunucu IP / Domain" 
                         placeholder="localhost veya 192.168..." 
                       />
                      <BaseInput 
                        v-model.number="selectedUser.kioskConfig.refreshInterval" 
                        type="number" 
                        label="Yenileme Aralığı (Sn)" 
                      />
                      <BaseInput 
                        v-model="selectedUser.kioskConfig.macAddress" 
                        type="text" 
                        label="Donanım Kimliği (MAC)" 
                        placeholder="00:00:00:00:00:00" 
                      />

                       <!-- Terminal Credentials -->
                       <div class="pt-4 border-t border-slate-800/50 space-y-4">
                          <p class="text-[0.6rem] font-black text-amber-500 tracking-[0.2em] uppercase">Terminal Giriş Bilgileri</p>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <BaseInput 
                               v-model="selectedUser.kioskConfig.terminalUsername" 
                               type="text" 
                               label="Giriş Kullanıcı Adı" 
                               placeholder="terminal-01" 
                             />
                             <BaseInput 
                               v-model="selectedUser.kioskConfig.terminalPassword" 
                               :type="showTerminalPassword ? 'text' : 'password'" 
                               label="Giriş Şifresi" 
                               placeholder="********"
                             >
                                <template #icon-right>
                                   <button @click="showTerminalPassword = !showTerminalPassword" class="p-1 focus:outline-none">
                                     <Eye v-if="!showTerminalPassword" class="w-4 h-4 text-slate-500" />
                                     <EyeOff v-else class="w-4 h-4 text-slate-500" />
                                   </button>
                                </template>
                             </BaseInput>
                          </div>
                          <p class="text-[0.55rem] text-slate-500 font-medium italic">* Şifre güncellendiğinde tüm sistemde aktif olur.</p>
                       </div>
                    </div>

                   <!-- Readonly Info -->
                   <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                      <div>
                         <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Son Sinyal (Heartbeat)</p>
                         <p class="text-[0.65rem] font-bold text-emerald-500 mt-1">{{ selectedUser.kioskConfig.heartbeatAt ? formatDate(selectedUser.kioskConfig.heartbeatAt) : 'Bağlantı Yok' }}</p>
                      </div>
                      <div>
                         <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Uygulama Versiyonu</p>
                         <p class="text-[0.65rem] font-bold text-slate-300 mt-1">{{ selectedUser.kioskConfig.appVersion || 'v1.0.0' }}</p>
                      </div>
                   </div>
                </div>
            </div>

          <!-- Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             <!-- Basic Info Section -->
             <div class="space-y-4">
                <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                   <User class="w-3.5 h-3.5 text-indigo-400" />
                   <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Temel Bilgiler</span>
                </div>
                
                <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                   <BaseInput 
                      v-model="selectedUser.username" 
                      type="text" 
                      label="Kullanıcı Adı (Giriş No)" 
                      placeholder="Giriş kullanıcı adı"
                   />

                   <BaseInput 
                      v-model="selectedUser.fullName" 
                      type="text" 
                      label="Ad Soyad"
                      placeholder="Personelin adı soyadı" 
                   />

                   <BaseInput 
                      v-model="selectedUser.email" 
                      type="email" 
                      label="E-Posta Adresi" 
                   />

                   <BaseInput 
                      :modelValue="selectedUser.phone" 
                      @update:modelValue="val => selectedUser.phone = inputMasks.phone(val)" 
                      type="text" 
                      label="Telefon Numarası"
                      maxlength="17" 
                      placeholder="0 (5XX) XXX XX XX" 
                   />

                   <BaseInput 
                      v-model="selectedUser.role" 
                      type="select" 
                      label="Hesap Türü"
                      :options="[
                         { value: 'ADMIN', label: 'Şirket Yöneticisi (Admin)' },
                         { value: 'BRANCH_MASTER', label: 'Şube Yöneticisi' },
                         { value: 'RECEPTIONIST', label: 'Personel / Resepsiyon' },
                         { value: 'USER', label: 'Kullanıcı' },
                         { value: 'INSTRUCTOR', label: 'Eğitmen' },
                         { value: 'MEMBER', label: 'Üye' },
                         { value: 'TERMINAL', label: 'Terminal' }
                      ]"
                   />

                   <BaseInput 
                      v-model="selectedUser.roleId" 
                      type="select" 
                      label="Yetki Rolü"
                      :options="[{ value: '', label: 'Rol Seçin' }, ...roles.map(r => ({ value: r.id, label: r.name }))]"
                   />

                   <!-- Şirket Seçimi (Sadece Süper Admin için) -->
                   <BaseInput 
                      v-if="isSuperMasterLocal"
                      v-model="selectedUser.companyId"
                      type="select"
                      label="Şirket"
                      :options="[{ value: '', label: 'Şirket Seçin' }, ...companies.map(c => ({ value: c.id, label: c.name }))]"
                      @change="onUserCompanyChange"
                   />

                   <BaseInput 
                      v-model="selectedUser.branchId" 
                      type="select" 
                      label="Şube Ataması"
                      :options="[{ value: '', label: 'Tüm Şubeler (Global)' }, ...filteredBranchesForUser.map(br => ({ value: br.id, label: br.name }))]"
                   />
                </div>
             </div>
             
             <!-- 2FA Section -->
             <div class="space-y-4">
                <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-rose-500/30">
                   <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
                   <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">İki Aşamalı Doğrulama</span>
                </div>
                
                <div class="p-4 bg-slate-950 border border-rose-500/20 space-y-4">
                   <div class="flex justify-between items-center opacity-80" :class="isSelectedUserSuperMaster ? 'opacity-30 pointer-events-none' : ''">
                      <div class="space-y-0.5">
                         <p class="text-[0.65rem] font-bold text-slate-200">Güvenlik Kodu Zorunluluğu</p>
                      </div>
                      <BaseSwitch v-model="selectedUser.isTwoFactorEnabled" />
                   </div>
                </div>
             </div>

             <!-- Password Section -->
             <div class="space-y-4">
                <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-rose-500/30">
                   <Key class="w-3.5 h-3.5 text-amber-500" />
                   <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Hesap Erişimi</span>
                </div>

                <div class="p-4 bg-slate-950 border border-rose-500/20 space-y-3">
                   <BaseInput 
                      v-model="newPassword" 
                      :type="showPassword ? 'text' : 'password'" 
                      :label="selectedUser.id ? 'Yeni Şifre Belirle' : 'Şifre Belirle*'"
                      :disabled="isSelectedUserSuperMaster"
                   >
                     <template #icon-right>
                        <button @click="showPassword = !showPassword" class="p-1 focus:outline-none">
                          <Eye v-if="!showPassword" class="w-4 h-4 text-slate-500" />
                          <EyeOff v-else class="w-4 h-4 text-slate-500" />
                        </button>
                     </template>
                   </BaseInput>
                </div>
             </div>
          </div>
       </div>

       <!-- Empty State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
           <div class="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
              <User class="w-10 h-10 text-slate-500" />
           </div>
           <p class="text-xs font-bold tracking-[0.3em]">Yönetilecek Kullanıcıyı Seçin</p>
        </div>
      </div> <!-- Management Area (Form) div ends at line 70 -->
    </div> <!-- Main Content Area div ends at line 15 -->

    <!-- Action Footer (Teleported to global target) -->
    <BaseActionFooter>
       <div class="flex items-center gap-2">
          <!-- Back Button for navigation consistency -->
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
             <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>

          <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

          <!-- Add Button (Persistent for creation) -->
          <BaseButton 
            v-if="!['staff_sub', 'instructors', 'members'].includes(securitySubTab)"
            variant="success"
            size="icon"
            square
            @click="openUserForm" 
            title="YENİ KULLANICI EKLE"
          >
            <template #icon><UserPlus class="w-4 h-4" /></template>
          </BaseButton>

          <div v-if="selectedUser" class="h-6 w-[1px] bg-slate-800 mx-1"></div>

          <!-- Selection Dependent Actions -->
          <template v-if="selectedUser">
             <!-- Message & Delete Actions -->
             <template v-if="selectedUser.id && !isSelectedUserSuperMaster">
               <BaseButton 
                 v-if="selectedUser.phone"
                 variant="primary" 
                 size="icon"
                 square
                 @click="sendSingleFreeText"
                 title="SERBEST MESAJ GÖNDER"
               >
                 <template #icon><Send class="w-4 h-4" /></template>
               </BaseButton>

               <BaseButton 
                 variant="danger" 
                 size="icon"
                 square
                 @click="deleteUserLocal(selectedUser.id)"
                 title="HESABI KALICI OLARAK SİL"
               >
                 <template #icon><Trash2 class="w-4 h-4" /></template>
               </BaseButton>

               <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>
             </template>

             <!-- Standard Actions -->
             <BaseButton variant="dark" size="icon" square shadow @click="selectedUser = null" title="İPTAL">
                <template #icon><X class="w-4 h-4 text-slate-400" /></template>
             </BaseButton>

             <BaseButton 
                variant="primary" 
                size="icon" 
                square 
                :loading="loading" 
                @click="saveUserSettingsLocal" 
                title="AYARLARI KAYDET"
             >
                <template #icon><Save class="w-4 h-4" /></template>
             </BaseButton>
          </template>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../store/auth'
import { 
  Users, UserPlus, ShieldCheck, Lock, User, Key, Save, Loader2, Trash2, 
  Send, Eye, EyeOff, Monitor, FileDown, Zap, UserCheck, X as XIcon, ArrowLeft
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseTabs from '../base/BaseTabs.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import BaseMemberAvatar from '../base/BaseMemberAvatar.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'

// Services & Composables
import { userService } from '../../services/admin/userService'
import { roleService } from '../../services/admin/roleService'
import { branchService } from '../../services/admin/branchService'
import { companyService } from '../../services/admin/companyService'
import { useAlerts } from '../../utils/alerts'
import { inputMasks } from '../../utils/inputMasks'

const props = defineProps({
  isSuperMaster: { type: Boolean, default: false }
})

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess, prompt: showAlertPrompt } = useAlerts()
const loading = ref(false)
const users = ref([])
const selectedUser = ref(null)
const userSearchQuery = ref('')
const userViewMode = ref('list')
const securitySubTab = ref('management')
const newPassword = ref('')
const showPassword = ref(false)
const showTerminalPassword = ref(false)
const roles = ref([])
const branches = ref([])

// Global Selection State
const globalSelection = ref({ companyId: '', branchId: '', remember: false })

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchUsers()
  fetchRoles()
}

const userTabs = [
  { id: 'management', label: 'YÖNETİCİ', icon: Users },
  { id: 'staff_sub', label: 'PERSONEL', icon: UserCheck },
  { id: 'users_sub', label: 'KULLANICI', icon: User },
  { id: 'instructors', label: 'EĞİTMEN', icon: Zap },
  { id: 'members', label: 'ÜYE', icon: Users },
  { id: 'terminals_sub', label: 'TERMİNALLER', icon: Monitor }
]

const companies = ref([])
const host = window.location.hostname
const serverNetworkIp = ref('')

const fetchSystemInfo = async () => {
  try {
    const info = await userService.getSystemInfo();
    if (info?.ips && info.ips.length > 0) {
      serverNetworkIp.value = info.ips[0];
    }
  } catch (err) {
    console.error('System info fetch error:', err);
  }
}

const isSuperMasterLocal = computed(() => {
  const user = auth.user;
  if (!user) return false;
  return user.username?.toLowerCase() === 'super_master' || 
         user.role?.toUpperCase() === 'SUPER_MASTER' ||
         props.isSuperMaster;
});

const isBehaAdmin = computed(() => auth.user?.email === 'behasoftt@gmail.com');

const isSelectedUserSuperMaster = computed(() => {
  if (!selectedUser.value) return false;
  return selectedUser.value.username?.toLowerCase() === 'super_master' || 
         selectedUser.value.role?.toUpperCase() === 'SUPER_MASTER';
});

const isTerminal = (user) => {
  if (!user) return false;
  return user.username?.toLowerCase().startsWith('terminal') || user.role === 'TERMINAL';
};

const isTerminalOnline = (user) => {
   if (!user?.kioskConfig?.heartbeatAt) return false;
   const lastActive = new Date(user.kioskConfig.heartbeatAt);
   const now = new Date();
   return (now - lastActive) < 300000; // 5 minutes
}

const filteredBranchesForUser = computed(() => {
  if (!branches.value || !Array.isArray(branches.value)) return [];
  const cId = selectedUser.value?.companyId;
  if (!cId) return branches.value;
  return branches.value.filter(br => br.companyId === cId || br.Company?.id === cId);
});

const allBranches = computed(() => {
  if (!branches.value || !Array.isArray(branches.value)) return [];
  return branches.value.map(br => ({
    ...br,
    company: br.Company || br.company || { name: 'SİSTEM' }
  }));
});

const onUserCompanyChange = () => {
  // Şirket değişince şubeyi sıfırla
  if (selectedUser.value) {
    selectedUser.value.branchId = '';
  }
};

const filteredUsers = computed(() => {
  let list = users.value;
  
  if (securitySubTab.value === 'management') {
    list = list.filter(u => 
      (u.role?.toUpperCase() === 'ADMIN' || u.role?.toUpperCase() === 'BRANCH_MASTER' || u.role?.toUpperCase() === 'SUPER_MASTER') &&
      !u.username?.toLowerCase().startsWith('terminal')
    );
  } else if (securitySubTab.value === 'staff_sub') {
    list = list.filter(u => 
      (u.role?.toUpperCase() === 'RECEPTIONIST' || u.role?.toUpperCase() === 'STAFF' || u.role?.toUpperCase() === 'PERSONNEL') && 
      !u.username?.toLowerCase().startsWith('terminal')
    );
  } else if (securitySubTab.value === 'users_sub') {
    list = list.filter(u => u.role?.toUpperCase() === 'USER');
  } else if (securitySubTab.value === 'terminals_sub') {
    list = list.filter(u => u.username?.toLowerCase().startsWith('terminal') || u.role?.toUpperCase() === 'TERMINAL');
  } else if (securitySubTab.value === 'instructors') {
    list = list.filter(u => u.role?.toUpperCase() === 'EĞİTMEN' || u.role?.toUpperCase() === 'INSTRUCTOR');
  } else {
    list = list.filter(u => !u.username?.toLowerCase().startsWith('terminal') && (u.role?.toUpperCase() === 'MEMBER' || !u.role));
  }

  if (!userSearchQuery.value) return list;
  const q = userSearchQuery.value.toLowerCase();
  return list.filter(u => 
    u.username?.toLowerCase().includes(q) || 
    (u.memberProfile?.fullName || u.personnelProfile?.fullName || u.instructorProfile?.fullName || '').toLowerCase().includes(q)
  );
});



const fetchUsers = async () => {
  try {
    const params = {
      companyId: globalSelection.value.companyId || undefined,
      branchId: globalSelection.value.branchId || undefined
    }
    users.value = await userService.getAll(params)
  } catch (err) {
    console.error('Kullanıcılar yüklenemedi:', err)
    users.value = []
  }
}

const fetchRoles = async () => {
  try {
    roles.value = await roleService.getAll()
  } catch (err) {
    console.error('Roller yüklenemedi:', err)
    roles.value = []
  }
}

const fetchBranches = async () => {
  try {
    branches.value = await branchService.getAll()
  } catch (err) {
    console.error('Şubeler yüklenemedi:', err)
  }
}

const fetchCompanies = async () => {
  try {
    companies.value = await companyService.getAll()
  } catch (err) {
    console.error('Şirketler yüklenemedi:', err)
  }
}

const getRoleLabel = (userOrRole) => {
  if (typeof userOrRole === 'string') {
    const roleObj = roles.value.find(r => r.id === userOrRole || r.name === userOrRole);
    if (roleObj) return roleObj.name;
    const r = userOrRole.toUpperCase();
    const hardcoded = {
      'SUPER_MASTER': 'SÜPER YÖNETİCİ',
      'INSTRUCTOR': 'EĞİTMEN',
      'MEMBER': 'ÜYE',
      'RECEPTIONIST': 'PERSONEL',
      'TERMINAL': 'TERMİNAL',
      'ADMIN': 'YÖNETİCİ',
      'BRANCH_MASTER': 'ŞUBE YÖNETİCİSİ'
    }
    return hardcoded[r] || r;
  }
  if (userOrRole?.Role?.name) return userOrRole.Role.name;
  if (userOrRole?.role) return getRoleLabel(userOrRole.role);
  return 'TANIMSIZ';
}

const getSystemRoleLabel = (role) => {
  if (!role) return 'BELİRSİZ';
  const r = role.toUpperCase();
  const hardcoded = {
    'SUPER_MASTER': 'SÜPER YÖNETİCİ',
    'INSTRUCTOR': 'EĞİTMEN',
    'MEMBER': 'ÜYE',
    'RECEPTIONIST': 'PERSONEL',
    'USER': 'KULLANICI',
    'TERMINAL': 'TERMİNAL',
    'ADMIN': 'YÖNETİCİ',
    'BRANCH_MASTER': 'ŞUBE YÖNETİCİSİ'
  }
  return hardcoded[r] || r;
}

const selectUser = (user) => {
  selectedUser.value = JSON.parse(JSON.stringify(user))
  newPassword.value = ''
  
  if (user.instructorProfile?.fullName) {
    selectedUser.value.fullName = user.instructorProfile.fullName;
  } else if (user.personnelProfile?.fullName) {
    selectedUser.value.fullName = user.personnelProfile.fullName;
  } else if (user.memberProfile?.fullName) {
    selectedUser.value.fullName = user.memberProfile.fullName;
  }

  if (user.instructorProfile?.phone) {
    selectedUser.value.phone = user.instructorProfile.phone;
  } else if (user.personnelProfile?.phone) {
    selectedUser.value.phone = user.personnelProfile.phone;
  } else if (user.memberProfile?.phone) {
    selectedUser.value.phone = user.memberProfile.phone;
  }

  if (!selectedUser.value.personnelCode) {
    selectedUser.value.personnelCode = 
      user.personnelProfile?.personnelCode || 
      user.instructorProfile?.instructorCode || 
      user.memberProfile?.memberCode || 
      '';
  }

  if (isTerminal(user)) {
    userService.getKioskConfig(user.id)
      .then(data => {
        selectedUser.value.kioskConfig = data;
      })
      .catch(err => {
        selectedUser.value.kioskConfig = {
          kioskMode: false,
          serverIP: window.location.hostname,
          autoLogin: true,
          showVirtualKeyboard: false,
          autoRestart: false,
          terminalType: 'MEMBER_ENTRY',
          refreshInterval: 60,
          macAddress: '',
          appVersion: 'v1.0.0',
          terminalUsername: user.username,
          terminalPassword: '',
          heartbeatAt: null
        };
      });
  }
}

const openUserForm = () => {
  newPassword.value = ''
  const role = securitySubTab.value === 'management' ? 'ADMIN' : 
               securitySubTab.value === 'instructors' ? 'INSTRUCTOR' : 
               securitySubTab.value === 'staff_sub' ? 'RECEPTIONIST' : 
               securitySubTab.value === 'users_sub' ? 'USER' : 
               securitySubTab.value === 'terminals_sub' ? 'TERMINAL' : 'MEMBER'
  
  selectedUser.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    role: role,
    branchId: globalSelection.value.branchId || auth.user?.branchId || '',
    companyId: globalSelection.value.companyId || auth.user?.companyId || '',
    isTwoFactorEnabled: false,
    kioskConfig: role === 'TERMINAL' ? {
      kioskMode: true,
      serverIP: serverNetworkIp.value || ((host !== 'localhost' && host !== '127.0.0.1') ? host : '127.0.0.1'),
      autoLogin: true,
      showVirtualKeyboard: false,
      autoRestart: false,
      terminalType: 'MEMBER_ENTRY',
      refreshInterval: 60,
      macAddress: '',
      terminalUsername: '',
      terminalPassword: '',
      appVersion: 'v1.0.0',
      heartbeatAt: null
    } : null
  }
}

const saveUserSettingsLocal = async () => {
  if (!selectedUser.value) return
  loading.value = true
  try {
    if (!selectedUser.value.id) {
      if (!selectedUser.value.username) {
        showAlertError('EKSİK BİLGİ', 'Kullanıcı adı zorunludur.')
        loading.value = false;
        return;
      }
      if (!newPassword.value) {
        showAlertError('EKSİK BİLGİ', 'Yeni kullanıcı için şifre zorunludur.')
        loading.value = false;
        return;
      }
      if (newPassword.value) selectedUser.value.password = newPassword.value;
      
      console.log('🚀 [KULLANICI EKLE] Gönderilen veri:', JSON.parse(JSON.stringify(selectedUser.value)));
      const res = await userService.create(selectedUser.value)
      console.log('✅ [KULLANICI EKLE] Başarıyla oluşturuldu:', res);
      
      if (selectedUser.value.role === 'TERMINAL' && selectedUser.value.kioskConfig) {
         await userService.saveKioskConfig({
            userId: res.user.id,
            ...selectedUser.value.kioskConfig
         });
      }
      showAlertSuccess('EKLENDİ', 'Kullanıcı başarıyla oluşturuldu.')
    } else {
      const updatePayload = { ...selectedUser.value }
      if (newPassword.value) updatePayload.password = newPassword.value
      
      console.log('🔄 [KULLANICI GÜNCELLE] Gönderilen veri:', JSON.parse(JSON.stringify(updatePayload)));
      await userService.updateSettings(selectedUser.value.id, updatePayload)
      console.log('✅ [KULLANICI GÜNCELLE] Başarıyla güncellendi:', selectedUser.value.id);

      if (selectedUser.value.role === 'TERMINAL' && selectedUser.value.kioskConfig) {
         await userService.saveKioskConfig({
            userId: selectedUser.value.id,
            ...selectedUser.value.kioskConfig
         });
      }
      showAlertSuccess('GÜNCELLENDİ', 'Kullanıcı ayarları başarıyla kaydedildi.')
    }
    await fetchUsers()
    selectedUser.value = null
    newPassword.value = ''
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Hata oluştu.'
    console.error('❌ [KULLANICI HATASI]:', err);
    showAlertError('HATA', errorMsg)
  } finally {
    loading.value = false
  }
}

const deleteUserLocal = async (id) => {
  const isConfirmed = await showAlertConfirm('EMİN MİSİNİZ?', 'Kullanıcı hesabı kalıcı olarak silinecektir!')
  if (isConfirmed) {
    loading.value = true
    try {
      await userService.delete(id)
      await fetchUsers()
      selectedUser.value = null
      showAlertSuccess('SİLİNDİ', 'Kullanıcı başarıyla silindi.')
    } catch (err) {
      showAlertError('HATA', 'Hata oluştu.')
    } finally {
      loading.value = false
    }
  }
}



const downloadKioskConfig = () => {
  if (!selectedUser.value?.kioskConfig) return;
  const config = {
    ...selectedUser.value.kioskConfig,
    terminalUsername: selectedUser.value.username,
    // Önce özel terminal şifresini, yoksa yeni belirlenen genel şifreyi, o da yoksa mevcut placeholder'ı kullan
    terminalPassword: selectedUser.value.kioskConfig.terminalPassword || newPassword.value || 'EXISTING_PASSWORD',
    terminalId: selectedUser.value.id,
    terminalName: selectedUser.value.username,
    branchId: selectedUser.value.branchId,
    companyId: selectedUser.value.companyId,
    apiHost: `http://${host}:5000`
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kiosk-config-${selectedUser.value.username}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const sendSingleFreeText = async () => {
  if (!selectedUser.value || !selectedUser.value.phone) return
  const text = await showAlertPrompt('SERBEST MESAJ GÖNDER', 'Buraya mesajınızı yazın...')
  if (text) {
    loading.value = true
    try {
      await userService.sendSingleWhatsApp({
        phone: selectedUser.value.phone,
        message: text,
        branchId: selectedUser.value.branchId
      })
      showAlertSuccess('GÖNDERİLDİ')
    } catch (err) {
      showAlertError('HATA')
    } finally {
      loading.value = false
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
}

onMounted(() => {
  fetchBranches()
  fetchCompanies()
  fetchSystemInfo()
  
  // İlk yüklemede verileri çek (özellikle selector gizliyse veya geç yüklenirse)
  if (auth.user && !globalSelection.value.companyId) {
    globalSelection.value.companyId = auth.user.companyId || auth.user.CompanyId || ''
    globalSelection.value.branchId = auth.user.branchId || auth.user.BranchId || ''
  }
  
  fetchUsers()
  fetchRoles()
})

watch(securitySubTab, () => {
  selectedUser.value = null
  userSearchQuery.value = ''
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
</style>
