<template>
  <!-- License View -->
  <div class="h-full flex flex-col gap-4 animate-in">
    <div class="flex-none pt-2 pb-4">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_licenses_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>
    <!-- Sub Tab Navigation -->
    <div class="flex bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
      <button
        @click="subTab = 'all'"
        :class="subTab === 'all' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="flex-1 min-w-[180px] py-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
      >
        <LayoutList class="w-3.5 h-3.5" />
        Tüm Lisanslar
      </button>
      <button
        @click="subTab = 'generate'"
        :class="subTab === 'generate' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="flex-1 min-w-[180px] py-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
      >
        <Key class="w-3.5 h-3.5" />
        Lisans Üret
      </button>
      <button
        @click="subTab = 'status'"
        :class="subTab === 'status' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="flex-1 min-w-[180px] py-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
      >
        <Activity class="w-3.5 h-3.5" />
        Durum Sorgula
      </button>
    </div>

    <!-- ALL LICENSES TAB -->
    <div v-if="subTab === 'all'" class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      <!-- Search Bar -->
      <div class="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0 border-slate-800 bg-slate-900/80">
        <BaseInput
          v-model="licenseSearch"
          placeholder="ŞİRKET, ŞUBE VEYA LİSANS KODU İLE ARA..."
          class="flex-1"
        />
        <BaseButton @click="fetchAllLicenses" variant="dark" class="px-3" title="Yenile">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </BaseButton>
      </div>

      <!-- License Table -->
      <div class="flex-1 overflow-hidden relative">
        <div class="absolute inset-0 pt-0 pb-2 px-2">
          <BaseTable :columns="licenseColumns" :items="filteredLicenses" :loading="loading" :selectedId="selectedLicense?.id" @rowClick="toggleLicenseRow" emptyText="LİSANS BULUNAMADI" emptySubtext="Arama kriterlerinizi değiştirerek tekrar deneyin.">
            <template #cell-company="{ item }">
              <div class="flex flex-col gap-0.5">
                <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight">{{ item.Company?.name || '—' }}</span>
                <span class="text-[0.55rem] text-indigo-400 font-bold uppercase tracking-widest">{{ item.Branch?.name || 'Tüm Şubeler' }}</span>
              </div>
            </template>
            <template #cell-code="{ item }">
              <div class="flex items-center gap-2 group/code">
                <code class="text-[0.6rem] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 group-hover/code:border-emerald-500/50 transition-colors">{{ item.licenseKey }}</code>
                <button
                  @click.stop="copyKey(item.licenseKey)"
                  class="opacity-0 group-hover/code:opacity-100 p-1 text-slate-500 hover:text-indigo-400 transition-all"
                  title="Kopyala"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>
              </div>
            </template>
            <template #cell-package="{ item }">
              <span class="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[0.55rem] font-black text-indigo-400 uppercase tracking-widest">
                {{ packageLabel(item.packageType) }}
              </span>
            </template>
            <template #cell-start="{ item }">
              <span class="text-[0.6rem] font-bold text-slate-400">{{ formatDate(item.startDate) }}</span>
            </template>
            <template #cell-end="{ item }">
              <span class="text-[0.6rem] font-bold" :class="isExpired(item.endDate) ? 'text-rose-500' : 'text-emerald-400'">
                {{ formatDate(item.endDate) }}
                <span v-if="!isExpired(item.endDate)" class="ml-1 text-[0.5rem] font-black text-slate-500">({{ daysLeft(item.endDate) }}G)</span>
              </span>
            </template>
            <template #cell-statusInfo="{ item }">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusColor(item)"></div>
                <span class="text-[0.55rem] font-black uppercase tracking-widest" :class="statusTextColor(item)">{{ statusLabel(item) }}</span>
              </div>
            </template>
            <template #cell-note="{ item }">
              <div class="text-[0.55rem] font-bold text-slate-500 max-w-[150px] truncate" :title="item.notes">{{ item.notes || '—' }}</div>
            </template>
          </BaseTable>
        </div>
      </div>

      <!-- Action Footer (Satır Seçilïnce Gö̈rünür) -->
      <transition name="slide-up">
        <div v-if="selectedLicense" class="flex-none border-t border-slate-700 bg-slate-900/95 backdrop-blur px-6 py-4">
          <div class="flex items-center gap-4">
            <!-- Seçilen Lisans Bilgisi -->
            <div class="flex-1 min-w-0">
              <p class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest">SEÇİLİ: {{ selectedLicense.Company?.name }} / {{ selectedLicense.Branch?.name || 'TÜm Şubeler' }}</p>
              <code class="text-[0.55rem] font-mono text-slate-400">{{ selectedLicense.licenseKey?.substring(0, 24) }}...</code>
            </div>

            <!-- Aksiyonlar -->
            <div class="flex items-center gap-2">
              <!-- Düzenleme Form -->
              <div class="flex items-center gap-2 border border-slate-700 rounded-xl px-4 py-2 bg-slate-950/50">
                <select v-model="editForm.packageType" class="bg-transparent text-[0.65rem] font-bold text-slate-300 outline-none cursor-pointer uppercase tracking-widest">
                  <option value="DEMO_15">Demo 15G</option>
                  <option value="1_MONTH">1 Ay</option>
                  <option value="3_MONTHS">3 Ay</option>
                  <option value="6_MONTHS">6 Ay</option>
                  <option value="1_YEAR">1 Yıl</option>
                  <option value="CUSTOM">Özel</option>
                </select>
                <template v-if="editForm.packageType === 'CUSTOM'">
                  <span class="text-slate-600 text-xs">|</span>
                  <input type="date" v-model="editForm.startDate" class="bg-transparent text-[0.6rem] text-slate-400 outline-none cursor-pointer [color-scheme:dark]" />
                  <span class="text-slate-600 text-xs">→</span>
                  <input type="date" v-model="editForm.endDate" class="bg-transparent text-[0.6rem] text-slate-400 outline-none cursor-pointer [color-scheme:dark]" />
                </template>
                <span class="text-slate-600 text-xs">|</span>
                <select v-model="editForm.status" class="bg-transparent text-[0.65rem] font-bold text-slate-300 outline-none cursor-pointer uppercase">
                  <option value="ACTIVE">Aktif</option>
                  <option value="CANCELLED">İptal</option>
                  <option value="EXPIRED">Süresi Doldu</option>
                </select>
              </div>

              <input v-model="editForm.notes" placeholder="Not..." class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-[0.6rem] text-slate-300 outline-none focus:border-indigo-500 w-36" />

              <BaseButton @click="saveLicenseEdit" variant="primary" :disabled="loading" class="px-4 py-2 text-[0.6rem]">
                <Check class="w-3.5 h-3.5 mr-1" /> Kaydet
              </BaseButton>

              <BaseButton @click="confirmDeleteLicense" variant="danger" :disabled="loading" class="px-4 py-2 text-[0.6rem]">
                <Trash2 class="w-3.5 h-3.5 mr-1" /> Sil
              </BaseButton>

              <BaseButton @click="selectedLicense = null" variant="dark" class="px-3 py-2">
                <X class="w-3.5 h-3.5" />
              </BaseButton>
            </div>
          </div>
        </div>
      </transition>

      <!-- Standardized Action Footer -->
      <BaseActionFooter local>
        <template #left>
            <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
              <template #icon><ArrowLeft class="w-5 h-5" /></template>
            </BaseButton>
        </template>

        <div class="flex items-center gap-6 px-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">{{ activeLicensesCount }} Aktif</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
            <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">{{ expiredLicensesCount }} Süresi Dolmuş</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
            <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">Toplam {{ allLicenses.length }}</span>
          </div>
        </div>
      </BaseActionFooter>
    </div>

    <!-- GENERATE LICENSE TAB -->
    <div v-if="subTab === 'generate'" class="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div class="w-full p-6">
        <BaseCard class="p-8 relative">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-violet-600"></div>

          <div class="mb-8">
            <h3 class="text-lg font-bold text-slate-100 flex items-center gap-3 uppercase">
              <Key class="w-5 h-5 text-indigo-500" />
              Yeni Lisans Üret
            </h3>
            <p class="text-[0.6rem] text-slate-500 font-bold tracking-[0.2em] mt-1 border-l-2 border-indigo-500 pl-3">YENİ BİR AKTİVASYON KODU OLUŞTUR</p>
          </div>

          <div class="space-y-5">
            <BaseInput
              v-model="genForm.companyId"
              type="select"
              label="ŞİRKET"
              required
              @change="onCompanyChange"
            >
              <option value="">ŞİRKET SEÇİN</option>
              <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
            </BaseInput>

            <div class="space-y-1.5 w-full">
              <label class="block text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest ml-1">LİSANSLANACAK ŞUBELER (OPSİYONEL)</label>
              <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                <div v-if="!genForm.companyId" class="text-[0.6rem] text-slate-500 font-bold tracking-widest text-center py-2">
                  ÖNCE ŞİRKET SEÇİNİZ
                </div>
                <div v-else-if="selectedCompanyBranches.length === 0" class="text-[0.6rem] text-slate-500 font-bold tracking-widest text-center py-2">
                  BU ŞİRKETE AİT ŞUBE YOK
                </div>
                <template v-else>
                  <label class="flex items-center gap-3 cursor-pointer pb-3 mb-3 border-b border-slate-800/50">
                    <input type="checkbox" :checked="areAllBranchesSelected" @change="toggleAllBranches" class="w-4 h-4 rounded appearance-none border border-slate-700 checked:border-blue-500 checked:bg-blue-500 relative flex items-center justify-center after:content-[''] after:absolute after:w-2 after:h-2 after:bg-white after:rounded-sm after:scale-0 checked:after:scale-100 transition-all" />
                    <span class="text-[0.65rem] font-bold text-slate-300 uppercase tracking-widest">TÜM ŞUBELERİ SEÇ / KALDIR</span>
                  </label>
                  
                  <label v-for="b in selectedCompanyBranches" :key="b.id" class="flex items-center gap-3 cursor-pointer py-1 hover:bg-slate-800/20 px-2 rounded-lg transition-colors">
                    <input type="checkbox" :value="b.id" v-model="genForm.branchIds" class="w-4 h-4 rounded appearance-none border border-slate-700 checked:border-blue-500 checked:bg-blue-500 relative flex items-center justify-center after:content-[''] after:absolute after:w-2 after:h-2 after:bg-white after:rounded-sm after:scale-0 checked:after:scale-100 transition-all" />
                    <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{{ b.name }}</span>
                  </label>
                </template>
              </div>
            </div>

            <BaseInput
              v-model="genForm.packageType"
              type="select"
              label="PAKET TİPİ"
              required
            >
              <option value="DEMO_15">DEMO — 15 Gün</option>
              <option value="1_MONTH">1 AYLIK</option>
              <option value="3_MONTHS">3 AYLIK</option>
              <option value="6_MONTHS">6 AYLIK</option>
              <option value="1_YEAR">1 YILLIK</option>
              <option value="CUSTOM">ÖZEL TARİH</option>
            </BaseInput>

            <div v-if="genForm.packageType === 'CUSTOM'" class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="genForm.customStartDate"
                type="date"
                label="BAŞLANGIÇ TARİHİ"
              />
              <BaseInput
                v-model="genForm.customEndDate"
                type="date"
                label="BİTİŞ TARİHİ"
              />
            </div>

            <BaseInput
              v-model="genForm.notes"
              type="textarea"
              label="NOTLAR (YÖNETİCİ NOTU)"
              placeholder="Bu lisansla ilgili ek bilgi..."
              :rows="3"
            />

            <!-- Submit -->
            <BaseButton
              @click="generateLicense"
              :disabled="loading || !genForm.companyId || !genForm.packageType"
              variant="primary"
              class="w-full py-4 mt-2"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin mr-2" />
              <Key v-else class="w-4 h-4 mr-2" />
              LİSANS ANAHTARI ÜRET
            </BaseButton>
          </div>

          <!-- Generated License Result -->
          <div v-if="generatedLicenses.length > 0" class="mt-8 space-y-4">
            <div v-for="lic in generatedLicenses" :key="lic.licenseKey" class="p-6 bg-emerald-500/5 border border-emerald-500/20 space-y-4 rounded-xl">
              <p class="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle class="w-4 h-4" />
                LİSANS BAŞARIYLA OLUŞTURULDU 
                <span class="ml-auto text-slate-400 text-[0.55rem]">
                  {{ getBranchName(lic.branchId) }}
                </span>
              </p>
              <div class="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-3 rounded-lg">
                <code class="flex-1 text-[0.8rem] font-mono font-black text-emerald-400 tracking-widest select-all">{{ lic.licenseKey }}</code>
                <button @click="copyKey(lic.licenseKey)" class="p-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all rounded" title="Kopyala">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
              <div class="grid grid-cols-3 gap-4 text-center text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">
                <div>
                  <p class="text-indigo-400 text-[0.7rem] font-black">{{ packageLabel(lic.packageType) }}</p>
                  <p>Paket</p>
                </div>
                <div>
                  <p class="text-slate-200 text-[0.7rem] font-black">{{ formatDate(lic.startDate) }}</p>
                  <p>Başlangıç</p>
                </div>
                <div>
                  <p class="text-slate-200 text-[0.7rem] font-black">{{ formatDate(lic.endDate) }}</p>
                  <p>Bitiş</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- STATUS CHECK TAB -->
    <div v-if="subTab === 'status'" class="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div class="w-full p-6 space-y-6">
        <BaseCard class="p-8 relative shadow-2xl">
          <div class="absolute top-0 left-0 w-full h-1" :class="licenseStatus?.valid ? 'bg-emerald-500' : 'bg-rose-500'"></div>

          <div class="mb-6">
            <h3 class="text-lg font-bold text-slate-100 flex items-center gap-3 uppercase">
              <Activity class="w-5 h-5 text-indigo-500" />
              Aktif Lisans Durumu
            </h3>
          </div>

          <div v-if="licenseStatus === null" class="text-center py-8">
            <BaseButton @click="checkStatus" :disabled="loading" variant="primary" class="px-8 py-3 mx-auto flex items-center gap-3">
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <Activity v-else class="w-4 h-4" />
              DURUMU SORGULA
            </BaseButton>
          </div>

          <div v-else-if="licenseStatus.valid" class="space-y-6">
            <!-- Valid License -->
            <div class="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20">
              <div class="p-3 bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle class="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p class="text-[0.7rem] font-black text-emerald-400 uppercase tracking-widest">AKTİF VE GEÇERLİ</p>
                <p class="text-[0.55rem] text-slate-400 font-bold">Lisansınız aktif durumda</p>
              </div>
            </div>

            <!-- Warning if near expiry -->
            <div v-if="licenseStatus.warning" class="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p class="text-[0.6rem] font-bold text-amber-400 uppercase tracking-widest">Dikkat: Lisansınız {{ licenseStatus.daysRemaining }} gün içinde sona erecek!</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-950 border border-slate-800">
                <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1">Kalan Süre</p>
                <p class="text-2xl font-black" :class="licenseStatus.daysRemaining <= 5 ? 'text-amber-400' : 'text-emerald-400'">{{ licenseStatus.daysRemaining }}<span class="text-sm ml-1 font-bold text-slate-400">gün</span></p>
              </div>
              <div class="p-4 bg-slate-950 border border-slate-800">
                <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1">Bitiş Tarihi</p>
                <p class="text-sm font-black text-slate-200">{{ formatDate(licenseStatus.license?.endDate) }}</p>
              </div>
              <div class="p-4 bg-slate-950 border border-slate-800">
                <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1">Paket</p>
                <p class="text-sm font-black text-indigo-400">{{ packageLabel(licenseStatus.license?.packageType) }}</p>
              </div>
              <div class="p-4 bg-slate-950 border border-slate-800">
                <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1">Lisans Kodu</p>
                <code class="text-[0.6rem] font-mono font-bold text-emerald-400 break-all">{{ licenseStatus.license?.licenseKey?.substring(0, 15) }}...</code>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <!-- Invalid License -->
            <div class="flex items-center gap-4 p-4 bg-rose-500/5 border border-rose-500/20">
              <div class="p-3 bg-rose-500/10 border border-rose-500/20">
                <XCircle class="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p class="text-[0.7rem] font-black text-rose-400 uppercase tracking-widest">LİSANS BULUNAMADI</p>
                <p class="text-[0.55rem] text-slate-400 font-bold">{{ licenseStatus.message }}</p>
              </div>
            </div>
          </div>

          <BaseButton @click="checkStatus" :disabled="loading" variant="dark" class="mt-6 w-full py-3 flex items-center justify-center gap-2">
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            Yenile
          </BaseButton>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseTable from '../base/BaseTable.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseCard from '../base/BaseCard.vue'
