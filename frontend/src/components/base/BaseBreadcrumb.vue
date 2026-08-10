<template>
  <nav class="flex items-center gap-3 py-4 select-none" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 m-0 p-0 list-none">
      <li class="flex items-center">
        <router-link 
          to="/" 
          class="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors group shadow-lg"
          title="DASHBOARD"
        >
          <Home class="w-4 h-4 text-slate-400 group-hover:text-white" />
        </router-link>
      </li>

      <li v-for="(item, idx) in items" :key="idx" class="flex items-center gap-2">
        <ChevronRight class="w-3.5 h-3.5 text-slate-700" />
        
        <router-link 
          v-if="item.to" 
          :to="item.to"
          class="text-ui-label font-ui-normal uppercase tracking-ui text-slate-500 hover:text-white border-b border-transparent hover:border-rose-500 transition-all py-0.5"
        >
          {{ item.label }}
        </router-link>
        
        <span 
          v-else 
          class="text-ui-label font-ui-normal uppercase tracking-ui text-rose-500 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { Home, ChevronRight } from 'lucide-vue-next'

defineProps({
  items: { 
    type: Array, 
    required: true // [{ label: 'AYARLAR', to: '/settings' }, { label: 'PAKETLER' }]
  }
})
</script>
