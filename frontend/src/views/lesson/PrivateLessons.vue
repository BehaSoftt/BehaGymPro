<!-- PrivateLessons.vue - Updated for Exercise Categories -->
<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">
    
    <!-- 1. SEARCH & FILTERS (Base) -->
    <template v-if="!showCreateModal && !showEditModal && !showAttendanceModal">
      <BaseSearchFilter
        v-model:searchQuery="searchQuery"
        v-model:viewMode="viewMode"
        v-model:isFilterOpen="isFilterOpen"
        placeholder="ÜYE, BRANŞ VEYA EĞİTMEN ARA..."
        accent="indigo"
        class="!overflow-visible z-50 max-w-[calc(100%-30px)] mx-auto rounded-xl"
      >
        <template #extra-left>
          <div class="h-full relative flex items-center group z-50">
            <button 
              type="button"
              @click.stop="isFilterDropdownOpen = !isFilterDropdownOpen"
              class="h-full px-4 flex items-center gap-2 bg-slate-900/40 hover:bg-slate-800 transition-all text-[0.65rem] font-black text-indigo-400 uppercase cursor-pointer relative z-[40]"
            >
              <span>{{ filterTabs.find(t => t.id === activeFilterTab)?.label || 'FİLTRE' }}</span>
              <ChevronDown class="w-3 h-3 text-indigo-500/50 transition-transform duration-300" :class="{ 'rotate-180': isFilterDropdownOpen }" />
            </button>

            <!-- Custom Dropdown Panel (Neon Snow White Style) -->
            <Transition name="fade-slide">
              <div v-if="isFilterDropdownOpen" 
                class="absolute top-full left-0 mt-1 w-64 bg-slate-950/95 backdrop-blur-2xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.08)] z-[100] p-1.5"
                @click.stop
              >
                <button 
                  v-for="tab in filterTabs" 
                  :key="tab.id"
                  @click="activeFilterTab = tab.id; filterStatus = tab.status; showArchived = tab.archived; isFilterDropdownOpen = false"
                  :class="activeFilterTab === tab.id ? 'bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-100 hover:bg-white/5 border-transparent'"
                  class="w-full flex items-center justify-between px-3 py-2.5 text-[0.65rem] font-black tracking-widest border transition-all text-left mb-1 bg-slate-900/40"
                >
                  {{ tab.label }}
                  <div v-if="activeFilterTab === tab.id" class="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </BaseSearchFilter>
    </template>

    <!-- 2. STATS BAR -->
    <div v-if="!showCreateModal && !showEditModal && !showAttendanceModal" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 px-2">
      <div class="bg-slate-900/50 border border-slate-800 p-4 flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-all">
        <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">TOPLAM PAKET</span>
        <span class="text-xl font-black text-slate-100">{{ totalPackages }}</span>
      </div>
      <div class="bg-indigo-500/5 border border-indigo-500/20 p-4 flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/30 transition-all">
        <span class="text-[0.55rem] font-black text-indigo-400 uppercase tracking-widest">AKTİF</span>
        <span class="text-xl font-black text-indigo-300">{{ activePackagesCount }}</span>
      </div>
      <div class="bg-blue-500/5 border border-blue-500/20 p-4 flex flex-col items-center justify-center gap-1 group hover:border-blue-500/30 transition-all">
        <span class="text-[0.55rem] font-black text-blue-400 uppercase tracking-widest">SATIN ALINAN</span>
        <span class="text-xl font-black text-blue-300">{{ totalPurchasedSessions }}</span>
      </div>
      <div class="bg-amber-500/5 border border-amber-500/20 p-4 flex flex-col items-center justify-center gap-1 group hover:border-amber-500/30 transition-all">
        <span class="text-[0.55rem] font-black text-amber-400 uppercase tracking-widest">TAMAMLANAN</span>
        <span class="text-xl font-black text-amber-300">{{ totalCompletedSessions }}</span>
      </div>
      <div class="bg-emerald-500/5 border border-emerald-500/20 p-4 flex flex-col items-center justify-center gap-1 group hover:border-emerald-500/30 transition-all">
        <span class="text-[0.55rem] font-black text-emerald-400 uppercase tracking-widest">KALAN SEANS</span>
        <span class="text-xl font-black text-emerald-300">{{ totalRemainingSessionsCount }}</span>
      </div>
    </div>

    <!-- 3. CONTENT AREA -->
    <div class="flex-1 relative overflow-hidden flex flex-col">
      <template v-if="!showCreateModal && !showEditModal && !showAttendanceModal">
        
        <!-- Grid View -->
        <BaseScroll v-if="viewMode === 'grid'" direction="vertical" class="flex-1 px-2 pb-20" accent="indigo">
          <div v-if="filteredPackages.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <BaseCard 
              v-for="pkg in filteredPackages" 
              :key="pkg.id"
              :selected="selectedPackageId === pkg.id"
              :status="pkg.status === 'ACTIVE'"
              @click="toggleSelection(pkg.id)"
              accent="indigo"
            >
              <div class="space-y-4">
                <div class="flex justify-between items-start">
                   <div class="flex items-center gap-3">
                      <BaseMemberAvatar :name="pkg.member?.fullName" :src="pkg.member?.photo" size="xs" />
                      <div class="uppercase tracking-tight">
                         <h3 class="text-sm font-black text-slate-100 group-hover:text-indigo-400 transition-colors truncate">{{ pkg.member?.fullName }}</h3>
                         <p class="text-[0.6rem] text-slate-500 font-mono tracking-tighter">{{ pkg.member?.memberCode }}</p>
                      </div>
                   </div>
                   <BaseBadge :type="pkg.status === 'ACTIVE' ? 'success' : 'danger'" class="text-[0.5rem]">
                      {{ pkg.status === 'ACTIVE' ? 'AKTİF' : 'TAMAM' }}
                   </BaseBadge>
                </div>

                <div class="space-y-2 py-3 border-y border-slate-800/50">
                   <div class="flex justify-between items-center text-[0.6rem] font-black tracking-widest uppercase">
                      <span class="text-slate-500">BRANŞ</span>
                      <span class="text-indigo-400">{{ pkg.specialty?.name }}</span>
                   </div>
                   <div v-if="pkg.category" class="flex justify-between items-center text-[0.6rem] font-black tracking-widest py-1 border-t border-slate-800/20">
                      <span class="text-slate-500 uppercase tracking-widest">ALT BAŞLIK</span>
                      <span class="text-rose-400 font-bold opacity-90 truncate max-w-[120px]">{{ pkg.category?.name }}</span>
                   </div>
                   <div class="flex justify-between items-center text-[0.6rem] font-black tracking-widest uppercase">
                      <span class="text-slate-500">EĞİTMEN</span>
                      <span class="text-emerald-400">{{ pkg.instructor?.displayName || pkg.instructor?.fullName }}</span>
                   </div>
                   <div v-if="pkg.sportGroup" class="flex justify-between items-center text-[0.6rem] font-black tracking-widest py-1 border-t border-slate-800/20">
                      <span class="text-slate-500 uppercase tracking-widest">ALT GRUP</span>
                      <span class="text-amber-400 font-bold opacity-90 truncate max-w-[120px]">{{ pkg.sportGroup.name }}</span>
                   </div>
                   <div class="flex justify-between items-center pt-2">
                      <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">KALAN / TOPLAM</span>
                      <div class="flex items-baseline gap-1">
                         <span class="text-lg font-black" :class="pkg.remainingSessions > 0 ? 'text-emerald-400' : 'text-rose-400'">{{ pkg.remainingSessions }}</span>
                         <span class="text-[0.7rem] text-slate-500 font-bold">/ {{ pkg.sessionCount }}</span>
                      </div>
                   </div>
                </div>

                <div class="flex flex-wrap gap-1.5 pt-2">
                   <div 
                     v-for="dayIdx in (pkg.days || [])" 
                     :key="dayIdx"
                     :class="getDayStyle(dayIdx)"
                     class="text-[0.65rem] font-black border px-2.5 py-1.5 min-w-[42px] text-center uppercase tracking-tighter"
                   >
                      {{ getDayName(dayIdx) }}
                   </div>
                </div>

                <div class="flex justify-between items-center pt-2 h-8">
                   <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest italic">ÜCRET</span>
                   <span class="text-md font-black text-white font-mono">₺{{ pkg.price }}</span>
                </div>

                <!-- TODAY ATTENDANCE STATUS -->
                <div v-if="pkg.attendanceRecords?.length" class="mt-4 pt-4 border-t border-slate-800/50">
                   <div class="flex flex-col gap-1.5">
                      <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block">YOKLAMA ONAYI</span>
                      <div class="flex items-center justify-between">
                         <div class="flex items-center gap-2">
                            <CheckCircle v-if="pkg.attendanceRecords[0].status === 'PRESENT'" class="w-3.5 h-3.5 text-emerald-500" />
                            <XCircle v-else-if="pkg.attendanceRecords[0].status === 'ABSENT'" class="w-3.5 h-3.5 text-rose-500" />
                            <Info v-else class="w-3.5 h-3.5 text-amber-500" />
                            <span class="text-[0.65rem] font-bold text-slate-200 uppercase">
                               {{ pkg.attendanceRecords[0].status === 'PRESENT' ? 'GELDİ' : pkg.attendanceRecords[0].status === 'ABSENT' ? 'GELMEDİ' : 'MAZERET' }}
                            </span>
                         </div>
                         <span class="text-[0.6rem] text-slate-500 font-mono">
                            {{ new Date(pkg.attendanceRecords[0].createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            </BaseCard>
          </div>
          <div v-else class="h-full flex items-center justify-center py-40 border-2 border-dashed border-slate-800 opacity-20 mx-2">
             <Package class="w-16 h-16" />
          </div>
        </BaseScroll>

        <!-- List View -->
        <div v-else class="flex-1 overflow-hidden px-2 pb-24">
          <BaseTable
            :columns="mainColumns"
            :items="filteredPackages"
            :selectedId="selectedPackageId"
            accent="indigo"
            @rowClick="toggleSelection($event.id)"
          >
            <template #cell-member="{ item }">
              <div class="flex items-center gap-3">
                <BaseMemberAvatar :name="item.member?.fullName" :src="item.member?.photo" size="xs" />
                <div class="flex flex-col uppercase tracking-tight">
                  <span class="text-slate-100 font-black text-[0.7rem]">{{ item.member?.fullName }}</span>
                  <span class="text-[0.55rem] text-slate-500 font-mono">{{ item.member?.memberCode }}</span>
                </div>
              </div>
            </template>
            <template #cell-specialty="{ value }">
              <span class="text-[0.65rem] font-black text-indigo-400 uppercase tracking-widest">{{ value?.name }}</span>
            </template>
            <template #cell-instructor="{ value }">
              <span class="text-[0.65rem] font-black text-emerald-400 uppercase tracking-widest">{{ value?.fullName || value?.displayName || value?.user?.username || '-' }}</span>
            </template>
            <template #cell-sessions="{ item }">
              <div class="flex flex-col items-center">
                <div class="flex items-baseline gap-1">
                  <span class="text-[0.55rem] text-slate-500 mr-1">KALAN:</span>
                  <span class="text-sm font-black" :class="item.remainingSessions > 0 ? 'text-emerald-400' : 'text-rose-400'">{{ item.remainingSessions }}</span>
                  <span class="text-[0.6rem] text-slate-500 ml-1">/ {{ item.sessionCount }}</span>
                </div>
                <div class="w-full max-w-[80px] h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: (item.remainingSessions / item.sessionCount * 100) + '%' }"></div>
                </div>
              </div>
            </template>
            <template #cell-days="{ value }">
              <div class="flex gap-1.5 justify-center">
                <div 
                  v-for="dayIdx in (value || [])" 
                  :key="dayIdx"
                  :class="getDayStyle(dayIdx)"
                  class="text-[0.6rem] font-black border px-2 py-1 min-w-[38px] text-center uppercase tracking-tighter"
                >
                  {{ getDayName(dayIdx) }}
                </div>
              </div>
            </template>
            <template #cell-price="{ value }">
              <span class="text-[0.75rem] font-black text-white font-mono">₺{{ value }}</span>
            </template>
            <template #cell-status="{ value }">
              <BaseBadge :type="value === 'ACTIVE' ? 'success' : 'danger'" class="text-[0.5rem]">
                {{ value === 'ACTIVE' ? 'AKTİF' : 'TAMAM' }}
              </BaseBadge>
            </template>
          </BaseTable>
        </div>
      </template>

      <!-- 4. MODALS (Integrated Base) -->
      
      <!-- Create/Edit Modal (Absolute Full Screen Overlay) -->
      <Transition name="fade-slide">
        <div v-if="showCreateModal || showEditModal" class="absolute inset-0 z-[60] bg-slate-950/98 backdrop-blur-xl flex flex-col overflow-hidden">

          <div class="flex-1 overflow-y-auto custom-scrollbar px-2 py-8">
            <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-[1400px] mx-auto">
              
              <!-- Üye Seçimi (Sadece Create) -->
              <div v-if="showCreateModal" class="col-span-2">
                 <BaseInput v-model="form.memberId" type="select" label="EĞİTİM ALACAK ÜYE" required>
                    <template #icon><User class="w-4 h-4 text-rose-500" /></template>
                    <option value="" disabled>ÜYE SEÇİNİZ</option>
                    <option v-for="m in eligibleMembers" :key="m.id" :value="m.id">{{ m.fullName }} {{ m.memberCode ? '(' + m.memberCode + ')' : '' }}</option>
                 </BaseInput>
              </div>
              <div v-else class="col-span-2 p-4 bg-slate-900/50 border border-slate-800 flex items-center gap-4">
                 <BaseMemberAvatar :name="editForm.memberName" :src="editForm.memberPhoto" size="sm" />
                 <div>
                    <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block">DÜZENLENEN ÜYE</span>
                    <span class="text-sm font-black text-rose-500 uppercase">{{ editForm.memberName }}</span>
                 </div>
              </div>

              <div class="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <BaseInput v-model="branchCategory" type="select" label="BRANŞ TÜRÜ">
                  <template #icon><Activity class="w-4 h-4 text-indigo-400" /></template>
                  <option value="STANDARD">Standart Branşlar</option>
                  <option value="BELT">Kuşak Branşları</option>
                </BaseInput>

                <div v-if="branchCategory === 'STANDARD'" class="w-full">
                  <BaseInput v-model="activeFormData.specialtyId" type="select" label="SPOR BRANŞI (STANDART)" required>
                    <template #icon><Activity class="w-4 h-4 text-emerald-400" /></template>
                    <option value="" disabled>BRANŞ SEÇİNİZ</option>
                    <option v-for="s in standardSpecialties" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </BaseInput>
                </div>
                <div v-else class="w-full">
                  <BaseInput v-model="activeFormData.specialtyId" type="select" label="KUŞAK BRANŞI" required>
                    <template #icon><Activity class="w-4 h-4 text-amber-500" /></template>
                    <option value="" disabled>BRANŞ SEÇİNİZ</option>
                    <option v-for="s in beltSpecialties" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </BaseInput>
                </div>
              </div>

              <!-- Alt Grup / Takım (Dinamik) -->
              <div v-if="activeFormData.specialtyId && availableGroups.length > 0" class="col-span-2 animate-in fade-in slide-in-from-top-2">
                 <BaseInput v-model="activeFormData.sportGroupId" type="select" label="EĞİTİM ALACAK ALT GRUP / TAKIM (OPSİYONEL)">
                    <template #icon><Layers class="w-4 h-4 text-emerald-400" /></template>
                    <option value="">GRUP SEÇİLMEYECEK (BİREYSEL)</option>
                    <option v-for="g in availableGroups" :key="g.id" :value="g.id">{{ g.name }} (KAPASİTE: {{ g.maxCapacity }})</option>
                 </BaseInput>
              </div>

              <!-- Branş Alt Başlığı (Dinamik - Fitness vb. için) -->
              <div v-if="activeFormData.specialtyId && availableCategories.length > 0" class="col-span-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                 <label class="block text-[0.7rem] font-black text-slate-500 uppercase tracking-widest h-4 flex items-center gap-2">
                   <Target class="w-3 h-3 text-rose-400" /> GENEL EĞİTİM ODAĞI / ALT BAŞLIKLAR (OPSİYONEL)
                 </label>
                 <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="c in availableCategories" :key="c.id"
                      type="button"
                      @click="toggleGlobalCategory(c.id)"
                      :class="activeFormData.categoryIds?.includes(c.id) ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'"
                      class="px-4 py-2.5 border text-[0.65rem] font-black uppercase transition-all rounded-sm flex items-center gap-2 active:scale-95"
                    >
                       <Target v-if="activeFormData.categoryIds?.includes(c.id)" class="w-3 h-3" />
                       {{ c.name }}
                    </button>
                    <div v-if="activeFormData.categoryIds?.length === 0" class="px-4 py-2.5 bg-slate-900/40 border border-slate-800 border-dashed text-slate-600 text-[0.6rem] font-black uppercase rounded-sm flex items-center gap-2 italic">
                       GENEL PROGRAM SEÇİLİ
                    </div>
                 </div>
              </div>

              <BaseInput v-model="activeFormData.instructorId" type="select" label="EĞİTMEN" required>
                <template #icon><ShieldCheck class="w-4 h-4 text-indigo-400" /></template>
                <option value="" disabled>EĞİTMEN SEÇİNİZ</option>
                <option v-for="i in instructors" :key="i.id" :value="i.id">{{ i.fullName || i.displayName || i.user?.username || 'İsimsiz' }}</option>
              </BaseInput>

              <!-- Seans Sayıları -->
              <BaseInput v-model.number="activeFormData.sessionCount" type="number" label="TOPLAM SEANS SAYISI" required min="1">
                <template #icon><Layers class="w-4 h-4 text-amber-500" /></template>
              </BaseInput>

              <BaseInput v-if="showEditModal" v-model.number="activeFormData.remainingSessions" type="number" label="KALAN SEANS SAYISI" required min="0">
                 <template #icon><RefreshCw class="w-4 h-4 text-emerald-500" /></template>
              </BaseInput>

              <!-- Ücret & Tarih -->
              <BaseInput v-model.number="activeFormData.price" type="number" label="TOPLAM PAKET ÜCRETİ (₺)" required min="0">
                <template #icon><DollarSign class="w-4 h-4 text-emerald-500" /></template>
              </BaseInput>

              <BaseInput v-model="activeFormData.startDate" type="date" label="BAŞLANGIÇ TARİHİ" required />

              <BaseInput v-model="activeFormData.expiryDate" type="date" label="BİTİŞ TARİHİ (OPSİYONEL)" />

              <!-- Gün Seçimi -->
              <div class="col-span-2 space-y-3">
                 <label class="block text-[0.7rem] font-black text-slate-500 uppercase tracking-widest h-4">DERS GÜNLERİ</label>
                 <div class="grid grid-cols-4 md:grid-cols-7 gap-2">
                    <button 
                      v-for="(day, idx) in ['Pazar','Pzt','Sal','Çar','Per','Cum','Cmt']" 
                      :key="idx"
                      type="button"
                      @click="toggleDay(idx)"
                      :class="activeFormData.days.includes(idx) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'"
                      class="py-3 border text-[0.65rem] font-bold uppercase tracking-tighter transition-all rounded-sm active:scale-95"
                    >
                      {{ day }}
                    </button>
                 </div>
              </div>

              <!-- Gün Bazlı Çalışma Odakları (Dinamik - Fitness vb. için) -->
              <div v-if="activeFormData.days.length > 0 && availableCategories.length > 0" class="col-span-2 space-y-4 pt-4 border-t border-slate-800/30 animate-in fade-in slide-in-from-top-4">
                 <label class="block text-[0.7rem] font-black text-rose-500 uppercase tracking-widest h-4 flex items-center gap-2">
                    <Target class="w-3 h-3" /> GÜNLERE GÖRE ANTREMAN ODAKLARI (OPSİYONEL)
                 </label>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div v-for="idx in activeFormData.days.slice().sort((a,b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))" :key="idx" 
                         class="bg-slate-900/60 border border-slate-800 p-3 rounded-sm space-y-2.5 hover:border-slate-700 transition-all group/daycat">
                       <span class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest flex items-center justify-between">
                          <span class="flex items-center gap-2">
                             <CalendarCheck class="w-3 h-3 text-indigo-500" />
                             {{ ['Pazar','Pzt','Sal','Çar','Per','Cum','Cmt'][idx] }}
                          </span>
                          <span class="text-slate-600 font-mono text-[0.55rem]">{{ activeFormData.dayCategories[idx]?.length || 0 }} SEÇİLİ</span>
                       </span>
                       <div class="flex flex-wrap gap-1.5">
                          <button 
                            v-for="c in availableCategories" :key="c.id"
                            type="button"
                            @click="toggleDayCategory(idx, c.id)"
                            :class="activeFormData.dayCategories[idx]?.includes(c.id) ? 'bg-rose-600/20 border-rose-500/50 text-rose-400 ring-1 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'"
                            class="px-2 py-1.5 border text-[0.55rem] font-black uppercase transition-all rounded-xs flex items-center gap-1.5 active:scale-95"
                          >
                             <div v-if="activeFormData.dayCategories[idx]?.includes(c.id)" class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1.5s_infinite]"></div>
                             {{ c.name }}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <BaseActionFooter local>
             <BaseButton variant="dark" size="icon" square @click="closeAnyModal" title="VAZGEÇ">
                <template #icon><X class="w-5 h-5" /></template>
             </BaseButton>
             <div class="w-px h-6 bg-slate-800 mx-2"></div>
             <BaseButton 
                :variant="showEditModal ? 'warning' : 'success'" 
                size="icon" 
                square 
                @click="savePackage"
                :loading="loading"
                :title="showEditModal ? 'GÜNCELLE' : 'KAYDET'"
             >
                <template #icon><Check class="w-5 h-5" /></template>
             </BaseButton>
          </BaseActionFooter>
        </div>
      </Transition>

       <!-- Attendance Modal (Redesigned to List View) -->
       <Transition name="fade-slide">
         <div v-if="showAttendanceModal" class="absolute inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
           <BaseSearchFilter
             v-model:searchQuery="attendanceSearchQuery"
             v-model:viewMode="attendanceViewMode"
             placeholder="ÜYE ARA..."
             accent="rose"
           >
             <template #extra-actions>
                <div class="flex items-center bg-slate-900 overflow-hidden h-full rounded-sm">
                   <button 
                     v-for="tab in [
                       { k: 'ALL', l: 'HEPSİ', c: enrolledMembersForAttendance.length, activeClass: 'bg-indigo-600' },
                       { k: 'PRESENT', l: 'GELDİ', c: enrolledMembersForAttendance.filter(m => m.attendanceStatus === 'PRESENT').length, activeClass: 'bg-emerald-600' },
                       { k: 'ABSENT', l: 'GELMEDİ', c: enrolledMembersForAttendance.filter(m => m.attendanceStatus === 'ABSENT').length, activeClass: 'bg-rose-600' },
                       { k: 'EXCUSED', l: 'MAZERET', c: enrolledMembersForAttendance.filter(m => m.attendanceStatus === 'EXCUSED').length, activeClass: 'bg-amber-600' }
                     ]"
                     :key="tab.k"
                     @click="attendanceFilterTab = tab.k"
                     :class="attendanceFilterTab === tab.k ? [tab.activeClass, 'text-white shadow-lg z-10'] : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'"
                     class="px-5 h-full text-[0.65rem] font-black uppercase transition-all flex items-center gap-2 border-r border-slate-800/50 last:border-0"
                   >
                     <span>{{ tab.l }}</span>
                     <span :class="attendanceFilterTab === tab.k ? 'bg-white/20' : 'bg-slate-800'" class="px-2 py-0.5 rounded-full text-[0.55rem]">{{ tab.c }}</span>
                   </button>
                </div>
             </template>
           </BaseSearchFilter>

           <div class="flex-1 relative overflow-hidden mt-2 px-2 pb-2">
             <!-- Card Mode -->
             <BaseScroll v-if="attendanceViewMode === 'grid'" accent="rose" direction="vertical" class="absolute inset-0 p-1">
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                 <BaseCard v-for="m in filteredAttendanceMembers" :key="m.id" accent="rose" :selected="selectedAttendanceRecordIds.includes(m.id)" @click="toggleAttendanceSelection(m.id)" class="group/acard">
                   <div class="flex items-center gap-3 mb-6">
                     <BaseMemberAvatar :name="m.fullName" :src="m.photo" size="md" />
                     <div class="flex flex-col truncate">
                       <span class="text-[0.75rem] font-black text-slate-100 uppercase truncate">{{ m.fullName }}</span>
                       <span class="text-[0.6rem] text-slate-500 font-mono">{{ m.memberCode }}</span>
                     </div>
                   </div>

                    <div class="flex flex-col gap-2 relative min-h-[90px] justify-center">
                       <template v-if="!m.isLocked">
                          <div class="flex gap-1 h-[40px]">
                             <button @click="m.attendanceStatus = 'PRESENT'" :class="m.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800/50'" class="flex-1 flex flex-col items-center justify-center transition-all">
                               <Check class="w-3.5 h-3.5" />
                               <span class="text-[0.5rem] font-black uppercase">GELDİ</span>
                             </button>
                             <button @click="m.attendanceStatus = 'ABSENT'" :class="m.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800/50'" class="flex-1 flex flex-col items-center justify-center transition-all">
                               <X class="w-3.5 h-3.5" />
                               <span class="text-[0.5rem] font-black uppercase">GELMEDİ</span>
                             </button>
                          </div>
                          <button @click="m.attendanceStatus = 'EXCUSED'" :class="m.attendanceStatus === 'EXCUSED' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800/50'" class="w-full h-[40px] flex items-center justify-center gap-2 transition-all">
                            <Info class="w-3.5 h-3.5" />
                            <span class="text-[0.5rem] font-black uppercase">MAZERET</span>
                          </button>
                          <input v-if="m.attendanceStatus === 'EXCUSED'" v-model="m.excuse" type="text" placeholder="MAZERET..." class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.6rem] text-slate-300 outline-none focus:border-amber-500 font-bold uppercase" />
                       </template>
                       <template v-else>
                           <div class="flex flex-col items-center justify-center gap-1 bg-slate-900/50 border border-slate-800 p-3 rounded-sm w-full">
                              <div class="flex items-center gap-2">
                                 <div v-if="m.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-400 font-black text-[0.6rem] uppercase">
                                    <CheckCircle class="w-4 h-4" /> GELDİ
                                 </div>
                                 <div v-else-if="m.attendanceStatus === 'ABSENT'" class="flex items-center gap-2 text-rose-400 font-black text-[0.6rem] uppercase">
                                    <XCircle class="w-4 h-4" /> GELMEDİ
                                 </div>
                                 <div v-else class="flex items-center gap-2 text-amber-400 font-black text-[0.6rem] uppercase">
                                    <Info class="w-4 h-4" /> MAZERET
                                 </div>
                              </div>
                              <p v-if="m.attendanceStatus === 'EXCUSED'" class="text-[0.55rem] text-slate-500 font-bold uppercase truncate max-w-full italic">"{{ m.excuse }}"</p>
                              <span v-if="m.createdAt" class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mt-0.5">{{ new Date(m.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{ new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}</span>
                           </div>
                       </template>
                    </div>
                 </BaseCard>
               </div>
             </BaseScroll>

             <!-- List Mode -->
             <BaseTable 
              v-else
              :columns="[
                { key: 'profile', label: 'ÜYE BİLGİSİ' },
                { key: 'timestamp', label: 'İŞLEM ZAMANI', align: 'center' },
                { key: 'status', label: 'YOKLAMA GİRİŞİ', align: 'right' }
              ]"
              :items="filteredAttendanceMembers"
              :selected-ids="selectedAttendanceRecordIds"
              @rowClick="toggleAttendanceSelection($event.id)"
              accent="rose"
              class="absolute inset-0"
             >
                <template #cell-profile="{ item }">
                  <div class="flex items-center gap-3">
                    <BaseMemberAvatar :name="item.fullName" :src="item.photo" size="sm" />
                    <div class="flex flex-col">
                      <span class="text-[0.7rem] font-black text-slate-100 uppercase">{{ item.fullName }}</span>
                      <span class="text-[0.55rem] text-slate-500 font-mono">{{ item.memberCode }}</span>
                    </div>
                  </div>
                </template>

                 <template #cell-timestamp="{ item }">
                    <div class="flex items-center justify-center h-full">
                       <span v-if="item.createdAt" class="text-[0.65rem] font-bold text-slate-400 font-mono tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-sm shadow-inner whitespace-nowrap">
                          {{ new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{ new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}
                       </span>
                       <span v-else class="text-[0.65rem] font-bold text-slate-600 font-mono tracking-widest opacity-50 px-3 py-1 whitespace-nowrap">
                          --/--/---- --:--
                       </span>
                    </div>
                 </template>

                 <template #cell-status="{ item }">
                   <div class="flex items-center justify-end gap-3 h-[55px]">
                     <template v-if="!item.isLocked">
                       <div v-if="item.attendanceStatus === 'EXCUSED'" class="w-[300px] h-full animate-in fade-in slide-in-from-right-2 duration-300">
                          <input v-model="item.excuse" type="text" placeholder="MAZERET SEBEBİ..." class="w-full h-full bg-slate-950 border border-slate-800 px-4 py-1 text-[0.65rem] text-slate-300 outline-none focus:border-amber-500 font-bold uppercase font-mono tracking-tight" />
                       </div>

                       <div class="flex bg-slate-950 border border-slate-800 p-0.5 rounded-sm h-full w-[450px]">
                         <button @click="item.attendanceStatus = 'PRESENT'" :class="item.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 transition-all border-r border-slate-800/50 flex items-center justify-center gap-2">
                           <Check class="w-4 h-4" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">GELDİ</span>
                         </button>
                         <button @click="item.attendanceStatus = 'ABSENT'" :class="item.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 transition-all border-r border-slate-800/50 flex items-center justify-center gap-2">
                           <X class="w-4 h-4" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">GELMEDİ</span>
                         </button>
                         <button @click="item.attendanceStatus = 'EXCUSED'" :class="item.attendanceStatus === 'EXCUSED' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'" class="flex-1 transition-all flex items-center justify-center gap-2">
                           <Info class="w-4 h-4" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">MAZERET</span>
                         </button>
                       </div>
                     </template>
                     <template v-else>
                        <div class="flex items-center gap-4 bg-slate-900 border border-slate-800 h-full px-6 rounded-sm">
                            <div class="flex items-center gap-10">
                               <div class="flex flex-col justify-center items-start gap-0.5 w-full">
                                  <div v-if="item.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-400 font-black text-[0.65rem] uppercase tracking-widest">
                                     <CheckCircle class="w-4 h-4" /> GELDİ İŞLENDİ
                                  </div>
                                  <div v-else-if="item.attendanceStatus === 'ABSENT'" class="flex items-center gap-2 text-rose-400 font-black text-[0.65rem] uppercase tracking-widest">
                                     <XCircle class="w-4 h-4" /> GELMEDİ İŞLENDİ
                                  </div>
                                  <div v-else class="flex flex-col">
                                     <div class="flex items-center gap-2 text-amber-400 font-black text-[0.65rem] uppercase tracking-widest">
                                        <Info class="w-4 h-4" /> MAZERETLİ İŞLENDİ
                                     </div>
                                     <span class="text-[0.55rem] text-slate-500 font-bold italic truncate max-w-[200px]">"{{ item.excuse }}"</span>
                                  </div>
                               </div>
                            </div>
                        </div>
                     </template>
                   </div>
                 </template>
             </BaseTable>
           </div>

           <BaseActionFooter local>
              <BaseButton variant="dark" size="icon" square @click="showAttendanceModal = false" title="VAZGEÇ">
                 <template #icon><X class="w-5 h-5" /></template>
              </BaseButton>
              <div class="w-px h-6 bg-slate-800 mx-2"></div>
              
              <template v-if="enrolledMembersForAttendance.some(m => m.isLocked && selectedAttendanceRecordIds.includes(m.id))">
                 <BaseButton variant="danger" size="icon" square @click="undoSelectedAttendance" :loading="loading" title="SEÇİLİ YOKLAMALARI DÜZELT (GERİ AL)">
                    <template #icon><RefreshCcw class="w-5 h-5" /></template>
                 </BaseButton>
              </template>
              <template v-else-if="enrolledMembersForAttendance.some(m => !m.isLocked)">
                 <BaseButton variant="success" size="icon" square @click="submitAttendance" :loading="loading" title="YOKLAMAYI KAYDET">
                    <template #icon><CheckCircle class="w-5 h-5" /></template>
                 </BaseButton>
              </template>
           </BaseActionFooter>
         </div>
       </Transition>

    </div>

    <!-- 5. MAIN ACTION FOOTER (Base) -->
    <BaseActionFooter v-if="!showCreateModal && !showEditModal && !showAttendanceModal">
      <div class="flex items-center gap-[10px]">
        <router-link to="/">
           <BaseButton variant="dark" size="icon" square title="GERİ">
              <template #icon><X class="w-5 h-5" /></template>
           </BaseButton>
        </router-link>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <BaseButton variant="primary" size="icon" square @click="openCreateModal" title="YENİ PAKET TANIMLA">
           <template #icon><Plus class="w-5 h-5" /></template>
        </BaseButton>

        <Transition name="fade-slide">
          <div v-if="selectedPackageId" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
            <BaseButton 
               variant="warning" size="icon" square title="YOKLAMA AL"
               @click="openAttendanceModal(packages.find(p => p.id === selectedPackageId))"
            >
               <template #icon><CalendarCheck class="w-5 h-5" /></template>
            </BaseButton>

            <BaseButton 
               variant="secondary" size="icon" square title="DÜZENLE"
               @click="openEditModal(packages.find(p => p.id === selectedPackageId))"
            >
               <template #icon><Edit class="w-5 h-5" /></template>
            </BaseButton>

            <BaseButton 
               variant="danger" size="icon" square title="ARŞİVLE"
               @click="archivePackage(selectedPackageId)"
            >
               <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>

            <BaseButton variant="ghost" size="icon" square @click="selectedPackageId = null" title="SEÇİMİ KALDIR">
               <template #icon><XCircle class="w-5 h-5" /></template>
            </BaseButton>
          </div>
        </Transition>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1 ml-4 bg-slate-900/50 border border-slate-800 p-1">
          <BaseButton 
            variant="dark" size="icon" square 
            :disabled="currentPage === 1"
            @click="fetchPackages({ page: currentPage - 1, search: searchQuery, status: filterStatus, isArchived: showArchived })"
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
            @click="fetchPackages({ page: currentPage + 1, search: searchQuery, status: filterStatus, isArchived: showArchived })"
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
import { ref, computed, onMounted, watch, inject, onUnmounted } from 'vue'
import axios from 'axios'
import { 
  Plus, X, Check, Trash2, Edit, Activity, CalendarCheck, 
  XCircle, DollarSign, ShieldCheck, Layers, RefreshCw, RefreshCcw,
  Info, CheckCircle, User, ChevronLeft, ChevronRight, ChevronDown, Target
} from 'lucide-vue-next'

// Services & Composables
import { privateLessonService } from '../../services/lesson/privateLessonService'
import { attendanceService } from '../../services/lesson/attendanceService'
import { usePrivateLessons } from '../../composables/usePrivateLessons'
import { useAlerts } from '../../utils/alerts'
import Storage from '../../utils/Storage'

// Base Components
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseSwitch from '../../components/base/BaseSwitch.vue'

const { toast, confirm, error: showAlertError } = useAlerts()

const {
  packages,
  totalPackages,
  totalPages,
  currentPage,
  members,
  instructors,
  specialties,
  loading: globalLoading,
  fetchPackages,
  fetchDependencies,
  activePackagesCount,
  totalPurchasedSessions,
  totalCompletedSessions,
  totalRemainingSessionsCount
} = usePrivateLessons()

const pageSubtitle = inject('pageSubtitle', ref(''))

// Multi-step Table Columns
const mainColumns = [
  { key: 'member', label: 'ÜYE BİLGİSİ' },
  { key: 'specialty', label: 'BRANŞ' },
  { key: 'instructor', label: 'EĞİTMEN' },
  { key: 'sessions', label: 'SEANS DURUMU', align: 'center' },
  { key: 'days', label: 'DERS GÜNLERİ', align: 'center' },
  { key: 'price', label: 'ÜCRET', align: 'right' },
  { key: 'status', label: 'DURUM', align: 'center' }
]

// Local State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showAttendanceModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const showArchived = ref(false)
const viewMode = ref('list')
const isFilterOpen = ref(false)
const isFilterDropdownOpen = ref(false)
const activeFilterTab = ref('ALL')
const filterTabs = [
  { id: 'ALL', label: 'TÜM PAKETLER', status: '', archived: false },
  { id: 'ACTIVE', label: 'AKTİF PAKETLER', status: 'ACTIVE', archived: false },
  { id: 'COMPLETED', label: 'TAMAMLANMIŞ', status: 'COMPLETED', archived: false },
  { id: 'ARCHIVED', label: 'ARŞİVLENMİŞ', status: '', archived: true }
]
const selectedPackageId = ref(null)
const loading = ref(false)

// Form states
const form = ref({
  memberId: '',
  specialtyId: '',
  instructorId: '',
  sessionCount: 8,
  price: 0,
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  days: [1, 3, 5],
  sportGroupId: '',
  categoryId: '',
  dayCategories: {},
  categoryIds: []
})

const availableGroups = ref([])
const availableCategories = ref([])
const loadingGroups = ref(false)

const editForm = ref({
  id: '',
  memberName: '',
  memberPhoto: '',
  specialtyId: '',
  instructorId: '',
  sessionCount: 0,
  remainingSessions: 0,
  price: 0,
  startDate: '',
  expiryDate: '',
  days: [],
  sportGroupId: '',
  categoryId: '',
  dayCategories: {},
  categoryIds: []
})

watch(showCreateModal, (val) => {
  if (val) pageSubtitle.value = 'YENİ PAKET'
  else if (!showEditModal.value && !showAttendanceModal.value) pageSubtitle.value = ''
})

watch(showEditModal, (val) => {
  if (val) pageSubtitle.value = 'DÜZENLE'
  else if (!showCreateModal.value && !showAttendanceModal.value) pageSubtitle.value = ''
})

watch(showAttendanceModal, (val) => {
  if (val) pageSubtitle.value = 'YOKLAMA'
  else if (!showCreateModal.value && !showEditModal.value) pageSubtitle.value = ''
})

onUnmounted(() => {
  pageSubtitle.value = ''
})

const enrolledMembersForAttendance = ref([])
const attendanceSearchQuery = ref('')
const attendanceFilterTab = ref('ALL')
const attendanceViewMode = ref('list')
const selectedAttendanceRecordIds = ref([])
const attendancePackage = ref(null)

const branchCategory = ref('STANDARD')
const standardSpecialties = computed(() => specialties.value.filter(s => !s.hasBelts))
const beltSpecialties = computed(() => specialties.value.filter(s => s.hasBelts))

// Computed
const activeFormData = computed(() => showEditModal.value ? editForm.value : form.value)

watch(branchCategory, (newVal) => {
   const currentSpec = specialties.value.find(s => s.id === activeFormData.value.specialtyId)
   if (currentSpec) {
      const specCategory = currentSpec.hasBelts ? 'BELT' : 'STANDARD'
      if (specCategory === newVal) return
   }
   activeFormData.value.specialtyId = ''
   activeFormData.value.sportGroupId = ''
})

const fetchGroups = async (specId) => {
  if (!specId) {
    availableGroups.value = []
    availableCategories.value = []
    return
  }
  loadingGroups.value = true
  try {
    const token = Storage.getItem('token')
    const currentSpec = specialties.value.find(s => s.id === specId)
    const isStandard = currentSpec && !currentSpec.hasBelts

    // Fetch Sport Groups (Takım/Grup)
    const groupRes = await axios.get(`http://${window.location.hostname}:5000/api/sport-groups`, {
      params: { specialtyId: specId },
      headers: { Authorization: `Bearer ${token}` }
    })
    availableGroups.value = groupRes.data

    // Fetch Exercise Categories (Alt Branş: Göğüs, Sırt vs.) if applicable
    if (isStandard) {
        const catRes = await axios.get(`http://${window.location.hostname}:5000/api/exercise-categories`, {
          params: { specialtyId: specId },
          headers: { Authorization: `Bearer ${token}` }
        })
        availableCategories.value = catRes.data
    } else {
        availableCategories.value = []
    }
  } catch (err) {
    console.error('Alt gruplar/kategoriler getirilemedi:', err)
  } finally {
    loadingGroups.value = false
  }
}

watch(() => activeFormData.value.specialtyId, (newId) => {
  fetchGroups(newId)
})


const filteredAttendanceMembers = computed(() => {
  let list = enrolledMembersForAttendance.value
  if (attendanceFilterTab.value === 'PRESENT') list = list.filter(m => m.attendanceStatus === 'PRESENT')
  else if (attendanceFilterTab.value === 'ABSENT') list = list.filter(m => m.attendanceStatus === 'ABSENT')
  else if (attendanceFilterTab.value === 'EXCUSED') list = list.filter(m => m.attendanceStatus === 'EXCUSED')

  if (attendanceSearchQuery.value) {
    const query = attendanceSearchQuery.value.toLowerCase()
    list = list.filter(member => 
      member.fullName?.toLowerCase().includes(query) || 
      member.memberCode?.toLowerCase().includes(query)
    )
  }
  return list
})

const eligibleMembers = computed(() => {
  const result = members.value.filter(m => {
    // Profil tipini esnek kontrol et (büyük/küçük harf)
    const isMember = m.profileType?.toUpperCase() === 'MEMBER'
    const isActive = m.isActive !== false
    
    // Ders tiplerini kontrol et (Dizi mi değil mi amca yap)
    let types = m.lessonTypes
    if (typeof types === 'string') {
       try { types = JSON.parse(types) } catch(e) { types = [] }
    }
    const hasPrivate = Array.isArray(types) && types.includes('PRIVATE')
    
    if (!isMember || !isActive || !hasPrivate) {
       // console.log(`Member EXCLUDED: ${m.fullName} - isMember:${isMember}, isActive:${isActive}, hasPrivate:${hasPrivate}`)
    }
    
    return isMember && isActive && hasPrivate
  })
  
  if (members.value.length > 0 && result.length === 0) {
     console.warn('ELIGIBLE MEMBERS EMPTY BUT MEMBERS EXIST:', members.value.length)
     console.log('SAMPLE DATA FOR FILTER:', members.value[0])
  }
  
  return result
})

const filteredPackages = computed(() => packages.value || [])

// Watch for search/filters
let debounceTimer;
watch([searchQuery, filterStatus, showArchived], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchPackages({ 
      page: 1, 
      search: searchQuery.value, 
      status: filterStatus.value,
      isArchived: showArchived.value
    })
  }, 300);
});

