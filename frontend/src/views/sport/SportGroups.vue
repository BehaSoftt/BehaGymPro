<template>
  <div class="h-full flex flex-col min-h-0 bg-slate-900 overflow-hidden relative px-2">
    <!-- Base Search & Filters -->
    <BaseSearchFilter
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="TAKIM / GRUP ARA (İSİM, KATEGORİ)..."
      accent="indigo"
    >
      <template #extra-actions>
         <div class="flex items-center gap-2">
            <BaseInput 
              v-model="selectedSpecialtyId"
              type="select"
              class="!mb-0 w-48"
              bg="slate-950/50"
            >
               <option value="">TÜM BRANŞLAR</option>
               <optgroup v-if="groupedSpecialties.SALON?.length" label="[ TESİS: SALON ]">
                  <option v-for="spec in groupedSpecialties.SALON" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
               </optgroup>
               <optgroup v-if="groupedSpecialties.SAHA?.length" label="[ TESİS: SAHA / KORT ]">
                  <option v-for="spec in groupedSpecialties.SAHA" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
               </optgroup>
               <optgroup v-if="groupedSpecialties.HAVUZ?.length" label="[ TESİS: HAVUZ ]">
                  <option v-for="spec in groupedSpecialties.HAVUZ" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
               </optgroup>
               <optgroup v-if="groupedSpecialties.DIGER?.length" label="[ TESİS: DİĞER ]">
                  <option v-for="spec in groupedSpecialties.DIGER" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
               </optgroup>
            </BaseInput>
         </div>
      </template>
    </BaseSearchFilter>

    <!-- Content Area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Grid View -->
      <BaseScroll v-if="viewMode === 'grid'" direction="vertical" accent="indigo" class="px-[15px] pt-2 pb-24 h-full">
        <div v-if="filteredGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <BaseCard 
            v-for="group in filteredGroups" :key="group.id" 
            :selected="selectedGroups.includes(group.id)"
            selectable
            accent="indigo"
            @click="toggleSelection(group.id)"
          >
            <div class="flex flex-col h-full">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Users class="w-6 h-6 text-indigo-400" />
                </div>
                <BaseBadge :type="group.isActive ? 'success' : 'danger'">{{ group.isActive ? 'AKTİF' : 'PASİF' }}</BaseBadge>
              </div>
              
              <div class="space-y-1 mb-4">
                <h3 class="text-lg font-black text-slate-100 uppercase tracking-tight">{{ group.name }}</h3>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 border border-indigo-500/10">{{ group.specialty?.name }}</span>
                  <span v-if="group.category" class="text-[0.6rem] font-black text-slate-100 uppercase tracking-widest bg-indigo-600/20 px-2 py-0.5 border border-indigo-600/30">{{ group.category }}</span>
                  <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">{{ group.minAge }}-{{ group.maxAge }} YAŞ</span>
                </div>
              </div>

              <div class="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-[0.55rem] font-black text-slate-500 uppercase">ANTRENÖR</span>
                  <span class="text-[0.7rem] font-bold text-slate-300 uppercase">{{ group.instructor?.fullName || 'ATANMAMIŞ' }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[0.55rem] font-black text-slate-500 uppercase">KAPASİTE</span>
                  <span class="text-[0.7rem] font-bold text-slate-300 block">{{ group.memberCount || 0 }} / {{ group.maxCapacity }}</span>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-40 opacity-10 gap-8 text-center uppercase">
          <Users class="w-32 h-32" />
          <span class="text-sm font-black tracking-[0.5em]">HİÇBİR TAKIM / GRUP BULUNAMADI</span>
        </div>
      </BaseScroll>

      <!-- List View -->
      <div v-else class="h-full flex flex-col px-[15px] pt-1 pb-24">
        <BaseTable
          :columns="[
            { key: 'name', label: 'TAKIM / GRUP ADI' },
            { key: 'specialty', label: 'BRANŞ' },
            { key: 'ageRange', label: 'YAŞ GRUBU', align: 'center' },
            { key: 'instructor', label: 'EĞİTMEN / KOÇ' },
            { key: 'capacity', label: 'KAPASİTE', align: 'center' },
            { key: 'isActive', label: 'DURUM', align: 'center' }
          ]"
          :items="filteredGroups"
          :selected-ids="selectedGroups"
          accent="indigo"
          @rowClick="toggleSelection($event.id)"
        >
          <template #cell-name="{ item }">
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                   <Users class="w-4 h-4 text-indigo-400" />
                </div>
                <span class="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight">{{ item.name }}</span>
             </div>
          </template>
          <template #cell-specialty="{ item }">
             <span class="text-[0.65rem] font-black text-indigo-400 uppercase tracking-widest">{{ item.specialty?.name || '-' }}</span>
          </template>
          <template #cell-ageRange="{ item }">
             <div class="flex flex-col items-center">
                <span class="text-[0.7rem] font-black text-white italic tracking-tighter">{{ item.category || 'GENEL' }}</span>
                <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-[0.2em]">{{ item.minAge }} - {{ item.maxAge }} YAŞ</span>
             </div>
          </template>
          <template #cell-instructor="{ item }">
             <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{{ item.instructor?.fullName || 'ATANMAMIŞ' }}</span>
          </template>
          <template #cell-capacity="{ item }">
             <span class="text-[0.7rem] font-bold text-slate-300">{{ item.memberCount || 0 }} / {{ item.maxCapacity }}</span>
          </template>
          <template #cell-isActive="{ value }">
             <BaseBadge :type="value ? 'success' : 'danger'">{{ value ? 'AKTİF' : 'PASİF' }}</BaseBadge>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Action Footer -->
    <BaseActionFooter>
      <div class="flex items-center gap-3">
        <BaseButton variant="dark" size="icon" square @click="showForm ? (showForm = false) : $router.push('/')">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <template v-if="!showForm">
          <BaseButton variant="primary" size="icon" square @click="openCreateForm">
            <template #icon><Plus class="w-5 h-5" /></template>
          </BaseButton>
          
          <Transition name="fade-slide">
             <div v-if="selectedGroups.length === 1" class="flex items-center gap-3 border-l border-slate-800 pl-3">
                <BaseButton variant="primary" size="icon" square @click="openAddMemberModal" title="ÜYE EKLE">
                   <template #icon><UserPlus class="w-5 h-5" /></template>
                </BaseButton>
                <div class="w-px h-6 bg-slate-800 mx-1"></div>
                <BaseButton variant="warning" size="icon" square @click="startEdit(filteredGroups.find(g => g.id === selectedGroups[0]))">
                   <template #icon><Edit class="w-5 h-5" /></template>
                </BaseButton>
                <BaseButton variant="danger" size="icon" square @click="handleDelete(selectedGroups[0])">
                   <template #icon><Trash2 class="w-5 h-5" /></template>
                </BaseButton>
             </div>
          </Transition>
        </template>
        <template v-else>
          <BaseButton :variant="editingId ? 'warning' : 'success'" size="icon" square @click="saveGroup" :loading="loading">
            <template #icon>
               <Save v-if="editingId" class="w-5 h-5" />
               <Check v-else class="w-5 h-5" />
            </template>
          </BaseButton>
        </template>
      </div>
    </BaseActionFooter>

    <!-- Form Overlay -->
    <Transition name="fade-slide">
      <div v-if="showForm" class="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto px-[15px] pt-[15px] pb-[15px] custom-scrollbar">
          <div class="w-full min-h-full flex flex-col">

            <BaseCard class="flex-1 p-16 space-y-16">
              <BaseInput 
                v-model="form.name"
                label="TAKIM / GRUP ADI"
                placeholder="ÖRN: U12 A TAKIMI, FİTNESS SABAH GRUBU VB."
                required
              >
                 <template #icon><Users class="w-4 h-4 text-indigo-400" /></template>
              </BaseInput>

              <div class="grid grid-cols-2 gap-16">
                <!-- Branş Seçimi -->
                <BaseInput 
                  v-model="form.specialtyId"
                  type="select"
                  label="SPOR BRANŞI"
                  required
                >
                  <option value="">BRANŞ SEÇİNİZ</option>
                  <optgroup v-if="groupedSpecialties.SALON?.length" label="[ TESİS: SALON ]">
                     <option v-for="spec in groupedSpecialties.SALON" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                  </optgroup>
                  <optgroup v-if="groupedSpecialties.SAHA?.length" label="[ TESİS: SAHA / KORT ]">
                     <option v-for="spec in groupedSpecialties.SAHA" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                  </optgroup>
                  <optgroup v-if="groupedSpecialties.HAVUZ?.length" label="[ TESİS: HAVUZ ]">
                     <option v-for="spec in groupedSpecialties.HAVUZ" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                  </optgroup>
                  <optgroup v-if="groupedSpecialties.DIGER?.length" label="[ TESİS: DİĞER ]">
                     <option v-for="spec in groupedSpecialties.DIGER" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                  </optgroup>
                </BaseInput>
 
                <!-- Kategori / Yaş Grubu (Futbol ise Dropdown, değilse Text) -->
                <BaseInput 
                  :key="`cat-field-${isFootball}`"
                  v-model="form.category"
                  :type="isFootball ? 'select' : 'text'"
                  label="KATEGORİ / YAŞ GRUBU"
                  placeholder="Seçiniz veya yazınız..."
                  @update:modelValue="onCategoryChange"
                >
                   <template #icon><Star class="w-4 h-4 text-amber-500" /></template>
                   <!-- Sadece Futbol ise opsiyonlar görünür -->
                   <template v-if="isFootball">
                      <option value="">KATEGORİ SEÇİNİZ...</option>
                      <option v-for="cat in footballCategories" :key="cat.name" :value="cat.name">
                        {{ cat.name }} ({{ cat.min }}-{{ cat.max }} YAŞ)
                      </option>
                      <option value="DİĞER">DİĞER / ÖZEL KATEGORİ</option>
                   </template>
                </BaseInput>
              </div>

              <div class="grid grid-cols-2 gap-16">
                <BaseInput 
                  v-model="form.minAge"
                  type="number"
                  label="MİMİMUM YAŞ"
                  placeholder="0"
                >
                   <template #icon><Activity class="w-4 h-4 text-emerald-400" /></template>
                </BaseInput>

                <BaseInput 
                  v-model="form.maxAge"
                  type="number"
                  label="MAKSİMUM YAŞ"
                  placeholder="99"
                >
                   <template #icon><Activity class="w-4 h-4 text-rose-400" /></template>
                </BaseInput>
              </div>

              <div class="grid grid-cols-2 gap-16">
                <BaseInput 
                  v-model="form.instructorId"
                  type="select"
                  label="ANTRENÖR / SORUMLU HOCA"
                >
                  <option value="">SORUMLU SEÇİNİZ...</option>
                  <option v-for="inst in instructors" :key="inst.id" :value="inst.id">{{ inst.fullName }}</option>
                </BaseInput>

                <BaseInput 
                  v-model="form.maxCapacity"
                  type="number"
                  label="MAKSİMUM KAPASİTE"
                >
                   <template #icon><LayoutGrid class="w-4 h-4 text-slate-500" /></template>
                </BaseInput>
              </div>

              <div v-if="editingId" class="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-none">
               <div class="flex items-center gap-3 mb-4">
                  <Activity class="w-5 h-5 text-indigo-400" />
                  <span class="text-[0.7rem] font-black text-indigo-400 uppercase tracking-widest">TAKIM İSTATİSTİKLERİ</span>
               </div>
               <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="p-4 bg-slate-950/50">
                     <p class="text-[0.5rem] text-slate-500 font-bold uppercase mb-1">MEVCUT ÜYE</p>
                     <p class="text-xl font-black text-white">{{ currentGroupMembers.length }}</p>
                  </div>
                  <div class="p-4 bg-slate-950/50">
                     <p class="text-[0.5rem] text-slate-500 font-bold uppercase mb-1">DOLULUK</p>
                     <p class="text-xl font-black text-white">%{{ Math.round((currentGroupMembers.length / form.maxCapacity) * 100) || 0 }}</p>
                  </div>
                  <div class="p-4 bg-emerald-500/5">
                     <p class="text-[0.5rem] text-emerald-500/50 font-bold uppercase mb-1">KALAN KONTENJAN</p>
                     <p class="text-xl font-black text-emerald-400">{{ Math.max(0, form.maxCapacity - currentGroupMembers.length) }}</p>
                  </div>
               </div>
            </div>

              <div class="p-4 bg-slate-900/40 border border-slate-800 flex items-center justify-between">
                 <div class="flex flex-col gap-1">
                    <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-widest">GRUP DURUMU</span>
                    <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">{{ form.isActive ? 'GRUP AKTİF VE ÜYE ATAMASI YAPILABİLİR' : 'GRUP ŞU AN PASİF' }}</span>
                 </div>
                 <BaseSwitch v-model="form.isActive" accent="indigo" />
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Member Modal -->
    <Transition name="fade-slide">
       <div v-if="showAddMemberModal" class="absolute inset-0 z-[60] bg-slate-950/98 backdrop-blur-3xl flex flex-col overflow-hidden">
          
          <!-- Sub Header: Search & Info (Matching Packages Style) -->
          <BaseSearchFilter 
            v-model:searchQuery="memberSearchQuery" 
            v-model:viewMode="memberViewMode" 
            placeholder="ÜYE ARA (İSİM, KOD VEYA TEL)..." 
            accent="rose"
            class="!overflow-visible z-50 pt-4 w-[calc(100%-33px)] mx-auto"
          >
             <template #extra-left>
               <div class="h-full relative px-2 border-r border-slate-800/50">
                 <button 
                   type="button"
                   @click.stop="isMemberFilterDropdownOpen = !isMemberFilterDropdownOpen"
                   class="h-full px-4 flex items-center gap-2 hover:bg-slate-900/80 transition-all text-[0.65rem] font-black text-rose-400 uppercase cursor-pointer"
                 >
                   <span>{{ memberActiveTab === 'assigned' ? 'KAYITLI ÜYELER' : (memberActiveTab === 'unassigned' ? 'YENİ ÜYE EKLE' : 'TÜM ÜYELER') }}</span>
                   <ChevronDown class="w-3 h-3 text-rose-500/50 transition-transform duration-300" :class="{ 'rotate-180': isMemberFilterDropdownOpen }" />
                 </button>

                 <Transition name="fade-slide">
                   <div v-if="isMemberFilterDropdownOpen" class="absolute top-[calc(100%+12px)] left-0 w-64 bg-[#0a0f1d] border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.4),0_30px_90px_rgba(0,0,0,0.9)] rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                     <button 
                       @click="memberActiveTab = 'all'; isMemberFilterDropdownOpen = false"
                       :class="memberActiveTab === 'all' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                       class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
                     >
                       <div class="flex items-center gap-3">
                         <div class="w-1.5 h-1.5 rounded-full" :class="memberActiveTab === 'all' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                         <span>TÜM ÜYELER</span>
                       </div>
                       <span v-if="memberActiveTab === 'all'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                     </button>
                     <button 
                       @click="memberActiveTab = 'assigned'; isMemberFilterDropdownOpen = false"
                       :class="memberActiveTab === 'assigned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                       class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
                     >
                       <div class="flex items-center gap-3">
                         <div class="w-1.5 h-1.5 rounded-full" :class="memberActiveTab === 'assigned' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                         <span>YÜKLÜ ÜYELER</span>
                       </div>
                       <span v-if="memberActiveTab === 'assigned'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                     </button>
                     <button 
                       @click="memberActiveTab = 'unassigned'; isMemberFilterDropdownOpen = false"
                       :class="memberActiveTab === 'unassigned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                       class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left group"
                     >
                       <div class="flex items-center gap-3">
                         <div class="w-1.5 h-1.5 rounded-full" :class="memberActiveTab === 'unassigned' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                         <span>YENİ EKLE</span>
                       </div>
                       <span v-if="memberActiveTab === 'unassigned'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                     </button>
                   </div>
                 </Transition>
               </div>
             </template>
          </BaseSearchFilter>

          <div class="flex-1 overflow-hidden px-6 pb-6 pt-2">
             <!-- Üye Listesi (Grid veya Liste Görünümü) -->
             <div v-if="memberViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 h-full overflow-y-auto custom-scrollbar pt-2 pr-2">
                 <BaseCard v-for="m in filteredMembers" :key="m.id" accent="indigo" selectable @click="addMemberToGroup(m.id)">
                    <div class="flex flex-col gap-4 text-center items-center py-4">
                       <BaseMemberAvatar :src="m.photo" :name="m.fullName" size="lg" rounded />
                       <div class="space-y-1">
                          <span class="text-[0.7rem] font-black text-slate-100 uppercase truncate w-full block">{{ m.fullName }}</span>
                          <span class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">{{ m.memberCode || 'KODSUZ' }}</span>
                       </div>
                    </div>
                 </BaseCard>
             </div>
             
             <BaseTable
                v-else
                :columns="[
                   { key: 'photo', label: '', width: '50px' },
                   { key: 'fullName', label: 'AD SOYAD' },
                   { key: 'memberCode', label: 'KOD' },
                   { key: 'phone', label: 'TELEFON' }
                ]"
                :items="filteredMembers"
                accent="rose"
                @rowClick="addMemberToGroup($event.id)"
             >
                <template #cell-photo="{ item }"><BaseMemberAvatar :src="item.photo" :name="item.fullName" size="xs" /></template>
                <template #cell-fullName="{ value }"><span class="text-[0.7rem] font-black text-white uppercase">{{ value }}</span></template>
                <template #cell-memberCode="{ value }"><span class="text-[0.6rem] font-bold text-slate-500">{{ value || '-' }}</span></template>
                <template #cell-phone="{ value }"><span class="text-[0.65rem] font-bold text-slate-400">{{ value || '-' }}</span></template>
             </BaseTable>
          </div>
       </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { 
  Plus, Users, X, Edit, Trash2, Save, Check, Search, 
  Activity, Star, LayoutGrid, GraduationCap, UserPlus,
  ChevronDown, ArrowLeft
} from 'lucide-vue-next'

