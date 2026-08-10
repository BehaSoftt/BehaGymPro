<template>
  <div 
    class="w-full h-full bg-slate-950/50 backdrop-blur-xl border-2 rounded-3xl relative overflow-hidden group transition-all duration-500"
    :class="[accentClasses.container]"
  >
    <!-- Main Table Area with Internal Scroll -->
    <BaseScroll direction="vertical" :accent="accent" :maskSize="40" allowX class="h-full">
      <table class="w-full text-left border-collapse min-w-full relative">
        <!-- Sticky Header -->
        <thead v-if="!hideHeader" class="sticky top-0 z-[30]">
          <tr class="text-ui-table-head font-ui-normal text-white tracking-ui">
            <th v-for="col in columns" :key="col.key" 
                :style="{ 
                  width: col.width, 
                  textAlign: col.align || 'left',
                  fontSize: 'var(--ui-font-size-table-head, 11px)',
                  fontFamily: 'var(--ui-font-main)',
                  fontWeight: 'var(--ui-font-weight-bold, 600)',
                  letterSpacing: 'var(--ui-letter-spacing, 0.15em)',
                  backgroundColor: 'var(--ui-table-header-bg, rgba(2,6,23,0.98))',
                  paddingTop: 'var(--ui-table-header-py, 22px)',
                  paddingBottom: 'var(--ui-table-header-py, 22px)',
                }"
                :class="[col.class || '', 'backdrop-blur-xl border-b-2 shadow-lg px-6 border-r last:border-r-0 whitespace-nowrap transition-all duration-500', accentClasses.header]">
              <slot :name="'header-'+col.key" :column="col">
                {{ col.label }}
              </slot>
            </th>
          </tr>
        </thead>
        
        <!-- Data Rows -->
        <tbody>
          <tr 
            v-for="(item, idx) in items" 
            :key="idx" 
            class="transition-all duration-300 cursor-pointer group/row"
            :style="{
              backgroundColor: isRowSelected(item)
                ? accentStyles.selectedBg
                : hoveredRow === idx
                  ? 'var(--ui-table-row-hover-bg, rgba(30,41,59,0.5))'
                  : 'var(--ui-table-row-bg, transparent)'
            }"
            @mouseenter="hoveredRow = idx"
            @mouseleave="hoveredRow = null"
            @click="$emit('rowClick', item)"
          >
            <td v-for="col in columns" :key="col.key" 
                :style="{ 
                  textAlign: col.align || 'left',
                  fontSize: 'var(--ui-table-cell-fs, 11px)',
                  fontFamily: 'var(--ui-font-main)',
                  fontWeight: 'var(--ui-font-weight, 500)',
                  letterSpacing: 'var(--ui-letter-spacing, 0.05em)',
                  paddingTop: 'var(--ui-table-row-py, 20px)',
                  paddingBottom: 'var(--ui-table-row-py, 20px)',
                  borderBottom: `1px solid ${accentStyles.rowBorder}`,
                  borderRight: `1px solid ${accentStyles.colDivider}`,
                }"
                :class="[col.class || '', 'px-6 last:border-r-0 transition-colors duration-300 group-hover/row:border-b-indigo-500/50']">
              <slot :name="'cell-'+col.key" :item="item" :value="item[col.key]">
                <span class="text-ui-input font-bold text-slate-200 tracking-tight uppercase group-hover/row:text-white transition-colors">{{ item[col.key] || '-' }}</span>
              </slot>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="!loading && items.length === 0">
            <td :colspan="columns?.length || 1" class="px-6 py-20 text-center border-2 border-dashed border-slate-800 bg-slate-950/20 select-none opacity-50">
              <div class="flex flex-col items-center gap-4">
                <LayoutList class="w-12 h-12 text-slate-700" />
                <p class="text-xs font-black text-slate-500 tracking-[0.3em]">{{ emptyText }}</p>
                <p class="text-[0.6rem] text-slate-700 tracking-widest">{{ emptySubtext }}</p>
              </div>
            </td>
          </tr>
        </tbody>
        
        <!-- Optional Footer Slot (Totals, etc.) -->
        <tfoot v-if="$slots.footer" class="sticky bottom-0 z-[25] bg-slate-900 border-t-2 shadow-2xl" :class="[accentClasses.footer]">
           <slot name="footer"></slot>
        </tfoot>
      </table>
      <!-- Tablo sonu boşluğu -->
      <div class="h-20 w-full"></div>
    </BaseScroll>

    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-md flex items-center justify-center animate-in fade-in transition-all">
      <div class="flex flex-col items-center gap-4">
        <Loader2 class="w-10 h-10 animate-spin shadow-2xl" :class="[accentClasses.loader]" />
        <p class="text-[0.65rem] font-black tracking-widest text-slate-300">VERİLER YÜKLENİYOR</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { LayoutList, Loader2 } from 'lucide-vue-next'
