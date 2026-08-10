<template>
  <div class="h-full flex flex-col animate-in">
    <div v-if="!auth.isBehaAdmin" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4 opacity-40">
        <Building2 class="w-16 h-16 text-slate-600 mx-auto" />
        <p class="text-sm font-bold text-slate-500 tracking-widest uppercase">BU BÖLÜMÜ GÖRMEK İÇİN YETKİNİZ YOK</p>
      </div>
    </div>

    <div v-else class="h-full flex flex-col overflow-hidden relative px-[10px]">
      <div class="flex-none pt-2 pb-4">
         <BaseGlobalSelector 
           v-if="auth.isBehaAdmin"
           storageKey="settings_branches_selection" 
           @change="onGlobalSelectionChange"
         />
      </div>
      <!-- Search, Table and View Controls (Only visible when form is closed) -->
      <template v-if="!showBranchForm">
        <BaseSearchFilter 
          v-model:searchQuery="branchSearchQuery"
          v-model:viewMode="branchViewMode"
          accent="emerald"
          placeholder="ŞUBE ARA... (Ad, Şirket, Şehir vb.)"
          class="w-full !border-emerald-500/30 !shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <template #extra-actions>
             <div class="hover:bg-white/5 flex items-center px-1">
                <BaseButton 
                  variant="success" 
                  size="icon-sm"
                  @click="openBranchForm({})" 
                  title="Yeni Şube Ekle"
                >
                  <template #icon><Plus class="w-4 h-4" /></template>
                </BaseButton>
             </div>
          </template>
        </BaseSearchFilter>

        <BaseScroll direction="vertical" accent="emerald" class="flex-1 py-4 !px-0">
          <!-- Grid View -->
          <div v-if="branchViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="branch in filteredBranchList" :key="branch.id" class="bg-slate-900/40 border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-500 group relative overflow-hidden rounded-2xl">
              <!-- Top Neon Line -->
              <div class="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 opacity-50 group-hover:opacity-100 shadow-[0_0_10px_#10b981] transition-all duration-500"></div>

              <div class="p-5 flex items-start justify-between gap-4">
                <div class="flex-1 overflow-hidden">
                  <h4 class="text-[0.85rem] font-black text-slate-100 truncate tracking-tight uppercase">{{ branch.name }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                     <span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[0.55rem] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">
                       {{ branch.company?.name || 'Şirket Yok' }}
                     </span>
                  </div>
                </div>
              </div>
              
              <div class="px-5 py-4 bg-slate-950/40 space-y-3">
                 <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">YETKİLİ</span>
                    <span class="text-[0.65rem] text-slate-200 font-bold uppercase truncate max-w-[150px]">{{ branch.authorizedPerson || '—' }}</span>
                 </div>
                 <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">İLETİŞİM</span>
                    <span class="text-[0.65rem] text-slate-300 font-bold truncate max-w-[150px]">{{ branch.phone || branch.email || '—' }}</span>
                 </div>
                 <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">LOKASYON</span>
                    <span class="text-[0.65rem] text-slate-400 font-bold uppercase truncate max-w-[150px]">{{ branch.city || '-' }} / {{ branch.district || '-' }}</span>
                 </div>
              </div>

              <div class="px-5 py-4 flex items-center justify-end gap-2 border-t border-slate-800/50">
                 <BaseButton variant="dark" size="icon-sm" @click="editBranch(branch)" title="Düzenle">
                    <template #icon><Edit class="w-3.5 h-3.5" /></template>
                 </BaseButton>
                 <BaseButton variant="danger" size="icon-sm" @click="deleteBranch(branch.id)" title="Sil">
                    <template #icon><Trash2 class="w-3.5 h-3.5" /></template>
                 </BaseButton>
              </div>
            </div>
          </div>
          
          <!-- List View (BaseTable Integration) -->
          <div v-else class="h-full">
            <BaseTable 
              :columns="branchColumns" 
              :items="filteredBranchList" 
              accent="emerald"
              class="!border-emerald-500/30 !shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <!-- Custom Cell for Branch Name -->
              <template #cell-name="{ item }">
                <div class="flex flex-col py-1 overflow-hidden">
                  <h4 class="text-[0.75rem] font-black text-slate-100 truncate tracking-tight uppercase">{{ item.name }}</h4>
                  <p class="text-[0.55rem] text-emerald-500/60 font-bold tracking-widest uppercase">ID: {{ item.id.slice(0, 8) }}</p>
                </div>
              </template>

              <!-- Custom Cell for Company -->
              <template #cell-company="{ item }">
                <span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[0.55rem] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest whitespace-nowrap">
                  {{ item.company?.name || 'BELİRTİLMEMİŞ' }}
                </span>
              </template>

              <!-- Custom Cell for Location -->
              <template #cell-location="{ item }">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] text-slate-300 font-bold uppercase truncate">📍 {{ item.city || '-' }}</span>
                  <span class="text-[0.55rem] text-slate-500 font-medium uppercase tracking-tighter">{{ item.district || '-' }}</span>
                </div>
              </template>

              <!-- Custom Cell for Contact -->
              <template #cell-contact="{ item }">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] text-slate-400 font-bold truncate">{{ item.phone || '-' }}</span>
                  <span class="text-[0.55rem] text-slate-600 font-medium lowercase truncate opacity-60">{{ item.email || '-' }}</span>
                </div>
              </template>

              <!-- Custom Cell for Actions -->
              <template #cell-actions="{ item }">
                <div class="flex items-center justify-end gap-2 pr-2">
                  <BaseButton variant="dark" size="icon-sm" @click="editBranch(item)" title="Düzenle">
                     <template #icon><Edit class="w-3.5 h-3.5" /></template>
                  </BaseButton>
                  <BaseButton variant="danger" size="icon-sm" @click="deleteBranch(item.id)" title="Sil">
                     <template #icon><Trash2 class="w-3.5 h-3.5" /></template>
                  </BaseButton>
                </div>
              </template>
            </BaseTable>
          </div>
          
          <div v-if="!filteredBranchList.length" class="flex flex-col items-center justify-center h-full py-20 pointer-events-none">
             <div class="w-32 h-32 rounded-full bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center mb-6">
               <Building2 class="w-12 h-12 text-slate-700" />
             </div>
             <p class="text-[0.7rem] font-black text-slate-500 tracking-[0.3em] uppercase">{{ branchSearchQuery ? 'Arama sonucu bulunamadı' : 'Sistemde henüz şube bulunmuyor' }}</p>
          </div>
        </BaseScroll>

        <!-- MAIN ACTION FOOTER -->
        <BaseActionFooter>
           <div class="flex items-center gap-2">
              <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
                 <template #icon><ArrowLeft class="w-5 h-5" /></template>
              </BaseButton>

              <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

              <BaseButton 
                variant="success" 
                size="icon"
                square
                @click="openBranchForm({})" 
                title="YENİ ŞUBE EKLE"
              >
                <template #icon><Plus class="w-5 h-5" /></template>
              </BaseButton>
           </div>
        </BaseActionFooter>
      </template>

      <!-- Branch Form View (Inline) -->
      <template v-else>
        <div class="h-full flex flex-col bg-slate-900/40 relative overflow-hidden animate-in fade-in zoom-in duration-300">
  
          <!-- Form Body -->
          <BaseScroll direction="vertical" accent="indigo" class="flex-1 p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Left Column -->
              <div class="space-y-6">
                <div class="flex items-center gap-2 p-2 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                  <Building2 class="w-4 h-4 text-indigo-400" />
                  <span class="text-[0.7rem] font-black text-slate-400 tracking-[0.2em] uppercase">Temel Bilgiler</span>
                </div>
                
                <BaseInput 
                   v-model="selectedCompanyForBranchTab"
                   type="select"
                   label="Şirket Ataması"
                   required
                   :disabled="editingBranch"
                   :options="[{ value: '', label: 'Şirket Seçiniz...' }, ...companies.map(c => ({ value: c.id, label: c.name }))]"
                />
                
                <BaseInput 
                   v-model="branchForm.name" 
                   label="Şube Adı" 
                   required 
                   placeholder="Örn: Merkez Şube, Kadıköy v.b."
                />
                
                <BaseInput 
                   v-model="branchForm.authorizedPerson" 
                   label="Şube Yetkilisi" 
                   placeholder="Ad Soyad"
                />
                
                <div class="grid grid-cols-2 gap-4">
                  <BaseInput 
                    v-model="branchForm.email" 
                    type="email" 
                    label="E-Posta"
                    placeholder="sube@sirket.com"
                  />
                  <BaseInput 
                    :modelValue="branchForm.phone" 
                    label="Telefon"
                    placeholder="0 (5XX) XXX XX XX"
                    maxlength="17"
                    @update:modelValue="val => branchForm.phone = inputMasks.phone(val)"
                  />
                </div>
                
                <BaseInput 
                  v-model="branchForm.address" 
                  type="textarea"
                  label="Şube Adresi"
                  placeholder="Tam adres bilgisi..."
                  :rows="3"
                />
                
                <div class="grid grid-cols-2 gap-4">
                  <BaseInput v-model="branchForm.city" label="Şehir" placeholder="İl..." />
                  <BaseInput v-model="branchForm.district" label="İlçe" placeholder="İlçe..." />
                </div>
              </div>
              
              <!-- Right Column -->
              <div class="space-y-6">
                <div class="flex items-center gap-2 p-2 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                  <CreditCard class="w-4 h-4 text-amber-400" />
                  <span class="text-[0.7rem] font-black text-slate-400 tracking-[0.2em] uppercase">Resmi Kayıtlar & Zamanlama</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <BaseInput v-model="branchForm.taxOffice" label="Vergi Dairesi" placeholder="Daire Adı" />
                  <BaseInput :modelValue="branchForm.taxNumber" label="Vergi No" placeholder="10 Hane" maxlength="10" @update:modelValue="val => branchForm.taxNumber = inputMasks.numeric(val, 10)" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                   <BaseInput v-model="branchForm.openingTime" type="time" label="Açılış" />
                   <BaseInput v-model="branchForm.closingTime" type="time" label="Kapanış" />
                </div>
  
                <BaseInput 
                   v-model="branchForm.closedDay" 
                   type="select" 
                   label="Haftalık Kapalı Gün"
                   :options="[
                      { value: null, label: 'Yok (Her Gün Açık)' },
                      { value: 0, label: 'Pazartesi' },
                      { value: 1, label: 'Salı' },
                      { value: 2, label: 'Çarşamba' },
                      { value: 3, label: 'Perşembe' },
                      { value: 4, label: 'Cuma' },
                      { value: 5, label: 'Cumartesi' },
                      { value: 6, label: 'Pazar' }
                   ]"
                />
  
                <BaseInput 
                   v-model="branchForm.notificationSystemMode" 
                   type="select" 
                   label="Bildirim Servisleri"
                   :options="[
                      { value: 'BOTH', label: 'Hem Whatsapp Hem E-Posta' },
                      { value: 'WHATSAPP', label: 'Sadece Whatsapp' },
                      { value: 'MAIL', label: 'Sadece E-Posta' },
                      { value: 'NONE', label: 'Hizmet Kapalı' }
                   ]"
                />
                
                <div class="space-y-4 mt-6">
                  <label class="block text-ui-label font-ui-normal text-white tracking-ui ml-1 font-black uppercase">Şube Logosu</label>
                  
                  <div class="relative group/logo h-48 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition-all rounded-3xl flex flex-col items-center justify-center p-6 overflow-hidden">
                    <Transition name="fade" mode="out-in">
                      <div v-if="branchForm.logo" class="flex flex-col items-center gap-4">
                        <div class="w-24 h-24 bg-slate-900 border-2 border-indigo-500/30 rounded-2xl flex items-center justify-center overflow-hidden p-2 shadow-2xl">
                          <img :src="getLogoUrl(branchForm.logo)" class="w-full h-full object-contain" />
                        </div>
                        <BaseButton variant="danger" size="sm" @click="branchForm.logo = ''">
                          <template #icon><X class="w-3.5 h-3.5" /></template>
                          LOGOYU KALDIR
                        </BaseButton>
                      </div>
                      <div v-else class="flex flex-col items-center gap-3">
                           <div class="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
                               <Building2 class="w-8 h-8" />
                           </div>
                           <p class="text-[0.6rem] text-slate-500 font-black tracking-widest uppercase">LOGO SEÇİLMEDİ</p>
                      </div>
                    </Transition>
  
                    <input ref="branchLogoFileInput" type="file" accept="image/*" @change="handleBranchLogoUpload" class="hidden" />
                    <BaseButton 
                      variant="ghost" 
                      class="absolute inset-0 opacity-0 group-hover/logo:opacity-100 backdrop-blur-sm"
                      @click="$refs.branchLogoFileInput.click()"
                      :loading="loading"
                    >
                      LOGO DEĞİŞTİR
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </BaseScroll>
  
          <!-- FORM ACTION FOOTER -->
          <BaseActionFooter>
             <BaseButton variant="dark" size="icon" square @click="closeBranchForm" title="İPTAL">
                <template #icon><X class="w-4 h-4 text-slate-400" /></template>
             </BaseButton>
  
             <BaseButton variant="indigo" size="icon" square :loading="loading" @click="saveBranch" title="KAYDET">
                <template #icon><Save class="w-4 h-4" /></template>
             </BaseButton>
          </BaseActionFooter>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { Building2, MapPin, Phone, Mail, Globe, Clock, Plus, Edit, Trash2, X, Save, CheckCircle, Search, ArrowLeft, CreditCard } from 'lucide-vue-next'

