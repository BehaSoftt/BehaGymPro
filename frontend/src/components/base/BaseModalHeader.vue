<template>
  <!-- Modal Header (Base Standard Alignment) -->
  <div class="flex-none px-[15px] pt-[4px] pb-[8px] select-none">
    <div 
      class="flex items-center justify-between h-[60px] bg-slate-900/50 border shadow-2xl backdrop-blur-sm px-6 transition-all"
      :class="borderClass"
    >
      <!-- LEFT SECTION -->
      <div class="flex items-center gap-10 flex-1 overflow-hidden">
        <!-- Left Slot: Typically for Back/Close buttons -->
        <div v-if="$slots.left" class="flex-none">
           <slot name="left"></slot>
        </div>

        <!-- Title & Subtitle Section -->
        <div class="flex flex-col text-left truncate">
           <h2 class="text-ui-modal-title font-ui-normal text-slate-100 uppercase tracking-ui truncate">{{ title }}</h2>
           <p 
             v-if="subtitle"
             class="text-ui-modal-title font-ui-normal uppercase tracking-ui truncate transition-all duration-300"
             :class="textClass"
           >
             {{ subtitle }}
           </p>
        </div>
      </div>

      <!-- RIGHT SECTION -->
      <div class="flex items-center justify-end gap-6 flex-1 overflow-hidden">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  accent: {
    type: String,
    default: 'rose'
    // Options: rose, indigo, emerald, amber, warning, danger, primary, info, dark
  }
})

const borderClass = computed(() => {
  const colors = {
    rose: 'border-rose-500',
    indigo: 'border-indigo-500',
    emerald: 'border-emerald-500',
    amber: 'border-amber-500',
    warning: 'border-amber-500',
    danger: 'border-rose-600',
    primary: 'border-indigo-400',
    info: 'border-cyan-500',
    dark: 'border-slate-700'
  }
  return colors[props.accent] || 'border-slate-800'
})

const textClass = computed(() => {
  const colors = {
    rose: 'text-rose-500',
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    warning: 'text-amber-500',
    danger: 'text-rose-500',
    primary: 'text-indigo-400',
    info: 'text-cyan-400',
    dark: 'text-slate-500'
  }
  return colors[props.accent] || 'text-slate-500'
})
</script>

<style scoped>
/* Ensure smooth transitions for any theme changes */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
