<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">

    <!-- Standardized Search & Filter -->
    <BaseSearchFilter
      v-if="!showAddModal"
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="PLAN ADI VEYA ÜYE ARA..."
      accent="purple"
      class="mb-2"
    >
    </BaseSearchFilter>


    <!-- Main Dynamic Area -->
    <div class="flex-1 relative flex flex-col min-h-0">
      
      <!-- List Area (Dashboard) -->
      <div v-if="!showAddModal" class="flex-1 relative overflow-hidden">
        <!-- Grid View -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" class="absolute inset-0 p-2" accent="purple">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            <BaseCard 
              v-for="plan in filteredPlans" 
              :key="plan.id" 
              v-memo="[plan, selectedPlans.includes(plan.id)]"
              :selected="selectedPlans.includes(plan.id)"
              @click="toggleSelection(plan.id)"
              accent="purple"
            >
              <div class="flex justify-between items-start mb-4 text-left">
                <div :class="['w-12 h-12 border flex items-center justify-center transition-colors relative', selectedPlans.includes(plan.id) ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-700']">
                  <CalendarDays :class="['w-6 h-6', selectedPlans.includes(plan.id) ? 'text-white' : 'text-emerald-400']" />
                  <div v-if="selectedPlans.includes(plan.id)" class="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full shadow-lg p-0.5">
                    <Check class="w-3 h-3 font-bold" />
                  </div>
                </div>
                <div @click.stop="togglePlanStatus(plan)" class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="plan.isActive" class="sr-only peer">
                    <div class="w-8 h-4 bg-slate-900 border border-slate-700 rounded-full peer peer-checked:bg-emerald-600 transition-all duration-300 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 
                                after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white shadow-inner"></div>
                 </div>
              </div>

              <div class="uppercase tracking-tight text-left">
                <h3 class="text-sm font-black text-slate-100 group-hover:text-emerald-400 transition-colors truncate">{{ plan.title }}</h3>
                <div class="flex flex-wrap gap-1 mt-1.5">
                   <span v-if="plan.specialtyId" class="text-[0.55rem] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 border border-indigo-500/20 uppercase tracking-widest leading-none">
                       {{ getSpecialtyName(plan.specialtyId) }}
                    </span>
                   <span v-else-if="plan.package?.specialty" class="text-[0.55rem] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 border border-indigo-500/20 uppercase tracking-widest leading-none">
                       {{ plan.package.specialty.name }}
                    </span>
                   <span v-if="!plan.memberId" class="text-[0.55rem] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 uppercase tracking-widest leading-none">ŞABLON</span>
                   <span v-else class="text-[0.55rem] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 uppercase tracking-widest leading-none">ÖZEL</span>
                   <span class="text-[0.55rem] font-black text-sky-400 bg-sky-500/10 px-1.5 py-0.5 border border-sky-500/20 uppercase tracking-widest leading-none">LV {{ plan.level || 1 }}</span>
                </div>
              </div>
              
              <div class="space-y-2 py-4 border-t border-slate-700/50 mt-4">
                <div class="flex justify-between text-[0.65rem] font-black uppercase tracking-widest">
                  <span class="text-slate-500">HAFTALIK</span>
                  <span class="text-slate-300">{{ getPlanDaysCount(plan) }} GÜN</span>
                </div>
                <div class="flex justify-between text-[0.65rem] font-black uppercase tracking-widest">
                  <span class="text-slate-500">İSTASYON</span>
                  <span class="text-indigo-400">{{ plan.items?.length || 0 }} ADET</span>
                </div>
                <div class="flex justify-between text-[0.65rem] font-black uppercase tracking-widest">
                  <span class="text-slate-500">ENERJİ</span>
                  <span class="text-emerald-400 tracking-tighter">{{ calculateTotalCalories(plan) }} kcal</span>
                </div>
              </div>

              <template #footer>
                <div class="flex items-center gap-2">
                   <div v-if="plan.member" class="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[0.55rem] font-black uppercase">
                      {{ plan.member.fullName?.charAt(0) || '' }}
                   </div>
                   <span class="text-[0.6rem] font-black text-slate-400 uppercase truncate">
                      {{ plan.member ? plan.member.fullName : 'GENEL ŞABLON' }}
                   </span>
                </div>
              </template>
            </BaseCard>
          </div>
        </BaseScroll>

        <!-- List View -->
        <BaseTable
          v-else
          :columns="[
            { key: 'details',      label: 'PLAN DETAYI' },
            { key: 'level',        label: 'SEVİYE',          align: 'center' },
            { key: 'memberInfo',   label: 'ÜYE BİLGİSİ' },
            { key: 'packageBranch',label: 'PAKET / BRANŞ',   align: 'center' },
            { key: 'stats',        label: 'İSTATİSTİKLER',      align: 'center' },
            { key: 'status',       label: 'DURUM',            align: 'center' },
          ]"
          :items="filteredPlans"
          :selected-ids="selectedPlans"
          @rowClick="toggleSelection($event.id)"
          accent="purple"
          class="absolute inset-0"
        >
          <!-- Details -->
          <template #cell-details="{ item }">
            <div class="flex items-center gap-3">
              <div :class="['w-9 h-9 border flex items-center justify-center relative transition-colors', selectedPlans.includes(item.id) ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-950 border-slate-700']">
                <CalendarDays :class="['w-4 h-4', selectedPlans.includes(item.id) ? 'text-white' : 'text-purple-400']" />
                <div v-if="selectedPlans.includes(item.id)" class="absolute inset-0 bg-emerald-600 flex items-center justify-center z-10">
                  <Check class="w-4 h-4 text-white" />
                </div>
              </div>
              <div class="flex flex-col uppercase tracking-tight text-left">
                <div class="flex items-center gap-2">
                  <span class="text-[0.75rem] font-black text-slate-100 group-hover:text-purple-400 transition-colors">{{ item.title }}</span>
                  <span v-if="!item.memberId" class="text-[0.5rem] font-black text-emerald-500 bg-emerald-500/10 px-1 py-0.5 border border-emerald-500/20 leading-none">ŞABLON</span>
                  <span v-else class="text-[0.5rem] font-black text-amber-500 bg-amber-500/10 px-1 py-0.5 border border-amber-500/20 leading-none">ÖZEL</span>
                </div>
                <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{{ getPlanFocus(item) }}</span>
              </div>
            </div>
          </template>

          <template #cell-level="{ item }">
            <span class="text-[0.65rem] bg-sky-500/10 text-sky-400 px-2 py-1 border border-sky-500/20 font-black tracking-widest">LV {{ item.level || 1 }}</span>
          </template>

          <template #cell-memberInfo="{ item }">
            <div class="flex items-center gap-2.5">
              <div v-if="item.member" class="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[0.6rem] font-black uppercase">
                 {{ item.member.fullName?.charAt(0) || '' }}
              </div>
              <div v-else class="w-7 h-7 bg-slate-950 border border-slate-800 text-slate-700 flex items-center justify-center">
                 <Layers class="w-3.5 h-3.5" />
              </div>
              <span class="text-[0.65rem] font-black uppercase tracking-widest text-left">{{ item.member ? (item.member.fullName || 'İSİMSİZ ÜYE') : 'GENEL ŞABLON' }}</span>
            </div>
          </template>

          <template #cell-packageBranch="{ item }">
            <div class="flex flex-wrap justify-center gap-1 text-center">
              <span v-if="item.package" class="text-[0.55rem] font-black text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 border border-indigo-500/20 uppercase leading-none">
                {{ item.package.name }}
              </span>
              <span v-if="item.specialtyId" class="text-[0.55rem] font-black text-amber-500 bg-amber-500/5 px-1.5 py-0.5 border border-amber-500/20 uppercase leading-none">
                {{ getSpecialtyName(item.specialtyId) }}
              </span>
            </div>
          </template>

          <template #cell-stats="{ item }">
            <div class="flex justify-center gap-4">
              <div class="text-center group min-w-[60px]">
                <span class="block text-[0.5rem] text-slate-600 font-black tracking-widest">ENERJİ</span>
                <span class="text-[0.65rem] text-emerald-400 font-bold tracking-tighter">{{ calculateTotalCalories(item) }} KCAL</span>
              </div>
              <div class="text-center group min-w-[30px]">
                <span class="block text-[0.5rem] text-slate-600 font-black tracking-widest">GÜN</span>
                <span class="text-[0.65rem] text-slate-300 font-bold tracking-widest">{{ getPlanDaysCount(item) }}</span>
              </div>
            </div>
          </template>

          <template #cell-status="{ item }">
            <span :class="item.isActive ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-rose-500 border-rose-500/30 bg-rose-500/5'" class="text-[0.5rem] font-black px-1.5 py-0.5 border uppercase tracking-widest text-center">
              {{ item.isActive ? 'AKTİF' : 'PASİF' }}
            </span>
          </template>
        </BaseTable>

        <div v-if="filteredPlans.length === 0" class="py-20 text-center border border-dashed border-slate-700 text-slate-600 font-medium uppercase tracking-widest  opacity-50 mt-4">KAYIT BULUNAMADI</div>
      </div>
 
      <!-- Main Add/Edit Editor -->
      <div v-if="showAddModal" class="absolute inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <!-- Editor Header -->
        <div class="flex-none bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-50 shadow-xl">
           <div class="flex items-center gap-4">
              <div class="p-3 bg-indigo-600/10 border border-indigo-500/30">
                 <ClipboardList class="w-6 h-6 text-indigo-400" />
              </div>
              <div class="text-left">
                 <h2 class="text-sm font-black text-slate-100 uppercase tracking-[0.2em] leading-tight">
                    {{ newPlan.id ? 'PLANI DÜZENLE' : 'YENİ ANTRENMAN PLANI' }}
                 </h2>
                 <p class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest mt-1">Antrenman Sistemi & Planlama Editörü</p>
              </div>
           </div>

           <!-- Mini Stats in Header -->
           <div class="hidden lg:flex items-center gap-8">
              <div class="text-center group">
                 <span class="block text-[0.5rem] text-slate-500 font-black tracking-widest mb-1 group-hover:text-emerald-400 transition-colors uppercase">TOPLAM ENERJİ</span>
                 <span class="text-emerald-400 font-bold text-sm tracking-tighter">{{ currentTotalCalories }} KCAL</span>
              </div>
              <div class="w-px h-8 bg-slate-800"></div>
              <div class="text-center group">
                 <span class="block text-[0.5rem] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">İSTASYON SAYISI</span>
                 <span class="text-indigo-400 font-bold text-sm tracking-tighter">{{ newPlan.items.length }} ADET</span>
              </div>
              <div class="w-px h-8 bg-slate-800"></div>
              <div class="text-center group">
                 <span class="block text-[0.5rem] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">AKTİF GÜNLER</span>
                 <span class="text-purple-400 font-bold text-sm tracking-tighter">{{ getPlanDaysCount(newPlan) }} GÜN</span>
              </div>
           </div>

           <div class="flex items-center gap-2">
              <BaseButton variant="dark" size="icon" square @click="closeModal" title="KAPAT">
                <template #icon><X class="w-5 h-5" /></template>
              </BaseButton>
           </div>
        </div>

        <!-- Split Workbench Layout -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
           
           <TrainingPlanSidebar
             v-model="newPlan"
             v-model:activeDayIndex="activeDayIndex"
             :branches="branches"
             :specialties="specialties"
             :instructors="instructors"
             :timelineMonths="timelineMonths"
             :selectedMemberName="selectedMemberName"
             :daysOfWeek="daysOfWeek"
             :plans="plans"
             @openMemberPicker="showMemberModal = true"
             @selectMonth="selectMonth"
           />

           <TrainingPlanWorkoutEditor
             :activeDayIndex="activeDayIndex"
             :dayName="daysOfWeek[activeDayIndex]"
             :dayData="getDayData(activeDayIndex)"
             :isRestDay="isRestDay(activeDayIndex)"
             :items="getItemsForDay(activeDayIndex)"
             :groupedExercises="groupedExercises"
             :exercises="exercises"
             @copyDay="copyDay(activeDayIndex)"
             @toggleRestDay="toggleRestDay(activeDayIndex)"
             @removeItem="removeItem"
             @checkBulkAdd="checkBulkAdd($event, activeDayIndex)"
             @addItem="addItemToDay(activeDayIndex)"
           />

        </div>

        <!-- Member Picker Modal -->
        <TrainingPlanMemberPicker
          v-if="showMemberModal"
          :members="members"
          :selectedMemberId="newPlan.memberId"
          :excludedIds="assignedMemberIds"
          @select="selectMember"
          @close="showMemberModal = false"
        />
      </div>
    </div>

    <!-- Standardized Action Footer -->
    <BaseActionFooter v-if="!showMemberModal">
      <div class="flex items-center gap-[10px]">
        <template v-if="!showAddModal">
          <BaseButton variant="dark" size="icon" square @click="$router.push('/')" title="GERİ">
            <template #icon><X class="w-5 h-5" /></template>
          </BaseButton>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
            <BaseButton 
              variant="dark" size="icon" square 
              :disabled="currentPage === 1"
              @click="fetchPlans({ page: currentPage - 1, search: searchQuery })"
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
              @click="fetchPlans({ page: currentPage + 1, search: searchQuery })"
            >
              <template #icon><ChevronRight class="w-4 h-4" /></template>
            </BaseButton>
          </div>

          <div class="w-px h-6 bg-slate-800 mx-1"></div>

          <BaseButton 
            variant="primary" 
            size="icon" 
            square 
            @click="openNewPlanModal" 
            title="YENİ ANTRENMAN PLANI"
          >
            <template #icon><Plus class="w-5 h-5" /></template>
          </BaseButton>

          <Transition name="fade-slide">
            <div v-if="selectedPlans.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
              <template v-if="selectedPlans.length === 1">
                <BaseButton 
                  variant="warning" 
                  size="icon" square
                  @click="startEdit(plans.find(p => p.id === selectedPlans[0]))"
                  title="DÜZENLE"
                >
                  <template #icon><Edit class="w-5 h-5" /></template>
                </BaseButton>
                <BaseButton 
                  variant="dark" 
                  size="icon" square
                  @click="duplicatePlan(plans.find(p => p.id === selectedPlans[0]))"
                  title="ÜRET (KOPYALA)"
                >
                  <template #icon><Copy class="w-5 h-5" /></template>
                </BaseButton>
              </template>

              <BaseButton variant="danger" size="icon" square @click="deleteSelectedPlans" title="SİL">
                <template #icon><Trash2 class="w-5 h-5" /></template>
              </BaseButton>
              
              <BaseButton variant="ghost" size="icon" square @click="selectedPlans = []" title="İPTAL">
                <template #icon><XCircle class="w-5 h-5" /></template>
              </BaseButton>
            </div>
          </Transition>
        </template>

        <template v-else>
           <BaseButton variant="dark" size="icon" square @click="closeModal" title="VAZGEÇ">
              <template #icon><X class="w-5 h-5" /></template>
           </BaseButton>

           <div class="w-px h-6 bg-slate-800 mx-1"></div>

           <BaseButton 
              v-if="!isRestDay(activeDayIndex)"
              variant="indigo" 
              size="icon" square
              @click.prevent="addItemToDay(activeDayIndex)"
              title="YENİ İSTASYON EKLE"
           >
              <template #icon><Plus class="w-5 h-5" /></template>
           </BaseButton>

           <BaseButton 
              :variant="newPlan.id ? 'warning' : 'success'" 
              size="icon" square
              :loading="loading"
              @click="savePlan"
              :title="newPlan.id ? 'GÜNCELLE' : 'KAYDET'"
           >
              <template #icon>
                 <Save v-if="newPlan.id" class="w-5 h-5" />
                 <Check v-else class="w-5 h-5" />
              </template>
           </BaseButton>
        </template>
      </div>
    </BaseActionFooter>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue'