import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseSwitch from '../../components/base/BaseSwitch.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'

// Services & Composables
import { sportGroupService } from '../../services/sport/sportGroupService'
import { useSportGroups } from '../../composables/useSportGroups'
import { useSpecialties } from '../../composables/useSpecialties'
import { useInstructors } from '../../composables/useInstructors'
import { useAlerts } from '../../utils/alerts'
import { memberService } from '../../services/member/memberService'

const { groups, loading: groupsLoading, fetchGroups, deleteGroup } = useSportGroups()
const { specialties, fetchSpecialties } = useSpecialties()
const { instructors, fetchInstructors } = useInstructors()
const { toast, error: showAlertError } = useAlerts()

const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('list')
const selectedSpecialtyId = ref('')
const selectedGroups = ref([])
const showForm = ref(false)
const showAddMemberModal = ref(false)
const editingId = ref(null)
const currentGroupMembers = ref([])
const allAvailableMembers = ref([])
const memberSearchQuery = ref('')
const memberViewMode = ref('list')
const isMemberFilterDropdownOpen = ref(false)
const memberActiveTab = ref('all')

const form = ref({
  name: '',
  specialtyId: '',
  category: '',
  minAge: 0,
  maxAge: 99,
  instructorId: '',
  maxCapacity: 20,
  isActive: true
})

