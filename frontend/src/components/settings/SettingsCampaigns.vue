<template>
  <div class="h-full flex flex-col gap-2 animate-in">
    <!-- Toolbar Area -->
    <div class="flex-none pt-1 pb-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_campaigns_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>
   <BaseSearchFilter 
         v-model:searchQuery="campaignSearchQuery" 
         v-model:viewMode="campaignViewMode"
         placeholder="KAMPANYA ARA..." 
         accent="emerald" 
         :showToggles="true"
       />

    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- Grid View -->
        <div v-if="campaignViewMode === 'grid'" class="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <BaseCard v-for="c in filteredCampaigns" :key="c.id" 
            :accent="isCampaignActive(c) ? 'emerald' : null" 
            :selected="selectedCampaignId === c.id"
            @click="toggleCampaignRow(c)"
            class="h-full flex flex-col justify-between group cursor-pointer">
            <template #default>
              <div class="flex items-start justify-between mb-4 relative z-10">
                <div class="flex-1">
                  <h4 class="text-[0.8rem] font-bold text-slate-100 tracking-tight">{{ c.name }}</h4>
                  <p class="text-[0.6rem] text-indigo-400 font-medium tracking-widest mt-0.5">{{ c.Branch?.name || 'Tüm Şubeler' }}</p>
                  <p class="text-[0.55rem] text-slate-500 font-medium tracking-widest mt-0.5">{{ formatDate(c.startDate) }} - {{ formatDate(c.endDate) }}</p>
                </div>
                <!-- Status Badge -->
                <div v-if="isCampaignActive(c)" class="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded z-20">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span class="text-[0.5rem] font-bold text-emerald-500 uppercase tracking-widest">AKTİF</span>
                </div>
              </div>

              <div class="space-y-2 text-[0.65rem] text-slate-400 mt-2">
                <p class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold uppercase tracking-widest">İndirim:</span>
                  <span class="text-slate-200">{{ c.discountType === 'PERCENTAGE' ? '%' + c.discountValue : c.discountValue + ' ₺' }}</span>
                </p>
                <p class="flex items-center gap-2">
                  <span class="text-indigo-400 font-bold uppercase tracking-widest">Hediye Süre:</span>
                  <span class="text-slate-200">
                    {{ c.durationBonusMonths > 0 ? c.durationBonusMonths + ' Ay ' : '' }}{{ c.durationBonusDays > 0 ? c.durationBonusDays + ' Gün' : '' }}
                    <span v-if="c.durationBonusMonths == 0 && c.durationBonusDays == 0">Yok</span>
                  </span>
                </p>
                <div class="mt-4 pt-4 border-t border-slate-700/50">
                  <p class="text-[0.6rem] italic opacity-50">{{ c.description || 'Açıklama yok' }}</p>
                </div>
              </div>
            </template>
          </BaseCard>
        </div>

        <!-- List View (Table) -->
        <div v-else class="h-full relative px-2 pb-20" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
          <BaseTable :columns="campaignColumns" :items="filteredCampaigns" :selectedId="selectedCampaignId" @rowClick="toggleCampaignRow" accent="emerald" emptyText="Henüz kampanya tanımlanmamış">
            <!-- Cell: name -->
            <template #cell-name="{ item }">
              <span class="text-[0.7rem] font-bold text-slate-200 uppercase tracking-widest">{{ item.name }}</span>
              <div v-if="isCampaignActive(item)" class="mt-1 flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[0.5rem] font-bold text-emerald-500 uppercase tracking-widest">AKTİF</span>
              </div>
            </template>
            <!-- Cell: branch -->
            <template #cell-branch="{ item }">
              <span class="text-[0.65rem] font-bold text-indigo-400 uppercase tracking-widest">{{ item.Branch?.name || 'TÜM ŞUBELER' }}</span>
            </template>
            <!-- Cell: discount -->
            <template #cell-discount="{ item }">
              <span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[0.65rem] font-bold border border-emerald-500/20 uppercase tracking-widest">
                {{ item.discountType === 'PERCENTAGE' ? '%' + item.discountValue : item.discountValue + ' ₺' }}
              </span>
            </template>
            <!-- Cell: durationBonus -->
            <template #cell-durationBonus="{ item }">
              <span class="font-bold text-[0.65rem] text-slate-400 uppercase tracking-widest">
                {{ item.durationBonusMonths > 0 ? item.durationBonusMonths + ' Ay ' : '' }}{{ item.durationBonusDays > 0 ? item.durationBonusDays + ' Gün' : '' }}
                <span v-if="item.durationBonusMonths == 0 && item.durationBonusDays == 0">---</span>
              </span>
            </template>
            <!-- Cell: dateRange -->
            <template #cell-dateRange="{ item }">
              <span class="text-[0.6rem] text-slate-500 font-medium tracking-widest">
                {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
              </span>
            </template>
          </BaseTable>
        </div>


      </div>

      <!-- SHARED ACTION FOOTER -->
      <BaseActionFooter>
        <div class="flex items-center gap-2">
           <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
              <template #icon><ArrowLeft class="w-5 h-5" /></template>
           </BaseButton>

           <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

          <!-- If form is open -->
          <template v-if="showCampaignForm">
            <BaseButton @click="showCampaignForm = false" variant="dark" size="icon" square title="İPTAL / KAPAT">
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>
            
            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              @click="saveCampaign" 
              variant="primary" 
              size="icon"
              square
              :loading="loading"
              :title="editingCampaignId ? 'GÜNCELLE' : 'KAYDET'"
            >
              <template #icon>
                <component :is="editingCampaignId ? CheckCircle : Save" class="w-5 h-5" />
              </template>
            </BaseButton>
          </template>

          <!-- If something is selected but form not open -->
          <template v-else-if="selectedCampaignId">
            <BaseButton 
              @click="selectedAnnouncementId = null" 
              variant="dark" 
              size="icon"
              square
              title="SEÇİMİ KALDIR"
            >
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>

            <BaseButton 
              @click="handleGlobalDelete" 
              variant="danger" 
              size="icon"
              square
              title="KAMPANYAYI SİL"
            >
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>

            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              @click="openEditFromSelection" 
              variant="primary" 
              size="icon"
              square
              title="SEÇİLİ KAMPANYAYI DÜZENLE"
            >
              <template #icon><Edit class="w-5 h-5" /></template>
            </BaseButton>
          </template>

          <!-- Default Create Mode -->
          <template v-else>
            <BaseButton 
              @click="showCampaignForm = true; resetCampaignForm()" 
              variant="primary" 
              size="icon"
              square
              title="YENİ KAMPANYA EKLE"
            >
              <template #icon><Plus class="w-5 h-5" /></template>
            </BaseButton>
          </template>
        </div>
      </BaseActionFooter>
    </div>

    <!-- Campaign Form Modal -->
    <BaseModal
      v-model="showCampaignForm"
      size="full"
      hide-close
    >
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <BaseInput 
            v-model="campaignForm.name" 
            label="KAMPANYA ADI" 
            placeholder="Örn: Ramazan Özel, Yaz Fırsatı..." 
            type="text" 
          />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="campaignForm.startDate" label="BAŞLANGIÇ TARİHİ" type="date" />
            <BaseInput v-model="campaignForm.endDate" label="BİTİŞ TARİHİ" type="date" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="campaignForm.discountType" label="İNDİRİM TİPİ" type="select">
              <option value="AMOUNT">NET TUTAR (₺)</option>
              <option value="PERCENTAGE">YÜZDE (%)</option>
            </BaseInput>
            <BaseInput v-model="campaignForm.discountValue" label="İNDİRİM DEĞERİ" type="number" />
          </div>
        </div>

        <div class="space-y-3">
          <BaseInput v-model="campaignForm.branchId" label="UYGULANACAK ŞUBE" type="select">
            <option value="">TÜM ŞUBELER</option>
            <option v-for="br in allBranches" :key="br.id" :value="br.id">{{ br.name }} ({{ br.Company?.name || br.company?.name || 'SİSTEM' }})</option>
          </BaseInput>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="campaignForm.durationBonusMonths" label="HEDİYE (AY)" type="number" />
            <BaseInput v-model="campaignForm.durationBonusDays" label="HEDİYE (GÜN)" type="number" />
          </div>
          <BaseInput v-model="campaignForm.description" label="AÇIKLAMA" type="textarea" :rows="3" placeholder="Kampanya detayları..." />
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { Edit, Trash2, Megaphone, X, Save, CheckCircle, Loader2, Plus, ArrowLeft } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseModal from '../base/BaseModal.vue'
import BaseModalHeader from '../base/BaseModalHeader.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'

// Services & Composables
import { campaignService } from '../../services/admin/campaignService'
import { branchService } from '../../services/admin/branchService'
import { useAlerts } from '../../utils/alerts'

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()
const loading = ref(false)

// ─── Kampanya State ────────────────────────────────────────
const campaigns = ref([])
const showCampaignForm = ref(false)
const campaignForm = ref({
  name: '', description: '', startDate: '', endDate: '',
  discountType: 'AMOUNT', discountValue: 0,
  durationBonusDays: 0, durationBonusMonths: 0,
  branchId: '', companyId: ''
})
const campaignSearchQuery = ref('')
const campaignViewMode = ref('list')
const selectedCampaignId = ref(null)
const editingCampaignId = ref(null)

const toggleCampaignRow = (item) => {
  if (selectedCampaignId.value === item.id) {
    selectedCampaignId.value = null
  } else {
    selectedCampaignId.value = item.id
  }
}

const handleGlobalDelete = () => {
  if (selectedCampaignId.value) {
    deleteCampaign(selectedCampaignId.value)
    selectedCampaignId.value = null
  }
}

const openEditFromSelection = () => {
  const item = campaigns.value.find(c => c.id === selectedCampaignId.value)
  if (item) editCampaign(item)
}

// Global Selection State
const globalSelection = ref({ 
  companyId: auth.user?.companyId || '', 
  branchId: auth.user?.branchId || '', 
  remember: false 
})

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchCampaigns()
}

