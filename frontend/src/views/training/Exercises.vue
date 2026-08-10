<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    
    <!-- Standardized Search & Filter -->
    <BaseSearchFilter 
      v-model:searchQuery="searchQuery" 
      v-model:viewMode="viewMode" 
      placeholder="İSTASYON, BÖLGE VEYA AÇIKLAMA ARA..."
      accent="indigo"
    />

    <!-- Sub Navigation (Tabs) -->
    <div class="flex-none px-4 mb-2 z-30">
      <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-2xl overflow-hidden">
        <BaseScroll accent="indigo" :maskSize="40">
          <div class="px-4 py-3 flex items-center gap-3">
            <button 
              @click="selectedSpecialty = null" 
              :class="!selectedSpecialty ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-950/50 text-slate-500 hover:text-slate-300 border border-slate-700/50'" 
              class="px-6 py-2 text-[0.7rem] font-bold transition-all flex-shrink-0 uppercase tracking-widest border border-transparent shadow-indigo-600/10"
            >
              TÜM BRANŞLAR
            </button>
            <button 
              v-for="spec in specialties" 
              :key="spec.id" 
              @click="selectedSpecialty = spec.id" 
              :class="selectedSpecialty === spec.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-950/50 text-slate-500 hover:text-slate-300 border border-slate-700/50'" 
              class="px-5 py-2 text-[0.7rem] font-bold transition-all flex-shrink-0 uppercase tracking-widest border border-transparent"
            >
              {{ spec.name }}
            </button>
          </div>
        </BaseScroll>
        
        <!-- Category Sub-Tabs -->
        <Transition name="slide-up">
          <div v-if="selectedSpecialty && categories.length > 0" class="border-t border-slate-800/50 pt-1 pb-2 px-4 bg-slate-950/20">
            <BaseScroll accent="rose" :maskSize="30">
              <div class="flex items-center gap-2 py-1">
                <button 
                  @click="selectedCategory = null" 
                  :class="!selectedCategory ? 'bg-rose-600/20 text-rose-400 border-rose-500/40' : 'bg-slate-900/40 text-slate-600 border-slate-800'" 
                  class="px-4 py-1.5 text-[0.6rem] font-black transition-all flex-shrink-0 uppercase tracking-wider border shadow-sm"
                >
                  GRUP HEPSİ
                </button>
                <button 
                  v-for="cat in categories" 
                  :key="cat.id" 
                  @click="selectedCategory = cat.id" 
                  :class="selectedCategory === cat.id ? 'bg-rose-600/20 text-rose-400 border-rose-500/40' : 'bg-slate-900/40 text-slate-600 border-slate-800'" 
                  class="px-4 py-1.5 text-[0.6rem] font-black transition-all flex-shrink-0 uppercase tracking-wider border"
                >
                  {{ cat.name }}
                </button>
              </div>
            </BaseScroll>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Main Dynamic Area -->
    <div class="flex-1 relative flex flex-col min-h-0 overflow-hidden px-4">
      
      <!-- Grid View -->
      <template v-if="viewMode === 'grid'">
        <BaseScroll class="flex-1 pb-4 pt-2" accent="indigo" allowX>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <div v-for="ex in filteredExercises" :key="ex.id" 
                 @click="toggleSelection(ex.id)"
                 :class="selectedExercises.includes(ex.id) ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_25px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50'"
                 class="group p-5 transition-all flex flex-col gap-5 relative overflow-hidden text-left border cursor-pointer backdrop-blur-sm">
              
              <!-- Selection indicator -->
              <div v-if="selectedExercises.includes(ex.id)" class="absolute top-0 left-0 z-20 bg-indigo-600 text-white p-2">
                <Check class="w-4 h-4" />
              </div>

              <div class="flex justify-between items-start">
                <div :class="['w-14 h-14 border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl', branchConfig[ex.specialty?.name]?.glow || 'bg-slate-950', branchConfig[ex.specialty?.name]?.border || 'border-slate-800']">
                  <component :is="branchConfig[ex.specialty?.name]?.icon || Activity" :class="['w-7 h-7', branchConfig[ex.specialty?.name]?.color || 'text-indigo-400']" />
                </div>
                <div class="flex gap-1 items-center">
                  <!-- Status dot only (no switch in cards) -->
                  <span :class="ex.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'" class="w-2.5 h-2.5 rounded-full"></span>
                </div>
              </div>

              <div class="flex-1 flex flex-col gap-4 uppercase tracking-tight">
                <div class="space-y-2.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-[0.2em]">{{ ex.specialty?.name || 'GENEL' }}</span>
                    <span v-if="ex.category" class="text-[0.55rem] font-black text-rose-500 border border-rose-500/20 px-2 py-0.5 uppercase tracking-widest">{{ ex.category.name }}</span>
                    <span :class="ex.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'" class="w-2 h-2 rounded-full"></span>
                  </div>
                  <h3 class="text-[0.9rem] font-black text-white truncate tracking-widest leading-none">{{ ex.name }}</h3>
                  <p class="text-slate-500 text-[0.65rem] font-medium h-10 line-clamp-3 uppercase tracking-widest leading-relaxed">{{ ex.description || 'İSTASYON AÇIKLAMASI TANIMLANMAMIŞ' }}</p>
                </div>
                
                <div class="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-[0.5rem] text-slate-600 uppercase font-black tracking-[0.2em]">Seviye & Kriter</span>
                    <span class="text-[0.7rem] font-black text-indigo-400 uppercase mt-1">
                      LV {{ ex.level }} • {{ ex.criterionType === 'SETS_REPS' ? 'SET/TEKRAR' : ex.criterionType === 'DURATION' ? 'SÜRE' : 'ÖZEL' }}
                    </span>
                  </div>
                  <div class="bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-1">
                    <span class="text-[0.7rem] font-black text-white uppercase tracking-widest">{{ ex.caloriesPerMinute }} KCAL/DK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseScroll>
      </template>

      <!-- List View -->
      <BaseTable 
        v-else 
        :columns="exerciseColumns" 
        :items="filteredExercises"
        :selected-ids="selectedExercises"
        @rowClick="toggleSelection($event.id)"
        accent="indigo"
        class="flex-1"
      >
        <template #cell-icon="{ item }">
          <div class="flex justify-center">
            <div :class="['w-11 h-11 border flex items-center justify-center relative transition-all group-hover:scale-105', branchConfig[item.specialty?.name]?.glow || 'bg-slate-950', branchConfig[item.specialty?.name]?.border || 'border-slate-800']">
              <component :is="branchConfig[item.specialty?.name]?.icon || Activity" :class="['w-5 h-5 relative z-10', branchConfig[item.specialty?.name]?.color || 'text-indigo-400']" />
              <div v-if="selectedExercises.includes(item.id)" class="absolute inset-0 bg-indigo-600/80 flex items-center justify-center z-20 backdrop-blur-sm">
                <Check class="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </template>

        <template #cell-name="{ item }">
          <div class="flex flex-col uppercase tracking-tight gap-1">
            <span class="text-[0.8rem] font-black text-slate-100 group-hover:text-indigo-400 transition-colors tracking-widest">{{ item.name }}</span>
            <span class="text-[0.6rem] text-slate-500 font-medium truncate max-w-[280px]">{{ item.description || 'AÇIKLAMA YOK' }}</span>
          </div>
        </template>

        <template #cell-specialty="{ item }">
          <div class="flex flex-col uppercase tracking-widest gap-1.5">
             <span class="text-[0.65rem] font-black text-indigo-400 tracking-[0.1em]">{{ item.specialty?.name }}</span>
             <span v-if="item.category" class="text-[0.55rem] font-black text-rose-500 bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 self-start tracking-wider">
                {{ item.category.name }}
             </span>
          </div>
        </template>

        <template #cell-level="{ item }">
           <div class="flex justify-center">
              <span class="text-[0.7rem] bg-indigo-600/10 text-white px-3 py-1 border border-indigo-500/30 uppercase font-black tracking-widest shadow-lg shadow-indigo-600/5">
                 LV {{ item.level || 1 }}
              </span>
           </div>
        </template>

        <template #cell-criterion="{ item }">
          <div class="flex flex-col gap-1.5 items-center">
             <span class="text-[0.65rem] font-bold text-slate-300 uppercase tracking-widest">
                {{ item.criterionType === 'SETS_REPS' ? 'SET & TEKRAR' : item.criterionType === 'DURATION' ? 'SÜRE (DK)' : 'ÖZEL' }}
             </span>
             <span class="text-[0.55rem] font-black text-emerald-500 opacity-80 uppercase tracking-tighter">{{ item.caloriesPerMinute }} KCAL / MIN</span>
          </div>
        </template>

        <template #cell-status="{ item }">
           <div class="flex justify-center">
              <span :class="item.isActive ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-slate-500 border-slate-700 bg-slate-950'" class="text-[0.6rem] font-black px-3 py-1 border uppercase tracking-widest transition-all">
                 {{ item.isActive ? 'AKTİF' : 'PASİF' }}
              </span>
           </div>
        </template>
      </BaseTable>

      <div v-if="filteredExercises.length === 0" class="py-24 text-center border-2 border-dashed border-slate-800 bg-slate-950/20 text-slate-700 font-black uppercase tracking-[0.4em] text-sm animate-pulse">SONUÇ BULUNAMADI</div>
    </div>

    <!-- Action Footer (Premium Centered Pill) -->
    <BaseActionFooter v-if="!showForm">
      <template #left>
        <transition name="fade">
          <div v-if="selectedExercises.length > 0" class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[0.6rem] font-black uppercase tracking-widest">
            {{ selectedExercises.length }} İSTASYON
          </div>
        </transition>
      </template>

      <!-- Center Pillar -->
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === 1"
            @click="fetchExercises({ page: currentPage - 1, search: searchQuery, specialtyId: selectedSpecialty, categoryId: selectedCategory })"
          >
            <template #icon><ChevronLeft class="w-4 h-4" /></template>
          </BaseButton>
          
          <div class="px-3 min-w-[80px] flex flex-col items-center">
            <span class="text-[0.45rem] text-slate-500 font-black uppercase tracking-widest">SAYFA</span>
            <span class="text-[0.7rem] font-black text-white font-mono">{{ currentPage }} / {{ totalPages }}</span>
          </div>

          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === totalPages"
            @click="fetchExercises({ page: currentPage + 1, search: searchQuery, specialtyId: selectedSpecialty, categoryId: selectedCategory })"
          >
            <template #icon><ChevronRight class="w-4 h-4" /></template>
          </BaseButton>
        </div>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <BaseButton 
          variant="primary" 
          size="icon" 
          square
          @click="showForm = true; editingId = null"
          title="YENİ İSTASYON EKLE"
        >
          <template #icon><Plus class="w-5 h-5" /></template>
        </BaseButton>

        <!-- Selection Contextual Actions (Grouped in center) -->
        <Transition name="fade-slide">
          <div v-if="selectedExercises.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
            <template v-if="selectedExercises.length === 1">
               <BaseButton 
                 variant="warning" 
                 size="icon" square title="DÜZENLE"
                 @click="startEdit(exercises.find(e => e.id === selectedExercises[0]))"
               >
                 <template #icon><Edit class="w-5 h-5" /></template>
               </BaseButton>

               <BaseButton 
                 variant="toggle"
                 :active="exercises.find(e => e.id === selectedExercises[0])?.isActive"
                 size="icon" square
                 @click="toggleExerciseStatus(exercises.find(e => e.id === selectedExercises[0]))"
                 title="DURUM"
               >
                 <template #icon><Power class="w-5 h-5" /></template>
               </BaseButton>
            </template>

            <BaseButton variant="danger" size="icon" square @click="batchDelete" title="SİL">
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>
            
            <BaseButton variant="ghost" size="icon" square @click="selectedExercises = []" title="İPTAL">
              <template #icon><XCircle class="w-5 h-5" /></template>
            </BaseButton>
          </div>
        </Transition>
      </div>
    </BaseActionFooter>

    <!-- Integrated Form -->
    <Transition name="fade">
      <div v-if="showForm" class="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden">
        <BaseModalHeader 
          :title="editingId ? 'İSTASYONU GÜNCELLE' : 'YENİ İSTASYON TANIMLA'" 
          :subtitle="editingId ? 'Mevcut istasyon ayarlarını ve hesaplama kriterlerini düzenleyin' : 'Sisteme yeni bir egzersiz istasyonu ve kalori referansı ekleyin'"
          @close="closeForm"
          accent="indigo"
        />

        <form id="exerciseForm" @submit.prevent="addExercise" class="flex-1 flex flex-col overflow-hidden">
          <BaseScroll class="flex-1" accent="indigo" maskSize="60">
            <div class="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full">
              
              <!-- Classification -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-slate-900/40 p-6 border border-slate-800 space-y-4">
                  <div class="flex items-center gap-2 mb-2 p-2 bg-indigo-500/10 border border-indigo-500/20">
                    <LayoutGrid class="w-4 h-4 text-indigo-400" />
                    <span class="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">Branş & Kategori</span>
                  </div>
                  
                  <div class="space-y-4">
                    <div>
                      <BaseInput type="select" v-model="newEx.specialtyId" label="İlgili Branş" required>
                        <option value="" disabled>Branş Seçiniz</option>
                        <option v-for="spec in specialties" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                      </BaseInput>
                    </div>

                    <div>
                      <BaseInput type="select" v-model="newEx.categoryId" label="Alt Başlık (Grup)" :disabled="!newEx.specialtyId">
                        <option value="">Grup Yok</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </BaseInput>
                    </div>
                  </div>
                </div>

                <!-- Identification -->
                <div class="bg-slate-900/40 p-6 border border-slate-800 space-y-4 lg:col-span-2">
                  <div class="flex items-center gap-2 mb-2 p-2 bg-emerald-500/10 border border-emerald-500/20">
                    <Dumbbell class="w-4 h-4 text-emerald-400" />
                    <span class="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">İstasyon Tanımı</span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                      <div>
                        <BaseInput v-model="newEx.name" type="text" label="İstasyon Adı" required maxlength="50" placeholder="ÖRN: OMUZ PRESS..." />
                      </div>
                      <div>
                        <BaseInput type="select" v-model.number="newEx.level" label="Zorluk Seviyesi" required>
                          <option v-for="n in 20" :key="n" :value="n">LV {{ n }}</option>
                        </BaseInput>
                      </div>
                    </div>
                    <div>
                      <BaseInput type="textarea" v-model="newEx.description" label="Açıklama" :rows="5" maxlength="300" placeholder="İstasyon kullanım detayları ve hedeflenen kas grupları..." />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Calculation Section -->
              <div class="bg-slate-900/40 p-8 border border-slate-800 space-y-8">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div class="flex items-center gap-3">
                    <Activity class="w-5 h-5 text-rose-500" />
                    <div>
                      <h4 class="text-[0.8rem] font-black text-white tracking-[0.2em] uppercase">Kriter Tipi & Hesaplama Referansı</h4>
                      <p class="text-[0.55rem] text-slate-500 uppercase font-bold tracking-widest mt-1">Egzersiz sırasında yakılan enerjiyi hesaplamak için baz alınacak değerler</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div class="space-y-6">
                    <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-2">KRİTER TİPİ SEÇİNİZ</label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button 
                        v-for="type in [{v:'SETS_REPS', l:'SET & TEKRAR'}, {v:'DURATION', l:'SÜRE ODAKLI'}, {v:'ROUNDS_DURATION', l:'RAUND & SÜRE'}, {v:'HYBRID', l:'KARMA (HİBRİT)'}, {v:'REPS_ONLY', l:'SADECE TEKRAR'}]"
                        :key="type.v" type="button" @click="newEx.criterionType = type.v"
                        :class="newEx.criterionType === type.v ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'"
                        class="p-4 border text-center transition-all font-black text-[0.6rem] uppercase tracking-[0.15em] leading-tight"
                      >
                        {{ type.l }}
                      </button>
                    </div>
                  </div>

                  <div class="space-y-8">
                    <div class="grid grid-cols-2 gap-6">
                      <div class="space-y-3">
                        <BaseInput v-model.number="calculationDuration" @input="updateRate" type="number" step="0.5" min="0.5" label="REFERANS SÜRE (DK)" required />
                      </div>
                      <div class="space-y-3">
                        <BaseInput v-model.number="calculationTotalCalories" @input="updateRate" type="number" min="1" label="REFERANS YAKIM (KCAL)" required />
                      </div>
                    </div>

                    <div class="relative p-6 bg-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center overflow-hidden">
                       <div class="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
                       <p class="relative z-10 text-[0.55rem] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">HESAPLANAN DAKİKALIK YAKIM</p>
                       <p class="relative z-10 text-4xl font-black text-white tracking-tighter">
                         {{ newEx.caloriesPerMinute }} 
                         <span class="text-xs uppercase text-slate-500 ml-2 font-bold tracking-widest">kcal / dk</span>
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status & Extra -->
              <div class="flex flex-col md:flex-row gap-6">
                <label @click.stop class="flex-1 flex items-center justify-between p-6 bg-slate-900/40 border border-slate-800 cursor-pointer group hover:bg-slate-900/60 transition-all">
                  <div class="flex items-center gap-4">
                    <div :class="newEx.isActive ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'" class="w-12 h-12 border flex items-center justify-center transition-all">
                      <Activity :class="newEx.isActive ? 'text-emerald-400' : 'text-slate-600'" class="w-6 h-6" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[0.7rem] font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">İstasyon Durumu</span>
                      <span class="text-[0.55rem] text-slate-600 uppercase font-bold tracking-widest mt-1">{{ newEx.isActive ? 'ÜYE PROGRAMLARINDA KULLANILABİLİR' : 'GEÇİCİ OLARAK KULLANIM DIŞI' }}</span>
                    </div>
                  </div>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="newEx.isActive" class="sr-only peer">
                    <div class="w-12 h-6 bg-slate-950 border border-slate-800 rounded-full peer peer-checked:bg-emerald-600 transition-all duration-300 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-600 after:rounded-full after:h-5 after:w-5 
                                after:transition-all peer-checked:after:translate-x-6 peer-checked:after:bg-white shadow-xl"></div>
                  </div>
                </label>
              </div>

            </div>
          </BaseScroll>

          <!-- Action Footer for Form View: Grouped Navigation & Submit -->
          <BaseActionFooter>
            <div class="flex items-center gap-[10px]">
              <BaseButton variant="dark" size="icon" square @click="closeForm" title="VAZGEÇ">
                <template #icon><X class="w-5 h-5" /></template>
              </BaseButton>

              <div class="w-px h-6 bg-slate-800 mx-1"></div>
  
              <BaseButton 
                :variant="editingId ? 'warning' : 'success'" 
                size="icon" 
                square
                :loading="loading" 
                @click="addExercise"
                :title="editingId ? 'GÜNCELLE' : 'KAYDET'"
              >
                <template #icon>
                  <Save v-if="editingId" class="w-5 h-5" />
                  <Check v-else class="w-5 h-5" />
                </template>
              </BaseButton>
            </div>
          </BaseActionFooter>
        </form>

      </div>
    </Transition>
  </div>