const activeGroup = computed(() => {
    if (selectedGroups.value.length === 0) return null
    return groups.value.find(g => g.id === selectedGroups.value[0])
})

const filteredMembers = computed(() => {
    let list = allAvailableMembers.value
    
    // Tab bazlı filtreleme (Yüklü / Yüklenmemiş)
    const assignedIds = currentGroupMembers.value.map(m => m.id)
    
    if (memberActiveTab.value === 'assigned') {
        list = list.filter(m => assignedIds.includes(m.id))
    } else if (memberActiveTab.value === 'unassigned') {
        list = list.filter(m => !assignedIds.includes(m.id))
    }

    // Arama filtrelemesi
    if (memberSearchQuery.value) {
        const q = memberSearchQuery.value.toLowerCase()
        list = list.filter(m => 
            m.fullName.toLowerCase().includes(q) || 
            m.memberCode?.toLowerCase().includes(q) ||
            m.phone?.includes(q)
        )
    }
    
    return list
})

const openAddMemberModal = async () => {
    if (!activeGroup.value) return
    try {
        loading.value = true
        // Tüm üyeleri getir
        const response = await memberService.getAll({ limit: 500, profileType: 'MEMBER' })
        allAvailableMembers.value = response.members
        
        // Mevcut grup üyelerini getir (yüklü/yeni ayrımı için)
        currentGroupMembers.value = await sportGroupService.getMembers(activeGroup.value.id)
        
        // Varsayılan olarak "Yeni Ekle" sekmesini açalım (henüz grupta olmayanlar)
        memberActiveTab.value = 'unassigned'
        showAddMemberModal.value = true
    } catch (err) {
        console.error('Üyeler yüklenemedi:', err)
        showAlertError('HATA', 'Arama listesi hazırlanırken bir sorun oluştu.')
    } finally {
        loading.value = false
    }
}

