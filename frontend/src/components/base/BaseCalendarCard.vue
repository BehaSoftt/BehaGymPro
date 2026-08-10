<template>
  <div 
    class="absolute left-1 right-1 p-2.5 border-l-[4px] rounded-sm shadow-xl cursor-pointer group transition-all duration-300 flex flex-col active:scale-95"
    :class="[
      isActive ? cardTheme.bg : 'bg-slate-900/40 border-slate-800/50 opacity-60 grayscale-[0.8] shadow-none',
      isActive ? cardTheme.border : 'hover:border-slate-700',
      isActive ? cardTheme.shadow : '',
      { 'hover:-translate-y-1 hover:shadow-2xl z-20': isActive, 'z-10': !isActive }
    ]"
    :style="cardStyle"
  >
    <!-- Background Glow Effect (Vibrant) -->
    <div v-if="isActive" class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      :class="cardTheme.glow">
    </div>

    <!-- Time & Status -->
    <div class="flex items-center justify-between mb-2 min-h-[16px] relative z-10">
      <div class="flex items-center gap-1.5 overflow-hidden">
        <Clock class="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        <span class="shrink-0 text-[0.6rem] font-black text-slate-400 font-mono tracking-tighter group-hover:text-white transition-colors">
          {{ startTime }} - {{ endTime }}
        </span>
      </div>
      
      <div v-if="!isActive" class="shrink-0 px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-500 text-[0.45rem] font-black uppercase rounded-[2px] tracking-widest">
        PASİF
      </div>
      <div v-else-if="attendanceStatus === 'INSIDE'" class="shrink-0 px-2 py-0.5 bg-amber-600 text-white text-[0.45rem] font-black uppercase rounded-[2px] tracking-widest animate-pulse border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
        İÇERİDE
      </div>
      <div v-else-if="attendanceStatus === 'COMPLETED' || attendanceStatus === 'PRESENT'" class="shrink-0 px-2 py-0.5 bg-emerald-600 text-white text-[0.45rem] font-black uppercase rounded-[2px] tracking-widest border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
        TAMAMLANDI
      </div>
      <div v-else-if="attendanceStatus === 'EARLY_EXIT'" class="shrink-0 px-2 py-0.5 bg-rose-600 text-white text-[0.45rem] font-black uppercase rounded-[2px] tracking-widest border border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.5)]">
        ERKEN ÇIKTI
      </div>
      <div v-else-if="attendanceStatus === 'PENDING'" class="shrink-0 px-2 py-0.5 bg-slate-700 text-slate-300 text-[0.45rem] font-black uppercase rounded-[2px] tracking-widest border border-slate-600 shadow-[0_0_5px_rgba(0,0,0,0.3)]">
        BEKLİYOR
      </div>
      <div v-else class="shrink-0 w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" :class="cardTheme.text"></div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-10">
      <div class="flex flex-col mb-1.5 gap-1.5 group-hover:translate-x-0.5 transition-transform duration-300">
        <h3 class="text-[0.75rem] font-black text-white uppercase tracking-wider leading-snug whitespace-pre-wrap"
          :class="{ 'group-hover:text-white': isActive }">
          {{ title }}
        </h3>
        
        <div v-if="instructor" class="flex items-center gap-1.5 overflow-hidden">
          <User class="w-2.5 h-2.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          <span class="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest truncate group-hover:text-slate-300 transition-colors">
            {{ instructor }}
          </span>
        </div>

        <div v-if="subtitle && subtitle !== title" class="flex items-center gap-1.5 overflow-hidden">
          <Activity class="w-2.5 h-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
          <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-[0.1em] truncate italic transition-colors group-hover:text-slate-400">
            {{ subtitle }}
          </span>
        </div>
      </div>

      <!-- CAPACITY PROGRESS BAR (Kıral Dokunuşu) -->
      <div v-if="capacity > 0 && (lessonType === 'GROUP' || lessonType === 'GENERAL')" class="mb-2 relative z-10">
         <div class="flex items-center justify-between mb-1 px-0.5">
            <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-tighter">DOLULUK: {{ currentCount }}/{{ capacity }}</span>
            <span :class="currentCount >= capacity ? 'text-rose-500' : 'text-amber-500/70'" class="text-[0.45rem] font-black uppercase tracking-tighter">
               %{{ Math.round((currentCount / capacity) * 100) }}
            </span>
         </div>
         <div class="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/30">
            <div 
              class="h-full transition-all duration-1000 ease-out rounded-full"
              :class="[
                currentCount >= capacity ? 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 
                currentCount >= (capacity * 0.8) ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 
                'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              ]"
              :style="{ width: `${Math.min(100, (currentCount / capacity) * 100)}%` }"
            ></div>
         </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-auto flex items-center justify-between pt-1 relative z-10">
        <span 
          class="text-[0.5rem] font-black px-2 py-0.5 border rounded-[2px] uppercase tracking-widest transition-all duration-300"
          :class="isActive ? cardTheme.badge : 'bg-slate-950 border-slate-800 text-slate-600'"
        >
          {{ typeLabel }}
        </span>
        
        <div v-if="capacity" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 text-slate-500">
          <Users class="w-2.5 h-2.5" />
          <span class="text-[0.55rem] font-black font-mono tracking-tighter">{{ capacity }}</span>
        </div>
      </div>
    </div>

    <!-- Corner Decoration (Subtle) -->
    <div v-if="isActive" class="absolute -right-2 -bottom-2 w-8 h-8 opacity-10 group-hover:opacity-30 transition-all duration-700"
      :class="cardTheme.text">
      <component :is="typeIcon" class="w-full h-full" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Clock, User, Activity, Users, Star, LayoutGrid, Dumbbell } from 'lucide-vue-next';

