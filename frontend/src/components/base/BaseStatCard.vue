<template>
  <div 
    :class="[
      'px-8 py-5 relative overflow-hidden group shadow-xl border border-white/5 transition-transform hover:scale-[1.02] duration-500 select-none cursor-default',
      variants[variant] || variants.default
    ]"
  >
    <!-- Background Icon (Decorative) -->
    <div v-if="$slots.icon" class="absolute -right-2 -bottom-2 opacity-20 group-hover:scale-125 transition-transform duration-500">
      <slot name="icon"></slot>
    </div>

    <!-- Label -->
    <span :class="['block text-ui-label font-ui-normal uppercase tracking-ui mb-2', labelColors[variant] || labelColors.default]">
      {{ label }}
    </span>

    <!-- Content Row -->
    <div class="flex items-baseline gap-3">
      <span class="text-4xl font-black text-white tracking-tighter drop-shadow-lg drop-shadow-rose-900/40">{{ value }}</span>
      <span v-if="unit" :class="['text-ui-label font-ui-normal uppercase tracking-ui', unitColors[variant] || unitColors.default]">
        {{ unit }}
      </span>
    </div>

    <!-- Extra Subtitle / Mini Stats -->
    <div v-if="subtitle" class="mt-4 flex items-center gap-2 text-ui-label font-ui-normal uppercase tracking-ui text-white/50 border-t border-white/5 pt-3">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  unit: String,
  subtitle: String,
  variant: { type: String, default: 'default' } // primary, success, danger, warning, indigo, default
})

const variants = {
  primary: 'bg-rose-500/10 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
  success: 'bg-emerald-600/10 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  danger: 'bg-rose-700/10 border-2 border-rose-600 shadow-[0_0_15px_rgba(190,18,60,0.2)]',
  warning: 'bg-amber-600/10 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  indigo: 'bg-indigo-600/10 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  default: 'bg-slate-800/40 border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
}

const labelColors = {
  primary: 'text-rose-50',
  success: 'text-emerald-50',
  danger: 'text-rose-50',
  warning: 'text-amber-50',
  indigo: 'text-indigo-50',
  default: 'text-slate-400 font-bold uppercase tracking-widest'
}

const unitColors = {
  primary: 'text-rose-100',
  success: 'text-emerald-100',
  danger: 'text-rose-100',
  warning: 'text-amber-100',
  indigo: 'text-indigo-100',
  default: 'text-slate-500'
}
</script>