const addMemberToGroup = async (memberId) => {
    if (!activeGroup.value) return
    try {
        await sportGroupService.addMember(activeGroup.value.id, memberId)
        toast('Üye gruba eklendi.')
        fetchGroups() // Sayacı güncellemek için
        showAddMemberModal.value = false
    } catch (err) {
        console.error('Ekleme hatası:', err)
        const msg = err.response?.data?.message || 'Üye eklenemedi.'
        showAlertError('HATA', msg)
    }
}

const footballCategories = [
    { name: 'U6-U7', min: 5, max: 7 },
    { name: 'U8-U9', min: 8, max: 9 },
    { name: 'U10-U11', min: 10, max: 11 },
    { name: 'U12-U13', min: 12, max: 13 },
    { name: 'U14-U15', min: 14, max: 15 },
    { name: 'U16-U17', min: 16, max: 17 },
    { name: 'U19-U21', min: 18, max: 21 },
    { name: 'Senior', min: 18, max: 45 },
    { name: 'Veteran', min: 35, max: 65 }
]


const isFootball = computed(() => {
    if (!form.value.specialtyId || specialties.value.length === 0) return false
    const spec = specialties.value.find(s => s.id === form.value.specialtyId)
    if (!spec) return false
    const name = (spec.name || '').toLowerCase()
    return name.includes('futbol') || name.includes('football') || name.includes('soccer')
})

