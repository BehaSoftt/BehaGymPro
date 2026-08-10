<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
    <div class="bg-slate-900 w-full max-w-4xl border border-slate-700 p-8 relative flex flex-col">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X class="w-6 h-6" />
      </button>
      
      <h3 class="text-2xl font-medium text-slate-100 uppercase tracking-tighter mb-8 border-b border-rose-600/40 pb-4">
        {{ member?.fullName }} - PLAN PANELİ
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <select v-model="selectedTemplateId" class="bg-slate-950 border border-slate-700 px-4 py-3 text-slate-200 uppercase font-medium text-xs outline-none focus:border-indigo-500">
          <option value="" disabled>Plan Şablonu Seçiniz...</option>
          <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.title }}</option>
        </select>
        <button @click="assignPlan" class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium uppercase tracking-widest text-xs py-3">
          PLAN ATA
        </button>
      </div>

      <div v-if="memberPlan" class="space-y-6">
        <div class="bg-slate-950/50 border border-slate-700 p-6 flex justify-between items-center">
          <div>
            <span class="text-[0.65rem] text-slate-500 font-medium uppercase">Aktif Plan</span>
            <p class="text-xl font-medium text-emerald-400 uppercase tracking-tight">{{ memberPlan.title }}</p>
          </div>
          <button @click="removePlan" class="text-rose-500 text-[0.75rem] font-medium uppercase hover:underline">Planı İptal Et</button>
        </div>
        
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, idx) in daysOfWeek" :key="idx" class="bg-slate-950 border border-slate-700 p-3 text-center">
            <span class="text-[0.55rem] text-slate-500 font-medium uppercase block mb-2">{{ day.substring(0,3) }}</span>
            <div :class="hasExercisesOnDay(idx) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800'" class="w-2 h-2 mx-auto"></div>
          </div>
        </div>
      </div>
      <div v-else class="py-20 text-center border border-dashed border-rose-700 text-slate-600 font-medium uppercase tracking-widest">
        Plan Tanımlanmamış
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  member: Object,
  memberPlan: Object,
  templates: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'assign', 'remove'])

const selectedTemplateId = ref('')
const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const hasExercisesOnDay = (dayIdx) => props.memberPlan?.items?.some(i => i.dayOfWeek === dayIdx)

const assignPlan = () => {
  if (selectedTemplateId.value) {
    emit('assign', selectedTemplateId.value)
  }
}

const removePlan = () => {
  emit('remove')
}
</script>
