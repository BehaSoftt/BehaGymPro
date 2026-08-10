<template>
  <div class="h-full flex flex-col gap-4 animate-in">
    <div class="flex-none px-2 mt-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_roles_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>
    <div class="flex-1 flex flex-row gap-6 min-h-0">
    <!-- Role selection side (List) -->
    <div class="w-1/4 flex-none flex flex-col bg-slate-900/50 border border-slate-800 shadow-2xl overflow-hidden min-w-[300px] rounded-xl">
        <div class="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
             <ShieldCheck class="w-4 h-4 text-indigo-400" />
             <span class="text-[0.65rem] font-bold text-slate-100 tracking-widest">SİSTEM ROLLERİ</span>
          </div>
          <BaseButton variant="primary" size="xs" square @click="addNewRole" title="YENİ ROL EKLE">
             <template #icon><Plus class="w-3.5 h-3.5" /></template>
          </BaseButton>
        </div>

        <div class="flex-1 p-0 relative min-h-0 overflow-hidden">
            <BaseTable 
               :columns="roleColumns"
               :items="roles"
               :loading="loading"
               :selectedId="selectedRole?.id"
               @rowClick="selectRole"
               accent="indigo"
               emptyText="ROL BULUNAMADI"
               style="--ui-table-row-py: 12px; --ui-table-header-py: 10px;"
            >
               <template #header-roleInfo>
                  <span class="text-[0.6rem] font-black text-slate-500 tracking-widest pl-2">MEVCUT ROLLER</span>
               </template>

               <template #cell-roleInfo="{ item }">
                  <div class="flex flex-col gap-1.5 w-full pl-2 py-1">
                     <div class="flex items-center gap-2">
                        <span class="text-[0.85rem] font-black text-white uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{{ item.name }}</span>
                        <span v-if="item.isSystemRole" class="text-[0.5rem] bg-indigo-500 text-white px-2 py-0.5 rounded-sm font-black tracking-tighter shadow-[0_0_10px_rgba(99,102,241,0.6)]">SİSTEM</span>
                     </div>
                     <span class="text-[0.65rem] text-slate-400 font-bold truncate tracking-wide">{{ item.description || 'Açıklama yok' }}</span>
                     <div class="flex items-center gap-1.5 mt-1">
                        <div class="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 border border-slate-700 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                           <Lock class="w-3 h-3 text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                           <span class="text-[0.6rem] font-black text-indigo-300">{{ (item.permissionIds || []).length }} YETKİ TANIMLI</span>
                        </div>
                     </div>
                  </div>
               </template>
            </BaseTable>
        </div>
    </div>

    <!-- Role Form Area -->
    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative group">
       <div v-if="roleForm.name || !selectedRole" class="flex-1 flex flex-col h-full">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
             <div class="flex items-center gap-4">
                <div class="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-none">
                   <ShieldCheck class="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 class="text-[0.8rem] font-bold text-slate-100 tracking-widest">{{ roleForm.id ? 'Rolü Düzenle' : 'Yeni Rol Oluştur' }}</h3>
                  <p class="text-[0.6rem] text-slate-500 font-medium mt-0.5">Sistem Yetkilerini Bu Alandan Tanımlayabilirsiniz</p>
                </div>
             </div>
             <div v-if="selectedRole && !selectedRole.isSystemRole" class="flex gap-2">
                <BaseButton @click="deleteRole(selectedRole.id)" variant="danger">SİL</BaseButton>
             </div>
          </div>

           <div class="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 space-y-8 scroll-smooth">
             <!-- Role Info -->
             <div class="grid grid-cols-2 gap-6">
                 <div class="space-y-1.5">
                    <BaseInput 
                      v-model="roleForm.name" 
                      type="text" 
                      label="Rol Adı"
                      placeholder="Örn: Resepsiyon, Müdür..." 
                      :disabled="selectedRole?.name === 'SUPER_MASTER' || (selectedRole?.isSystemRole && !isSuperMaster)"
                    />
                 </div>
                 <div class="space-y-1.5">
                    <BaseInput 
                      v-model="roleForm.description" 
                      type="text" 
                      label="Açıklama"
                      placeholder="Rolün görev tanımı..." 
                    />
                 </div>
             </div>

             <!-- Permission Matrix -->
             <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                   <label class="text-[0.7rem] font-black text-slate-200 tracking-[0.2em] flex items-center gap-2">
                      <Lock class="w-4 h-4 text-emerald-500" /> Aktif Yetkiler
                   </label>
                   <div class="flex items-center gap-4">
                      <div class="flex border border-slate-800 bg-slate-950 p-0.5">
                         <button @click="expandedModules = Object.keys(groupedPermissions)" class="p-1 px-2 text-[0.5rem] font-bold uppercase transition-all hover:bg-slate-800 text-slate-400">TÜMÜNÜ AÇ</button>
                         <div class="w-[1px] bg-slate-800 mx-1"></div>
                         <button @click="expandedModules = []" class="p-1 px-2 text-[0.5rem] font-bold uppercase transition-all hover:bg-slate-800 text-slate-400">KAPAT</button>
                      </div>
                      <div class="flex border border-slate-800 bg-slate-950 p-0.5">
                         <button @click="permissionViewMode = 'grid'" :class="permissionViewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500'" class="p-1 px-2 text-[0.6rem] font-bold uppercase transition-all">Grid</button>
                         <button @click="permissionViewMode = 'list'" :class="permissionViewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'" class="p-1 px-2 text-[0.6rem] font-bold uppercase transition-all">Liste</button>
                      </div>
                      <div class="relative min-w-[240px] flex gap-2">
                         <div class="relative flex-1">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <input v-model="permissionSearchQuery" type="text" placeholder="YETKİ ARA..." class="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-1.5 text-[0.6rem] font-bold tracking-widest text-slate-300 outline-none focus:border-emerald-500/50" />
                         </div>
                         <BaseButton v-if="isSuperMaster" @click="syncPermissions" variant="dark" size="xs" :loading="syncing" title="Sistem Yetkilerini Senkronize Et">
                            <template #icon><Zap class="w-3 h-3" /></template>
                         </BaseButton>
                      </div>
                   </div>
                </div>

                <div v-if="permissionViewMode === 'grid'" class="space-y-6">
                   <BaseAccordion 
                     v-for="(perms, mod) in groupedPermissions" :key="mod"
                     :title="mod" 
                     accent="indigo"
                     :modelValue="expandedModules.includes(mod)"
                     @update:modelValue="toggleModule(mod)"
                     contentClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3"
                   >
                     <template #icon>
                        <Zap class="w-3.5 h-3.5 text-indigo-500" />
                     </template>
                     <template #badge>
                        <span class="text-[0.6rem] px-2.5 py-1 bg-indigo-600 text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400/50">{{ perms.filter(p => roleForm.permissionIds.includes(p.id)).length }} / {{ perms.length }}</span>
                     </template>

                          <label v-for="p in perms" :key="p.id" 
                            :class="roleForm.permissionIds.includes(p.id) 
                              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.3),inset_0_0_15px_rgba(16,185,129,0.1)]' 
                              : 'border-slate-700 bg-slate-900/40 hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'"
                            class="relative p-5 cursor-pointer transition-all duration-300 border-2 group/perm overflow-hidden flex flex-col justify-between rounded-lg"
                         >
                             <div class="absolute top-3 right-3 z-20">
                               <BaseSwitch 
                                 v-model="roleForm.permissionIds" 
                                 :value="p.id" 
                                 :disabled="selectedRole?.name === 'SUPER_MASTER' || (selectedRole?.isSystemRole && !isSuperMaster)" 
                                />
                            </div>
                             <div>
                                <div class="flex items-center justify-between mb-2">
                                  <span :class="roleForm.permissionIds.includes(p.id) ? 'text-emerald-400' : 'text-white'" class="text-[0.75rem] font-black tracking-wide leading-none drop-shadow-[0_0_5px_rgba(0,0,0,0.5)] uppercase">{{ p.name }}</span>
                                </div>
                                <p class="text-[0.65rem] text-slate-400 font-bold leading-relaxed mb-4">{{ p.description || 'Bu yetki için açıklama girilmemiş.' }}</p>
                             </div>
                             <div class="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                                <span class="text-[0.5rem] font-mono text-slate-500 font-black uppercase tracking-widest">{{ p.key }}</span>
                                <div v-if="roleForm.permissionIds.includes(p.id)" class="flex items-center gap-1.5">
                                   <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                                   <span class="text-[0.55rem] font-black text-emerald-400 tracking-tighter">AKTİF</span>
                                </div>
                             </div>
                         </label>
                   </BaseAccordion>
                </div>

                <!-- List View -->
                <div v-else class="space-y-4">
                   <div v-for="(perms, mod) in groupedPermissions" :key="mod" class="space-y-2">
                       <h4 class="text-[0.6rem] font-black text-slate-500 tracking-[0.2em] mb-2 px-1 uppercase">{{ mod }}</h4>
                       <div class="bg-slate-950/40 border border-slate-800 rounded-none overflow-hidden">
                          <label v-for="p in perms" :key="p.id" 
                            class="flex items-center justify-between p-3 hover:bg-slate-800/40 transition-all border-b border-slate-800/50 last:border-0 cursor-pointer group/row"
                          >
                             <div class="flex items-center gap-4">
                                <BaseSwitch 
                                  v-model="roleForm.permissionIds" 
                                  :value="p.id" 
                                  :disabled="selectedRole?.name === 'SUPER_MASTER' || (selectedRole?.isSystemRole && !isSuperMaster)" 
                                />
                                <div class="flex flex-col">
                                   <span class="text-[0.65rem] font-bold text-slate-200">{{ p.name }}</span>
                                   <span class="text-[0.55rem] text-slate-600 font-medium">{{ p.key }}</span>
                                </div>
                             </div>
                             <span v-if="roleForm.permissionIds.includes(p.id)" class="text-[0.5rem] font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10">YETKİLİ</span>
                          </label>
                       </div>
                   </div>
                </div>
             </div>
          </div>

           <!-- Premium Action Footer (Teleports to App.vue) -->
           <BaseActionFooter v-if="selectedRole?.name !== 'SUPER_MASTER' && (!selectedRole?.isSystemRole || isSuperMaster)">
              <div class="flex items-center gap-2">
                 <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
                    <template #icon><ArrowLeft class="w-5 h-5" /></template>
                 </BaseButton>

                 <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

                 <BaseButton @click="addNewRole" variant="dark" size="icon" square title="İPTAL">
                    <template #icon><X class="w-5 h-5" /></template>
                 </BaseButton>
                 
                 <BaseButton @click="saveRole" :disabled="loading || !roleForm.name" variant="primary" size="icon" square :title="selectedRole?.id ? 'BİLGİLERİ GÜNCELLE' : 'YENİ ROLÜ KAYDET'">
                    <template #icon>
                       <Save v-if="!loading" class="w-5 h-5" />
                       <Loader2 v-else class="w-5 h-5 animate-spin" />
                    </template>
                 </BaseButton>
              </div>
           </BaseActionFooter>
           
           <!-- System Role Warning -->
           <div v-if="selectedRole?.isSystemRole && !isSuperMaster" class="absolute bottom-6 left-6 right-6 p-4 bg-rose-500/5 border border-rose-500/20 backdrop-blur-md z-[101]">
              <div class="flex items-center gap-3">
                 <Shield class="w-5 h-5 text-rose-500 opacity-50" />
                 <p class="text-[0.6rem] text-rose-400 font-bold tracking-widest">Bu Bir Sistem Rolüdür. Yetkileri Sistem Tarafından Korunmaktadır Ve Değiştirilemez.</p>
              </div>
           </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-slate-600">
           <ShieldCheck class="w-16 h-16 mb-4 opacity-10 animate-pulse" />
             <p class="text-xs font-black tracking-[0.3em] opacity-30">Sol Listeden Bir Rol Seçin Veya Yenisini Ekleyin</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { 
  Plus, ShieldCheck, Save, Loader2, Lock, Search, 
  ChevronDown, Zap, Shield, X, Power, Edit, Activity, Trash2, XCircle, ArrowLeft
} from 'lucide-vue-next'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseAccordion from '../base/BaseAccordion.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'

