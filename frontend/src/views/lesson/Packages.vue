<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative">
    
    <!-- 1. HEADER (Global: Search & View Toggle) -->
    <template v-if="!showAddModal && !showMembersModal">
    <BaseSearchFilter
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="PAKET VEYA BRANŞ ARA..."
      accent="indigo"
    />
    </template>

    <!-- 2. CONTENT AREA -->
    <div class="flex-1 flex flex-col overflow-hidden">
      
      <!-- Main List View (Grid/List) -->
      <div v-if="!showAddModal && !showMembersModal" class="flex-1 overflow-hidden flex flex-col pt-2">
        <!-- Grid View (Outer BaseScroll) -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" accent="indigo" :maskSize="60" class="flex-1 px-2 pb-20">
            <div v-if="filteredPackages.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BaseCard 
                  v-for="pkg in filteredPackages" 
                  :key="pkg.id"
                  :selected="selectedPackageId === pkg.id"
                  :status="pkg.isActive"
                  activeLabel="AKTİF"
                  inactiveLabel="PASİF"
                  accent="indigo"
                  @click="toggleSelection(pkg.id)"
                >
                  <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-start pt-2 h-10"></div>
                    <div class="tracking-tight">
                      <h3 class="text-sm font-black text-slate-100 group-hover:text-indigo-400 transition-colors truncate">{{ pkg.name }}</h3>
                      <p class="text-[0.65rem] text-emerald-500 font-bold tracking-widest">{{ pkg.specialty?.name || 'GENEL' }}</p>
                    </div>
                    
                    <div class="space-y-2 py-4 border-y border-slate-700/50">
                      <div class="flex justify-between text-[0.65rem] font-bold uppercase tracking-widest">
                        <span class="text-slate-500">TÜR / DEĞER</span>
                        <span class="text-indigo-400">
                          {{ pkg.type === 'SESSION' ? pkg.sessionCount + ' SEANS' : pkg.type === 'GROUP' ? 'GRUP DERSİ' : pkg.durationMonths + ' AY' }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center text-[0.65rem] font-bold uppercase tracking-widest">
                        <span class="text-slate-500">ÜYE SAYISI</span>
                        <button 
                          @click.stop="openMembersModal(pkg, 'assigned')"
                          class="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg transition-all active:scale-95"
                        >
                          {{ pkg.memberCount || 0 }} ÜYE
                        </button>
                      </div>
                      <div class="flex justify-between text-[0.65rem] font-bold uppercase tracking-widest items-center">
                        <span class="text-slate-500">FİYAT</span>
                        <span class="text-emerald-400 text-lg font-black tracking-tighter tabular-nums">₺{{ pkg.price }}</span>
                      </div>
                    </div>
                  </div>
                </BaseCard>
            </div>
            <div v-else class="h-full flex items-center justify-center py-40 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-2xl mx-2">
                <div class="flex flex-col items-center gap-4 opacity-30">
                  <CreditCard class="w-16 h-16" />
                  <p class="text-xs font-black uppercase tracking-[0.3em]">HENÜZ PAKET BULUNMUYOR</p>
                </div>
            </div>
        </BaseScroll>

        <!-- List View -->
        <div v-else class="flex-1 overflow-hidden px-2 pb-24 text-left">
           <BaseTable
             :columns="mainColumns"
             :items="filteredPackages"
             :selectedId="selectedPackageId"
             accent="indigo"
             @rowClick="toggleSelection($event.id)"
           >
              <template #cell-name="{ value, item }">
                 <div class="flex flex-col">
                    <span class="text-slate-50 font-black uppercase tracking-tight">{{ value }}</span>
                    <span class="text-[0.6rem] text-slate-500 font-bold uppercase">{{ item.specialty?.name || 'GENEL' }}</span>
                 </div>
              </template>
              <template #cell-specialty="{ item }">
                 <span class="text-[0.65rem] text-emerald-500 font-black uppercase tracking-widest">{{ item.specialty?.name || 'GENEL' }}</span>
              </template>
              <template #cell-memberCountValue="{ item }">
                 <div class="flex items-center justify-center">
                   <button 
                     @click.stop="openMembersModal(item, 'assigned')"
                     class="px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-black rounded-lg transition-all active:scale-95"
                   >
                     {{ item.memberCount || 0 }} ÜYE
                   </button>
                 </div>
              </template>
              <template #cell-typeValue="{ item }">
                 <div class="flex flex-col text-center">
                    <span class="text-[0.65rem] text-indigo-400 font-black uppercase tracking-widest italic">
                      {{ item.type === 'SESSION' ? 'SEANSLI' : item.type === 'GROUP' ? 'GRUP' : 'SÜRELİ' }}
                    </span>
                    <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-tight">
                      {{ item.type === 'SESSION' ? item.sessionCount + ' SEANS' : item.type === 'GROUP' ? 'GRUP DERSİ' : item.durationMonths + ' AY' }}
                    </span>
                 </div>
              </template>
              <template #cell-price="{ item }">
                 <span class="text-sm font-black text-white font-mono">₺{{ item.price }}</span>
              </template>
              <template #cell-status="{ item }">
                 <div class="flex items-center justify-center">
                   <BaseBadge :type="item.isActive ? 'success' : 'danger'" class="text-[0.55rem]">{{ item.isActive ? 'AKTİF' : 'PASİF' }}</BaseBadge>
                 </div>
              </template>
           </BaseTable>
        </div>
      </div>

      <!-- Add/Edit Modal (Overlay Style) -->
      <Transition name="fade-slide">
        <div v-if="showAddModal" class="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden">

             <div class="flex-1 overflow-y-auto custom-scrollbar p-[15px] text-left">
                <div class="w-full">
                  <div class="space-y-8 flex flex-col">
                     <BaseCard :clickable="false" class="p-8 !bg-slate-900/20 shadow-2xl backdrop-blur-sm border-rose-500/10" accent="rose">
                       <div class="space-y-8">
                          <div class="space-y-8">
                             <BaseInput v-model="newPkg.branchId" type="select" label="Hangi Şube?" required>
                               <template #icon><Building2 class="w-4 h-4 text-rose-500" /></template>
                               <option value="" disabled>ŞUBE SEÇİNİZ</option>
                               <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                             </BaseInput>
                             <BaseInput v-model="newPkg.name" label="Paket Tanımı" placeholder="ÖRN: 3 AY FİTNESS" required>
                               <template #icon><PenTool class="w-4 h-4 text-emerald-400" /></template>
                             </BaseInput>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <BaseInput v-model="newPkg.type" type="select" label="Üyelik Tipi">
                                  <template #icon><Layers class="w-4 h-4 text-amber-500" /></template>
                                  <option value="PERIODICAL">Süreli (Aylık)</option>
                                  <option value="SESSION">Seanslı (Ders)</option>
                                  <option value="GROUP">Grup Dersi</option>
                                  <option value="MIXED">Karma Üyelik</option>
                                </BaseInput>
                                <BaseInput v-model.number="newPkg.price" type="number" label="Satış Fiyatı (₺)" required>
                                  <template #icon><DollarSign class="w-4 h-4 text-emerald-500" /></template>
                                </BaseInput>
                             </div>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div v-if="newPkg.type === 'SESSION'"><BaseInput v-model.number="newPkg.sessionCount" type="number" label="Seans Sayısı" required /></div>
                                <div v-else><BaseInput v-model.number="newPkg.durationMonths" type="number" label="Üyelik Süresi (Ay)" required /></div>
                             </div>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <BaseInput v-model="newPkg.membershipType" type="select" label="Üye Tipi (Otomatik Tanımlanacak)">
                                  <template #icon><Percent class="w-4 h-4 text-emerald-400" /></template>
                                  <option value="STANDART">Standart Üyelik</option>
                                  <option value="GOLD">Gold Üyelik</option>
                                  <option value="PLATINIUM">Platinum Üyelik</option>
                                  <option value="GROUP">Grup Dersi Üyeliği</option>
                                  <option value="MIXED">Karma Üyelik (Fitness + Grup)</option>
                                </BaseInput>
                                <BaseInput v-model="newPkg.specialtyId" type="select" label="Branş / Departman" required>
                                  <template #icon><Activity class="w-4 h-4 text-emerald-400" /></template>
                                  <option value="" disabled>BRANŞ SEÇİNİZ</option>
                                  <optgroup v-if="groupedSpecialties.SALON.length > 0" label="🏠 SALON BRANŞLARI">
                                    <option v-for="spec in groupedSpecialties.SALON" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                                  </optgroup>
                                  <optgroup v-if="groupedSpecialties.SAHA.length > 0" label="⚽ SAHA / KORT BRANŞLARI">
                                    <option v-for="spec in groupedSpecialties.SAHA" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                                  </optgroup>
                                  <optgroup v-if="groupedSpecialties.HAVUZ.length > 0" label="🏊 HAVUZ BRANŞLARI">
                                    <option v-for="spec in groupedSpecialties.HAVUZ" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                                  </optgroup>
                                  <optgroup v-if="groupedSpecialties.DIGER.length > 0" label="📦 DİĞER">
                                    <option v-for="spec in groupedSpecialties.DIGER" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                                  </optgroup>
                                </BaseInput>
                             </div>
                             <div class="pt-8 border-t border-slate-800/40">
                                <div class="flex items-center justify-between p-6 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
                                   <div class="flex flex-col gap-1.5"><span class="text-[0.75rem] font-black text-slate-100 tracking-widest">SATIŞA SUN / AKTİF ET</span></div>
                                   <BaseSwitch v-model="newPkg.isActive" />
                                </div>
                             </div>
                          </div>
                       </div>
                     </BaseCard>
                  </div>

                </div>
                <div class="h-24"></div>
             </div>
             <BaseActionFooter local>
                <div class="flex items-center gap-[10px]">
                   <BaseButton variant="dark" size="icon" square @click="closeModal" title="VAZGEÇ"><template #icon><X class="w-5 h-5" /></template></BaseButton>
                   <div class="w-px h-8 bg-slate-800 mx-1"></div>
                   <BaseButton :variant="newPkg.id ? 'warning' : 'success'" size="icon" square :loading="loading" @click="savePackage" :title="newPkg.id ? 'GÜNCELLE' : 'KAYDET'"><template #icon><Save v-if="newPkg.id" class="w-5 h-5" /><Check v-else class="w-5 h-5" /></template></BaseButton>
                </div>
             </BaseActionFooter>
        </div>
      </Transition>

      <!-- Member Assignment Modal (Overlay Style) -->
      <Transition name="fade-slide">
        <div v-if="showMembersModal" class="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-3xl flex flex-col overflow-hidden">


             <!-- Sub Header: Search & Info -->
             <BaseSearchFilter 
               v-model:searchQuery="memberSearchQuery" 
               v-model:viewMode="memberViewMode" 
               placeholder="ÜYE ARA (İSİM, KOD VEYA TEL)..." 
               accent="rose"
               class="!overflow-visible z-50"
             >
                <template #extra-left>
                  <div class="h-full relative px-2 border-r border-slate-800/50">
                    <button 
                      type="button"
                      @click.stop="isMemberFilterDropdownOpen = !isMemberFilterDropdownOpen"
                      class="h-full px-4 flex items-center gap-2 hover:bg-slate-900/80 transition-all text-[0.65rem] font-black text-rose-400 uppercase cursor-pointer"
                    >
                      <span>{{ activeTab === 'assigned' ? 'KAYITLI ÜYELER' : (activeTab === 'unassigned' ? 'YENİ ÜYE EKLE' : 'TÜM ÜYELER') }}</span>
                      <ChevronDown class="w-3 h-3 text-rose-500/50 transition-transform duration-300" :class="{ 'rotate-180': isMemberFilterDropdownOpen }" />
                    </button>

                    <Transition name="fade-slide">
                      <div v-if="isMemberFilterDropdownOpen" class="absolute top-[calc(100%+12px)] left-0 w-64 bg-[#0a0f1d] border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.4),0_30px_90px_rgba(0,0,0,0.9)] rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          @click="activeTab = 'all'; selectedMemberIds = []; isMemberFilterDropdownOpen = false"
                          :class="activeTab === 'all' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                          class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'all' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                            <span>TÜM ÜYELER</span>
                          </div>
                          <span v-if="activeTab === 'all'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                        </button>
                        <button 
                          @click="activeTab = 'assigned'; selectedMemberIds = []; isMemberFilterDropdownOpen = false"
                          :class="activeTab === 'assigned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                          class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'assigned' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                            <span>KAYITLI ÜYELER</span>
                          </div>
                          <span v-if="activeTab === 'assigned'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                        </button>
                        <button 
                          @click="activeTab = 'unassigned'; selectedMemberIds = []; isMemberFilterDropdownOpen = false"
                          :class="activeTab === 'unassigned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                          class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left group"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-1.5 h-1.5 rounded-full" :class="activeTab === 'unassigned' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                            <span>YENİ ÜYE EKLE</span>
                          </div>
                          <span v-if="activeTab === 'unassigned'" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </template>
             </BaseSearchFilter>

             <!-- Modal Content -->
             <div class="flex-1 overflow-hidden px-[15px] pt-1 pb-4 text-left">
                <div v-if="memberViewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
                    <BaseCard v-for="m in filteredAvailableMembers" :key="m.id" :selected="selectedMemberIds.includes(m.id)" selectable accent="indigo" @click="toggleMemberSelection(m.id)">
                       <div class="flex flex-col gap-4 text-center items-center py-4">
                          <BaseMemberAvatar :src="m.photo" :name="m.fullName" size="lg" rounded />
                          <div class="space-y-1">
                             <span class="text-[0.7rem] font-black text-slate-100 uppercase truncate w-full block">{{ m.fullName }}</span>
                             <span class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">{{ m.membershipType }}</span>
                          </div>
                       </div>
                    </BaseCard>
                </div>
                <div v-else class="flex-1 overflow-visible">
                   <BaseTable :columns="activeTab === 'assigned' ? memberColumnsAssigned : memberColumnsUnassigned" :items="filteredAvailableMembers" :selectedIds="selectedMemberIds" @rowClick="toggleMemberSelection($event.id)">
                      <template #cell-photo="{ item }"><BaseMemberAvatar :src="item.photo" :name="item.fullName" size="xs" /></template>
                      <template #cell-fullName="{ value }"><span class="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight">{{ value }}</span></template>
                      <template #cell-gender="{ item }"><span class="text-[0.65rem] font-bold uppercase" :class="item.gender === 'KADIN' ? 'text-rose-400' : 'text-blue-400'">{{ item.gender || '-' }}</span></template>
                      <template #cell-startDate="{ item }"><span class="text-[0.7rem] text-emerald-500 font-black tracking-tighter italic">{{ getMemberPackageDate(item, 'start') }}</span></template>
                      <template #cell-expiryDate="{ item }"><span class="text-[0.7rem] text-rose-500 font-black tracking-tighter italic">{{ getMemberPackageDate(item, 'expiry') }}</span></template>
                   </BaseTable>
                </div>
                <div class="h-24"></div>
             </div>

             <BaseActionFooter v-if="!showAssignDetailsModal" local>
                <div class="flex items-center justify-between w-full h-full px-6">
                   <div class="flex items-center gap-[10px]">
                      <BaseButton variant="dark" size="icon" square @click="closeMembersModal" title="GERİ"><template #icon><ArrowLeft class="w-5 h-5" /></template></BaseButton>
                   </div>

                   <div v-if="selectedMemberIds.length > 0" class="flex gap-2">
                       <BaseButton v-if="activeTab === 'assigned'" variant="danger" size="icon" square @click="removeMemberFromPackage" :loading="removeLoading" title="PAKETTEN ÇIKAR">
                          <template #icon><Trash2 class="w-5 h-5" /></template>
                       </BaseButton>
                       <BaseButton v-if="activeTab === 'unassigned'" variant="success" size="icon" square @click="confirmAndAssignMembers" class="shadow-lg shadow-emerald-500/20" title="KAYDET">
                          <template #icon><Check class="w-5 h-5" /></template>
                       </BaseButton>
                   </div>
                </div>
             </BaseActionFooter>

             <!-- Secondary Modal: Assignment Details -->
             <Transition name="fade-slide">
                <div v-if="showAssignDetailsModal" class="absolute inset-0 z-[70] bg-slate-950/98 backdrop-blur-3xl flex flex-col overflow-hidden">
                     
                     <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-[15px] py-6">
                        <div class="w-full flex flex-col space-y-6">
                           
                           <!-- Summary Section (Full Width) -->
                           <BaseCard :clickable="false" class="p-8 !bg-slate-900/40 border-indigo-500/20" accent="indigo">
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                 <div class="flex items-center gap-6">
                                    <div class="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                       <Users class="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <div class="space-y-1 text-left">
                                       <h4 class="text-xl font-black text-white">{{ selectedMemberIds.length }} ÜYE SEÇİLDİ</h4>
                                    </div>
                                 </div>

                                 <div class="flex flex-col md:text-right md:items-end gap-1">
                                    <span class="text-[0.6rem] text-slate-500 font-black uppercase tracking-[0.2em]">UYGULANACAK PAKET</span>
                                    <p class="text-xs font-black text-indigo-400 uppercase tracking-widest">{{ selectedPackageForMembers?.name }} (₺{{ selectedPackageForMembers?.price }})</p>
                                 </div>
                              </div>
                           </BaseCard>

                           <!-- Configuration Section (Full Width) -->
                           <BaseCard :clickable="false" class="p-10 !bg-slate-900/20" accent="emerald">
                              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                                 
                                 <div class="space-y-3">
                                    <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Paket Başlangıç Tarihi</label>
                                    <BaseInput v-model="packageStartDate" type="date" required>
                                       <template #icon><Layout class="w-5 h-5 text-emerald-500" /></template>
                                    </BaseInput>
                                 </div>

                                 <div class="space-y-3">
                                    <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Kampanya Seçimi</label>
                                    <BaseInput v-model="selectedCampaignId" type="select">
                                       <template #icon><Tag class="w-5 h-5 text-indigo-400" /></template>
                                       <option value="">KAMPANYA YOK</option>
                                       <option v-for="c in activeCampaigns" :key="c.id" :value="c.id">{{ c.name }}</option>
                                    </BaseInput>
                                 </div>

                                 <div class="space-y-3">
                                    <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Net Satış Fiyatı (₺)</label>
                                    <BaseInput v-model.number="customPrice" type="number" required>
                                       <template #icon><DollarSign class="w-5 h-5 text-emerald-500" /></template>
                                    </BaseInput>
                                 </div>

                                 <div class="space-y-3">
                                    <label class="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Hesaplanan Bitiş Tarihi</label>
                                    <div class="h-[56px] flex items-center px-6 bg-slate-950/80 border-2 border-slate-800 rounded-2xl text-amber-500 font-black tracking-[0.2em] text-xl shadow-inner uppercase">
                                       {{ durationPreview }}
                                    </div>
                                 </div>

                              </div>
                           </BaseCard>

                           <!-- Action Warning -->
                           <div class="flex flex-col items-center gap-4 pt-4">
                              <div class="flex items-center gap-3 px-6 py-2 bg-rose-500/5 border border-rose-500/10 rounded-full">
                                 <Activity class="w-4 h-4 text-rose-500" />
                                 <span class="text-[0.55rem] text-rose-400 font-bold uppercase tracking-[0.4em]">İŞLEM ONAYLANDIĞINDA SİSTEME KALICI OLARAK İŞLENECEKTİR</span>
                              </div>
                           </div>

                        </div>
                     </div>

                     <BaseActionFooter local>
                        <div class="flex items-center gap-6">
                           <BaseButton variant="dark" size="icon" square @click="showAssignDetailsModal = false">
                              <template #icon><ArrowLeft class="w-5 h-5" /></template>
                           </BaseButton>

                           <div class="w-px h-8 bg-slate-800"></div>

                           <BaseButton 
                             variant="success" size="icon" square
                             class="!w-14 !h-14 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] transition-all"
                             :loading="assignLoading"
                             @click="assignMemberToPackage"
                             title="KAYDET"
                           >
                              <template #icon><Check class="w-6 h-6" /></template>
                           </BaseButton>
                        </div>
                     </BaseActionFooter>
                </div>
             </Transition>
        </div>
      </Transition>
    </div>

    <!-- 3. MAIN ACTION FOOTER (Base Standart) -->
    <BaseActionFooter v-if="!showAddModal && !showMembersModal">
       <div class="flex items-center gap-[10px]">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ"><template #icon><ArrowLeft class="w-5 h-5" /></template></BaseButton>
          <div class="w-px h-6 bg-slate-800 mx-1"></div>
          <BaseButton variant="primary" size="icon" square @click="openAddModal" title="YENİ PAKET TANIMLA"><template #icon><Plus class="w-5 h-5" /></template></BaseButton>
          <Transition name="fade-slide">
            <div v-if="selectedPackageId" class="flex items-center gap-2 border-l border-slate-800 pl-3 ml-1">
               <BaseButton variant="warning" size="icon" square @click="startEdit(packages.find(p => p.id === selectedPackageId))" title="DÜZENLE"><template #icon><Edit3 class="w-5 h-5" /></template></BaseButton>
               <BaseButton variant="indigo" size="icon" square @click="openMembersModal(packages.find(p => p.id === selectedPackageId))" title="ÜYELER"><template #icon><Users class="w-5 h-5" /></template></BaseButton>
               <BaseButton variant="toggle" :active="packages.find(p => p.id === selectedPackageId)?.isActive" size="icon" square @click="togglePackageStatus(packages.find(p => p.id === selectedPackageId))" title="DURUM"><template #icon><Power class="w-5 h-5" /></template></BaseButton>
               <BaseButton variant="danger" size="icon" square @click="deleteSelectedPackages" title="SİL"><template #icon><Trash2 class="w-5 h-5" /></template></BaseButton>
               <BaseButton variant="ghost" size="icon" square @click="selectedPackageId = null" title="İPTAL"><template #icon><XCircle class="w-5 h-5" /></template></BaseButton>
            </div>
          </Transition>
       </div>

       <!-- Pagination Controls -->
       <div class="flex items-center gap-4">
          <div v-if="totalPages > 1" class="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
             <BaseButton 
               variant="dark" 
               size="icon" 
               square 
               class="w-8 h-8"
               :disabled="currentPage === 1" 
               @click="fetchPackages(currentPage - 1)"
               title="ÖNCEKİ SAYFA"
             >
               <template #icon><ChevronLeft class="w-4 h-4" /></template>
             </BaseButton>
             
             <div class="flex items-center gap-1.5 px-2">
               <span class="text-[0.65rem] font-black text-indigo-400">{{ currentPage }}</span>
               <span class="text-[0.6rem] font-bold text-slate-600">/</span>
               <span class="text-[0.65rem] font-black text-slate-400">{{ totalPages }}</span>
             </div>

             <BaseButton 
               variant="dark" 
               size="icon" 
               square 
               class="w-8 h-8"
               :disabled="currentPage === totalPages" 
               @click="fetchPackages(currentPage + 1)"
               title="SONRAKİ SAYFA"
             >
               <template #icon><ChevronRight class="w-4 h-4" /></template>
             </BaseButton>
          </div>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CreditCard, Trash2, X, XCircle, ArrowLeft, Plus, Power, Users, Check, Edit3, Activity, Building2, PenTool, Layers, DollarSign, Layout, Tag, Percent,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-vue-next'

// Services & Composables
import { packageService } from '../../services/lesson/packageService'
import { campaignService } from '../../services/admin/campaignService'
import { memberPackageService } from '../../services/lesson/memberPackageService'
import { memberService } from '../../services/member/memberService'
import { usePackages } from '../../composables/usePackages'
import { useAlerts } from '../../utils/alerts'

// Base Components
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseSwitch from '../../components/base/BaseSwitch.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'
import BaseModalHeader from '../../components/base/BaseModalHeader.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'

const router = useRouter()
const { toast, confirm, error: showAlertError } = useAlerts()
const pageSubtitle = inject('pageSubtitle', ref(''))

const {
  packages,
  totalPackages,
  totalPages,
  currentPage,
  specialties,
  branches,
  loading: globalLoading,
  fetchPackages,
  fetchSpecialties,
  fetchBranches,
  groupedSpecialties
} = usePackages()

// Local State
const showAddModal = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('list')
const selectedPackageId = ref(null)
const showAssignDetailsModal = ref(false)



// Campaign & Price State
const activeCampaigns = ref([])
const selectedCampaignId = ref('')
const customPrice = ref(null)
const packageStartDate = ref(new Date().toISOString().split('T')[0])

// Tables
const mainColumns = [
  { key: 'name', label: 'PAKET ADI' },
  { key: 'specialty', label: 'BRANŞ' },
  { key: 'memberCountValue', label: 'TOPLAM ÜYE', class: 'text-center' },
  { key: 'typeValue', label: 'TÜR / DEĞER', class: 'text-center' },
  { key: 'price', label: 'FİYAT', class: 'text-right' }
]

const memberColumnsAssigned = [
  { key: 'photo', label: '', class: 'w-10' },
  { key: 'fullName', label: 'ÜYE İSMİ' },
  { key: 'gender', label: 'CİNSİYET', class: 'text-center' },
  { key: 'membershipType', label: 'BRANŞ', class: 'text-center' },
  { key: 'startDate', label: 'BAŞLANGIÇ', class: 'text-center' },
  { key: 'expiryDate', label: 'BİTİŞ', class: 'text-center' }
]

const memberColumnsUnassigned = [
  { key: 'photo', label: '', class: 'w-10' },
  { key: 'fullName', label: 'ÜYE İSMİ' },
  { key: 'membershipType', label: 'ÜYE TİPİ', class: 'text-center' }
]

const newPkg = ref({ 
  id: null, name: '', type: 'PERIODICAL', durationMonths: 1, sessionCount: 0, 
  weeklySessionCount: 3, price: 0, specialtyId: '', branchId: '', 
  membershipType: 'STANDART', isActive: true 
})

// Logic
const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value
  const query = searchQuery.value.toLowerCase()
  return packages.value.filter(pkg => 
    pkg.specialty?.name?.toLowerCase().includes(query) || 
    pkg.name?.toLowerCase().includes(query)
  )
})

