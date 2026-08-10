<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    <div v-if="!showCreateModal && !activeExam" class="flex-1 flex flex-col overflow-hidden">
      <!-- Standardized Search & Filter -->
      <BaseSearchFilter
        v-model:searchQuery="searchQuery"
        v-model:viewMode="viewMode"
        placeholder="SINAV, BRANŞ VEYA YER ARA..."
        accent="rose"
        class="!overflow-visible z-50 max-w-[calc(100%-30px)] mx-auto rounded-xl"
      >
        <!-- Status Filter Dropdown in extra-left slot -->
        <template #extra-left>
          <div class="h-full relative flex items-center group z-50">
            <button 
              type="button"
              @click.stop="isStatusDropdownOpen = !isStatusDropdownOpen"
              class="h-full px-4 flex items-center gap-2 bg-slate-900/40 hover:bg-slate-800 transition-all text-[0.65rem] font-black text-rose-400 uppercase cursor-pointer relative z-[40]"
            >
              <span>{{ statusTabs.find(t => t.k === selectedStatus)?.l || 'FİLTRE' }}</span>
              <ChevronDown class="w-3 h-3 text-rose-500/50 transition-transform duration-300" :class="{ 'rotate-180': isStatusDropdownOpen }" />
            </button>

            <!-- Custom Dropdown Panel (Neon Snow White Style) -->
            <Transition name="fade-slide">
              <div v-if="isStatusDropdownOpen" 
                class="absolute top-full left-0 mt-1 w-64 bg-slate-950/95 backdrop-blur-2xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.08)] z-[100] p-1.5"
                @click.stop
              >
                <button 
                  v-for="status in statusTabs" 
                  :key="status.k"
                  @click="selectedStatus = status.k; isStatusDropdownOpen = false"
                  :class="selectedStatus === status.k ? 'bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-100 hover:bg-white/5 border-transparent'"
                  class="w-full flex items-center justify-between px-3 py-2.5 text-[0.65rem] font-black tracking-widest border transition-all text-left mb-1 bg-slate-900/40"
                >
                  {{ status.l }}
                  <div v-if="selectedStatus === status.k" class="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </BaseSearchFilter>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden px-4">
      <div v-if="viewMode === 'list'" class="flex-1 overflow-hidden pb-20">
        <BaseScroll accent="rose" direction="vertical" class="h-full pr-2">
          <BaseTable
            :columns="[
              { key: 'examName', label: 'SINAV BİLGİSİ' },
              { key: 'branch', label: 'BRANŞ' },
              { key: 'date', label: 'TARİH & SAAT', align: 'center' },
              { key: 'participants', label: 'KATILIMCI', align: 'center' },
              { key: 'status', label: 'DURUM', align: 'center' }
            ]"
            :items="filteredExams"
            :loading="loading"
            :selectedId="selectedExamId"
            :accent="selectedStatus === 'COMPLETED' ? 'emerald' : 'rose'"
            @rowClick="(exam) => selectedExamId = (selectedExamId === exam.id ? null : exam.id)"
          >
            <template #cell-examName="{ item }">
              <div class="flex flex-col" :class="{ 'opacity-60': item.status === 'COMPLETED' }">
                <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight">{{ item.examName || 'İSİMSİZ SINAV' }}</span>
                <span class="text-[0.5rem] text-slate-600 font-bold uppercase tracking-widest">{{ item.locationName }}</span>
              </div>
            </template>

            <template #cell-branch="{ item }">
              <BaseBadge :type="item.status === 'COMPLETED' ? 'dark' : 'rose'" size="sm" :class="{ 'opacity-60': item.status === 'COMPLETED' }">
                {{ item.specialty?.name }}
              </BaseBadge>
            </template>

            <template #cell-date="{ item }">
              <span class="text-[0.65rem] font-bold uppercase tracking-widest font-mono" :class="item.status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-300'">{{ formatDate(item.examDate) }} • {{ item.examTime?.substring(0,5) }}</span>
            </template>

            <template #cell-participants="{ item }">
              <div class="flex flex-col items-center" :class="{ 'opacity-60': item.status === 'COMPLETED' }">
                <span class="text-[0.7rem] font-black" :class="item.status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-200'">{{ item.participants?.length || 0 }}</span>
                <span class="text-[0.5rem] text-slate-600 font-black tracking-tighter uppercase">ÖĞRENCİ</span>
              </div>
            </template>

            <template #cell-status="{ item }">
              <BaseBadge v-if="item.status === 'COMPLETED'" type="success">
                <template #icon><CheckCircle class="w-3 h-3" /></template>
                TAMAMLANDI
              </BaseBadge>
              <BaseBadge v-else :type="item.status === 'CANCELLED' ? 'danger' : 'success'">
                {{ item.status === 'CANCELLED' ? 'PASİF' : 'AKTİF' }}
              </BaseBadge>
            </template>
          </BaseTable>
        </BaseScroll>
      </div>

      <div v-else class="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-30 select-none">
          <Loader2 class="w-12 h-12 animate-spin mb-4 text-rose-500" />
          <p class="text-xs font-black uppercase tracking-[0.2em]">Veriler Hazırlanıyor...</p>
        </div>

        <div v-else-if="filteredExams.length === 0" class="py-20 text-center border-2 border-dashed border-slate-800 flex flex-col items-center gap-6 group">
          <Award class="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform" />
          <div class="space-y-2">
            <p class="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Henüz Kayıtlı Sınav Bulunamadı</p>
            <p class="text-[0.6rem] text-slate-700 uppercase tracking-widest">Sınav planlayarak öğrenci terfileri yönetmeye başlayın.</p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BaseCard 
              v-for="exam in filteredExams" 
              :key="exam.id" 
              :selected="selectedExamId === exam.id"
              :status="exam.status !== 'CANCELLED'"
              :active-label="exam.status === 'COMPLETED' ? 'TAMAMLANDI' : 'PLANLANDI'"
              inactive-label="PASİF"
              :accent="exam.status === 'COMPLETED' ? 'emerald' : 'rose'"
              :class="{ 'opacity-80': exam.status === 'COMPLETED' }"
              @click="selectedExamId = (selectedExamId === exam.id ? null : exam.id)"
            >
              <div class="space-y-4">
                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <BaseBadge :type="exam.status === 'COMPLETED' ? 'dark' : 'rose'" size="sm" class="mb-1">{{ exam.specialty?.name }}</BaseBadge>
                    <h3 class="text-lg font-black uppercase tracking-tight" :class="exam.status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-100'">{{ exam.examName || 'İSİMSİZ SINAV' }}</h3>
                  </div>
                </div>

                <div class="space-y-2 py-4 border-y border-slate-800/50">
                  <div class="flex items-center gap-3 text-slate-400" :class="{ 'text-slate-500': exam.status === 'COMPLETED' }">
                    <Calendar class="w-3.5 h-3.5" />
                    <span class="text-[0.7rem] font-bold uppercase tracking-widest">{{ formatDate(exam.examDate) }} • {{ exam.examTime?.substring(0,5) }}</span>
                  </div>
                  <div class="flex items-start gap-3" :class="exam.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-400'">
                    <component :is="exam.status === 'COMPLETED' ? CheckCircle : MapPin" class="w-3.5 h-3.5" :class="{ 'mt-0.5': exam.status !== 'COMPLETED' }" />
                    <div class="flex flex-col">
                      <span v-if="exam.status === 'COMPLETED'" class="text-[0.55rem] font-black uppercase tracking-widest">SINAV BAŞARIYLA ARŞİVLENDİ</span>
                      <template v-else>
                        <span class="text-[0.7rem] font-bold uppercase tracking-widest">{{ exam.locationName }}</span>
                        <span class="text-[0.55rem] text-slate-600 truncate max-w-[200px]">{{ exam.locationAddress }}</span>
                      </template>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-slate-400" :class="{ 'opacity-60': exam.status === 'COMPLETED' }">
                    <Users class="w-3.5 h-3.5 text-blue-400" />
                    <span class="text-[0.7rem] font-bold uppercase tracking-widest">{{ exam.instructor?.fullName || 'EĞİTMEN ATANMAMIŞ' }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-slate-400" :class="{ 'opacity-60': exam.status === 'COMPLETED' }">
                    <Users class="w-3.5 h-3.5" />
                    <span class="text-[0.7rem] font-bold uppercase tracking-widest">KATILIMCI: {{ exam.participants?.length || 0 }}</span>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>
      </div>

    <!-- Modals & Overlays extracted to components -->
    <BeltExamForm 
      v-if="showCreateModal"
      v-model="newExam"
      :specialties="specialties"
      :instructors="instructors"
      :loading="loading"
      @save="createExam"
      @cancel="closeForm"
    />

    <BeltExamParticipants 
      v-if="activeExam"
      :exam="activeExam"
      :selected-participant-id="selectedParticipantId"
      v-model:participant-search-query="participantSearchQuery"
      v-model:participant-view-mode="participantViewMode"
      :can-complete="canCompleteExam(activeExam)"
      @close="activeExam = null"
      @select-participant="(id) => selectedParticipantId = (selectedParticipantId === id ? null : id)"
      @open-attendance="openAttendanceModal"
      @edit-participant="editParticipant"
      @set-result="setParticipantResult"
      @send-whatsapp="sendWhatsAppNotification"
      @delete-participant="confirmDeleteParticipant"
      @add-candidate="openCandidatePicker"
      @complete-exam="handleCompleteExam(activeExam.id)"
    />

    <BeltExamCandidatePicker 
      v-if="showCandidatePicker"
      :exam="activeExam"
      :candidates="candidates"
      :loading="candidatesLoading"
      v-model:search-query="candidateSearchQuery"
      v-model:view-mode="candidateViewMode"
      v-model:min-months="candidateFilters.minMonths"
      :selected-candidate-ids="selectedCandidateIds"
      :candidate-selections="candidateSelections"
      :available-belts="availableBelts"
      @toggle-candidate="toggleCandidateSelection"
      @close="showCandidatePicker = false"
      @add="addSelectedCandidates"
    />

    <BeltExamAttendance 
      v-if="showAttendanceModal"
      :participants="participantsForAttendance"
      :selected-attendance-ids="selectedAttendanceIds"
      v-model:search-query="attendanceSearchQuery"
      v-model:view-mode="attendanceViewMode"
      v-model:filter-tab="attendanceFilterTab"
      @toggle-selection="toggleAttendanceSelection"
      @undo-selected="undoSelectedAttendance"
      @submit="submitAttendance"
      @close="showAttendanceModal = false"
    />

    <!-- Participant Edit Modal -->
    <BaseModal 
      :is-open="showParticipantEditModal" 
      title="ÜYE SINAV BİLGİSİNİ DÜZENLE" 
      @close="showParticipantEditModal = false"
    >
      <div class="space-y-6 text-left">
        <div>
          <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">HEDEF KUŞAK</label>
          <select v-model="editingParticipantForm.toBelt" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm appearance-none cursor-pointer">
            <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">NOT / SONUÇ AÇIKLAMASI</label>
          <textarea v-model="editingParticipantForm.note" rows="4" placeholder="Sınav hakkında notlar..." class="w-full bg-slate-950 border border-slate-800 p-4 text-slate-100 text-[0.65rem] font-medium outline-none focus:border-amber-500 transition-all resize-none rounded-sm"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3 p-2">
          <BaseButton variant="dark" @click="showParticipantEditModal = false">İPTAL</BaseButton>
          <BaseButton variant="warning" @click="saveParticipantEdit">GÜNCELLE</BaseButton>
        </div>
      </template>
    </BaseModal>
    <BaseActionFooter v-if="!activeExam && !showCreateModal">
      <template v-if="selectedExamId">
        <BaseButton variant="dark" size="icon" square @click="selectedExamId = null" title="SEÇİMİ KALDIR">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-6 bg-slate-800 mx-1"></div>
        <BaseButton variant="warning" size="icon" square @click="editExam(exams.find(e => e.id === selectedExamId))" title="SINAVI DÜZENLE">
          <template #icon><Edit3 class="w-5 h-5" /></template>
        </BaseButton>
        <BaseButton variant="default" size="icon" square class="text-rose-600" @click="openParticipantModal(exams.find(e => e.id === selectedExamId))" title="Sınavı Yönet / Aday Ekle">
          <template #icon><Users class="w-5 h-5" /></template>
        </BaseButton>
        <BaseButton v-if="canCompleteExam(exams.find(e => e.id === selectedExamId))" 
                    variant="success" size="icon" square 
                    @click="handleCompleteExam(selectedExamId)" 
                    title="Sınavı Bitir / Onayla">
          <template #icon><CheckCircle class="w-5 h-5" /></template>
        </BaseButton>
        <BaseButton variant="danger" size="icon" square @click="confirmDeleteExam(selectedExamId)" title="Sınavı Sil">
          <template #icon><Trash2 class="w-5 h-5" /></template>
        </BaseButton>
      </template>

      <template v-else>
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="KAPAT">
          <template #icon><ArrowLeft class="w-5 h-5" /></template>
        </BaseButton>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === 1" 
            @click="fetchExams({ page: currentPage - 1, search: searchQuery, status: selectedStatus })"
            title="ÖNCEKİ SAYFA"
          >
            <template #icon><ChevronLeft class="w-4 h-4" /></template>
          </BaseButton>
          
          <div class="px-3 min-w-[80px] flex flex-col items-center">
            <span class="text-[0.45rem] text-slate-500 font-black uppercase tracking-widest">SAYFA</span>
            <span class="text-[0.7rem] font-black text-white font-mono">{{ currentPage }} / {{ totalPages }}</span>
          </div>

          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === totalPages" 
            @click="fetchExams({ page: currentPage + 1, search: searchQuery, status: selectedStatus })"
            title="SONRAKİ SAYFA"
          >
            <template #icon><ChevronRight class="w-4 h-4" /></template>
          </BaseButton>
        </div>
        <BaseButton variant="success" size="icon" square @click="showCreateModal = true" title="YENİ SINAV OLUŞTUR">
          <template #icon><Plus class="w-5 h-5" /></template>
        </BaseButton>
      </template>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { 
  Award, Calendar, MapPin, Users, Plus, X, ArrowLeft,
  Loader2, CheckCircle, XCircle, Trash2, Edit3, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { beltExamService } from '../../services/admin/beltExamService'
import { useBeltExams } from '../../composables/useBeltExams'
import { useAlerts } from '../../utils/alerts'

// Base Components
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'

// Extracted Components
import BeltExamForm from '../../components/exams/BeltExamForm.vue'
import BeltExamParticipants from '../../components/exams/BeltExamParticipants.vue'
import BeltExamCandidatePicker from '../../components/exams/BeltExamCandidatePicker.vue'
import BeltExamAttendance from '../../components/exams/BeltExamAttendance.vue'

const router = useRouter()
const { 
  exams, totalExams, totalPages, currentPage, specialties, instructors, loading, 
  fetchExams, fetchSpecialties, fetchInstructors, deleteExam, completeExam 
} = useBeltExams()
const { toast, error: showAlertError, confirm } = useAlerts()

// State
const searchQuery = ref('')
const viewMode = ref('list')
const selectedStatus = ref('ALL')
const isStatusDropdownOpen = ref(false)
const statusTabs = [
  { k: 'ALL', l: 'TÜM SINAVLAR' },
  { k: 'ONGOING', l: 'DEVAM EDEN SINAVLAR' },
  { k: 'COMPLETED', l: 'TAMAMLANMIŞ SINAVLAR' }
]
const showCreateModal = ref(false)
const isEditing = ref(false)
const activeExam = ref(null)
const selectedExamId = ref(null)
const selectedParticipantId = ref(null)
const participantSearchQuery = ref('')
const participantViewMode = ref('list')

const newExam = ref({
  examName: '',
  specialtyId: '',
  examDate: '',
  examTime: '',
  locationName: '',
  locationAddress: '',
  meetingPointName: '',
  meetingPointAddress: '',
  meetingDate: '',
  meetingTime: '',
  description: '',
  fee: 0,
  examPeriod: '',
  targetBelt: '',
  instructorId: ''
})

// Helpers
const editExam = (exam) => {
  isEditing.value = true
  newExam.value = { 
    ...exam,
    specialtyId: exam.branchId // Backend mapping
  }
  showCreateModal.value = true
}

const closeForm = () => {
  showCreateModal.value = false
  isEditing.value = false
  newExam.value = {
    examName: '', specialtyId: '', examDate: '', examTime: '',
    locationName: '', locationAddress: '', meetingPointName: '',
    meetingPointAddress: '', meetingDate: '', meetingTime: '',
    description: '', fee: 0, examPeriod: '', targetBelt: '',
    instructorId: ''
  }
}

// Data Fetching
const createExam = async () => {
  loading.value = true
  try {
    const data = { ...newExam.value, branchId: newExam.value.specialtyId }
    if (isEditing.value) {
      await beltExamService.update(newExam.value.id, data)
      toast('SINAV GÜNCELLENDİ')
    } else {
      await beltExamService.create(data)
      toast('SINAV OLUŞTURULDU')
    }
    closeForm()
    fetchExams()
  } catch (err) {
    showAlertError('HATA', 'İşlem başarısız.')
  } finally {
    loading.value = false
  }
}

const confirmDeleteExam = async (id) => {
  const success = await deleteExam(id)
  if (success) {
    selectedExamId.value = null
  }
}

// Participants Logic
const openParticipantModal = (exam) => {
  activeExam.value = exam
  selectedParticipantId.value = null
}

const setParticipantResult = async ({ id, status }) => {
  try {
    await beltExamService.setParticipantResult(id, status)
    fetchExams().then(() => {
       if (activeExam.value) {
          activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
       }
    })
  } catch (err) {
    showAlertError('HATA', 'Sonuç kaydedilemedi.')
  }
}

const confirmDeleteParticipant = async (id) => {
  const isConfirmed = await confirm('ÇIKARILSIN MI?', 'Öğrenci sınav listesinden çıkarılacaktır.')

  if (isConfirmed) {
    try {
      await beltExamService.deleteParticipant(id)
      selectedParticipantId.value = null
      fetchExams().then(() => {
        if (activeExam.value) {
          activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
        }
      })
    } catch (err) {
      showAlertError('HATA', 'İşlem başarısız.')
    }
  }
}

const sendWhatsAppNotification = async (id) => {
  try {
    await beltExamService.notify(id)
    toast('BİLDİRİM GÖNDERİLDİ')
  } catch (err) {
    showAlertError('HATA', 'WhatsApp bildirimi gönderilemedi.')
  }
}

// State for Participant Edit
const showParticipantEditModal = ref(false)
const editingParticipantForm = ref({ id: null, toBelt: '', note: '' })

const editParticipant = (id) => {
  const p = activeExam.value.participants.find(part => part.id === id)
  if (!p) return

  editingParticipantForm.value = {
    id: p.id,
    toBelt: p.toBelt,
    note: p.note || ''
  }
  showParticipantEditModal.value = true
}

const saveParticipantEdit = async () => {
  try {
    await beltExamService.updateParticipant(editingParticipantForm.value.id, {
      toBelt: editingParticipantForm.value.toBelt,
      note: editingParticipantForm.value.note
    })
    
    showParticipantEditModal.value = false
    fetchExams().then(() => {
      if (activeExam.value) {
        activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
      }
    })
    toast('GÜNCELLENDİ')
  } catch (err) {
    showAlertError('HATA', 'Güncelleme yapılamadı.')
  }
}

// Candidate Picker Logic
const showCandidatePicker = ref(false)
const candidates = ref([])
const candidatesLoading = ref(false)
const selectedCandidateIds = ref([])
const candidateSearchQuery = ref('')
const candidateViewMode = ref('list')
const candidateFilters = ref({ minMonths: 3 })
const candidateSelections = ref({})

const openCandidatePicker = () => {
  showCandidatePicker.value = true
  fetchCandidates()
}

const fetchCandidates = async () => {
  candidatesLoading.value = true
  console.log('[EXAM] Fetching candidates for branchId:', activeExam.value.branchId)
  try {
    const data = await beltExamService.getCandidates({ 
      specialtyId: activeExam.value.branchId,
      minMonths: candidateFilters.value.minMonths 
    })
    console.log('[EXAM] Candidates found:', data?.length || 0)
    candidates.value = data
    data.forEach(c => {
       if (!candidateSelections.value[c.id]) {
          let startBelt = c.currentBelt || 'Beyaz'
          const exactMatch = availableBelts.value.find(b => b === startBelt)
          if (!exactMatch) {
             const fuzzyMatch = availableBelts.value.find(b => startBelt.includes(b) || b.includes(startBelt))
             if (fuzzyMatch) startBelt = fuzzyMatch
          }
          candidateSelections.value[c.id] = {
             fromBelt: startBelt,
             toBelt: getNextBelt(startBelt)
          }
       }
    })
  } catch (err) {
    console.error('Adaylar getirilemedi:', err)
  } finally {
    candidatesLoading.value = false
  }
}

const toggleCandidateSelection = (id) => {
  const idx = selectedCandidateIds.value.indexOf(id)
  if (idx === -1) selectedCandidateIds.value.push(id)
  else selectedCandidateIds.value.splice(idx, 1)
}

const addSelectedCandidates = async () => {
  loading.value = true
  try {
    const payload = selectedCandidateIds.value.map(memberId => {
      const sel = candidateSelections.value[memberId]
      return { memberId, fromBelt: sel.fromBelt, toBelt: sel.toBelt, feePaid: false }
    })
    await beltExamService.addParticipants({
      examId: activeExam.value.id,
      participants: payload
    })
    showCandidatePicker.value = false
    selectedCandidateIds.value = []
    fetchExams().then(() => {
      activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
    })
    toast('ADAYLAR EKLENDİ')
  } catch (err) {
    console.error('Aday ekleme hatası:', err)
  } finally {
    loading.value = false
  }
}

// Attendance Logic
const showAttendanceModal = ref(false)
const attendanceSearchQuery = ref('')
const attendanceViewMode = ref('list')
const attendanceFilterTab = ref('ALL')
const participantsForAttendance = ref([])
const selectedAttendanceIds = ref([])

const openAttendanceModal = () => {
  participantsForAttendance.value = (activeExam.value.participants || []).map(p => ({
    ...p.member,
    participantId: p.id,
    attendanceStatus: p.attendance !== 'PENDING' ? p.attendance : 'PRESENT',
    excuse: p.excuse || '',
    isLocked: p.attendance !== 'PENDING'
  }))
  showAttendanceModal.value = true
}

const toggleAttendanceSelection = (id) => {
  const p = participantsForAttendance.value.find(m => m.id === id)
  if (!p || !p.isLocked) return
  const idx = selectedAttendanceIds.value.indexOf(id)
  if (idx > -1) selectedAttendanceIds.value.splice(idx, 1)
  else selectedAttendanceIds.value.push(id)
}

const submitAttendance = async () => {
  const records = participantsForAttendance.value.map(p => ({
    participantId: p.participantId,
    status: p.attendanceStatus,
    excuse: p.excuse
  }))
  
  if (records.length === 0) {
    showAttendanceModal.value = false
    return
  }

  loading.value = true
  try {
    const data = await beltExamService.markAttendance({
      examId: activeExam.value.id,
      records
    })
    
    showAttendanceModal.value = false
    fetchExams().then(() => {
      activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
    })
    
    let successText = 'Yoklama başarıyla kaydedildi.'
    if (data.chargeCount > 0) {
      successText += `\n${data.chargeCount} üyenin carisine toplam ${data.totalCharged} TL sınav ücreti borç olarak yansıtıldı.`
    }

    toast('İŞLEM TAMAMLANDI', 'success')
  } catch (err) {
    showAlertError('HATA', 'Yoklama kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const undoSelectedAttendance = async () => {
    const selected = participantsForAttendance.value.filter(m => selectedAttendanceIds.value.includes(m.id) && m.isLocked)
    if (selected.length === 0) return

    const isConfirmed = await confirm('YOKLAMAYI GERİ AL', 'Seçili öğrencilerin yoklama kayıtları sıfırlanacak. Emin misiniz?')

    if (isConfirmed) {
      loading.value = true
      try {
        await Promise.all(selected.map(p => 
          beltExamService.updateAttendance(p.participantId, { status: 'PENDING', excuse: '' })
        ))
        
        selectedAttendanceIds.value = []
        showAttendanceModal.value = false
        fetchExams().then(() => {
          activeExam.value = exams.value.find(e => e.id === activeExam.value.id)
        })
        toast('SIFIRLANDI')
      } catch (err) {
        showAlertError('HATA', 'Geri alma işlemi başarısız.')
      } finally {
        loading.value = false
      }
    }
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

const getNextBelt = (current) => {
  const belts = availableBelts.value
  const idx = belts.indexOf(current)
  if (idx === -1 || idx === belts.length - 1) return current
  return belts[idx + 1]
}

const availableBelts = computed(() => {
  if (!activeExam.value) return ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan']
  const specId = activeExam.value.specialtyId || activeExam.value.branchId
  const spec = specialties.value.find(s => s.id === specId)
  return (spec && spec.belts && spec.belts.length > 0) ? spec.belts : ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan']
})

const canCompleteExam = (exam) => {
  if (!exam || !exam.participants || exam.participants.length === 0) return false
  if (exam.status === 'COMPLETED') return false
  const allResultsEntered = exam.participants.every(p => p.status !== 'PENDING')
  const allPaid = exam.participants.every(p => p.feePaid)
  return allResultsEntered && allPaid
}

const handleCompleteExam = async (examId) => {
  await completeExam(examId)
  selectedExamId.value = null
}

const filteredExams = computed(() => exams.value || [])

// Watch for search/filters
let debounceTimer;
watch([searchQuery, selectedStatus], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchExams({ 
      page: 1, 
      search: searchQuery.value, 
      status: selectedStatus.value 
    })
  }, 300);
});

onMounted(() => {
  fetchExams({ page: 1 })
  fetchSpecialties()
  fetchInstructors()

  window.addEventListener('click', () => {
    isStatusDropdownOpen.value = false
  })
})
</script>
