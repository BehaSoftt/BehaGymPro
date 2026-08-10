<template>
  <div class="h-full flex flex-col gap-2 animate-in">
    <!-- Toolbar Area -->
    <div class="flex-none pt-1 pb-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_announcements_selection" 
         @change="onGlobalSelectionChange"
       />
       <BaseSearchFilter 
         v-model:searchQuery="announcementSearchQuery" 
         v-model:viewMode="announcementViewMode"
         placeholder="DUYURU ARA..." 
         accent="indigo" 
         :showToggles="true"
       />
    </div>

    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- Grid View -->
        <div v-if="announcementViewMode === 'grid'" class="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <BaseCard v-for="a in filteredAnnouncements" :key="a.id"
            :accent="isAnnouncementActive(a) ? 'emerald' : null"
            :selected="selectedAnnouncementId === a.id"
            @click="toggleAnnouncementRow(a)"
            class="h-full flex flex-col justify-between group relative cursor-pointer">
            <template #default>
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h4 class="text-[0.8rem] font-bold text-slate-100 tracking-tight">{{ a.title }}</h4>
                  <p class="text-[0.6rem] text-indigo-400 font-medium tracking-widest mt-0.5">{{ a.Branch?.name || 'Tüm Şubeler' }}</p>
                  <p class="text-[0.55rem] text-slate-500 font-medium tracking-widest mt-0.5" v-if="a.startDate || a.endDate">
                    {{ a.startDate ? formatDate(a.startDate) : 'Başlangıç Yok' }} - {{ a.endDate ? formatDate(a.endDate) : 'Bitiş Yok' }}
                  </p>
                </div>
                <!-- Status Badge -->
                <div class="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900 border border-slate-700/50 px-2 py-1 rounded">
                  <div class="w-1.5 h-1.5 rounded-full" :class="isAnnouncementActive(a) ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></div>
                  <span class="text-[0.5rem] font-bold uppercase" :class="isAnnouncementActive(a) ? 'text-emerald-500' : 'text-rose-500'">
                    {{ isAnnouncementActive(a) ? 'Aktif' : 'Pasif' }}
                  </span>
                </div>
              </div>

              <div class="space-y-2 text-[0.65rem] text-slate-400 mt-2">
                <p class="line-clamp-3 text-slate-400/80 leading-relaxed">{{ a.content }}</p>
                <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-indigo-500/10">
                  <span class="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[0.5rem] font-bold text-slate-500 rounded uppercase tracking-widest">
                    {{ a.targetType === 'MEMBER' ? 'Üyeler' : a.targetType === 'STAFF' ? 'Personel' : 'Herkes' }}
                  </span>
                  <span v-if="a.showOnLogin" class="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[0.5rem] font-bold text-indigo-400 rounded uppercase tracking-widest">
                    Giriş Ekranı
                  </span>
                </div>
              </div>
            </template>
          </BaseCard>
        </div>

        <!-- List View (Table) -->
        <div v-else class="h-full relative px-2 pb-20" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
          <BaseTable :columns="announcementColumns" :items="filteredAnnouncements" :selectedId="selectedAnnouncementId" @rowClick="toggleAnnouncementRow" accent="indigo" emptyText="Henüz duyuru tanımlanmamış">
            <!-- Cell: status -->
            <template #cell-status="{ item }">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="isAnnouncementActive(item) ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                <span class="text-[0.65rem] font-bold uppercase tracking-widest" :class="isAnnouncementActive(item) ? 'text-emerald-500' : 'text-rose-500'">
                  {{ isAnnouncementActive(item) ? 'AKTİF' : 'PASİF' }}
                </span>
              </div>
            </template>
            <!-- Cell: title -->
            <template #cell-title="{ item }">
               <div class="flex flex-col">
                 <span class="text-[0.7rem] font-bold text-slate-200 uppercase tracking-widest">{{ item.title }}</span>
                 <span class="text-[0.6rem] text-slate-400 truncate max-w-[200px] mt-0.5">{{ item.content }}</span>
               </div>
            </template>
            <!-- Cell: branch -->
            <template #cell-branch="{ item }">
              <span class="text-[0.65rem] font-bold text-indigo-400 uppercase tracking-widest">{{ item.Branch?.name || 'TÜM ŞUBELER' }}</span>
            </template>
            <!-- Cell: target -->
            <template #cell-target="{ item }">
              <div class="flex gap-2">
                <span class="px-2 py-0.5 bg-slate-800 text-slate-400 text-[0.55rem] font-bold rounded uppercase tracking-widest">
                  {{ item.targetType === 'MEMBER' ? 'Üyeler' : item.targetType === 'STAFF' ? 'Personel' : 'Herkes' }}
                </span>
                <span v-if="item.showOnLogin" class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[0.55rem] font-bold rounded uppercase tracking-widest border border-indigo-500/20">
                  Giriş
                </span>
              </div>
            </template>
            <!-- Cell: dateRange -->
            <template #cell-dateRange="{ item }">
              <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest">
                {{ item.startDate ? formatDate(item.startDate) : '---' }} / {{ item.endDate ? formatDate(item.endDate) : '---' }}
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
          <template v-if="showAnnouncementForm">
            <BaseButton @click="showAnnouncementForm = false" variant="dark" size="icon" square title="İPTAL / KAPAT">
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>
            
            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              @click="saveAnnouncement" 
              variant="primary" 
              size="icon"
              square
              :loading="loading"
              :title="editingAnnouncementId ? 'GÜNCELLE' : 'KAYDET'"
            >
              <template #icon>
                <component :is="editingAnnouncementId ? CheckCircle : Save" class="w-5 h-5" />
              </template>
            </BaseButton>
          </template>

          <!-- If something is selected but form not open -->
          <template v-else-if="selectedAnnouncementId">
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
              title="DUYURUYU SİL"
            >
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>

            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              @click="openEditFromSelection" 
              variant="primary" 
              size="icon"
              square
              title="SEÇİLİ DUYURUYU DÜZENLE"
            >
              <template #icon><Edit class="w-5 h-5" /></template>
            </BaseButton>
          </template>

          <!-- Default Create Mode -->
          <template v-else>
            <BaseButton 
              @click="showAnnouncementForm = true; resetAnnouncementForm()" 
              variant="primary" 
              size="icon"
              square
              title="YENİ DUYURU EKLE"
            >
              <template #icon><Plus class="w-5 h-5" /></template>
            </BaseButton>
          </template>
        </div>
      </BaseActionFooter>
    </div>

    <!-- Announcement Form Modal -->
    <BaseModal
      v-model="showAnnouncementForm"
      size="full"
      hide-close
    >
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <BaseInput 
            v-model="announcementForm.title" 
            label="DUYURU BAŞLIĞI" 
            placeholder="Giriş Ekranında Görünecek Başlık..." 
            type="text" 
          />

          <div class="grid grid-cols-2 gap-2">
            <BaseInput v-model="announcementForm.startDate" label="YAYIN BAŞLANGICI" type="date" />
            <BaseInput v-model="announcementForm.endDate" label="YAYIN BİTİŞİ" type="date" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="announcementForm.targetType" label="HEDEF KİTLE" type="select">
              <option value="ALL">HERKES</option>
              <option value="MEMBER">ÜYELER</option>
              <option value="STAFF">PERSONEL</option>
            </BaseInput>
            <BaseInput v-model="announcementForm.priority" label="ÖNCELİK SIRASI" type="number" />
          </div>

          <div class="flex items-center gap-2 mt-2">
            <BaseSwitch v-model="announcementForm.showOnLogin" />
            <span class="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Giriş Ekranında Göster</span>
          </div>
        </div>

        <div class="space-y-3">
          <BaseInput v-model="announcementForm.branchId" label="YAYIN ŞUBESİ" type="select">
            <option value="">TÜM ŞUBELER</option>
            <option v-for="br in allBranches" :key="br.id" :value="br.id">{{ br.name }} ({{ br.Company?.name || br.company?.name || 'SİSTEM' }})</option>
          </BaseInput>
          <BaseInput v-model="announcementForm.content" label="DUYURU İÇERİĞİ" type="textarea" :rows="8" placeholder="Kullanıcıya iletilecek mesaj..." />
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { Edit, Trash2, BellRing, X, Save, CheckCircle, Loader2, Plus, ArrowLeft } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseModal from '../base/BaseModal.vue'
import BaseModalHeader from '../base/BaseModalHeader.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'