const fetchActiveCampaigns = async () => {
   try {
      activeCampaigns.value = await campaignService.getActive({ branchId: selectedPackageForMembers.value?.branchId })
   } catch (err) { console.error(err) }
}

const campaignPricePreview = computed(() => {
   if (!selectedPackageForMembers.value) return 0
   let price = selectedPackageForMembers.value.price
   if (selectedCampaignId.value) {
      const camp = activeCampaigns.value.find(c => c.id === selectedCampaignId.value)
      if (camp) {
         if (camp.discountType === 'PERCENTAGE') price = price * (1 - (camp.discountValue / 100))
         else if (camp.discountType === 'AMOUNT') price = Math.max(0, price - camp.discountValue)
      }
   }
   return Number(price).toFixed(2)
})

const durationPreview = computed(() => {
   if (!selectedPackageForMembers.value) return ''
   const pkg = selectedPackageForMembers.value
   const start = packageStartDate.value ? new Date(packageStartDate.value) : new Date()
   const expDate = new Date(start)
   expDate.setMonth(expDate.getMonth() + (parseInt(pkg.durationMonths) || 1))
   if (selectedCampaignId.value) {
      const camp = activeCampaigns.value.find(c => c.id === selectedCampaignId.value)
      if (camp && camp.durationBonusMonths > 0) expDate.setMonth(expDate.getMonth() + camp.durationBonusMonths)
   }
   return expDate.toLocaleDateString('tr-TR')
})