const campaignColumns = [
  { key: 'name', label: 'KAMPANYA ADI' },
  { key: 'branch', label: 'ŞUBE' },
  { key: 'discount', label: 'İNDİRİM' },
  { key: 'durationBonus', label: 'HEDİYE SÜRE' },
  { key: 'dateRange', label: 'TARİH ARALIĞI' }
]

// ─── Şubeler (kampanya form için) ─────────────────────────
const allBranches = ref([])

const fetchBranches = async () => {
  try {
    const data = await branchService.getAll()
    allBranches.value = data.map(br => ({
      ...br,
      company: br.Company || br.company || { name: 'SİSTEM' }
    }))
  } catch (err) {
    console.error('Şubeler yüklenemedi', err)
  }
}

// ─── Kampanya CRUD ─────────────────────────────────────────
const fetchCampaigns = async () => {
  try {
    const params = {
      companyId: globalSelection.value.companyId || undefined,
      branchId: globalSelection.value.branchId || undefined
    }
    campaigns.value = await campaignService.getAll(params)
  } catch (err) {
    console.error('Kampanyalar yüklenemedi:', err)
  }
}

const saveCampaign = async () => {
  if (!campaignForm.value.name || !campaignForm.value.startDate || !campaignForm.value.endDate) return
  loading.value = true
  try {
    const payload = { ...campaignForm.value }
    if (!payload.companyId) payload.companyId = auth.user.companyId

    if (editingCampaignId.value) {
      await campaignService.update(editingCampaignId.value, payload)
    } else {
      await campaignService.create(payload)
    }
    await fetchCampaigns()
    showCampaignForm.value = false
    resetCampaignForm()
    showAlertSuccess('BAŞARILI', 'Kampanya kaydedildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Kampanya kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteCampaign = async (id) => {
  const isConfirmed = await showAlertConfirm('KAMPANYA SİLİNSİN Mİ?', 'Bu işlem geri alınamaz.')
  if (!isConfirmed) return
  try {
    await campaignService.delete(id)
    await fetchCampaigns()
    showAlertSuccess('SİLİNDİ', 'Kampanya silindi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Kampanya silinemedi.')
  }
}

const editCampaign = (campaign) => {
  editingCampaignId.value = campaign.id
  campaignForm.value = {
    name: campaign.name, description: campaign.description,
    startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
    endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
    discountType: campaign.discountType, discountValue: campaign.discountValue,
    durationBonusDays: campaign.durationBonusDays, durationBonusMonths: campaign.durationBonusMonths,
    branchId: campaign.branchId || '', companyId: campaign.companyId
  }
  showCampaignForm.value = true
}

const resetCampaignForm = () => {
  editingCampaignId.value = null
  campaignForm.value = {
    name: '', description: '', startDate: '', endDate: '',
    discountType: 'AMOUNT', discountValue: 0,
    durationBonusDays: 0, durationBonusMonths: 0,
    branchId: globalSelection.value.branchId || '', 
    companyId: globalSelection.value.companyId || auth.user?.companyId || ''
  }
}

const filteredCampaigns = computed(() => {
  if (!campaignSearchQuery.value) return campaigns.value
  const q = campaignSearchQuery.value.toLowerCase()
  return campaigns.value.filter(c => c.name.toLowerCase().includes(q))
})

const isCampaignActive = (campaign) => {
  if (!campaign.isActive) return false
  const now = new Date()
  return now >= new Date(campaign.startDate) && now <= new Date(campaign.endDate)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

onMounted(() => {
  fetchBranches()
  // Eğer BehaAdmin değilse (selector gizliyse) direkt çekelim
  if (!auth.isBehaAdmin) {
    fetchCampaigns()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 63, 94, 0.4); border-radius: 10px; }
</style>
