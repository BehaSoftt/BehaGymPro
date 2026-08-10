<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative">
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 1. HEADER (Global: Search & View Toggle) -->
      <BaseSearchFilter
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        :viewMode="viewMode"
        @update:viewMode="viewMode = $event"
        placeholder="ÜYE ARA (İSİM VEYA KOD)..."
        :showToggles="true"
        class="!overflow-visible z-50"
      >
        <template #extra-left>
          <div class="h-full relative flex items-center group z-[60]">
            <button 
              type="button"
              @click.stop="isTabDropdownOpen = !isTabDropdownOpen"
              class="h-full px-4 flex items-center gap-2 hover:bg-slate-900/80 transition-all text-[0.65rem] font-black text-rose-400 uppercase cursor-pointer"
            >
              <span>{{ tabs.find(t => t.id === activeTab)?.label || 'FİLTRE' }}</span>
              <ChevronDown class="w-3 h-3 text-rose-500/50 transition-transform duration-300" :class="{ 'rotate-180': isTabDropdownOpen }" />
            </button>

            <!-- Custom Dropdown Panel -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div v-if="isTabDropdownOpen" 
                class="absolute top-full left-0 mt-1 w-64 bg-slate-900 border-2 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] p-1.5"
                @click.stop
              >
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id; isTabDropdownOpen = false"
                  :class="activeTab === tab.id ? 'bg-slate-800 text-rose-400 border-rose-500/40' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-800'"
                  class="w-full flex items-center justify-between px-3 py-2.5 text-[0.65rem] font-bold tracking-widest border transition-all text-left mb-1 shadow-md bg-slate-900"
                >
                  <div class="flex items-center gap-3">
                    <component :is="tab.icon" class="w-3.5 h-3.5 opacity-50" />
                    {{ tab.label }}
                  </div>
                  <div v-if="activeTab === tab.id" class="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                </button>
              </div>
            </transition>
          </div>
        </template>
      </BaseSearchFilter>

      <!-- CONTENT AREA -->
    <div class="flex-1 relative overflow-hidden">
        <!-- A. LIST VIEW -->
        <div :class="{'opacity-20 pointer-events-none scale-95': showDetailModal}" class="h-full flex flex-col p-[10px] pt-0 transition-all duration-500 origin-center">
          
          <!-- Static Analysis Cards (Neon) -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-2">
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl neon-box-sky flex items-center gap-4 group hover:bg-slate-900/80 transition-all">
              <div class="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                <User class="w-6 h-6 text-sky-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
              </div>
              <div>
                <p class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">TOPLAM ÜYE</p>
                <p class="text-xl font-black text-white leading-tight tabular-nums">{{ filteredMembers.length }}</p>
              </div>
            </div>
            
            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl neon-box-emerald flex items-center gap-4 group hover:bg-slate-900/80 transition-all">
              <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp class="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div>
                <p class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ORT. İLERLEME</p>
                <p class="text-xl font-black text-white leading-tight tabular-nums">%{{ filteredMembers.length ? Math.round(filteredMembers.reduce((acc, m) => acc + calculateProgress(m), 0) / filteredMembers.length) : 0 }}</p>
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl neon-box-rose flex items-center gap-4 group hover:bg-slate-900/80 transition-all">
              <div class="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
                <TrendingDown class="w-6 h-6 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              </div>
              <div>
                <p class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">KİLO KAYBI</p>
                <p class="text-xl font-black text-white leading-tight tabular-nums">{{ filteredMembers.reduce((acc, m) => acc + (m.startingWeight - (latestStats[m.id]?.weight || m.weight || m.startingWeight)), 0).toFixed(1) }} KG</p>
              </div>
            </div>

            <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl neon-box-indigo flex items-center gap-4 group hover:bg-slate-900/80 transition-all">
              <div class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Activity class="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </div>
              <div>
                <p class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ANALİZ BEKLEYEN</p>
                <p class="text-xl font-black text-white leading-tight tabular-nums">{{ filteredMembers.length }}</p>
              </div>
            </div>
          </div>

          <BaseTable
            :columns="memberColumns"
            :items="filteredMembers"
            :loading="loading"
            :selectedId="selectedMember?.id"
            accent="rose"
            @rowClick="selectMember"
          >
            <template #cell-selection="{ item }">
               <div class="flex justify-center">
                  <div class="w-4 h-4 border border-slate-700 flex items-center justify-center transition-all"
                       :class="selectedMember?.id === item.id ? 'bg-rose-600 border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.3)]' : 'bg-slate-900 shadow-inner'">
                    <Check v-if="selectedMember?.id === item.id" class="w-3 h-3 text-white" />
                  </div>
               </div>
            </template>

            <template #cell-profile="{ item }">
              <div class="flex items-center gap-3">
                <BaseMemberAvatar 
                  :src="item.photo" 
                  :name="item.fullName" 
                  size="sm"
                />
                <span class="text-slate-100 font-black uppercase text-[0.65rem] tracking-tight">{{ item.fullName }}</span>
              </div>
            </template>

            <template #cell-goals="{ item }">
              <BaseScroll accent="rose" :maskSize="15">
                <div class="flex gap-1 justify-center py-1">
                   <BaseBadge v-for="goal in item.fitnessGoals" :key="goal" :type="goal === 'Zayıflamak' ? 'rose' : 'emerald'" class="whitespace-nowrap text-[0.5rem]">
                     {{ goal === 'Zayıflamak' ? 'ZAYIFLA' : 'KİLO AL' }}
                   </BaseBadge>
                </div>
              </BaseScroll>
            </template>

            <template #cell-currentWeight="{ item }">
              <span class="text-indigo-400 font-black tabular-nums text-[0.7rem]">
                {{ latestStats[item.id]?.weight || item.weight || '-' }} KG
              </span>
            </template>

            <template #cell-targetWeight="{ item }">
              <span class="text-rose-500 font-black tabular-nums text-[0.7rem]">{{ item.targetWeight || '-' }} KG</span>
            </template>

            <template #cell-remaining="{ item }">
               <span class="text-emerald-400 font-black tabular-nums text-[0.7rem]">
                 {{ calculateRemaining(item) }} KG
               </span>
            </template>

            <template #cell-progress="{ item }">
              <div class="w-full max-w-[120px] mx-auto space-y-1.5 py-2">
                <div class="h-2 bg-slate-950/80 border border-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                  <div class="h-full rounded-full transition-all duration-1000 animate-pulse-slow" 
                       :class="activeTab === 'lose' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'"
                       :style="{ width: calculateProgress(item) + '%' }"></div>
                </div>
                <div class="flex items-center justify-between px-1">
                   <span class="text-[0.6rem] font-black text-slate-300 tabular-nums uppercase tracking-tighter">{{ calculateProgress(item) }}%</span>
                   <span class="text-[0.5rem] font-bold text-slate-600 uppercase">BAŞARI</span>
                </div>
              </div>
            </template>

            <template #cell-bmi="{ item }">
              <div class="flex flex-col items-center gap-0.5" v-if="latestStats[item.id]">
                <span :class="getBMIStatus(latestStats[item.id].bmi).color" class="text-[0.6rem] font-black uppercase tracking-tighter">
                  {{ getBMIStatus(latestStats[item.id].bmi).label }}
                </span>
                <span class="text-[0.5rem] text-slate-500 font-bold tabular-nums">BKİ: {{ latestStats[item.id].bmi }}</span>
              </div>
              <span v-else class="text-slate-600">-</span>
            </template>

            <template #cell-tdee="{ item }">
              <div class="flex flex-col items-center gap-0.5" v-if="latestStats[item.id]">
                <span class="text-amber-500 text-[0.65rem] font-black tabular-nums">{{ latestStats[item.id].tdee }} KCAL</span>
                <span class="text-[0.5rem] text-slate-600 font-bold uppercase tracking-tighter">GÜNLÜK HEDEF</span>
              </div>
              <span v-else class="text-slate-600">-</span>
            </template>
          </BaseTable>
        </div>
      <div v-if="showDetailModal" class="absolute inset-0 flex flex-col bg-slate-900 overflow-hidden">
          <div class="flex-1 overflow-y-auto p-2 lg:p-4 custom-scrollbar space-y-4">
              <!-- Indicators (Only in List View) -->
              <div v-if="viewMode === 'list'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- BKİ CARD -->
                  <div class="bg-slate-900/40 p-5 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center relative group overflow-hidden transition-all hover:border-indigo-500/50 rounded-lg">
                      <div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Activity class="w-16 h-16 text-indigo-500 -mr-4 -mt-4 rotate-12" />
                      </div>
                      <span class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">BKİ ANALİZİ</span>
                      <div class="flex items-center gap-3 mb-4">
                        <span class="text-3xl font-black text-white tracking-tighter">{{ lastMeasurement?.bmi || '-' }}</span>
                        <div class="h-8 w-px bg-slate-800"></div>
                        <span v-if="lastMeasurement" class="text-[0.45rem] font-black uppercase tracking-[0.2em] px-2 py-1 bg-slate-950 border border-slate-800 rounded" :class="getBmiClass(lastMeasurement.bmi)">
                          {{ lastMeasurement.bmiCategory }}
                        </span>
                      </div>
                      <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500" :style="{width: (lastMeasurement?.bmi ? Math.min((lastMeasurement.bmi/40)*100, 100) : 0) + '%'}"></div>
                      </div>
                  </div>

                  <!-- BMR CARD -->
                  <div class="bg-slate-900/40 p-5 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center relative group overflow-hidden transition-all hover:border-emerald-500/50 rounded-lg">
                      <div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Zap class="w-16 h-16 text-emerald-500 -mr-4 -mt-4 -rotate-12" />
                      </div>
                      <span class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">BAZAL (BMR)</span>
                      <div class="flex items-baseline gap-2 mb-4">
                          <span class="text-3xl font-black text-white tracking-tighter">{{ lastMeasurement?.bmr || '-' }}</span>
                          <span class="text-[0.6rem] text-emerald-500 font-black italic tracking-widest uppercase">KCAL</span>
                      </div>
                      <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" :style="{width: (lastMeasurement?.bmr ? Math.min((lastMeasurement.bmr/3000)*100, 100) : 0) + '%'}"></div>
                      </div>
                  </div>

                  <!-- TARGET CARD -->
                  <div class="bg-slate-900/40 p-5 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center relative group overflow-hidden transition-all hover:border-rose-500/50 rounded-lg">
                      <div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <TrendingDown class="w-16 h-16 text-rose-500 -mr-4 -mt-4 rotate-45" />
                      </div>
                      <span class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">HEDEFE KALAN</span>
                      <div class="flex items-baseline gap-2 mb-4">
                          <span class="text-3xl font-black text-rose-500 tracking-tighter tabular-nums italic leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">{{ activeMember?.weight && activeMember?.targetWeight ? Math.abs(activeMember.weight - activeMember.targetWeight).toFixed(1) : '-' }}</span>
                          <span class="text-[0.6rem] text-rose-500 font-black italic tracking-widest uppercase ml-1">KG</span>
                      </div>
                      <div class="w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-500" :style="{width: (Math.max(0, 100 - calculateProgress(activeMember)) || 0) + '%'}"></div>
                      </div>
                  </div>
              </div>

              <!-- PROGRESS COMPARISON REPORT -->
              <div v-if="progressReport" class="p-6 bg-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden group">
                  <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
                  <div class="flex items-center gap-4 mb-6 relative z-10">
                    <div class="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                      <TrendingUp class="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <span class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.3em] block mb-0.5">VÜCUT ANALİZ ÖZETİ</span>
                      <h3 class="text-lg font-black text-white italic tracking-tighter uppercase whitespace-nowrap flex items-center gap-2">
                        GELİŞİM RAPORU 
                        <span class="text-[0.6rem] normal-case font-medium text-slate-500 tracking-normal">(İlk vs Son Ölçüm)</span>
                      </h3>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
                    <div v-for="item in progressReport" :key="item.label" class="bg-slate-950/40 p-4 border border-slate-800 hover:border-indigo-500/50 transition-all group/item shadow-lg">
                      <p class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.1em] mb-3 group-hover/item:text-indigo-400 transition-colors">{{ item.label }}</p>
                      <div class="flex items-end justify-between">
                        <div class="flex flex-col">
                          <span class="text-[0.45rem] text-slate-600 font-black uppercase">BAŞLANGIÇ</span>
                          <span class="text-xs font-black text-slate-400 tabular-nums">{{ item.first }}<span class="text-[0.4rem] ml-0.5">{{ item.unit }}</span></span>
                        </div>
                        <ChevronRight class="w-3 h-3 text-slate-800" />
                        <div class="flex flex-col items-end">
                          <span class="text-[0.45rem] text-slate-600 font-black uppercase">GÜNCEL</span>
                          <span class="text-base font-black text-white tabular-nums italic tracking-tighter leading-none">{{ item.last }}<span class="text-[0.45rem] ml-0.5 uppercase not-italic">{{ item.unit }}</span></span>
                        </div>
                      </div>
                      <div class="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                        <span class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">DEĞİŞİM</span>
                        <span :class="Number(item.diff) > 0 ? 'text-emerald-500' : Number(item.diff) < 0 ? 'text-rose-500' : 'text-slate-600'" class="text-xs font-black tabular-nums">
                          {{ Number(item.diff) > 0 ? '+' : '' }}{{ item.diff }}
                        </span>
                      </div>
                    </div>
                  </div>
              </div>

              <!-- Inline Form using BaseInput -->
              <div v-if="showAddForm" class="p-6 bg-slate-900 border-2 border-emerald-500/20 animate-in fade-in zoom-in-95 duration-300 shadow-2xl relative">
                  <div class="absolute -top-3 left-6 bg-emerald-600 px-3 py-1 text-[0.55rem] font-black text-white uppercase tracking-[0.3em] shadow-lg">YENİ ÖLÇÜM</div>
                  <div class="space-y-6">
                    <!-- 1. Temel Bilgiler -->
                    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        <BaseInput v-model="newMeasurement.weight" type="number" label="KİLO (KG)" placeholder="0.0"><template #icon><Scale class="w-3 h-3" /></template></BaseInput>
                        <BaseInput v-model="newMeasurement.period" type="select" label="PERİYOD">
                          <template #icon><Activity class="w-3 h-3" /></template>
                          <option value="Haftalık">Haftalık</option>
                          <option value="Aylık">Aylık</option>
                        </BaseInput>
                        <BaseInput :modelValue="activeMember?.height" label="BOY" disabled><template #icon><Ruler class="w-3 h-3" /></template></BaseInput>
                        <BaseInput :modelValue="newMeasurement.fatPercentage" label="YAĞ (%)" disabled placeholder="AUTO"><template #icon><Droplet class="w-3 h-3" /></template></BaseInput>
                        <BaseInput :modelValue="newMeasurement.muscleMass" label="KAS (KG)" disabled placeholder="AUTO"><template #icon><Dumbbell class="w-3 h-3" /></template></BaseInput>
                        <BaseInput v-model="newMeasurement.measurementDate" type="date" label="TARİH"><template #icon><Activity class="w-3 h-3" /></template></BaseInput>
                    </div>

                    <!-- 2. Üst Vücut -->
                    <div class="border-t border-slate-800 pt-4">
                        <div class="text-[0.55rem] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                           <div class="w-1 h-1 bg-indigo-500 rounded-full"></div> ÜST VÜCUT ÖLÇÜMLERİ
                        </div>
                        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            <BaseInput v-model="newMeasurement.neck" type="number" label="BOYUN (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.shoulder" type="number" label="OMUZ (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.chest" type="number" label="GÖĞÜS (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.waist" type="number" label="BEL (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.hips" type="number" label="KALÇA (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.wrist" type="number" label="BİLEK (CM)" placeholder="0.0" />
                        </div>
                    </div>

                    <!-- 3. Kollar -->
                    <div class="border-t border-slate-800 pt-4">
                        <div class="text-[0.55rem] font-black text-rose-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                           <div class="w-1 h-1 bg-rose-500 rounded-full"></div> KOL ÖLÇÜMLERİ
                        </div>
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <BaseInput v-model="newMeasurement.leftBicep" type="number" label="SOL PAZU (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightBicep" type="number" label="SAĞ PAZU (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.leftForearm" type="number" label="SOL ÖN KOL (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightForearm" type="number" label="SAĞ ÖN KOL (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.leftTricep" type="number" label="SOL ARKA KOL (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightTricep" type="number" label="SAĞ ARKA KOL (CM)" placeholder="0.0" />
                        </div>
                    </div>

                    <!-- 4. Bacaklar -->
                    <div class="border-t border-slate-800 pt-4">
                        <div class="text-[0.55rem] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                           <div class="w-1 h-1 bg-emerald-500 rounded-full"></div> BACAK ÖLÇÜMLERİ
                        </div>
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <BaseInput v-model="newMeasurement.leftThigh" type="number" label="SOL ÖN BACAK (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightThigh" type="number" label="SAĞ ÖN BACAK (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.leftHamstring" type="number" label="SOL ARKA BACAK (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightHamstring" type="number" label="SAĞ ARKA BACAK (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.leftCalf" type="number" label="SOL BALDIR (CM)" placeholder="0.0" />
                            <BaseInput v-model="newMeasurement.rightCalf" type="number" label="SAĞ BALDIR (CM)" placeholder="0.0" />
                        </div>
                    </div>
                  </div>

                  </div>
              </div>

              <!-- History View (Selection Logic Added) -->
              <div class="pb-20">
                  <div v-if="measurements?.length > 0">
                      <!-- List Mode (Table) -->
                      <div v-if="viewMode === 'list'" class="border border-slate-700 bg-slate-950/30 shadow-2xl overflow-hidden backdrop-blur-sm">
                          <BaseTable
                            :columns="measurementColumns"
                            :items="measurements"
                            :selectedId="selectedMeasurementId"
                            @rowClick="selectedMeasurementId = selectedMeasurementId === $event.id ? null : $event.id"
                            accent="rose"
                          >
                            <template #cell-date="{ item }">
                               <span class="font-mono text-slate-400 text-[0.6rem]">{{ new Date(item.measurementDate).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'}) }}</span>
                            </template>
                            <template #cell-measurements="{ item }">
                               <span class="font-black text-slate-50 tracking-tighter">{{ item.height }}<span class="text-[0.45rem] opacity-50 ml-0.5">CM</span> / {{ item.weight }}<span class="text-[0.45rem] opacity-50 ml-0.5">KG</span></span>
                            </template>
                            <template #cell-period="{ item }">
                               <span class="text-[0.6rem] font-black text-amber-500 uppercase tracking-tighter">{{ item.period || '-' }}</span>
                            </template>
                            <template #cell-chest="{ item }">
                               <span class="font-black text-rose-400 tabular-nums text-[0.65rem]">{{ item.chest || '-' }}<span class="text-[0.4rem] opacity-50 ml-0.5">CM</span></span>
                            </template>
                            <template #cell-waist="{ item }">
                               <span class="font-black text-indigo-400 tabular-nums text-[0.65rem]">{{ item.waist || '-' }}<span class="text-[0.4rem] opacity-50 ml-0.5">CM</span></span>
                            </template>
                            <template #cell-hips="{ item }">
                               <span class="font-black text-emerald-400 tabular-nums text-[0.65rem]">{{ item.hips || '-' }}<span class="text-[0.4rem] opacity-50 ml-0.5">CM</span></span>
                            </template>
                            <template #cell-arms="{ item }">
                               <div class="flex items-center justify-center gap-1.5">
                                 <span class="text-rose-500 font-black text-[0.6rem]">{{ item.rightBicep || '-' }}</span>
                                 <span class="text-slate-700">/</span>
                                 <span class="text-rose-500 font-black text-[0.6rem]">{{ item.leftBicep || '-' }}</span>
                               </div>
                            </template>
                            <template #cell-bmi="{ item }">
                                <div class="flex flex-col items-center gap-0.5">
                                    <span class="text-indigo-400 font-black text-sm tracking-tighter">{{ item.bmi }}</span>
                                    <span class="text-[0.4rem] font-black uppercase px-2 py-0.5 bg-black/40 border border-slate-700" :class="getBmiClass(item.bmi)">{{ item.bmiCategory }}</span>
                                </div>
                            </template>
                            <template #cell-bmr="{ item }">
                                <span class="font-black text-slate-100 text-sm tracking-tighter">{{ item.bmr }}</span>
                            </template>
                          </BaseTable>
                      </div>

                      <!-- Grid Mode (Cards with Integrated Indicators) -->
                      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        <div v-for="m in measurements" :key="m.id"
                             @click="selectedMeasurementId = selectedMeasurementId === m.id ? null : m.id"
                             class="p-4 border-2 bg-slate-950/60 relative group cursor-pointer transition-all hover:border-rose-500/50 shadow-2xl"
                             :class="selectedMeasurementId === m.id ? 'border-rose-600 bg-rose-600/10 shadow-rose-900/40' : 'border-slate-700'">
                           
                           <!-- Date & Marker -->
                           <div class="flex justify-between items-start mb-4">
                             <div class="flex items-center gap-2">
                               <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                               <div class="text-[0.6rem] font-black text-slate-100 uppercase tracking-[0.2em]">{{ new Date(m.measurementDate).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'}) }}</div>
                             </div>
                             <div class="w-3 h-3 border-2" :class="selectedMeasurementId === m.id ? 'border-rose-500 bg-rose-600/40' : 'border-slate-800'"></div>
                           </div>

                           <!-- Core Stats -->
                           <div class="grid grid-cols-3 gap-3 mb-4 bg-slate-900/50 p-2.5 border border-slate-800/50">
                              <div class="flex flex-col">
                                <span class="text-[0.45rem] text-slate-500 font-bold uppercase tracking-widest mb-1">BOY</span>
                                <span class="text-xs font-black text-slate-100 tabular-nums">{{ m.height }}<span class="text-[0.45rem] opacity-40 ml-0.5">CM</span></span>
                              </div>
                              <div class="flex flex-col">
                                <span class="text-[0.45rem] text-slate-500 font-bold uppercase tracking-widest mb-1">KİLO</span>
                                <span class="text-xs font-black text-slate-100 tabular-nums">{{ m.weight }}<span class="text-[0.45rem] opacity-40 ml-0.5">KG</span></span>
                              </div>
                             <div class="flex flex-col">
                                <span class="text-[0.45rem] text-amber-500 font-bold uppercase tracking-widest mb-1">PERİYOD</span>
                                <span class="text-xs font-black text-slate-100 uppercase">{{ m.period || '-' }}</span>
                              </div>
                           </div>

                           <!-- Stacked Indicators -->
                           <div class="space-y-3 pt-3 border-t border-slate-800">
                             <!-- BKİ -->
                             <div class="flex justify-between items-center">
                               <span class="text-[0.5rem] text-slate-50 font-black tracking-widest">BKİ ANALİZİ</span>
                               <div class="flex items-center gap-2 text-right">
                                  <span class="text-sm font-black text-indigo-400 tracking-tighter leading-none">{{ m.bmi }}</span>
                                  <span class="text-[0.35rem] font-black uppercase px-2 py-0.5 bg-slate-900 border border-slate-800" :class="getBmiClass(m.bmi)">{{ m.bmiCategory }}</span>
                               </div>
                             </div>
                             <!-- BMR -->
                             <div class="flex justify-between items-center">
                               <span class="text-[0.5rem] text-slate-50 font-black tracking-widest">BAZAL (BMR)</span>
                               <span class="text-xs font-black text-emerald-400 tracking-tighter">{{ m.bmr }} <span class="text-[0.45rem] italic opacity-60">KCAL</span></span>
                             </div>
                             <!-- Remaining -->
                             <div class="flex justify-between items-center">
                               <span class="text-[0.5rem] text-slate-50 font-black tracking-widest uppercase">HEDEFE KALAN</span>
                               <span class="text-xs font-black text-rose-500 tracking-tighter">
                                 {{ activeMember.targetWeight ? Math.abs(m.weight - activeMember.targetWeight).toFixed(1) : '-' }} 
                                 <span class="text-[0.45rem] italic opacity-60 ml-0.5">KG</span>
                               </span>
                             </div>
                           </div>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
    </div>

    <!-- 3. ACTION FOOTER using BaseActionFooter -->
    <BaseActionFooter v-if="!showNutritionModal">
        <!-- Center Actions -->
        <template #default>
            <div class="flex items-center gap-[10px]">
                <BaseButton v-if="!showDetailModal" variant="dark" size="icon" square @click="router.push('/')" title="GERI">
                  <template #icon><ArrowLeft class="w-5 h-5" /></template>
                </BaseButton>

                <div v-if="!showDetailModal" class="w-px h-6 bg-slate-800 mx-1"></div>

                <BaseButton 
                  v-if="!showDetailModal"
                  variant="primary"
                  size="icon" square
                  @click="showMemberModal = true"
                  title="YENİ ÖLÇÜM EKLE"
                >
                  <template #icon><Plus class="w-5 h-5" /></template>
                </BaseButton>

                <div v-if="!showDetailModal && selectedMember" class="w-px h-6 bg-slate-800 mx-1"></div>

                <!-- LIST VIEW ACTIONS -->
                <template v-if="!showDetailModal">
                    <BaseButton 
                      v-if="selectedMember"
                      variant="success"
                      size="icon" square
                      @click="showNutritionModal = true"
                      title="BESLENME PLANI"
                    >
                      <template #icon><Apple class="w-5 h-5" /></template>
                    </BaseButton>
                    
                    <BaseButton 
                      v-if="selectedMember"
                      variant="primary"
                      size="icon" square
                      @click="openTracker(selectedMember)"
                      title="ANALIZ"
                    >
                      <template #icon><Activity class="w-5 h-5" /></template>
                    </BaseButton>
                </template>

                <!-- ANALYSIS VIEW ACTIONS -->
                <template v-else-if="showDetailModal">
                    <!-- Back Button for Analysis -->
                    <BaseButton v-if="!showAddForm" variant="dark" size="icon" square @click="showDetailModal = false; selectedMeasurementId = null" title="GERİ">
                      <template #icon><ArrowLeft class="w-5 h-5" /></template>
                    </BaseButton>

                    <!-- Cancel Button for Form -->
                    <BaseButton v-else variant="dark" size="icon" square @click="showAddForm = false" title="KAPAT">
                      <template #icon><X class="w-5 h-5" /></template>
                    </BaseButton>

                    <div class="w-px h-6 bg-slate-800 mx-1"></div>

                    <!-- Save form -->
                    <BaseButton v-if="showAddForm" variant="success" size="icon" square @click="saveMeasurement" title="KAYDET">
                      <template #icon><Check class="w-5 h-5" /></template>
                    </BaseButton>

                    <!-- Analysis operations -->
                    <template v-else>
                        <BaseButton 
                          variant="secondary"
                          size="icon" square
                          @click="showAddForm = !showAddForm"
                          title="OLCUM EKLE"
                        >
                          <template #icon><Plus class="w-5 h-5" /></template>
                        </BaseButton>

                    <BaseButton 
                      v-if="selectedMeasurementId"
                      variant="danger"
                      size="icon" square
                      @click="deleteMeasurement(selectedMeasurementId)"
                      title="SIL"
                    >
                      <template #icon><Trash2 class="w-5 h-5" /></template>
                    </BaseButton>
                  </template>
                </template>
            </div>
        </template>
    </BaseActionFooter>

    <!-- Nutrition Plan Modal (External Component) -->
    <NutritionPlanModal 
      v-if="selectedMember"
      :isOpen="showNutritionModal" 
      :member="selectedMember" 
      @close="showNutritionModal = false"
    />

    <!-- Member Selection Modal -->
    <TrainingPlanMemberPicker 
      v-if="showMemberModal"
      :members="members"
      @select="handleMemberSelect"
      @close="showMemberModal = false"
    />
  </div> <!-- CLOSE ROOT -->
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { 
  Activity, Loader2, X, Check, ArrowLeft, TrendingDown, TrendingUp, Users,
  Plus, Trash2, Zap, Scale, Ruler, Droplet, Dumbbell, Apple, 
  Utensils, Moon, FileText, Save, User, ChevronDown
} from 'lucide-vue-next'
import api from '../../utils/api'
const { apiClient } = api
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

// Base Components
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseBadge from '../../components/base/BaseBadge.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseSwitch from '../../components/base/BaseSwitch.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseModal from '../../components/base/BaseModal.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'
import NutritionPlanModal from '../../components/NutritionPlanModal.vue'
import TrainingPlanMemberPicker from '../../components/plans/TrainingPlanMemberPicker.vue'

const router = useRouter()

const memberColumns = [
  { key: 'selection', label: '', width: '40px' },
  { key: 'profile', label: 'ÜYE BİLGİSİ' },
  { key: 'goals', label: 'HEDEFLER', align: 'center' },
  { key: 'currentWeight', label: 'GÜNCEL KG', align: 'center' },
  { key: 'targetWeight', label: 'HEDEF KG', align: 'center' },
  { key: 'remaining', label: 'KALAN', align: 'center' },
  { key: 'progress', label: 'İLERLEME', align: 'center' },
  { key: 'bmi', label: 'DURUM (BKİ)', align: 'center' },
  { key: 'tdee', label: 'TDEE', align: 'center' }
]

const measurementColumns = [
  { key: 'date', label: 'TARİH' },
  { key: 'measurements', label: 'BOY/KİLO', align: 'center' },
  { key: 'chest', label: 'GÖĞÜS', align: 'center' },
  { key: 'waist', label: 'BEL', align: 'center' },
  { key: 'hips', label: 'KALÇA', align: 'center' },
  { key: 'arms', label: 'PAZU (S/S)', align: 'center' },
  { key: 'bmi', label: 'BKİ (DURUM)', align: 'center' }
]

const getBmiClass = (bmi) => {
  if (!bmi) return 'text-slate-500'
  if (bmi < 18.5) return 'text-sky-400'
  if (bmi < 25) return 'text-emerald-400'
  if (bmi < 30) return 'text-amber-400'
  return 'text-rose-500'
}

const getBMIStatus = (bmi) => {
  if (!bmi) return { label: '-', color: 'text-slate-500' }
  if (bmi < 18.5) return { label: 'ZAYIF', color: 'text-sky-400' }
  if (bmi < 25) return { label: 'NORMAL', color: 'text-emerald-400' }
  if (bmi < 30) return { label: 'KİLOLU', color: 'text-amber-400' }
  return { label: 'OBEZ', color: 'text-rose-500' }
}

const loading = ref(true)
const searchQuery = ref('')
const viewMode = ref('list') 
const activeTab = ref('all') // 'all', 'lose' veya 'gain'
const members = ref([])
const showDetailModal = ref(false)
const showAddForm = ref(false)
const activeMember = ref(null)
const selectedMember = ref(null)
const measurements = ref([])
const latestStats = ref({})
const selectedMeasurementId = ref(null)
const showNutritionModal = ref(false)
const showMemberModal = ref(false)
const isTabDropdownOpen = ref(false)
const tabs = [
  { id: 'all', label: 'HEPSİ', icon: Users },
  { id: 'lose', label: 'ZAYIFLAMA', icon: TrendingDown },
  { id: 'gain', label: 'KİLO ALMA', icon: TrendingUp }
]
const newMeasurement = ref({ 
  weight: null, 
  height: null, 
  fatPercentage: null, 
  muscleMass: null, 
  period: 'Haftalık',
  measurementDate: new Date().toISOString().substr(0, 10),
  neck: null,
  shoulder: null,
  chest: null,
  waist: null,
  hips: null,
  wrist: null,
  rightBicep: null,
  leftBicep: null,
  rightForearm: null,
  leftForearm: null,
  rightTricep: null,
  leftTricep: null,
  rightThigh: null,
  leftThigh: null,
  rightHamstring: null,
  leftHamstring: null,
  rightCalf: null,
  leftCalf: null
})

const loseWeightMembers = computed(() => {
  // Sadece "Zayıflamak" hedefi olanlar veya her ikisi varsa "Zayıflamak" öncelikli
  return members.value.filter(m => {
    const goals = m.fitnessGoals || []
    return goals.includes('Zayıflamak')
  })
})

const gainWeightMembers = computed(() => {
  if (!members.value) return []
  // Sadece "Kilo Almak" hedefi olanlar VE "Zayıflamak" hedefi olmayanlar
  return members.value.filter(m => {
    const goals = m.fitnessGoals || []
    return goals.includes('Kilo Almak') && !goals.includes('Zayıflamak')
  })
})

const filteredMembers = computed(() => {
  let targetMembers = []
  if (activeTab.value === 'all') {
    targetMembers = members.value
  } else if (activeTab.value === 'lose') {
    targetMembers = loseWeightMembers.value
  } else {
    targetMembers = gainWeightMembers.value
  }
  
  return targetMembers.filter(m => {
    const matchesSearch = (m.fullName || '').toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         (m.memberCode || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

const progressReport = computed(() => {
  if (!measurements.value || measurements.value.length < 2) return null
  
  const sorted = [...measurements.value].sort((a, b) => new Date(a.measurementDate) - new Date(b.measurementDate))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  
  const fields = [
    { label: 'Kilo', key: 'weight', unit: 'kg' },
    { label: 'Göğüs', key: 'chest', unit: 'cm' },
    { label: 'Bel', key: 'waist', unit: 'cm' },
    { label: 'Omuz', key: 'shoulder', unit: 'cm' },
    { label: 'Hips (Kalça)', key: 'hips', unit: 'cm' },
    { label: 'Sağ Pazu', key: 'rightBicep', unit: 'cm' },
    { label: 'Sol Pazu', key: 'leftBicep', unit: 'cm' },
    { label: 'Sağ Ön Bacak', key: 'rightThigh', unit: 'cm' },
    { label: 'Sol Ön Bacak', key: 'leftThigh', unit: 'cm' }
  ]
  
  return fields.map(f => {
    const v1 = Number(first[f.key]) || 0
    const v2 = Number(last[f.key]) || 0
    return {
      label: f.label,
      first: v1,
      last: v2,
      diff: (v2 - v1).toFixed(1),
      unit: f.unit
    }
  }).filter(f => f.first > 0 || f.last > 0)
})

const handleMemberSelect = (member) => {
  if (!member) {
    showMemberModal.value = false
    return
  }
  showMemberModal.value = false
  openTracker(member)
}

// Watch weight changes to auto-calculate Muscle & Fat
const getWeekNumber = (dateStr) => {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getFullYear()}-W${weekNo}`
}

// Watch weight changes to auto-calculate Muscle & Fat
watch(() => newMeasurement.value.weight, (newW) => {
  if (!newW || !lastMeasurement.value) {
    newMeasurement.value.muscleMass = null
    newMeasurement.value.fatPercentage = null
    return
  }

  const prevW = lastMeasurement.value.weight
  const diff = newW - prevW
  
  const prevMuscle = Number(lastMeasurement.value.muscleMass) || (prevW * 0.45)
  const prevFat = Number(lastMeasurement.value.fatPercentage) || 25

  if (diff < 0) { // Weight Loss
    newMeasurement.value.muscleMass = (prevMuscle + (diff * 0.3)).toFixed(1)
    newMeasurement.value.fatPercentage = (prevFat + (diff * 0.5)).toFixed(1)
  } else { // Weight Gain
    newMeasurement.value.muscleMass = (prevMuscle + (diff * 0.4)).toFixed(1)
    newMeasurement.value.fatPercentage = (prevFat + (diff * 0.2)).toFixed(1)
  }
})

const lastMeasurement = computed(() => measurements.value[0] || null)

const memberProgress = computed(() => {
  if (!activeMember.value?.weight || !activeMember.value?.targetWeight) return 0
  return activeMember.value.weight - activeMember.value.targetWeight
})

const getPhotoUrl = (photo) => {
  if (!photo) return null
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo
  return `http://${window.location.hostname}:5000${photo}`
}

const getActivityLevelLabel = (level) => {
  const labels = {
    'SEDENTARY': 'SEDANTER',
    'LIGHT': 'HAFİF',
    'MODERATE': 'ORTA',
    'ACTIVE': 'AKTİF',
    'VERY_ACTIVE': 'ÇOK AKTİF',
    'EXTRA_ACTIVE': 'AŞIRI AKTİF'
  }
  return labels[level] || '-'
}

const calculateRemaining = (member) => {
  const current = latestStats.value[member.id]?.weight || member.weight || 0
  const target = member.targetWeight || 0
  if (!current || !target) return '-'
  
  const goals = member.fitnessGoals || []
  if (goals.includes('Zayıflamak')) {
    const diff = current - target
    return diff > 0 ? diff.toFixed(1) : 'HEDEF TAMAM'
  } else if (goals.includes('Kilo Almak')) {
    const diff = target - current
    return diff > 0 ? diff.toFixed(1) : 'HEDEF TAMAM'
  }
  return Math.abs(current - target).toFixed(1)
}

const calculateProgress = (member) => {
  const startWeight = member.startingWeight
  const targetWeight = member.targetWeight
  const currentWeight = latestStats.value[member.id]?.weight || member.weight
  
  if (!startWeight || !targetWeight || !currentWeight) return 0
  
  const totalChangeNeeded = Math.abs(startWeight - targetWeight)
  const actualChange = Math.abs(startWeight - currentWeight)
  
  if (totalChangeNeeded === 0) return 0
  
  const progress = (actualChange / totalChangeNeeded) * 100
  return Math.min(Math.max(Math.round(progress), 0), 100)
}

const fetchMembers = async () => {
  try {
    loading.value = true
    const [mRes, bRes] = await Promise.all([
      apiClient.get('/members?profileType=MEMBER'),
      apiClient.get('/body-measurements')
    ])
    
    // Map latest stats
    const stats = {}
    if (bRes.data && Array.isArray(bRes.data.measurements)) {
      bRes.data.measurements.forEach(m => {
        if (!stats[m.memberId]) stats[m.memberId] = m // Since sorted by date DESC
      })
    }
    latestStats.value = stats
    members.value = Array.isArray(mRes.data?.members) ? mRes.data.members : []
    console.log(`🔵 ${members.value.length} members loaded.`)
    
    if (activeMember.value) {
      const updated = members.value.find(m => m.id === activeMember.value.id)
      if (updated) activeMember.value = updated
    }
  } catch (err) { 
    console.error('❌ Member fetch error:', err) 
  }
  finally { loading.value = false }
}

const selectMember = (member) => {
  console.log('🟡 Member selected:', member.fullName)
  if (selectedMember.value?.id === member.id) {
    selectedMember.value = null
  } else {
    selectedMember.value = member
  }
}

const openTracker = async (member) => {
  activeMember.value = member
  showDetailModal.value = true
  showAddForm.value = false
  newMeasurement.value = { 
    weight: member.weight || null, 
    height: member.height || null, 
    fatPercentage: null, 
    muscleMass: null,
    period: 'Haftalık',
    measurementDate: new Date().toISOString().substr(0, 10),
    neck: null, shoulder: null, chest: null, waist: null, hips: null, wrist: null,
    rightBicep: null, leftBicep: null, rightForearm: null, leftForearm: null,
    rightTricep: null, leftTricep: null, rightThigh: null, leftThigh: null,
    rightHamstring: null, leftHamstring: null, rightCalf: null, leftCalf: null
  }
  await fetchMeasurements(member.id)
}

const fetchMeasurements = async (memberId) => {
  try {
    const response = await apiClient.get(`/body-measurements?memberId=${memberId}`)
    measurements.value = response.data?.measurements || []
  } catch (err) { console.error(err) }
}

const saveMeasurement = async () => {
  if (!newMeasurement.value.weight || !newMeasurement.value.height) {
     Swal.fire({ icon: 'error', title: 'EKSİK VERİ', text: 'Boy ve kilo alanları zorunludur.', background: '#1e293b', color: '#f1f5f9' })
     return
  }

  // Weekly duplicate check
  const newWeek = getWeekNumber(newMeasurement.value.measurementDate)
  const existingWeekIdx = measurements.value.findIndex(m => 
    getWeekNumber(m.measurementDate) === newWeek
  )

  if (existingWeekIdx !== -1) {
    const existing = measurements.value[existingWeekIdx]
    const result = await Swal.fire({
      title: 'ZATEN KAYITLI',
      text: `Bu hafta (${newWeek}) için zaten bir kayıt mevcut. Mevcut kaydı silip yenisiyle değiştirmek istiyor musunuz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'EVET, GÜNCELLE',
      cancelButtonText: 'HAYIR',
      background: '#1e293b',
      color: '#f1f5f9'
    })
    
    if (result.isConfirmed) {
      await apiClient.delete(`/body-measurements/${existing.id}`)
    } else {
      return
    }
  }

  try {
    await apiClient.post(`/body-measurements`, {
        memberId: activeMember.value.id,
        ...newMeasurement.value
    })
    Swal.fire({ icon: 'success', title: 'KAYDEDİLDİ', text: 'Analiz tamamlandı.', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#f1f5f9' })
    showAddForm.value = false
    await fetchMeasurements(activeMember.value.id)
    await fetchMembers()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'HATA', text: 'Kayıt yapılamadı.', background: '#1e293b', color: '#f1f5f9' })
  }
}

const deleteMeasurement = async (id) => {
    const result = await Swal.fire({
      title: 'SİLİNSİN Mİ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'SİL',
      background: '#1e293b',
      color: '#f1f5f9'
    })
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/body-measurements/${id}`)
        await fetchMeasurements(activeMember.value.id)
        await fetchMembers()
      } catch (err) { console.error(err) }
    }
}

const openNutritionModal = () => {
  if (!selectedMember.value) return
  showNutritionModal.value = true
}

onMounted(() => {
  fetchMembers()
  window.addEventListener('click', () => {
    isTabDropdownOpen.value = false
  })
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>

<style scoped>
.neon-box-emerald { border-color: #10b981; box-shadow: inset 0 0 30px rgba(16,185,129,0.05), 0 0 20px rgba(16,185,129,0.1); }
.neon-box-rose { border-color: #f43f5e; box-shadow: inset 0 0 30px rgba(244,63,94,0.05), 0 0 20px rgba(244,63,94,0.1); }
.neon-box-sky { border-color: #0ea5e9; box-shadow: inset 0 0 30px rgba(14,165,233,0.05), 0 0 20px rgba(14,165,233,0.1); }
.neon-box-indigo { border-color: #6366f1; box-shadow: inset 0 0 30px rgba(99,102,241,0.05), 0 0 20px rgba(99,102,241,0.1); }

@keyframes pulse-slow {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.8; filter: brightness(1.2); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