import { 
  CalendarDays, Plus, Trash2, X, ClipboardList, Layers, Search, Edit, Save, Check, XCircle, Clock, Copy, ChevronLeft, ChevronRight 
} from 'lucide-vue-next'
import { useDataStore } from '../../store/data'
import { storeToRefs } from 'pinia'
import { trainingService } from '../../services/training/trainingService'
import { memberService } from '../../services/member/memberService'
import { instructorService } from '../../services/instructor/instructorService'
import { useTrainingPlans } from '../../composables/useTrainingPlans'
import { useAlerts } from '../../utils/alerts'

// Component Imports
import TrainingPlanSidebar from '../../components/plans/TrainingPlanSidebar.vue'
import TrainingPlanWorkoutEditor from '../../components/plans/TrainingPlanWorkoutEditor.vue'
import TrainingPlanMemberPicker from '../../components/plans/TrainingPlanMemberPicker.vue'

const dataStore = useDataStore()
const { branches, specialties, packages, exercises } = storeToRefs(dataStore)
const { 
  plans, totalPlans, totalPages, currentPage, loading, fetchPlans, deletePlan, toggleStatus 
} = useTrainingPlans()
const { toast, error: showAlertError, confirm } = useAlerts()

const members = ref([])
const instructors = ref([])
const showMemberModal = ref(false)
const showAddModal = ref(false)
const viewMode = ref('list')
const selectedPlans = ref([])
const searchQuery = ref('')
const activeDayIndex = ref(0)

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const filteredPlans = computed(() => plans.value || [])

