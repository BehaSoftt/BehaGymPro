<template>
  <div class="relative group/scroll-container w-full h-full min-w-0 flex flex-col overflow-hidden">
    <!-- Horizontal Masks -->
    <template v-if="direction === 'horizontal'">
      <div 
        v-if="showMasks && hasLeftOverflow" 
        class="absolute left-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-r from-slate-900 to-transparent"
        :style="{ width: maskSize + 'px' }"
      ></div>
      <div 
        v-if="showMasks && hasRightOverflow" 
        class="absolute right-0 top-0 bottom-0 z-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-l from-slate-900 to-transparent"
        :style="{ width: maskSize + 'px' }"
      ></div>
    </template>

    <!-- Vertical Masks -->
    <template v-if="direction === 'vertical'">
      <div 
        v-if="showMasks && hasTopOverflow" 
        class="absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-slate-900 to-transparent"
        :style="{ height: maskSize + 'px' }"
      ></div>
      <div 
        v-if="showMasks && hasBottomOverflow" 
        class="absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-t from-slate-900 to-transparent"
        :style="{ height: maskSize + 'px' }"
      ></div>
    </template>

    <!-- Scroll Area -->
    <div 
      ref="scrollRef"
      class="base-scroll-area w-full h-full transition-all"
      :class="[
        direction === 'horizontal' ? 'flex items-center overflow-x-auto overflow-y-hidden' : 'overflow-y-auto block',
        direction === 'vertical' && !allowX ? 'overflow-x-hidden' : 'overflow-x-auto',
        accentClasses[accent] || accentClasses.rose,
        dragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        scrollbar ? (direction === 'horizontal' ? 'pb-2' : 'pr-2') : 'no-scrollbar'
      ]"
      @wheel="handleWheel"
      @mousedown="onMouseDown"
      @mouseleave="onMouseLeave"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @scroll="onScroll"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  direction: { type: String, default: 'horizontal' }, // horizontal | vertical
  accent: { type: String, default: 'rose' },
  maskSize: { type: Number, default: 40 },
  showMasks: { type: Boolean, default: true },
  scrollbar: { type: Boolean, default: false },
  allowX: { type: Boolean, default: false }, // Allow horizontal overflow even in vertical mode
  wheelMultiplier: { type: Number, default: 1 }
})

const scrollRef = ref(null)
const hasLeftOverflow = ref(false)
const hasRightOverflow = ref(false)
const hasTopOverflow = ref(false)
const hasBottomOverflow = ref(false)
const dragging = ref(false)

let startX = 0
let startY = 0
let scrollLeftStart = 0
let scrollTopStart = 0

const accentClasses = {
  rose: 'hover:scrollbar-rose',
  emerald: 'hover:scrollbar-emerald',
  indigo: 'hover:scrollbar-indigo',
  amber: 'hover:scrollbar-amber',
  slate: 'hover:scrollbar-slate'
}

const checkOverflow = () => {
  if (!scrollRef.value) return
  const { scrollLeft, scrollWidth, clientWidth, scrollTop, scrollHeight, clientHeight } = scrollRef.value
  
  if (props.direction === 'horizontal') {
    hasLeftOverflow.value = scrollLeft > 5
    hasRightOverflow.value = scrollLeft < scrollWidth - clientWidth - 5
  } else {
    hasTopOverflow.value = scrollTop > 5
    hasBottomOverflow.value = scrollTop < scrollHeight - clientHeight - 5
  }
}

const onScroll = () => {
  checkOverflow()
}

const handleWheel = (e) => {
  if (!scrollRef.value) return
  // Redirect wheel only for horizontal scroll if vertical movement is dominant
  if (props.direction === 'horizontal' && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    scrollRef.value.scrollLeft += (e.deltaY * props.wheelMultiplier)
  }
}

const onMouseDown = (e) => {
  dragging.value = true
  startX = e.pageX - scrollRef.value.offsetLeft
  startY = e.pageY - scrollRef.value.offsetTop
  scrollLeftStart = scrollRef.value.scrollLeft
  scrollTopStart = scrollRef.value.scrollTop
}

const onMouseLeave = () => {
  dragging.value = false
}

const onMouseUp = () => {
  dragging.value = false
}

const onMouseMove = (e) => {
  if (!dragging.value) return
  e.preventDefault()
  
  // Vertical Drag
  if (props.direction === 'vertical') {
    const y = e.pageY - scrollRef.value.offsetTop
    const walkY = (y - startY) * 2
    scrollRef.value.scrollTop = scrollTopStart - walkY
  }
  
  // Horizontal Drag (Always available if direction is horizontal OR if allowX is true in vertical mode)
  if (props.direction === 'horizontal' || props.allowX) {
    const x = e.pageX - scrollRef.value.offsetLeft
    const walkX = (x - startX) * 2
    scrollRef.value.scrollLeft = scrollLeftStart - walkX
  }
}

const observer = new ResizeObserver(() => {
  nextTick(checkOverflow)
})

onMounted(() => {
  nextTick(checkOverflow)
  if (scrollRef.value) {
    observer.observe(scrollRef.value)
    const inner = scrollRef.value.firstElementChild
    if (inner) observer.observe(inner)
  }
})

onUnmounted(() => {
  observer.disconnect()
})

defineExpose({
  scrollRef,
  checkOverflow
})
</script>

<style scoped>
.base-scroll-area {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.base-scroll-area:hover {
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

/* Chrome, Edge, Safari */
.base-scroll-area::-webkit-scrollbar {
  width: 2px;
  height: 2px;
  transition: all 0.3s ease;
}

.base-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.base-scroll-area::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}

.base-scroll-area:hover::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, rgba(225, 29, 72, 0.4));
}

.no-scrollbar::-webkit-scrollbar {
  display: none !important;
}

/* Accent Variables */
.hover\:scrollbar-rose { --scrollbar-thumb: #e11d48; }
.hover\:scrollbar-emerald { --scrollbar-thumb: #10b981; }
.hover\:scrollbar-indigo { --scrollbar-thumb: #6366f1; }
.hover\:scrollbar-amber { --scrollbar-thumb: #f59e0b; }
.hover\:scrollbar-slate { --scrollbar-thumb: #475569; }

/* Ensure horizontal children don't shrink */
.base-scroll-area.overflow-x-auto :deep(> *) {
  flex-shrink: 0;
}
</style>
