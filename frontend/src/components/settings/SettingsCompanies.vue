<template>
  <div class="h-full animate-in flex flex-col">
    <div v-if="!auth.isBehaAdmin && !isSuperMaster" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4 opacity-40">
        <Building2 class="w-16 h-16 text-slate-600 mx-auto" />
        <p class="text-sm font-bold text-slate-500 tracking-widest uppercase">BU BÖLÜMÜ GÖRMEK İÇİN YETKİNİZ YOK</p>
      </div>
    </div>

    <div v-else class="h-full flex flex-col overflow-hidden relative px-[10px]">

      <div class="flex-1 overflow-hidden">
        <!-- List View State -->
        <template v-if="!showCompanyForm">
          <BaseScroll direction="vertical" accent="emerald" class="h-full py-4 !px-0">
            <!-- Grid View -->
            <div v-if="companyViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="company in filteredCompanyList" :key="company.id" class="bg-slate-900/40 border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-500 group relative overflow-hidden rounded-2xl">
                 <!-- Top Neon Line -->
                 <div class="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 opacity-50 group-hover:opacity-100 shadow-[0_0_10px_#10b981] transition-all duration-500"></div>
                 
                 <!-- Company Header -->
                <div class="p-5 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-4 flex-1 overflow-hidden">
                    <div v-if="company.logo" class="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
                      <img :src="getLogoUrl(company.logo)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-14 h-14 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 class="w-6 h-6 text-emerald-400" />
                    </div>
                    <div class="overflow-hidden">
                      <h4 class="text-[0.8rem] font-black text-slate-100 truncate tracking-tight uppercase">{{ company.name }}</h4>
                      <div class="flex items-center gap-2 mt-1">
                         <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[0.55rem] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
                           {{ company.branches?.length || 0 }} ŞUBE
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Details -->
                <div class="px-5 py-4 bg-slate-950/40 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">LOKASYON</span>
                    <span class="text-[0.65rem] text-slate-300 font-bold uppercase truncate max-w-[150px]">{{ company.city || '-' }} / {{ company.district || '-' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">YETKİLİ</span>
                    <span class="text-[0.65rem] text-slate-200 font-bold uppercase truncate max-w-[150px]">{{ company.authorizedPerson || '-' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[0.55rem] font-black tracking-widest text-slate-500 uppercase">VERGİ NO</span>
                    <span class="text-[0.65rem] text-amber-500 font-mono font-bold">{{ company.taxNumber || '-' }}</span>
                  </div>
                </div>

                <!-- Footer Stats & Actions -->
                <div class="px-5 py-4 flex items-center justify-between border-t border-slate-800/50">
                   <div class="flex items-center gap-4">
                      <div class="flex flex-col">
                         <span class="text-[0.45rem] text-slate-500 font-black tracking-widest uppercase">PERSONEL</span>
                         <span class="text-[0.75rem] text-white font-black">{{ company.totalPersonnel || 0 }}</span>
                      </div>
                      <div class="flex flex-col">
                         <span class="text-[0.45rem] text-slate-500 font-black tracking-widest uppercase">ÜYE</span>
                         <span class="text-[0.75rem] text-white font-black">{{ company.totalMembers || 0 }}</span>
                      </div>
                   </div>
                   
                   <div class="flex items-center gap-2">
                     <BaseButton variant="dark" size="icon-sm" @click="editCompany(company)" title="Düzenle">
                        <template #icon><Edit class="w-3.5 h-3.5" /></template>
                     </BaseButton>
                     <BaseButton variant="danger" size="icon-sm" @click="deleteCompany(company.id)" title="Sil">
                        <template #icon><Trash2 class="w-3.5 h-3.5" /></template>
                     </BaseButton>
                     <BaseButton variant="secondary" size="sm" @click="$emit('select-company', company.id)">
                        ŞUBELER
                     </BaseButton>
                   </div>
                </div>
              </div>
            </div>

            <!-- List View (BaseTable Integration) -->
            <div v-else class="h-full">
              <BaseTable 
                :columns="companyColumns" 
                :items="filteredCompanyList" 
                accent="emerald"
                class="!border-emerald-500/30 !shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <!-- Custom Cell for Logo & Name -->
                <template #cell-name="{ item }">
                  <div class="flex items-center gap-4 overflow-hidden py-1">
                    <div v-if="item.logo" class="w-10 h-10 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                      <img :src="getLogoUrl(item.logo)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 class="w-5 h-5 text-emerald-400" />
                    </div>
                    <div class="overflow-hidden">
                      <h4 class="text-[0.75rem] font-black text-slate-100 truncate tracking-tight uppercase">{{ item.name }}</h4>
                      <p class="text-[0.55rem] text-emerald-500/60 font-bold tracking-widest uppercase">ID: {{ item.id.slice(0, 8) }}</p>
                    </div>
                  </div>
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

                <!-- Custom Cell for Branches -->
                <template #cell-branches="{ item }">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[0.55rem] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest whitespace-nowrap">
                      {{ item.branches?.length || 0 }} ŞUBE
                    </span>
                  </div>
                </template>

                <!-- Custom Cell for Actions -->
                <template #cell-actions="{ item }">
                  <div class="flex items-center justify-end gap-2 pr-2">
                    <BaseButton variant="dark" size="icon-sm" @click="editCompany(item)" title="Düzenle">
                       <template #icon><Edit class="w-3.5 h-3.5" /></template>
                    </BaseButton>
                    <BaseButton variant="danger" size="icon-sm" @click="deleteCompany(item.id)" title="Sil">
                       <template #icon><Trash2 class="w-3.5 h-3.5" /></template>
                    </BaseButton>
                    <BaseButton variant="secondary" size="sm" @click="$emit('select-company', item.id)">
                       ŞUBELER
                    </BaseButton>
                  </div>
                </template>
              </BaseTable>
            </div>

            <!-- Empty State -->
            <div v-if="!filteredCompanyList.length" class="flex flex-col items-center justify-center h-full py-20 pointer-events-none">
              <div class="w-32 h-32 rounded-full bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center mb-6">
                <Building2 class="w-12 h-12 text-slate-700" />
              </div>
              <p class="text-[0.7rem] font-black text-slate-500 tracking-[0.3em] uppercase">{{ companySearchQuery ? 'Arama sonucu bulunamadı' : 'Sistemde henüz şirket bulunmuyor' }}</p>
            </div>
          </BaseScroll>

          <!-- LIST ACTION FOOTER -->
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
                  @click="showCompanyForm = true; editingCompany = null" 
                  title="YENİ ŞİRKET EKLE"
                >
                  <template #icon><Plus class="w-5 h-5" /></template>
                </BaseButton>
             </div>
          </BaseActionFooter>
        </template>

        <!-- Company Form View (Inline) -->
        <template v-else>
          <div class="h-full flex flex-col bg-slate-900/40 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <!-- Form Body -->
            <BaseScroll direction="vertical" accent="emerald" class="flex-1 p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="space-y-6">
                  <div class="flex items-center gap-2 p-2 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                    <Building2 class="w-4 h-4 text-emerald-400" />
                    <span class="text-[0.7rem] font-black text-slate-400 tracking-[0.2em] uppercase">Genel Bilgiler</span>
                  </div>
                  
                  <BaseInput 
                    v-model="companyForm.name" 
                    label="Şirket Tam Unvanı" 
                    required 
                    placeholder="Örn: Beha Soft Yazılım Ltd. Şti."
                  />
                  
                  <BaseInput 
                    v-model="companyForm.authorizedPerson" 
                    label="Yetkili Temsilci" 
                    placeholder="Ad Soyad"
                  />
                  
                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput 
                      v-model="companyForm.email" 
                      type="email" 
                      label="E-Posta"
                      placeholder="iletisim@sirket.com"
                      :error="emailError"
                    />
                    <BaseInput 
                      :modelValue="companyForm.phone" 
                      label="Telefon"
                      placeholder="0 (XXX) XXX XX XX"
                      maxlength="17"
                      @update:modelValue="val => companyForm.phone = inputMasks.phone(val)"
                    />
                  </div>
                  
                  <BaseInput 
                    v-model="companyForm.address" 
                    type="textarea"
                    label="Merkez Adres"
                    placeholder="Tam adres bilgisi..."
                    :rows="3"
                  />
                  
                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model="companyForm.city" label="Şehir" placeholder="Örn: İstanbul" />
                    <BaseInput v-model="companyForm.district" label="İlçe" placeholder="Örn: Şişli" />
                  </div>
                </div>
                
                <!-- Right Column -->
                <div class="space-y-6">
                  <div class="flex items-center gap-2 p-2 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                    <CreditCard class="w-4 h-4 text-amber-400" />
                    <span class="text-[0.7rem] font-black text-slate-400 tracking-[0.2em] uppercase">Resmi Kayıtlar</span>
                  </div>
                  
                  <BaseInput v-model="companyForm.taxOffice" label="Vergi Dairesi" placeholder="Daire Adı" />
                  
                  <BaseInput 
                    :modelValue="companyForm.taxNumber" 
                    label="Vergi Numarası"
                    placeholder="10 Haneli VKN"
                    maxlength="10"
                    @update:modelValue="val => {
                      companyForm.taxNumber = inputMasks.numeric(val, 10)
                      taxNumberError = (companyForm.taxNumber.length > 0 && companyForm.taxNumber.length < 10) 
                        ? 'Vergi numarası 10 hane olmalıdır' : ''
                    }"
                    :error="taxNumberError"
                  />
                  
                  <div class="space-y-4">
                    <label class="block text-ui-label font-ui-normal text-white tracking-ui ml-1 font-black uppercase">Kurumsal Logo</label>
                    
                    <!-- Logo Preview & Upload -->
                    <div class="relative group/logo h-48 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 transition-all rounded-3xl flex flex-col items-center justify-center p-6 overflow-hidden">
                      <Transition name="fade" mode="out-in">
                        <div v-if="companyForm.logo" class="flex flex-col items-center gap-4">
                          <div class="w-24 h-24 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center overflow-hidden p-2 shadow-2xl">
                            <img :src="getLogoUrl(companyForm.logo)" class="w-full h-full object-contain" @error="handleLogoError" />
                          </div>
                          <BaseButton variant="danger" size="sm" @click="companyForm.logo = ''">
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

                      <input ref="logoFileInput" type="file" accept="image/*" @change="handleLogoUpload" class="hidden" />
                      <BaseButton 
                        variant="ghost" 
                        class="absolute inset-0 opacity-0 group-hover/logo:opacity-100 backdrop-blur-sm"
                        @click="$refs.logoFileInput.click()"
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
               <BaseButton variant="dark" size="icon" square @click="closeCompanyForm" title="İPTAL">
                  <template #icon><X class="w-4 h-4 text-slate-400" /></template>
               </BaseButton>

               <BaseButton variant="success" size="icon" square :loading="loading" @click="saveCompany" title="KAYDET">
                  <template #icon><Save class="w-4 h-4" /></template>
               </BaseButton>
            </BaseActionFooter>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { 
  Building2, Plus, Edit, Trash2, X, CreditCard, Save, ArrowLeft
} from 'lucide-vue-next'

// Components
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseTable from '../base/BaseTable.vue'

// Services & Composables
import { companyService } from '../../services/admin/companyService'
import { uploadService } from '../../services/admin/uploadService'
import { useAlerts } from '../../utils/alerts'
import { useCompanies } from '../../composables/useCompanies'
import { inputMasks } from '../../utils/inputMasks'

const auth = useAuthStore()
const router = useRouter()
const host = window.location.hostname
const { toast, confirm, error: showAlertError } = useAlerts()

const isSuperMaster = computed(() => {
  const user = auth.user;
  if (!user) return false;
  return user.username?.toLowerCase() === 'super_master' || 
         user.role?.toUpperCase() === 'SUPER_MASTER';
});

const companyColumns = [
  { key: 'name', label: 'ŞİRKET ADI', align: 'left', width: '35%' },
  { key: 'location', label: 'LOKASYON', align: 'left', width: '20%' },
  { key: 'contact', label: 'İLETİŞİM', align: 'left', width: '20%' },
  { key: 'branches', label: 'DURUM', align: 'center', width: '10%' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right', width: '15%' }
]

const props = defineProps({
  isSuperMaster: { type: Boolean, default: false }
})

const emit = defineEmits(['select-company'])

const {
  companies,
  loading: globalLoading,
  fetchCompanies
} = useCompanies()

const companySearchQuery = ref('')
const companyViewMode = ref('list')
const showCompanyForm = ref(false)
const editingCompany = ref(null)
const loading = ref(false)
const emailError = ref('')
const taxNumberError = ref('')
const logoFileInput = ref(null)

const companyForm = ref({ 
  name: '', email: '', phone: '', address: '', city: '', district: '', 
  taxOffice: '', taxNumber: '', authorizedPerson: '', logo: '' 
})

const filteredCompanyList = computed(() => {
  if (!companySearchQuery.value) return companies.value
  const q = companySearchQuery.value.toLowerCase()
  return companies.value.filter(c => 
    c.name?.toLowerCase().includes(q) ||
    c.city?.toLowerCase().includes(q) ||
    c.district?.toLowerCase().includes(q) ||
    c.phone?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.authorizedPerson?.toLowerCase().includes(q)
  )
})

const editCompany = (company) => {
  editingCompany.value = company
  companyForm.value = { ...company }
  showCompanyForm.value = true
}

const closeCompanyForm = () => {
  showCompanyForm.value = false
  editingCompany.value = null
  companyForm.value = { 
    name: '', email: '', phone: '', address: '', city: '', district: '', 
    taxOffice: '', taxNumber: '', authorizedPerson: '', logo: '' 
  }
  emailError.value = ''
  taxNumberError.value = ''
}

const validateEmail = () => {
  if (!companyForm.value.email) return true
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!re.test(companyForm.value.email)) {
    emailError.value = 'Geçersiz e-posta adresi'
    return false
  }
  emailError.value = ''
  return true
}



const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  loading.value = true
  try {
    const filePath = await uploadService.uploadFile(file)
    companyForm.value.logo = filePath
    toast('Logo yüklendi.')
  } catch (err) {
    showAlertError('HATA', 'Logo yüklenemedi')
  } finally {
    loading.value = false
  }
}

const handleLogoError = () => {
  companyForm.value.logo = ''
}

const getLogoUrl = (logoPath) => {
  if (!logoPath) return ''
  if (logoPath.startsWith('http')) return logoPath
  return `http://${host}:5000${logoPath}`
}

const saveCompany = async () => {
  if (!companyForm.value.name) return
  if (!validateEmail()) return
  loading.value = true
  try {
    if (editingCompany.value) {
      await companyService.update(editingCompany.value.id, companyForm.value)
      toast('Şirket güncellendi.')
    } else {
      await companyService.create(companyForm.value)
      toast('Şirket oluşturuldu.')
    }
    closeCompanyForm()
    fetchCompanies()
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Kaydedilemedi')
  } finally {
    loading.value = false
  }
}

const deleteCompany = async (id) => {
  const isConfirmed = await confirm('EMİN MİSİNİZ?', 'Şirket ve bağlı tüm veriler silinecektir!')
  if (isConfirmed) {
    loading.value = true
    try {
      await companyService.delete(id)
      toast('Şirket silindi.')
      fetchCompanies()
    } catch (err) {
      showAlertError('HATA', 'Şirket silinemedi')
    } finally {
      loading.value = false
    }
  }
}

onMounted(fetchCompanies)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>
