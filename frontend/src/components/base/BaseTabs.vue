<template>
  <div 
    ref="scrollContainer"
    class="flex-none flex items-center gap-1 mt-4 px-4 z-10 overflow-x-auto whitespace-nowrap pb-3 custom-red-scrollbar cursor-grab active:cursor-grabbing select-none flex-nowrap shrink-0 overflow-y-hidden"
    @mousedown="startDrag"
    @mouseleave="stopDrag"
    @mouseup="stopDrag"
    @mousemove="onDrag"
  >
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      @click="$emit('update:activeTab', tab.id)"
      :class="[
        'flex-none flex items-center gap-2.5 px-6 py-3.5 border-2 text-ui-button font-black tracking-[0.2em] uppercase transition-all active:scale-95 rounded-xl',
        activeTab === tab.id ? 'bg-indigo-500/10 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-950/40 text-slate-500 border-slate-700/50 hover:bg-slate-900 hover:text-slate-300'
      ]"
    >
      <component v-if="tab.icon" :is="tab.icon" class="w-4 h-4" />
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabs: { type: Array, required: true }, // [{ id: 'security', label: 'Güvenlik', icon: Lock }]
  activeTab: { type: String, required: true }
})

defineEmits(['update:activeTab'])

const scrollContainer = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const startDrag = (e) => {
  isDragging.value = true
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

const stopDrag = () => {
  isDragging.value = false
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 2 // Scroll speed multiplier
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
}
</script>

<style scoped>
.custom-red-scrollbar::-webkit-scrollbar { height: 3px; }
.custom-red-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-red-scrollbar::-webkit-scrollbar-thumb { background: #e11d48; border-radius: 4px; }
</style>