// Services & Composables
import { licenseService } from '../../services/admin/licenseService'
import { companyService } from '../../services/admin/companyService'
import { useAlerts } from '../../utils/alerts'
import { useAuthStore } from '../../store/auth'
import {
  Key, Activity, LayoutList, RefreshCw, Copy, Loader2,
  CheckCircle, XCircle, AlertTriangle, Check, Trash2, X, ArrowLeft
} from 'lucide-vue-next'

import BaseActionFooter from '../base/BaseActionFooter.vue'
import { useDataStore } from '../../store/data'

const auth = useAuthStore()
const dataStore = useDataStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()
const loading = ref(false)
const subTab = ref('all')

// ─── All Licenses ──────────────────────────────────────────
const allLicenses = ref([])
const licenseSearch = ref('')
const selectedLicense = ref(null)
const editForm = ref({ packageType: '', status: '', startDate: '', endDate: '', notes: '' })

// Global Selection State
const globalSelection = ref({ 
  companyId: auth.user?.companyId || '', 
  branchId: auth.user?.branchId || '', 
  remember: false 
})

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchAllLicenses()
  
  if (data.companyId) {
    onGlobalCompanyChange(data.companyId)
  }
}

const onGlobalCompanyChange = (cId) => {
  genForm.value.companyId = cId
  onCompanyChange()
}

