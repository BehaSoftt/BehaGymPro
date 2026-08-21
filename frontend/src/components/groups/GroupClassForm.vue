<template>
  <div class="absolute inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 flex flex-col">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 bg-slate-900/40 border-b border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">

          <div class="p-8 lg:p-12 space-y-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
              <div class="space-y-6">
                <div class="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-700/50">
                  <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Grup Temeli</span>
                </div>
                <div class="space-y-4">
                  <BaseInput v-model="form.branchId" type="select" label="Şube" required>
                    <option value="" disabled>SEÇİNİZ</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                  </BaseInput>

                  <BaseInput v-model="form.name" type="text" label="Grup Adı" required placeholder="ÖRN: KARATE BAŞLANGIÇ" />
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <BaseInput v-model="branchCategory" type="select" label="Branş Türü">
                      <option value="STANDARD">Standart Branşlar</option>
                      <option value="BELT">Kuşak Branşları</option>
                    </BaseInput>

                    <BaseInput v-model="form.specialtyId" type="select" :label="branchCategory === 'STANDARD' ? 'Branş (Standart)' : 'Kuşak Branşı'" required>
                      <option value="" disabled>SEÇİNİZ</option>
                      <option v-for="spec in filteredSpecialties" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                    </BaseInput>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model.number="form.maxCapacity" type="number" label="Kapasite" required />
                    <BaseInput v-model="form.packageId" type="select" label="Paket Tipi" required>
                      <option value="" disabled>GRUP PAKETİ SEÇİNİZ</option>
                      <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
                    </BaseInput>
                  </div>

                  <div v-if="form.packageId && form.days?.length" class="mt-2 p-3 bg-indigo-600/10 border border-indigo-500/30">
                    <p class="text-xs text-indigo-300 uppercase tracking-wider">
                      📊 Toplam Seans: <span class="font-bold">{{ totalSessions }}</span>
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model="form.startDate" type="date" label="Başlangıç Tarihi" required />
                    <BaseInput v-model="form.endDate" type="date" label="Bitiş Tarihi" disabled />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model="form.instructorId" type="select" label="Eğitmen" required>
                      <option value="" disabled>SEÇİNİZ</option>
                      <option v-for="ins in instructors" :key="ins.id" :value="ins.id">{{ ins.fullName || ins.username || ins.user?.username || 'İsimsiz' }}</option>
                    </BaseInput>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700/50">
                  <div class="flex items-center gap-2">
                    <Clock class="w-3.5 h-3.5 text-amber-400" />
                    <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Ders Günleri & Seans Saatleri</span>
                  </div>
                  <button 
                    v-if="form.days?.length > 1 && (form.groupSchedules?.length || 0) > 0"
                    type="button"
                    @click="copyFirstDaySlotsToAll"
                    class="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-[0.6rem] font-black uppercase tracking-wider transition-all flex items-center gap-1 rounded"
                    title="İstediğiniz ilk günün saatlerini seçili tüm günlere kopyalar"
                  >
                    <Copy class="w-3 h-3" /> İlk Günün Saatlerini Tüm Günlere Uygula
                  </button>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-[0.75rem] font-medium text-slate-500 uppercase mb-3 ml-1">DERS GÜNLERİ SEÇİMİ</label>
                    <div class="grid grid-cols-7 gap-2">
                      <button 
                        v-for="(day, index) in dayShortNames" 
                        :key="index" 
                        type="button" 
                        @click="toggleDay(index)"
                        :class="form.days.includes(index) ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-md' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'"
                        class="py-2.5 border text-[0.75rem] uppercase transition-all rounded"
                      > {{ day }} </button>
                    </div>
                  </div>

                  <!-- Seans Detayları (Gün Bazlı Saat Çiftleri) -->
                  <div v-if="form.days?.length > 0" class="space-y-4 pt-2 border-t border-slate-800">
                    <label class="block text-[0.75rem] font-medium text-slate-400 uppercase ml-1">GÜNLERE ÖZEL SEANS SAATLERİ</label>

                    <div v-for="dayIdx in sortedSelectedDays" :key="dayIdx" class="bg-slate-900/60 border border-slate-800 p-4 space-y-3 rounded-lg">
                      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span class="text-[0.7rem] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar class="w-3.5 h-3.5" /> {{ dayFullNames[dayIdx] }}
                        </span>
                        <button 
                          type="button"
                          @click="addSlotToDay(dayIdx)"
                          class="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[0.6rem] font-black uppercase tracking-wider transition-all flex items-center gap-1 rounded"
                        >
                          <Plus class="w-3 h-3" /> Seans Ekle
                        </button>
                      </div>

                      <div class="space-y-2">
                        <div 
                          v-for="(slot, sIdx) in getDaySlots(dayIdx)" 
                          :key="sIdx"
                          class="grid grid-cols-12 gap-3 items-center bg-slate-950/80 p-2 border border-slate-800/80 rounded"
                        >
                          <div class="col-span-5">
                            <BaseInput 
                              v-model="slot.startTime" 
                              @update:modelValue="syncMainTimes"
                              type="time" 
                              label="Başlangıç" 
                              required 
                            />
                          </div>
                          <div class="col-span-5">
                            <BaseInput 
                              v-model="slot.endTime" 
                              @update:modelValue="syncMainTimes"
                              type="time" 
                              label="Bitiş" 
                              required 
                            />
                          </div>
                          <div class="col-span-2 flex justify-end pt-5">
                            <button 
                              type="button" 
                              @click="removeSlot(dayIdx, sIdx)"
                              class="w-9 h-9 flex items-center justify-center bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 transition-all rounded"
                              title="Seansı Sil"
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseActionFooter local shadow>
      <div class="flex items-center gap-4">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="Vazgeç">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-8 bg-slate-800"></div>
        <BaseButton variant="success" size="icon" square @click="$emit('save', form)" :loading="loading" title="Kaydet">
          <template #icon><Check class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Clock, X, Check, Save, Copy, Calendar, Trash2 } from 'lucide-vue-next'
