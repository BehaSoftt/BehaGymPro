<template>
  <div v-if="auth.hasPermission('DASHBOARD_VIEW')" class="h-full flex flex-col overflow-hidden p-[10px] space-y-4">
    
    <!-- Dynamic Dashboard Content -->
    <div v-if="!loading" class="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-max">
        
        <!-- ROW 1: CORE STATS (WIDE) -->
        <div class="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseStatCard label="AKTİF ÜYELER" :value="data.counts.activeMembers" variant="success" subtitle="TOPLAM KAYITLI">
            <template #icon><Users class="w-8 h-8" /></template>
          </BaseStatCard>
          
          <BaseStatCard label="İÇERİDEKİ ÜYE" :value="data.counts.insideCount" variant="indigo" subtitle="ANLIK DURUM">
            <template #icon><Activity class="w-8 h-8" /></template>
          </BaseStatCard>

          <BaseStatCard label="BUGÜNKÜ GİRİŞ" :value="data.counts.todayEntries" variant="sky" subtitle="GÜNLÜK TOPLAM">
            <template #icon><LogIn class="w-8 h-8" /></template>
          </BaseStatCard>

          <BaseStatCard label="BUGÜNKÜ SATIŞ" :value="'₺' + formatMoney(data.counts.todaySalesTotal)" variant="amber" subtitle="SATIŞ TOPLAMI">
            <template #icon><ShoppingCart class="w-8 h-8" /></template>
          </BaseStatCard>
        </div>

        <!-- ROW 2: CASH BALANCES (TOP) -->
        <div class="col-span-1 lg:col-span-2 p-6 bg-slate-900/40 border-2 border-emerald-500/50 rounded-xl shadow-lg relative overflow-hidden group flex flex-col justify-center">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Banknote class="w-20 h-20 text-emerald-500" />
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet class="w-5 h-5" />
            </div>
            <h3 class="text-base font-black text-slate-200 uppercase tracking-tight">KASA DURUMU</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div class="space-y-1">
              <span class="text-[0.6rem] font-black text-emerald-500/60 uppercase tracking-widest">KENDİ KASAM</span>
              <div class="text-3xl font-black text-emerald-400 font-mono italic">₺{{ formatMoney(data.cashInfo.personnelBalance) }}</div>
            </div>
            <div class="space-y-1">
              <span class="text-[0.6rem] font-black text-sky-500/60 uppercase tracking-widest">ŞUBE KASASI</span>
              <div class="text-3xl font-black text-sky-400 font-mono italic">₺{{ formatMoney(data.cashInfo.branchBalance) }}</div>
            </div>
            <div class="space-y-1">
              <span class="text-[0.6rem] font-black text-violet-500/60 uppercase tracking-widest">ŞİRKET KASASI</span>
              <div class="text-3xl font-black text-violet-400 font-mono italic">₺{{ formatMoney(data.cashInfo.companyBalance) }}</div>
            </div>
          </div>
        </div>

        <!-- ROW 3: RECENT TRANSACTIONS (LIST) -->
        <div class="col-span-1 lg:col-span-2 p-6 bg-slate-900/40 border-2 border-indigo-500/30 rounded-xl shadow-lg flex flex-col">
          <div class="flex items-center justify-between mb-6 shrink-0">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <History class="w-5 h-5" />
              </div>
              <h3 class="text-base font-black text-slate-200 uppercase tracking-tight">SON CARİ HAREKETLER</h3>
            </div>
            <button @click="router.push('/financial-accounts')" class="text-[0.6rem] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest underline underline-offset-4 decoration-2">TÜMÜNÜ GÖR</button>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3" style="max-height: 380px;">
            <div v-for="t in paginatedTransactions" :key="t.id" class="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div class="flex flex-col">
                <span class="text-[0.7rem] font-black text-slate-200 uppercase truncate max-w-[200px]">{{ t.account?.accountName }}</span>
                <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-wider">{{ t.description || 'Açıklama Yok' }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                  <span :class="t.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'" class="text-xs font-black font-mono">
                    {{ t.transactionType === 'CREDIT' ? '+' : '-' }}₺{{ formatMoney(t.amount) }}
                  </span>
                  <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-tighter">{{ formatDateShort(t.createdAt) }}</span>
                </div>
              </div>
            </div>
            <p v-if="data.recentTransactions.length === 0" class="text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">HAREKET BULUNMUYOR</p>
          </div>

          <!-- Pagination Controls -->
          <div v-if="data.recentTransactions.length > 5" class="mt-4 pt-4 border-t border-indigo-500/20 flex items-center justify-between shrink-0">
             <div class="flex items-center gap-2">
                <button 
                   @click="txPage > 1 && txPage--" 
                   :disabled="txPage === 1"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-indigo-400 disabled:opacity-20 hover:border-indigo-500 transition-all"
                >
                   <ChevronLeft class="w-4 h-4" />
                </button>
                <div class="flex items-center gap-1.5 px-2">
                   <span class="text-[0.7rem] font-black text-indigo-400">{{ txPage }}</span>
                   <span class="text-[0.6rem] font-bold text-slate-600">/</span>
                   <span class="text-[0.7rem] font-black text-slate-400">{{ txTotalPages }}</span>
                </div>
                <button 
                   @click="txPage < txTotalPages && txPage++" 
                   :disabled="txPage === txTotalPages"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-indigo-400 disabled:opacity-20 hover:border-indigo-500 transition-all"
                >
                   <ChevronRight class="w-4 h-4" />
                </button>
             </div>
             <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">{{ data.recentTransactions.length }} HAREKET</span>
          </div>
        </div>

        <!-- ROW 4: RECENT SALES (WIDE) -->
        <div class="col-span-1 lg:col-span-3 p-6 bg-slate-900/40 border-2 border-amber-500/30 rounded-xl shadow-lg flex flex-col">
          <div class="flex items-center gap-3 mb-6 shrink-0">
            <div class="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400">
               <ShoppingCart class="w-5 h-5" />
            </div>
            <h3 class="text-base font-black text-slate-200 uppercase tracking-tight">SON ÜRÜN SATIŞLARI</h3>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2" style="max-height: 420px;">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="s in paginatedSales" :key="s.id" class="p-3 bg-slate-950/40 border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-all">
                <div class="flex flex-col">
                  <span class="text-[0.65rem] font-black text-amber-500 uppercase">{{ s.account?.accountName }}</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                     <span v-for="item in s.items" :key="item.id" class="text-[0.55rem] px-1.5 py-0.5 bg-slate-800 text-slate-400 font-bold uppercase">{{ item.product?.name }} x{{ item.quantity }}</span>
                  </div>
                </div>
                <div class="text-xs font-black text-slate-200 font-mono">₺{{ formatMoney(s.totalAmount) }}</div>
              </div>
              <p v-if="data.recentSales.length === 0" class="col-span-2 text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">SATIŞ BULUNMUYOR</p>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="data.recentSales.length > salesItemsPerPage" class="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between shrink-0">
             <div class="flex items-center gap-2">
                <button 
                   @click="salesPage > 1 && salesPage--" 
                   :disabled="salesPage === 1"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-amber-500 disabled:opacity-20 hover:border-amber-500 transition-all"
                >
                   <ChevronLeft class="w-4 h-4" />
                </button>
                <div class="flex items-center gap-1.5 px-2">
                   <span class="text-[0.7rem] font-black text-amber-500">{{ salesPage }}</span>
                   <span class="text-[0.6rem] font-bold text-slate-600">/</span>
                   <span class="text-[0.7rem] font-black text-slate-400">{{ salesTotalPages }}</span>
                </div>
                <button 
                   @click="salesPage < salesTotalPages && salesPage++" 
                   :disabled="salesPage === salesTotalPages"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-amber-500 disabled:opacity-20 hover:border-amber-500 transition-all"
                >
                   <ChevronRight class="w-4 h-4" />
                </button>
             </div>
             <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">{{ data.recentSales.length }} SATIŞ</span>
          </div>
        </div>

        <!-- ROW 5: BIRTHDAYS -->
        <div class="col-span-1 lg:col-span-1 p-6 bg-slate-900/40 border-2 border-rose-500/40 rounded-xl shadow-lg relative overflow-hidden">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Cake class="w-5 h-5" />
            </div>
            <h3 class="text-base font-black text-slate-200 uppercase tracking-tight">DOĞUM GÜNLERİ</h3>
          </div>
          <div class="space-y-3">
             <div v-for="b in data.birthdays" :key="b.name" class="flex items-center justify-between p-2 bg-rose-500/5 border border-rose-500/20">
                <div class="flex flex-col">
                   <span class="text-[0.65rem] font-black text-slate-200 uppercase leading-none">{{ b.name }}</span>
                   <span class="text-[0.55rem] text-rose-400 font-bold mt-1 tracking-widest">{{ b.age }} YAŞINA GİRDİ</span>
                </div>
                <div class="p-1 px-2 bg-rose-500 text-white text-[0.5rem] font-black uppercase">PASTA!</div>
             </div>
             <p v-if="data.birthdays.length === 0" class="text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">BUGÜN KİMSENİN DOĞUM GÜNÜ DEĞİL</p>
          </div>
        </div>

        <!-- ROW 6: EXPIRING / EXPIRED (LEFT) -->
        <div class="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           <!-- Expiring -->
           <div class="p-6 bg-slate-900/40 border-2 border-orange-500/30 rounded-xl shadow-lg flex flex-col">
              <div class="flex items-center gap-3 mb-6 shrink-0">
                <div class="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <ShieldAlert class="w-5 h-5" />
                </div>
                <h3 class="text-[0.8rem] font-black text-slate-200 uppercase tracking-tight">ÜYELİĞİ AZALANLAR (-10 GÜN)</h3>
              </div>
              <div class="flex-1 space-y-3">
                 <div v-for="m in paginatedExpiring" :key="m.name" class="p-2 bg-orange-500/5 border border-orange-500/20 flex flex-col gap-1">
                    <div class="flex justify-between items-center">
                       <span class="text-[0.65rem] font-black text-slate-200 uppercase truncate pr-2">{{ m.name }}</span>
                       <span class="text-[0.55rem] px-2 py-0.5 bg-orange-600 text-white font-black shrink-0">{{ m.daysLeft }} GÜN</span>
                    </div>
                    <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest truncate">{{ m.packageName }}</span>
                 </div>
                 <p v-if="data.expiringSoon.length === 0" class="text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">KRİTİK ÜYELİK YOK</p>
              </div>

              <!-- Expiring Pagination -->
              <div v-if="data.expiringSoon.length > expiringItemsPerPage" class="mt-4 pt-4 border-t border-orange-500/20 flex items-center justify-between shrink-0">
                 <div class="flex items-center gap-2">
                    <button @click="expiringPage > 1 && expiringPage--" :disabled="expiringPage === 1" class="p-1 px-2 bg-slate-950 border border-slate-800 text-orange-400 disabled:opacity-20 hover:border-orange-500 transition-all text-[0.6rem] font-bold">GERİ</button>
                    <span class="text-[0.6rem] font-black text-orange-400">{{ expiringPage }} / {{ expiringTotalPages }}</span>
                    <button @click="expiringPage < expiringTotalPages && expiringPage++" :disabled="expiringPage === expiringTotalPages" class="p-1 px-2 bg-slate-950 border border-slate-800 text-orange-400 disabled:opacity-20 hover:border-orange-500 transition-all text-[0.6rem] font-bold">İLERİ</button>
                 </div>
              </div>
           </div>

           <!-- Expired -->
           <div class="p-6 bg-slate-900/40 border-2 border-rose-600/30 rounded-xl shadow-lg flex flex-col">
              <div class="flex items-center gap-3 mb-6 shrink-0">
                <div class="p-2 bg-rose-600/10 border border-rose-600/20 text-rose-500">
                  <ZapOff class="w-5 h-5" />
                </div>
                <h3 class="text-[0.8rem] font-black text-slate-200 uppercase tracking-tight">ÜYELİĞİ BİTENLER</h3>
              </div>
              <div class="flex-1 space-y-3">
                 <div v-for="m in paginatedExpired" :key="m.name" class="p-2 bg-rose-600/5 border border-rose-600/20 flex flex-col gap-1">
                    <div class="flex justify-between items-center">
                       <span class="text-[0.65rem] font-black text-slate-200 uppercase truncate pr-2">{{ m.name }}</span>
                       <span class="text-[0.5rem] text-rose-500 font-black uppercase shrink-0">PASİF</span>
                    </div>
                    <span class="text-[0.5rem] text-slate-600 font-black uppercase truncate">{{ m.packageName }} - {{ formatDateFull(m.expiryDate) }}</span>
                 </div>
                 <p v-if="data.expiredMembers.length === 0" class="text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">SONA EREN ÜYELİK YOK</p>
              </div>

              <!-- Expired Pagination -->
              <div v-if="data.expiredMembers.length > expiredItemsPerPage" class="mt-4 pt-4 border-t border-rose-600/20 flex items-center justify-between shrink-0">
                 <div class="flex items-center gap-2">
                    <button @click="expiredPage > 1 && expiredPage--" :disabled="expiredPage === 1" class="p-1 px-2 bg-slate-950 border border-slate-800 text-rose-500 disabled:opacity-20 hover:border-rose-500 transition-all text-[0.6rem] font-bold">GERİ</button>
                    <span class="text-[0.6rem] font-black text-rose-500">{{ expiredPage }} / {{ expiredTotalPages }}</span>
                    <button @click="expiredPage < expiredTotalPages && expiredPage++" :disabled="expiredPage === expiredTotalPages" class="p-1 px-2 bg-slate-950 border border-slate-800 text-rose-500 disabled:opacity-20 hover:border-rose-500 transition-all text-[0.6rem] font-bold">İLERİ</button>
                 </div>
              </div>
           </div>
        </div>

        <!-- ROW 7: NEWEST MEMBERS (RIGHT) -->
        <div class="col-span-1 lg:col-span-2 p-6 bg-slate-900/40 border-2 border-sky-500/30 rounded-xl shadow-lg flex flex-col">
          <div class="flex items-center gap-3 mb-6 shrink-0">
            <div class="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <UserPlus class="w-5 h-5" />
            </div>
            <h3 class="text-base font-black text-slate-200 uppercase tracking-tight">EN YENİ ÜYELER</h3>
          </div>
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
             <div v-for="m in paginatedNewMembers" :key="m.name" class="flex items-center gap-4 p-3 bg-slate-950/40 border border-slate-800 group hover:border-sky-500/50 transition-all">
                <div class="w-8 h-8 flex items-center justify-center bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-black shrink-0">{{ m.name[0] }}</div>
                <div class="flex flex-col min-w-0">
                   <span class="text-[0.7rem] font-black text-slate-200 uppercase truncate">{{ m.name }}</span>
                   <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-tighter truncate">{{ m.package }}</span>
                </div>
                <div class="ml-auto flex flex-col items-end shrink-0">
                   <span class="text-[0.55rem] font-black text-sky-500 uppercase tracking-widest">YENİ</span>
                   <span class="text-[0.5rem] font-bold text-slate-700">{{ formatDateFull(m.date) }}</span>
                </div>
             </div>
             <p v-if="data.newestMembers.length === 0" class="col-span-2 text-center py-4 text-[0.6rem] text-slate-600 font-bold uppercase tracking-widest opacity-40">ÜYE BULUNMUYOR</p>
          </div>

          <!-- Pagination Controls -->
          <div v-if="data.newestMembers.length > newMemberItemsPerPage" class="mt-4 pt-4 border-t border-sky-500/20 flex items-center justify-between shrink-0">
             <div class="flex items-center gap-2">
                <button 
                   @click="newMemberPage > 1 && newMemberPage--" 
                   :disabled="newMemberPage === 1"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-sky-400 disabled:opacity-20 hover:border-sky-500 transition-all"
                >
                   <ChevronLeft class="w-4 h-4" />
                </button>
                <div class="flex items-center gap-1.5 px-2">
                   <span class="text-[0.7rem] font-black text-sky-400">{{ newMemberPage }}</span>
                   <span class="text-[0.6rem] font-bold text-slate-600">/</span>
                   <span class="text-[0.7rem] font-black text-slate-400">{{ newMemberTotalPages }}</span>
                </div>
                <button 
                   @click="newMemberPage < newMemberTotalPages && newMemberPage++" 
                   :disabled="newMemberPage === newMemberTotalPages"
                   class="p-1.5 bg-slate-950 border border-slate-800 text-sky-400 disabled:opacity-20 hover:border-sky-500 transition-all"
                >
                   <ChevronRight class="w-4 h-4" />
                </button>
             </div>
             <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-widest">{{ data.newestMembers.length }} ÜYE</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
        <span class="text-[0.75rem] font-black text-slate-500 uppercase tracking-[0.3em]">VERİLER SENKRONİZE EDİLİYOR...</span>
      </div>
    </div>

    <!-- Action Footer -->
    <BaseActionFooter v-if="!loading">
       <div class="flex items-center gap-[10px]">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="KAPAT">
             <template #icon><X class="w-5 h-5" /></template>
          </BaseButton>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, Activity, ShoppingCart, LogIn, Wallet, History, 
  Banknote, Cake, ShieldAlert, ZapOff, UserPlus, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { useAuthStore } from '../../store/auth'