// Components
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'

// Services & Composables
import { companyService } from '../../services/admin/companyService'
import { branchService } from '../../services/admin/branchService'
import { uploadService } from '../../services/admin/uploadService'
import { useAlerts } from '../../utils/alerts'

import { inputMasks } from '../../utils/inputMasks'

const auth = useAuthStore()
const router = useRouter()
const host = window.location.hostname
const { toast, confirm, error: showAlertError } = useAlerts()

const branchColumns = [
  { key: 'name', label: 'ŞUBE ADI', align: 'left', width: '30%' },
  { key: 'company', label: 'BAĞLI ŞİRKET', align: 'left', width: '20%' },
  { key: 'location', label: 'LOKASYON', align: 'left', width: '20%' },
  { key: 'contact', label: 'İLETİŞİM', align: 'left', width: '20%' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right', width: '10%' }
]

const props = defineProps({
  isSuperMaster: Boolean,
  companies: { type: Array, default: () => [] },
  initialCompanyId: { type: String, default: '' }
})

const emit = defineEmits(['refresh-companies'])

const loading = ref(false)
const showBranchForm = ref(false)
const editingBranch = ref(null)
const branchSearchQuery = ref('')
const branchViewMode = ref('list')

const globalSelection = ref({ companyId: '', branchId: '', remember: false })

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
}

