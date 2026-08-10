<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-medium">
    <!-- Header -->
    <header class="h-20 flex-none bg-slate-950 border-b border-slate-800 px-6 grid grid-cols-3 items-center z-[80] shadow-2xl">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 uppercase font-medium tracking-tighter text-lg select-none">
          <span class="text-rose-600 font-black italic">BEHA</span>
          <span class="text-white font-black italic">GYM</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3">
        <div class="flex-none p-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <BaseMemberAvatar 
            :src="auth.user?.photo" 
            :name="auth.user?.fullName || auth.user?.username" 
            size="sm" 
          />
        </div>
        <h1 class="text-xs sm:text-base font-black text-slate-100 uppercase tracking-[0.1em] sm:tracking-[0.25em] leading-none">
          {{ auth.user?.fullName || auth.user?.username || 'ÜYE PORTALI' }}
        </h1>
      </div>

      <div class="flex items-center justify-end gap-3">
        <button 
          @click="handleLogout" 
          class="flex items-center justify-center w-10 h-10 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all rounded-none"
          title="Güvenli Çıkış"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto custom-scroll p-4 lg:px-12 lg:py-8 space-y-8 w-full pb-10" v-if="!loadingDashboard && dashboardData">
      <MemberQuickStats :stats="dashboardData.stats" />
      
      <MemberTrainingPackages 
        :packages="dashboardData.packages" 
        :trainingPlans="dashboardData.trainingPlans"
        @view-plan="viewPlan"
      />

      <MemberExamsPayments 
        :upcomingExams="dashboardData.upcomingExams"
        :nextPayment="dashboardData.nextPayment"
      />

      <MemberRecentSales :recentSales="dashboardData.recentSales" />
    </main>

    <div v-else-if="loadingDashboard" class="flex-1 flex justify-center items-center">
      <Loader2 class="w-10 h-10 animate-spin text-indigo-500" />
    </div>

    <!-- Action Footer -->
    <BaseActionFooter v-if="!showPlanModal && dashboardData?.trainingPlans?.length > 0">
       <div class="flex items-center justify-center gap-4 w-full max-lg mx-auto pb-2">
         <BaseButton variant="danger" square class="w-14 h-14 rounded-none !bg-rose-600/10 !border-rose-500/30" @click="openMyNutrition">
           <template #icon><Apple class="w-8 h-8" /></template>
         </BaseButton>

         <BaseButton variant="secondary" square class="w-14 h-14 !bg-indigo-600 !text-white !border-2 !border-slate-800 rounded-none shadow-lg" @click="viewPlan(dashboardData.trainingPlans[0])">
           <template #icon><Dumbbell class="w-8 h-8" /></template>
         </BaseButton>

         <BaseButton variant="secondary" square class="w-14 h-14 rounded-none !bg-indigo-600/10 !border-indigo-500/30" @click="openMyAnalysis">
           <template #icon><Activity class="w-8 h-8" /></template>
         </BaseButton>
       </div>
    </BaseActionFooter>

    <!-- Training Plan Modal -->
    <TrainingPlanModal 
      ref="planModalRef"
      v-model:statusFilter="statusFilter"
      :isOpen="showPlanModal"
      :user="auth.user"
      :selectedPlan="selectedPlan"
      :currentWeek="currentWeek"
      :completedCount="getCompletedCount(selectedPlan)"
      :missedCount="getMissedCount(selectedPlan)"
      :completionRate="getCompletionRate(selectedPlan)"
      :member="dashboardData?.member"
      :latestMeasurement="latestMeasurement"
      :measurements="measurements"
      :remainingWeight="remainingWeight"
      :progressPercent="progressPercent"
      :loadingPlan="loadingPlanDetails"
      :loadingNutrition="loadingNutrition"
      :filteredDays="filteredWeekDays"
      :planItems="planDetails?.items || []"
      :nutritionPlan="nutritionPlan"
      :isDayCompleted="isDayCompleted"
      :isDayMissed="isDayMissed"
      :isFutureDay="isFutureDay"
      :getDayCardClass="getDayCardClass"
      :getDayHeaderClass="getDayHeaderClass"
      :getDayCategories="getDayCategories"
      :getBmiClass="getBmiClass"
      :getBMIStatus="getBMIStatus"
      @close="showPlanModal = false"
      @change-week="changeWeek"
      @open-image="openBranchImage"
      @toggle-completion="toggleDayCompletion"
      @add-measurement="addMeasurement"
    />

    <!-- Branch Image Modal -->
    <div v-if="showBranchImage" class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
        <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" @click="showBranchImage = false"></div>
        <div class="relative bg-slate-900 border-2 border-slate-800 rounded-none shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col group">
            <div class="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 relative z-10">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-none flex items-center justify-center">
                        <BookOpen class="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <p class="text-[0.6rem] text-slate-500 font-black uppercase tracking-[0.3em] mb-0.5">EĞİTİM MATERYALİ</p>
                        <h3 class="text-xl font-black text-white uppercase tracking-tighter italic">{{ branchImageTitle }}</h3>
                    </div>
                </div>
                <button @click="showBranchImage = false" class="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-none text-slate-400 hover:text-rose-400 hover:border-rose-400/50 transition-all">
                    <X class="w-5 h-5" />
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 custom-scroll">
                <img :src="branchImageSource" :alt="branchImageTitle" class="w-full h-auto rounded-none shadow-2xl border border-white/5 object-contain" />
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useRouter } from 'vue-router'
import { LogOut, Dumbbell, Activity, Apple, Loader2, BookOpen, X } from 'lucide-vue-next'
import { useDataStore } from '../../store/data'
import { useAlerts } from '../../utils/alerts'

