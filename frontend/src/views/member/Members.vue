<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative">
    <!-- Member Form Overlay -->
    <MemberForm 
      v-if="showForm"
      v-model="newMember"
      :editing-id="editingId"
      :loading="loading"
      :branches="branches"
      :specialties="availableSpecialties"
      @save="saveMember"
      @cancel="closeForm"
      @photo-upload="handlePhotoUpload"
    />

    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- Search & Filters -->
      <BaseSearchFilter
        v-model:searchQuery="searchQuery"
        v-model:viewMode="viewMode"
        v-model:isFilterOpen="isFilterOpen"
        placeholder="ÜYE ARA (İSİM, KOD, TELEFON)..."
        accent="emerald"
        class="!overflow-visible z-50"
      >
        <!-- Profile Type Selector Dropdown -->
        <template #extra-left>
          <div class="h-full relative flex items-center group z-50">
            <button 
              type="button"
              @click.stop="isProfileDropdownOpen = !isProfileDropdownOpen"
              class="h-full px-4 flex items-center gap-2 bg-slate-900/40 hover:bg-slate-800 transition-all text-[0.65rem] font-black text-emerald-400 uppercase cursor-pointer relative z-[40]"
            >
              <span>{{ profileTabs.find(t => t.id === activeTabId)?.label || 'FİLTRE' }}</span>
              <ChevronDown class="w-3 h-3 text-emerald-500/50 transition-transform duration-300" :class="{ 'rotate-180': isProfileDropdownOpen }" />
            </button>

            <!-- Custom Dropdown Panel -->
            <Transition name="fade-slide">
              <div v-if="isProfileDropdownOpen" 
                class="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-800 shadow-2xl z-[100] p-1.5"
                @click.stop
              >
                <button 
                  v-for="tab in profileTabs" 
                  :key="tab.label"
                  @click="filterProfileType = tab.id; activeTabId = tab.id; isProfileDropdownOpen = false"
                  :class="activeTabId === tab.id ? 'bg-slate-800 text-emerald-400 border-emerald-500/40' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-800'"
                  class="w-full flex items-center justify-between px-3 py-2.5 text-[0.65rem] font-bold tracking-widest border transition-all text-left mb-1 shadow-md bg-slate-900"
                >
                  {{ tab.label }}
                  <div v-if="activeTabId === tab.id" class="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <template #extra-actions>
          <div class="flex items-stretch px-1 gap-0.5">
            <BaseExportAction 
              :data="filteredMembers"
              :columns="[
                { key: 'fullName', label: 'AD SOYAD' },
                { key: 'phone', label: 'TELEFON' },
                { key: 'membershipType', label: 'ÜYELİK TİPİ' },
                { key: 'registrationDate', label: 'KAYIT TARİHİ' }
              ]"
              filename="UYE_LISTESI"
            />
          </div>
        </template>
      </BaseSearchFilter>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <!-- List View -->
        <!-- A. LIST VIEW -->
        <div :class="{'opacity-20 pointer-events-none scale-95': showInfoModal}" class="h-full flex flex-col p-[10px] pt-0 transition-all duration-500 origin-center">
          <BaseTable 
            :columns="memberColumns"
            :items="filteredMembers"
            :loading="loading"
            :selected-ids="selectedMembers"
            accent="emerald"
            @rowClick="(item) => toggleSelection(item.id)"
          >
            <template #cell-profile="{ item }">
              <div @click.stop="openPremiumPortal(item)" class="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all">
                <BaseMemberAvatar :src="item.photo" :name="item.fullName" size="md" />
                <div class="flex flex-col">
                  <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight group-hover:text-emerald-400">{{ item.fullName }}</span>
                  <div v-if="item.currentBelt" class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-2 h-2 rounded-full border border-slate-800" :style="getBeltStyle(item.currentBelt)"></span>
                    <span class="text-[0.55rem] font-bold text-slate-500 tracking-widest">{{ item.currentBelt }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template #cell-specialty="{ item }">
              <div class="flex items-center justify-center">
                <span v-if="item.specialty" class="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-1 border border-slate-800">
                  {{ item.specialty.name }}
                </span>
                <span v-else class="text-[0.5rem] text-slate-600 font-bold uppercase tracking-widest">GENEL</span>
              </div>
            </template>

            <template #cell-memberCode="{ item }">
              <div class="w-[100px] h-[38px] mx-auto flex items-center justify-center text-[0.65rem] font-mono text-slate-300 bg-slate-900/80 border border-slate-700">
                {{ item.memberCode || '-' }}
              </div>
            </template>



            <template #cell-profileType="{ item }">
              <div class="flex items-center justify-center">
                <BaseBadge 
                  :variant="item.profileType === 'INSTRUCTOR' ? 'warning' : (item.profileType === 'PERSONNEL' ? 'info' : 'secondary')"
                  class="text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 border border-white/5 shadow-sm"
                >
                  {{ item.profileType === 'INSTRUCTOR' ? 'EĞİTMEN' : (item.profileType === 'PERSONNEL' ? 'PERSONEL' : (item.profileType === 'USER' ? 'KULLANICI' : 'ÜYE')) }}
                </BaseBadge>
              </div>
            </template>

            <template #cell-status="{ item }">
              <div class="flex flex-col items-center gap-1">
                <BaseBadge :type="item.isActive ? 'success' : 'danger'">{{ item.isActive ? 'AKTİF' : 'PASİF' }}</BaseBadge>
                <span v-if="getExpiryLabel(item)" :class="isExpired(item) ? 'text-rose-500' : 'text-emerald-500'" class="text-[0.5rem] font-bold uppercase tracking-widest leading-none">
                  {{ getExpiryLabel(item) }}
                </span>
              </div>
            </template>
          </BaseTable>
        </div>

        <!-- Grid View -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" accent="emerald" class="p-[10px] pt-0 h-full">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <BaseCard v-for="member in filteredMembers" :key="member.id"
              :selected="selectedMembers.includes(member.id)"
              :selectable="true"
              :status="member.isActive"
              accent="rose"
              @click="toggleSelection(member.id)"
            >
              <div class="flex items-center gap-3 mb-3">
                <BaseMemberAvatar :src="member.photo" :name="member.fullName" size="md" />
                <div class="flex flex-col truncate min-w-0">
                  <span class="text-[0.7rem] font-black text-slate-100 uppercase truncate">{{ member.fullName }}</span>
                  <span 
                    :class="member.profileType === 'INSTRUCTOR' ? 'text-amber-500' : (member.profileType === 'PERSONNEL' ? 'text-cyan-500' : 'text-slate-500')" 
                    class="text-[0.5rem] font-black uppercase tracking-widest leading-none mt-0.5"
                  >
                    {{ member.profileType === 'INSTRUCTOR' ? 'EĞİTMEN' : (member.profileType === 'PERSONNEL' ? 'PERSONEL' : (member.profileType === 'USER' ? 'KULLANICI' : 'ÜYE')) }}
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-1.5 mb-3 text-[0.6rem]">
                <div class="bg-slate-900/60 p-2 border border-slate-700/30">
                  <span class="block text-slate-600 font-black mb-0.5 uppercase">KOD</span>
                  <span class="text-slate-300 font-mono">{{ member.memberCode || '-' }}</span>
                </div>
                <div class="bg-slate-900/60 p-2 border border-slate-700/30">
                   <span class="block text-slate-600 font-black mb-0.5 uppercase">TEL</span>
                   <span class="text-slate-300 truncate block">{{ member.phone || '-' }}</span>
                </div>
              </div>
              <template #footer>
                <span v-if="getExpiryLabel(member)" :class="isExpired(member) ? 'text-rose-500' : 'text-emerald-500'" class="text-[0.5rem] font-black uppercase leading-none">
                  {{ getExpiryLabel(member) }}
                </span>
                <BaseBadge :type="member.isActive ? 'success' : 'danger'" class="text-[0.5rem]">
                  {{ member.isActive ? 'AKTİF' : 'PASİF' }}
                </BaseBadge>
              </template>
            </BaseCard>
          </div>
        </BaseScroll>
      </div>

      <!-- Action Footer -->
      <BaseActionFooter>
        <div class="flex items-center justify-between w-full h-full pr-4">
          <div class="flex items-center gap-[10px]">
            <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ"><template #icon><ArrowLeft class="w-5 h-5" /></template></BaseButton>
            <div class="w-px h-6 bg-slate-800 mx-1"></div>
            <BaseButton variant="primary" size="icon" square @click="showForm = true; editingId = null" title="YENİ ÜYE EKLE"><template #icon><UserPlus class="w-5 h-5" /></template></BaseButton>
            
            <div v-if="selectedMembers.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1">
              <BaseButton variant="warning" size="icon" square @click="startEdit(members.find(m => m.id === selectedMembers[0]))" title="DÜZENLE"><template #icon><Edit class="w-5 h-5" /></template></BaseButton>
              <BaseButton variant="toggle" :active="members.find(m => m.id === selectedMembers[0])?.isActive" size="icon" square @click="toggleMemberStatus(members.find(m => m.id === selectedMembers[0]))" title="DURUMU DEĞİŞTİR"><template #icon><Power class="w-5 h-5" /></template></BaseButton>
              <BaseButton variant="danger" size="icon" square @click="deleteMember(selectedMembers[0])" title="SİL"><template #icon><Trash2 class="w-5 h-5" /></template></BaseButton>
              <BaseButton variant="ghost" size="icon" square @click="selectedMembers = []" title="SEÇİMİ TEMİZLE"><template #icon><XCircle class="w-5 h-5" /></template></BaseButton>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center gap-4">
            <div v-if="totalPages > 1" class="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              <BaseButton 
                variant="dark" 
                size="icon" 
                square 
                class="w-8 h-8"
                :disabled="currentPage === 1" 
                @click="fetchMembers(currentPage - 1)"
                title="ÖNCEKİ SAYFA"
              >
                <template #icon><ChevronLeft class="w-4 h-4" /></template>
              </BaseButton>
              
              <div class="flex items-center gap-1.5 px-2">
                <span class="text-[0.65rem] font-black text-emerald-400">{{ currentPage }}</span>
                <span class="text-[0.6rem] font-bold text-slate-600">/</span>
                <span class="text-[0.65rem] font-black text-slate-400">{{ totalPages }}</span>
              </div>

              <BaseButton 
                variant="dark" 
                size="icon" 
                square 
                class="w-8 h-8"
                :disabled="currentPage === totalPages" 
                @click="fetchMembers(currentPage + 1)"
                title="SONRAKİ SAYFA"
              >
                <template #icon><ChevronRight class="w-4 h-4" /></template>
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseActionFooter>

      <!-- Modals -->
      <MemberPremiumPortal v-model="showInfoModal" :member="activeMemberForInfo" @edit="startEdit" @qr="generateQR" />
      <MemberServiceDetails v-model="showDetailsModal" :member="detailsModalMember" :type="detailsModalType" />
      <TrainingPlanPanel 
        :isOpen="showPlanModal" 
        :member="activeMemberForPlan" 
        :memberPlan="memberPlan" 
        :templates="templates"
        @close="showPlanModal = false"
        @assign="assignPlan"
        @remove="removePlan"
      />
      
      <BaseModal v-if="showMemberQR" @close="showMemberQR = false" title="ÜYE GİRİŞ ANAHTARI">
        <div class="flex flex-col items-center gap-6" v-if="activeMemberQR">
          <BaseQRCode :value="activeMemberQR.memberCode" :title="activeMemberQR.fullName" :size="250" />
          <p class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest text-center px-4 italic leading-relaxed">
            BU KOD TURNİKE OKUYUCUSUNA YAKLAŞTIRILDIĞINDA GİRİŞ OTOMATİK OLARAK ONAYLANIR.
          </p>
        </div>
      </BaseModal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, toRaw, inject, defineAsyncComponent } from 'vue'
