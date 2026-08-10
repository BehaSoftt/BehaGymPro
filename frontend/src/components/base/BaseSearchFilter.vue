<template>
  <div class="flex-none px-0.5 py-0.5 select-none bg-slate-950/20 border-b border-slate-800/20 w-full relative">
    <div class="flex flex-col gap-0.5">
      <div class="flex items-stretch justify-between gap-0.5 h-11">
        
        <!-- Search Input Area -->
        <div 
          class="relative flex-1 bg-slate-950/50 backdrop-blur-xl border-2 flex items-center group transition-all duration-500 rounded-xl"
          :class="[ accentuatedBorder, accentuatedDefaultBorder ]"
        >
          <!-- Custom slot for left filters or dropdowns -->
          <div v-if="$slots['extra-left']" class="flex-none h-full border-r border-slate-800/50">
            <slot name="extra-left"></slot>
          </div>
          
          <div v-else class="pl-2.5 h-full flex items-center">
             <Search 
               class="w-3.5 h-3.5 transition-all duration-300 pointer-events-none z-10" 
               :class="searchQuery ? accentuatedIcon : 'text-slate-600 group-hover:text-slate-500'"
             />
          </div>

          <!-- Input Field -->
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text" 
            :placeholder="placeholder"
            class="flex-1 h-full bg-transparent pl-2 pr-8 text-[0.65rem] placeholder:text-slate-700 outline-none text-slate-200 font-bold tracking-[0.02em] focus:tracking-[0.1em] transition-all relative z-10" 
          />

          <!-- Clear Search Button -->
          <button 
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            type="button"
            class="absolute right-1 w-6 h-6 flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all z-20"
          >
            <X class="w-3 h-3" />
          </button>

          <!-- Focus Bottom Indicator -->
          <div 
            class="absolute bottom-0 left-0 h-[1px] transition-all duration-500 opacity-0 group-focus-within:opacity-100 group-focus-within:w-full w-0 z-20"
            :class="accentuatedBg"
          ></div>
        </div>
        
        <!-- View Toggle Cluster -->
        <div 
          v-if="showToggles"
          class="flex items-stretch bg-slate-950/50 backdrop-blur-xl border-2 p-1 gap-1 rounded-xl transition-all duration-500"
          :class="[ accentuatedDefaultBorder, accentuatedDefaultShadow ]"
        >
          <button 
            @click="$emit('update:viewMode', 'grid')" 
            type="button"
            :class="[
              viewMode === 'grid' 
                ? [accentuatedBg, 'text-white shadow-sm'] 
                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
            ]" 
            class="w-8 h-full flex items-center justify-center transition-all duration-300 relative group/btn"
            title="KART GÖRÜNÜMÜ"
          >
            <LayoutGrid class="w-3.5 h-3.5 relative z-10" />
          </button>

          <div class="w-px h-1/3 bg-slate-800 self-center opacity-30"></div>

          <button 
            @click="$emit('update:viewMode', 'list')" 
            type="button"
            :class="[
              viewMode === 'list' 
                ? [accentuatedBg, 'text-white shadow-sm'] 
                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
            ]" 
            class="w-8 h-full flex items-center justify-center transition-all duration-300 relative group/btn"
            title="LİSTE GÖRÜNÜMÜ"
          >
            <List class="w-3.5 h-3.5 relative z-10" />
          </button>

          <div v-if="$slots['extra-actions']" class="flex items-stretch gap-0.5 h-full pl-0.5 border-l border-slate-800/50">
             <slot name="extra-actions"></slot>
          </div>

          <!-- Filter Toggle Button -->
          <template v-if="hasDetailedFilters">
            <div class="w-px h-1/3 bg-slate-800 self-center opacity-30"></div>
            <button 
              @click="$emit('update:isFilterOpen', !isFilterOpen)" 
              type="button"
              :class="[
                isFilterOpen 
                  ? [accentuatedBg, 'text-white shadow-sm'] 
                  : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
              ]" 
              class="w-8 h-full flex items-center justify-center transition-all duration-300 relative group/btn"
              title="DETAYLI FİLTRELER"
            >
              <SlidersHorizontal class="w-3.5 h-3.5 relative z-10" />
            </button>
          </template>
        </div>
      </div>

      <!-- Detailed Filter Area (Toggleable) -->
      <Transition name="filter-slide">
        <BaseFilter 
          v-if="hasDetailedFilters && isFilterOpen" 
          :accent="accent"
          class="mt-1"
        >
          <slot name="detailed-filters"></slot>
        </BaseFilter>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { Search, LayoutGrid, List, X, SlidersHorizontal } from 'lucide-vue-next'
import BaseFilter from './BaseFilter.vue'

const slots = useSlots()
const props = defineProps({
  searchQuery: { type: String, default: '' },
  viewMode: { type: String, default: 'grid' },
  isFilterOpen: { type: Boolean, default: false },
  placeholder: { type: String, default: 'ARA...' },
  showToggles: { type: Boolean, default: true },
  accent: { type: String, default: 'indigo' }
})

const hasDetailedFilters = computed(() => !!slots['detailed-filters'])

const accentuatedBorder = computed(() => {
  const borders = {
    rose: 'focus-within:border-rose-500/80 focus-within:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    indigo: 'focus-within:border-indigo-500/80 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    emerald: 'focus-within:border-emerald-500/80 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    amber: 'focus-within:border-amber-500/80 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    purple: 'focus-within:border-purple-500/80 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    sky: 'focus-within:border-sky-500/80 focus-within:shadow-[0_0_20px_rgba(14,165,233,0.4)]'
  }
  return borders[props.accent] || borders.rose
})

const accentuatedDefaultBorder = computed(() => {
  const borders = {
    rose: 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    amber: 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    purple: 'border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    sky: 'border-sky-500/30 hover:border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.1)]'
  }
  return borders[props.accent] || borders.indigo
})

const accentuatedDefaultShadow = computed(() => {
  const shadows = {
    rose: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    indigo: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    emerald: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    amber: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    sky: 'shadow-[0_0_15px_rgba(14,165,233,0.15)]'
  }
  return shadows[props.accent] || shadows.indigo
})

const accentuatedIcon = computed(() => {
  const icons = {
    rose: 'text-rose-500',
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    sky: 'text-sky-400'
  }
  return icons[props.accent] || icons.rose
})

const accentuatedBg = computed(() => {
  const bgs = {
    rose: 'bg-rose-600',
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    purple: 'bg-purple-600',
    sky: 'bg-sky-600'
  }
  return bgs[props.accent] || bgs.rose
})

defineEmits(['update:searchQuery', 'update:viewMode', 'update:isFilterOpen', 'reset', 'apply'])
</script>

<style scoped>
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 500px;
  opacity: 1;
}

.filter-slide-enter-from,
.filter-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
