<template>
  <aside 
    :class="[
      modelValue ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      collapsed ? 'lg:w-[85px]' : 'lg:w-[256px]'
    ]"
    class="fixed lg:sticky lg:top-0 top-0 left-0 bg-slate-950 border-r-2 border-rose-500/40 flex flex-col z-[70] transition-all duration-300 ease-in-out shadow-[10px_0_40px_rgba(244,63,94,0.15)] h-screen lg:h-[calc(100vh-110px)]"
  >
    <!-- Mobile Close Button -->
    <div class="flex lg:hidden items-center justify-end p-4">
      <BaseButton variant="ghost" size="icon" @click="$emit('update:modelValue', false)">
        <X class="w-6 h-6 text-rose-500" />
      </BaseButton>
    </div>

    <!-- Desktop Collapse Toggle -->
    <button 
      @click="$emit('update:collapsed', !collapsed)"
      class="hidden lg:flex absolute -right-3 top-10 w-6 h-10 bg-rose-500/10 border-2 border-rose-500 items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 transition-all z-50 group shadow-[0_0_15px_rgba(244,63,94,0.3)] rounded-r-lg"
      title="Menüyü Daralt / Genişlet"
    >
      <ChevronLeft v-if="!collapsed" class="w-4 h-4 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
      <ChevronRight v-else class="w-4 h-4 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
    </button>
    
    <!-- Navigation Links -->
    <nav :class="collapsed ? 'px-2' : 'px-3'" class="flex-1 space-y-0.5 mt-2 overflow-y-auto custom-scrollbar">
      <template v-for="item in menuItems" :key="item.to || item.text">
        <div v-if="item.perm === null || hasPermission(item.perm)">
          <div 
            @click="collapsed ? $emit('update:collapsed', false) : (item.subItems ? (expandedMenus[item.text] = !expandedMenus[item.text]) : navigate(item.to))"
            :title="item.text"
            :class="[
              collapsed ? 'justify-center' : 'px-3',
              (item.to && (currentPath === item.to || currentPath.startsWith(item.to + '?'))) || (item.subItems && item.subItems.some(s => currentPath === s.to || currentPath.startsWith(s.to + '?')))
                ? 'bg-rose-600/20 text-white border-l-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                : 'border-transparent text-slate-400'
            ]"
            class="flex items-center gap-3 py-2 hover:bg-slate-700/30 hover:text-white transition-all border-l-[3px] border-b border-b-rose-500/20 group cursor-pointer"
          >
            <component :is="item.icon" :class="[item.color || 'text-slate-400', 'w-4.5 h-4.5 flex-shrink-0 group-hover:drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]']" />
            <span v-if="!collapsed" class="whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.1em] transition-all group-hover:translate-x-1 flex-1">{{ item.text }}</span>
            <ChevronDown v-if="!collapsed && item.subItems" :class="{ 'rotate-180': expandedMenus[item.text] }" class="w-3.5 h-3.5 transition-all text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:text-white group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,1)] group-hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]" />
          </div>

          <!-- Sub Items -->
          <div v-if="!collapsed && item.subItems && expandedMenus[item.text]" class="ml-6 border-l border-rose-500/20 my-1 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
            <template v-for="sub in item.subItems" :key="sub.to">
              <div 
                v-if="sub.perm === null || hasPermission(sub.perm)"
                @click="navigate(sub.to)"
                :class="[
                  currentPath === sub.to 
                    ? 'text-rose-400 bg-rose-500/5' 
                    : 'text-slate-500 hover:text-slate-200'
                ]"
                class="flex items-center gap-2 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <div class="w-1 h-1 rounded-full bg-current"></div>
                {{ sub.text }}
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- Ayarlar (Settings) - Moved from bottom -->
      <div 
        v-if="hasPermission('SETTING_VIEW')"
        @click="navigate('/settings')"
        title="Ayarlar"
        :class="[
          collapsed ? 'justify-center' : 'px-3',
          currentPath === '/settings' 
            ? 'bg-rose-600/20 text-white border-l-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
            : 'border-transparent text-slate-400'
        ]"
        class="flex items-center gap-3 py-1.5 hover:bg-slate-700/30 hover:text-white transition-all border-l-[3px] border-b border-b-rose-500/20 group cursor-pointer"
      >
        <Settings class="w-4.5 h-4.5 flex-shrink-0 group-hover:drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
        <span v-if="!collapsed" class="whitespace-nowrap text-[0.7rem] font-black uppercase tracking-[0.1em] transition-all group-hover:translate-x-1">Ayarlar</span>
      </div>
    </nav>

    <!-- Sidebar Bottom (Branding) -->
    <div :class="collapsed ? 'p-1.5' : 'py-2.5 px-4'" class="border-t-2 border-rose-500/30 bg-slate-900/50 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center min-h-[45px] overflow-hidden">
      <div :class="collapsed ? 'gap-0.5' : 'gap-2'" class="flex items-center select-none" style="font-family: 'JetBrains Mono', monospace !important;">
        <span class="text-rose-600 font-black text-sm tracking-[0.3em] drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] drop-shadow-[0_0_15px_rgba(225,29,72,0.4)]">{{ collapsed ? 'B' : 'BEHA' }}</span>
        <span class="text-white font-black text-sm tracking-[0.3em] drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{{ collapsed ? 'H' : 'SOFT' }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { 
  X, ChevronLeft, ChevronRight, Settings, ChevronDown 
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from './BaseButton.vue'

const router = useRouter()
const expandedMenus = ref({})

const props = defineProps({
  modelValue: Boolean, // sidebarOpen
  collapsed: Boolean,
  menuItems: Array,
  currentPath: String,
  hasPermission: Function
})

const emit = defineEmits(['update:modelValue', 'update:collapsed', 'navigate'])

watch(() => props.currentPath, (newPath) => {
  if (props.menuItems) {
    props.menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(s => newPath === s.to)) {
        expandedMenus.value[item.text] = true
      }
    })
  }
})

onMounted(() => {
  console.log('🔵 BaseSidebar MOUNTED')
  console.log('🔵 Router:', router)
  console.log('🔵 Menu Items:', props.menuItems)
  
  // Auto expand menu if sub-item is active
  if (props.menuItems) {
    props.menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(s => props.currentPath === s.to)) {
        expandedMenus.value[item.text] = true
      }
    })
  }
})

const navigate = (path) => {
  console.log('🟢 Navigate clicked:', path)
  console.log('🟢 Router exists:', !!router)
  try {
    router.push(path)
    console.log('🟢 Router.push executed successfully')
  } catch (err) {
    console.error('🔴 Router.push error:', err)
  }
  if (window.innerWidth < 1024) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: rgba(244, 63, 94, 0.4); 
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.3);
  border-radius: 10px;
}
</style>