const toggleLicenseRow = (row) => {
  // BehaSoft sistem lisansı korunur, seçilemez
  if (row.Company?.name === 'BehaSoft') {
    toast('KORUMALI LİSANS', 'BehaSoft sistem lisansı düzenlenemez ve silinemez.', 'info')
    return
  }
  if (selectedLicense.value?.id === row.id) {
    selectedLicense.value = null
  } else {
    selectedLicense.value = row
    editForm.value = {
      packageType: row.packageType,
      status: row.status,
      startDate: row.startDate ? row.startDate.substring(0, 10) : '',
      endDate: row.endDate ? row.endDate.substring(0, 10) : '',
      notes: row.notes || ''
    }
  }
}

const licenseColumns = [
  { key: 'company', label: 'ŞİRKET / ŞUBE' },
  { key: 'code', label: 'LİSANS KODU' },
  { key: 'package', label: 'PAKET' },
  { key: 'start', label: 'BAŞLANGIÇ' },
  { key: 'end', label: 'BİTİŞ' },
  { key: 'statusInfo', label: 'DURUM' },
  { key: 'note', label: 'NOT' }
]

const fetchAllLicenses = async () => {
  loading.value = true
  try {
    const params = {
      companyId: globalSelection.value.companyId || undefined,
      branchId: globalSelection.value.branchId || undefined
    }
    const data = await licenseService.getAll(params)
    allLicenses.value = data?.data || []
  } catch (err) {
    console.error('Lisanslar yüklenemedi:', err)
  } finally {
    loading.value = false
  }
}