watch(selectedCampaignId, (newVal) => { 
  customPrice.value = newVal ? campaignPricePreview.value : (selectedPackageForMembers.value?.price || 0) 
})

const toggleSelection = (id) => { selectedPackageId.value = (selectedPackageId.value === id ? null : id) }

const openAddModal = () => { closeModal(); showAddModal.value = true }
const closeModal = () => { 
  showAddModal.value = false
  newPkg.value = { 
    id: null, name: '', type: 'PERIODICAL', durationMonths: 1, sessionCount: 0, 
    weeklySessionCount: 3, price: 0, specialtyId: '', branchId: '', 
    membershipType: 'STANDART', isActive: true 
  } 
}
const startEdit = (pkg) => { 
  newPkg.value = { ...pkg, specialtyId: pkg.specialtyId || pkg.specialty?.id }
  showAddModal.value = true 
}

const packageTimeline = computed(() => {
   if (!newPkg.value.durationMonths || newPkg.value.type !== 'PERIODICAL') return []
   let periods = []; let current = new Date()
   for (let i = 0; i < newPkg.value.durationMonths; i++) {
      let start = new Date(current); let end = new Date(current); end.setMonth(end.getMonth() + 1)
      periods.push({ start: start.toLocaleDateString('tr-TR'), end: end.toLocaleDateString('tr-TR') })
      current = end
   }
   return periods
})