// Watch for search/pagination
let debounceTimer;
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchPlans({ page: 1, search: searchQuery.value })
  }, 300);
});

const selectedMemberName = computed(() => {
  if (!newPlan.value.memberId) return 'GENEL ŞABLON'
  const m = members.value.find(x => x.id === newPlan.value.memberId)
  return m ? m.fullName : 'ÜYE BULUNAMADI'
})

const assignedMemberIds = computed(() => (plans.value || []).map(p => p.memberId).filter(id => id !== null))

const getSpecialtyName = (specialtyId) => {
  const specialty = specialties.value.find(s => s.id === specialtyId)
  return specialty ? specialty.name : 'GENEL'
}

const groupedExercises = computed(() => {
  const total = exercises.value?.length || 0
  const selectedSid = newPlan.value.specialtyId
  
  let availableExercises = exercises.value || []
  if (selectedSid) {
    availableExercises = availableExercises.filter(ex => 
      !ex.specialtyId || ex.specialtyId === selectedSid
    )
  }
  
  const groups = {}
  availableExercises.forEach(ex => {
    const catName = ex.category?.name || 'GENEL'
    if (!groups[catName]) groups[catName] = []
    groups[catName].push(ex)
  })
  
  const result = Object.keys(groups).sort().reduce((acc, key) => { acc[key] = groups[key]; return acc }, {})
  
  console.log(`[TRAINING_PLAN] Groups: ${Object.keys(result).length}, Total: ${total}, Selected Specialty: ${selectedSid}`)
  
  return result
})