// Methods
const toggleSelection = (id) => {
  selectedPackageId.value = selectedPackageId.value === id ? null : id
}

const toggleDay = (idx) => {
  const target = activeFormData.value.days
  const i = target.indexOf(idx)
  if (i === -1) {
    target.push(idx)
    if (!activeFormData.value.dayCategories) activeFormData.value.dayCategories = {}
    if (!activeFormData.value.dayCategories[idx]) activeFormData.value.dayCategories[idx] = []
  } else {
    target.splice(i, 1)
  }
}

const toggleDayCategory = (dayIdx, catId) => {
  if (!activeFormData.value.dayCategories) activeFormData.value.dayCategories = {}
  if (!activeFormData.value.dayCategories[dayIdx]) activeFormData.value.dayCategories[dayIdx] = []
  
  const dayCats = activeFormData.value.dayCategories[dayIdx]
  const i = dayCats.indexOf(catId)
  if (i === -1) dayCats.push(catId)
  else dayCats.splice(i, 1)
}

const toggleGlobalCategory = (catId) => {
  const target = activeFormData.value.categoryIds || []
  const i = target.indexOf(catId)
  if (i === -1) target.push(catId)
  else target.splice(i, 1)
  activeFormData.value.categoryIds = [...target]
}

const openCreateModal = () => {
  selectedPackageId.value = null
  branchCategory.value = 'STANDARD'
  selectedPackageId.value = null
  branchCategory.value = 'STANDARD'
  availableGroups.value = []
  showCreateModal.value = true
}