// Services & Composables
import { roleService } from '../../services/admin/roleService'
import { useAlerts } from '../../utils/alerts'

const props = defineProps({
  isSuperMaster: { type: Boolean, default: false }
})

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()

const roleColumns = [
  { key: 'roleInfo', label: 'ROL DETAYLARI' }
]

const roles = ref([])
const permissions = ref([])
const selectedRole = ref(null)
const roleForm = ref({ name: '', description: '', permissionIds: [] })
const permissionSearchQuery = ref('')
const permissionViewMode = ref('grid')
const expandedModules = ref([])
const loading = ref(false)
const syncing = ref(false)

// Global Selection State
const globalSelection = ref({ 
  companyId: auth.user?.companyId || '', 
  branchId: auth.user?.branchId || '', 
  remember: false 
})

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchRoles()
}

const fetchRoles = async () => {
  try {
    loading.value = true
    const params = {
      companyId: globalSelection.value.companyId || undefined,
      branchId: globalSelection.value.branchId || undefined
    }
    roles.value = await roleService.getAll(params)
  } catch (err) {
    console.error('[SettingsRoles] Roller yüklenemedi:', err)
  } finally {
    loading.value = false
  }
}

const fetchPermissions = async () => {
  try {
    permissions.value = await roleService.getPermissions()
  } catch (err) {
    console.error('[SettingsRoles] Yetkiler yüklenemedi:', err)
  }
}