import { 
  UserPlus, X, Edit, Trash2, Activity,
  Search, ArrowRight, ArrowLeft, RotateCcw, XCircle, ChevronLeft, ChevronRight, Power,
  ChevronDown
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useDataStore } from '../../store/data'
import { storeToRefs } from 'pinia'
import { useMembers } from '../../composables/useMembers'
import { memberUtils } from '../../utils/memberUtils'
import { memberStatus } from '../../utils/memberStatus'
import { memberService } from '../../services/member/memberService'
import { trainingService } from '../../services/training/trainingService'
import { useAlerts } from '../../utils/alerts'
import api from '../../utils/api'

const { apiClient } = api

// Base Components
import BaseTable from '../../components/base/BaseTable.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseQRCode from '../../components/base/BaseQRCode.vue'
import BaseExportAction from '../../components/base/BaseExportAction.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'

// Async Components
const MemberForm = defineAsyncComponent(() => import('../../components/members/MemberForm.vue'))
const MemberPremiumPortal = defineAsyncComponent(() => import('../../components/members/details/MemberPremiumPortal.vue'))
const MemberServiceDetails = defineAsyncComponent(() => import('../../components/members/details/MemberServiceDetails.vue'))
const TrainingPlanPanel = defineAsyncComponent(() => import('../../components/member/TrainingPlanPanel.vue'))