import { dashboardService } from '../../services/dashboard/dashboardService'
import { trainingService } from '../../services/training/trainingService'
import { measurementService } from '../../services/member/measurementService'
import { nutritionService } from '../../services/member/nutritionService'

// Base Components
import BaseButton from '../../components/base/BaseButton.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'

// Member Components
import MemberQuickStats from '../../components/member/MemberQuickStats.vue'
import MemberTrainingPackages from '../../components/member/MemberTrainingPackages.vue'
import MemberExamsPayments from '../../components/member/MemberExamsPayments.vue'
import MemberRecentSales from '../../components/member/MemberRecentSales.vue'
import TrainingPlanModal from '../../components/member/TrainingPlanModal.vue'

const auth = useAuthStore()
const router = useRouter()
const dataStore = useDataStore()
const { toast, error: showAlertError, prompt: showAlertPrompt } = useAlerts()

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const dashboardData = ref(null)
const loadingDashboard = ref(true)

const showPlanModal = ref(false)
const planModalRef = ref(null)
const selectedPlan = ref(null)
const planDetails = ref(null)
const loadingPlanDetails = ref(false)
const currentWeek = ref(1)
const completedDays = ref([]) 
const tempCompletedDays = ref([]) 
const statusFilter = ref(null)
const measurements = ref([])
const nutritionPlan = ref(null)
const loadingNutrition = ref(false)
const showBranchImage = ref(false)
const branchImageSource = ref(null)
const branchImageTitle = ref('')

// Computed
const latestMeasurement = computed(() => {
    const member = dashboardData.value?.member;
    const history = (measurements.value && measurements.value.length > 0) ? measurements.value : (member?.measurements || []);
    if (history.length > 0) return history[0];
    const weight = member?.weight || member?.startingWeight || 0;
    const height = member?.height || 0;
    let bmiValue = 0;
    if (height > 0 && weight > 0) {
        const h = height / 100;
        bmiValue = (weight / (h * h)).toFixed(1);
    }
    return { weight, bmi: bmiValue || 0, bmr: 0 };
});

const remainingWeight = computed(() => {
    const member = dashboardData.value?.member;
    if (!member) return '-';
    const history = (measurements.value && measurements.value.length > 0) ? measurements.value : (member.measurements || []);
    const current = history[0]?.weight || member.weight || member.startingWeight || 0;
    const target = member.targetWeight || 0;
    if (!current || !target) return '-';
    const goals = member.fitnessGoals || [];
    const isLosingWeight = goals.some(g => g.toLowerCase().includes('zayıf') || g.toLowerCase().includes('kilo ver'));
    const isGainingWeight = goals.some(g => g.toLowerCase().includes('kilo al'));
    if (isLosingWeight) return current > target ? (current - target).toFixed(1) : 'HEDEF TAMAM';
    else if (isGainingWeight) return target > current ? (target - current).toFixed(1) : 'HEDEF TAMAM';
    return Math.abs(current - target).toFixed(1);
});

