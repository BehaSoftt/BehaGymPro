<template>
  <Transition name="fade-slide">
    <div v-if="isOpen && member" class="absolute inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden">


      <!-- 2. CONTENT AREA (Scrollable) -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-8 bg-slate-950">
        
        <!-- CONTEXT STATS (Using BaseCard for Consistency) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- BKİ CARD -->
            <BaseCard :clickable="false" accent="indigo" class="!bg-slate-900/40 p-1">
                <div class="flex flex-col items-center justify-center py-2 relative overflow-hidden">
                   <div class="absolute top-0 right-0 p-2 opacity-10">
                      <Activity class="w-12 h-12 text-indigo-500 rotate-12" />
                   </div>
                   <span class="text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">VÜCUT KİTLE ENDEKSİ</span>
                   <div class="flex items-center gap-3 mb-3">
                     <span class="text-2xl font-black text-white tracking-tight">{{ lastStats?.bmi || '-' }}</span>
                     <div class="h-6 w-px bg-slate-800"></div>
                     <span v-if="lastStats" class="text-[0.45rem] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-950 border border-slate-800" :class="getBmiClass(lastStats.bmi)">
                       {{ lastStats.bmiCategory }}
                     </span>
                   </div>
                   <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                     <div class="h-full bg-indigo-500" :style="{width: (lastStats?.bmi ? Math.min((lastStats.bmi/40)*100, 100) : 0) + '%'}"></div>
                   </div>
                </div>
            </BaseCard>

            <!-- BMR CARD -->
            <BaseCard :clickable="false" accent="emerald" class="!bg-slate-900/40 p-1">
                <div class="flex flex-col items-center justify-center py-2 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-2 opacity-10">
                       <Zap class="w-12 h-12 text-emerald-500 -rotate-12" />
                    </div>
                    <span class="text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">METABOLİZMA HIZI</span>
                    <div class="flex items-baseline gap-2 mb-3">
                        <span class="text-2xl font-black text-white tracking-tight">{{ lastStats?.bmr || '-' }}</span>
                        <span class="text-[0.5rem] text-emerald-500 font-black italic uppercase">KCAL</span>
                    </div>
                    <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500" :style="{width: (lastStats?.bmr ? Math.min((lastStats.bmr/3000)*100, 100) : 0) + '%'}"></div>
                    </div>
                </div>
            </BaseCard>

            <!-- TARGET CARD -->
            <BaseCard :clickable="false" accent="rose" class="!bg-slate-900/40 p-1">
                <div class="flex flex-col items-center justify-center py-2 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-2 opacity-10">
                       <TrendingDown class="w-12 h-12 text-rose-500 rotate-45" />
                    </div>
                    <span class="text-[0.5rem] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">HEDEFE KALAN KG</span>
                    <div class="flex items-baseline gap-2 mb-3">
                        <span class="text-2xl font-black text-rose-500 tracking-tight">{{ member.weight && member.targetWeight ? Math.abs(member.weight - member.targetWeight).toFixed(1) : '-' }}</span>
                        <span class="text-[0.5rem] text-rose-500 font-black italic uppercase">KG</span>
                    </div>
                    <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                      <div class="h-full bg-rose-500" :style="{width: (100 - (member.progress || 0)) + '%'}"></div>
                    </div>
                </div>
            </BaseCard>
        </div>

        <!-- FORM SECTIONS -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 class="w-10 h-10 text-rose-500 animate-spin" />
          <span class="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em]">VERİLER ALINIYOR...</span>
        </div>

        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <!-- Left Column: Habits & Preferences -->
          <div class="space-y-8">
            <BaseCard :clickable="false" class="!bg-slate-900/20 backdrop-blur-sm">
              <div class="space-y-6">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <Activity class="w-4 h-4 text-rose-500" />
                  <span class="text-[0.7rem] font-black text-slate-300 uppercase tracking-widest">GÜNLÜK ALIŞKANLIKLAR</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BaseInput v-model.number="formData.mealCount" type="number" label="Öğün Sayısı" placeholder="0" :error="errors.mealCount">
                    <template #icon><Utensils class="w-3 h-3 text-emerald-500" /></template>
                  </BaseInput>
                  <BaseInput v-model.number="formData.sleepDuration" type="number" label="Uyku (Saat)" :error="errors.sleepDuration">
                    <template #icon><Moon class="w-3 h-3 text-indigo-400" /></template>
                  </BaseInput>
                  <BaseInput v-model.number="formData.fluidIntake" type="number" step="0.1" label="Sıvı (Litre)" :error="errors.fluidIntake">
                    <template #icon><Droplet class="w-3 h-3 text-blue-400" /></template>
                  </BaseInput>
                </div>
              </div>
            </BaseCard>

            <BaseCard :clickable="false" class="!bg-slate-900/20 backdrop-blur-sm">
              <div class="space-y-6">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <Apple class="w-4 h-4 text-emerald-500" />
                  <span class="text-[0.7rem] font-black text-slate-300 uppercase tracking-widest">GIDA YOĞUNLUĞU</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BaseInput v-model="formData.foodCategories.redMeat" type="select" label="Kırmızı Et">
                    <option value="">Seçiniz</option>
                    <option value="high">Yüksek Tüketim</option>
                    <option value="medium">Orta Seviye</option>
                    <option value="low">Düşük Tüketim</option>
                    <option value="none">Tüketilmiyor</option>
                  </BaseInput>
                  <BaseInput v-model="formData.foodCategories.whiteMeat" type="select" label="Beyaz Et">
                     <option value="">Seçiniz</option>
                     <option value="high">Yüksek Tüketim</option>
                     <option value="medium">Orta Seviye</option>
                     <option value="low">Düşük Tüketim</option>
                     <option value="none">Tüketilmiyor</option>
                  </BaseInput>
                  <BaseInput v-model="formData.foodCategories.vegetables" type="select" label="Sebze Grubu">
                     <option value="">Seçiniz</option>
                     <option value="high">Yüksek Tüketim</option>
                     <option value="medium">Orta Seviye</option>
                     <option value="low">Düşük Tüketim</option>
                     <option value="none">Tüketilmiyor</option>
                  </BaseInput>
                  <BaseInput v-model="formData.foodCategories.fruits" type="select" label="Meyve Grubu">
                     <option value="">Seçiniz</option>
                     <option value="high">Yüksek Tüketim</option>
                     <option value="medium">Orta Seviye</option>
                     <option value="low">Düşük Tüketim</option>
                     <option value="none">Tüketilmiyor</option>
                  </BaseInput>
                </div>
              </div>
            </BaseCard>
          </div>

          <!-- Right Column: Restrictions & Notes -->
          <div class="space-y-8">
            <BaseCard :clickable="false" class="!bg-slate-900/20 backdrop-blur-sm" accent="rose">
              <div class="space-y-6">
                <div class="flex items-center gap-3 pb-3 border-b border-rose-600/20 text-rose-500">
                  <XCircle class="w-4 h-4" />
                  <span class="text-[0.7rem] font-bold uppercase tracking-widest">YASAKLI GIDALAR</span>
                </div>
                <BaseInput v-model="formData.avoidFoods" type="textarea" placeholder="Diyette kesinlikle yer almaması gereken gıdalar..." :rows="4">
                   <template #icon><Zap class="w-3 h-3 text-rose-500" /></template>
                </BaseInput>
              </div>
            </BaseCard>

            <BaseCard :clickable="false" class="!bg-slate-900/20 backdrop-blur-sm" accent="indigo">
              <div class="space-y-6">
                <div class="flex items-center gap-3 pb-3 border-b border-indigo-600/20 text-indigo-400">
                  <FileText class="w-4 h-4" />
                  <span class="text-[0.7rem] font-bold uppercase tracking-widest">EK ÖNERİLER VE TAKVİYELER</span>
                </div>
                <BaseInput v-model="formData.additionalNotes" type="textarea" placeholder="Supplement kullanımı, antrenman beslenmesi..." :rows="4">
                  <template #icon><Dumbbell class="w-3 h-3 text-indigo-400" /></template>
                </BaseInput>
              </div>
            </BaseCard>
          </div>
        </div>
        
        <!-- Bottom Spacer -->
        <div class="h-24"></div>
      </div>

      <!-- 3. ACTION FOOTER (Base Standart) -->
      <BaseActionFooter>
        <!-- Sol taraf: Vazgeç/Geri -->
        <template #left>
           <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="VAZGEÇ">
             <template #icon><X class="w-5 h-5" /></template>
           </BaseButton>
        </template>
        
        <!-- Orta taraf: Kaydet -->
        <template #default>
           <BaseButton variant="success" size="icon" square :loading="saving" @click="savePlan" title="BESLENME PLANINI KAYDET">
             <template #icon><Save class="w-5 h-5" /></template>
           </BaseButton>
        </template>
      </BaseActionFooter>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  Apple, Utensils, Moon, Droplet, FileText, X, XCircle, Save, 
  Loader2, Activity, Zap, Dumbbell, ArrowLeft, TrendingDown 
} from 'lucide-vue-next'
import axios from 'axios'
import Swal from 'sweetalert2'

