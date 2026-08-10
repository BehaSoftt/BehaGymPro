<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 font-ui-normal text-ui-button tracking-ui',
      currentVariantStyle,
      sizeStyles[size],
      square ? 'aspect-square' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <component v-if="loading" :is="Loader2" class="w-4 h-4 animate-spin" />
    <component v-else-if="autoIcon" :is="autoIcon" :class="size === 'icon-sm' ? 'w-4 h-4' : 'w-5 h-5'" />
    <slot v-else name="icon"></slot>
    <slot v-if="!square"></slot>
  </button>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { Loader2, ArrowLeft, X } from 'lucide-vue-next'

const props = defineProps({
  type:     { type: String, default: 'button' },
  variant:  { type: String, default: 'primary' }, // primary, secondary, danger, success, dark, ghost, toggle-on, toggle-off
  size:     { type: String, default: 'md' },       // sm, md, lg, icon, icon-sm
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  square:   { type: Boolean, default: false },
  // toggle variant helpers — pass :active="member.isActive" + variant="toggle"
  active:   { type: Boolean, default: null }
})

defineEmits(['click'])

const attrs = useAttrs()
const autoIcon = computed(() => {
  if (attrs.title === 'GERİ') return ArrowLeft
  if (attrs.title === 'İPTAL') return X
  return null
})

const variantStyles = {
  primary:    'bg-sky-500/10 hover:bg-sky-500/30 text-sky-400 border-2 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]',
  secondary:  'bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]',
  success:    'bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]',
  danger:     'bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] font-black',
  warning:    'bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] font-black',
  violet:     'bg-violet-500/10 hover:bg-violet-500/30 text-violet-400 border-2 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]',
  dark:       'bg-slate-900 border-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all',
  ghost:      'bg-transparent text-slate-500 hover:text-white hover:bg-white/5 border-2 border-transparent hover:border-white/10 transition-all',
  // Toggle: green when active, dimmed when inactive
  'toggle-on':  'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  'toggle-off': 'bg-slate-950 hover:bg-slate-900 text-slate-600 hover:text-slate-400 border-2 border-slate-800',
}

// If variant="toggle" + :active prop, auto-pick toggle-on / toggle-off
const currentVariantStyle = computed(() => {
  if (props.variant === 'toggle') {
    return props.active ? variantStyles['toggle-on'] : variantStyles['toggle-off']
  }
  return variantStyles[props.variant] || variantStyles.primary
})

const sizeStyles = {
  sm:       'px-3 py-1.5',
  md:       'px-5 py-2.5',
  lg:       'px-8 py-3.5',
  icon:     'w-[30px] h-[30px] p-0',
  'icon-sm':'w-[24px] h-[24px] p-0'
}
</script>