import { useAlerts } from '../../utils/alerts'
import { dashboardService } from '../../services/dashboard/dashboardService'

// Base Components
import BaseStatCard from '../../components/base/BaseStatCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import { X } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { toast } = useAlerts()

const loading = ref(true)
const lastUpdate = ref('-')
const isAutoRefreshActive = ref(true)
const refreshTimer = ref(null)
const refreshProgress = ref(100)

// Pagination for Transactions
const txPage = ref(1)
const txItemsPerPage = 5

// Pagination for Sales
const salesPage = ref(1)
const salesItemsPerPage = 6 // Responsive 2-column grid works well with 6 (3 rows)

// Pagination for Newest Members
const newMemberPage = ref(1)
const newMemberItemsPerPage = 8 // 2-column grid, 4 rows

// Pagination for Expiring
const expiringPage = ref(1)
const expiringItemsPerPage = 5

// Pagination for Expired
const expiredPage = ref(1)
const expiredItemsPerPage = 5

const data = ref({
  counts: { activeMembers: 0, totalMembers: 0, insideCount: 0, todayEntries: 0, todaySalesTotal: 0 },
  cashInfo: { personnelBalance: '0.00', branchBalance: '0.00', companyBalance: '0.00' },
  recentTransactions: [],
  recentSales: [],
  birthdays: [],
  expiringSoon: [],
  expiredMembers: [],
  newestMembers: []
})

