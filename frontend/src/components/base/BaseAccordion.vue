<template>
  <div class="w-full flex flex-col group/accordion" :class="isOpen ? 'gap-2' : ''">
    <!-- Header -->
    <button 
      @click="toggle" 
      class="w-full flex items-center justify-between p-3 bg-slate-950 border transition-all duration-300 relative overflow-hidden focus:outline-none"
      :class="[
        isOpen ? accentClasses.header_active : accentClasses.header_inactive
      ]"
    >
      <div class="flex items-center gap-3 relative z-10 w-full overflow-hidden">
        <slot name="icon" :isOpen="isOpen"></slot>
        <span 
          class="text-[0.65rem] font-black tracking-[0.2em] transition-colors truncate uppercase" 
          :class="[
            isOpen ? 'text-white' : 'text-slate-400 group-hover/accordion:text-white'
          ]"
        >
          {{ title }}
        </span>
        <div class="flex-shrink-0 ml-auto mr-1">
            <slot name="badge" :isOpen="isOpen"></slot>
        </div>
      </div>
      
      <div class="relative z-10 p-1 flex items-center justify-center transition-all duration-300 flex-shrink-0" :class="isOpen ? accentClasses.icon_bg_active : 'group-hover/accordion:bg-slate-800'">
        <ChevronDown 
          class="w-4 h-4 transition-transform duration-300" 
          :class="[
            isOpen ? 'rotate-180 ' + accentClasses.icon_color_active : 'text-slate-500 group-hover/accordion:text-slate-300'
          ]" 
        />
      </div>
    </button>
    
    <!-- Content -->
    <div v-show="isOpen" class="animate-in fade-in slide-in-from-top-2 duration-300 ease-out" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  accent: {
    type: String,
    default: 'indigo',
    validator: (v) => ['indigo', 'rose', 'emerald', 'sky', 'amber'].includes(v)
  },
  modelValue: {
    type: Boolean,
    default: undefined
  },
  defaultOpen: {
    type: Boolean,
    default: false
  },
  contentClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'toggle'])

const internalIsOpen = ref(props.defaultOpen)

const isOpen = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalIsOpen.value,
  set: (val) => {
    internalIsOpen.value = val
    emit('update:modelValue', val)
  }
})

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

const accentConfig = {
  indigo: {
    header_active: 'border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.1)] z-10',
    header_inactive: 'border-slate-800 hover:border-indigo-500/30',
    icon_bg_active: 'bg-indigo-500/10',
    icon_color_active: 'text-indigo-400'
  },
  emerald: {
    header_active: 'border-emerald-500/50 shadow-[0_4px_20px_rgba(16,185,129,0.1)] z-10',
    header_inactive: 'border-slate-800 hover:border-emerald-500/30',
    icon_bg_active: 'bg-emerald-500/10',
    icon_color_active: 'text-emerald-400'
  },
  rose: {
    header_active: 'border-rose-500/50 shadow-[0_4px_20px_rgba(225,29,72,0.1)] z-10',
    header_inactive: 'border-slate-800 hover:border-rose-500/30',
    icon_bg_active: 'bg-rose-500/10',
    icon_color_active: 'text-rose-400'
  },
  sky: {
    header_active: 'border-sky-500/50 shadow-[0_4px_20px_rgba(14,165,233,0.1)] z-10',
    header_inactive: 'border-slate-800 hover:border-sky-500/30',
    icon_bg_active: 'bg-sky-500/10',
    icon_color_active: 'text-sky-400'
  },
  amber: {
    header_active: 'border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.1)] z-10',
    header_inactive: 'border-slate-800 hover:border-amber-500/30',
    icon_bg_active: 'bg-amber-500/10',
    icon_color_active: 'text-amber-400'
  }
}

const accentClasses = computed(() => accentConfig[props.accent])
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