</template>



<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Dumbbell, Plus, Trash2, X, ChevronDown, Flower, Save, Check, Loader2,
  Footprints, Circle, Target, Music, Search, LayoutGrid, List, Activity, Edit, Power, XCircle, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseModalHeader from '../../components/base/BaseModalHeader.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import { exerciseService } from '../../services/training/exerciseService'
import { useExercises } from '../../composables/useExercises'
import { useAlerts } from '../../utils/alerts'

const router = useRouter()
const { 
  exercises, totalExercises, totalPages, currentPage, specialties, categories, loading, 
  fetchExercises, fetchSpecialties, fetchCategories, deleteExercise, toggleStatus 
} = useExercises()
const { toast, error: showAlertError, confirm } = useAlerts()

const exerciseColumns = [
  { key: 'icon',      label: 'SİMGE',          align: 'center' },
  { key: 'name',      label: 'İSTASYON BİLGİSİ', sortable: true },
  { key: 'specialty', label: 'BRANŞ / GRUP',   sortable: true },
  { key: 'level',     label: 'SEVİYE',          align: 'center', sortable: true },
  { key: 'criterion', label: 'KRİTER',          align: 'center' },
  { key: 'status',    label: 'DURUM',            align: 'center' },
]

const selectedSpecialty = ref(null)
const selectedCategory = ref(null)
const showForm = ref(false)
const editingId = ref(null)
const viewMode = ref('list')
const searchQuery = ref('')
const selectedExercises = ref([])
const calculationDuration = ref(1)

