<template>
  <div class="relative group/avatar cursor-pointer" @click.stop="openPreview">
    <div 
      :class="[
        'bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-rose-500 shadow-lg',
        sizeClasses[size]
      ]"
    >
      <img 
        v-if="src" 
        :src="fullSrc" 
        class="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" 
      />
      <div v-else class="flex items-center justify-center h-full w-full bg-slate-900">
        <span 
          :class="[
            'font-black text-rose-500 uppercase tracking-tighter',
            textClasses[size]
          ]"
        >
          {{ name ? name[0] : '?' }}
        </span>
      </div>

      <!-- Hover Overlay -->
      <div v-if="src" class="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center z-10">
        <Search class="text-white drop-shadow-lg hover:text-amber-500 transition-colors" :class="iconClasses[size]" />
      </div>
    </div>

    <!-- Teleported Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreview" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm" @click="showPreview = false">
        <div class="relative w-[350px] flex flex-col items-center gap-4" @click.stop>
          <div class="w-[350px] h-[350px] bg-slate-900 border border-slate-700 p-2 shadow-2xl">
           <img :src="fullSrc" class="w-full h-full object-cover" />
          </div>
          
          <BaseActionFooter local>
            <BaseButton variant="dark" size="icon" square @click="showPreview = false" title="KAPAT">
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>
          </BaseActionFooter>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import BaseActionFooter from './BaseActionFooter.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  src: { type: String, default: null },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' } // sm, md, lg, xl
})

const showPreview = ref(false)

const apiBaseUrl = `http://${window.location.hostname}:5000`

const fullSrc = computed(() => {
  if (!props.src) return null
  if (props.src.startsWith('data:') || props.src.startsWith('http')) return props.src
  const path = props.src.startsWith('/') ? props.src : `/${props.src}`
  return `${apiBaseUrl}${path}`
})

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const textClasses = {
  xs: 'text-[0.5rem]',
  sm: 'text-[0.6rem]',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl'
}

const iconClasses = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
}

const openPreview = (e) => {
  if (!props.src) return
  e.stopPropagation()
  showPreview.value = true
}


</script>
