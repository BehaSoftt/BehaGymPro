<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div class="absolute inset-0 z-[50] bg-slate-950 flex flex-col overflow-hidden">
      <!-- HISTORY TAB container -->
      <div v-if="activeTab === 'history'" class="flex-1 flex flex-col overflow-hidden px-2 relative h-full animate-in slide-in-from-bottom-2 duration-300">
        <BaseSearchFilter 
          v-model:searchQuery="localSearchQuery"
          placeholder="İŞLEM ARA (AÇIKLAMA, KATEGORİ, YÖNTEM...)"
          :show-filters="false"
          v-model:viewMode="localViewMode"
        />

        <div class="flex-1 relative overflow-hidden mt-2">
          <div class="absolute inset-0 overflow-y-auto custom-scrollbar px-2 pb-4">
            <BaseTable
              :columns="[
                { key: 'date', label: 'İŞLEM TARİHİ' },
                { key: 'description', label: 'KATEGORİ / AÇIKLAMA' },
                { key: 'method', label: 'YÖNTEM', align: 'center' },
                { key: 'amount', label: 'TUTAR', align: 'center' }
              ]"
              :items="filteredTransactions"
              :selectedId="selectedHistoryTransactionId"
              accent="indigo"
              @rowClick="$emit('toggle-selection', $event.id)"
            >
              <template #cell-date="{ item }">
                <div class="flex flex-col">
                  <span class="text-xs font-black text-slate-300">{{ formatDate(item.transactionDate).split(' ')[0] }}</span>
                  <span class="text-[0.6rem] font-mono text-slate-500 tracking-widest">{{ formatDate(item.transactionDate).split(' ')[1] }}</span>
                </div>
              </template>

              <template #cell-description="{ item }">
                <div class="flex flex-col gap-1 text-left">
                  <span class="text-[0.65rem] font-black text-rose-500 uppercase tracking-wider">{{ getCategoryLabel(item.category) }}</span>
                  <span class="text-xs font-semibold text-slate-100 leading-relaxed uppercase tracking-tight">{{ item.description || '-' }}</span>
                  
                  <!-- PRODUCT SALES ITEMS DETAILS -->
                  <div v-if="item.salesTransaction?.items && item.salesTransaction.items.length > 0" class="flex flex-wrap gap-1.5 mt-1">
                    <span 
                      v-for="subItem in item.salesTransaction.items" 
                      :key="subItem.id"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-md text-[0.65rem] font-bold text-indigo-300 shadow-sm"
                    >
                      <span class="text-indigo-400 font-mono">📦 {{ subItem.productName }}</span>
                      <span class="text-slate-400 font-black">x{{ subItem.quantity }}</span>
                      <span class="text-emerald-400 font-mono">(₺{{ parseFloat(subItem.lineTotal || (subItem.quantity * subItem.unitPrice)).toFixed(2) }})</span>
                    </span>
                  </div>
                </div>
              </template>

              <template #cell-method="{ item }">
                <div class="flex items-center justify-center">
                  <span class="text-[0.6rem] font-black text-slate-400 border border-slate-800 px-3 py-1 bg-slate-950 uppercase tracking-[0.1em]">
                    {{ getPaymentMethodLabel(item.paymentMethod) }}
                  </span>
                </div>
              </template>

              <template #cell-amount="{ item }">
                <div 
                  class="px-4 py-1.5 border shadow-2xl w-[140px] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  :class="item.transactionType === 'CREDIT' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-500/5 border-rose-500/20 shadow-rose-500/5'"
                >
                  <span class="text-[0.95rem] font-black font-mono tracking-tighter italic" :class="item.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'">
                    {{ item.transactionType === 'CREDIT' ? '+' : '-' }}₺{{ parseFloat(item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </span>
                </div>
              </template>
            </BaseTable>
          </div>
        </div>

        <!-- Horizontal Summary Bar -->
        <div class="flex-none bg-slate-900/80 backdrop-blur-md border-t border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] py-2 px-6 z-20">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="flex flex-col uppercase tracking-tight border-l-2 border-indigo-500 pl-4">
                <span class="text-[0.7rem] font-black text-slate-100 italic tracking-[0.2em]">HESAP ÖZETİ</span>
                <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">{{ filteredTransactions.length }} İŞLEM</span>
              </div>
            </div>

            <div class="flex items-center gap-8">
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">BORÇ / HARCAMA</span>
                <div class="px-5 py-1.5 bg-slate-950 border border-slate-800 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                  <p class="text-[1rem] font-black text-rose-400 tracking-tighter relative z-10">
                    ₺{{ parseFloat(account?.totalDebit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col items-center gap-0.5">
                <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">GELİR / TAHSİLAT</span>
                <div class="px-5 py-1.5 bg-slate-950 border border-slate-800 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                  <p class="text-[1rem] font-black text-emerald-400 tracking-tighter relative z-10">
                    ₺{{ parseFloat(account?.totalCredit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col items-center gap-0.5">
                <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">GÜNCEL BAKİYE</span>
                <div class="px-5 py-1.5 bg-slate-950 border border-slate-800 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                  <p class="text-[1rem] font-black tracking-tighter relative z-10" :class="parseFloat(account?.balance) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    ₺{{ parseFloat(account?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY TAB container -->
      <div v-else-if="activeTab === 'summary'" class="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right-2 duration-300">
        <div class="p-6 bg-slate-950/40 border-[1.5px] border-slate-700 shadow-xl space-y-4">
          <h4 class="text-[0.7rem] font-black text-slate-100 uppercase tracking-[0.2em] border-b border-white/5 pb-3">GENEL BAKİYE ANALİZİ</h4>
          <div class="space-y-4">
            <div class="flex justify-between items-end border-b border-white/5 pb-4">
              <span class="text-[0.65rem] text-slate-500 font-bold uppercase tracking-widest">KULLANILABİLİR NET DURUM</span>
              <span class="text-2xl font-black font-mono tracking-tighter" :class="parseFloat(account?.balance) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                ₺{{ parseFloat(account?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">TAHSİLATLAR</span>
                <p class="text-lg font-black text-emerald-500 font-mono tracking-tighter">₺{{ parseFloat(account?.totalCredit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</p>
              </div>
              <div class="space-y-1 text-right">
                <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">BORÇLAR</span>
                <p class="text-lg font-black text-rose-500 font-mono tracking-tighter">₺{{ parseFloat(account?.totalDebit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-950/40 border-[1.5px] border-slate-700 shadow-xl space-y-4 text-left">
          <h4 class="text-[0.7rem] font-black text-slate-100 uppercase tracking-[0.2em] border-b border-white/5 pb-3">LİMİT & AVANS DURUMU</h4>
          <div class="space-y-4">
            <div class="p-6 bg-indigo-500/5 border-l-4 border-indigo-500 flex justify-between items-center">
              <div>
                <p class="text-[0.7rem] text-indigo-400 font-black uppercase tracking-widest">ÖN ÖDEME / AVANS</p>
                <p class="text-[0.55rem] text-slate-500 mt-1 uppercase font-bold">KUMBARADAKİ PARA</p>
              </div>
              <span class="text-2xl font-black text-indigo-300 font-mono">₺{{ parseFloat(account?.prepaidBalance || 0).toFixed(2) }}</span>
            </div>
            <div class="p-6 bg-amber-500/5 border-l-4 border-amber-500 flex justify-between items-center">
              <div>
                <p class="text-[0.7rem] text-amber-500 font-black uppercase tracking-widest">KANTİN VERESİYE LİMİTİ</p>
                <p class="text-[0.55rem] text-slate-500 mt-1 uppercase font-bold">ÜRÜN SATIŞLARINDA GEÇERLİ LİMİT</p>
              </div>
              <span class="text-2xl font-black text-amber-400 font-mono">₺{{ parseFloat(account?.debtLimit || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Footer -->
      <BaseActionFooter local>
        <div class="flex items-center gap-[10px]">
          <BaseButton variant="warning" size="icon" square @click="$emit('edit')" title="LİMİT VE DURUM BİLGİSİNİ DÜZENLE">
            <template #icon><Settings class="w-5 h-5"/></template>
          </BaseButton>

          <BaseButton variant="primary" size="icon" square @click="$emit('sync')" title="BAKİYE SENKRONİZE ET">
            <template #icon><RefreshCcw class="w-5 h-5" /></template>
          </BaseButton>

          <div class="w-px h-8 bg-slate-800 mx-1"></div>

          <BaseButton :variant="activeTab === 'history' ? 'primary' : 'dark'" size="icon" square @click="activeTab = 'history'" title="İŞLEM GEÇMİŞİ">
            <template #icon><History class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton :variant="activeTab === 'summary' ? 'primary' : 'dark'" size="icon" square @click="activeTab = 'summary'" title="FİNANSAL ÖZET">
            <template #icon><PieChart class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton v-if="selectedHistoryTransactionId" variant="danger" size="icon" square @click="$emit('delete-transaction')" title="BU İŞLEMİ SİL (Bakiye geri alınır)">
            <template #icon><Trash2 class="w-5 h-5" /></template>
          </BaseButton>

          <div class="w-px h-8 bg-slate-800 mx-1"></div>
          
          <BaseButton variant="dark" size="icon" square @click="$emit('close')" title="LİSTEYE DÖN">
            <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>
        </div>
      </BaseActionFooter>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { Settings, RefreshCcw, History, PieChart, Trash2, ArrowLeft } from 'lucide-vue-next'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  account: { type: Object, required: true },
  activeTab: { type: String, default: 'history' },
  searchQuery: { type: String, default: '' },
  viewMode: { type: String, default: 'list' },
  selectedHistoryTransactionId: { type: [String, Number], default: null }
})

const emit = defineEmits([
  'update:activeTab', 
  'update:searchQuery', 
  'update:viewMode',
  'edit', 'sync', 'delete-transaction', 'close', 'toggle-selection'
])

const activeTab = computed({
  get: () => props.activeTab,
  set: (val) => emit('update:activeTab', val)
})

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val)
})

const localViewMode = computed({
  get: () => props.viewMode,
  set: (val) => emit('update:viewMode', val)
})

const filteredTransactions = computed(() => {
  if (!props.account || !props.account.transactions) return []
  let txs = [...props.account.transactions].sort((a,b) => new Date(b.transactionDate) - new Date(a.transactionDate))
  if (localSearchQuery.value) {
    const q = localSearchQuery.value.toLowerCase()
    txs = txs.filter(t => 
      (t.description && t.description.toLowerCase().includes(q)) ||
      (getCategoryLabel(t.category).toLowerCase().includes(q)) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
    )
  }
  return txs
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const getCategoryLabel = (cat) => {
  const labels = {
    'DEBT_COLLECTION': 'CARİ TAHSİLAT',
    'PREPAID_LOAD': 'ÖN ÖDEME YÜKLEME',
    'MEMBERSHIP': 'ÜYELİK',
    'EXAM_FEE': 'SINAV ÜCRETİ',
    'PRODUCT_SALE': 'ÜRÜN SATIŞI',
    'PRODUCT_RENTAL': 'KİRALAMA',
    'SALARY': 'MAAŞ',
    'COMMISSION': 'KOMİSYON',
    'CASH_TRANSFER': 'TRANSFER',
    'EXPENSE': 'HARCAMA',
    'OTHER': 'DİĞER'
  }
  return labels[cat] || cat
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    'CASH': 'NAKİT',
    'CREDIT_CARD': 'KART',
    'BANK_TRANSFER': 'HAVALE',
    'COIN': 'COIN',
    'TICKET': 'TICKET',
    'OTHER': 'DİĞER'
  }
  return labels[method] || method
}
</script>
