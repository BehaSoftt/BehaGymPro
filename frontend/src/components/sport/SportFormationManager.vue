<template>
  <div class="flex flex-col h-full bg-slate-950 border border-slate-800 overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
      <div class="flex items-center gap-3">
        <LayoutGrid class="w-5 h-5 text-indigo-400" />
        <div>
          <h3 class="text-sm font-black text-white uppercase tracking-widest">{{ specialty.name }} - SAHA DİZİLİMLERİ</h3>
          <p class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-tighter">STRATEJİK FORMASYON YÖNETİMİ</p>
        </div>
      </div>
      <BaseButton variant="primary" size="sm" @click="openNewFormation" class="!rounded-none">
        <template #icon><Plus class="w-4 h-4" /></template>
        YENİ DİZİLİM
      </BaseButton>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Formations List -->
      <div class="w-64 border-r border-white/5 flex flex-col bg-slate-900/20">
        <BaseScroll direction="vertical" accent="indigo">
          <div class="p-2 space-y-1">
            <div 
              v-for="form in formations" 
              :key="form.id"
              class="group p-3 border border-slate-800/60 cursor-pointer transition-all hover:bg-indigo-500/10"
              :class="selectedFormation?.id === form.id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-950'"
              @click="selectFormation(form)"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-[0.65rem] font-black text-slate-200 uppercase tracking-widest">{{ form.name }}</span>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="deleteFormation(form.id)" class="text-slate-600 hover:text-rose-500"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p class="text-[0.55rem] text-slate-600 font-bold uppercase italic">{{ form.layout.length }} OYUNCU YERLEŞİK</p>
            </div>
            <div v-if="formations.length === 0" class="py-20 text-center opacity-20">
              <p class="text-[0.6rem] font-black uppercase tracking-widest">HENÜZ DİZİLİM YOK</p>
            </div>
          </div>
        </BaseScroll>
      </div>

      <!-- Right: Preview / Editor -->
      <div class="flex-1 relative bg-slate-950 p-4 flex flex-col gap-4">
        <div v-if="editingFormation" class="flex flex-col h-full">
           <div class="shrink-0 flex gap-4 mb-4">
              <BaseInput 
                v-model="editingFormation.name" 
                placeholder="DİZİLİM ADI (Örn: 4-4-2 ATAK)..." 
                class="!mb-0 flex-1"
                bg="slate-900"
              />
              <BaseButton variant="success" @click="saveFormation" :loading="loading" class="!rounded-none">KAYDET</BaseButton>
              <BaseButton variant="ghost" @click="editingFormation = null" class="!rounded-none font-bold">İPTAL</BaseButton>
           </div>

           <!-- Mini Pitch Editor -->
            <div 
              class="flex-1 bg-emerald-950/20 border-2 border-emerald-500/20 relative overflow-hidden"
              style="aspect-ratio: 4/3;"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
            >
              <!-- Pitch Markings -->
              <div class="absolute inset-4 border-2 border-white/40 rounded-none pointer-events-none">
                <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2"></div>
                <div class="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white/40 border-l-0"></div>
                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white/40 border-r-0"></div>
              </div>

              <!-- Draggable Player Spots -->
              <div 
                v-for="(spot, index) in editingFormation.layout" 
                :key="index"
                class="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center cursor-move shadow-lg z-20 group transition-transform active:scale-110"
                :style="{ left: spot.x + '%', top: spot.y + '%' }"
                @mousedown="startDragging(index)"
              >
                <span class="text-[0.6rem] font-black text-emerald-900">{{ index + 1 }}</span>
                <!-- Delete spot if > 11? Usually football is 11 -->
              </div>

              <div class="absolute bottom-4 left-4 bg-black/60 px-3 py-1 border border-white/10 z-30">
                <p class="text-[0.55rem] text-white font-black uppercase tracking-widest">İPUCU: MOUSE İLE OYUNCULARI SAHAYA DİZİN</p>
              </div>
            </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col items-center justify-center opacity-20 gap-4 border-2 border-dashed border-slate-900">
           <LayoutGrid class="w-16 h-16" />
           <p class="text-xs font-black uppercase tracking-[0.3em]">BİR DİZİLİM SEÇİN VEYA YENİ OLUŞTURUN</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { LayoutGrid, Plus, Trash2, Save, X, Move } from 'lucide-vue-next'
import BaseButton from '../base/BaseButton.vue'
import BaseScroll from '../base/BaseScroll.vue'
import BaseInput from '../base/BaseInput.vue'
import Swal from 'sweetalert2'

const props = defineProps({
  specialty: { type: Object, required: true }
})

const formations = ref([])
const selectedFormation = ref(null)
const editingFormation = ref(null)
const loading = ref(false)
const dragIndex = ref(null)

const fetchFormations = async () => {
  try {
    const response = await axios.get(`http://${window.location.hostname}:5000/api/sport-formations?specialtyId=${props.specialty.id}`)
    formations.value = response.data
  } catch (err) {
    console.error('Dizilimler yüklenemedi:', err)
  }
}

const openNewFormation = () => {
  editingFormation.value = {
    name: 'YENİ DİZİLİM',
    sportSpecialtyId: props.specialty.id,
    layout: Array(11).fill(0).map((_, i) => ({ x: 10 + (i * 8), y: 50 })) // Default horizontal line
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
      await axios.put(`http://${window.location.hostname}:5000/api/sport-formations/${editingFormation.value.id}`, editingFormation.value)
    } else {
      await axios.post(`http://${window.location.hostname}:5000/api/sport-formations`, editingFormation.value)
    }
    await fetchFormations()
    editingFormation.value = null
    Swal.fire({ icon: 'success', title: 'BAŞARILI', text: 'Dizilim kaydedildi.', background: '#1e293b', color: '#f1f5f9', timer: 1500, showConfirmButton: false })
  } catch (err) {
    console.error('Kaydedilemedi:', err)
    Swal.fire({ icon: 'error', title: 'HATA', text: 'Dizilim kaydedilirken bir sorun oluştu.', background: '#1e293b', color: '#f1f5f9' })
  } finally {
    loading.value = false
  }
}

const deleteFormation = async (id) => {
  const result = await Swal.fire({
    title: 'EMİN MİSİNİZ?',
    text: "Bu dizilim kalıcı olarak silinecek.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'SİL',
    cancelButtonText: 'İPTAL',
    background: '#1e293b',
    color: '#f1f5f9'
  })
  
  if (result.isConfirmed) {
    try {
      await axios.delete(`http://${window.location.hostname}:5000/api/sport-formations/${id}`)
      await fetchFormations()
      if (editingFormation.value?.id === id) editingFormation.value = null
      Swal.fire({ icon: 'success', title: 'SİLİNDİ', background: '#1e293b', color: '#f1f5f9', timer: 1000, showConfirmButton: false })
    } catch (err) {
       console.error('Silinemedi:', err)
    }
  }
}

onMounted(fetchFormations)
watch(() => props.specialty.id, fetchFormations)
</script>
