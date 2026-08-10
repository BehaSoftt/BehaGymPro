<template>
  <div class="absolute inset-0 z-40 bg-slate-800 flex flex-col overflow-hidden border-t border-slate-700 shadow-2xl">
    <form @submit.prevent="$emit('save')" id="examForm" class="flex-1 flex flex-col overflow-hidden">
      <div class="overflow-y-auto flex-1 pt-4 pb-6 px-6 lg:px-12 space-y-4 custom-scrollbar bg-slate-800/30">
        <div class="w-full space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Basic Info Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900/50 border border-slate-700/50">
                <Award class="w-3.5 h-3.5 text-rose-400" />
                <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Temel Bilgiler</span>
              </div>

              <BaseInput 
                v-model="localExam.examName"
                label="Sınav Adı"
                placeholder="ÖRN: 2024 DÖNEMİ TEKVANDO TERFİ SINAVI"
                required
              />

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BaseInput 
                  v-model="localExam.specialtyId"
                  type="select"
                  label="Sınav Branşı"
                  required
                >
                  <option value="" disabled>SEÇİNİZ</option>
                  <option v-for="spec in beltSpecialties" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                </BaseInput>

                <BaseInput 
                  v-model="localExam.examPeriod"
                  type="select"
                  label="Sınav Dönemi"
                >
                  <option value="">YOK</option>
                  <option value="1">DÖNEM-1</option>
                  <option value="2">DÖNEM-2</option>
                  <option value="3">DÖNEM-3</option>
                  <option value="4">DÖNEM-4</option>
                </BaseInput>

                <BaseInput 
                  v-model="localExam.targetBelt"
                  type="select"
                  label="Kuşak Rengi"
                >
                  <option value="">TÜM KUŞAKLAR</option>
                  <option v-for="belt in availableBelts" :key="belt" :value="belt">{{ belt }}</option>
                </BaseInput>
              </div>

              <BaseInput 
                v-model.number="localExam.fee"
                type="number"
                step="0.01"
                label="Sınav Bedeli (₺)"
                placeholder="0.00"
                required
              />

              <div class="grid grid-cols-2 gap-4">
                <BaseInput 
                  v-model="localExam.examDate"
                  type="date"
                  label="Sınav Tarihi"
                  required
                />
                <BaseInput 
                  v-model="localExam.examTime"
                  type="time"
                  label="Sınav Saati"
                  required
                />
              </div>

              <BaseInput 
                v-model="localExam.instructorId"
                type="select"
                label="Sorumlu Eğitmen"
                required
              >
                <option value="" disabled>SEÇİNİZ</option>
                <option v-for="ins in instructors" :key="ins.id" :value="ins.id">{{ ins.fullName || ins.displayName || ins.user?.username || 'İSİMSİZ' }}{{ ins.instructorCode ? ' (' + ins.instructorCode + ')' : '' }}</option>
              </BaseInput>
            </div>

            <!-- Location & Details Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900/50 border border-slate-700/50">
                <MapPin class="w-3.5 h-3.5 text-amber-400" />
                <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Sınav Yeri Bilgileri</span>
              </div>

              <BaseInput 
                v-model="localExam.locationName"
                label="Sınav Yeri Adı"
                placeholder="SINAV MERKEZİ ADI (ÖRN: SPOR SALONU)"
                required
              />

              <BaseInput 
                v-model="localExam.locationAddress"
                type="textarea"
                label="Sınav Yeri Tam Adresi"
                placeholder="TAM ADRES BİLGİSİ..."
                :rows="2"
              />

              <div class="pt-6 border-t border-slate-700/50">
                <div class="flex items-center gap-2 mb-4 p-2 bg-slate-900/50 border border-slate-700/50">
                  <MapPin class="w-3.5 h-3.5 text-emerald-400" />
                  <span class="text-[0.75rem] font-medium text-slate-300 uppercase tracking-widest">Toplanma Bilgileri (Opsiyonel)</span>
                </div>
                
                <div class="space-y-4">
                  <BaseInput 
                    v-model="localExam.meetingPointName"
                    label="Toplanma Yeri Adı"
                    placeholder="ÖRN: KULÜP MERKEZİ VEYA SERVİS NOKTASI"
                  />

                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput 
                      v-model="localExam.meetingDate"
                      type="date"
                      label="Toplanma Tarihi"
                    />
                    <BaseInput 
                      v-model="localExam.meetingTime"
                      type="time"
                      label="Toplanma Saati"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="space-y-4 pt-8 border-t border-slate-700/50">
            <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900/50 border border-slate-700/50">
              <Award class="w-3.5 h-3.5 text-amber-400" />
              <span class="text-[0.85rem] font-medium text-slate-300 uppercase tracking-widest">Sınav Açıklaması & Notlar</span>
            </div>
            <BaseInput 
              v-model="localExam.description"
              type="textarea"
              placeholder="SINAV HAKKINDA EK BİLGİLER, GEREKLİ EKİPMANLAR, ÖZEL NOTLAR..."
              :rows="4"
            />
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="bg-slate-900/95 backdrop-blur-md border-t border-rose-600/40 h-[55px] flex items-center justify-center gap-3 z-40">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="VAZGEÇ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        <BaseButton 
          type="submit" 
          :disabled="loading" 
          variant="secondary"
          class="bg-rose-600 hover:bg-rose-500 border-rose-500/50 shadow-lg shadow-rose-600/20"
          size="icon" square
          title="KAYDET VE YAYINLA"
        >
          <template #icon>
            <Check v-if="!loading" class="w-5 h-5" />
            <Loader2 v-else class="w-5 h-5 animate-spin" />
          </template>
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Award, MapPin, X, Check, Loader2 } from 'lucide-vue-next'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  specialties: { type: Array, default: () => [] },
  instructors: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const localExam = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const beltSpecialties = computed(() => props.specialties.filter(s => s.hasBelts))

const availableBelts = computed(() => {
  if (!localExam.value.specialtyId) return []
  const spec = props.specialties.find(s => s.id === localExam.value.specialtyId)
  return (spec && spec.belts && spec.belts.length > 0) 
         ? spec.belts 
         : ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan']
})

// Auto-populate exam name when specialty or period is selected
watch([() => localExam.value.specialtyId, () => localExam.value.examPeriod], ([newSpecId, newPeriod]) => {
  if (newSpecId) {
    const spec = props.specialties.find(s => s.id === newSpecId)
    if (spec) {
      const year = new Date().getFullYear()
      if (newPeriod) {
        localExam.value.examName = `${year} YILI ${spec.name.toUpperCase()} BRANŞI-DÖNEM-${newPeriod} SINAVI`
      } else {
        localExam.value.examName = `${year} YILI ${spec.name.toUpperCase()} BRANŞI SINAVI`
      }
    }
  }
})
</script>