const onCategoryChange = (val) => {
    // Sadece futbol kategorisi ve geçerli bir değer ise otomatik doldur
    if (!isFootball.value || !val || val === 'DİĞER') return
    
    const cat = footballCategories.find(c => c.name === val)
    if (cat) {
        form.value.minAge = cat.min
        form.value.maxAge = cat.max
        // Takım ismini her zaman güncelle (kullanıcı manuel değiştirmemişse veya boşsa)
        form.value.name = `${cat.name} TAKIMI`.toUpperCase()
    }
}

const applyFootballCategory = (cat) => {
    form.value.category = cat.name
    form.value.minAge = cat.min
    form.value.maxAge = cat.max
    // Eğer isim boşsa veya sadece bir kategori ise otomatik isim öner
    if (!form.value.name || form.value.name === 'YENİ TAKIM' || footballCategories.some(c => form.value.name.includes(c.name))) {
        form.value.name = `${cat.name} TAKIMI`
    }
}

const fetchGroupMembers = async (groupId) => {
    try {
        currentGroupMembers.value = await sportGroupService.getMembers(groupId)
    } catch (err) {
        console.error('Grup üyeleri yüklenemedi:', err)
    }
}

const groupedSpecialties = computed(() => {
    const groups = { SALON: [], SAHA: [], HAVUZ: [], DIGER: [] }
    specialties.value.forEach(s => {
        const type = s.facilityType || 'SALON'
        if (!groups[type]) groups[type] = []
        groups[type].push(s)
    })
    return groups
})