// Services & Composables
import { announcementService } from '../../services/admin/announcementService'
import { branchService } from '../../services/admin/branchService'
import { useAlerts } from '../../utils/alerts'

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()
const loading = ref(false)

// ─── Duyuru State ──────────────────────────────────────────
const announcements = ref([])
const showAnnouncementForm = ref(false)
const announcementForm = ref({
  title: '', content: '', startDate: '', endDate: '',
  isActive: true, priority: 0, targetType: 'ALL',
  showOnLogin: true, branchId: '', companyId: ''
})
const announcementSearchQuery = ref('')
const announcementViewMode = ref('list')
const selectedAnnouncementId = ref(null)
const editingAnnouncementId = ref(null)

const toggleAnnouncementRow = (item) => {
  if (selectedAnnouncementId.value === item.id) {
    selectedAnnouncementId.value = null
  } else {
    selectedAnnouncementId.value = item.id
  }
}

const handleGlobalDelete = () => {
  if (selectedAnnouncementId.value) {
    deleteAnnouncement(selectedAnnouncementId.value)
    selectedAnnouncementId.value = null
  }
}

const openEditFromSelection = () => {
  const item = announcements.value.find(a => a.id === selectedAnnouncementId.value)
  if (item) editAnnouncement(item)
}

// Global Selection State
const globalSelection = ref({ 
  companyId: auth.user?.companyId || '', 
  branchId: auth.user?.branchId || '', 
  remember: false 
})

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchAnnouncements()
}

