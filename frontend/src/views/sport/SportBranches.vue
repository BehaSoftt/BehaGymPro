<template>
  <div class="h-full flex flex-col min-h-0 bg-slate-900 border-rose-600/20 overflow-hidden relative px-2">
    <!-- Base Search & Filters -->
    <BaseSearchFilter
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="BRANŞ ARA (ADM, AÇIKLAMA)..."
      accent="rose"
    />

    <!-- Scrollable Content Area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Grid/List List Area Container -->
      <!-- Grid/List Area -->
      <div v-if="!showAddModal" class="h-full">
        <!-- Grid View -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" accent="rose" :maskSize="60" class="px-[15px] pt-2 pb-24 h-full">
          <div v-if="specialties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <BaseCard 
              v-for="spec in filteredSpecialties" :key="spec.id" 
              :selected="selectedSpecialties.includes(spec.id)"
              selectable
              accent="rose"
              @click="toggleSelection(spec.id)"
              @select="toggleSelection(spec.id)"
            >
              <div class="flex flex-col h-full">
                <div class="flex justify-between items-start mb-6">
                  <div :class="['w-14 h-14 border flex items-center justify-center relative', branchConfig[spec.name]?.glow || 'bg-slate-900', branchConfig[spec.name]?.border || 'border-slate-700']">
                    <component :is="branchConfig[spec.name]?.icon || Activity" :class="['w-7 h-7 relative z-10', branchConfig[spec.name]?.color || 'text-rose-500']" />
                  </div>
                </div>
                
                <div class="flex flex-col gap-1 mb-4">
                  <h3 class="text-lg font-black text-slate-100 uppercase tracking-tight">{{ spec.name }}</h3>
                  <p class="text-[0.65rem] text-slate-500 font-bold uppercase tracking-[0.2em] line-clamp-2">{{ spec.description || 'AÇIKLAMA YOK' }}</p>
                </div>

                <div v-if="spec.categories && spec.categories.length > 0" class="mt-auto pt-4 border-t border-slate-800/60">
                  <BaseScroll accent="rose" :maskSize="30">
                    <div class="flex items-center gap-1.5 py-1">
                      <button 
                        v-for="cat in spec.categories" :key="cat.id" @click.stop="toggleActiveTab(spec.id, cat.id)"
                        :class="activeTabMap[spec.id] === cat.id ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-rose-500/50'"
                        class="text-[0.6rem] font-bold border px-3 py-1.5 uppercase tracking-widest transition-all whitespace-nowrap shrink-0"
                      >
                        {{ cat.name }}
                      </button>
                    </div>
                  </BaseScroll>
                  
                  <Transition name="fade">
                    <div v-if="activeTabMap[spec.id]" class="mt-3">
                      <BaseScroll accent="rose" :maskSize="24">
                        <div class="flex items-center gap-1 py-1">
                          <div 
                            v-for="ex in spec.categories.find(c => c.id === activeTabMap[spec.id])?.exercises" :key="ex.id" 
                            class="text-[0.55rem] font-bold bg-slate-900 text-rose-400 px-2.5 py-1 border border-rose-500/10 uppercase tracking-widest whitespace-nowrap shrink-0"
                          >
                            {{ ex.name }}
                          </div>
                        </div>
                      </BaseScroll>
                    </div>
                  </Transition>
                </div>
              </div>
            </BaseCard>
          </div>
          <!-- Empty State Grid -->
          <div v-else class="flex flex-col items-center justify-center py-40 opacity-10 gap-8">
            <Activity class="w-32 h-32" />
            <span class="text-sm font-black uppercase tracking-[0.5em]">HİÇBİR BRANŞ BULUNAMADI</span>
          </div>
        </BaseScroll>

        <!-- List View (BaseTable handles its own scroll) -->
        <div v-else class="h-full flex flex-col px-[15px] pt-1 pb-24">
          <BaseTable
            :columns="mainColumns"
            :items="filteredSpecialties"
            :selected-ids="selectedSpecialties"
            accent="rose"
            @rowClick="toggleSelection($event.id)"
          >
            <template #cell-icon="{ item }">
               <div :class="['w-10 h-10 border flex items-center justify-center relative overflow-hidden mx-auto', branchConfig[item.name]?.glow || 'bg-slate-900', branchConfig[item.name]?.border || 'border-slate-700']">
                  <component :is="branchConfig[item.name]?.icon || Activity" :class="['w-5 h-5', branchConfig[item.name]?.color || 'text-rose-500']" />
               </div>
            </template>
            <template #cell-name="{ value }">
               <span class="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight">{{ value }}</span>
            </template>
            <template #cell-categories="{ item }">
               <div class="flex flex-wrap gap-1">
                  <span v-for="cat in item.categories" :key="cat.id" class="text-[0.6rem] font-black bg-rose-500/5 text-rose-500 px-2 py-0.5 border border-rose-500/10 uppercase tracking-widest leading-none">
                    {{ cat.name }}
                  </span>
               </div>
            </template>
            <template #cell-status="{ item }">
               <div class="flex items-center justify-center">
                  <span :class="item.isActive ? 'text-emerald-500' : 'text-rose-500'" class="text-[0.6rem] font-black uppercase tracking-[0.2em]">
                     {{ item.isActive ? 'AKTİF' : 'PASİF' }}
                  </span>
               </div>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>

    <BaseActionFooter>
      <!-- Center Pillar -->
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="showAddModal ? (showAddModal = false) : $router.push('/')" title="GERİ">
          <template #icon><ArrowLeft class="w-5 h-5" /></template>
        </BaseButton>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <template v-if="!showAddModal">
          <BaseButton 
            variant="primary" 
            size="icon" 
            square
            @click="openCreateForm"
            title="YENİ BRANŞ TANIMLA"
          >
            <template #icon><Plus class="w-5 h-5" /></template>
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton 
            :variant="newSpec.id ? 'warning' : 'success'" 
            size="icon" 
            square
            :loading="loading"
            @click="triggerFormSubmit"
            :title="newSpec.id ? 'GÜNCELLE' : 'KAYDET'"
          >
            <template #icon>
              <Save v-if="newSpec.id" class="w-5 h-5" />
              <Check v-else class="w-5 h-5" />
            </template>
          </BaseButton>
        </template>

        <!-- Selection-Based Contextual Actions (Grouped in center) -->
        <Transition name="fade-slide">
          <div v-if="!showAddModal && selectedSpecialties.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
            <template v-if="selectedSpecialties.length === 1">
              <BaseButton 
                variant="toggle"
                :active="specialties.find(s => s.id === selectedSpecialties[0])?.isActive"
                size="icon" square
                @click="toggleSpecialtyStatus(specialties.find(s => s.id === selectedSpecialties[0]))"
                title="DURUM"
              >
                <template #icon><Power class="w-5 h-5" /></template>
              </BaseButton>
              <BaseButton 
                variant="warning" 
                size="icon" square
                @click="startEdit(specialties.find(s => s.id === selectedSpecialties[0]))"
                title="DÜZENLE"
              >
                <template #icon><Edit class="w-5 h-5" /></template>
              </BaseButton>
              <BaseButton 
                v-if="specialties.find(s => s.id === selectedSpecialties[0])?.name.toLowerCase().includes('futbol')"
                variant="indigo" 
                size="icon" square
                @click="openFormationManager(specialties.find(s => s.id === selectedSpecialties[0]))"
                title="DİZİLİM YÖNETİMİ"
              >
                <template #icon><LayoutGrid class="w-5 h-5" /></template>
              </BaseButton>
            </template>

            <BaseButton variant="danger" size="icon" square @click="batchDelete" title="SİL">
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>
            
            <BaseButton variant="ghost" size="icon" square @click="selectedSpecialties = []" title="İPTAL">
              <template #icon><XCircle class="w-5 h-5" /></template>
            </BaseButton>
          </div>
        </Transition>
      </div>
    </BaseActionFooter>

    <!-- Integrated Form (Overlay Style) -->
    <Transition name="fade-slide">
      <div v-if="showAddModal" class="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden">
        <!-- Form Body -->
        <form id="specialtyForm" @submit.prevent="addSpecialty" class="flex-1 flex flex-col overflow-hidden">
          <div class="overflow-y-auto flex-1 px-[15px] pt-4 pb-24 custom-scrollbar">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              
              <!-- Left Side: Basic Config -->
              <div class="space-y-8 flex flex-col">
                <BaseCard accent="rose">
                  <div class="space-y-6">
                    <div class="flex items-center gap-3 py-3 border-b border-rose-600/40">
                      <Activity class="w-4 h-4 text-rose-500" />
                      <span class="text-[0.8rem] font-black text-slate-100 uppercase tracking-widest">TEMEL KONFİGÜRASYON</span>
                    </div>

                    <div class="space-y-4">
                      <BaseInput 
                        v-model="newSpec.name" 
                        label="BRANŞ ADI (Fitness, Yoga vb.)" 
                        placeholder="BRANŞ İSMİ..." 
                        required 
                      >
                        <template #icon><Activity class="w-4 h-4 text-rose-500" /></template>
                      </BaseInput>

                      <div class="p-4 px-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center justify-between group/sw hover:border-rose-500/20 transition-all">
                         <div class="flex flex-col gap-1">
                            <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-widest group-hover/sw:text-rose-500 transition-colors">BRANŞ DURUMU / AKTİF ET</span>
                            <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">{{ newSpec.isActive ? 'BU BRANŞ ÜYELER İÇİN ERİŞİLEBİLİR' : 'ŞU AN GAYRİ AKTİF / GİZLİ' }}</span>
                         </div>
                         <BaseSwitch v-model="newSpec.isActive" accent="rose" />
                      </div>

                      <BaseInput 
                        v-model="newSpec.facilityType"
                        type="select"
                        label="TESİS BİRİMİ"
                      >
                         <template #icon><LayoutGrid class="w-4 h-4 text-emerald-400" /></template>
                         <option value="SALON">SALON (Fitness, Dojo, Studio)</option>
                         <option value="SAHA">SAHA / KORT (Futbol, Tenis vb.)</option>
                         <option value="HAVUZ">HAVUZ (Yüzme, Su Topu vb.)</option>
                         <option value="DIGER">DİĞER HİZMETLER</option>
                      </BaseInput>

                      <BaseInput 
                        v-model="newSpec.description" 
                        type="textarea"
                        label="BRANŞ AÇIKLAMASI" 
                        placeholder="BRANŞ HAKKINDA GENEL BİLGİ..." 
                        :rows="3"
                      >
                        <template #icon><FileText class="w-4 h-4 text-slate-500" /></template>
                      </BaseInput>

                      <BaseInput 
                        v-model="beltsText" 
                        type="textarea"
                        label="KUŞAK SIRALAMASI" 
                        placeholder="BEYAZ, SARI, YEŞİL, MAVİ..." 
                        class="h-32"
                        :rows="4"
                      >
                        <template #icon><ListOrdered class="w-4 h-4 text-amber-500" /></template>
                      </BaseInput>
                      <div class="p-4 px-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center justify-between group/sw hover:border-amber-500/20 transition-all">
                         <div class="flex flex-col gap-1">
                            <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-widest group-hover/sw:text-amber-500 transition-colors">KUŞAKLI BRANŞ MI?</span>
                            <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">{{ newSpec.hasBelts ? 'EVET - KUŞAK SINAVI YAPILIR' : 'HAYIR - STANDART BRANŞ' }}</span>
                         </div>
                         <BaseSwitch v-model="newSpec.hasBelts" accent="amber" />
                      </div>

                      <!-- Formation Management Integration in Form -->
                      <div v-if="newSpec.name.toLowerCase().includes('futbol') && newSpec.id" class="pt-4 border-t border-slate-800/60 mt-4">
                        <BaseButton 
                          variant="indigo" 
                          class="w-full !justify-start gap-4 p-6 !rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 group/form-btn"
                          @click="router.push(`/specialties/${newSpec.id}/formations`)"
                        >
                          <template #icon>
                            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover/form-btn:scale-110 transition-transform">
                              <LayoutGrid class="w-5 h-5 text-indigo-400" />
                            </div>
                          </template>
                          <div class="flex flex-col items-start gap-0.5">
                            <span class="text-[0.75rem] font-black text-white uppercase tracking-widest">SAHA DİZİLİMLERİNİ YÖNET</span>
                            <span class="text-[0.55rem] text-indigo-400/60 font-bold uppercase tracking-tighter">STRATEJİK TAKTİK VE FORMASYONLAR</span>
                          </div>
                        </BaseButton>
                      </div>
                      <div v-else-if="newSpec.name.toLowerCase().includes('futbol') && !newSpec.id" class="p-4 bg-indigo-500/5 border border-dashed border-indigo-500/20 rounded-2xl text-center">
                        <p class="text-[0.55rem] text-indigo-400 font-black uppercase tracking-widest">DİZİLİM EKLEMEK İÇİN ÖNCE BRANŞI KAYDEDİN</p>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <!-- Right Side: Categories & Exercises -->
              <div class="space-y-8 flex flex-col">
                <BaseCard accent="indigo">
                  <div class="space-y-6 h-full flex flex-col">
                    <div class="flex items-center gap-3 py-3 border-b border-indigo-500/40">
                      <LayoutGrid class="w-4 h-4 text-indigo-400" />
                      <span class="text-[0.8rem] font-black text-slate-100 uppercase tracking-widest">ALT GRUPLAR VE EGZERSİZLER</span>
                    </div>

                    <div class="flex gap-2">
                       <div class="flex-1">
                          <BaseInput 
                            v-model="newCategoryName" 
                            placeholder="YENİ GRUP EKLE (Örn: GÖĞÜS)..." 
                            bg="slate-900"
                            class="!h-12"
                            @keypress.enter.prevent="addCategory" 
                          />
                       </div>
                       <BaseButton variant="primary" size="icon" square @click="addCategory" class="h-12 w-12 shrink-0">
                          <template #icon><Plus class="w-5 h-5" /></template>
                       </BaseButton>
                    </div>

                    <div class="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 max-h-[500px]">
                      <div v-for="(cat, index) in specialtyCategories" :key="cat.id || index" 
                           @click="selectedCategoryIndex = index"
                           :class="[
                             'group bg-slate-900/50 border transition-all p-4 rounded-xl cursor-pointer',
                             selectedCategoryIndex === index ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-800 hover:border-indigo-500/30'
                           ]">
                        <div class="flex items-center justify-between mb-3">
                          <span class="text-[0.7rem] font-black text-slate-200 uppercase tracking-widest ">{{ cat.name }}</span>
                          <button type="button" @click.stop="deleteCategory(cat.id, index)" class="text-slate-600 hover:text-rose-500 transition-colors">
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div class="flex flex-wrap gap-1.5 mb-3">
                          <div v-for="ex in (cat.Exercises || [])" :key="ex.id" class="text-[0.55rem] font-black bg-indigo-500/5 text-indigo-400 px-2.5 py-1 border border-indigo-500/10 uppercase tracking-widest leading-none">
                            {{ ex.name }}
                          </div>
                          <div v-if="!(cat.Exercises || []).length" class="text-[0.5rem] text-slate-700 uppercase font-black italic">Henüz çalışma tanımlanmadı...</div>
                        </div>

                        <div class="flex gap-1 mt-auto">
                          <input v-model="cat.newExName" placeholder="HIZLI EKLE..." 
                                 class="flex-1 bg-slate-950/50 border border-slate-800 px-3 py-1.5 text-[0.6rem] text-white outline-none focus:border-indigo-500 font-black uppercase tracking-widest placeholder:text-slate-800"
                                 @keypress.enter.prevent="addQuickExercise(cat)" />
                          <button type="button" @click.stop="addQuickExercise(cat)" class="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 text-indigo-400 hover:bg-slate-700 transition-colors"><Plus class="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <!-- Extra Column: Category Photo Reference -->
              <div class="space-y-8 flex flex-col">
                <BaseCard accent="emerald" class="h-full">
                  <div class="space-y-6 h-full flex flex-col">
                    <div class="flex items-center gap-3 py-3 border-b border-emerald-500/40">
                      <ImageIcon class="w-4 h-4 text-emerald-400" />
                      <span class="text-[0.8rem] font-black text-slate-100 uppercase tracking-widest">GÖRSEL REFERANS</span>
                    </div>

                    <div v-if="selectedCategoryIndex !== null && specialtyCategories[selectedCategoryIndex]" class="flex-1 flex flex-col">
                      <div class="p-4 bg-slate-900 border border-slate-800 mb-6">
                        <p class="text-[0.6rem] text-slate-500 font-black uppercase tracking-widest mb-1">SEÇİLİ ALT GRUP</p>
                        <p class="text-sm font-black text-emerald-400 uppercase tracking-tighter">{{ specialtyCategories[selectedCategoryIndex].name }}</p>
                      </div>

                      <div class="flex-1 flex flex-col items-center justify-center bg-slate-950/50 border border-dashed border-slate-800 p-8">
                        <BaseImageUpload 
                          v-model="specialtyCategories[selectedCategoryIndex].photo"
                          @change="(val) => handleCategoryPhotoUpload(selectedCategoryIndex, val)"
                          :width="'100%'"
                          :height="'300px'"
                        />
                        <div class="mt-6 text-center space-y-2">
                          <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            BU GRUP İÇİN ANATOMİ VEYA <br/> İSTASYON REFERANS RESMİ EKLEYİN
                          </p>
                          <p class="text-[0.55rem] text-slate-600 font-medium uppercase italic">Egzersiz planlarken referans olarak gösterilir.</p>
                        </div>
                      </div>
                    </div>

                    <div v-else class="flex-1 flex flex-col items-center justify-center opacity-20 gap-4 border border-dashed border-slate-800">
                      <ImageIcon class="w-12 h-12" />
                      <span class="text-[0.6rem] font-black uppercase tracking-[0.3em] text-center px-10 leading-relaxed">RESİM EKLEMEK İÇİN <br/> BİR ALT GRUP SEÇİN</span>
                    </div>
                  </div>
                </BaseCard>
              </div>

            </div>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Activity, Plus, Trash2, X, Edit, Dumbbell, Target, Music, 
  Footprints, Circle, Search, LayoutGrid, List, ChevronDown, Flower, Save, Check, Loader2,
  Power, FileText, ListOrdered, XCircle, Image as ImageIcon, ArrowLeft
} from 'lucide-vue-next';

