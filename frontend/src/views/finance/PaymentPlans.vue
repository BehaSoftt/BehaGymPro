<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    
    <BaseActionFooter v-if="selectedPlanIds.length > 0 && !showDetailsModal">
      <template #left>
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
      </template>

      <!-- Center Pillar -->
      <div class="flex items-center gap-[10px]">
        <template v-if="selectedPlanIds.length === 1">
           <BaseButton 
             variant="violet" 
             size="icon" square 
             @click="viewPlanDetails(plans.find(p => p.id === selectedPlanIds[0]))" 
             title="DETAY GÖR"
           >
             <template #icon><Eye class="w-5 h-5" /></template>
           </BaseButton>

           <BaseButton 
             v-if="plans.find(p => p.id === selectedPlanIds[0])?.status !== 'COMPLETED' && plans.find(p => p.id === selectedPlanIds[0])?.status !== 'CANCELLED'"
             variant="success" 
             size="icon" square 
             @click="payAll(plans.find(p => p.id === selectedPlanIds[0]))" 
             title="TÜMÜNÜ ÖDE"
           >
             <template #icon><Check class="w-5 h-5" /></template>
           </BaseButton>

           <BaseButton 
             variant="danger" 
             size="icon" square 
             @click="handlePlanAction(plans.find(p => p.id === selectedPlanIds[0]))" 
             :title="plans.find(p => p.id === selectedPlanIds[0])?.status === 'CANCELLED' ? 'KALICI OLARAK SİL' : 'İPTAL ET'"
           >
             <template #icon><Trash2 class="w-5 h-5" /></template>
           </BaseButton>
        </template>

        <div class="w-px h-6 bg-slate-800 mx-1 transition-all"></div>

        <BaseButton variant="ghost" size="icon" square @click="selectedPlanIds = []" title="VAZGEÇ">
          <template #icon><XCircle class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>

    <BaseActionFooter v-else-if="!showDetailsModal">
      <template #left>
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        
        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === 1"
            @click="fetchPlans({ page: currentPage - 1 })"
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
            @click="fetchPlans({ page: currentPage + 1 })"
          >
            <template #icon><ChevronRight class="w-4 h-4" /></template>
          </BaseButton>
        </div>
      </template>
    </BaseActionFooter>
    

    <!-- Standardized Filters using BaseSearchFilter -->
    <BaseSearchFilter
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="Üye veya plan ara..."
      accent="rose"
    >
      <template #extra-actions>
        <select
          v-model="filterStatus"
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


    <!-- Plans Display Area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Scrollable Container -->
      <div class="absolute inset-0 overflow-y-auto px-2 pb-[10px] custom-scrollbar">
        
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          <div v-for="plan in plans" :key="plan.id" 
               @click="toggleSelection(plan.id)"
               :class="selectedPlanIds.includes(plan.id) ? 'border-emerald-500 bg-slate-700/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 shadow-xl'"
               class="p-6 transition-all group relative overflow-hidden flex flex-col gap-4 cursor-pointer border">
            
            <!-- Selection indicator for grid -->
            <div v-if="selectedPlanIds.includes(plan.id)" class="absolute top-2 left-2 z-20 bg-emerald-500 text-white p-1 shadow-lg">
              <Check class="w-4 h-4" />
            </div>

            <div class="flex justify-between items-start">
              <div class="p-2.5 bg-slate-950 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                <Wallet :class="selectedPlanIds.includes(plan.id) ? 'text-white' : 'text-indigo-400'" class="w-5 h-5 transition-colors" />
              </div>
              <div class="flex flex-col items-end gap-1">
                 <span
                   class="px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider border shadow-sm"
                   :class="{
                     'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5': plan.status === 'COMPLETED',
                     'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5': plan.status === 'ACTIVE',
                     'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5': plan.status === 'OVERDUE',
                     'bg-slate-500/10 text-slate-500 border-slate-500/20': plan.status === 'CANCELLED'
                   }"
                 >
                   {{ plan.status === 'ACTIVE' ? 'AKTİF' : plan.status === 'COMPLETED' ? 'ÖDENDİ' : plan.status === 'OVERDUE' ? 'GECİKTİ' : 'İPTAL' }}
                 </span>
              </div>
            </div>

            <div class="uppercase tracking-tight mt-2">
              <h3 class="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">{{ plan.account?.accountName }}</h3>
              <p class="text-[0.6rem] text-slate-500 font-mono tracking-widest uppercase mt-0.5">{{ plan.account?.accountCode }}</p>
            </div>
            
            <div class="space-y-3 py-4 border-t border-slate-700/50 mt-auto">
               <div class="flex flex-col gap-1">
                  <span class="text-indigo-400 font-black uppercase tracking-wider text-[0.65rem]">{{ plan.planName }}</span>
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
        </div>

        <!-- List View using BaseTable -->
        <div v-if="viewMode === 'list'" class="h-full flex flex-col pt-0 pb-4">
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
              @rowClick="toggleSelection($event.id)"
            >
              <template #cell-accountInfo="{ item }">
                <div class="flex items-center gap-3">
                  <div :class="selectedPlanIds.includes(item.id) ? 'bg-emerald-600 border-emerald-500 shadow-md' : 'bg-slate-950 border-slate-800'" class="w-10 h-10 border flex items-center justify-center transition-all relative overflow-hidden">
                    <Wallet :class="selectedPlanIds.includes(item.id) ? 'text-white' : 'text-indigo-400'" class="w-4 h-4" />
                  </div>
                  <div class="flex flex-col uppercase tracking-tight">
                    <span class="text-slate-50 group-hover:text-emerald-400 transition-colors font-bold">{{ item.account?.accountName }}</span>
                    <span class="text-[0.6rem] text-slate-500 font-mono tracking-widest">{{ item.account?.accountCode }}</span>
                  </div>
                </div>
              </template>
  
              <template #cell-planDetails="{ item }">
                <span class="text-indigo-400 font-black uppercase tracking-wider text-[0.7rem] leading-none">
                  {{ item.planName.replace(new RegExp('^' + (item.account?.accountName || '') + '\\s*-\\s*', 'i'), '') }}
                </span>
              </template>
  
              <template #cell-installmentInfo="{ item }">
                <div class="flex flex-col items-center gap-1.5 py-1">
                  <div class="flex items-center gap-2 text-slate-300 text-[0.65rem] font-bold uppercase tracking-widest leading-none">
                    <Clock class="w-3.5 h-3.5 text-indigo-400" />
                    {{ item.installmentCount }} TAKSİT ({{ item.installmentFrequency }})
                  </div>
                  <div class="flex items-center gap-2 w-32 px-2 py-1 bg-slate-950/50 border border-slate-800 shadow-inner">
                    <div class="h-1 flex-1 bg-slate-950 border border-slate-700 overflow-hidden">
                      <div 
                        class="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                        :style="{ width: `${(item.schedules?.filter(s => s.status === 'PAID').length || 0) / item.installmentCount * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-[0.6rem] font-black text-emerald-500 font-mono whitespace-nowrap">
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
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5': item.status === 'COMPLETED',
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

          <!-- Enhanced Summary Dashboard Bar -->
          <div class="flex-none bg-slate-900/80 backdrop-blur-md border-t-2 border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] py-2 px-6 z-20 mt-1">
             <div class="flex items-center justify-between">
                 <div class="flex items-center gap-6">
                    <div class="flex flex-col uppercase tracking-tight border-l-2 border-rose-500 pl-4">
                        <span class="text-[0.7rem] font-black text-slate-100 italic tracking-[0.2em]">ÖDEME PLANI ÖZETİ</span>
                        <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">{{ plans.length }} AKTİF TAKSİT PLANI</span>
                    </div>
                 </div>

                 <div class="flex items-center gap-8">
                    <!-- TOTAL AMOUNT -->
                    <div class="flex flex-col items-center gap-0.5">
                        <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">TOPLAM TUTAR</span>
                        <div class="px-5 py-1.5 bg-slate-950 border border-slate-800 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                           <p class="text-[1rem] font-black text-slate-300 tracking-tighter relative z-10">
                             ₺{{ planTotals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                           </p>
                        </div>
                    </div>

                    <!-- PAID SUMMARY -->
                    <div class="flex flex-col items-center gap-0.5">
                        <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">TOPLAM TAHSİLAT</span>
                        <div class="px-5 py-1.5 bg-slate-950 border border-emerald-500/20 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                           <div class="absolute inset-0 bg-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <p class="text-[1rem] font-black text-emerald-400 tracking-tighter relative z-10">
                             ₺{{ planTotals.totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                           </p>
                        </div>
                    </div>

                    <!-- REMAINING SUMMARY -->
                    <div class="flex flex-col items-center gap-0.5">
                        <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">KALAN BAKİYE</span>
                        <div class="px-5 py-1.5 bg-slate-950 border border-amber-500/20 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                           <div class="absolute inset-0 bg-amber-500/3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <p class="text-[1rem] font-black text-amber-500 tracking-tighter relative z-10">
                             ₺{{ planTotals.totalRemaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                           </p>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Details Modal (Standardized Overlay) -->
     <div v-if="showDetailsModal" class="absolute inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden px-2 py-4">
        <!-- Search Filter -->
        <BaseSearchFilter
          v-model:searchQuery="searchQueryInstallments"
          v-model:viewMode="viewModeInstallments"
          placeholder="Taksitlerde ara (#, tarih, durum...)"
          accent="rose"
        />

        <div class="flex-1 relative overflow-hidden mt-2">
           <div class="absolute inset-0 overflow-y-auto custom-scrollbar px-2 pb-4">
              <!-- Grid Layout for Installments (BaseCard Style) -->
              <div v-if="filteredSchedules.length > 0 && viewModeInstallments === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 h-fit pb-10">
                 <div v-for="s in filteredSchedules" :key="s.id" 
                      @click="selectedInstallmentId = selectedInstallmentId === s.id ? null : s.id"
                      :class="selectedInstallmentId === s.id ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'bg-slate-900 border-slate-800 hover:border-slate-700'"
                      class="border p-6 relative group cursor-pointer transition-all flex flex-col gap-4 overflow-hidden">
                    
                    <!-- Selection Indicator -->
                    <div v-if="selectedInstallmentId === s.id" class="absolute top-0 right-0 bg-emerald-500 text-white p-1.5 shadow-lg">
                       <Check class="w-4 h-4" />
                    </div>

                    <div class="flex justify-between items-start">
                       <div class="p-2.5 bg-slate-950 border border-slate-800 group-hover:border-rose-500/30 transition-colors">
                          <Banknote class="w-5 h-5 text-rose-500" />
                       </div>
                       <span
                         class="px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-widest border"
                         :class="{
                           'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': s.status === 'PAID',
                           'bg-amber-500/10 text-amber-500 border-amber-500/20': s.status === 'PENDING' && new Date(s.dueDate) >= new Date(),
                           'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5': s.status === 'OVERDUE' || (s.status === 'PENDING' && new Date(s.dueDate) < new Date()),
                           'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': s.status === 'PARTIAL'
                         }"
                       >
                         {{ s.status === 'PAID' ? 'ÖDENDİ' : s.status === 'CANCELLED' ? 'İPTAL' : s.status === 'PENDING' && new Date(s.dueDate) < new Date() ? 'GECİKTİ' : s.status === 'PARTIAL' ? 'KISMİ' : 'BEKLİYOR' }}
                       </span>
                    </div>

                    <div class="mt-2">
                       <h4 class="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-1">TAKSİT NO</h4>
                       <p class="text-xl font-black font-mono text-slate-100">#{{ s.installmentNumber }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-800">
                       <div class="space-y-1">
                          <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">VADE TARİHİ</span>
                          <p class="text-xs font-black text-slate-300">{{ new Date(s.dueDate).toLocaleDateString('tr-TR') }}</p>
                       </div>
                       <div class="space-y-1 text-right">
                          <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">TUTAR</span>
                          <p class="text-sm font-black text-emerald-400 font-mono italic">₺{{ parseFloat(s.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</p>
                       </div>
                    </div>

                    <div v-if="s.status === 'PAID'" class="mt-4 p-3 bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                       <span class="text-[0.55rem] font-bold text-slate-600 uppercase">ÖDENEN:</span>
                       <span class="text-xs font-black text-emerald-500 font-mono">₺{{ parseFloat(s.paidAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                 </div>
              </div>

              <!-- List View for Installments -->
              <div v-if="filteredSchedules.length > 0 && viewModeInstallments === 'list'" class="flex-1 min-h-0">
                <BaseTable
                  :columns="[
                    { key: 'accountInfo', label: 'ÜYE / CARİ BİLGİSİ' },
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
                  <template #cell-accountInfo="{ item }">
                    <div class="flex items-center gap-3">
                      <div class="bg-slate-950 border-slate-800 w-8 h-8 border flex items-center justify-center relative overflow-hidden">
                        <Wallet class="text-indigo-400 w-3.5 h-3.5" />
                      </div>
                      <div class="flex flex-col uppercase tracking-tight">
                        <span class="text-slate-100 font-bold text-xs">{{ selectedPlan?.account?.accountName }}</span>
                        <span class="text-[0.55rem] text-slate-500 font-mono tracking-widest">{{ selectedPlan?.account?.accountCode }}</span>
                      </div>
                    </div>
                  </template>
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
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5': item.status === 'PAID',
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

              <!-- Empty State -->
              <div v-else-if="filteredSchedules.length === 0" class="flex flex-col items-center justify-center py-40 opacity-20">
                 <FileText class="w-16 h-16 mb-4" />
                 <p class="text-[0.8rem] font-black uppercase tracking-[0.5em]">KAYIT BULUNAMADI</p>
              </div>
              </div>
        </div>

        <!-- Horizontal Summary Bar -->
        <div class="flex-none bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] py-2 px-6 z-20 mt-1">
          <div class="flex items-center justify-between">
              <div class="flex items-center gap-6">
                 <div class="flex flex-col uppercase tracking-tight border-l-2 border-indigo-500 pl-4">
                     <span class="text-[0.7rem] font-black text-slate-100 italic tracking-[0.2em]">BU PLANIN ÖZETİ</span>
                     <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">{{ selectedPlan?.schedules?.length || 0 }} KAYITLI TAKSİT</span>
                 </div>
              </div>

              <div class="flex items-center gap-8">
                 <!-- TOTAL AMOUNT -->
                 <div class="flex flex-col items-center gap-0.5">
                     <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">PLAN TUTARI</span>
                     <div class="px-5 py-1.5 bg-slate-950 border border-slate-800 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                        <p class="text-[1rem] font-black text-slate-300 tracking-tighter relative z-10">
                          ₺{{ parseFloat(selectedPlan?.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                        </p>
                     </div>
                 </div>

                 <!-- PAID SUMMARY -->
                 <div class="flex flex-col items-center gap-0.5">
                     <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">TAHSİLAT</span>
                     <div class="px-5 py-1.5 bg-slate-950 border border-emerald-500/20 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                        <p class="text-[1rem] font-black text-emerald-400 tracking-tighter relative z-10">
                          ₺{{ parseFloat(selectedPlan?.paidAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                        </p>
                     </div>
                 </div>

                 <!-- REMAINING SUMMARY -->
                 <div class="flex flex-col items-center gap-0.5">
                     <span class="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">KALAN BORÇ</span>
                     <div class="px-5 py-1.5 bg-slate-950 border border-rose-500/20 shadow-2xl min-w-[160px] flex items-center justify-center relative overflow-hidden group">
                        <p class="text-[1rem] font-black text-rose-400 tracking-tighter relative z-10">
                          ₺{{ parseFloat(selectedPlan?.remainingAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                        </p>
                     </div>
                 </div>
              </div>
          </div>
        </div>

        <BaseActionFooter>
          <div class="flex items-center gap-[10px]">
             <BaseButton variant="dark" size="icon" square @click="showDetailsModal = false" title="GERİ">
               <template #icon><X class="w-5 h-5" /></template>
             </BaseButton>

              <BaseButton 
                v-if="selectedInstallmentId && filteredSchedules.find(s => s.id === selectedInstallmentId)?.status !== 'PAID'"
                variant="success" 
                size="icon" square
                @click="openPaymentModal(filteredSchedules.find(s => s.id === selectedInstallmentId))" 
                title="ÖDEME AL"
              >
                <template #icon><Banknote class="w-5 h-5" /></template>
              </BaseButton>

              <div class="w-px h-6 bg-slate-800 mx-1"></div>

             <BaseButton 
                v-if="selectedPlan?.status !== 'COMPLETED' && selectedPlan?.status !== 'CANCELLED'"
                variant="success" 
                size="icon" square
                @click="payAll(selectedPlan)" 
                title="TÜMÜNÜ ÖDE"
             >
               <template #icon><Check class="w-5 h-5" /></template>
             </BaseButton>

              <div class="w-px h-6 bg-slate-800 mx-1"></div>

               <!-- CANCEL ACTIONS -->
               <!-- If a specific installment is selected -->
               <template v-if="selectedInstallmentId">
                 <BaseButton 
                   variant="danger" 
                   size="icon" square
                   @click="cancelInstallmentAction(filteredSchedules.find(s => s.id === selectedInstallmentId))" 
                   :title="filteredSchedules.find(s => s.id === selectedInstallmentId)?.status === 'PAID' ? 'ÖDEMEYİ İPTAL ET' : 'TAKSİDİ İPTAL ET'"
                 >
                   <template #icon><Trash2 class="w-5 h-5" /></template>
                 </BaseButton>
               </template>

               <!-- If NO installment is selected, show Plan-wide Action -->
               <template v-else>
                 <BaseButton 
                    variant="danger" 
                    size="icon" square
                    @click="handlePlanAction(selectedPlan)" 
                    :title="selectedPlan?.status === 'CANCELLED' ? 'KALICI OLARAK SİL' : 'İPTAL ET'"
                 >
                   <template #icon><Trash2 class="w-5 h-5" /></template>
                 </BaseButton>
               </template>
            </div>
         </BaseActionFooter>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  LayoutList, Clock, Wallet, CheckCircle2, 
  Eye, X, AlertCircle, Trash2, Check, XCircle, Plus, CreditCard, Banknote, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModalHeader from '../../components/base/BaseModalHeader.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import { FileText } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { financialService } from '../../services/finance/financialService'
import { useAlerts } from '../../utils/alerts'

const router = useRouter()
const { success: showAlertSuccess, error: showAlertError, confirm: showAlertConfirm, toast } = useAlerts()

const plans = ref([])
const totalPlans = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const overdueSchedules = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const viewMode = ref('list')
const searchQueryInstallments = ref('')
const viewModeInstallments = ref('list')

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


const selectedPlanIds = ref([])

const toggleSelection = (id) => {
  const idx = selectedPlanIds.value.indexOf(id)
  if (idx === -1) {
    selectedPlanIds.value = [id] // Single selection pattern for safety
  } else {
    selectedPlanIds.value = []
  }
}

const showDetailsModal = ref(false)
const selectedPlan = ref(null)
const selectedInstallmentId = ref(null)

const selectedSchedule = ref(null)

const totalPaid = computed(() => plans.value.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0))
const totalRemaining = computed(() => plans.value.reduce((sum, p) => sum + parseFloat(p.remainingAmount), 0))

const planTotals = computed(() => {
  return plans.value.reduce((acc, curr) => {
    acc.totalAmount += parseFloat(curr.totalAmount || 0)
    acc.totalPaid += parseFloat(curr.paidAmount || 0)
    acc.totalRemaining += parseFloat(curr.remainingAmount || 0)
    return acc
  }, { totalAmount: 0, totalPaid: 0, totalRemaining: 0 })
})

const fetchPlans = async (params = {}) => {
  try {
    const queryParams = {
      page: 1,
      limit: 50,
      ...params
    }
    if (searchQuery.value) queryParams.search = searchQuery.value
    if (filterStatus.value) queryParams.status = filterStatus.value

    const data = await financialService.getPlans(queryParams)
    
    if (data && data.plans) {
      plans.value = data.plans
      totalPlans.value = data.total
      totalPages.value = data.pages
      currentPage.value = data.currentPage
    } else {
      plans.value = Array.isArray(data) ? data : []
      totalPlans.value = plans.value.length
    }
  } catch (err) {
    console.error('Planlar getirilemedi:', err)
    toast('Planlar yüklenemedi', 'error')
  }
}

const fetchOverdue = async () => {
  try {
    const data = await financialService.getOverduePlans()
    overdueSchedules.value = data
  } catch (err) {
    console.error('Geciken ödemeler getirilemedi:', err)
  }
}

const viewPlanDetails = (plan) => {
  selectedPlan.value = plan
  showDetailsModal.value = true
}

const openPaymentModal = (schedule) => {
  if (!schedule) return
  const accountId = schedule.plan?.account?.id || selectedPlan.value?.account?.id
  if (!accountId) return
  
  const amount = parseFloat(schedule.amount) - parseFloat(schedule.paidAmount)
  const dateStr = new Date(schedule.dueDate).toLocaleDateString('tr-TR')
  const description = `${dateStr} tarihli ${schedule.installmentNumber}. taksit ödemesi`
  
  router.push({
    path: '/financial-accounts',
    query: {
      selectAccount: accountId,
      payAmount: amount,
      description: description,
      scheduleId: schedule.id
    }
  })
}



const payAll = async (plan) => {
  const confirmed = await showAlertConfirm(
    'TÜMÜNÜ ÖDE?',
    `Kalan ₺${parseFloat(plan.remainingAmount).toFixed(2)} tutarının tamamını tahsil edip planı kapatmak istediğinize emin misiniz?`,
    'question',
    'EVET, TAHSİL ET'
  )

  if (confirmed) {
    try {
      await financialService.payAll(plan.id)
      await showAlertSuccess('BAŞARILI', 'Tüm borç tahsil edildi.')
      showDetailsModal.value = false
      await fetchPlans()
      await fetchOverdue()
    } catch (err) {
      showAlertError('HATA', 'İşlem başarısız.')
    }
  }
}

const handlePlanAction = (plan) => {
  if (plan.status === 'CANCELLED') {
    deletePlan(plan)
  } else {
    cancelPlan(plan)
  }
}

const deletePlan = async (plan) => {
  const confirmed = await showAlertConfirm(
    'KALICI OLARAK SİL?',
    "Bu ödeme planı ve tüm bağlı taksit kayıtları veritabanından TAMAMEN silinecektir. Bu işlem geri alınamaz!",
    'error',
    'EVET, KALICI SİL'
  )

  if (confirmed) {
    try {
      await financialService.deletePlan(plan.id)
      await showAlertSuccess('SİLİNDİ', 'Plan veritabanından kalıcı olarak temizlendi.')
      showDetailsModal.value = false
      selectedPlanIds.value = []
      await fetchPlans()
      await fetchOverdue()
    } catch (err) {
      showAlertError('HATA', 'İşlem başarısız.')
    }
  }
}

const cancelPlan = async (plan) => {
  const confirmed = await showAlertConfirm(
    'PLANI İPTAL ET?',
    "Bu ödeme planını iptal etmek istediğinize emin misiniz? Bekleyen tüm taksitler de iptal edilecektir. (Geçmiş ödemeler silinmez)",
    'warning',
    'EVET, İPTAL ET'
  )

  if (confirmed) {
    try {
      await financialService.cancelPlan(plan.id)
      await showAlertSuccess('BİLGİ', 'Plan ve bekleyen taksitler iptal edildi.')
      showDetailsModal.value = false
      selectedPlanIds.value = []
      await fetchPlans()
      await fetchOverdue()
    } catch (err) {
      showAlertError('HATA', 'İşlem başarısız.')
    }
  }
}

const cancelInstallmentAction = async (schedule) => {
  if (!schedule) return

  const isPaid = schedule.status === 'PAID'
  const title = isPaid ? 'ÖDEMEYİ İPTAL ET?' : 'TAKSİDİ İPTAL ET?'
  const text = isPaid 
    ? "Bu taksit için yapılan ödeme geri alınacak (silinecek) ve taksit iptal edilecek. Emin misiniz?"
    : "Bu taksit kaydı iptal edilecek. Emin misiniz?"

  const confirmed = await showAlertConfirm(title, text, 'warning', 'EVET, İPTAL ET')

  if (confirmed) {
    try {
      await financialService.cancelInstallment(schedule.id)
      
      await showAlertSuccess('BAŞARILI', isPaid ? 'Ödeme geri alındı ve taksit iptal edildi.' : 'Taksit iptal edildi.')
      
      // Refresh plan data
      const data = await financialService.getPlans()
      plans.value = data.plans || data
      if (selectedPlan.value) {
        selectedPlan.value = plans.value.find(p => p.id === selectedPlan.value.id)
      }
      selectedInstallmentId.value = null
      
      await fetchOverdue()
    } catch (err) {
      showAlertError('HATA', err.response?.data?.message || 'İşlem başarısız.')
    }
  }
}

let debounceTimer;
watch([searchQuery, filterStatus], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchPlans({ page: 1 })
  }, 300);
});

onMounted(() => {
  fetchPlans({ page: 1 })
  fetchOverdue()
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