const syncPermissions = async () => {
  try {
    syncing.value = true
    const data = await roleService.syncPermissions()
    showAlertSuccess('SENKRONİZE EDİLDİ', data.message)
    await fetchPermissions()
    if (selectedRole.value) {
      // Re-fetch roles to get updated permissions for selected role
      await fetchRoles()
      const updated = roles.value.find(r => r.id === selectedRole.value.id)
      if (updated) selectRole(updated)
    }
  } catch (err) {
    showAlertError('HATA', 'Yetkiler senkronize edilemedi: ' + (err.response?.data?.error || err.message))
  } finally {
    syncing.value = false
  }
}

const selectRole = (role) => {
  selectedRole.value = role
  const pIds = role.permissions.map(p => p.id)
  roleForm.value = {
    id: role.id,
    name: role.name,
    description: role.description,
    permissionIds: pIds
  }

  // Sadece aktif yetkisi olan modülleri aç
  if (pIds.length > 0) {
     const activeModules = permissions.value
        .filter(p => pIds.includes(p.id))
        .map(p => (p.module || 'GENEL').toUpperCase())
     expandedModules.value = [...new Set(activeModules)]
  } else {
     expandedModules.value = []
  }
}

const addNewRole = () => {
  selectedRole.value = null
  roleForm.value = { 
    name: '', 
    description: '', 
    permissionIds: [],
    companyId: globalSelection.value.companyId || '',
    branchId: globalSelection.value.branchId || ''
  }
}

