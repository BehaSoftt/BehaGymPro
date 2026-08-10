<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">

    <!-- Base Search & Filters -->
    <BaseSearchFilter
      v-if="!showAddModal && !showEnrollModal && !showAttendanceModal"
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="GRUP ARA..."
      accent="rose"
    />


    <!-- Groups Display Area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Dashboard Views (List/Grid) -->
      <template v-if="!showAddModal && !showEnrollModal && !showAttendanceModal">
        <!-- Grid View -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" class="absolute inset-0 p-2" accent="rose">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <BaseCard 
              v-for="group in filteredGroups" 
              :key="group.id" 
              v-memo="[group, selectedGroupIds.includes(group.id)]"
              :selected="selectedGroupIds.includes(group.id)"
              @click="toggleSelection(group.id)"
              accent="rose"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="p-2.5 bg-slate-950 border border-slate-700/50 group-hover:border-rose-500/50 transition-colors rounded-sm">
                  <Users class="w-5 h-5 text-rose-400" />
                </div>
                <div class="flex flex-col items-end gap-1.5">
                   <!-- Status Indicator (Power-like Dot) -->
                   <div class="flex items-center gap-2 px-2 py-0.5 rounded-full border bg-slate-950/50"
                        :class="group.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'">
                      <div class="w-1.5 h-1.5 rounded-full animate-pulse" :class="group.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)]'"></div>
                      <span class="text-[0.6rem] font-black uppercase tracking-[0.2em] pt-[1px]">
                          {{ group.status === 'ACTIVE' ? 'AKTİF' : 'PASİF' }}
                      </span>
                   </div>
                </div>
              </div>

              <div class="uppercase tracking-tight mb-4 text-left">
                <h3 class="text-sm font-black text-slate-100 group-hover:text-rose-400 transition-colors truncate">{{ group.name }}</h3>
                <p class="text-[0.65rem] text-slate-500 font-bold tracking-[0.15em] uppercase mt-0.5">{{ group.specialty?.name || 'GENEL' }}</p>
              </div>
              
              <div class="space-y-3 py-4 border-t border-slate-700/30">
                <div class="bg-slate-900/40 p-2.5 border border-slate-800/50 space-y-2 rounded-sm text-left">
                    <div class="flex items-center gap-2 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest ">
                      <CalendarDays class="w-3.5 h-3.5 text-indigo-500/80" />
                      {{ group.startDate }}
                    </div>
                    <div class="flex items-center gap-2 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest ">
                      <Clock class="w-3.5 h-3.5 text-amber-500/80" />
                      {{ group.startTime }} - {{ group.endTime }}
                    </div>
                </div>

                <div class="space-y-1.5 px-1">
                    <div class="flex justify-between text-[0.6rem] font-black uppercase tracking-[0.1em]">
                      <span class="text-slate-600">DOLULUK</span>
                      <span :class="group.enrolledMembers?.length >= group.maxCapacity ? 'text-rose-500' : 'text-emerald-500'">
                        {{ group.enrolledMembers?.length || 0 }} / {{ group.maxCapacity }}
                      </span>
                    </div>
                     <div class="h-1 bg-slate-900 border border-slate-800 overflow-hidden rounded-full">
                       <div 
                         :style="{ width: ((group.enrolledMembers?.length || 0) / group.maxCapacity * 100) + '%' }"
                         :class="group.enrolledMembers?.length >= group.maxCapacity ? 'bg-rose-500' : 'bg-emerald-500'"
                         class="h-full transition-all duration-700 ease-out"
                       ></div>
                     </div>
                 </div>

                 <!-- TODAY ATTENDANCE STATUS -->
                 <div v-if="group.attendanceRecords?.length" class="bg-slate-950/50 p-2.5 border border-slate-800/50 rounded-sm mt-3 border-l-2 text-left" :class="group.attendanceRecords[0].status === 'PRESENT' ? 'border-l-emerald-500' : 'border-l-rose-500'">
                    <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-1">YOKLAMA ONAYI</span>
                    <div class="flex items-center justify-between">
                       <div class="flex items-center gap-2">
                          <CheckCircle v-if="group.attendanceRecords[0].status === 'PRESENT'" class="w-3 h-3 text-emerald-500" />
                          <XCircle v-else-if="group.attendanceRecords[0].status === 'ABSENT'" class="w-3 h-3 text-rose-500" />
                          <Info v-else class="w-3 h-3 text-amber-500" />
                          <span class="text-[0.6rem] font-bold text-slate-200 uppercase">
                             {{ group.attendanceRecords[0].status === 'PRESENT' ? 'ALINDI' : 'YOKLAMA VAR' }}
                          </span>
                       </div>
                       <span class="text-[0.55rem] text-slate-500 font-mono whitespace-nowrap">
                          {{ new Date(group.attendanceRecords[0].createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{ new Date(group.attendanceRecords[0].createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}
                       </span>
                    </div>
                 </div>
              </div>

              <template #footer>
                 <div class="flex justify-between items-center w-full">
                    <span class="text-[0.6rem] text-slate-600 font-black uppercase tracking-widest">EĞİTMEN</span>
                    <span class="text-[0.65rem] text-slate-300 font-bold uppercase">{{ group.instructor?.fullName || 'BELİRTİLMEDİ' }}</span>
                 </div>
              </template>
            </BaseCard>
          </div>
        </BaseScroll>

        <!-- List View -->
        <BaseTable 
          v-else 
          :columns="groupColumns" 
          :items="filteredGroups"
          :selected-ids="selectedGroupIds"
          @rowClick="toggleSelection($event.id)"
          accent="rose"
          class="absolute inset-0"
        >
          <!-- Grup Tanımı -->
          <template #cell-name="{ item }">
            <div class="flex items-center gap-3">
              <div :class="selectedGroupIds.includes(item.id) ? 'bg-rose-600 border-rose-500 shadow-lg shadow-rose-900/20' : 'bg-slate-950 border-slate-700'" class="w-9 h-9 border flex items-center justify-center transition-all relative overflow-hidden">
                <Users :class="selectedGroupIds.includes(item.id) ? 'text-white' : 'text-rose-400'" class="w-4 h-4 relative z-10" />
                <div v-if="selectedGroupIds.includes(item.id)" class="absolute inset-0 bg-rose-600 flex items-center justify-center z-20">
                  <Check class="w-4 h-4 text-white" />
                </div>
              </div>
              <div class="flex flex-col uppercase tracking-tight text-left">
                <span class="text-[0.75rem] font-bold text-slate-50 group-hover:text-rose-400 transition-colors">{{ item.name }}</span>
                <span class="text-[0.6rem] text-slate-500 font-medium tracking-widest">{{ item.branch?.name }}</span>
              </div>
            </div>
          </template>

          <!-- Branş -->
          <template #cell-specialty="{ item }">
            <span class="text-[0.65rem] font-black text-rose-500 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 uppercase tracking-[0.2em]">
              {{ item.specialty?.name || 'GENEL' }}
            </span>
          </template>

          <!-- Program Akışı -->
          <template #cell-program="{ item }">
            <div class="space-y-1 uppercase inline-block text-left">
              <div class="flex items-center gap-2 text-[0.7rem] text-slate-300 font-black tracking-widest">
                <Clock class="w-3.5 h-3.5 text-amber-500" />
                {{ item.startTime }} - {{ item.endTime }}
              </div>
              <div class="flex gap-1 flex-wrap">
                <span v-for="day in item.days" :key="day" class="text-[0.5rem] font-black bg-slate-950 px-1.5 py-0.5 text-slate-500 uppercase border border-slate-800">
                  {{ ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'][day] }}
                </span>
              </div>
            </div>
          </template>

          <!-- Kontenjan -->
          <template #cell-capacity="{ item }">
            <div class="flex flex-col items-center gap-1.5 min-w-[80px]">
              <span :class="item.enrolledMembers?.length >= item.maxCapacity ? 'text-rose-400' : 'text-emerald-400'" class="text-[0.75rem] font-black tracking-tighter">
                {{ item.enrolledMembers?.length || 0 }} / {{ item.maxCapacity }}
              </span>
              <div class="w-full h-1 bg-slate-950 border border-slate-800 overflow-hidden">
                <div 
                  :style="{ width: ((item.enrolledMembers?.length || 0) / item.maxCapacity * 100) + '%' }"
                  :class="item.enrolledMembers?.length >= item.maxCapacity ? 'bg-rose-500' : 'bg-emerald-500' "
                  class="h-full transition-all duration-500 text-center"
                ></div>
              </div>
            </div>
          </template>

          <!-- Eğitmen -->
          <template #cell-instructor="{ item }">
            <span class="text-[0.7rem] font-black text-slate-200 uppercase tracking-widest">{{ item.instructor?.fullName || 'YOK' }}</span>
          </template>

          <!-- Durum -->
          <template #cell-status="{ item }">
            <span :class="item.status === 'ACTIVE' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'text-rose-500 border-rose-500/30 bg-rose-500/5'" class="text-[0.55rem] font-black px-2 py-0.5 border uppercase tracking-widest">
              {{ item.status === 'ACTIVE' ? 'AKTİF' : 'PASİF' }}
            </span>
          </template>
        </BaseTable>
      </template>
    </div>

    <!-- Extracted Components -->
    <GroupClassForm
      v-if="showAddModal"
      v-model="newGroup"
      :is-edit="!!activeGroup"
      :branches="branches"
      :specialties="specialties"
      :instructors="instructors"
      :packages="packages"
      :loading="loading"
      @save="activeGroup ? updateGroup() : createGroup()"
      @cancel="showAddModal = false"
    />

    <GroupClassEnrollment
      v-if="showEnrollModal"
      :group="activeGroup"
      :members="members"
      :loading="loading"
      @enroll="enrollMembers"
      @unenroll="unenrollMember"
      @cancel="showEnrollModal = false"
    />

    <GroupClassAttendance
      v-if="showAttendanceModal"
      :items="enrolledMembersForAttendance"
      :loading="loading"
      @save="submitAttendance"
      @undo="undoSelectedAttendance"
      @cancel="showAttendanceModal = false"
    />

    <!-- Action Footer for General Views -->
    <BaseActionFooter v-if="!showAddModal && !showEnrollModal && !showAttendanceModal">
      <!-- Center Pillar -->
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="$router.push('/')" title="GERİ">
          <template #icon><ArrowLeft class="w-5 h-5" /></template>
        </BaseButton>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === 1"
            @click="fetchGroups({ page: currentPage - 1, search: searchQuery })"
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
            @click="fetchGroups({ page: currentPage + 1, search: searchQuery })"
            title="SONRAKİ SAYFA"
          >
            <template #icon><ChevronRight class="w-4 h-4" /></template>
          </BaseButton>
        </div>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <BaseButton 
          variant="primary" 
          size="icon" 
          square
          @click="openCreateForm"
          title="YENİ GRUP TANIMLA"
        >
          <template #icon><Plus class="w-5 h-5" /></template>
        </BaseButton>

        <Transition name="fade-slide">
          <div v-if="selectedGroupIds.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
            <template v-if="selectedGroupIds.length === 1">
              <BaseButton 
                variant="indigo" 
                size="icon" square
                @click="openEnrollModal(groups.find(g => g.id === selectedGroupIds[0]))"
                title="ÜYE EKLE"
              >
                <template #icon><UserPlus class="w-5 h-5" /></template>
              </BaseButton>

              <BaseButton 
                variant="warning" 
                size="icon" square
                @click="openAttendanceModal(groups.find(g => g.id === selectedGroupIds[0]))"
                title="YOKLAMA AL"
              >
                <template #icon><CheckCircle class="w-5 h-5" /></template>
              </BaseButton>

              <BaseButton 
                variant="secondary" 
                size="icon" square
                @click="startEdit(groups.find(g => g.id === selectedGroupIds[0]))"
                title="DÜZENLE"
              >
                <template #icon><Edit class="w-5 h-5" /></template>
              </BaseButton>

              <BaseButton 
                :variant="groups.find(g => g.id === selectedGroupIds[0])?.status === 'ACTIVE' ? 'success' : 'danger'"
                size="icon" square
                @click="toggleGroupStatus(groups.find(g => g.id === selectedGroupIds[0]))"
                title="DURUM DEĞİŞTİR"
              >
                <template #icon><Power class="w-5 h-5" /></template>
              </BaseButton>
            </template>

            <BaseButton variant="danger" size="icon" square @click="batchDelete" title="SİL">
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>
            
            <BaseButton variant="ghost" size="icon" square @click="selectedGroupIds = []" title="İPTAL">
              <template #icon><XCircle class="w-5 h-5" /></template>
            </BaseButton>
          </div>
        </Transition>
      </div>
    </BaseActionFooter>

  </div> <!-- Close of Main Container -->
</template>


<script setup>
import { ref, onMounted, computed, defineAsyncComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../store/data'
import { storeToRefs } from 'pinia'
import { 
  Plus, Users, Edit, Trash2, StopCircle, RefreshCw, X, ChevronDown, Check,
  Camera, ArrowLeft, ArrowRight, LayoutGrid, List, Search, Award, Flag, Power, Calendar, Clock,
  CheckCircle2, AlertCircle, RefreshCcw, UserPlus, CheckCircle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { groupClassService } from '../../services/lesson/groupClassService'
import { attendanceService } from '../../services/lesson/attendanceService'
import { useGroupClasses } from '../../composables/useGroupClasses'
import { useAlerts } from '../../utils/alerts'

// Base Components
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseCard from '../../components/base/BaseCard.vue'

// Extracted Components
const GroupClassForm = defineAsyncComponent(() => import('../../components/groups/GroupClassForm.vue'))
const GroupClassEnrollment = defineAsyncComponent(() => import('../../components/groups/GroupClassEnrollment.vue'))
const GroupClassAttendance = defineAsyncComponent(() => import('../../components/groups/GroupClassAttendance.vue'))

const router = useRouter()
const dataStore = useDataStore()
const { branches, specialties, instructors } = storeToRefs(dataStore)

const { 
  groups, totalGroups, totalPages, currentPage, members, packages, loading, 
  fetchGroups, fetchMembers, fetchPackages, deleteGroup, toggleStatus 
} = useGroupClasses()
const { toast, error: showAlertError, confirm } = useAlerts()

const groupColumns = [
  { key: 'name',       label: 'GRUP TANIMI',    sortable: true },
  { key: 'specialty',  label: 'BRANŞ',           sortable: true },
  { key: 'program',    label: 'PROGRAM AKIŞI',   align: 'center' },
  { key: 'capacity',   label: 'KONTENJAN',       align: 'center' },
  { key: 'instructor', label: 'EĞİTMEN',         sortable: true, align: 'center' },
  { key: 'status',     label: 'DURUM',           align: 'center' },
]

// State
const showAddModal = ref(false)
const showEnrollModal = ref(false)
const showAttendanceModal = ref(false)
const activeGroup = ref(null)

const viewMode = ref('list')
const searchQuery = ref('')
const selectedGroupIds = ref([])
const enrolledMembersForAttendance = ref([])

const newGroup = ref({ name: '', specialtyId: '', instructorId: '', packageId: '', branchId: '', maxCapacity: 12, minCapacity: 4, startDate: new Date().toISOString().split('T')[0], endDate: '', startTime: '10:00', endTime: '11:00', days: [] })

// Fetching


// Computed
const filteredGroups = computed(() => groups.value)

// Watch for search/pagination
let debounceTimer;
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchGroups({ page: 1, search: searchQuery.value })
  }, 300);
});

// Logic
const toggleSelection = (id) => {
   selectedGroupIds.value = selectedGroupIds.value[0] === id ? [] : [id]
}

const openCreateForm = () => {
  activeGroup.value = null
  newGroup.value = { name: '', specialtyId: '', instructorId: '', packageId: '', branchId: '', maxCapacity: 12, minCapacity: 4, startDate: new Date().toISOString().split('T')[0], endDate: '', startTime: '10:00', endTime: '11:00', days: [] }
  showAddModal.value = true
}

const startEdit = (group) => {
  activeGroup.value = group
  newGroup.value = JSON.parse(JSON.stringify(group))
  showAddModal.value = true
}

const createGroup = async () => {
  loading.value = true
  try {
    await groupClassService.create(newGroup.value)
    showAddModal.value = false
    await fetchGroups()
    toast('OLUŞTURULDU')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Grup oluşturulamadı.')
  } finally {
    loading.value = false
  }
}

const updateGroup = async () => {
  loading.value = true
  try {
    await groupClassService.update(activeGroup.value.id, newGroup.value)
    showAddModal.value = false
    await fetchGroups()
    toast('GÜNCELLENDİ')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Güncelleme başarısız.')
  } finally {
    loading.value = false
  }
}

const toggleGroupStatus = async (group) => {
  await toggleStatus(group)
}

const batchDelete = async () => {
   if (selectedGroupIds.value.length === 0) return
   
   const isConfirmed = await confirm('EMİN MİSİNİZ?', `${selectedGroupIds.value.length} grup kaydı silinecektir. Bu işlem geri alınamaz!`)

   if (isConfirmed) {
      try {
         await groupClassService.batchDelete(selectedGroupIds.value)
         toast('SİLİNDİ')
         selectedGroupIds.value = []
         await fetchGroups()
      } catch (err) {
         showAlertError('HATA', err.response?.data?.message || 'Bazı kayıtlar silinemedi.')
      }
   }
}

// Enrollment Logic
const openEnrollModal = (group) => {
  activeGroup.value = group
  showEnrollModal.value = true
}

const enrollMembers = async (memberIds) => {
  loading.value = true
  try {
    await groupClassService.enroll(activeGroup.value.id, memberIds)
    showEnrollModal.value = false
    await fetchGroups()
    toast('BAŞARILI')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Üye eklenemedi.')
  } finally {
    loading.value = false
  }
}

const unenrollMember = async (memberId) => {
  const isConfirmed = await confirm('EMİN MİSİNİZ?', "Üye gruptan çıkarılacaktır!")

  if (isConfirmed) {
    loading.value = true
    try {
      await groupClassService.unenroll(activeGroup.value.id, memberId)
      toast('ÇIKARILDI')
      await fetchGroups()
      activeGroup.value = groups.value.find(g => g.id === activeGroup.value.id)
    } catch (err) {
      showAlertError('HATA', err.response?.data?.message || 'İşlem yapılamadı.')
    } finally {
      loading.value = false
    }
  }
}

// Attendance Logic
const openAttendanceModal = async (group) => {
  activeGroup.value = group
  loading.value = true
  try {
    const date = new Date().toISOString().split('T')[0]
    const data = await attendanceService.getGroupAttendance(group.id, date)
    const existingRecords = data || []
    
    enrolledMembersForAttendance.value = (group.enrolledMembers || []).map(m => {
       const existing = existingRecords.find(r => r.memberId === m.id)
       return {
         ...m,
         attendanceStatus: existing ? existing.status : 'PRESENT',
         attendanceId: existing ? existing.id : null,
         excuse: existing ? existing.excuse : '',
         isLocked: !!existing,
         createdAt: existing ? existing.createdAt : null
       }
    })
    showAttendanceModal.value = true
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Yoklama durumu kontrol edilemedi.')
  } finally {
    loading.value = false
  }
}

const submitAttendance = async (members) => {
  const recordsToSubmit = members.filter(m => !m.isLocked)
  if (recordsToSubmit.length === 0) {
    showAttendanceModal.value = false
    return
  }

  try {
    const attendanceRecords = recordsToSubmit.map(m => ({ memberId: m.id, status: m.attendanceStatus, excuse: m.excuse }))
    await attendanceService.markAttendance({ groupClassId: activeGroup.value.id, records: attendanceRecords })
    showAttendanceModal.value = false
    await fetchGroups()
    toast('YOKLAMA ALINDI')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Yoklama kaydedilemedi.')
  }
}

const undoSelectedAttendance = async (selectedIds) => {
  const lockedItems = enrolledMembersForAttendance.value.filter(m => selectedIds.includes(m.id) && m.isLocked && m.attendanceId)
  if (lockedItems.length === 0) return

  const isConfirmed = await confirm('SEÇİLİ KAYITLARI DÜZELT', 'Seçili yoklama kayıtları silinecek ve seanslar geri yüklenecektir. Emin misiniz?')

  if (isConfirmed) {
    loading.value = true
    try {
      await Promise.all(lockedItems.map(m => attendanceService.deleteAttendance(m.attendanceId)))
      lockedItems.forEach(m => {
        m.isLocked = false
        m.attendanceId = null
        m.attendanceStatus = 'PRESENT'
        m.excuse = ''
      })
      await fetchGroups()
      toast('SİLİNDİ')
    } catch (err) {
      showAlertError('HATA', 'Bazı kayıtlar silinemedi.')
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => { 
  fetchGroups({ page: 1 })
  fetchMembers()
  fetchPackages()
  dataStore.fetchInstructors()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