// Base Components
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSwitch from '../../components/base/BaseSwitch.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseImageUpload from '../../components/base/BaseImageUpload.vue'

// Services & Composables
import { specialtyService } from '../../services/sport/specialtyService'
import { useSpecialties } from '../../composables/useSpecialties'
import { useAlerts } from '../../utils/alerts'

const router = useRouter()
const { toast, confirm, error: showAlertError } = useAlerts()

const {
  specialties,
  loading: globalLoading,
  fetchSpecialties
} = useSpecialties()

const mainColumns = [
  { key: 'icon', label: 'SİMGE', width: '80px', align: 'center' },
  { key: 'name', label: 'BRANŞ ADI' },
  { key: 'categories', label: 'ALT BAŞLIKLAR' },
  { key: 'status', label: 'DURUM', align: 'center' }
]

const showAddModal = ref(false)
const loading = ref(false)
const viewMode = ref('list')
const searchQuery = ref('')
const selectedSpecialties = ref([])

const toggleSelection = (id) => {
   selectedSpecialties.value = selectedSpecialties.value.includes(id) ? [] : [id]
}

const openFormationManager = (spec) => {
  router.push(`/specialties/${spec.id}/formations`)
}

const batchDelete = async () => {
   if (selectedSpecialties.value.length === 0) return
   
   const isConfirmed = await confirm('EMİN MİSİNİZ?', `Seçili ${selectedSpecialties.value.length} branş silinecek. Pasif kayıtları silmeniz önerilir!`)
   if (isConfirmed) {
      loading.value = true
      try {
         await specialtyService.batchDelete(selectedSpecialties.value)
         toast('Seçili branşlar silindi.')
         selectedSpecialties.value = []
         fetchSpecialties()
      } catch (err) {
         showAlertError('İŞLEM BAŞARISIZ', err.response?.data?.message || 'Bazı branşlar silinemedi. Kullanımda olabilirler.')
         fetchSpecialties()
      } finally {
         loading.value = false
      }
   }
}