const branchForm = ref({ 
  name: '', email: '', phone: '', address: '', city: '', district: '', 
  taxOffice: '', taxNumber: '', authorizedPerson: '', logo: '',
  openingTime: '06:00', closingTime: '23:00', closedDay: null,
  notificationSystemMode: 'BOTH'
})

const selectedCompanyForBranchTab = ref(props.initialCompanyId)

watch(() => props.initialCompanyId, (newVal) => {
  if (newVal) selectedCompanyForBranchTab.value = newVal
})

const allBranches = computed(() => {
  const list = []
  props.companies.forEach(company => {
    if (company.branches && Array.isArray(company.branches)) {
      company.branches.forEach(branch => {
        list.push({
          ...branch,
          company: { id: company.id, name: company.name }
        })
      })
    }
  })
  return list
})

const filteredBranchList = computed(() => {
  let list = allBranches.value
  if (globalSelection.value.companyId) {
    list = list.filter(b => b.companyId === globalSelection.value.companyId || b.company?.id === globalSelection.value.companyId)
  }
  if (globalSelection.value.branchId) {
    list = list.filter(b => b.id === globalSelection.value.branchId)
  }
  if (!branchSearchQuery.value) return list
  const query = branchSearchQuery.value.toLowerCase()
  return list.filter(branch => 
    branch.name?.toLowerCase().includes(query) ||
    branch.company?.name?.toLowerCase().includes(query) ||
    branch.city?.toLowerCase().includes(query) ||
    branch.district?.toLowerCase().includes(query) ||
    branch.phone?.toLowerCase().includes(query) ||
    branch.email?.toLowerCase().includes(query)
  )
})