const props = defineProps({
  lessonType: { type: String, required: true }, // PRIVATE, GROUP, GENERAL
  isActive: { type: Boolean, default: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  title: { type: String, required: true },
  instructor: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  capacity: { type: Number, default: 0 },
  currentCount: { type: Number, default: 0 }, // Yeni: Mevcut doluluk
  cardStyle: { type: Object, default: () => ({}) },
  attendanceStatus: { type: String, default: null } // INSIDE, COMPLETED
});

const themes = {
  PRIVATE: {
    bg: 'bg-indigo-600/20 border-l-indigo-400 bg-gradient-to-br from-indigo-500/30 to-slate-900/60',
    border: 'border-indigo-500/30 hover:border-indigo-400/60',
    shadow: 'shadow-indigo-900/40 shadow-xl',
    text: 'text-indigo-300',
    badge: 'bg-indigo-500 border-indigo-400 text-white font-black shadow-lg shadow-indigo-900/50',
    glow: 'bg-gradient-to-br from-indigo-500/25 to-transparent',
    icon: Star
  },
  GROUP: {
    bg: 'bg-amber-600/20 border-l-amber-400 bg-gradient-to-br from-amber-500/30 to-slate-900/60',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    shadow: 'shadow-amber-900/40 shadow-xl',
    text: 'text-amber-400',
    badge: 'bg-amber-500 border-amber-400 text-amber-950 font-black shadow-lg shadow-amber-900/50',
    glow: 'bg-gradient-to-br from-amber-500/25 to-transparent',
    icon: LayoutGrid
  },
  GENERAL: {
    bg: 'bg-emerald-600/20 border-l-emerald-400 bg-gradient-to-br from-emerald-500/30 to-slate-900/60',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    shadow: 'shadow-emerald-900/40 shadow-xl',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500 border-emerald-400 text-white font-black shadow-lg shadow-emerald-900/50',
    glow: 'bg-gradient-to-br from-emerald-500/25 to-transparent',
    icon: Dumbbell
  }
};

const cardTheme = computed(() => themes[props.lessonType] || themes.GENERAL);

const typeLabel = computed(() => {
  const labels = { PRIVATE: 'ÖZEL', GROUP: 'GRUP', GENERAL: 'FİTNESS' };
  return labels[props.lessonType] || 'DERS';
});

const typeIcon = computed(() => cardTheme.value.icon);
</script>

<style scoped>
/* Standard Tailwind handles the shadows. Keeping this block for potential future card animations. */
</style>