// Base Components
import BaseCard from './base/BaseCard.vue'
import BaseInput from './base/BaseInput.vue'
import BaseButton from './base/BaseButton.vue'
import BaseMemberAvatar from './base/BaseMemberAvatar.vue'
import BaseActionFooter from './base/BaseActionFooter.vue'

const props = defineProps({
  member: { type: [Object, null], required: true },
  isOpen: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const saving = ref(false)
const errors = ref({})
const lastStats = ref(null)

const initialFormState = {
  mealCount: null,
  foodCategories: { redMeat: '', whiteMeat: '', vegetables: '', fruits: '' },
  avoidFoods: '',
  sleepDuration: null,
  fluidIntake: null,
  additionalNotes: ''
}

const formData = ref(JSON.parse(JSON.stringify(initialFormState)))

const resetForm = () => {
  formData.value = JSON.parse(JSON.stringify(initialFormState))
  errors.value = {}
}

const getBmiClass = (bmi) => {
  if (bmi < 18.5) return 'text-sky-400'
  if (bmi < 25) return 'text-emerald-400'
  if (bmi < 30) return 'text-amber-400'
  return 'text-rose-500'
}

const fetchMemberStats = async () => {
  if (!props.member?.id) return
  try {
    const res = await axios.get(`http://${window.location.hostname}:5000/api/body-measurements?memberId=${props.member.id}`)
    if (res.data && res.data.length > 0) {
      lastStats.value = res.data[0]
    }
  } catch (err) { console.error('Stats fetch error:', err) }
}

const fetchPlan = async () => {
  if (!props.member?.id) return
  resetForm()
  loading.value = true
  fetchMemberStats()
  try {
    const response = await axios.get(`http://${window.location.hostname}:5000/api/nutrition-plans/${props.member.id}`)
    if (response.data) {
      formData.value = {
        mealCount: response.data.mealCount,
        foodCategories: response.data.foodCategories || { ...initialFormState.foodCategories },
        avoidFoods: response.data.avoidFoods || '',
        sleepDuration: response.data.sleepDuration,
        fluidIntake: response.data.fluidIntake,
        additionalNotes: response.data.additionalNotes || ''
      }
    }
  } catch (err) {
    if (err.response?.status !== 404) console.error('Plan fetch error:', err)
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  if (formData.value.mealCount && (formData.value.mealCount < 1 || formData.value.mealCount > 10)) {
    errors.value.mealCount = '1-10 arası'
  }
  return Object.keys(errors.value).length === 0
}

const savePlan = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    await axios.post(`http://${window.location.hostname}:5000/api/nutrition-plans`, {
      memberId: props.member.id,
      ...formData.value
    })
    Swal.fire({
      icon: 'success', title: 'KAYDEDİLDİ', text: 'Plan güncellendi.', 
      timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#f1f5f9'
    })
    emit('saved')
    emit('close')
  } catch (err) {
    Swal.fire({
      icon: 'error', title: 'HATA', text: 'Kaydedilemedi.', background: '#1e293b', color: '#f1f5f9'
    })
  } finally {
    saving.value = false
  }
}

watch(() => props.isOpen, (open) => { if (open) fetchPlan() })
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
</style>