const progressPercent = computed(() => {
    const member = dashboardData.value?.member;
    if (!member) return 0;
    const history = (measurements.value && measurements.value.length > 0) ? measurements.value : (member.measurements || []);
    const current = history[0]?.weight || member.weight || member.startingWeight || 0;
    const initial = history[history.length - 1]?.weight || member.startingWeight || current;
    const target = member.targetWeight || 0;
    if (!target || !initial || initial === target) return initial === target ? 100 : 0;
    let progress = target < initial ? ((initial - current) / (initial - target)) * 100 : ((current - initial) / (target - initial)) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
});

const filteredWeekDays = computed(() => {
  if (!planDetails.value?.days) return []
  let days = planDetails.value.days
  if (statusFilter.value === 'COMPLETED') return days.filter(d => isDayCompleted(d.dayOfWeek))
  if (statusFilter.value === 'SKIPPED') return days.filter(d => isDayMissed(d.dayOfWeek))
  if (statusFilter.value === 'PENDING') return days.filter(d => !d.isRestDay && !isDayCompleted(d.dayOfWeek) && !isDayMissed(d.dayOfWeek))
  return days
})

// Methods
const fetchDashboardData = async (isBackground = false) => {
  if (!isBackground) loadingDashboard.value = true
  try {
    const data = await dashboardService.getMemberDashboard()
    dashboardData.value = data
    if (data.member?.id) {
       fetchMeasurements(data.member.id);
       fetchNutritionPlan(data.member.id);
       if (data.trainingPlans?.length > 0 && !selectedPlan.value) {
          selectedPlan.value = data.trainingPlans[0];
          fetchPlanDetails(selectedPlan.value);
       }
    }
  } catch (err) { console.error(err) } finally { loadingDashboard.value = false }
}

const fetchMeasurements = async (memberId) => {
  try {
    measurements.value = await measurementService.getByMemberId(memberId)
  } catch (err) { console.error(err) }
}

const fetchNutritionPlan = async (memberId) => {
  loadingNutrition.value = true
  try {
    nutritionPlan.value = await nutritionService.getByMemberId(memberId)
  } catch (err) { nutritionPlan.value = null } finally { loadingNutrition.value = false }
}

const fetchPlanDetails = async (plan) => {
  loadingPlanDetails.value = true
  try {
    planDetails.value = await trainingService.getPlanDetails(plan.id)
    await fetchWeekLogs(plan.id, currentWeek.value)
  } catch (err) { console.error(err) } finally { loadingPlanDetails.value = false }
}

const fetchWeekLogs = async (planId, week) => {
  try {
    const logs = await trainingService.getWeekLogs(planId, week)
    completedDays.value = logs.map(log => `${planId}-${week}-${log.dayOfWeek}`)
    tempCompletedDays.value = [...completedDays.value]
  } catch (err) { console.error(err) }
}

const viewPlan = async (plan) => {
  if (planModalRef.value) planModalRef.value.activeTab = 'program'
  selectedPlan.value = plan
  showPlanModal.value = true
  currentWeek.value = 1
  await fetchPlanDetails(plan)
}

const changeWeek = async (newWeek) => {
  currentWeek.value = newWeek
  if (selectedPlan.value) await fetchWeekLogs(selectedPlan.value.id, newWeek)
}

const toggleDayCompletion = async (dayIndex) => {
  if (!selectedPlan.value) return
  const compositeId = `${selectedPlan.value.id}-${currentWeek.value}-${dayIndex}`
  const idx = tempCompletedDays.value.indexOf(compositeId)
  if (idx > -1) tempCompletedDays.value.splice(idx, 1)
  else tempCompletedDays.value.push(compositeId)
  
  // Auto-save logic simplified for refactor
  try {
    const daysLog = tempCompletedDays.value.map(id => Number(id.split('-').pop()))
    await trainingService.logBatchActivity({
      planId: selectedPlan.value.id,
      completedDayIndices: daysLog,
      weekNumber: currentWeek.value
    })
    completedDays.value = [...tempCompletedDays.value]
  } catch (err) { console.error(err) }
}

const isDayCompleted = (dayIndex) => tempCompletedDays.value.includes(`${selectedPlan.value?.id}-${currentWeek.value}-${dayIndex}`)

const isDayMissed = (dayOfWeek) => {
  if (!selectedPlan.value || !planDetails.value) return false
  const todayIdx = (new Date().getDay() + 6) % 7
  const isPast = Number(dayOfWeek) < todayIdx
  const isCompleted = isDayCompleted(dayOfWeek)
  const isRest = planDetails.value.days?.find(d => Number(d.dayOfWeek) === Number(dayOfWeek))?.isRestDay
  return isPast && !isCompleted && !isRest
}