import BaseInput from '../base/BaseInput.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  branches: { type: Array, default: () => [] },
  specialties: { type: Array, default: () => [] },
  instructors: { type: Array, default: () => [] },
  packages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dayShortNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const dayFullNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

const branchCategory = ref('STANDARD')

const filteredSpecialties = computed(() => {
  if (branchCategory.value === 'BELT') {
    return props.specialties.filter(s => s.hasBelts)
  }
  return props.specialties.filter(s => !s.hasBelts)
})

const sortedSelectedDays = computed(() => {
  return [...(form.value.days || [])].sort((a, b) => a - b)
})

const getDaySlots = (dayIdx) => {
  if (!form.value.groupSchedules) form.value.groupSchedules = []
  return form.value.groupSchedules.filter(s => s.day === dayIdx)
}

const addSlotToDay = (dayIdx) => {
  if (!form.value.groupSchedules) form.value.groupSchedules = []
  const existing = getDaySlots(dayIdx)
  let lastEnd = '19:30'
  let newEnd = '21:00'
  if (existing.length > 0) {
    const last = existing[existing.length - 1]
    lastEnd = last.endTime || '19:30'
    const [h] = lastEnd.split(':').map(Number)
    newEnd = `${String((h + 2) % 24).padStart(2, '0')}:00`
  }
  form.value.groupSchedules.push({
    day: dayIdx,
    dayName: dayFullNames[dayIdx],
    startTime: lastEnd,
    endTime: newEnd
  })
  syncMainTimes()
}

const removeSlot = (dayIdx, slotIdxInDay) => {
  if (!form.value.groupSchedules) return
  const daySlots = getDaySlots(dayIdx)
  const targetSlot = daySlots[slotIdxInDay]
  if (targetSlot) {
    const idxInMain = form.value.groupSchedules.indexOf(targetSlot)
    if (idxInMain !== -1) {
      form.value.groupSchedules.splice(idxInMain, 1)
    }
  }
  // Eğer bu güne ait tüm seanslar silindiyse günü de pasife al
  if (getDaySlots(dayIdx).length === 0) {
    const dayPos = form.value.days.indexOf(dayIdx)
    if (dayPos !== -1) form.value.days.splice(dayPos, 1)
  }
  syncMainTimes()
}