const txTotalPages = computed(() => Math.ceil(data.value.recentTransactions.length / txItemsPerPage) || 1)
const paginatedTransactions = computed(() => {
  const start = (txPage.value - 1) * txItemsPerPage
  return data.value.recentTransactions.slice(start, start + txItemsPerPage)
})

const salesTotalPages = computed(() => Math.ceil(data.value.recentSales.length / salesItemsPerPage) || 1)
const paginatedSales = computed(() => {
  const start = (salesPage.value - 1) * salesItemsPerPage
  return data.value.recentSales.slice(start, start + salesItemsPerPage)
})

const newMemberTotalPages = computed(() => Math.ceil(data.value.newestMembers.length / newMemberItemsPerPage) || 1)
const paginatedNewMembers = computed(() => {
  const start = (newMemberPage.value - 1) * newMemberItemsPerPage
  return data.value.newestMembers.slice(start, start + newMemberItemsPerPage)
})

const expiringTotalPages = computed(() => Math.ceil(data.value.expiringSoon.length / expiringItemsPerPage) || 1)
const paginatedExpiring = computed(() => {
  const start = (expiringPage.value - 1) * expiringItemsPerPage
  return data.value.expiringSoon.slice(start, start + expiringItemsPerPage)
})

const expiredTotalPages = computed(() => Math.ceil(data.value.expiredMembers.length / expiredItemsPerPage) || 1)
const paginatedExpired = computed(() => {
  const start = (expiredPage.value - 1) * expiredItemsPerPage
  return data.value.expiredMembers.slice(start, start + expiredItemsPerPage)
})