const newPlan = ref({ id: null, title: '', description: '', memberId: null, packageId: null, specialtyId: null, instructorId: null, branchId: '', startDate: '', endDate: '', days: [], items: [], level: 1, isActive: true })
const timelineMonths = ref([])

const getDayData = (dayIndex) => {
   let day = newPlan.value.days.find(d => d.dayOfWeek === dayIndex)
   if (!day) { 
     day = { dayOfWeek: dayIndex, startTime: '09:00', endTime: '10:30', isRestDay: false }
     newPlan.value.days.push(day) 
   }
   return day
}
const isRestDay = (dayIndex) => getDayData(dayIndex).isRestDay
const toggleRestDay = (dayIndex) => { 
  const day = getDayData(dayIndex)
  day.isRestDay = !day.isRestDay
  if (day.isRestDay) newPlan.value.items = newPlan.value.items.filter(i => i.dayOfWeek !== dayIndex) 
}

const generateTimeline = (member) => {
   if (!member?.registrationDate || !member.expiryDate) { timelineMonths.value = []; return }
   const months = []; let current = new Date(member.registrationDate); const end = new Date(member.expiryDate); let i = 1
   while (current < end) {
      let nextMonth = new Date(current); nextMonth.setMonth(current.getMonth() + 1); if (nextMonth > end) nextMonth = end
      months.push({ label: `${i}. AY`, startDate: current.toISOString().split('T')[0], endDate: nextMonth.toISOString().split('T')[0] })
      current = nextMonth; i++
   }
   timelineMonths.value = months
}

