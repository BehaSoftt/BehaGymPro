<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    <!-- Tabs Header -->
    <div v-if="!showDetailView" class="flex items-center gap-1 mb-2 px-2">
      <button 
        @click="activeMainTab = 'accounts'"
        :class="activeMainTab === 'accounts' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'"
        class="px-6 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all border border-rose-500/20"
      >
        CARİ HESAPLAR
      </button>
      <button 
        @click="activeMainTab = 'paymentPlans'"
        :class="activeMainTab === 'paymentPlans' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'"
        class="px-6 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all border border-rose-500/20"
      >
        TAKSİT VE ÖDEMELER
      </button>
    </div>

    <!-- Standardized Filters using BaseSearchFilter -->
    <div v-if="!showDetailView && activeMainTab === 'accounts'" class="px-2">
      <BaseSearchFilter
        v-model:searchQuery="searchQuery"
        v-model:viewMode="viewMode"
        placeholder="Cari hesap ara..."
        accent="rose"
      >
        <template #extra-left>
           <select
             v-model="filterType"
             @change="fetchAccounts"
             class="bg-transparent text-slate-400 text-[0.6rem] font-black px-3 py-1.5 uppercase outline-none focus:text-rose-500 transition-all w-[110px]"
           >
             <option value="">TÜM TİPLER</option>
             <option value="MEMBER">ÜYE</option>
             <option value="USER">PERSONEL</option>
             <option value="INSTRUCTOR">EĞİTMEN</option>
             <option value="BRANCH">ŞUBE KASASI</option>
             <option value="COMPANY">ŞİRKET KASASI</option>
             <option value="GUEST">MİSAFİR</option>
           </select>
        </template>
      </BaseSearchFilter>
    </div>

    <BaseSearchFilter
      v-if="!showDetailView && activeMainTab === 'paymentPlans'"
      v-model:searchQuery="searchQueryPlans"
      v-model:viewMode="viewModePlans"
      placeholder="Üye veya plan ara..."
      accent="rose"
    >
      <template #extra-actions>
        <select
          v-model="filterStatusPlans"
          @change="fetchPlans"
          class="bg-slate-900 border border-slate-800 text-slate-300 text-[0.6rem] font-bold px-3 py-1.5 uppercase outline-none focus:border-rose-500 transition-all rounded-sm"
        >
          <option value="">TÜM DURUMLAR</option>
          <option value="ACTIVE">AKTİF</option>
          <option value="COMPLETED">ÖDENDİ</option>
          <option value="OVERDUE">GECİKMİŞ</option>
          <option value="CANCELLED">İPTAL EDİLDİ</option>
        </select>
      </template>
    </BaseSearchFilter>

    <!-- Accounts Display Area -->
    <div v-if="!showDetailView && activeMainTab === 'accounts'" class="flex-1 relative overflow-hidden">
      <!-- List Area Container -->
      <div class="absolute inset-0 overflow-y-auto px-2 pb-[10px] custom-scrollbar">
        
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          <BaseCard 
            v-for="account in accounts" 
            :key="account.id" 
            :selected="selectedAccountIds.includes(account.id)"
            accent="emerald"
            @click="toggleSelection(account.id)"
          >
            <div class="flex flex-col gap-4">
              <div class="flex justify-between items-start">
                <div class="p-2.5 bg-slate-950 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                  <Wallet :class="selectedAccountIds.includes(account.id) ? 'text-white' : 'text-indigo-400'" class="w-5 h-5 transition-colors" />
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span :class="account.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-800/50 border-slate-700'" 
                        class="text-[0.6rem] font-black px-2 py-0.5 border uppercase tracking-widest">
                    {{ account.isActive ? 'AKTİF' : 'PASİF' }}
                  </span>
                </div>
              </div>

              <div class="uppercase tracking-tight mt-2 text-left">
                <h3 class="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">{{ account.accountName }}</h3>
                <p class="text-[0.6rem] text-slate-500 font-mono tracking-widest uppercase mt-0.5">{{ account.accountCode }}</p>
              </div>
              
              <div class="space-y-3 py-4 border-t border-slate-700/50 mt-auto">
                <div class="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-widest">
                  <span class="text-slate-500">TİP</span>
                  <span class="text-indigo-400">{{ getEntityLabel(account.entityType) }}</span>
                </div>
                <div class="p-3 bg-slate-950/50 border border-slate-700/50 space-y-1.5 shadow-inner">
                  <div class="flex justify-between items-center">
                    <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest font-mono">TOPLAM:</span>
                    <span class="text-sm font-black transition-colors" :class="parseFloat(account.balance) > 0 ? 'text-rose-400' : (parseFloat(account.balance) < 0 ? 'text-emerald-400' : 'text-slate-400')">
                      ₺ {{ Math.abs(parseFloat(account.balance || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} {{ parseFloat(account.balance) > 0 ? 'BORÇ' : (parseFloat(account.balance) < 0 ? 'ALACAK' : '') }}
                    </span>
                  </div>
                  <!-- Pocket Splits -->
                  <div v-if="account.entityType === 'BRANCH' || account.entityType === 'COMPANY'" class="pt-2 border-t border-slate-800 space-y-1 mt-1">
                    <div class="flex justify-between items-center text-[0.55rem]">
                      <span class="text-slate-500 uppercase">NAKİT:</span>
                      <span class="font-bold text-emerald-500">₺{{ parseFloat(account.cashBalance || 0).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[0.55rem]">
                      <span class="text-slate-500 uppercase">POS:</span>
                      <span class="font-bold text-amber-500">₺{{ parseFloat(account.posBalance || 0).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[0.55rem]">
                      <span class="text-slate-500 uppercase">BANKA/İBAN:</span>
                      <span class="font-bold text-indigo-400">₺{{ parseFloat(account.bankBalance || 0).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[0.55rem] pt-1 border-t border-slate-700/30">
                      <span class="text-emerald-500 uppercase font-black">TOPLAM GİREN:</span>
                      <span class="font-black text-emerald-400 text-[0.6rem]">₺{{ parseFloat(account.totalCredit || 0).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[0.55rem]">
                      <span class="text-rose-500 uppercase font-black">TOPLAM ÇIKAN:</span>
                      <span class="font-black text-rose-400 text-[0.6rem]">₺{{ parseFloat(account.totalDebit || 0).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div v-if="parseFloat(account.prepaidBalance || 0) > 0" class="flex justify-between items-center">
                    <span class="text-[0.55rem] text-indigo-400 font-bold uppercase">ÖN ÖDEME:</span>
                    <span class="text-xs font-bold text-indigo-300">₺{{ parseFloat(account.prepaidBalance).toFixed(2) }}</span>
                  </div>
                  <div v-if="parseFloat(account.debtLimit || 0) > 0" class="flex justify-between items-center px-0">
                    <span class="text-[0.55rem] text-amber-500 font-bold uppercase">LİMİT:</span>
                    <span class="text-xs font-bold text-amber-400">₺{{ parseFloat(account.debtLimit).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- List View using BaseTable -->
        <div v-if="viewMode === 'list'" class="h-full flex flex-col pt-0 pb-4">
          <div class="flex-1 min-h-0 relative">
            <BaseTable
              :columns="[
                { key: 'accountInfo', label: 'HESAP BİLGİSİ' },
                { key: 'entityType',  label: 'TİP', align: 'center' },
                { key: 'cashBalance', label: 'NAKİT', align: 'center' },
                { key: 'posBalance',  label: 'POS', align: 'center' },
                { key: 'bankBalance', label: 'İBAN', align: 'center' },
                { key: 'totalCredit', label: 'GİREN', align: 'center' },
                { key: 'totalDebit',  label: 'ÇIKAN', align: 'center' },
                { key: 'prepaidBalance', label: 'ÖN ÖDEME', align: 'center' },
                { key: 'debtLimit',   label: 'BORÇ LİMİTİ', align: 'center' },
                { key: 'balance',     label: 'NET BAKİYE', align: 'center' },
                { key: 'status',      label: 'DURUM', align: 'center' },
              ]"
              :items="accounts"
              :selectedIds="selectedAccountIds"
              accent="rose"
              @rowClick="toggleSelection($event.id)"
            >
              <template #cell-accountInfo="{ item }">
                <div class="flex items-center gap-3">
                  <div :class="selectedAccountIds.includes(item.id) ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-950 border-slate-700'" class="w-10 h-10 border flex items-center justify-center relative overflow-hidden transition-colors">
                    <Wallet :class="selectedAccountIds.includes(item.id) ? 'text-white' : 'text-indigo-400'" class="w-4 h-4" />
                  </div>
                  <div class="flex flex-col uppercase tracking-tight text-left">
                    <span class="text-slate-50 group-hover:text-emerald-400 transition-colors font-bold">{{ item.accountName }}</span>
                    <span class="text-[0.6rem] text-slate-500 font-mono tracking-widest">{{ item.accountCode }}</span>
                  </div>
                </div>
              </template>

              <template #cell-entityType="{ item }">
                <span
                  class="text-[0.65rem] font-bold px-2 py-1 uppercase tracking-widest border"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': item.entityType === 'MEMBER',
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20': item.entityType === 'USER',
                    'bg-amber-500/10 text-amber-400 border-amber-500/20': item.entityType === 'INSTRUCTOR',
                    'bg-violet-500/10 text-violet-400 border-violet-500/20': item.entityType === 'GUEST',
                    'bg-slate-950 text-slate-400 border-slate-700': item.entityType === 'BRANCH' || item.entityType === 'COMPANY'
                  }"
                >
                  {{ getEntityLabel(item.entityType) }}
                </span>
              </template>

              <template #cell-cashBalance="{ item }">
                <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg w-[110px] mx-auto flex items-center justify-center">
                  <p class="text-[0.8rem] font-black text-emerald-400 tracking-tighter">
                    ₺{{ parseFloat(item.cashBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-posBalance="{ item }">
                <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg w-[110px] mx-auto flex items-center justify-center border-b-2 border-b-amber-500/30">
                  <p class="text-[0.8rem] font-black text-amber-400 tracking-tighter">
                    ₺{{ parseFloat(item.posBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-bankBalance="{ item }">
                <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg w-[110px] mx-auto flex items-center justify-center border-b-2 border-b-indigo-500/30">
                  <p class="text-[0.8rem] font-black text-indigo-400 tracking-tighter">
                    ₺{{ parseFloat(item.bankBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-prepaidBalance="{ item }">
                <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg w-[100px] mx-auto flex items-center justify-center border-b-2 border-b-indigo-500/30">
                  <p class="text-[0.7rem] font-black text-indigo-400 tracking-tighter">
                    ₺{{ parseFloat(item.prepaidBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-totalCredit="{ item }">
                <div class="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 shadow-lg w-[100px] mx-auto flex items-center justify-center">
                  <p class="text-[0.7rem] font-black text-emerald-400 tracking-tighter">
                    ₺{{ parseFloat(item.totalCredit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-totalDebit="{ item }">
                <div class="px-3 py-1 bg-rose-500/5 border border-rose-500/20 shadow-lg w-[100px] mx-auto flex items-center justify-center">
                  <p class="text-[0.7rem] font-black text-rose-400 tracking-tighter">
                    ₺{{ parseFloat(item.totalDebit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-debtLimit="{ item }">
                <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-lg w-[110px] mx-auto flex items-center justify-center border-b-2 border-b-amber-500/30">
                  <p class="text-[0.8rem] font-black text-amber-500 tracking-tighter">
                    ₺{{ parseFloat(item.debtLimit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                  </p>
                </div>
              </template>

              <template #cell-balance="{ item }">
                <div class="px-3 py-1.5 bg-slate-950 border shadow-lg w-[150px] flex items-center justify-center mx-auto"
                     :class="parseFloat(item.balance) > 0 ? 'border-rose-500/30 bg-rose-500/10' : (parseFloat(item.balance) < 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800')">
                  <p :class="parseFloat(item.balance) > 0 ? 'text-rose-400 font-bold' : (parseFloat(item.balance) < 0 ? 'text-emerald-400 font-bold' : 'text-slate-400')" 
                     class="text-[0.8rem] font-black tracking-tighter italic">
                    <span v-if="parseFloat(item.balance) > 0">₺ {{ Math.abs(parseFloat(item.balance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} (BORÇ)</span>
                    <span v-else-if="parseFloat(item.balance) < 0">₺ {{ Math.abs(parseFloat(item.balance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} (ALACAK)</span>
                    <span v-else>₺ 0,00</span>
                  </p>
                </div>
              </template>

              <template #cell-status="{ item }">
                <span :class="item.isActive ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'text-slate-500 border-slate-700 bg-slate-800/50'" class="text-[0.55rem] font-black px-2 py-0.5 border uppercase tracking-wider">
                  {{ item.isActive ? 'AKTİF' : 'PASİF' }}
                </span>
              </template>
            </BaseTable>
          </div>

          <!-- Enhanced Summary Dashboard Bar -->
          <div class="flex-none bg-slate-900/80 backdrop-blur-md border-t-2 border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] py-2 px-6 z-20">
             <div class="flex items-center justify-between">
                 <div class="flex items-center gap-6">
                    <div class="flex flex-col uppercase tracking-tight border-l-2 border-rose-500 pl-4 text-left">
                        <span class="text-[0.7rem] font-black text-slate-100 italic tracking-[0.2em]">GENEL FİNANSAL ÖZET</span>
                        <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">{{ totalAccounts }} TOPLAM CARİ KAYIT</span>
                    </div>
                 </div>

                  <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-0.5" v-for="t in [
                      { l: 'KASA (NAKİT)', v: tableTotals.totalCash, c: 'text-emerald-400', b: 'border-emerald-500/20' },
                      { l: 'POS (BANKA)', v: tableTotals.totalPos, c: 'text-rose-400', b: 'border-rose-500/20' },
                      { l: 'İBAN (BANKA)', v: tableTotals.totalBank, c: 'text-indigo-400', b: 'border-indigo-500/20' },
                      { l: 'GİREN', v: tableTotals.totalCredit, c: 'text-emerald-400', b: 'border-emerald-500/20' },
                      { l: 'ÇIKAN', v: tableTotals.totalDebit, c: 'text-rose-400', b: 'border-rose-500/20' },
                      { l: 'NET BAKİYE', v: tableTotals.balance, c: tableTotals.balance >= 0 ? 'text-white' : 'text-rose-400', b: tableTotals.balance >= 0 ? 'border-slate-500/20' : 'border-rose-500/20' }
                    ]" :key="t.l">
                        <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">{{ t.l }}</span>
                        <div :class="['px-3 py-1 bg-slate-950 border shadow-2xl min-w-[120px] flex items-center justify-center relative overflow-hidden group', t.b]">
                           <p :class="['text-[0.8rem] font-black tracking-tighter relative z-10', t.c]">
                             ₺{{ t.v.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                           </p>
                        </div>
                    </div>
                  </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Plans Display Area -->
    <div v-else-if="!showDetailView && activeMainTab === 'paymentPlans'" class="flex-1 relative overflow-hidden">
      <div class="absolute inset-0 overflow-y-auto px-2 pb-[10px] custom-scrollbar">
        
        <!-- Grid View -->
        <div v-if="viewModePlans === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          <BaseCard 
            v-for="plan in plans" 
            :key="plan.id" 
            :selected="selectedPlanIds.includes(plan.id)"
            accent="rose"
            @click="togglePlanSelection(plan.id)"
          >
            <div class="flex flex-col gap-4">
              <div class="flex justify-between items-start">
                <div class="p-2.5 bg-slate-950 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                  <Wallet :class="selectedPlanIds.includes(plan.id) ? 'text-white' : 'text-indigo-400'" class="w-5 h-5 transition-colors" />
                </div>
                <div class="flex flex-col items-end gap-1">
                   <span
                     class="px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider border shadow-sm"
                     :class="{
                       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5': plan.status === 'COMPLETED',
                       'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5': plan.status === 'ACTIVE',
                       'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5': plan.status === 'OVERDUE',
                       'bg-slate-500/10 text-slate-500 border-slate-500/20': plan.status === 'CANCELLED'
                     }"
                   >
                     {{ plan.status === 'ACTIVE' ? 'AKTİF' : plan.status === 'COMPLETED' ? 'ÖDENDİ' : plan.status === 'OVERDUE' ? 'GECİKTİ' : 'İPTAL' }}
                   </span>
                </div>
              </div>

              <div class="uppercase tracking-tight mt-2 text-left">
                <h3 class="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">{{ plan.account?.accountName }}</h3>
                <p class="text-[0.6rem] text-slate-500 font-mono tracking-widest uppercase mt-0.5">{{ plan.account?.accountCode }}</p>
              </div>
              
              <div class="space-y-3 py-4 border-t border-slate-700/50 mt-auto">
                 <div class="flex flex-col gap-1">
                    <span class="text-indigo-400 font-black uppercase tracking-wider text-[0.65rem] text-left">{{ plan.planName }}</span>
                    <div class="flex items-center gap-2 text-slate-500 text-[0.55rem] font-bold uppercase tracking-widest">
                      <Clock class="w-3 h-3" />
                      {{ plan.installmentCount }} TAKSİT ({{ plan.installmentFrequency }})
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="h-1.5 flex-1 bg-slate-950 border border-slate-700 overflow-hidden">
                        <div 
                          class="h-full bg-emerald-500 transition-all duration-500" 
                          :style="{ width: `${(plan.schedules?.filter(s => s.status === 'PAID').length || 0) / plan.installmentCount * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-[0.55rem] font-black text-emerald-500 font-mono tracking-tighter">
                        {{ plan.schedules?.filter(s => s.status === 'PAID').length || 0 }}/{{ plan.installmentCount }}
                      </span>
                    </div>
                 </div>
                 <div class="p-3 bg-slate-950/50 border border-slate-700/50 space-y-1.5 shadow-inner">
                    <div class="flex justify-between items-center">
                       <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest font-mono">TOPLAM:</span>
                       <span class="text-sm font-black text-slate-100">₺{{ parseFloat(plan.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                       <span class="text-[0.55rem] text-emerald-400 font-bold uppercase">ÖDENEN:</span>
                       <span class="text-xs font-bold text-emerald-300">₺{{ parseFloat(plan.paidAmount).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                       <span class="text-[0.55rem] text-amber-500 font-bold uppercase">KALAN:</span>
                       <span class="text-xs font-bold text-amber-400">₺{{ parseFloat(plan.remainingAmount).toFixed(2) }}</span>
                    </div>
                 </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- List View -->
        <div v-if="viewModePlans === 'list'" class="h-full flex flex-col pt-0 pb-4">
          <div class="flex-1 min-h-0 relative">
            <BaseTable
              :columns="[
                { key: 'accountInfo', label: 'ÜYE / CARİ BİLGİSİ' },
                { key: 'planDetails', label: 'PLAN DETAYI' },
                { key: 'installmentInfo', label: 'TAKSİT SAYISI', align: 'center' },
                { key: 'totalAmount', label: 'TOPLAM', align: 'right' },
                { key: 'paidAmount', label: 'ÖDENEN', align: 'right' },
                { key: 'remainingAmount', label: 'KALAN', align: 'right' },
                { key: 'status', label: 'DURUM', align: 'center' }
              ]"
              :items="plans"
              :selectedIds="selectedPlanIds"
              accent="rose"
              @rowClick="togglePlanSelection($event.id)"
            >
              <template #cell-accountInfo="{ item }">
                <div class="flex items-center gap-3">
                  <div :class="selectedPlanIds.includes(item.id) ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-950 border-slate-700'" class="w-10 h-10 border flex items-center justify-center transition-all relative overflow-hidden">
                    <Wallet :class="selectedPlanIds.includes(item.id) ? 'text-white' : 'text-indigo-400'" class="w-4 h-4" />
                  </div>
                  <div class="flex flex-col uppercase tracking-tight text-left">
                    <span class="text-slate-50 group-hover:text-emerald-400 transition-colors font-bold">{{ item.account?.accountName }}</span>
                    <span class="text-[0.6rem] text-slate-500 font-mono tracking-widest">{{ item.account?.accountCode }}</span>
                  </div>
                </div>
              </template>
  
              <template #cell-planDetails="{ item }">
                 <div class="text-left">
                    <span class="text-indigo-400 font-black uppercase tracking-wider text-[0.7rem] leading-none">
                      {{ item.planName }}
                    </span>
                 </div>
              </template>
  
              <template #cell-installmentInfo="{ item }">
                <div class="flex flex-col items-center gap-1.5 py-1">
                  <div class="flex items-center gap-2 text-slate-300 text-[0.65rem] font-bold uppercase tracking-widest leading-none">
                    <Clock class="w-3.5 h-3.5 text-indigo-400" />
                    {{ item.installmentCount }} TAKSİT
                  </div>
                  <div class="flex items-center gap-2 w-32 px-2 py-1 bg-slate-950/50 border border-slate-800 shadow-inner">
                    <div class="h-1 flex-1 bg-slate-950 border border-slate-700 overflow-hidden">
                      <div 
                        class="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                        :style="{ width: `${(item.schedules?.filter(s => s.status === 'PAID').length || 0) / item.installmentCount * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-[0.66rem] font-black text-emerald-500 font-mono whitespace-nowrap">
                      {{ item.schedules?.filter(s => s.status === 'PAID').length || 0 }}/{{ item.installmentCount }}
                    </span>
                  </div>
                </div>
              </template>
  
              <template #cell-totalAmount="{ item }">
                 <div class="px-3 py-1.5 bg-slate-950 border border-slate-800 shadow-lg w-[140px] ml-auto flex items-center justify-center">
                    <p class="text-[0.9rem] font-black text-slate-100 tracking-tighter italic">
                      ₺{{ parseFloat(item.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                    </p>
                 </div>
              </template>
  
              <template #cell-paidAmount="{ item }">
                 <div class="px-3 py-1.5 bg-slate-950 border border-slate-800 shadow-lg w-[140px] ml-auto flex items-center justify-center">
                    <p class="text-[0.9rem] font-black text-emerald-400 tracking-tighter italic">
                      ₺{{ parseFloat(item.paidAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                    </p>
                 </div>
              </template>
  
              <template #cell-remainingAmount="{ item }">
                 <div class="px-3 py-1.5 bg-slate-950 border border-slate-800 shadow-lg w-[140px] ml-auto flex items-center justify-center">
                    <p class="text-[0.9rem] font-black text-amber-500 tracking-tighter italic">
                      ₺{{ parseFloat(item.remainingAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                    </p>
                 </div>
              </template>
  
              <template #cell-status="{ item }">
                <span
                  class="px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider border shadow-sm"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5': item.status === 'COMPLETED',
                    'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5': item.status === 'ACTIVE',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5': item.status === 'OVERDUE',
                    'bg-slate-500/10 text-slate-500 border-slate-500/20': item.status === 'CANCELLED'
                  }"
                >
                  {{ item.status === 'ACTIVE' ? 'AKTİF' : item.status === 'COMPLETED' ? 'ÖDENDİ' : item.status === 'OVERDUE' ? 'GECİKTİ' : 'İPTAL' }}
                </span>
              </template>
            </BaseTable>
          </div>

          <!-- Payment Plans Summary Bar -->
          <div class="flex-none bg-slate-900/80 backdrop-blur-md border-t-2 border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] py-2 px-6 z-20">
             <div class="flex items-center justify-between">
                 <div class="flex items-center gap-6">
                    <div class="flex flex-col uppercase tracking-tight border-l-2 border-rose-500 pl-4 text-left">
                        <span class="text-[0.7rem] font-black text-slate-100 italic tracking-[0.2em]">ÖDEME PLANI ÖZETİ</span>
                        <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">{{ plans.length }} AKTİF TAKSİT PLANI</span>
                    </div>
                 </div>

                  <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-0.5" v-for="t in [
                      { l: 'TOPLAM TUTAR', v: planTotals.totalAmount, c: 'text-slate-300', b: 'border-slate-700' },
                      { l: 'TAHSİLAT', v: planTotals.totalPaid, c: 'text-emerald-400', b: 'border-emerald-500/20' },
                      { l: 'KALAN BAKİYE', v: planTotals.totalRemaining, c: 'text-amber-500', b: 'border-amber-500/20' }
                    ]" :key="t.l">
                        <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">{{ t.l }}</span>
                        <div :class="['px-3 py-1 bg-slate-950 border shadow-2xl min-w-[140px] flex items-center justify-center relative overflow-hidden group', t.b]">
                           <p :class="['text-[0.8rem] font-black tracking-tighter relative z-10', t.c]">
                             ₺{{ t.v.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                           </p>
                        </div>
                    </div>
                  </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Extracted Components -->
    <FinancialAccountTransactionForm 
      v-if="showTransactionModal"
      :account="selectedAccount"
      v-model="transactionForm"
      @save="addTransaction"
      @cancel="showTransactionModal = false"
    />

    <FinancialAccountEditForm 
      v-if="showEditModal"
      v-model="editForm"
      @save="saveAccountLimits"
      @cancel="showEditModal = false"
    />

    <FinancialAccountDetailView 
      v-if="showDetailView"
      :account="activeAccountDetail"
      v-model:active-tab="activeDetailTab"
      v-model:search-query="detailSearchQuery"
      v-model:view-mode="viewModeHistory"
      :selected-history-transaction-id="selectedHistoryTransactionId"
      @edit="editAccountLimits(activeAccountDetail)"
      @sync="syncAccountAction(activeAccountDetail.id)"
      @delete-transaction="deleteTransactionAction"
      @close="closeDetailView"
      @toggle-selection="handleHistorySelect"
    />

    <FinancialAccountTransferForm
      v-if="showTransferModal"
      :accounts="accounts"
      v-model="transferForm"
      @save="submitTransferAction"
      @cancel="showTransferModal = false"
    />

    <!-- Installment Modal -->
    <div v-if="showInstallmentModal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4" @click.self="showInstallmentModal = false">
      <div class="bg-slate-800 border-2 border-rose-600 shadow-2xl max-w-sm w-full relative overflow-hidden">
        <div class="p-6 border-b border-rose-600/20 bg-slate-900/40 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-100 uppercase tracking-widest">BORCU TAKSİTLENDİR</h3>
          <button @click="showInstallmentModal = false" class="text-slate-500 hover:text-white transition-colors">
            <X class="w-6 h-6 border border-transparent hover:border-white/20 p-1" />
          </button>
        </div>
        <div class="p-6 space-y-5 text-left">
          <div class="p-4 bg-slate-950 border border-rose-500/20 shadow-inner">
             <h4 class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mb-1">TAKSİTLENDİRİLECEK TUTAR</h4>
             <p class="text-2xl font-black text-rose-500">₺{{ parseFloat(installmentForm.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</p>
          </div>
          <div>
            <label class="block text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-2 italic">TAKSİT SAYISI</label>
            <div class="grid grid-cols-4 gap-2">
               <button v-for="n in [1,2,3,4,6,9,12]" :key="n" @click="installmentForm.installmentCount = n" 
                       :class="installmentForm.installmentCount === n ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'" 
                       class="py-2.5 text-xs font-black border transition-all">
                  {{ n }}
               </button>
            </div>
          </div>
          <div>
            <label class="block text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-2 italic">BAŞLANGIÇ TARİHİ</label>
            <input v-model="installmentForm.startDate" type="date" class="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 text-sm font-bold focus:border-rose-500 outline-none transition-all" />
          </div>
          <div class="pt-4 flex gap-2">
            <button @click="showInstallmentModal = false" class="flex-1 px-4 py-3 bg-slate-700 text-white text-[0.65rem] font-black uppercase tracking-widest hover:bg-slate-600 transition-colors">VAZGEÇ</button>
            <button @click="createPaymentPlanAction" class="flex-1 px-4 py-3 bg-rose-600 text-white text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-rose-900/40 hover:bg-rose-500 transition-colors">PLANI OLUŞTUR</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Detail Modal (From PaymentPlans.vue) -->
    <div v-if="showPlanDetailModal" class="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden px-2 py-4">
        <div class="flex items-center justify-between mb-2 px-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-rose-600 flex items-center justify-center">
                    <Wallet class="w-5 h-5 text-white" />
                </div>
                <div class="flex flex-col text-left">
                    <h2 class="text-sm font-black text-white uppercase tracking-widest">{{ selectedPlan?.account?.accountName }}</h2>
                    <p class="text-[0.6rem] text-slate-500 font-mono tracking-widest uppercase">{{ selectedPlan?.planName }}</p>
                </div>
            </div>
            <button @click="showPlanDetailModal = false" class="p-2 text-slate-500 hover:text-white"><X class="w-8 h-8" /></button>
        </div>

        <BaseSearchFilter
          v-model:searchQuery="searchQueryInstallments"
          v-model:viewMode="viewModeInstallments"
          placeholder="Taksitlerde ara (#, tarih, durum...)"
          accent="rose"
        />

        <div class="flex-1 relative overflow-hidden mt-2">
           <div class="absolute inset-0 overflow-y-auto custom-scrollbar px-2 pb-4">
              <div v-if="filteredSchedules.length > 0" class="flex-1 min-h-0">
                <BaseTable
                  :columns="[
                    { key: 'installment', label: 'T.NO' },
                    { key: 'dueDate', label: 'VADE TARİHİ' },
                    { key: 'amount', label: 'TUTAR', align: 'right' },
                    { key: 'paidAmount', label: 'ÖDENEN', align: 'right' },
                    { key: 'status', label: 'DURUM', align: 'center' }
                  ]"
                  :items="filteredSchedules"
                  :selectedId="selectedInstallmentId"
                  accent="rose"
                  @rowClick="selectedInstallmentId = selectedInstallmentId === $event.id ? null : $event.id"
                >
                  <template #cell-installment="{ item }">
                    <span class="text-xs font-mono font-black text-slate-500">#{{ item.installmentNumber }}</span>
                  </template>
                  <template #cell-dueDate="{ item }">
                    <span class="text-xs font-bold text-slate-200">{{ new Date(item.dueDate).toLocaleDateString('tr-TR') }}</span>
                  </template>
                  <template #cell-amount="{ item }">
                    <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-md w-[130px] ml-auto flex items-center justify-center">
                      <span class="text-xs font-black font-mono text-slate-100 italic">₺{{ parseFloat(item.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                  </template>
                  <template #cell-paidAmount="{ item }">
                    <div class="px-3 py-1 bg-slate-950 border border-slate-800 shadow-md w-[130px] ml-auto flex items-center justify-center">
                      <span class="text-xs font-black font-mono text-emerald-400 italic">₺{{ parseFloat(item.paidAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                  </template>
                  <template #cell-status="{ item }">
                    <span
                      class="px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider border shadow-sm"
                      :class="{
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5': item.status === 'PAID',
                        'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5': item.status === 'PENDING' && new Date(item.dueDate) >= new Date(),
                        'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5': item.status === 'OVERDUE' || (item.status === 'PENDING' && new Date(item.dueDate) < new Date()),
                        'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/5': item.status === 'PARTIAL',
                        'bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-slate-500/5': item.status === 'CANCELLED'
                      }"
                    >
                      {{ item.status === 'PAID' ? 'ÖDENDİ' : item.status === 'CANCELLED' ? 'İPTAL' : item.status === 'PENDING' && new Date(item.dueDate) < new Date() ? 'GECİKTİ' : item.status === 'PARTIAL' ? 'KISMİ' : 'BEKLİYOR' }}
                    </span>
                  </template>
                </BaseTable>
              </div>
           </div>
        </div>

        <div class="flex-none bg-slate-900 border-t-2 border-slate-800 py-2 px-6">
            <div class="flex items-center justify-end gap-8">
                <div class="flex flex-col items-center">
                    <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">TOPLAM TUTAR</span>
                    <span class="text-xs font-black text-white">₺{{ parseFloat(selectedPlan?.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div class="flex flex-col items-center border-l border-slate-700 pl-8">
                    <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">TAHSİLAT</span>
                    <span class="text-xs font-black text-emerald-400">₺{{ parseFloat(selectedPlan?.paidAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div class="flex flex-col items-center border-l border-slate-700 pl-8">
                    <span class="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">KALAN</span>
                    <span class="text-xs font-black text-rose-500">₺{{ parseFloat(selectedPlan?.remainingAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                </div>
            </div>
        </div>

        <BaseActionFooter>
            <div class="flex items-center gap-2">
                <BaseButton variant="dark" size="icon" square @click="showPlanDetailModal = false" title="KAPAT">
                    <template #icon><X class="w-5 h-5" /></template>
                </BaseButton>
                <div class="w-px h-6 bg-slate-800 mx-1"></div>
                <BaseButton 
                    v-if="selectedInstallmentId && filteredSchedules.find(s => s.id === selectedInstallmentId)?.status !== 'PAID'"
                    variant="success" size="icon" square @click="payInstallmentAction(filteredSchedules.find(s => s.id === selectedInstallmentId))" title="ÖDEME AL">
                    <template #icon><Banknote class="w-5 h-5" /></template>
                </BaseButton>
                <BaseButton 
                    v-if="selectedPlan?.status !== 'COMPLETED' && selectedPlan?.status !== 'CANCELLED'"
                    variant="success" size="icon" square @click="payAllAction(selectedPlan)" title="TÜMÜNÜ ÖDE">
                    <template #icon><Check class="w-5 h-5" /></template>
                </BaseButton>
                <div class="w-px h-6 bg-slate-800 mx-1"></div>
                <BaseButton 
                    v-if="selectedInstallmentId"
                    variant="danger" size="icon" square @click="cancelInstallmentAction(filteredSchedules.find(s => s.id === selectedInstallmentId))" title="İPTAL ET">
                    <template #icon><Trash2 class="w-5 h-5" /></template>
                </BaseButton>
            </div>
        </BaseActionFooter>
    </div>

    <!-- Standardized Action Footer -->
    <BaseActionFooter v-if="!showDetailView && !showTransactionModal && !showInstallmentModal && !showPlanDetailModal">
      <div class="flex items-center gap-[10px]">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="KAPAT">
            <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>

          <!-- Accounts Pagination -->
          <div v-if="activeMainTab === 'accounts' && totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
            <BaseButton 
              variant="dark" size="icon" square 
              :disabled="currentPage === 1"
              @click="fetchAccounts({ page: currentPage - 1, search: searchQuery, entityType: filterType })"
              title="ÖNCEKİ SAYFA"
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
              @click="fetchAccounts({ page: currentPage + 1, search: searchQuery, entityType: filterType })"
              title="SONRAKİ SAYFA"
            >
              <template #icon><ChevronRight class="w-4 h-4" /></template>
            </BaseButton>
          </div>

          <!-- Plans Pagination -->
          <div v-if="activeMainTab === 'paymentPlans' && planPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
            <BaseButton 
              variant="dark" size="icon" square 
              :disabled="currentPlanPage === 1"
              @click="fetchPlans({ page: currentPlanPage - 1, search: searchQueryPlans, status: filterStatusPlans })"
              title="ÖNCEKİ SAYFA"
            >
              <template #icon><ChevronLeft class="w-4 h-4" /></template>
            </BaseButton>
            
            <div class="px-3 min-w-[80px] flex flex-col items-center">
              <span class="text-[0.45rem] text-slate-500 font-black uppercase tracking-widest">SAYFA</span>
              <span class="text-[0.7rem] font-black text-white font-mono">{{ currentPlanPage }} / {{ planPages }}</span>
            </div>

            <BaseButton 
              variant="dark" size="icon" square 
              :disabled="currentPlanPage === planPages"
              @click="fetchPlans({ page: currentPlanPage + 1, search: searchQueryPlans, status: filterStatusPlans })"
              title="SONRAKİ SAYFA"
            >
              <template #icon><ChevronRight class="w-4 h-4" /></template>
            </BaseButton>
          </div>

        <template v-if="activeMainTab === 'accounts'">
            <!-- Cari Hesap Aksiyonları -->
            <BaseButton variant="primary" size="icon" square @click="openTransferModal" title="HESAPLAR ARASI TRANSFER (VİRMAN)">
              <template #icon><ArrowRightLeft class="w-5 h-5" /></template>
            </BaseButton>

            <div class="w-px h-6 bg-slate-800 mx-1"></div>

            <BaseButton v-if="selectedAccountIds.length === 0" variant="danger" size="icon" square @click="closeBranchCashAction" title="KASAYI KAPAT"> 
              <template #icon><Power class="w-5 h-5" /></template> 
            </BaseButton>
            
            <Transition name="fade-slide">
              <div v-if="selectedAccountIds.length === 1" class="flex items-center gap-[10px]">
                 <BaseButton variant="success" size="icon" square @click="openTransactionModal(accounts.find(a => a.id === selectedAccountIds[0]))" title="İŞLEM EKLE">
                   <template #icon><Plus class="w-5 h-5" /></template>
                 </BaseButton>
                 <BaseButton v-if="accounts.find(a => a.id === selectedAccountIds[0])?.entityType === 'MEMBER' && parseFloat(accounts.find(a => a.id === selectedAccountIds[0])?.balance) < 0" variant="warning" size="icon" square @click="openInstallmentModal(accounts.find(a => a.id === selectedAccountIds[0]))" title="TAKSİTLENDİR">
                    <template #icon><CalendarDays class="w-5 h-5" /></template>
                 </BaseButton>
                 <BaseButton variant="violet" size="icon" square @click="viewAccount(accounts.find(a => a.id === selectedAccountIds[0]))" title="DETAY GÖR">
                   <template #icon><Eye class="w-5 h-5" /></template>
                 </BaseButton>
                 <BaseButton variant="primary" size="icon" square @click="syncAccountAction(selectedAccountIds[0])" title="BAKİYE SENKRONİZE ET (DÜZELT)">
                    <template #icon><RefreshCcw class="w-5 h-5" /></template>
                 </BaseButton>
                 <BaseButton variant="danger" size="icon" square @click="selectedAccountIds = []" title="VAZGEÇ">
                   <template #icon><XCircle class="w-5 h-5" /></template>
                 </BaseButton>
              </div>
            </Transition>
        </template>

        <template v-else-if="activeMainTab === 'paymentPlans'">
            <!-- Taksit Planı Aksiyonları -->
            <Transition name="fade-slide text-left">
                <div v-if="selectedPlanIds.length === 1" class="flex items-center gap-[10px]">
                    <BaseButton variant="violet" size="icon" square @click="viewPlanDetails(plans.find(p => p.id === selectedPlanIds[0]))" title="DETAY GÖR">
                        <template #icon><Eye class="w-5 h-5" /></template>
                    </BaseButton>
                    <BaseButton v-if="plans.find(p => p.id === selectedPlanIds[0])?.status !== 'COMPLETED' && plans.find(p => p.id === selectedPlanIds[0])?.status !== 'CANCELLED'" variant="success" size="icon" square @click="payAllAction(plans.find(p => p.id === selectedPlanIds[0]))" title="TÜMÜNÜ ÖDE">
                        <template #icon><Check class="w-5 h-5" /></template>
                    </BaseButton>
                    <BaseButton variant="danger" size="icon" square @click="handlePlanActionAction(plans.find(p => p.id === selectedPlanIds[0]))" :title="plans.find(p => p.id === selectedPlanIds[0])?.status === 'CANCELLED' ? 'KALICI OLARAK SİL' : 'İPTAL ET'">
                        <template #icon><Trash2 class="w-5 h-5" /></template>
                    </BaseButton>
                    <BaseButton variant="danger" size="icon" square @click="selectedPlanIds = []" title="VAZGEÇ">
                        <template #icon><XCircle class="w-5 h-5" /></template>
                    </BaseButton>
                </div>
            </Transition>
        </template>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Plus, Eye, XCircle, Trash2, Power, RefreshCcw, CalendarDays, Wallet, X, ArrowRightLeft, Check, Banknote,
  ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

// Services & Composables
import { financialService } from '../../services/finance/financialService'
import { useFinancials } from '../../composables/useFinancials'
import { useAlerts } from '../../utils/alerts'

// Base Components
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseCard from '../../components/base/BaseCard.vue'

// Extracted Components
import FinancialAccountTransactionForm from '../../components/finances/FinancialAccountTransactionForm.vue'
import FinancialAccountEditForm from '../../components/finances/FinancialAccountEditForm.vue'
import FinancialAccountDetailView from '../../components/finances/FinancialAccountDetailView.vue'
import FinancialAccountTransferForm from '../../components/finances/FinancialAccountTransferForm.vue'

const router = useRouter()
const route = useRoute()
const { toast, confirm, error: showAlertError } = useAlerts()
const pageSubtitle = inject('pageSubtitle', ref(''))

const {
  accounts,
  totalAccounts,
  totalPages,
  currentPage,
  stats,
  plans,
  totalPlans,
  planPages,
  currentPlanPage,
  loading,
  fetchAccounts,
  fetchStats,
  fetchPlans,
  tableTotals,
  planTotals
} = useFinancials()

// Local State
const activeMainTab = ref('accounts')
const selectedAccountIds = ref([])
const selectedPlanIds = ref([])
const searchQuery = ref('')
const viewMode = ref('list')
const filterType = ref('')

// Payment Plans Local State
const searchQueryPlans = ref('')
const filterStatusPlans = ref('')
const viewModePlans = ref('list')
const showPlanDetailModal = ref(false)
const searchQueryInstallments = ref('')
const viewModeInstallments = ref('list')
const selectedInstallmentId = ref(null)
const selectedPlan = ref(null)

// Modals State
const showTransactionModal = ref(false)
const showDetailView = ref(false)
const showEditModal = ref(false)
const showInstallmentModal = ref(false)
const showTransferModal = ref(false)
const activeAccountDetail = ref(null)
const selectedAccount = ref(null)
const activeDetailTab = ref('history')
const detailSearchQuery = ref('')
const viewModeHistory = ref('list')
const selectedHistoryTransactionId = ref(null)

const transactionForm = ref({
  transactionType: 'CREDIT', amount: '', category: 'DEBT_COLLECTION',
  paymentMethod: 'CASH', description: '', productName: '',
  quantity: 1, unitPrice: '', usePrepaid: false
})

const editForm = ref({
  id: '', accountName: '', debtLimit: 0, isActive: true,
  currentPrepaidBalance: 0, prepaidLoadAmount: null,
  prepaidPaymentMethod: 'CASH', prepaidDescription: ''
})

const installmentForm = ref({
  totalAmount: 0, installmentCount: 3, installmentFrequency: 'MONTHLY',
  startDate: new Date().toISOString().split('T')[0], planName: ''
})

const transferForm = ref({
  fromAccountId: '', toAccountId: '', amount: '',
  description: '', paymentMethod: 'CASH'
})

// Computed
const filteredSchedules = computed(() => {
  if (!selectedPlan.value?.schedules) return []
  if (!searchQueryInstallments.value) return selectedPlan.value.schedules
  const query = searchQueryInstallments.value.toLowerCase()
  return selectedPlan.value.schedules.filter(s => 
    s.installmentNumber.toString().includes(query) ||
    new Date(s.dueDate).toLocaleDateString('tr-TR').includes(query) ||
    s.amount.toString().includes(query) ||
    s.status.toLowerCase().includes(query)
  )
})

// Logic
const refreshData = async () => {
  console.log('🔵 refreshData CALLED')
  await fetchAccounts({ page: currentPage.value, search: searchQuery.value, entityType: filterType.value })
  await fetchStats()
  await fetchPlans({ search: searchQueryPlans.value, status: filterStatusPlans.value })
  
  if (showDetailView.value && activeAccountDetail.value) {
    const res = await financialService.getAccountDetail(activeAccountDetail.value.id)
    activeAccountDetail.value = res.account
    selectedAccount.value = res.account
  }
  
  if (showPlanDetailModal.value && selectedPlan.value) {
    const allPlans = await financialService.getPlans()
    selectedPlan.value = allPlans.find(p => p.id === selectedPlan.value.id)
  }
}

// Action methods
const handleHistorySelect = (id) => {
  selectedHistoryTransactionId.value = selectedHistoryTransactionId.value === id ? null : id
}

const viewPlanDetails = (plan) => {
  selectedPlan.value = plan
  showPlanDetailModal.value = true
}

const toggleSelection = (id) => {
  selectedAccountIds.value = selectedAccountIds.value.includes(id) ? [] : [id]
}

const togglePlanSelection = (id) => {
  selectedPlanIds.value = selectedPlanIds.value.includes(id) ? [] : [id]
}

const openTransactionModal = (account) => {
  selectedAccount.value = account
  transactionForm.value = {
    transactionType: 'CREDIT', amount: '', category: 'DEBT_COLLECTION',
    paymentMethod: 'CASH', description: '', productName: '',
    quantity: 1, unitPrice: '', usePrepaid: false
  }
  showTransactionModal.value = true
}

const addTransaction = async (formData) => {
  console.log('🚀 [FRONTEND_ADD_TRANSACTION] Submitting payload:', JSON.stringify(formData, null, 2))
  try {
    const res = await financialService.createTransaction({ ...formData, financialAccountId: selectedAccount.value.id })
    console.log('✅ [FRONTEND_ADD_TRANSACTION_SUCCESS]:', res)
    let msg = 'İşlem başarıyla eklendi.'
    if (res.prepaidUsed && Number(res.prepaidUsed) > 0) msg += ` (Ön ödemeden ₺${Number(res.prepaidUsed).toFixed(2)} düşüldü)`
    
    toast(msg)
    showTransactionModal.value = false
    await refreshData()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'İşlem eklenemedi.'
    console.error('❌ [FRONTEND_ADD_TRANSACTION_ERROR]:', err.response?.data || err)
    showAlertError('HATA', errorMsg)
  }
}

const viewAccount = async (account) => {
  try {
    const res = await financialService.getAccountDetail(account.id)
    activeAccountDetail.value = res.account
    selectedAccount.value = res.account
    pageSubtitle.value = 'HESAP DETAYI'
    showDetailView.value = true
  } catch (err) {
    showAlertError('HATA', 'Hesap detayları getirilemedi.')
  }
}

const closeDetailView = () => {
  showDetailView.value = false
  activeAccountDetail.value = null
  selectedHistoryTransactionId.value = null
  pageSubtitle.value = ''
}

const editAccountLimits = (account) => {
  editForm.value = {
    id: account.id, accountName: account.accountName, debtLimit: account.debtLimit || 0,
    isActive: account.isActive, currentPrepaidBalance: account.prepaidBalance || 0,
    prepaidLoadAmount: null, prepaidPaymentMethod: 'CASH', prepaidDescription: ''
  }
  showEditModal.value = true
}

const saveAccountLimits = async (formData) => {
  try {
    // Assuming financialService.updateAccount exists or use member/user service if linked
    // For now use axios directly or add to financialService
    await financialService.updateAccount(formData.id, { debtLimit: formData.debtLimit, isActive: formData.isActive })
    
    if (formData.prepaidLoadAmount > 0) {
      await financialService.createTransaction({
        financialAccountId: formData.id,
        transactionType: 'CREDIT', category: 'PREPAID_LOAD', amount: formData.prepaidLoadAmount,
        paymentMethod: formData.prepaidPaymentMethod, description: formData.prepaidDescription
      })
    }
    showEditModal.value = false
    toast('Güncellendi')
    await refreshData()
  } catch (err) {
    showAlertError('HATA', 'Güncelleme başarısız.')
  }
}

const syncAccountAction = async (id) => {
  try {
    await financialService.syncAccount(id)
    await refreshData()
    toast('Senkronize edildi')
  } catch (err) {
    showAlertError('HATA', 'Senkronizasyon başarısız.')
  }
}

const deleteTransactionAction = async () => {
  if (!selectedHistoryTransactionId.value) return
  const isConfirmed = await confirm('SİLİNSİN Mİ?', 'Bakiye otomatik düzeltilecektir.')
  if (isConfirmed) {
    try {
      await financialService.deleteTransaction(selectedHistoryTransactionId.value)
      selectedHistoryTransactionId.value = null
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'Silme başarısız.')
    }
  }
}

const closeBranchCashAction = async () => {
  const isConfirmed = await confirm('GÜNLÜK KASA KAPANIŞI', 'Tüm nakit bakiyeler aktarılacaktır.')
  if (isConfirmed) {
    try {
      const res = await financialService.closeBranchCash()
      toast(`₺${res.amount?.toLocaleString('tr-TR')} aktarıldı.`)
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'Kapatma başarısız.')
    }
  }
}

const submitTransferAction = async (formData) => {
  try {
    await financialService.transfer(formData)
    toast('Virman başarılı')
    showTransferModal.value = false
    selectedAccountIds.value = []
    await refreshData()
  } catch (err) {
    showAlertError('HATA', err.message || 'Transfer başarısız.')
  }
}

const openTransferModal = () => {
  transferForm.value = { fromAccountId: '', toAccountId: '', amount: '', description: '', paymentMethod: 'CASH' }
  showTransferModal.value = true
}

const openInstallmentModal = (account) => {
  selectedAccount.value = account
  installmentForm.value = {
    totalAmount: Math.abs(parseFloat(account.balance)),
    installmentCount: 3,
    installmentFrequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    planName: `${account.accountName} - Borç Taksitlendirme`
  }
  showInstallmentModal.value = true
}

const cancelInstallmentAction = async (installment) => {
  const isConfirmed = await confirm('TAKSİT İPTALİ', 'Bu taksit iptal edilecek. Emin misiniz?')
  if (isConfirmed) {
    try {
      await financialService.cancelInstallment(installment.id)
      toast('Taksit iptal edildi')
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'İptal başarısız.')
    }
  }
}

const createPaymentPlanAction = async () => {
  try {
    await financialService.createPlan({ financialAccountId: selectedAccount.value.id, ...installmentForm.value })
    showInstallmentModal.value = false
    await refreshData()
    activeMainTab.value = 'paymentPlans'
    toast('Plan oluşturuldu')
  } catch (err) {
    showAlertError('HATA', 'Plan oluşturulamadı.')
  }
}

const payAllAction = async (plan) => {
  const isConfirmed = await confirm('TÜMÜNÜ ÖDE?', 'Tüm borç tahsil edilecektir.')
  if (isConfirmed) {
    try {
      await financialService.payAll(plan.id)
      toast('Tüm borç tahsil edildi')
      showPlanDetailModal.value = false
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'Tahsilat başarısız.')
    }
  }
}

const cancelPlanAction = async (plan) => {
  const isConfirmed = await confirm('İPTAL EDİLSİN Mİ?', 'Tüm taksitler iptal edilecektir.')
  if (isConfirmed) {
    try {
      await financialService.cancelPlan(plan.id)
      toast('İptal edildi')
      selectedPlanIds.value = []
      showPlanDetailModal.value = false
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'İptal başarısız.')
    }
  }
}

const handlePlanActionAction = (plan) => {
  if (plan.status === 'CANCELLED') deletePlanAction(plan)
  else cancelPlanAction(plan)
}

const deletePlanAction = async (plan) => {
  const isConfirmed = await confirm('KALICI OLARAK SİL?', 'Bu işlem geri alınamaz.')
  if (isConfirmed) {
    try {
      await financialService.deletePlan(plan.id)
      selectedPlanIds.value = []
      showPlanDetailModal.value = false
      await refreshData()
    } catch (err) {
      showAlertError('HATA', 'Silme başarısız.')
    }
  }
}

const payInstallmentAction = async (schedule) => {
  try {
    await financialService.payInstallment(schedule.id, { amount: parseFloat(schedule.amount) - parseFloat(schedule.paidAmount) })
    toast('Taksit ödendi')
    await refreshData()
  } catch (err) {
    showAlertError('HATA', 'Ödeme başarısız.')
  }
}

const getEntityLabel = (type) => {
  const labels = {
    'MEMBER': 'ÜYE', 'USER': 'PERSONEL', 'INSTRUCTOR': 'EĞİTMEN',
    'BRANCH': 'ŞUBE', 'COMPANY': 'ŞİRKET', 'GUEST': 'MİSAFİR'
  }
  return labels[type] || type
}

onMounted(() => {
  console.log('🔵 FinancialAccounts MOUNTED', { tab: route.query.tab })
  if (route.query.tab) activeMainTab.value = route.query.tab
  refreshData()
})

// Watchers for Backend Pagination & Search
let debounceTimer;
watch([searchQuery, filterType], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchAccounts({ page: 1, search: searchQuery.value, entityType: filterType.value })
  }, 300);
});

let debounceTimerPlans;
watch([searchQueryPlans, filterStatusPlans], () => {
  clearTimeout(debounceTimerPlans);
  debounceTimerPlans = setTimeout(() => {
    fetchPlans({ page: 1, search: searchQueryPlans.value, status: filterStatusPlans.value })
  }, 300);
});

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeMainTab.value = newTab
})

watch(activeMainTab, (val) => {
  if (val === 'paymentPlans' && plans.value.length === 0) fetchPlans()
})

watch(showPlanDetailModal, (val) => {
  if (val) {
    pageSubtitle.value = 'PLAN DETAYI'
  } else if (!showDetailView.value) {
    pageSubtitle.value = ''
  }
})

onUnmounted(() => {
  pageSubtitle.value = ''
})
</script>
