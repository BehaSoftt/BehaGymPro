<template>
  <!-- Local mode (inside modals): render inline without Teleport -->
  <div v-if="local" class="min-h-[42px] h-auto w-full bg-slate-950/95 backdrop-blur-xl border-t-2 border-blue-500 shadow-[0_-15px_30px_rgba(59,130,246,0.2)] flex items-center relative z-[100] py-0.5">
    <!-- Animated Border Top -->
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.6)]"></div>

    <div class="w-full flex items-center justify-center gap-4 relative z-10 px-4">
      <slot name="left"></slot>
      <div class="flex items-center justify-center gap-2">
        <slot></slot>
      </div>
      <slot name="right"></slot>
    </div>
  </div>

  <!-- Teleport mode (global footer): render into #action-footer-target -->
  <template v-else>
    <Teleport v-if="targetExists" to="#action-footer-target">
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-400 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div v-if="isVisible" class="min-h-[42px] h-auto w-full bg-slate-950/95 backdrop-blur-md border-t-2 border-blue-500 shadow-[0_-15px_30px_rgba(59,130,246,0.2)] flex items-center relative group z-[100] py-0.5">
          <!-- Animated Border Top -->
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.6)]"></div>

          <div :class="['w-full flex items-center gap-4 relative z-10', fullWidth ? 'justify-between' : 'justify-center']">
            <div :class="['flex items-center gap-2', fullWidth ? 'w-full px-2' : '']">
              <slot name="left"></slot>
              <div :class="fullWidth ? 'flex-1' : 'flex items-center justify-center bg-slate-900/40 border-2 border-slate-700/50 p-1 gap-1 rounded-none shadow-[0_0_15px_rgba(0,0,0,0.5)]'">
                <slot></slot>
              </div>
              <slot name="right"></slot>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- Fallback if teleport target not found -->
    <div v-else class="min-h-[42px] h-auto w-full bg-slate-950/80 backdrop-blur-md border-t-2 border-blue-500 flex items-center relative z-[100] py-0.5">
      <div class="w-full flex items-center justify-center gap-3 relative z-10 px-4">
        <slot name="left"></slot>
        <div class="flex items-center justify-center gap-2">
          <slot></slot>
        </div>
        <slot name="right"></slot>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  // Set to true when used inside modals to render inline (no Teleport)
  local: { type: Boolean, default: false },
  // Set to true to make the footer occupy full width without the centered box
  fullWidth: { type: Boolean, default: false }
})

const targetExists = ref(false)
const isVisible = ref(false)

onMounted(async () => {
  if (props.local) return // Skip teleport check in local mode
  await nextTick()
  const target = document.querySelector('#action-footer-target')
  if (target) {
    targetExists.value = true
    setTimeout(() => {
      isVisible.value = true
    }, 50)
  }
})
</script>

<style scoped>
#action-footer-target {
  /* No min-height to prevent gap between footers when empty */
}
</style>
