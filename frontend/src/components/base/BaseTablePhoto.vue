<template>
  <div class="w-10 h-10 bg-slate-950 border border-slate-700 flex items-center justify-center text-sm font-medium text-amber-400 overflow-hidden shadow-lg relative group">
    <img v-if="src" :src="src" class="w-full h-full object-cover" />
    <span v-else>{{ initials }}</span>
    
    <!-- Selection Checkmark -->
    <div v-if="selected" class="absolute inset-0 bg-rose-600/60 flex items-center justify-center z-[15] scale-100 transition-all">
      <Check class="w-5 h-5 text-white" />
    </div>

    <!-- Hover Magnifier -->
    <div v-if="src && !selected" class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10" @click.stop="showModal = true">
      <Search class="w-5 h-5 text-white hover:text-amber-500 transition-colors cursor-pointer" />
    </div>

    <!-- Full Size Preview Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm" @click="showModal = false">
        <div class="relative w-[350px] flex flex-col items-center gap-4" @click.stop>
          <div class="w-[350px] h-[350px] bg-slate-900 border border-slate-700 p-2 shadow-2xl">
           <img :src="src" class="w-full h-full object-cover" />
          </div>
          
          <BaseActionFooter local>
            <BaseButton variant="dark" size="icon" square @click="showModal = false" title="KAPAT">
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>
          </BaseActionFooter>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Check, Search, X } from 'lucide-vue-next'
import BaseActionFooter from './BaseActionFooter.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  src: { type: String, default: null },
  initials: { type: String, default: '?' },
  selected: { type: Boolean, default: false }
})

const showModal = ref(false)
</script>