const savePackage = async () => {
  if (!newPkg.value.name || !newPkg.value.branchId || !newPkg.value.specialtyId) { 
    toast('Zorunlu alanları doldurun.', 'warning')
    return 
  }
  loading.value = true
  try {
    const isEdit = !!newPkg.value.id
    if (isEdit) await packageService.update(newPkg.value.id, newPkg.value)
    else await packageService.create(newPkg.value)
    
    closeModal()
    fetchPackages()
    toast('Paket kaydedildi.')
  } catch (err) { 
    const msg = err.response?.data?.message || 'İşlem başarısız.';
    showAlertError('HATA', msg);
  } finally { loading.value = false }
}

const deleteSelectedPackages = async () => {
   if (!selectedPackageId.value) return
   const result = await confirm('EMİN MİSİNİZ?')
   if (result.isConfirmed) {
      try {
         await packageService.delete(selectedPackageId.value)
         selectedPackageId.value = null
         fetchPackages()
         toast('Silindi')
      } catch (err) { 
        showAlertError('HATA', 'Silme başarısız.')
      }
   }
}

const showMembersModal = ref(false)
const selectedPackageForMembers = ref(null)

watch(showAddModal, (val) => {
  if (val) pageSubtitle.value = newPkg.value.id ? 'DÜZENLE' : 'YENİ PAKET'
  else if (!showMembersModal.value) pageSubtitle.value = ''
})