const auth = useAuthStore()
const router = useRouter()
const dataStore = useDataStore()
const { branches, specialties: availableSpecialties } = storeToRefs(dataStore)
const { toast, error: showAlertError } = useAlerts()

const {
  members,
  totalMembers,
  totalPages,
  currentPage,
  loading,
  searchQuery,
  filterProfileType,
  filterGender,
  filterType,
  selectedMembers,
  fetchMembers,
  filteredMembers,
  toggleSelection,
  deleteMember
} = useMembers()

const pageSubtitle = inject('pageSubtitle', ref(''))
const showForm = ref(false)
const editingId = ref(null)
const activeTabId = ref('MEMBER')
const isProfileDropdownOpen = ref(false)
const profileTabs = [
  { id: 'ALL', label: 'HEPSİ' },
  { id: 'MEMBER', label: 'SADECE ÜYELER' },
  { id: 'INSTRUCTOR', label: 'EĞİTMENLER' },
  { id: 'PERSONNEL', label: 'PERSONEL' },
  { id: 'USER', label: 'KULLANICI' }
]
const viewMode = ref('list')
const isFilterOpen = ref(false)
const showInfoModal = ref(false)
const activeMemberForInfo = ref(null)
const showDetailsModal = ref(false)
const detailsModalMember = ref(null)
const detailsModalType = ref(null)
const showMemberQR = ref(false)
const activeMemberQR = ref(null)
const memberQRImage = ref('')

