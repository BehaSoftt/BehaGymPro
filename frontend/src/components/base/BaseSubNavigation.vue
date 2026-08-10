<template>
  <div 
    class="shrink-0 h-[70px] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40 relative group"
    :class="[`border-b-${accent}-500/20`]"
  >
    <!-- Accent Line (Top) -->
    <div 
      class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-700"
      :class="[`text-${accent}-500 shadow-[0_0_15px_rgba(var(--color-${accent}),0.5)]`]"
    ></div>

    <div class="flex items-center gap-4">
      <!-- Glow Icon Container -->
      <div 
        v-if="icon" 
        class="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl bg-slate-900/50 shadow-inner group-hover:scale-110 transition-transform duration-500"
      >
        <component :is="icon" class="w-5 h-5" :class="[`text-${accent}-400 drop-shadow-[0_0_8px_rgba(var(--color-${accent}),0.4)]`]" />
      </div>

      <div class="flex flex-col">
        <h2 class="text-[0.75rem] md:text-[0.85rem] font-black text-white uppercase tracking-[0.2em] italic leading-tight drop-shadow-sm">{{ title }}</h2>
        <p v-if="subtitle" class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-[0.25em] mt-0.5">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Actions Area -->
    <div class="flex items-center gap-3">
      <slot name="actions"></slot>
      
      <!-- Default Back Button if onBack is provided -->
      <button 
        v-if="onBack" 
        @click="onBack" 
        class="w-8 h-8 flex items-center justify-center bg-slate-900 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all rounded-lg active:scale-95"
        title="Geri Dön"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: Object, default: null },
  accent: { type: String, default: 'indigo' },
  onBack: { type: Function, default: null }
})
</script>

<style scoped>
/* Inject CSS variables for Tailwind dynamic mapping if needed, 
   but we'll assume the standard Tailwind colors are available.
   Indigo: 99, 102, 241
   Rose: 244, 63, 94
   Emerald: 16, 185, 129
   Amber: 245, 158, 11
*/
.border-b-indigo-500\/20 { border-bottom-color: rgba(99, 102, 241, 0.2); }
.border-b-rose-500\/20 { border-bottom-color: rgba(244, 63, 94, 0.2); }
.border-b-emerald-500\/20 { border-bottom-color: rgba(16, 185, 129, 0.2); }
.border-b-amber-500\/20 { border-bottom-color: rgba(245, 158, 11, 0.2); }

.text-indigo-400 { color: #818cf8; }
.text-rose-400 { color: #fb7185; }
.text-emerald-400 { color: #34d399; }
.text-amber-400 { color: #fbbf24; }

.text-indigo-500 { color: #6366f1; }
.text-rose-500 { color: #f43f5e; }
.text-emerald-500 { color: #10b981; }
.text-amber-500 { color: #f59e0b; }
</style>