const branchConfig = {
  'Fitness': { icon: Dumbbell, color: 'text-emerald-400', glow: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  'Yoga': { icon: Flower, color: 'text-amber-400', glow: 'bg-amber-500/20', border: 'border-amber-500/30' },
  'Tekvando': { icon: Footprints, color: 'text-rose-400', glow: 'bg-rose-500/20', border: 'border-rose-500/30' },
  'Plates': { icon: Circle, color: 'text-indigo-400', glow: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
  'Box': { icon: Target, color: 'text-orange-400', glow: 'bg-orange-500/20', border: 'border-orange-500/30' },
  'Zumba': { icon: Music, color: 'text-pink-400', glow: 'bg-pink-500/20', border: 'border-pink-500/30' }
}

const activeTabMap = ref({})
const newSpec = ref({ id: null, name: '', description: '', isActive: true, facilityType: 'SALON', hasBelts: false, belts: [] })

const beltsText = computed({
  get: () => newSpec.value.belts ? newSpec.value.belts.join(', ') : '',
  set: (val) => {
    newSpec.value.belts = val.split(',').map(s => s.trim()).filter(s => s !== '')
    if (newSpec.value.belts.length > 0) newSpec.value.hasBelts = true
  }
})

const specialtyCategories = ref([])
const newCategoryName = ref('')
const selectedCategoryIndex = ref(null)

const handleCategoryPhotoUpload = async (index, file) => {
  const cat = specialtyCategories.value[index]
  if (!cat) return
  
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result
      if (cat.id) {
        loading.value = true
        try {
          await specialtyService.updateCategory(cat.id, { photo: base64 })
          cat.photo = base64
        } catch (err) {
          console.error('Kategori resmi güncellenemedi:', err)
        } finally {
          loading.value = false
        }
      } else {
        cat.photo = base64
      }
    }
    reader.readAsDataURL(file)
  } else {
    if (cat.id) {
      loading.value = true
      try {
        await specialtyService.updateCategory(cat.id, { photo: null })
        cat.photo = null
      } catch (err) {
        console.error('Kategori resmi silinemedi:', err)
      } finally {
        loading.value = false
      }
    } else {
      cat.photo = null
    }
  }
}