const getExistingPlanForMonth = (month) => {
   if (!newPlan.value.memberId) return null
   return plans.value.find(p => p.memberId === newPlan.value.memberId && p.startDate?.split('T')[0] === month.startDate && p.endDate?.split('T')[0] === month.endDate)
}

const selectMonth = (month) => {
   const existingPlan = getExistingPlanForMonth(month)
   if (existingPlan) newPlan.value = { ...existingPlan, items: existingPlan.items.map(i => ({...i})) }
   else { newPlan.value = { id: null, title: `${month.label} Programı`, description: '', memberId: newPlan.value.memberId, branchId: newPlan.value.branchId, packageId: newPlan.value.packageId, specialtyId: newPlan.value.specialtyId, startDate: month.startDate, endDate: month.endDate, items: [], days: [], level: 1, isActive: true } }
}

const toggleSelection = (id) => { selectedPlans.value = selectedPlans.value[0] === id ? [] : [id] }
const fetchMembers = async () => { 
  try { 
    const data = await memberService.getAll({ profileType: 'MEMBER' }) 
    members.value = Array.isArray(data) ? data : (data.members || [])
  } catch (err) { console.error('Members fetch failed:', err) } 
}
const fetchInstructors = async () => {
  try {
    const data = await instructorService.getAll()
    instructors.value = Array.isArray(data) ? data : (data.instructors || [])
  } catch (err) { console.error('Instructors fetch failed:', err) }
}
const calculateItemCalories = (item) => {
   const ex = exercises.value.find(e => e.id === item.exerciseId)
   if (!ex || !ex.caloriesPerMinute) return 0
   return (item.durationMinutes || 0) * ex.caloriesPerMinute
}