watch(showMembersModal, (val) => {
  if (val) pageSubtitle.value = 'ÜYE ATAMA'
  else if (!showAddModal.value) pageSubtitle.value = ''
})

onUnmounted(() => {
  pageSubtitle.value = ''
})
const memberViewMode = ref('list')
const memberSearchQuery = ref('')
const allAvailableMembers = ref([])
const activeTab = ref('assigned')
const selectedMemberIds = ref([])
const assignLoading = ref(false)
const isMemberFilterDropdownOpen = ref(false)
const removeLoading = ref(false)

const getMemberPackageDate = (member, type) => {
   const pkg = member.activePackages?.find(ap => ap.packageId === selectedPackageForMembers.value?.id && ap.status === 'ACTIVE')
   if (!pkg) return '-'
   const date = type === 'expiry' ? pkg.expiryDate : pkg.startDate
   return date ? new Date(date).toLocaleDateString('tr-TR') : '-'
}

const filteredAvailableMembers = computed(() => {
   const pkgId = selectedPackageForMembers.value?.id
   let result = allAvailableMembers.value || []
   if (!Array.isArray(result)) return []
   
   // Sadece ÜYE (MEMBER) olanları filtrele
   result = result.filter(m => m.profileType === 'MEMBER')
   
   if (activeTab.value === 'assigned') {
     result = result.filter(m => m.activePackages?.some(ap => ap.packageId === pkgId && ap.status === 'ACTIVE'))
   } else if (activeTab.value === 'unassigned') {
     result = result.filter(m => !m.activePackages?.some(ap => ap.packageId === pkgId && ap.status === 'ACTIVE'))
   }
   
   // Eğer 'all' ise filtreleme yapmıyoruz, tüm (filtrelenmişse searchQuery ile) üyeleri gösteriyoruz.
   
   if (memberSearchQuery.value?.trim()) {
      const q = memberSearchQuery.value.trim().toLowerCase()
      result = result.filter(m => 
        (m.fullName || '').toLowerCase().includes(q) || 
        (m.memberCode || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q)
      )
   }
   return result
})

