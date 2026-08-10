<template>
  <div class="bg-slate-950/60 backdrop-blur-xl border-2 border-blue-500/30 p-5 shadow-[0_0_25px_rgba(59,130,246,0.1)] relative overflow-hidden group/filter-area rounded-2xl">
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
    
    <div class="flex flex-wrap items-end gap-5 relative z-10">
      <!-- Filter Controls Slot -->
      <div class="flex-1 flex flex-wrap items-end gap-5">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  accent: { type: String, default: 'amber' }
});
</script>

<style scoped>
/* Simplified static layout */
</style>