import BaseScroll from './BaseScroll.vue'

const props = defineProps({
  accent:      { type: String, default: 'rose' },
  columns:     { type: Array,  required: true }, // [{ key, label, class, width, align }]
  items:       { type: Array,  required: true },
  loading:     { type: Boolean, default: false },
  selectedId:  { type: [String, Number], default: null },   // single selection
  selectedIds: { type: Array, default: () => [] } ,          // multi-selection (array of ids)
  emptyText:   { type: String, default: 'HİÇBİR KAYIT BULUNAMADI' },
  emptySubtext: { type: String, default: 'Arama filtrenizi değiştirerek tekrar deneyin.' },
  hideHeader: { type: Boolean, default: false }
})

defineEmits(['rowClick', 'toggle-selection'])

const hoveredRow = ref(null)

const accentClasses = computed(() => {
  const themes = {
    rose: {
      container: 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/50',
      header: 'border-b-rose-500 shadow-rose-500/20 border-r-rose-500/10',
      footer: 'border-t-rose-500 shadow-rose-500/30',
      loader: 'text-rose-500'
    },
    indigo: {
      container: 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/50',
      header: 'border-b-indigo-500 shadow-indigo-500/20 border-r-indigo-500/10',
      footer: 'border-t-indigo-500 shadow-indigo-500/30',
      loader: 'text-indigo-500'
    },
    emerald: {
      container: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/50',
      header: 'border-b-emerald-500 shadow-emerald-500/20 border-r-emerald-500/10',
      footer: 'border-t-emerald-500 shadow-emerald-500/30',
      loader: 'text-emerald-500'
    },
    amber: {
      container: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/50',
      header: 'border-b-amber-500 shadow-amber-500/20 border-r-amber-500/10',
      footer: 'border-t-amber-500 shadow-amber-500/30',
      loader: 'text-amber-400'
    },
    purple: {
      container: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/50',
      header: 'border-b-purple-500 shadow-purple-500/20 border-r-purple-500/10',
      footer: 'border-t-purple-500 shadow-purple-500/30',
      loader: 'text-purple-500'
    }
  }
  return themes[props.accent] || themes.indigo
})

const accentStyles = computed(() => {
  const colors = {
    rose: { rowBorder: 'rgba(244,63,94,0.3)', colDivider: 'rgba(244,63,94,0.1)', selectedBg: 'rgba(244,63,94,0.15)' },
    indigo: { rowBorder: 'rgba(99,102,241,0.3)', colDivider: 'rgba(99,102,241,0.1)', selectedBg: 'rgba(99,102,241,0.15)' },
    emerald: { rowBorder: 'rgba(16,185,129,0.3)', colDivider: 'rgba(16,185,129,0.1)', selectedBg: 'rgba(16,185,129,0.15)' },
    amber: { rowBorder: 'rgba(245,158,11,0.3)', colDivider: 'rgba(245,158,11,0.1)', selectedBg: 'rgba(245,158,11,0.15)' },
    purple: { rowBorder: 'rgba(168,85,247,0.3)', colDivider: 'rgba(168,85,247,0.1)', selectedBg: 'rgba(168,85,247,0.15)' }
  }
  return colors[props.accent] || colors.indigo
})

// Check if a row is selected (supports both single and multi selection)
const isRowSelected = (item) => {
  if (props.selectedIds?.length) return props.selectedIds.includes(item.id)
  if (props.selectedId != null) return item.id === props.selectedId
  return false
}
</script>

<style scoped>
.h-20 {
    height: 30rem;
}
</style>
