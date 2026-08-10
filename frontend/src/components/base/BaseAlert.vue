<template>
  <Transition name="alert-fade">
    <div 
      v-if="visible"
      :class="[
        'flex items-start gap-4 p-4 border relative group overflow-hidden',
        typeStyles[type] || typeStyles.info
      ]"
    >
      <!-- Decorative background icon -->
      <div class="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12">
        <component :is="iconComponent" class="w-16 h-16" />
      </div>

      <!-- Icon -->
      <div class="shrink-0 mt-0.5">
        <component :is="iconComponent" class="w-5 h-5" />
      </div>

      <!-- Content -->
      <div class="flex-1 space-y-1">
        <h4 v-if="title" class="text-ui-label font-ui-normal uppercase tracking-ui">{{ title }}</h4>
        <div class="text-ui-label font-ui-normal uppercase tracking-ui leading-relaxed opacity-90">
          <slot></slot>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        v-if="closable" 
        @click="close"
        class="shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  AlertCircle, CheckCircle2, Info, AlertTriangle, X 
} from 'lucide-vue-next'

const props = defineProps({
  type: { type: String, default: 'info' }, // success, error, warning, info
  title: String,
  closable: Boolean
})

const visible = ref(true)

const typeStyles = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]',
  error: 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.05)]',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]',
  info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
}

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success': return CheckCircle2
    case 'error': return AlertCircle
    case 'warning': return AlertTriangle
    default: return Info
  }
})

const close = () => {
  visible.value = false
}
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.3s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
