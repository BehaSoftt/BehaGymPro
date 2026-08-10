<template>
  <Teleport v-if="targetExists" to="#action-sidebar-target">
    <div class="w-16 h-full bg-slate-950/40 backdrop-blur-md border-l border-slate-800 flex flex-col items-center py-4 gap-4 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-300">
      <slot></slot>
      
      <!-- Top actions slot -->
      <div class="flex flex-col gap-2">
        <slot name="top"></slot>
      </div>

      <div class="flex-1"></div>

      <!-- Bottom actions slot -->
      <div class="flex flex-col gap-2 mb-4">
        <slot name="bottom"></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const targetExists = ref(false)

onMounted(async () => {
  await nextTick()
  targetExists.value = !!document.querySelector('#action-sidebar-target')
})
</script>