const filteredGroups = computed(() => {
    let result = groups.value
    if (selectedSpecialtyId.value) {
        result = result.filter(g => g.specialtyId === selectedSpecialtyId.value)
    }
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(g => 
            g.name.toLowerCase().includes(q) || 
            g.category?.toLowerCase().includes(q) ||
            g.specialty?.name?.toLowerCase().includes(q)
        )
    }
    return result
})

const toggleSelection = (id) => {
    if (selectedGroups.value.includes(id)) {
        selectedGroups.value = []
    } else {
        selectedGroups.value = [id]
    }
}

const openCreateForm = () => {
    editingId.value = null
    form.value = { name: '', specialtyId: '', category: '', minAge: 0, maxAge: 99, instructorId: '', maxCapacity: 20, isActive: true }
    showForm.value = true
}

const startEdit = (group) => {
    editingId.value = group.id
    form.value = { ...group }
    fetchGroupMembers(group.id)
    showForm.value = true
}

const saveGroup = async () => {
    if (!form.value.name || !form.value.specialtyId) {
        showAlertError('EKSİK BİLGİ', 'Lütfen Takım Adı ve Branş seçiniz.')
        return
    }

    loading.value = true
    try {
        if (editingId.value) {
            await sportGroupService.update(editingId.value, form.value)
            toast('Takım güncellendi.')
        } else {
            await sportGroupService.create(form.value)
            toast('Yeni takım oluşturuldu.')
        }
        showForm.value = false
        fetchGroups()
    } catch (err) {
        console.error('Kayıt hatası:', err)
        showAlertError('HATA', 'İşlem sırasında bir sorun oluştu.')
    } finally {
        loading.value = false
    }
}

const handleDelete = async (id) => {
    const success = await deleteGroup(id)
    if (success) {
        selectedGroups.value = []
    }
}

onMounted(() => {
    fetchGroups()
    fetchSpecialties()
    fetchInstructors()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; }
</style>
