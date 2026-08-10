<template>
  <span 
    :class="[
      'inline-flex items-center justify-center px-2 py-0.5 border text-ui-badge font-ui-normal tracking-ui',
      typeStyles[type] || typeStyles.default
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'default' } // success, danger, warning, info, default
})

const typeStyles = {
  success: 'text-emerald-400 border-2 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)] rounded-lg font-black',
  danger: 'text-rose-400 border-2 border-rose-500/40 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.2)] rounded-lg font-black',
  warning: 'text-amber-400 border-2 border-amber-500/40 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)] rounded-lg font-black',
  info: 'text-sky-400 border-2 border-sky-500/40 bg-sky-500/10 shadow-[0_0_12px_rgba(59,130,246,0.2)] rounded-lg font-black',
  default: 'text-slate-400 border-2 border-slate-700 bg-slate-800/50 rounded-lg'
}
</script>
