<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-950 font-['Outfit']">
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Sub Navigation -->
      <BaseSubNavigation 
        :title="(specialty?.name || 'BRANŞ')?.toUpperCase() + ' - SAHA DİZİLİMLERİ'" 
        subtitle="STRATEJİK FORMASYON VE TAKTİK PLANLAMA"
        accent="indigo"
        :icon="LayoutGrid"
      >
        <template #actions>
          <div class="flex items-center gap-4">
             <div class="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-none">
                <span class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest">AKTİF DİZİLİM:</span>
                <span class="text-[0.65rem] font-black text-white uppercase tracking-widest">{{ editingFormation?.name || 'SEÇİLMEDİ' }}</span>
             </div>
             <BaseButton variant="primary" size="sm" @click="openNewFormation" class="!rounded-none border-b-2 border-indigo-700 active:translate-y-0.5 transition-all">
                <template #icon><Plus class="w-4 h-4" /></template>
                YENİ DİZİLİM
             </BaseButton>
          </div>
        </template>
      </BaseSubNavigation>

      <div class="flex-1 flex overflow-hidden">
        <!-- Left Sidebar: Formations List -->
        <div class="w-80 border-r border-white/5 flex flex-col bg-slate-900/30 backdrop-blur-xl">
           <div class="p-6 border-b border-white/5 bg-slate-900/20">
              <h4 class="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">KAYITLI DİZİLİMLER</h4>
              <div v-if="formations.length === 0" class="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                 <LayoutGrid class="w-12 h-12" />
                 <p class="text-[0.6rem] font-black uppercase tracking-widest">HENÜZ DİZİLİM YOK</p>
              </div>
              
              <div class="space-y-3">
                 <div 
                   v-for="form in formations" 
                   :key="form.id"
                   class="group relative overflow-hidden p-4 border transition-all cursor-pointer"
                   :class="selectedFormation?.id === form.id ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'"
                   @click="selectFormation(form)"
                 >
                    <div class="flex items-center justify-between relative z-10">
                       <div class="flex flex-col gap-1">
                          <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-widest">{{ form.name }}</span>
                          <span class="text-[0.55rem] text-slate-500 font-bold uppercase">{{ form.layout.length }} OYUNCU YERLEŞİKE</span>
                       </div>
                       <div class="flex gap-2">
                          <button @click.stop="deleteFormation(form.id)" class="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                             <Trash2 class="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <!-- Indicator line -->
                    <div v-if="selectedFormation?.id === form.id" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Right: Editor Area -->
        <div class="flex-1 relative bg-slate-950 p-8 flex flex-col overflow-hidden">
           <Transition name="fade" mode="out-in">
              <div v-if="editingFormation" :key="editingFormation.id || 'new'" class="flex flex-col h-full">
                 <div class="flex items-center gap-6 mb-8">
                    <div class="flex-1">
                       <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">DİZİLİM ADI VEYA TAKTİKSEL NOT</h3>
                       <input 
                         v-model="editingFormation.name"
                         class="w-full bg-slate-900 border border-slate-800 p-4 text-white font-black uppercase tracking-widest focus:border-indigo-500 focus:outline-none transition-colors"
                         placeholder="ÖRN: 4-4-2 ATAK VARYASYONU..."
                       />
                    </div>
                 </div>

                 <!-- Pitch Editor -->
                 <div class="flex-1 flex gap-8 min-h-0">
                    <div 
                      class="flex-1 bg-[#064e3b]/20 border border-emerald-500/20 relative shadow-2xl overflow-hidden group/pitch"
                      style="aspect-ratio: 4/3;"
                      @mousemove="onMouseMove"
                      @mouseup="onMouseUp"
                      @mouseleave="onMouseUp"
                    >
                      <!-- Pitch Texture/Grass -->
                      <div class="absolute inset-0 opacity-10 pointer-events-none">
                         <div v-for="i in 10" :key="i" class="h-1/10 w-full" :class="i % 2 === 0 ? 'bg-emerald-500' : 'bg-transparent'"></div>
                      </div>

                      <!-- Pitch Markings -->
                      <div class="absolute inset-8 border-2 border-white/20 pointer-events-none">
                        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2"></div>
                        <div class="absolute top-1/2 left-1/2 w-40 h-40 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 border-2 border-white/20 border-l-0"></div>
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 border-2 border-white/20 border-r-0"></div>
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-white/20 border-l-0"></div>
                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-white/20 border-r-0"></div>
                        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/40 rounded-full mt-2"></div>
                        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/40 rounded-full mb-2"></div>
                      </div>

                      <!-- Draggable Spots -->
                      <div 
                        v-for="(spot, index) in editingFormation.layout" 
                        :key="index"
                        class="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-move z-20"
                        :style="{ left: spot.x + '%', top: spot.y + '%' }"
                        @mousedown="startDragging(index)"
                      >
                         <!-- Halo Effect -->
                         <div class="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-20"></div>
                         <!-- Circle -->
                         <div class="w-10 h-10 bg-white border-2 border-emerald-500 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center relative z-10 hover:scale-110 active:scale-90 transition-transform">
                            <span class="text-[0.7rem] font-black text-emerald-900">{{ index + 1 }}</span>
                         </div>
                      </div>

                      <div class="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10 z-30">
                         <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                         <p class="text-[0.6rem] text-slate-300 font-black uppercase tracking-[0.2em]">MOUSE İLE OYUNCULARI SAHAYA DİZİN</p>
                      </div>
                    </div>

                    <!-- Side Info/Tools -->
                    <div class="w-64 flex flex-col gap-6">
                       <div class="p-6 bg-slate-900/40 border border-slate-800">
                          <h5 class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-4">KOORDİNATLAR</h5>
                          <div class="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                             <div 
                               v-for="(spot, i) in editingFormation.layout" :key="i"
                               class="flex items-center justify-between text-[0.6rem] font-bold py-1 border-b border-white/5"
                             >
                                <span class="text-slate-100 uppercase">OYUNCU {{ i + 1 }}</span>
                                <span class="text-indigo-400 opacity-60">X: {{ Math.round(spot.x) }}% Y: {{ Math.round(spot.y) }}%</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div v-else class="flex-1 flex flex-col items-center justify-center opacity-10 gap-8 grayscale">
                 <div class="p-12 border-4 border-dashed border-white/20 rounded-full">
                    <LayoutGrid class="w-32 h-32" />
                 </div>
                 <h2 class="text-xl font-black uppercase tracking-[0.5em]">BİR DİZİLİM SEÇİN VEYA OLUŞTURUN</h2>
              </div>
           </Transition>
        </div>
      </div>

      <!-- Action Footer -->
      <BaseActionFooter accent="indigo">
        <template #left>
          <BaseButton variant="ghost" @click="$router.push('/specialties')" class="!rounded-none border border-white/5 font-black">
             <template #icon><ArrowLeft class="w-4 h-4" /></template>
             BRANŞLARA DÖN
          </BaseButton>
        </template>
        
        <template #right>
           <div v-if="editingFormation" class="flex gap-4">
              <BaseButton variant="ghost" @click="editingFormation = null" class="!rounded-none font-bold uppercase">VAZGEÇ</BaseButton>
              <BaseButton variant="success" @click="saveFormation" :loading="loading" class="!rounded-none px-12 border-b-2 border-emerald-800 active:translate-y-0.5 transition-all">
                <template #icon><Save class="w-4 h-4" /></template>
                DEĞİŞİKLİKLERİ KAYDET
              </BaseButton>
           </div>
        </template>
      </BaseActionFooter>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutGrid, Plus, Trash2, Save, X, Move, 
  ArrowLeft, ShieldCheck, Activity, Target 
} from 'lucide-vue-next'
import BaseSidebar from '../../components/base/BaseSidebar.vue'
import BaseSubNavigation from '../../components/base/BaseSubNavigation.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'