const openEditModal = (pkg) => {
  editForm.value = {
    id: pkg.id,
    memberName: pkg.member?.fullName,
    memberPhoto: pkg.member?.photo,
    specialtyId: pkg.specialtyId,
    instructorId: pkg.instructorId,
    sessionCount: pkg.sessionCount,
    remainingSessions: pkg.remainingSessions,
    price: pkg.price,
    startDate: pkg.startDate,
    expiryDate: pkg.expiryDate || '',
    days: pkg.days || [],
    sportGroupId: pkg.sportGroupId || '',
    categoryId: pkg.categoryId || '',
    dayCategories: pkg.dayCategories || {},
    categoryIds: pkg.categoryIds || []
  }
  
  const spec = specialties.value.find(s => s.id === pkg.specialtyId)
  branchCategory.value = spec?.hasBelts ? 'BELT' : 'STANDARD'
  if (pkg.specialtyId) fetchGroups(pkg.specialtyId)
  showEditModal.value = true
}

const openAttendanceModal = async (pkg) => {
   attendancePackage.value = pkg
   selectedAttendanceRecordIds.value = []
   loading.value = true
   try {
     const date = new Date().toISOString().split('T')[0]
     const data = await attendanceService.getPrivateAttendance(pkg.id, date)
     const existing = data && data.length > 0 ? data[0] : null
     
     enrolledMembersForAttendance.value = pkg.member ? [{
       ...pkg.member,
       attendanceStatus: existing ? existing.status : 'PRESENT',
       attendanceId: existing ? existing.id : null,
       excuse: existing ? existing.excuse : '',
       isLocked: !!existing,
       createdAt: existing ? existing.createdAt : null
     }] : []
     showAttendanceModal.value = true
   } catch (err) {
     toast(err.response?.data?.message || 'Yoklama durumu kontrol edilemedi', 'error')
   } finally { loading.value = false }
}

const closeAnyModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showAttendanceModal.value = false
  form.value = {
    memberId: '', specialtyId: '', instructorId: '', sessionCount: 8,
    price: 0, startDate: new Date().toISOString().split('T')[0],
    expiryDate: '', days: [1, 3, 5],
    sportGroupId: '', categoryId: '',
    dayCategories: {}, categoryIds: []
  }
}

const savePackage = async () => {
  const data = activeFormData.value
  if (!data.specialtyId || !data.instructorId || !data.sessionCount) {
    toast('Lütfen tüm zorunlu alanları doldurun.', 'warning')
    return
  }
  loading.value = true
  try {
    if (showEditModal.value) await privateLessonService.updatePackage(data.id, data)
    else await privateLessonService.createPackage(data)
    
    toast('Paket kaydedildi.')
    closeAnyModal()
    fetchPackages()
  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'İşlem başarısız.'
    showAlertError('HATA', errorMsg)
  } finally { loading.value = false }
}

const archivePackage = async (id) => {
  const isConfirmed = await confirm('ARŞİVLEME ONAYI', 'Bu paketi arşivlemek istediğinize emin misiniz?')
  if (isConfirmed) {
    try {
      await privateLessonService.archivePackage(id)
      selectedPackageId.value = null
      fetchPackages()
      toast('Paket arşivlendi.')
    } catch (err) {
      showAlertError('HATA', err.response?.data?.message || 'Arşivleme başarısız.')
    }
  }
}