// Plan management
const showPlanModal = ref(false)
const activeMemberForPlan = ref(null)
const memberPlan = ref(null)
const templates = ref([])

const openPlanModal = async (member) => {
  activeMemberForPlan.value = member
  showPlanModal.value = true
  try {
    const plans = await trainingService.getPlansByMember(member.id)
    memberPlan.value = plans[0] || null
    templates.value = await trainingService.getTemplates()
  } catch (err) {
    console.error(err)
  }
}

const assignPlan = async (templateId) => {
  try {
    const tpl = templates.value.find(t => t.id === templateId)
    const payload = { 
      title: tpl.title, 
      description: tpl.description, 
      memberId: activeMemberForPlan.value.id, 
      items: tpl.items 
    }
    await trainingService.createPlan(payload)
    toast('Plan başarıyla atandı.')
    await openPlanModal(activeMemberForPlan.value)
  } catch (err) {
    showAlertError('HATA', 'Plan atanamadı.')
  }
}

const removePlan = async () => {
  if (!memberPlan.value) return
  try {
    await trainingService.deletePlan(memberPlan.value.id)
    toast('Plan iptal edildi.')
    memberPlan.value = null
  } catch (err) {
    showAlertError('HATA', 'Plan iptal edilemedi.')
  }
}

const memberColumns = [
  { key: 'profile', label: 'ÜYE PROFİL' },
  { key: 'memberCode', label: 'ÜYE KODU', align: 'center' },
  { key: 'specialty', label: 'BRANŞ', align: 'center' },
  { key: 'targetWeight', label: 'HEDEF KG', align: 'center' },
  { key: 'profileType', label: 'PROFİL TÜRÜ', align: 'center' },
  { key: 'status', label: 'DURUM', align: 'center' },
]