const filteredLicenses = computed(() => {
  if (!licenseSearch.value) return allLicenses.value
  const q = licenseSearch.value.toLowerCase()
  return allLicenses.value.filter(l =>
    l.Company?.name?.toLowerCase().includes(q) ||
    l.Branch?.name?.toLowerCase().includes(q) ||
    l.licenseKey?.toLowerCase().includes(q)
  )
})

const activeLicensesCount = computed(() =>
  allLicenses.value.filter(l => l.status === 'ACTIVE' && !isExpired(l.endDate)).length
)
const expiredLicensesCount = computed(() =>
  allLicenses.value.filter(l => isExpired(l.endDate) || l.status === 'EXPIRED').length
)

// ─── License Edit / Delete ─────────────────────────────────
const saveLicenseEdit = async () => {
  if (!selectedLicense.value) return
  loading.value = true
  try {
    const payload = {
      packageType: editForm.value.packageType,
      status: editForm.value.status,
      notes: editForm.value.notes
    }
    if (editForm.value.packageType === 'CUSTOM') {
      payload.customStartDate = editForm.value.startDate
      payload.customEndDate = editForm.value.endDate
    }
    await licenseService.update(selectedLicense.value.id, payload)
    await fetchAllLicenses()
    selectedLicense.value = null
    toast('GÜNCELLENDİ', '', 'success')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Lisans güncellenemedi.')
  } finally {
    loading.value = false
  }
}