const currentTotalCalories = computed(() => (newPlan.value.items || []).reduce((sum, i) => sum + calculateItemCalories(i), 0))

const calculateTotalCalories = (plan) => plan.items?.reduce((sum, item) => { 
  const ex = exercises.value.find(e => e.id === item.exerciseId)
  return sum + ((item.durationMinutes || 0) * (ex?.caloriesPerMinute || 0)) 
}, 0) || 0

const getPlanFocus = (plan) => { 
  if (!plan.items?.length) return 'ODAK BELİRTİLMEDİ'
  const counts = {}
  plan.items.forEach(i => { 
    const name = exercises.value.find(e => e.id === i.exerciseId)?.category?.name || 'Genel'
    counts[name] = (counts[name] || 0) + 1 
  })
  return Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0]?.toUpperCase() 
}

const getPlanDaysCount = (plan) => { 
  if (!plan.items?.length) return 0
  const days = new Set(plan.items.map(i => i.dayOfWeek))
  return days.size 
}

const openNewPlanModal = () => { resetForm(); showAddModal.value = true }
const closeModal = () => { showAddModal.value = false; fetchPlans() }

const getItemsForDay = (dayIdx) => (newPlan.value.items || []).filter(i => i.dayOfWeek === dayIdx)
const addItemToDay = (dayIdx) => { 
  if (!newPlan.value.items) newPlan.value.items = []
  newPlan.value.items.push({ exerciseId: '', dayOfWeek: dayIdx, durationMinutes: 10, sets: 3, reps: 12, weight: 0, rounds: 1, notes: '' }) 
}
const removeItem = (item) => { 
  const idx = newPlan.value.items.indexOf(item)
  if (idx !== -1) newPlan.value.items.splice(idx, 1) 
}

const checkBulkAdd = (item, dayIdx) => {
   if (item.exerciseId.startsWith('BULK:')) {
      const groupName = item.exerciseId.split('BULK:')[1]
      const groupExs = groupedExercises.value[groupName]
      removeItem(item)
      groupExs.forEach(ex => { newPlan.value.items.push({ exerciseId: ex.id, dayOfWeek: dayIdx, durationMinutes: 5, sets: 3, reps: 12, weight: 0, rounds: 1, notes: '' }) })
   }
}

const resetForm = () => {
  newPlan.value = { id: null, title: '', description: '', memberId: null, packageId: null, specialtyId: null, instructorId: null, branchId: '', startDate: '', endDate: '', days: [], items: [], level: 1, isActive: true }
  activeDayIndex.value = 0
  timelineMonths.value = []
}