const isFutureDay = (dayIndex) => Number(dayIndex) > ((new Date().getDay() + 6) % 7)

const getCompletedCount = (plan) => tempCompletedDays.value.filter(id => id.startsWith(`${plan?.id}-${currentWeek.value}-`)).length

const getMissedCount = (plan) => {
  if (!planDetails.value) return 0
  const todayIdx = (new Date().getDay() + 6) % 7
  return planDetails.value.days.filter(d => !d.isRestDay && Number(d.dayOfWeek) < todayIdx && !isDayCompleted(d.dayOfWeek)).length
}

const getCompletionRate = (plan) => {
  if (!planDetails.value) return 0
  const total = planDetails.value.days.filter(d => !d.isRestDay).length
  return total ? Math.round((getCompletedCount(plan) / total) * 100) : 0
}

const getDayCardClass = (day) => {
  if (day.isRestDay) return 'bg-slate-900/40 border-slate-800'
  if (isDayCompleted(day.dayOfWeek)) return 'bg-emerald-500/5 border-emerald-500/30'
  if (isDayMissed(day.dayOfWeek)) return 'bg-rose-500/5 border-rose-500/30'
  return Number(day.dayOfWeek) === ((new Date().getDay() + 6) % 7) ? 'bg-sky-500/5 border-sky-500/40 border-2' : 'bg-slate-900 border-slate-800'
}

const getDayHeaderClass = (day) => {
  if (day.isRestDay) return 'bg-slate-800/50'
  if (isDayCompleted(day.dayOfWeek)) return 'bg-emerald-600/20'
  if (isDayMissed(day.dayOfWeek)) return 'bg-rose-600/20'
  return Number(day.dayOfWeek) === ((new Date().getDay() + 6) % 7) ? 'bg-sky-600/30' : 'bg-slate-800'
}

const getDayCategories = (dayOfWeek) => {
  if (!planDetails.value?.items) return []
  const items = planDetails.value.items.filter(i => i.dayOfWeek === dayOfWeek)
  const categories = items.map(i => {
    const name = i.exercise?.specialty?.name && i.exercise?.category?.name ? `${i.exercise.specialty.name} - ${i.exercise.category.name}` : (i.exercise?.category?.name || i.exercise?.specialty?.name || 'GENEL')
    return { name: name.toUpperCase(), image: i.exercise?.specialty?.image || i.exercise?.category?.image }
  })
  return Array.from(new Map(categories.map(c => [c.name, c])).values())
}

const openBranchImage = (branch) => {
  branchImageSource.value = branch.image
  branchImageTitle.value = branch.name
  showBranchImage.value = true
}

const getBMIStatus = (bmi) => {
  const val = Number(bmi)
  if (!val) return { label: 'BELİRSİZ', color: 'text-slate-500' }
  if (val < 18.5) return { label: 'ZAYIF', color: 'text-sky-400' }
  if (val < 25) return { label: 'NORMAL', color: 'text-emerald-400' }
  if (val < 30) return { label: 'KİLOLU', color: 'text-amber-400' }
  return { label: 'OBEZ', color: 'text-rose-500' }
}

const getBmiClass = (bmi) => getBMIStatus(bmi).color

const openMyNutrition = () => { if (planModalRef.value) planModalRef.value.activeTab = 'nutrition'; showPlanModal.value = true; }
const openMyAnalysis = () => { if (planModalRef.value) planModalRef.value.activeTab = 'analysis'; showPlanModal.value = true; }

const addMeasurement = async () => {
    // Measurement logic simplified for refactor
    const { value: weight } = await showAlertPrompt('KİLO ÖLÇÜMÜ', 'Güncel kilonuzu giriniz (kg)', 'number')
    
    if (weight) {
      try {
        await measurementService.create({ memberId: dashboardData.value.member.id, weight: parseFloat(weight), measurementDate: new Date().toISOString() })
        await fetchMeasurements(dashboardData.value.member.id)
        await fetchDashboardData(true)
        toast('Ölçüm kaydedildi.')
      } catch (err) { 
        showAlertError('HATA', 'Ölçüm kaydedilemedi.')
        console.error(err) 
      }
    }
}

const handleLogout = () => { auth.logout(); router.push('/login'); }

onMounted(() => fetchDashboardData())
watch(() => dataStore.lastRefresh, () => fetchDashboardData(true))
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