const saveRole = async () => {
  if (!roleForm.value.name) return
  loading.value = true
  try {
    const isEdit = !!roleForm.value.id
    if (isEdit) {
      await roleService.update(roleForm.value.id, roleForm.value)
    } else {
      await roleService.create(roleForm.value)
    }

    await fetchRoles()
    
    if (isEdit) {
      const updated = roles.value.find(r => r.id === roleForm.value.id)
      if (updated) selectRole(updated)
    } else {
      addNewRole()
    }
    
    showAlertSuccess('BAŞARILI', isEdit ? 'Rol ve yetkiler güncellendi.' : 'Yeni rol başarıyla oluşturuldu.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Rol kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteRole = async (id) => {
  const isConfirmed = await showAlertConfirm('ROL SİLİNSİN Mİ?', 'Bu işlem geri alınamaz ve bu role bağlı kullanıcılar varsa hata alabilirsiniz.')
  if (!isConfirmed) return
  
  loading.value = true
  try {
    await roleService.delete(id)
    await fetchRoles()
    addNewRole()
    showAlertSuccess('SİLİNDİ', 'Rol silindi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Rol silinemedi.')
  } finally {
    loading.value = false
  }
}

const toggleModule = (modName) => {
  if (expandedModules.value.includes(modName)) {
    expandedModules.value = expandedModules.value.filter(m => m !== modName)
  } else {
    expandedModules.value.push(modName)
  }
}

const groupedPermissions = computed(() => {
  const groups = {}
  const q = permissionSearchQuery.value.toLowerCase()
  
  permissions.value.forEach(p => {
    const isMatch = !q || 
                   p.name.toLowerCase().includes(q) || 
                   p.key.toLowerCase().includes(q) || 
                   p.module?.toLowerCase().includes(q)
                   
    if (!isMatch) return

    const mod = (p.module || 'GENEL').toUpperCase()
    if (!groups[mod]) groups[mod] = []
    groups[mod].push(p)
  })

  // Module sorting priority can be added here if needed
  return groups
})

onMounted(() => {
  fetchPermissions()
  fetchRoles() // İlk yüklemede rolleri de getir
})
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}
</style>