const copyFirstDaySlotsToAll = () => {
  if (!form.value.days?.length || !form.value.groupSchedules?.length) return
  const firstDay = sortedSelectedDays.value[0]
  const firstDaySlots = getDaySlots(firstDay)
  if (firstDaySlots.length === 0) return

  // Seçili tüm günlerin seanslarını sıfırla ve ilk günün seanslarını kopyala
  form.value.groupSchedules = []
  sortedSelectedDays.value.forEach(dayIdx => {
    firstDaySlots.forEach(slot => {
      form.value.groupSchedules.push({
        day: dayIdx,
        dayName: dayFullNames[dayIdx],
        startTime: slot.startTime,
        endTime: slot.endTime
      })
    })
  })
  syncMainTimes()
}

const syncMainTimes = () => {
  if (form.value.groupSchedules && form.value.groupSchedules.length > 0) {
    form.value.startTime = form.value.groupSchedules[0].startTime
    form.value.endTime = form.value.groupSchedules[0].endTime
  }
}

const toggleDay = (idx) => {
  if (!form.value.days) form.value.days = []
  if (!form.value.groupSchedules) form.value.groupSchedules = []

  const i = form.value.days.indexOf(idx)
  if (i === -1) {
    form.value.days.push(idx)
    // Varsayılan seans ekle
    form.value.groupSchedules.push({
      day: idx,
      dayName: dayFullNames[idx],
      startTime: '17:30',
      endTime: '19:00'
    })
  } else {
    form.value.days.splice(i, 1)
    form.value.groupSchedules = form.value.groupSchedules.filter(s => s.day !== idx)
  }
  syncMainTimes()
}

watch(branchCategory, (newVal) => {
   const currentSpec = props.specialties.find(s => s.id === form.value.specialtyId)
   if (currentSpec) {
      const specCategory = currentSpec.hasBelts ? 'BELT' : 'STANDARD'
      if (specCategory === newVal) return
   }
   form.value.specialtyId = ''
})

watch(() => form.value.specialtyId, (newId) => {
  const s = props.specialties.find(x => x.id === newId)
  if (s && (!form.value.name || form.value.name.includes('Grubu') || form.value.name === '')) {
    form.value.name = `${s.name} GRUBU`
  }
})

watch(() => form.value.packageId, (pkgId) => {
  if (pkgId && form.value.startDate) {
    const pkg = props.packages.find(p => p.id === pkgId)
    if (pkg && pkg.durationMonths) {
      updateEndDate(pkg.durationMonths)
    }
  }
})

watch(() => form.value.startDate, (newDate) => {
  if (newDate && form.value.packageId) {
    const pkg = props.packages.find(p => p.id === form.value.packageId)
    if (pkg && pkg.durationMonths) {
      updateEndDate(pkg.durationMonths)
    }
  }
})

const updateEndDate = (months) => {
  const start = new Date(form.value.startDate)
  start.setMonth(start.getMonth() + months)
  form.value.endDate = start.toISOString().split('T')[0]
}

const totalSessions = computed(() => {
  const pkg = props.packages.find(p => p.id === form.value.packageId)
  if (!pkg || !form.value.groupSchedules?.length) return 0
  return pkg.durationMonths * 4 * form.value.groupSchedules.length
})

onMounted(() => {
  if (!form.value.days) form.value.days = []
  if (!form.value.groupSchedules) form.value.groupSchedules = []

  if (props.isEdit) {
    const spec = props.specialties.find(s => s.id === form.value.specialtyId)
    if (spec) {
      branchCategory.value = spec.hasBelts ? 'BELT' : 'STANDARD'
    }
    if (form.value.days.length > 0 && form.value.groupSchedules.length === 0) {
      // Legacy kaydı groupSchedules formatına dönüştür
      form.value.days.forEach(dayIdx => {
        form.value.groupSchedules.push({
          day: dayIdx,
          dayName: dayFullNames[dayIdx],
          startTime: form.value.startTime || '17:30',
          endTime: form.value.endTime || '19:00'
        })
      })
    }
  }
})
</script>