const confirmDeleteLicense = async () => {
  if (!selectedLicense.value) return
  const isConfirmed = await showAlertConfirm('LİSANSI SİL', `Bu lisansı silmek istediğinizden emin misiniz?\n${selectedLicense.value.licenseKey}`)
  
  if (!isConfirmed) return
  loading.value = true
  try {
    await licenseService.delete(selectedLicense.value.id)
    await fetchAllLicenses()
    selectedLicense.value = null
    toast('SİLİNDİ', '', 'success')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Lisans silinemedi.')
  } finally {
    loading.value = false
  }
}

// ─── Generate License ──────────────────────────────────────
const generatedLicenses = ref([])
const genForm = ref({
  companyId: '',
  branchIds: [],
  packageType: '1_MONTH',
  customStartDate: '',
  customEndDate: '',
  notes: ''
})

const selectedCompanyBranches = computed(() => {
  if (!genForm.value.companyId) return []
  const company = companies.value.find(c => c.id === genForm.value.companyId)
  return company?.Branches || company?.branches || []
})

const companies = computed(() => dataStore.companies)

const fetchCompanies = async () => {
  await dataStore.fetchCompanies()
}

const onCompanyChange = () => {
  genForm.value.branchIds = []
}

const areAllBranchesSelected = computed(() => {
  if (selectedCompanyBranches.value.length === 0) return false
  return genForm.value.branchIds.length === selectedCompanyBranches.value.length
})