const newMember = ref({
  fullName: '', memberCode: '', gender: '', bloodGroup: '',
  membershipType: 'STANDART', photo: null, phone: '', email: '',
  emergencyPhone: '', height: null, weight: null,
  registrationDate: new Date().toISOString().split('T')[0],
  isActive: true, profileType: 'MEMBER', specialtyId: '',
  lessonTypes: [],
  specialties: []
})

onMounted(() => fetchMembers())

watch(showForm, (val) => {
  pageSubtitle.value = val ? (editingId.value ? 'DÜZENLE' : 'YENİ KAYIT') : ''
})

const closeForm = () => {
  showForm.value = false
  editingId.value = null
}

const startEdit = (member) => {
  editingId.value = member.id
  showForm.value = true
  const { 
    Branch, specialty, beltBranch, 
    activePackages, privateLessonPackages,
    ...pureData 
  } = toRaw(member)
  
  newMember.value = { 
    ...pureData,
    branchId: pureData.branchId || Branch?.id || '',
    specialtyId: pureData.specialtyId || pureData.specialty?.id || specialty?.id || '',
    beltBranchId: pureData.beltBranchId || beltBranch?.id || '',
    lessonTypes: pureData.lessonTypes || [],
    specialties: pureData.specialties || []
  }
}

// Global Click listener to close dropdown
onMounted(() => {
  window.addEventListener('click', () => {
    isProfileDropdownOpen.value = false
  })
})

const handlePhotoUpload = async (file) => {
  if (!file) {
    newMember.value.photo = null
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    newMember.value.photo = response.data.filePath
    toast('Fotoğraf başarıyla yüklendi.')
  } catch (err) {
    console.error('Fotoğraf yükleme hatası:', err)
    showAlertError('HATA', 'Fotoğraf yüklenirken bir hata oluştu.')
  }
}

const saveMember = async () => {
  try {
    loading.value = true
    const data = toRaw(newMember.value)
    if (editingId.value) {
      await memberService.update(editingId.value, data)
      toast('Üye başarıyla güncellendi.')
    } else {
      await memberService.create(data)
      toast('Yeni üye başarıyla kaydedildi.')
    }
    await fetchMembers()
    closeForm()
  } catch (err) {
    showAlertError('HATA', err.message || 'Kayıt işlemi başarısız.')
  } finally {
    loading.value = false
  }
}

const toggleMemberStatus = async (member) => {
  try {
    const updatedStatus = !member.isActive
    await memberService.update(member.id, { isActive: updatedStatus })
    member.isActive = updatedStatus
    toast(`Üye durumu ${updatedStatus ? 'AKTİF' : 'PASİF'} olarak güncellendi.`)
  } catch (err) {
    showAlertError('HATA', 'Durum güncellenirken bir hata oluştu.')
  }
}

const openPremiumPortal = (member) => {
  activeMemberForInfo.value = member
  showInfoModal.value = true
}

const showTypeDetails = (member, typeObj) => {
  detailsModalMember.value = member
  detailsModalType.value = typeObj
  showDetailsModal.value = true
}

const generateQR = (member) => {
  if (!member.memberCode) {
    showAlertError('KOD EKSİK', 'Lütfen önce bir kod tanımlayın.')
    return
  }
  activeMemberQR.value = member
  memberQRImage.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${member.memberCode}`
  showMemberQR.value = true
}

// Utils integration
const { getSpecialtyStyle, getBeltStyle, getMemberPosition, getMemberTeam } = memberUtils
const { getMergedLessonTypes, isExpired, getExpiryLabel } = memberStatus

const lessonsForMember = (m) => getMergedLessonTypes(m, availableSpecialties.value)
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