const triggerFormSubmit = () => {
  const form = document.getElementById('specialtyForm')
  if (form) form.requestSubmit()
}

const toggleActiveTab = (specId, catId) => {
  activeTabMap.value[specId] = activeTabMap.value[specId] === catId ? null : catId
}

const filteredSpecialties = computed(() => {
  if (!searchQuery.value) return specialties.value
  const query = searchQuery.value.toLowerCase()
  return specialties.value.filter(spec => 
    spec.name?.toLowerCase().includes(query) ||
    spec.description?.toLowerCase().includes(query)
  )
})

const openCreateForm = () => {
  newSpec.value = { id: null, name: '', description: '', isActive: true, facilityType: 'SALON', hasBelts: false, belts: [] }
  specialtyCategories.value = []
  newCategoryName.value = ''
  selectedCategoryIndex.value = null
  showAddModal.value = true
}

const startEdit = async (spec) => {
  newSpec.value = { ...spec }
  await fetchCategories(spec.id)
  selectedCategoryIndex.value = specialtyCategories.value.length > 0 ? 0 : null
  showAddModal.value = true
}

const toggleSpecialtyStatus = async (spec) => {
  if (!spec) return
  loading.value = true
  try {
    await specialtyService.toggleStatus(spec.id)
    spec.isActive = !spec.isActive
    toast('Durum güncellendi.')
    fetchSpecialties()
  } catch (err) {
    showAlertError('İŞLEM ENGELLENDİ', err.response?.data?.message || 'Branş durumu güncellenemedi.')
    fetchSpecialties()
  } finally {
    loading.value = false
  }
}