const toggleAllBranches = () => {
  if (areAllBranchesSelected.value) {
    genForm.value.branchIds = []
  } else {
    genForm.value.branchIds = selectedCompanyBranches.value.map(b => b.id)
  }
}

const getBranchName = (branchId) => {
  if (!branchId) return 'TÜM ŞUBELER / MERKEZ'
  const branch = selectedCompanyBranches.value.find(b => b.id === branchId)
  return branch ? branch.name : 'ŞUBE'
}

const generateLicense = async () => {
  if (!genForm.value.companyId || !genForm.value.packageType) return
  loading.value = true
  generatedLicenses.value = []
  try {
    const data = await licenseService.generate({
      companyId: genForm.value.companyId,
      branchIds: genForm.value.branchIds.length > 0 ? genForm.value.branchIds : null,
      packageType: genForm.value.packageType,
      customStartDate: genForm.value.customStartDate || null,
      customEndDate: genForm.value.customEndDate || null,
      notes: genForm.value.notes || null
    })
    
    // Ensure array structure
    if (Array.isArray(data?.data)) {
      generatedLicenses.value = data.data
    } else if (data?.data) {
      generatedLicenses.value = [data.data]
    }
    
    await fetchAllLicenses()
    showAlertSuccess('LİSANS ÜRETİLDİ', 'Lisans başarıyla oluşturuldu. Kodu müşteriye iletin.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Lisans üretilemedi.')
  } finally {
    loading.value = false
  }
}

// ─── License Status ────────────────────────────────────────
const licenseStatus = ref(null)

const checkStatus = async () => {
  loading.value = true
  try {
    licenseStatus.value = await licenseService.getStatus()
  } catch (err) {
    licenseStatus.value = { valid: false, message: 'Durum sorgulanamadı.' }
  } finally {
    loading.value = false
  }
}

// ─── Helpers ───────────────────────────────────────────────
const copyKey = (key) => {
  navigator.clipboard.writeText(key)
  toast('KOPYALANDI', '', 'success')
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR')
}

const isExpired = (endDate) => {
  if (!endDate) return false
  return new Date(endDate) < new Date()
}

const daysLeft = (endDate) => {
  if (!endDate) return 0
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)))
}

const packageLabel = (type) => {
  const map = {
    'DEMO_15': 'Demo 15G', '1_MONTH': '1 Ay',
    '3_MONTHS': '3 Ay', '6_MONTHS': '6 Ay',
    '1_YEAR': '1 Yıl', 'CUSTOM': 'Özel'
  }
  return map[type] || type
}

const statusLabel = (lic) => {
  if (isExpired(lic.endDate)) return 'Süresi Doldu'
  if (lic.status === 'CANCELLED') return 'İptal'
  if (lic.status === 'ACTIVE' && lic.usedAt) return 'Aktif'
  if (lic.status === 'ACTIVE' && !lic.usedAt) return 'Bekliyor'
  return lic.status
}

const statusColor = (lic) => {
  if (isExpired(lic.endDate) || lic.status === 'EXPIRED') return 'bg-rose-500'
  if (lic.status === 'CANCELLED') return 'bg-slate-500'
  if (lic.usedAt) return 'bg-emerald-500 animate-pulse'
  return 'bg-amber-500'
}

const statusTextColor = (lic) => {
  if (isExpired(lic.endDate) || lic.status === 'EXPIRED') return 'text-rose-400'
  if (lic.status === 'CANCELLED') return 'text-slate-400'
  if (lic.usedAt) return 'text-emerald-400'
  return 'text-amber-400'
}

onMounted(async () => {
  // İlk yüklemede verileri çek
  if (!auth.isBehaAdmin) {
    fetchAllLicenses()
  }
  fetchCompanies()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 10px; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