// Services & Composables
import { specialtyService } from '../../services/sport/specialtyService'
import { formationService } from '../../services/sport/formationService'
import { useFormations } from '../../composables/useFormations'
import { useAlerts } from '../../utils/alerts'

const route = useRoute()
const router = useRouter()
const { formations, loading: formationsLoading, fetchFormations, deleteFormation: composeDeleteFormation } = useFormations()
const { toast, error: showAlertError } = useAlerts()

const specialty = ref({})
const selectedFormation = ref(null)
const editingFormation = ref(null)
const loading = ref(false)
const dragIndex = ref(null)

const fetchSpecialty = async () => {
  try {
    specialty.value = await specialtyService.getById(route.params.id)
  } catch (err) {
    console.error('Branş yüklenemedi:', err)
  }
}

const openNewFormation = () => {
  editingFormation.value = {
    name: 'YENİ TAKTİK DİZİLİM',
    sportSpecialtyId: route.params.id,
    layout: Array(11).fill(0).map((_, i) => ({ x: 10 + (i * 8), y: 50 }))
  }
}

const selectFormation = (form) => {
  selectedFormation.value = form
  editingFormation.value = JSON.parse(JSON.stringify(form))
}

const startDragging = (index) => {
  dragIndex.value = index
}

const onMouseMove = (e) => {
  if (dragIndex.value === null) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  
  editingFormation.value.layout[dragIndex.value].x = Math.max(0, Math.min(100, x))
  editingFormation.value.layout[dragIndex.value].y = Math.max(0, Math.min(100, y))
}

const onMouseUp = () => {
  dragIndex.value = null
}

const saveFormation = async () => {
  if (!editingFormation.value.name) return
  loading.value = true
  try {
    if (editingFormation.value.id) {
      await formationService.update(editingFormation.value.id, editingFormation.value)
    } else {
      await formationService.create(editingFormation.value)
    }
    await fetchFormations(route.params.id)
    editingFormation.value = null
    toast('Dizilim başarıyla kaydedildi.')
  } catch (err) {
    console.error('Kaydedilemedi:', err)
    showAlertError('HATA', 'Dizilim kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteFormation = async (id) => {
  const success = await composeDeleteFormation(id)
  if (success) {
    await fetchFormations(route.params.id)
    if (editingFormation.value?.id === id) editingFormation.value = null
  }
}

onMounted(() => {
  fetchSpecialty()
  fetchFormations(route.params.id)
})
</script>

<style scoped>
.h-1\/10 { height: 10%; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #312e81; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
