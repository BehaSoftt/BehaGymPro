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
                <div class="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-700/50">
                  <Clock class="w-3.5 h-3.5 text-amber-400" />
                  <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Saat & Günler</span>
                </div>
                <div class="space-y-6">
                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model="form.startTime" type="time" label="Giriş Saati" required />
                    <BaseInput v-model="form.endTime" type="time" label="Çıkış Saati" required />
                  </div>
                  <div>
                    <label class="block text-[0.75rem] font-medium text-slate-500 uppercase mb-3 ml-1">Ders Günleri</label>
                    <div class="grid grid-cols-4 gap-2">
                      <button 
                        v-for="(day, index) in ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']" 
                        :key="index" 
                        type="button" 
                        @click="toggleDay(index)"
                        :class="form.days.includes(index) ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'"
                        class="py-2.5 border text-[0.75rem] font-medium uppercase transition-all hover:text-white"
                      > {{ day }} </button>
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
import { Plus, Clock, X, Check, Save } from 'lucide-vue-next'
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

const branchCategory = ref('STANDARD')

const filteredSpecialties = computed(() => {
  if (branchCategory.value === 'BELT') {
    return props.specialties.filter(s => s.hasBelts)
  }
  return props.specialties.filter(s => !s.hasBelts)
})

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

const toggleDay = (idx) => {
  const i = form.value.days.indexOf(idx)
  if (i === -1) form.value.days.push(idx)
  else form.value.days.splice(i, 1)
}

const totalSessions = computed(() => {
  const pkg = props.packages.find(p => p.id === form.value.packageId)
  if (!pkg || !form.value.days?.length) return 0
  return pkg.durationMonths * 4 * form.value.days.length
})

onMounted(() => {
  if (props.isEdit) {
    const spec = props.specialties.find(s => s.id === form.value.specialtyId)
    if (spec) {
      branchCategory.value = spec.hasBelts ? 'BELT' : 'STANDARD'
    }
  }
})

</script>