const openBranchForm = (company) => {
  if (company?.id) { selectedCompanyForBranchTab.value = company.id }
  else if (globalSelection.value.companyId) { selectedCompanyForBranchTab.value = globalSelection.value.companyId }
  
  branchForm.value = { 
    name: '', email: '', phone: '', address: '', city: '', district: '', 
    taxOffice: '', taxNumber: '', authorizedPerson: '', logo: '',
    openingTime: '06:00', closingTime: '23:00', closedDay: null,
    notificationSystemMode: 'BOTH'
  }
  editingBranch.value = null
  showBranchForm.value = true
}

const editBranch = (branch) => {
  editingBranch.value = branch
  selectedCompanyForBranchTab.value = branch.company?.id || branch.companyId || ''
  branchForm.value = { 
    name: branch.name,
    email: branch.email || '',
    phone: branch.phone || '',
    address: branch.address || '',
    city: branch.city || '',
    district: branch.district || '',
    taxOffice: branch.taxOffice || '',
    taxNumber: branch.taxNumber || '',
    authorizedPerson: branch.authorizedPerson || '',
    logo: branch.logo || '',
    openingTime: branch.openingTime || '06:00',
    closingTime: branch.closingTime || '23:00',
    closedDay: branch.closedDay,
    notificationSystemMode: branch.notificationSystemMode || 'BOTH'
  }
  showBranchForm.value = true
}