const toggleMemberSelection = (id) => {
   const idx = selectedMemberIds.value.indexOf(id)
   if (idx === -1) selectedMemberIds.value.push(id)
   else selectedMemberIds.value.splice(idx, 1)
}

const fetchAvailableMembers = async () => { 
  try { 
    const response = await memberService.getAll({ limit: 1000, profileType: 'MEMBER' })
    allAvailableMembers.value = response.members || [] 
  } catch (err) { console.error(err) } 
}

const openMembersModal = async (pkg, initialTab = 'assigned') => {
   selectedPackageForMembers.value = pkg; showMembersModal.value = true; activeTab.value = initialTab
   selectedMemberIds.value = []; selectedCampaignId.value = ''; customPrice.value = pkg.price
   packageStartDate.value = new Date().toISOString().split('T')[0]
   fetchAvailableMembers(); fetchActiveCampaigns()
}

const closeMembersModal = () => { showMembersModal.value = false; showAssignDetailsModal.value = false; selectedMemberIds.value = [] }

const removeMemberFromPackage = async () => {
   if (selectedMemberIds.value.length === 0) return
   removeLoading.value = true
   try {
      const promises = selectedMemberIds.value.map(memberId => {
         const m = allAvailableMembers.value.find(mem => mem.id === memberId)
         const mp = m?.activePackages?.find(ap => ap.packageId === selectedPackageForMembers.value?.id && ap.status === 'ACTIVE')
         if (mp) return memberPackageService.unassign(mp.id)
      })
      await Promise.all(promises.filter(p => p))
      selectedMemberIds.value = []; await fetchAvailableMembers(); await fetchPackages()
      toast('Üyeler paketten çıkarıldı.')
   } catch (err) { 
     showAlertError('HATA', 'İşlem başarısız.')
   } finally { removeLoading.value = false }
}