const fetchDashboardData = async (isBackground = false) => {
  try {
    if (!isBackground) loading.value = true
    const result = await dashboardService.getStats()
    data.value = result
    txPage.value = 1 
    salesPage.value = 1 
    newMemberPage.value = 1 
    expiringPage.value = 1
    expiredPage.value = 1
    lastUpdate.value = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (err) {
    console.error('Dashboard verileri alınamadı:', err)
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
    stopAutoRefresh()
    refreshProgress.value = 100
    
    const totalMs = 15000 // 15 Saniye
    let elapsedMs = 0
    
    console.log('[DASHBOARD] Canlı takip başlatıldı (15s)');
    
    refreshTimer.value = setInterval(async () => {
        try {
            if (!isAutoRefreshActive.value) {
                stopAutoRefresh()
                return
            }

            elapsedMs += 100
            refreshProgress.value = Math.max(0, 100 - (elapsedMs / totalMs) * 100)

            if (elapsedMs >= totalMs) {
                elapsedMs = 0 
                refreshProgress.value = 100 
                
                await fetchDashboardData(true)
            }
        } catch (error) {
            console.error('[DASHBOARD] Otomatik yenileme hatası:', error)
        }
    }, 100)
}

const stopAutoRefresh = () => {
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
        refreshTimer.value = null
    }
}

const formatMoney = (val) => {
  const num = parseFloat(val) || 0
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const formatDateFull = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

onMounted(async () => {
   await fetchDashboardData()
   if (isAutoRefreshActive.value) {
       startAutoRefresh()
   }
})

onUnmounted(() => {
    stopAutoRefresh()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(225, 29, 72, 0.2);
}
</style>