const closeBranchForm = () => {
  showBranchForm.value = false
  editingBranch.value = null
}

const saveBranch = async () => {
  if (!selectedCompanyForBranchTab.value) {
    showAlertError('ŞİRKET SEÇİLMEDİ', 'Lütfen önce bir şirket seçiniz.')
    return
  }
  if (!branchForm.value.name) {
    showAlertError('EKSİK BİLGİ', 'Şube adı zorunludur.')
    return
  }
  
  loading.value = true
  try {
    const companyId = selectedCompanyForBranchTab.value
    if (editingBranch.value) {
      await branchService.update(editingBranch.value.id, branchForm.value)
      toast('Şube güncellendi.')
    } else {
      await companyService.addBranch(companyId, branchForm.value)
      toast('Şube oluşturuldu.')
    }
    closeBranchForm()
    emit('refresh-companies')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'İşlem başarısız')
  } finally {
    loading.value = false
  }
}

const deleteBranch = async (id) => {
  const isConfirmed = await confirm('SİLELİM Mİ?', 'Bu şube kalıcı olarak silinecektir.')
  if (isConfirmed) {
    loading.value = true
    try {
      await branchService.delete(id)
      toast('Şube silindi.')
      emit('refresh-companies')
    } catch (err) {
      showAlertError('HATA', 'Şube silinemedi.')
    } finally {
      loading.value = false
    }
  }
}

const handleBranchLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  loading.value = true
  try {
    const filePath = await uploadService.uploadFile(file)
    branchForm.value.logo = filePath
    toast('Logo yüklendi.')
  } catch (err) {
    showAlertError('YÜKLEME HATASI', err.response?.data?.message || 'Hata oluştu')
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

const getLogoUrl = (logoPath) => {
  if (!logoPath) return ''
  if (logoPath.startsWith('http')) return logoPath
  return `http://${host}:5000${logoPath}`
}

onMounted(() => {
  if (!auth.isBehaAdmin && auth.user) {
    globalSelection.value = {
      companyId: auth.user.companyId || '',
      branchId: auth.user.branchId || '',
      remember: true
    }
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); }
</style>
