<template>
  <div
    :class="[
      'relative group transition-all duration-300 cursor-pointer select-none rounded-xl overflow-hidden',
      selected
        ? 'neon-card !border-emerald-500 !shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-500/10'
        : 'neon-card',
      clickable ? 'active:scale-[0.98]' : ''
    ]"
    @click="$emit('click', $event)"
  >

    <!-- Selection Checkbox (top-right) -->
    <div
      v-if="selectable"
      class="absolute top-3 right-3 z-10"
      @click.stop="$emit('select')"
    >
      <div
        class="w-4 h-4 border transition-all flex items-center justify-center"
        :class="selected
          ? 'bg-emerald-600 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
          : 'bg-slate-900 border-slate-600 hover:border-slate-400'"
      >
        <component v-if="selected" :is="CheckIcon" class="w-3 h-3 text-white" />
      </div>
    </div>

    <!-- Status Dot (top-left) -->
    <div v-if="status !== undefined" class="absolute top-3 left-3 flex items-center gap-1.5">
      <div
        class="w-1.5 h-1.5 rounded-full"
        :class="status ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-slate-600'"
      ></div>
      <span class="text-ui-label font-ui-normal uppercase tracking-ui" :class="status ? 'text-emerald-500' : 'text-slate-500'">
        {{ status ? activeLabel : inactiveLabel }}
      </span>
    </div>

    <!-- Card Content Slot -->
    <div :class="['p-4', status !== undefined ? 'pt-7' : '']">
      <slot></slot>
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="border-t border-slate-700/50 px-4 py-2.5 flex items-center justify-between">
      <slot name="footer"></slot>
    </div>

    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent"></div>
  </div>
</template>

<script setup>
import { Check as CheckIcon } from 'lucide-vue-next'

defineProps({
  selected:      { type: Boolean, default: false },
  selectable:    { type: Boolean, default: false },
  clickable:     { type: Boolean, default: true },
  status:        { type: Boolean, default: undefined },
  activeLabel:   { type: String, default: 'AKTİF' },
  inactiveLabel: { type: String, default: 'PASİF' },
  accent:        { type: String, default: null }, // rose, indigo, emerald, amber
})

defineEmits(['click', 'select'])

const accentColors = {
  rose:    'bg-rose-500',
  indigo:  'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  blue:    'bg-blue-500',
}
</script>
