<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  value: {
    type: [String, Number, Object],
    default: null
  },
  label: String,
  subtitle: String,
  disabled: Boolean,
  containerClass: String
})

const emit = defineEmits(['update:modelValue'])

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue
})

const handleChange = (e) => {
  const checked = e.target.checked
  if (Array.isArray(props.modelValue)) {
    const newVal = [...props.modelValue]
    if (checked) {
      newVal.push(props.value)
    } else {
      const idx = newVal.indexOf(props.value)
      if (idx > -1) newVal.splice(idx, 1)
    }
    emit('update:modelValue', newVal)
  } else {
    emit('update:modelValue', checked)
  }
}
</script>

<template>
  <label :class="['flex items-center justify-between group cursor-pointer select-none', containerClass]">
    <div v-if="label || subtitle" class="flex flex-col gap-0.5">
      <span v-if="label" class="text-[0.7rem] font-bold text-white tracking-widest group-hover:text-indigo-400 transition-colors">
        {{ label }}
      </span>
      <span v-if="subtitle" class="text-[0.55rem] text-slate-300 tracking-widest font-medium">
        {{ subtitle }}
      </span>
    </div>

    <div class="relative inline-flex items-center">
      <input 
        type="checkbox" 
        :checked="isChecked" 
        :value="value"
        @change="handleChange"
        class="sr-only peer"
        :disabled="disabled"
      >
      <div 
        class="w-11 h-6 bg-slate-950/40 rounded-full transition-all duration-300 relative border-2 border-slate-700
               peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]
               peer-checked:shadow-[0_0_15px_rgba(16,185,129,0.3)]
               after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
               after:bg-slate-700 after:rounded-full after:h-4 after:w-4 
               after:transition-all after:duration-300
               peer-checked:after:translate-x-5 peer-checked:after:bg-emerald-400
               peer-checked:after:shadow-[0_0_10px_rgba(52,211,153,0.8)]
               peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
      ></div>
    </div>
  </label>
</template>

<style scoped>
/* Gerekirse buraya stil eklenebilir */
</style>