const assignMemberToPackage = async () => {
   if (selectedMemberIds.value.length === 0) return

   assignLoading.value = true
   try {
      const promises = selectedMemberIds.value.map(memberId => 
         memberPackageService.assign({ 
           memberId, 
           packageId: selectedPackageForMembers.value.id, 
           campaignId: selectedCampaignId.value || null, 
           customPrice: customPrice.value, 
           startDate: packageStartDate.value 
         })
      )
      await Promise.all(promises)
      selectedMemberIds.value = []; await fetchAvailableMembers(); activeTab.value = 'assigned'
      toast('Üyeler pakete atandı.')
      showMembersModal.value = false;
      showAssignDetailsModal.value = false;
   } catch (err) { 
     showAlertError('HATA', 'İşlem başarısız.')
   } finally { assignLoading.value = false }
}

const confirmAndAssignMembers = async () => {
    if (selectedMemberIds.value.length === 0) return
    const result = await confirm('EMİN MİSİNİZ?', `${selectedMemberIds.value.length} üyeyi bu pakete atamak istediğinize emin misiniz?`)
    if (result.isConfirmed) {
        customPrice.value = selectedPackageForMembers.value.price
        packageStartDate.value = new Date().toISOString().split('T')[0]
        selectedCampaignId.value = ''
        await assignMemberToPackage()
    }
}

const togglePackageStatus = async (pkg) => {
  try {
    const updatedStatus = !pkg.isActive
    await packageService.update(pkg.id, { ...pkg, isActive: updatedStatus })
    pkg.isActive = updatedStatus
    toast(`Paket ${updatedStatus ? 'aktif' : 'pasif'} hale getirildi.`)
  } catch (err) { console.error(err) }
}

onMounted(() => { 
  fetchPackages(); 
  fetchSpecialties(); 
  fetchBranches(); 
})
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