const addSpecialty = async () => {
  loading.value = true
  try {
    if (newSpec.value.belts?.length > 0) newSpec.value.hasBelts = true

    let specId = newSpec.value.id
    if (specId) {
       await specialtyService.update(specId, newSpec.value)
    } else {
       const response = await specialtyService.create(newSpec.value)
       specId = response.data.id
    }

    if (!newSpec.value.id && specialtyCategories.value.length > 0) {
      for (const cat of specialtyCategories.value) {
        await specialtyService.createCategory({
          name: cat.name,
          specialtyId: specId,
          photo: cat.photo
        })
      }
    }
    
    toast(newSpec.value.id ? 'Branş Güncellendi' : 'Branş Eklendi')
    showAddModal.value = false
    fetchSpecialties()
  } catch (err) {
    showAlertError('Hata', err.response?.data?.message || 'Branş eklenirken bir sorun oluştu.')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async (specId) => {
  try {
    const data = await specialtyService.getCategories(specId)
    specialtyCategories.value = data.map(cat => ({
      ...cat,
      Exercises: cat.exercises || [],
      newExName: ''
    }))
  } catch (err) {
    console.error('Alt başlıklar yüklenemedi:', err)
  }
}

const addCategory = async () => {
  if (!newCategoryName.value) return
  if (newSpec.value.id) {
    try {
      await specialtyService.createCategory({
        name: newCategoryName.value,
        specialtyId: newSpec.value.id
      })
      newCategoryName.value = ''
      await fetchCategories(newSpec.value.id)
    } catch (err) {
      console.error('Alt başlık eklenemedi:', err)
    }
  } else {
    specialtyCategories.value.push({ name: newCategoryName.value, Exercises: [], newExName: '' })
    newCategoryName.value = ''
  }
}

const addQuickExercise = async (cat) => {
  if (!cat.newExName) return
  if (newSpec.value.id && cat.id) {
    try {
      await specialtyService.createExercise({
        name: cat.newExName,
        specialtyId: newSpec.value.id,
        categoryId: cat.id,
        criterionType: 'SETS_REPS',
        caloriesPerMinute: 10
      })
      cat.newExName = ''
      await fetchCategories(newSpec.value.id)
    } catch (err) {
      console.error('Egzersiz eklenemedi:', err)
    }
  } else {
    cat.Exercises.push({ name: cat.newExName })
    cat.newExName = ''
  }
}

const deleteCategory = async (catId, index) => {
  const isConfirmed = await confirm('SİLME ONAYI', 'Alt grup ve içindeki egzersizler silinecektir. Emin misiniz?')
  if (isConfirmed) {
    if (catId) {
      try {
        await specialtyService.deleteCategory(catId)
        await fetchCategories(newSpec.value.id)
      } catch (err) {
        showAlertError('HATA', 'Grup silinemedi.')
      }
    } else {
      specialtyCategories.value.splice(index, 1)
    }
  }
}

onMounted(() => {
  fetchSpecialties()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
