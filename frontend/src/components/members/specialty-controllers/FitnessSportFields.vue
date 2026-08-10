<template>
  <div class="space-y-6">
    <!-- Section: Development Goals -->
    <div class="p-5 bg-slate-900/60 border border-slate-700/50 shadow-2xl space-y-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-1 h-3 bg-emerald-500"></div>
        <span class="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Kişisel Gelişim ve Fiziksel Hedefler</span>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <BaseSwitch 
          v-for="goal in ['Zayıflamak', 'Kilo Almak', 'Kas Yapmak', 'Kondisyon', 'Esneklik', 'Disiplin', 'Savunma', 'Müsabaka']" 
          :key="goal"
          :modelValue="localMember.fitnessGoals ? localMember.fitnessGoals.includes(goal) : false"
          @update:modelValue="(val) => updateGoal(goal, val)"
          :label="goal"
          containerClass="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all rounded text-[0.6rem] font-bold uppercase"
        />
      </div>

      <!-- Hedef Kilo -->
      <div v-if="hasWeightGoal" class="mt-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput 
          :modelValue="localMember.targetWeight"
          @update:modelValue="val => localMember = { ...localMember, targetWeight: val }"
          type="number"
          step="0.1"
          label="Hedeflenen Kilo (kg)"
          placeholder="Örn: 75.5"
        />
        <BaseInput 
          :modelValue="localMember.activityLevel"
          @update:modelValue="val => localMember = { ...localMember, activityLevel: val }"
          type="select"
          label="Günlük Aktivite Seviyesi"
        >
            <option value="">Seçiniz</option>
            <option value="SEDENTARY">Hareketsiz (Ofis vb.)</option>
            <option value="LIGHT">Az Hareketli</option>
            <option value="MODERATE">Orta Hareketli</option>
            <option value="VERY_ACTIVE">Haftada 3-5 Gün Spor</option>
            <option value="EXTRA_ACTIVE">Profesyonel Sporcu</option>
        </BaseInput>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseInput from '../../base/BaseInput.vue'
import BaseSwitch from '../../base/BaseSwitch.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

const localMember = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const hasWeightGoal = computed(() => {
  return localMember.value.fitnessGoals?.includes('Zayıflamak') || 
         localMember.value.fitnessGoals?.includes('Kilo Almak')
})

const updateGoal = (goal, val) => {
  let goals = [...(props.modelValue.fitnessGoals || [])]
  if (val) {
    if (!goals.includes(goal)) goals.push(goal)
  } else {
    goals = goals.filter(g => g !== goal)
  }
  
  emit('update:modelValue', {
    ...props.modelValue,
    fitnessGoals: goals
  })
}
</script>