const toggleAttendanceSelection = (id) => {
  const i = selectedAttendanceRecordIds.value.indexOf(id)
  if (i === -1) selectedAttendanceRecordIds.value.push(id)
  else selectedAttendanceRecordIds.value.splice(i, 1)
}

const undoSelectedAttendance = async () => {
  const isConfirmed = await confirm('DÜZELTME ONAYI', 'Seçili yoklama kayıtları silinecektir. Emin misiniz?')
  if (!isConfirmed) return

  loading.value = true
  try {
     const promises = enrolledMembersForAttendance.value
      .filter(m => m.isLocked && selectedAttendanceRecordIds.value.includes(m.id))
      .map(m => attendanceService.deletePrivateAttendance(m.attendanceId))
     
     await Promise.all(promises)
     toast('Yoklama kayıtları silindi.')
     openAttendanceModal(attendancePackage.value)
     fetchPackages()
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'İşlem başarısız.')
  } finally { loading.value = false }
}

const submitAttendance = async () => {
  const records = enrolledMembersForAttendance.value.filter(m => !m.isLocked)
  if (records.length === 0) return

  const isConfirmed = await confirm('KAYIT ONAYI', 'Yoklama kaydedilsin mi?')
  if (!isConfirmed) return

  loading.value = true
  try {
     const promises = records.map(m => attendanceService.submitPrivateAttendance({
        packageId: attendancePackage.value.id,
        memberId: m.id,
        status: m.attendanceStatus,
        excuse: m.attendanceStatus === 'EXCUSED' ? m.excuse : '',
        date: new Date().toISOString().split('T')[0]
     }))
     
     await Promise.all(promises)
     toast('Yoklama başarıyla kaydedildi.')
     openAttendanceModal(attendancePackage.value)
     fetchPackages()
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'İşlem başarısız.')
  } finally { loading.value = false }
}

const getDayName = (idx) => {
  const days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']
  return days[idx] || ''
}

const getDayStyle = (idx) => {
   const colors = [
     'bg-rose-500/10 border-rose-500/20 text-rose-400',
     'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
     'bg-amber-500/10 border-amber-500/20 text-amber-400',
     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
     'bg-blue-500/10 border-blue-500/20 text-blue-400',
     'bg-violet-500/10 border-violet-500/20 text-violet-400',
     'bg-orange-500/10 border-orange-500/20 text-orange-400'
   ]
   return colors[idx] || 'bg-slate-900 border-slate-800 text-slate-500'
}

onMounted(() => {
  fetchPackages({ page: 1 })
  fetchDependencies()
  
  window.addEventListener('click', () => {
    isFilterDropdownOpen.value = false
  })
})
</script>
