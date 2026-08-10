<template>
  <Transition name="modal-fade">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-[10px] bg-slate-950/90 backdrop-blur-xl"
      @click.self="$emit('update:modelValue', false)"
    >
      <div 
        :class="[
          'bg-slate-950/95 border-2 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative flex flex-col transition-all overflow-hidden rounded-3xl',
          sizeClasses[size] || sizeClasses.md
        ]"
      >
        <!-- Modal Header -->
        <div v-if="title || subtitle || $slots.icon || !hideClose" class="px-8 py-7 border-b-2 border-rose-500/30 flex justify-between items-center bg-slate-900/50">
          <div class="flex items-center gap-4">
            <div v-if="$slots.icon" class="text-rose-500">
               <slot name="icon"></slot>
            </div>
            <div class="space-y-1">
              <h2 v-if="title" class="text-ui-modal-title font-ui-normal text-slate-50 tracking-ui">{{ title }}</h2>
               <p v-if="subtitle" class="text-ui-modal-title font-ui-normal text-slate-100 tracking-ui">{{ subtitle }}</p>
            </div>
          </div>
          <button 
            v-if="!hideClose"
            @click="$emit('update:modelValue', false)" 
            class="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 border border-white/5 active:scale-95"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
          <slot></slot>
        </div>

        <!-- Modal Footer (Optional, mostly for ActionFooter inside) -->
        <slot name="footer"></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean, // show/hide
  title: String,
  subtitle: String,
  size: { type: String, default: 'md' }, // sm, md, lg, full
  hideClose: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const sizeClasses = {
  sm: 'w-full max-w-md',
  md: 'w-full max-w-2xl',
  lg: 'w-full max-w-5xl h-[80vh]',
  full: 'w-full h-full'
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .transition-all {
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(225, 29, 72, 0.2);
}
</style>