const copyDay = async (fromIdx) => {
   const options = daysOfWeek.reduce((acc, d, i) => { if (i !== fromIdx) acc[i] = d; return acc }, {})
   
   // useAlerts doesn't have a direct select dialog, yet. 
   // We might want to add it to alerts.js or use a custom modal.
   // For now, let's keep it minimal or use a standard confirm if possible,
   // but copyDay needs a selection. I'll use a simple prompt for now or keep Swal if needed,
   // but better to add select to alerts.js.
   
   // I'll assume we can use a custom modal or just add select to alerts.
   // Using Swal for this specific select interaction for now until alerts.js is extended.
   const { default: Swal } = await import('sweetalert2')
   Swal.fire({ 
     title: 'Hangi güne kopyalansın?', 
     input: 'select', 
     inputOptions: options, 
     showCancelButton: true, 
     background: '#1e293b', 
     color: '#f1f5f9',
     confirmButtonColor: '#10b981'
   }).then(r => { 
     if (r.value) { 
       const toIdx = parseInt(r.value)
       newPlan.value.items = newPlan.value.items.filter(i => i.dayOfWeek !== toIdx)
       getItemsForDay(fromIdx).forEach(i => { newPlan.value.items.push({ ...i, dayOfWeek: toIdx }) })
       getDayData(toIdx).isRestDay = false 
     } 
   })
}

const togglePlanStatus = async (plan) => {
  await toggleStatus(plan)
}

const savePlan = async () => {
   if (!newPlan.value.title) return showAlertError('Hata', 'Plan başlığı gereklidir.')
   
   if (!newPlan.value.startDate || newPlan.value.startDate === '') {
     newPlan.value.startDate = new Date().toISOString().split('T')[0]
   }
   if (!newPlan.value.endDate || newPlan.value.endDate === '') {
     const endDate = new Date()
     endDate.setDate(endDate.getDate() + 30)
     newPlan.value.endDate = endDate.toISOString().split('T')[0]
   }
   
   loading.value = true
   try {
      if (newPlan.value.id) await trainingService.update(newPlan.value.id, newPlan.value)
      else await trainingService.create(newPlan.value)
      toast('Plan başarıyla kaydedildi.')
      closeModal()
   } catch (err) { 
     showAlertError('HATA', 'Plan kaydedilirken bir sorun oluştu.')
   } finally { loading.value = false }
}

const deleteSelectedPlans = async () => {
  if (selectedPlans.value.length === 0) return
  
  const isConfirmed = await confirm('SİLME ONAYI', `${selectedPlans.value.length} plan silinecek. Emin misiniz?`)
  if (isConfirmed) {
    try {
      await Promise.all(selectedPlans.value.map(id => trainingService.delete(id)))
      selectedPlans.value = []
      fetchPlans()
      toast('Seçili planlar silindi.')
    } catch (err) { 
      console.error(err)
      showAlertError('HATA', 'Planlar silinirken bir hata oluştu.')
    }
  }
}

const selectMember = (member) => {
  newPlan.value.memberId = member ? member.id : null
  showMemberModal.value = false
}

const startEdit = (plan) => { 
  newPlan.value = JSON.parse(JSON.stringify(plan))
  showAddModal.value = true
  if (plan.memberId) generateTimeline(plan.member) 
}

const duplicatePlan = (plan) => { 
  newPlan.value = JSON.parse(JSON.stringify(plan))
  newPlan.value.id = null
  newPlan.value.title = `${plan.title} (KOPYA)`
  showAddModal.value = true
  if (plan.memberId) generateTimeline(plan.member || members.value.find(m => m.id === plan.memberId))
}

onMounted(async () => {
  fetchPlans({ page: 1 })
  fetchMembers()
  fetchInstructors()
  await dataStore.fetchSpecialties()
  await dataStore.fetchExercises(true)
  console.log('[TRAINING_PLAN] Loaded exercises:', exercises.value?.length)
  console.log('[TRAINING_PLAN] Loaded specialties:', specialties.value?.length)
})

watch(() => newPlan.value.memberId, (newId) => {
  if (newId) {
    const m = members.value.find(x => x.id === newId)
    generateTimeline(m)
    if (m && m.branchId) newPlan.value.branchId = m.branchId
  } else {
    timelineMonths.value = []
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); }
</style>