const toggleSelection = (id) => {
   selectedExercises.value = selectedExercises.value[0] === id ? [] : [id]
}

const batchDelete = async () => {
   if (selectedExercises.value.length === 0) return
   
   const isConfirmed = await confirm('Emin misiniz?', `Seçili ${selectedExercises.value.length} istasyon silinecek. Bu işlem geri alınamaz!`)

   if (isConfirmed) {
      try {
         await exerciseService.batchDelete(selectedExercises.value)
         toast('Seçili kayıtlar başarıyla silindi.')
         selectedExercises.value = []
         fetchExercises()
      } catch (err) {
         showAlertError('HATA', 'Bazı kayıtlar silinemedi.')
      }
   }
}
const calculationTotalCalories = ref(10)

const branchConfig = {
  'Fitness': { icon: Dumbbell, color: 'text-emerald-400', glow: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  'Yoga': { icon: Flower, color: 'text-amber-400', glow: 'bg-amber-500/20', border: 'border-amber-500/30' },
  'Tekvando': { icon: Footprints, color: 'text-rose-400', glow: 'bg-rose-500/20', border: 'border-rose-500/30' },
  'Plates': { icon: Circle, color: 'text-indigo-400', glow: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
  'Box': { icon: Target, color: 'text-orange-400', glow: 'bg-orange-500/20', border: 'border-orange-500/30' },
  'Zumba': { icon: Music, color: 'text-pink-400', glow: 'bg-pink-500/20', border: 'border-pink-500/30' }
}


const closeForm = () => {
  showForm.value = false
  editingId.value = null
  resetForm()
}

const triggerFormSubmit = () => {
  const form = document.getElementById('exerciseForm')
  if (form) form.requestSubmit()
}

const resetForm = () => {
  newEx.value = { 
    name: '', 
    specialtyId: '', 
    categoryId: '', 
    criterionType: 'SETS_REPS', 
    caloriesPerMinute: 10, 
    description: '',
    level: 1,
    isActive: true
  }
  calculationDuration.value = 1
  calculationTotalCalories.value = 10
}

watch(() => selectedSpecialty.value, () => {
  selectedCategory.value = null
})

const newEx = ref({
  name: '',
  specialtyId: '',
  categoryId: '',
  criterionType: 'SETS_REPS',
  caloriesPerMinute: 10,
  description: '',
  level: 1,
  isActive: true
})

const updateRate = () => {
  if (calculationDuration.value > 0) {
    newEx.value.caloriesPerMinute = parseFloat((calculationTotalCalories.value / calculationDuration.value).toFixed(2))
  }
}

watch(() => newEx.value.specialtyId, async (newVal) => {
    fetchCategories(newVal)
})



const filteredExercises = computed(() => exercises.value || [])

// Watch for search/filters
let debounceTimer;
watch([searchQuery, selectedSpecialty, selectedCategory], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchExercises({ 
      page: 1, 
      search: searchQuery.value, 
      specialtyId: selectedSpecialty.value, 
      categoryId: selectedCategory.value 
    })
  }, 300);
});

const startEdit = async (ex) => {
  editingId.value = ex.id
  newEx.value = { ...ex }
  calculationDuration.value = 1
  calculationTotalCalories.value = ex.caloriesPerMinute
  await fetchCategories(ex.specialtyId)
  showForm.value = true
}

const toggleExerciseStatus = async (ex) => {
  await toggleStatus(ex)
}

const addExercise = async () => {
  try {
    const isEdit = !!editingId.value
    if (isEdit) await exerciseService.update(editingId.value, newEx.value)
    else await exerciseService.create(newEx.value)
    toast(isEdit ? 'İstasyon Güncellendi' : 'İstasyon Eklendi')
    closeForm(); fetchExercises()
  } catch (err) {
    showAlertError('Hata', err.response?.data?.message || 'Bir sorun oluştu.')
  }
}

onMounted(() => { 
  fetchExercises({ page: 1 })
  fetchSpecialties() 
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
.custom-scrollbar-h::-webkit-scrollbar { height: 2px; }
.custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.1); }
</style>


