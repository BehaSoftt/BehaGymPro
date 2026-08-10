<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <!-- Header: Progress Stats -->
      <header class="flex-none bg-slate-900/80 backdrop-blur-xl border-b-2 border-slate-800 px-3 md:px-8 py-2 md:py-3 sticky top-0 z-50 overflow-hidden">
         <div class="flex items-center justify-between w-full py-1 gap-2 md:gap-4">
            <!-- Member Info Section -->
            <div class="flex items-center gap-2 md:gap-4 flex-none">
               <div class="flex-none p-0.5 bg-slate-800 border border-slate-700 rounded-none">
                  <BaseMemberAvatar 
                    :src="user?.photo" 
                    :name="user?.fullName || user?.username" 
                    size="md"
                    class="rounded-none w-8 h-8 md:w-12 md:h-12"
                  />
               </div>
               <div class="flex flex-col">
                  <h4 class="text-xs md:text-lg font-black text-slate-100 uppercase tracking-tight leading-none mb-1 md:mb-1.5">{{ user?.fullName || user?.username }}</h4>
                  <p class="text-[0.45rem] md:text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1 md:mb-2">{{ selectedPlan?.title }}</p>
                  <div class="inline-flex">
                     <span class="text-[0.35rem] md:text-[0.5rem] text-slate-400 font-black uppercase tracking-widest border border-slate-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-none bg-slate-800/50 italic">{{ selectedPlan?.instructor?.fullName || 'EĞİTMEN ATANMAMIŞ' }}</span>
                  </div>
               </div>
            </div>

            <!-- Status Filters -->
            <div class="flex items-center gap-1 md:gap-1.5 px-2 md:px-8 flex-1 justify-center overflow-x-auto hide-scrollbar">
               <button @click="$emit('update:statusFilter', null); activeTab = 'program'" 
                 :class="statusFilter === null ? 'bg-slate-800 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-slate-950/20 border-slate-800 hover:border-slate-600'" 
                 class="flex flex-col items-center justify-center min-w-[50px] md:w-[100px] h-[45px] md:h-[65px] border rounded-none transition-all group"
               >
                  <span class="text-[0.32rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-[0.2em] mb-1 group-hover:text-slate-300">LİSTE</span>
                  <span class="text-[0.6rem] md:text-sm font-black text-white italic tracking-tighter uppercase whitespace-nowrap">TÜMÜ</span>
               </button>

               <button @click="$emit('update:statusFilter', 'COMPLETED'); activeTab = 'program'" 
                 :class="statusFilter === 'COMPLETED' ? 'bg-slate-800 border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950/20 border-slate-800 hover:border-slate-600'" 
                 class="flex flex-col items-center justify-center min-w-[45px] md:w-[85px] h-[45px] md:h-[65px] border rounded-none transition-all group"
               >
                  <span class="text-[0.32rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-[0.2em] mb-1 group-hover:text-slate-300">TAMAM</span>
                  <span class="text-[0.65rem] md:text-lg font-black text-emerald-500 italic tabular-nums leading-none">{{ completedCount }}</span>
               </button>

               <button @click="$emit('update:statusFilter', 'SKIPPED'); activeTab = 'program'" 
                 :class="statusFilter === 'SKIPPED' ? 'bg-slate-800 border-rose-500/50 ring-1 ring-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.1)]' : 'bg-slate-950/20 border-slate-800 hover:border-slate-600'" 
                 class="flex flex-col items-center justify-center min-w-[45px] md:w-[85px] h-[45px] md:h-[65px] border rounded-none transition-all group"
               >
                  <span class="text-[0.32rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-[0.2em] mb-1 group-hover:text-slate-300">KAÇIRDI</span>
                  <span class="text-[0.65rem] md:text-lg font-black text-rose-500 italic tabular-nums leading-none">{{ missedCount }}</span>
               </button>

               <!-- Başarı -->
               <button @click="activeTab = 'analysis'" 
                 :class="activeTab === 'analysis' ? 'bg-slate-800 border-indigo-500' : 'bg-slate-950/20 border-slate-800'"
                 class="flex flex-col items-center justify-center min-w-[45px] md:w-[85px] h-[45px] md:h-[65px] border rounded-none hover:border-slate-600 transition-all cursor-pointer"
               >
                  <span class="text-[0.32rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">BAŞARI</span>
                  <span class="text-[0.65rem] md:text-lg font-black text-white italic tabular-nums leading-none">{{ completionRate }}%</span>
               </button>
            </div>

            <!-- Week Switcher & Action Buttons -->
            <div class="flex items-center gap-2 md:gap-6 flex-none md:border-l md:border-slate-800 md:pl-8 h-[45px] md:h-[65px]">
               <div class="flex items-center gap-1.5 md:gap-4">
                  <button @click.stop="$emit('change-week', Math.max(1, currentWeek - 1))" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-500 hover:text-white transition-all rounded-none">
                     <ChevronLeft class="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <div class="hidden md:flex flex-col items-center min-w-[50px] md:min-w-[80px]">
                     <span class="text-[0.32rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">AKTİF</span>
                     <span class="text-[0.6rem] md:text-sm font-black text-white italic tracking-tighter">{{ currentWeek }}.HFT</span>
                  </div>
                  <button @click.stop="$emit('change-week', currentWeek + 1)" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-500 hover:text-white transition-all rounded-none">
                     <ChevronRight class="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>

               <div class="flex items-center border-l border-slate-800 pl-3 md:pl-6">
                  <button @click="$emit('close')" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 hover:text-white text-slate-400 transition-all rounded-none" title="Geri Dön">
                     <ChevronLeft class="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>
            </div>
         </div>
      </header>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll bg-slate-950">
         <component 
           :is="activeComponent" 
           v-bind="componentProps"
           @clear-filter="$emit('update:statusFilter', null)"
           @open-image="$emit('open-image', $event)"
           @toggle-completion="$emit('toggle-completion', $event)"
           @add-measurement="$emit('add-measurement')"
         />
      </div>

      <BaseActionFooter>
         <div class="w-full flex items-center justify-center relative z-10 px-2 md:px-8 py-2 md:py-3">
            <div class="flex flex-wrap items-center justify-center lg:justify-between w-full lg:min-w-[1000px] gap-x-3 md:gap-x-8 gap-y-2 md:gap-y-0 text-center md:text-left">
                <div class="flex flex-col gap-1">
                  <span class="text-[0.4rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-0.5">HEDEFLER</span>
                  <div class="flex gap-1.5 md:gap-2">
                    <span 
                      v-for="goal in (member?.fitnessGoals || ['BELİRİSİZ'])" 
                      :key="goal"
                      class="px-2 md:px-4 py-1.5 md:py-2 bg-slate-900/50 border border-slate-800 text-[0.6rem] md:text-[0.7rem] font-black text-white uppercase tracking-widest"
                    >
                      {{ goal === 'Zayıflamak' ? 'ZAYIFLA' : goal === 'Kilo Almak' ? 'KİLO AL' : goal.toUpperCase() }}
                    </span>
                  </div>
                </div>

               <div class="flex flex-col gap-0.5 relative px-2.5 md:px-8 border-l border-slate-800/50">
                 <span class="text-[0.32rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1">KG</span>
                 <div class="flex items-baseline gap-1">
                    <span class="text-base md:text-3xl font-black text-indigo-400 tabular-nums italic leading-none drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      {{ latestMeasurement.weight || '-' }}
                    </span>
                    <span class="text-[0.4rem] md:text-[0.6rem] text-slate-500 font-black uppercase tracking-widest">KG</span>
                 </div>
               </div>

               <div class="flex flex-col gap-0.5 relative px-2.5 md:px-8 border-l border-slate-800/50">
                 <span class="text-[0.32rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1">HEDEF</span>
                 <div class="flex items-baseline gap-1">
                    <span class="text-base md:text-3xl font-black text-rose-500 tabular-nums italic leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                       {{ Number(member?.targetWeight || 0).toFixed(1) }}
                    </span>
                    <span class="text-[0.4rem] md:text-[0.6rem] text-slate-500 font-black uppercase tracking-widest">KG</span>
                 </div>
               </div>

               <div class="flex flex-col gap-0.5 relative px-2.5 md:px-8 border-l border-slate-800/50">
                 <span class="text-[0.32rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1">KALAN</span>
                 <div class="flex items-baseline gap-1">
                    <span class="text-base md:text-3xl font-black text-emerald-500 tabular-nums italic leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      {{ remainingWeight }}
                    </span>
                    <span class="text-[0.4rem] md:text-[0.6rem] text-slate-500 font-black uppercase tracking-widest">KG</span>
                 </div>
               </div>

               <div class="hidden md:flex w-full md:flex-1 flex-col gap-1 px-3 md:px-8 border-t md:border-t-0 md:border-l border-slate-800/50 pt-3 md:pt-0">
                 <span class="text-[0.4rem] md:text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mb-1">İLERLEME BAŞARISI</span>
                 <div class="flex items-center gap-3 md:gap-6">
                   <div class="flex-1 h-3 bg-slate-950 border border-slate-800 shadow-inner p-0.5 relative">
                     <div 
                       class="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ring-1 ring-emerald-400/30 rounded-none"
                       :style="{ width: progressPercent + '%' }"
                     ></div>
                   </div>
                   <div class="flex flex-col items-center justify-center border-l border-slate-800 pl-3 md:pl-6">
                      <span class="text-lg md:text-2xl font-black text-white italic tabular-nums leading-none tracking-tighter">{{ progressPercent }}%</span>
                      <span class="text-[0.35rem] md:text-[0.45rem] text-slate-500 font-black uppercase tracking-widest mt-0.5">GÜNCEL</span>
                   </div>
                 </div>
               </div>
            </div>
         </div>
      </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseMemberAvatar from '../base/BaseMemberAvatar.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import TrainingPlanProgramTab from './TrainingPlanProgramTab.vue'