const announcementColumns = [
  { key: 'status', label: 'DURUM' },
  { key: 'title', label: 'BAŞLIK' },
  { key: 'branch', label: 'ŞUBE' },
  { key: 'target', label: 'HEDEF KİTLE' },
  { key: 'dateRange', label: 'TARİH ARALIĞI' }
]

// ─── Şubeler (form için) ───────────────────────────────────
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

// ─── Duyuru CRUD ───────────────────────────────────────────
const fetchAnnouncements = async () => {
  try {
    const params = {
      companyId: globalSelection.value.companyId || undefined,
      branchId: globalSelection.value.branchId || undefined
    }
    announcements.value = await announcementService.getAll(params)
  } catch (err) {
    console.error('Duyurular yüklenemedi:', err)
  }
}

const saveAnnouncement = async () => {
  if (!announcementForm.value.title || !announcementForm.value.content) return
  loading.value = true
  try {
    const payload = { ...announcementForm.value }
    if (!payload.companyId) payload.companyId = auth.user.companyId

    if (editingAnnouncementId.value) {
      await announcementService.update(editingAnnouncementId.value, payload)
    } else {
      await announcementService.create(payload)
    }
    await fetchAnnouncements()
    showAnnouncementForm.value = false
    resetAnnouncementForm()
    showAlertSuccess('BAŞARILI', 'Duyuru kaydedildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Duyuru kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteAnnouncement = async (id) => {
  const isConfirmed = await showAlertConfirm('DUYURU SİLİNSİN Mİ?', 'Bu işlem geri alınamaz.')
  if (!isConfirmed) return
  try {
    await announcementService.delete(id)
    await fetchAnnouncements()
    showAlertSuccess('SİLİNDİ', 'Duyuru silindi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Duyuru silinemedi.')
  }
}

const editAnnouncement = (announcement) => {
  editingAnnouncementId.value = announcement.id
  announcementForm.value = {
    title: announcement.title, content: announcement.content,
    startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
    endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
    isActive: announcement.isActive, priority: announcement.priority,
    targetType: announcement.targetType, showOnLogin: announcement.showOnLogin,
    branchId: announcement.branchId || '', companyId: announcement.companyId
  }
  showAnnouncementForm.value = true
}

const resetAnnouncementForm = () => {
  editingAnnouncementId.value = null
  announcementForm.value = {
    title: '', content: '', startDate: '', endDate: '',
    isActive: true, priority: 0, targetType: 'ALL',
    showOnLogin: true, 
    branchId: globalSelection.value.branchId || '', 
    companyId: globalSelection.value.companyId || auth.user?.companyId || ''
  }
}

const filteredAnnouncements = computed(() => {
  if (!announcementSearchQuery.value) return announcements.value
  const q = announcementSearchQuery.value.toLowerCase()
  return announcements.value.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q))
})

const isAnnouncementActive = (announcement) => {
  if (!announcement.isActive) return false
  const now = new Date()
  if (announcement.startDate && new Date(announcement.startDate) > now) return false
  if (announcement.endDate && new Date(announcement.endDate) < now) return false
  return true
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

onMounted(() => {
  fetchBranches()
  // Eğer BehaAdmin değilse (selector gizliyse) direkt çekelim
  if (!auth.isBehaAdmin) {
    fetchAnnouncements()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 63, 94, 0.4); border-radius: 10px; }
</style>