import TrainingPlanAnalysisTab from './TrainingPlanAnalysisTab.vue'
import TrainingPlanNutritionTab from './TrainingPlanNutritionTab.vue'

const props = defineProps({
  isOpen: Boolean,
  user: Object,
  selectedPlan: Object,
  statusFilter: String,
  currentWeek: Number,
  completedCount: Number,
  missedCount: Number,
  completionRate: Number,
  member: Object,
  latestMeasurement: Object,
  measurements: {
    type: [Array, Object],
    default: () => []
  },
  remainingWeight: [String, Number],
  progressPercent: Number,
  loadingPlan: Boolean,
  loadingNutrition: Boolean,
  filteredDays: Array,
  planItems: Array,
  nutritionPlan: Object,
  isDayCompleted: Function,
  isDayMissed: Function,
  isFutureDay: Function,
  getDayCardClass: Function,
  getDayHeaderClass: Function,
  getDayCategories: Function,
  getBmiClass: Function,
  getBMIStatus: Function
})

const activeTab = ref('program')

const activeComponent = computed(() => {
  if (activeTab.value === 'program') return TrainingPlanProgramTab
  if (activeTab.value === 'analysis') return TrainingPlanAnalysisTab
  if (activeTab.value === 'nutrition') return TrainingPlanNutritionTab
  return null
})

const componentProps = computed(() => {
  if (activeTab.value === 'program') {
    return {
      loading: props.loadingPlan,
      filteredDays: props.filteredDays,
      isDayCompleted: props.isDayCompleted,
      isDayMissed: props.isDayMissed,
      isFutureDay: props.isFutureDay,
      getDayCardClass: props.getDayCardClass,
      getDayHeaderClass: props.getDayHeaderClass,
      getDayCategories: props.getDayCategories,
      planItems: props.planItems
    }
  }
  if (activeTab.value === 'analysis') {
    return {
      latestMeasurement: props.latestMeasurement,
      measurements: props.measurements,
      completionRate: props.completionRate,
      getBmiClass: props.getBmiClass,
      getBMIStatus: props.getBMIStatus
    }
  }
  if (activeTab.value === 'nutrition') {
    return {
      loading: props.loadingNutrition,
      plan: props.nutritionPlan
    }
  }
  return {}
})

defineEmits(['close', 'update:statusFilter', 'change-week', 'open-image', 'toggle-completion', 'add-measurement'])

// Expose activeTab for external control if needed
defineExpose({ activeTab })
</script>
