<template>
  <div class="h-full flex flex-col bg-slate-950 overflow-hidden relative">
    
    <!-- Main Header (Always visible if not in form) -->
    <div v-if="!showScheduleForm" class="shrink-0 p-4 pb-0">


      <!-- Base Search & Filters -->
      <BaseSearchFilter
        v-model:searchQuery="searchQuery"
        v-model:viewMode="currentViewMode"
        placeholder="EĞİTMEN, ÜYE VEYA DERS ARA..."
        accent="amber"
        @search="loadSchedules"
      >
        <!-- Slot for Detailed Filters (Always Visible Now) -->

        <!-- Slot for Back Action (Simplified) -->
        <template #extra-actions>
           <!-- Back actions handled by footer or toggles now -->
        </template>
      </BaseSearchFilter>


    </div>

    <!-- View Content Area -->
    <div v-if="!showScheduleForm" class="flex-1 flex flex-col overflow-hidden px-4 pb-4">
       
       <!-- CALENDAR VIEW -->
       <Transition name="fade" mode="out-in">
         <BaseScroll v-if="!showDayListView" direction="both" class="flex-1 bg-slate-900/20 border border-slate-800 rounded-sm relative shadow-2xl overflow-hidden p-[1px]">
            <div class="inline-flex flex-col min-w-full">
              <!-- Calendar Header (Days) -->
              <div class="flex sticky top-0 z-30 bg-slate-950 border-b border-slate-800 shadow-xl">
                <div class="w-20 shrink-0 bg-slate-950 border-r border-slate-800"></div>
                <div v-for="(day, idx) in days" :key="idx" 
                  class="relative flex-1 min-w-[120px] flex flex-col group cursor-pointer transition-all duration-500 border-r border-slate-800/30 last:border-r-0 hover:bg-white/[0.02]"
                  @click="toggleDaySelection(idx)"
                >
                  <!-- Top Neon Accent Line -->
                  <div class="absolute top-0 left-0 right-0 h-[2px] blur-[1px] transition-all duration-500"
                    :class="[selectedDayIndex === idx ? 'opacity-100 scale-x-100' : 'opacity-30 scale-x-75 group-hover:opacity-60', getDayBgColor(idx, true)]">
                  </div>

                  <div class="flex flex-col items-center pt-4 pb-2">
                    <span class="text-[0.55rem] font-black uppercase tracking-[0.4em] transition-all duration-500 mb-1"
                      :class="[selectedDayIndex === idx ? 'opacity-100 brightness-150' : 'opacity-40 group-hover:opacity-80', getDayThemeColor(idx)]"
                      :style="selectedDayIndex === idx ? `text-shadow: 0 0 10px currentColor` : ''"
                    >
                      HAFTALIK
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 select-none pb-0.5" 
                        :class="getDayColor(idx, selectedDayIndex === idx)">
                        {{ day }}
                      </span>
                      <!-- LESSON COUNT BADGE -->
                      <div class="flex items-center relative group/summary">
                        <div 
                          v-if="getSchedulesForDay(idx).length > 0"
                          class="px-1.5 py-0.5 rounded-sm text-[0.6rem] font-black transition-all duration-500 shadow-lg border border-white/10 cursor-pointer"
                          :class="[selectedDayIndex === idx ? 'bg-white text-slate-950 scale-110' : 'bg-slate-800 text-white opacity-60 group-hover:opacity-100']"
                          @click.stop="showDayListView = true; selectedDayIndex = idx"
                        >
                          {{ getSchedulesForDay(idx).length }}
                        </div>

                        <!-- QUICK SUMMARY TOOLTIP -->
                        <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover/summary:block z-[100] bg-slate-900 border border-slate-800 shadow-2xl rounded-sm p-3 min-w-[160px] pointer-events-none backdrop-blur-xl">
                           <div class="flex flex-col gap-2">
                              <p class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5 mb-0.5">BUGÜNKÜ DERSLER</p>
                              <div v-for="s in getSchedulesForDay(idx).sort((a,b) => a.startTime.localeCompare(b.startTime))" :key="s.id" class="flex items-center justify-between gap-4">
                                 <span class="text-[0.65rem] font-black text-amber-500/80">{{ s.startTime.substring(0,5) }}</span>
                                 <span class="text-[0.6rem] font-bold text-slate-300 uppercase truncate max-w-[80px]">{{ s.specialty?.name || s.name || 'Ders' }}</span>
                              </div>
                              <p class="text-[0.5rem] font-bold text-slate-500 italic mt-1 pt-1 border-t border-slate-800/50">Detay için tıkla</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div class="w-full h-0.5 mt-2 transition-all duration-700 rounded-full overflow-hidden relative" 
                      :class="selectedDayIndex === idx ? 'bg-white opacity-100 scale-x-100' : 'bg-slate-800/30 opacity-20 scale-x-50'">
                      <div class="absolute inset-0 transition-all duration-700" 
                        :class="[selectedDayIndex === idx ? 'opacity-100 animate-pulse' : 'opacity-0', getDayBgColor(idx, true)]">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Calendar Grid Body -->
              <div class="flex relative group">
                <!-- Time Sidebar -->
                <div class="w-20 shrink-0 bg-slate-950/80 border-r border-slate-800 sticky left-0 z-20 shadow-2xl">
                  <div v-for="hour in calendarHours" :key="hour" class="h-[90px] border-b border-slate-800/30 relative group">
                    <div class="absolute -top-3 left-0 w-full text-center">
                      <span class="text-[0.65rem] font-black text-slate-600 font-mono tracking-tighter group-hover:text-slate-300 transition-colors">
                        {{ String(hour).padStart(2, '0') }}:00
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Main Content Grid -->
                <div v-for="(day, idx) in days" :key="idx" 
                  class="flex-1 min-w-[200px] relative border-r border-slate-800/30 last:border-r-0 transition-all duration-500 group/day"
                  :class="[
                    selectedDayIndex === idx ? 'bg-slate-900/40 ring-1 ring-inset ring-white/5' : '',
                    getDayGridBg(idx)
                  ]"
                >
                  <!-- Hour Strips -->
                  <div v-for="hour in calendarHours" :key="hour" 
                    class="h-[90px] border-b border-slate-800/20 last:border-b-0 cursor-pointer hover:bg-white/5 transition-all group"
                    @click="toggleDaySelection(idx)"
                  >
                  </div>

                  <!-- Schedule Cards (Using Grouped View) -->
                  <TransitionGroup name="list">
                    <BaseCalendarCard
                      v-for="schedule in getSchedulesForDay(idx)"
                      :key="schedule.id"
                      :lesson-type="schedule.lessonType"
                      :is-active="schedule.isActive"
                      :start-time="schedule.startTime.substring(0, 5)"
                      :end-time="schedule.endTime.substring(0, 5)"
                      :title="schedule.title || (schedule.member ? schedule.member.fullName : (schedule.specialty?.name || schedule.name || (schedule.lessonType === 'GROUP' ? 'GRUP DERSİ' : 'GENEL DERS')))"
                      :instructor="schedule.instructor?.displayName || schedule.instructor?.fullName || ''"
                      :subtitle="schedule.subtitle || (schedule.member ? ((schedule.category?.name || allCategories.find(c => String(c.id) === String(schedule.categoryId))?.name) || (schedule.specialty?.name !== schedule.member?.fullName ? (schedule.specialty?.name || 'FİTNESS') : 'GENEL')) : '')"
                      :capacity="schedule.capacity"
                      :current-count="schedule.memberNames?.length || 0"
                      :attendance-status="schedule.attendanceStatus"
                      :card-style="getScheduleStyle(schedule)"
                      @click.stop="editSchedule(schedule.originalSchedules ? schedule.originalSchedules[0] : schedule)"
                    />
                  </TransitionGroup>
                </div>
              </div>
            </div>
         </BaseScroll>

          <!-- DAILY LIST PAGE VIEW -->
          <div v-else class="flex-1 flex flex-col overflow-hidden">
             <BaseCard accent="amber" class="flex-1 overflow-hidden flex flex-col p-1 bg-amber-500/5">
                <div class="flex-1 overflow-hidden">
                   <BaseTable 
                      :columns="listColumns" 
                      :items="getSchedulesForDay(selectedDayIndex).sort((a,b) => a.startTime.localeCompare(b.startTime))"
                      accent="amber"
                      empty-text="İLGİLİ GÜNE AİT ÜYE LİSTESİ YOKTUR"
                      empty-subtext="Bu tarih için henüz bir ders kaydı oluşturulmamış."
                     @rowClick="(item) => editSchedule(item)"
                  >
                     <template #cell-time="{ item }">
                       <div class="flex flex-col">
                         <span class="text-[0.7rem] font-black text-slate-100">{{ item.startTime.substring(0,5) }}</span>
                         <span class="text-[0.55rem] font-bold text-slate-500">{{ item.endTime.substring(0,5) }}</span>
                       </div>
                     </template>

                     <template #cell-member="{ item }">
                        <div v-if="item.member" class="flex items-center gap-3">
                           <div class="relative group/avatar">
                              <img v-if="item.member.photo" :src="apiBaseUrl + item.member.photo" class="w-8 h-8 rounded-full border-2 border-slate-800 group-hover/avatar:border-indigo-500 transition-all shadow-lg object-cover" />
                              <div v-else class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                 <User class="w-4 h-4 text-slate-500" />
                              </div>
                           </div>
                           <span class="text-[0.7rem] font-black text-slate-200 uppercase tracking-widest">{{ item.member.fullName }}</span>
                        </div>
                         <div v-else class="flex flex-col">
                            <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest italic">
                               {{ item.lessonType === 'GROUP' && item.isGroupClass ? 'GENEL GRUP / TOPLU' : 'ÜYE ATANMAMIŞ' }}
                            </span>
                         </div>
                     </template>

                     <template #cell-lessonType="{ item }">
                         <span class="text-[0.6rem] font-black px-3 py-1.5 rounded-sm border inline-block uppercase tracking-widest shadow-lg"
                           :class="{
                              'text-blue-100 border-blue-400 bg-blue-600 shadow-blue-900/40': item.lessonType === 'GENERAL',
                              'text-indigo-100 border-indigo-400 bg-indigo-600 shadow-indigo-900/40': item.lessonType === 'PRIVATE',
                              'text-amber-950 border-amber-300 bg-amber-500 shadow-amber-900/40': item.lessonType === 'GROUP'
                           }"
                         >
                           {{ item.lessonType === 'GENERAL' ? 'FİTNESS' : item.lessonType === 'PRIVATE' ? 'ÖZEL' : 'GRUP' }}
                         </span>
                     </template>

                      <template #cell-instructor="{ item }">
                         <div class="flex flex-col">
                            <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-widest leading-none">
                              {{ item.instructor?.displayName || item.instructor?.fullName || item.instructor?.user?.username || (instructors.find(i => String(i.id) === String(item.instructorId))?.displayName) || '-' }}
                            </span>
                            <span v-if="item.instructor?.instructorCode" class="text-[0.55rem] font-bold text-rose-500 tracking-tighter mt-1">
                              ID: {{ item.instructor.instructorCode }}
                            </span>
                         </div>
                      </template>

                      <template #cell-specialty="{ item }">
                         <div class="flex flex-col">
                            <span class="text-[0.7rem] font-black text-indigo-400 uppercase tracking-widest leading-none">
                              {{ item.specialty?.name || (specialties.find(s => String(s.id) === String(item.specialtyId))?.name) || (item.isGroupClass ? 'GRUP DERSİ' : '-') }}
                            </span>
                            
                            <!-- Alt Kategori / Branş Alt Başlığı -->
                            <span v-if="item.category?.name || (allCategories.find(c => String(c.id) === String(item.categoryId))?.name)" class="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.1em] mt-1.5 italic">
                               {{ item.category?.name || (allCategories.find(c => String(c.id) === String(item.categoryId))?.name) }}
                            </span>
                            <span v-else-if="item.name && item.name !== item.specialty?.name" class="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.1em] mt-1.5 italic">
                               {{ item.name }}
                            </span>
                         </div>
                      </template>

                     <template #cell-attendanceStatus="{ item }">
                        <div v-if="item.attendanceStatus === 'INSIDE'" class="flex items-center gap-2 text-amber-500">
                           <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">İÇERİDE</span>
                        </div>
                        <div v-else-if="item.attendanceStatus === 'COMPLETED' || item.attendanceStatus === 'PRESENT'" class="flex items-center gap-2 text-emerald-500">
                           <CheckCircle class="w-3 h-3" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">TAMAMLANDI</span>
                        </div>
                        <div v-else-if="item.attendanceStatus === 'EARLY_EXIT'" class="flex items-center gap-2 text-rose-500">
                           <X class="w-3 h-3" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">ERKEN ÇIKTI</span>
                        </div>
                        <div v-else-if="item.attendanceStatus === 'PENDING'" class="flex items-center gap-2 text-slate-500">
                           <Clock class="w-3 h-3" />
                           <span class="text-[0.6rem] font-black uppercase tracking-widest">BEKLEMEDE</span>
                        </div>
                        <span v-else class="text-[0.6rem] font-bold text-slate-700">-</span>
                     </template>
                   </BaseTable>
                </div>
             </BaseCard>
          </div>
       </Transition>

       <!-- Global Actions Footer -->
       <BaseActionFooter>
          <div class="flex items-center gap-[10px]">

            <template v-if="!showDayListView">
               <BaseButton @click="showScheduleForm = true" variant="primary" size="icon" square title="YENİ PROGRAM">
                 <template #icon><Plus class="w-5 h-5" /></template>
               </BaseButton>
               <Transition name="scale">
                  <BaseButton v-if="selectedDayIndex !== null" @click="showDayListView = true" variant="secondary" size="icon" square title="GÜNLÜK LİSTE">
                     <template #icon><List class="w-5 h-5" /></template>
                  </BaseButton>
               </Transition>
            </template>
            <template v-else>
               <BaseButton @click="showDayListView = false" variant="secondary" size="icon" square title="TAKVİME DÖN">
                  <template #icon><ChevronLeft class="w-5 h-5" /></template>
               </BaseButton>
            </template>
          </div>
       </BaseActionFooter>
    </div>

    <!-- Schedule Form View (Integrated Base Modern Overlay) -->
    <Transition name="fade-slide">
      <div v-if="showScheduleForm" class="absolute inset-0 z-[60] bg-slate-950 flex flex-col overflow-hidden text-left">

         <!-- Main Form Content -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-[15px] pb-24">
            <div class="max-w-8xl mx-auto w-full">
               <div class="flex flex-col gap-[15px]">
                  
                  <!-- Left: Core Settings -->
                  <div class="space-y-[15px]">
                     <BaseCard accent="amber" :clickable="false" class="p-[15px] !bg-slate-900/20">
                        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                           <LayoutGrid class="w-5 h-5 text-amber-500" />
                           <span class="text-[0.75rem] font-black text-white uppercase tracking-widest">TEMEL AYARLAR</span>
                        </div>

                        <div class="space-y-6">
                           <div>
                              <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">DERS TİPİ</label>
                              <select v-model="scheduleForm.lessonType" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm appearance-none cursor-pointer">
                                 <option value="">SEÇİNİZ...</option>
                                 <option value="GENERAL">FİTNESS (GENEL)</option>
                                 <option value="PRIVATE">ÖZEL DERS</option>
                                 <option value="GROUP">GRUP DERSİ</option>
                              </select>
                           </div>

                           <Transition name="fade">
                             <div v-if="scheduleForm.lessonType" class="space-y-6">
                               <div>
                                 <div class="flex items-center justify-between mb-2 ml-1">
                                    <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em]">ÜYE SEÇİMİ</label>
                                    <span class="text-[0.55rem] font-bold text-slate-600 uppercase">OPSİYONEL</span>
                                 </div>
                                 <div class="relative">
                                   <!-- Selected Members Scrollable Control -->
                                   <div v-if="scheduleForm.memberIds.length > 0" 
                                        class="mb-3 p-2 bg-slate-950/50 border border-slate-800/50 rounded-sm max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                      <div class="flex flex-wrap gap-2">
                                         <div v-for="mId in scheduleForm.memberIds" :key="mId" 
                                              class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-sm group transition-all hover:bg-amber-500/20 hover:border-amber-500/40">
                                            <span class="text-[0.6rem] font-black text-amber-500 uppercase tracking-widest">{{ getMemberName(mId) }}</span>
                                            <button @click="removeMember(mId)" class="text-amber-500/40 hover:text-amber-500 transition-colors">
                                               <X class="w-2.5 h-2.5" />
                                            </button>
                                         </div>
                                      </div>
                                   </div>

                                   <!-- Search Input -->
                                   <div class="relative">
                                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                      <input 
                                        v-model="memberSearchQuery"
                                        @focus="isMemberSelectOpen = true"
                                        type="text" 
                                        placeholder="ÜYE ARA VEYA SEÇ..."
                                        class="w-full h-12 bg-slate-950 border border-slate-800 pl-11 pr-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm"
                                      />
                                      <div v-if="isMemberSelectOpen" @click="isMemberSelectOpen = false" class="fixed inset-0 z-[60]"></div>
                                      
                                      <!-- Dropdown Result List -->
                                      <div v-if="isMemberSelectOpen" class="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-sm shadow-2xl max-h-60 overflow-y-auto z-[70] scrollbar-thin scrollbar-thumb-slate-700">
                                         <div v-if="filteredSearchMembers.length === 0" class="p-4 text-center text-slate-500 text-[0.6rem] font-bold uppercase tracking-widest">ÜYE BULUNAMADI</div>
                                         <div 
                                           v-for="member in filteredSearchMembers" 
                                           :key="member.id"
                                           @click="toggleMember(member.id)"
                                           class="p-3 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between group transition-colors"
                                         >
                                            <div class="flex flex-col">
                                               <span class="text-[0.65rem] font-black text-slate-200 uppercase tracking-widest">{{ member.fullName }}</span>
                                               <span class="text-[0.55rem] font-bold text-slate-500">{{ member.memberCode || 'KODSUZ' }}</span>
                                            </div>
                                            <div v-if="scheduleForm.memberIds.includes(member.id)" class="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                               <Check class="w-3 h-3 text-slate-950" />
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                 </div>
                               </div>

                               <div v-if="scheduleForm.lessonType === 'GENERAL' || scheduleForm.lessonType === 'GROUP'">
                                  <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">KONTENJAN KAPASİTESİ</label>
                                  <input v-model.number="scheduleForm.capacity" type="number" min="1" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.7rem] font-black outline-none focus:border-amber-500 transition-all rounded-sm" />
                               </div>

                               <div>
                                 <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">EĞİTMEN ATAMASI</label>
                                 <select v-model="scheduleForm.instructorId" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm appearance-none cursor-pointer">
                                    <option value="">EĞİTMEN SEÇİNİZ...</option>
                                    <option v-for="instructor in instructors" :key="instructor.id" :value="instructor.id">{{ instructor.displayName }}</option>
                                 </select>
                               </div>

                               <div class="grid grid-cols-2 gap-4">
                                 <div>
                                   <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">BRANŞ</label>
                                   <select v-model="scheduleForm.specialtyId" @change="onSpecialtyChange" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm appearance-none cursor-pointer">
                                      <option value="">BRANŞ SEÇİNİZ...</option>
                                      <option v-for="specialty in specialties" :key="specialty.id" :value="specialty.id">{{ specialty.name }}</option>
                                   </select>
                                 </div>
                                 <div>
                                   <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">ALT KATEGORİ</label>
                                   <select v-model="scheduleForm.categoryId" class="w-full h-12 bg-slate-950 border border-slate-800 px-4 text-slate-100 text-[0.65rem] font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm appearance-none cursor-pointer">
                                      <option value="">OPSİYONEL...</option>
                                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                   </select>
                                 </div>
                               </div>
                             </div>
                           </Transition>
                        </div>
                     </BaseCard>
                  </div>

                  <!-- Right: Schedule & Notes -->
                  <div class="space-y-[15px]">
                     <BaseCard accent="indigo" :clickable="false" class="p-[15px] !bg-slate-900/20 shadow-2xl">
                        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                           <Calendar class="w-5 h-5 text-indigo-400" />
                           <span class="text-[0.75rem] font-black text-white uppercase tracking-widest">ZAMANLAMA VE PERİYOT</span>
                        </div>

                        <div class="space-y-6">
                           <div>
                             <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-4 ml-1">GÜN SEÇİMİ (BİRDEN FAZLA SEÇİLEBİLİR)</label>
                             <div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                               <button 
                                 v-for="(day, idx) in days" 
                                 :key="idx"
                                 type="button"
                                 @click="toggleFormDay(idx)"
                                 :class="getDayBgColor(idx, scheduleForm.selectedDays.includes(idx))"
                                 class="h-10 flex items-center justify-center text-[0.6rem] font-black border transition-all duration-300 relative rounded-sm uppercase tracking-tighter"
                               >
                                  {{ day.substring(0,3) }}
                               </button>
                             </div>
                           </div>

                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">VARSAYILAN BAŞLANGIÇ</label>
                                <div class="relative group">
                                   <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                   <input v-model="scheduleForm.startTime" type="time" class="w-full h-12 bg-slate-950 border border-slate-800 pl-11 pr-4 text-slate-100 text-xs font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm" />
                                </div>
                              </div>
                              <div>
                                <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">VARSAYILAN BİTİŞ</label>
                                <div class="relative group">
                                   <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                                   <input v-model="scheduleForm.endTime" type="time" class="w-full h-12 bg-slate-950 border border-slate-800 pl-11 pr-4 text-slate-100 text-xs font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all rounded-sm" />
                                </div>
                              </div>
                           </div>

                           <!-- PER-DAY TIMING ROWS -->
                           <div v-if="scheduleForm.selectedDays.length > 0" class="pt-4 border-t border-slate-800/50">
                              <label class="block text-[0.6rem] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 ml-1 italic">GÜNE ÖZEL SAAT AYARLARI</label>
                              <div class="space-y-2">
                                <div v-for="dayIdx in sortedSelectedDays" :key="dayIdx" class="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950/40 p-3 rounded-sm border border-slate-800/50 hover:border-amber-500/30 transition-all">
                                   <div class="w-28 flex items-center gap-2">
                                      <div class="w-1.5 h-1.5 rounded-full" :class="getDayDotColor(dayIdx)"></div>
                                      <span class="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">{{ days[dayIdx] }}</span>
                                   </div>
                                   <div class="flex-1 grid grid-cols-2 gap-3">
                                      <input v-model="scheduleForm.dayTimes[dayIdx].start" type="time" class="h-9 bg-slate-900 border border-slate-800 px-3 text-slate-200 text-[0.6rem] font-black outline-none focus:border-amber-500/50 rounded-sm" />
                                      <input v-model="scheduleForm.dayTimes[dayIdx].end" type="time" class="h-9 bg-slate-900 border border-slate-800 px-3 text-slate-200 text-[0.6rem] font-black outline-none focus:border-amber-500/50 rounded-sm" />
                                   </div>
                                </div>
                              </div>
                           </div>

                           <div>
                             <label class="block text-[0.6rem] font-black text-white uppercase tracking-[0.2em] mb-2 ml-1">EK NOTLAR VE AÇIKLAMALAR</label>
                             <textarea v-model="scheduleForm.notes" rows="4" placeholder="Ders hakkında ek bilgiler..." class="w-full bg-slate-950 border border-slate-800 p-4 text-slate-100 text-[0.65rem] font-medium outline-none focus:border-amber-500 transition-all resize-none rounded-sm"></textarea>
                           </div>

                           <div class="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 cursor-pointer group hover:border-amber-500/30 transition-all shadow-inner rounded-sm" @click="scheduleForm.isActive = !scheduleForm.isActive">
                             <div class="flex flex-col">
                               <span class="text-[0.65rem] font-black text-white uppercase tracking-widest">TAKVİMDE GÖRÜNSÜN</span>
                               <span class="text-[0.55rem] font-bold text-slate-600 uppercase group-hover:text-amber-500 transition-colors">Dersin aktiflik durumunu belirler</span>
                             </div>
                             <BaseSwitch v-model="scheduleForm.isActive" />
                           </div>
                        </div>
                     </BaseCard>
                  </div>
               </div>
            </div>
         </div>

         <!-- Base Action Footer for Form -->
         <BaseActionFooter local>
            <div class="flex items-center gap-[10px]">
               <BaseButton @click="closeForm" variant="dark" size="icon" square title="VAZGEÇ">
                  <template #icon><X class="w-5 h-5" /></template>
               </BaseButton>

               <!-- FOOTER ACTIONS -->
               <div class="flex-1 flex items-center justify-end gap-3">
                  <BaseButton v-if="editingSchedule && !editingSchedule.id.toString().startsWith('group-')" @click="deleteSchedule" variant="danger" size="icon" square title="PROGRAMI SİL">
                     <template #icon><Trash2 class="w-5 h-5" /></template>
                  </BaseButton>
                  <BaseButton @click="saveSchedule" variant="amber" size="icon" square title="KAYDET">
                     <template #icon><Save class="w-5 h-5" /></template>
                  </BaseButton>
               </div>
            </div>
         </BaseActionFooter>
      </div>
    </Transition>

    <!-- Modals (Simple Attendance) -->
    <BaseModal :isOpen="showAttendanceModal" @close="closeAttendanceModal" title="YOKLAMA İŞLEMİ">
      <div class="flex flex-col gap-4">
          <div class="bg-slate-900/50 border border-slate-800 p-4 shadow-inner grid grid-cols-2 gap-y-3">
            <div class="flex flex-col col-span-2">
              <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Ders Tipi</span>
              <span class="text-[0.65rem] font-black text-white uppercase tracking-wider">
                {{ selectedSchedule?.lessonType === 'PRIVATE' ? 'Özel Ders' : selectedSchedule?.lessonType === 'GROUP' ? 'Grup Dersi' : 'Fitness' }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Eğitmen</span>
              <span class="text-[0.65rem] font-black text-white uppercase tracking-wider">
                {{ selectedSchedule?.instructor?.displayName || selectedSchedule?.instructor?.fullName || selectedSchedule?.instructor?.user?.username || '-' }}
              </span>
            </div>
            <div v-if="selectedSchedule?.member" class="flex flex-col">
              <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Üye</span>
              <span class="text-[0.65rem] font-black text-indigo-400 uppercase tracking-wider truncate">{{ selectedSchedule.member.fullName }}</span>
            </div>
            <div class="flex flex-col col-span-2 mt-1">
              <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Ders Saati</span>
              <span class="text-[0.65rem] font-black text-emerald-400 uppercase tracking-wider font-mono">
                {{ selectedSchedule?.startTime?.substring(0, 5) }} - {{ selectedSchedule?.endTime?.substring(0, 5) }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Yoklama Tarihi</label>
            <input v-model="attendanceDate" type="date" class="w-full h-11 bg-slate-950 border border-slate-800 px-4 text-slate-200 outline-none font-bold uppercase text-[0.65rem] tracking-wider focus:border-emerald-500 transition-colors shadow-inner [color-scheme:dark]" />
          </div>
      </div>
      <template #footer>
          <div class="flex items-center justify-end w-full gap-3 p-2">
             <button @click="closeAttendanceModal" class="px-6 py-2.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all font-black text-[0.65rem] uppercase tracking-widest">İptal</button>
             <button @click="takeAttendance" class="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500 shadow-lg transition-all font-black text-[0.65rem] uppercase tracking-widest flex items-center gap-2">
               <CheckCircle class="w-4 h-4" /> YOKLAMA AL
             </button>
          </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject, onUnmounted } from 'vue';
import { Calendar, Plus, X, Check, Save, Trash, LayoutGrid, List, Search, CheckCircle, User, Filter, ChevronRight, ChevronLeft, Clock, MessageSquare, Trash2 } from 'lucide-vue-next';

// Services & Composables
import { lessonScheduleService } from '../../services/lesson/lessonScheduleService';
import { instructorService } from '../../services/instructor/instructorService';
import { memberService } from '../../services/member/memberService';
import { specialtyService } from '../../services/sport/specialtyService';
import { useAlerts } from '../../utils/alerts';

import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue';
import BaseScroll from '../../components/base/BaseScroll.vue';
import BaseActionFooter from '../../components/base/BaseActionFooter.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import BaseCard from '../../components/base/BaseCard.vue';
import BaseButton from '../../components/base/BaseButton.vue';
import BaseTable from '../../components/base/BaseTable.vue';
import BaseCalendarCard from '../../components/base/BaseCalendarCard.vue';
import BaseModalHeader from '../../components/base/BaseModalHeader.vue';
import BaseSwitch from '../../components/base/BaseSwitch.vue';
import api from '../../utils/api';
import { useDataStore } from '../../store/data';

const { apiClient } = api;
const dataStore = useDataStore();
const { toast, confirm, error: showAlertError } = useAlerts();

const pageSubtitle = inject('pageSubtitle', ref(''))

// Global Refresh Dinleyicisi
watch(() => dataStore.lastRefresh, () => {
    if (!showScheduleForm.value) {
        console.log('[CALENDAR] Otomatik tazeleme yapılıyor...');
        loadSchedules();
    }
});


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const calendarHours = Array.from({ length: 16 }, (_, i) => i + 7);

const schedules = ref([]);
const instructors = ref([]);
const privateMembers = ref([]);
const allMembers = ref([]);
const specialties = ref([]);
const categories = ref([]);
const allCategories = ref([]);
const showScheduleForm = ref(false);
const editingSchedule = ref(null);
const searchQuery = ref('');
const selectedDayIndex = ref(null);
const showDayListView = ref(false);



const currentViewMode = computed({
  get: () => showDayListView.value ? 'list' : 'grid',
  set: (val) => { showDayListView.value = val === 'list'; }
});

const filters = ref({
  instructorId: '',
  memberId: '',
  specialtyId: '',
  lessonType: '',
  accessType: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  attendanceStatus: ''
});

const scheduleForm = ref({
  instructorId: '',
  memberId: '', // Tekli seçimler için (mıras)
  memberIds: [], // Çoklu seçimler için
  specialtyId: '',
  categoryId: '',
  selectedDays: [],
  startTime: '09:00',
  endTime: '10:30',
  dayTimes: {}, // { dayIdx: { start: '09:00', end: '10:30' } }
  lessonType: 'GENERAL',
  groupClassId: '',
  capacity: 20,
  isActive: true,
  sendNotification: true, // Yeni: WhatsApp bildirimi
  notes: ''
});

const showAttendanceModal = ref(false);
const selectedSchedule = ref(null);
const attendanceDate = ref(new Date().toISOString().split('T')[0]);

watch(showScheduleForm, (val) => {
  if (val) pageSubtitle.value = editingSchedule.value ? 'DÜZENLE' : 'YENİ PROGRAM'
  else if (!showAttendanceModal.value) pageSubtitle.value = ''
})

watch(showAttendanceModal, (val) => {
  if (val) pageSubtitle.value = 'YOKLAMA'
  else if (!showScheduleForm.value) pageSubtitle.value = ''
})

onUnmounted(() => {
  pageSubtitle.value = ''
})

// Multi-select member helpers
const memberSearchQuery = ref('');
const isMemberSelectOpen = ref(false);

const toggleMember = (memberId) => {
  const index = scheduleForm.value.memberIds.indexOf(memberId);
  if (index === -1) {
    scheduleForm.value.memberIds.push(memberId);
  } else {
    scheduleForm.value.memberIds.splice(index, 1);
  }
};

const removeMember = (memberId) => {
  const index = scheduleForm.value.memberIds.indexOf(memberId);
  if (index !== -1) scheduleForm.value.memberIds.splice(index, 1);
};

const filteredSearchMembers = computed(() => {
  const q = memberSearchQuery.value.toLowerCase();
  return filteredMembersForForm.value.filter(m => 
    m.fullName.toLowerCase().includes(q) || 
    (m.memberCode && m.memberCode.toLowerCase().includes(q))
  );
});

const getMemberName = (id) => {
  const member = allMembers.value.find(m => m.id === id);
  return member ? member.fullName : 'Bilinmeyen Üye';
};

const listColumns = [
  { key: 'time', label: 'SAAT', width: '100px' },
  { key: 'member', label: 'ÜYE', width: '250px' },
  { key: 'lessonType', label: 'DERS TİPİ', width: '120px' },
  { key: 'instructor', label: 'EĞİTMEN', width: '180px' },
  { key: 'specialty', label: 'BRANŞ', width: '150px' },
  { key: 'attendanceStatus', label: 'DURUM', width: '120px' }
];

const sortedSelectedDays = computed(() => {
  return [...scheduleForm.value.selectedDays].sort((a, b) => a - b);
});

const toggleFormDay = (idx) => {
  const index = scheduleForm.value.selectedDays.indexOf(idx);
  if (index === -1) {
    scheduleForm.value.selectedDays.push(idx);
    // Yeni gün için varsayılan saatleri ekle
    if (!scheduleForm.value.dayTimes[idx]) {
      scheduleForm.value.dayTimes[idx] = {
        start: scheduleForm.value.startTime,
        end: scheduleForm.value.endTime
      };
    }
  } else {
    scheduleForm.value.selectedDays.splice(index, 1);
  }
};

const getDayDotColor = (idx) => {
  const colors = [
    'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 
    'bg-purple-500', 'bg-cyan-500', 'bg-orange-500'
  ];
  return colors[idx] || 'bg-slate-500';
};

const processedSchedules = computed(() => {
  let result = schedules.value;

  // Liste ve Takvim görünümü için mükerrer kayıt kontrolü:
  result = result.filter(s => {
    // 1. Grid (Takvim) görünümünde çakışma ve karmaşayı önlemek için:
    if (!showDayListView.value) {
       // Grup derslerinde şablon kartı varsa ve üye atanmış kayıt da varsa şablonu gizle
       if (s.isGroupClass) {
          const hasMemberAssignment = schedules.value.some(other => 
            !other.isGroupClass && 
            other.groupClassId &&
            String(other.groupClassId) === String(s.groupClassId) && 
            other.dayOfWeek === s.dayOfWeek && 
            other.startTime.substring(0, 5) === s.startTime.substring(0, 5)
          );
          if (hasMemberAssignment) return false;
       }
       
       // Üye bazlı grup kayıtlarını grid üzerinde gizle (çakışma olmasın, şablon veya grup kartı yeterli)
       if (s.lessonType === 'GROUP' && !s.isGroupClass) return false;

       // Mükerrer kayıt kontrolü (Aynı ID veya aynı içerikli mükerrer dönen kayıtlar için)
       const isFirstOccurrence = schedules.value.findIndex(other => 
         other.id === s.id || (
           other.memberId === s.memberId && 
           other.dayOfWeek === s.dayOfWeek && 
           other.startTime.substring(0, 5) === s.startTime.substring(0, 5) &&
           other.lessonType === s.lessonType &&
           other.instructorId === s.instructorId
         )
       ) === result.indexOf(s);
       
       if (!isFirstOccurrence) return false;
       
       // Fitness (General) kayıtları çok fazlaysa grid'i kirletmemesi için tekilleştirme
       if (s.lessonType === 'GENERAL' && s.memberId) {
          const hasOtherFitnessAtSameTime = schedules.value.some(other => 
            other.id !== s.id &&
            other.dayOfWeek === s.dayOfWeek &&
            other.startTime.substring(0, 5) === s.startTime.substring(0, 5) &&
            other.lessonType === 'GENERAL' &&
            schedules.value.indexOf(other) < schedules.value.indexOf(s)
          );
          // Not: Fitness derslerini gridde tamamen tekilleştirmiyoruz çünkü her üyenin programı farklı olabilir 
          // ama ÜST ÜSTE binmiş mükerrer aynı üye kayıtlarını yukarıdaki isFirstOccurrence zaten eliyor.
       }
    }

    // 2. Liste (Table) görünümünde sadece GERÇEK ATAMALARI göster (Boş şablonları gizle)
    if (showDayListView.value) {
       // Boş grup şablonlarını ve atamasız özel ders slotlarını listede gizle
       if (s.isGroupClass || !s.memberId) return false;
    }
    
    return true;
  });

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s => {
      const instructorName = s.instructor?.displayName?.toLowerCase() || s.instructor?.fullName?.toLowerCase() || s.instructor?.user?.username?.toLowerCase() || '';
      const memberName = s.member?.fullName?.toLowerCase() || '';
      const specialtyName = s.specialty?.name?.toLowerCase() || '';
      const lessonName = s.name?.toLowerCase() || s.groupClass?.name?.toLowerCase() || specialtyName || '';
      const notes = s.notes?.toLowerCase() || '';
      const statusLabel = s.attendanceStatus === 'INSIDE' ? 'içeride' : 
                          (s.attendanceStatus === 'COMPLETED' || s.attendanceStatus === 'PRESENT' ? 'tamamlandı' : 
                          (s.attendanceStatus === 'EARLY_EXIT' ? 'erken çıktı' : ''));

      return instructorName.includes(q) || 
             memberName.includes(q) || 
             lessonName.includes(q) || 
             notes.includes(q) || 
             statusLabel.includes(q) ||
             specialtyName.includes(q);
    });
  }
  if (filters.value.lessonType) result = result.filter(s => s.lessonType === filters.value.lessonType);
  if (filters.value.specialtyId) result = result.filter(s => String(s.specialtyId) == String(filters.value.specialtyId));
  if (filters.value.instructorId) result = result.filter(s => String(s.instructorId) == String(filters.value.instructorId));
  if (filters.value.memberId) result = result.filter(s => String(s.memberId) == String(filters.value.memberId));
  if (filters.value.startTime) result = result.filter(s => s.startTime >= filters.value.startTime);
  if (filters.value.endTime) result = result.filter(s => s.endTime <= filters.value.endTime);
  if (filters.value.attendanceStatus) {
    result = result.filter(s => {
      if (filters.value.attendanceStatus === 'NONE') return !s.attendanceStatus;
      return s.attendanceStatus === filters.value.attendanceStatus;
    });
  }
  return result;
});

const filteredMembersForForm = computed(() => {
  if (!scheduleForm.value.lessonType) return [];
  return allMembers.value.filter(m => {
     // Sadece ÜYELERİ getir (Eğitmenleri/Personeli değil)
     if (m.profileType !== 'MEMBER') return false;
     
     let types = m.lessonTypes || [];
     if (types.length === 0) types = ['GENERAL'];
     return types.includes(scheduleForm.value.lessonType);
  });
});

const groupedSchedules = computed(() => {
  if (showDayListView.value) return processedSchedules.value;
  
  const groups = {};
  processedSchedules.value.forEach(s => {
    // Generate grouping key
    const subtitle = s.member 
      ? ((s.category?.name || allCategories.value.find(c => String(c.id) === String(s.categoryId))?.name) || (s.specialty?.name || 'FİTNESS'))
      : '';
    
    // Key includes day, time, type, specialty and instructor
    const key = `${s.dayOfWeek}-${s.startTime}-${s.endTime}-${s.lessonType}-${s.specialtyId || 'none'}-${s.instructorId || 'none'}`;
    
    if (!groups[key]) {
      groups[key] = {
        ...s,
        memberNames: s.member ? [s.member.fullName] : [],
        subtitle: subtitle,
        isGrouped: true,
        originalSchedules: [s]
      };
    } else {
      if (s.member && !groups[key].memberNames.includes(s.member.fullName)) {
        groups[key].memberNames.push(s.member.fullName);
      }
      groups[key].originalSchedules.push(s);
    }
  });

  return Object.values(groups).map(g => {
    if (g.memberNames.length > 1) {
      g.title = g.memberNames.join('\n'); // Newline for multi-member cards
    } else if (g.memberNames.length === 1) {
      g.title = g.memberNames[0];
    } else {
      g.title = g.specialty?.name || g.name || (g.lessonType === 'GROUP' ? 'GRUP DERSİ' : 'GENEL DERS');
    }
    return g;
  });
});

const fitnessLessonsCount = computed(() => processedSchedules.value.filter(s => s.lessonType === 'GENERAL').length);
const privateLessonsCount = computed(() => processedSchedules.value.filter(s => s.lessonType === 'PRIVATE').length);
const groupLessonsCount = computed(() => processedSchedules.value.filter(s => s.lessonType === 'GROUP').length);

const getSchedulesForDay = (dayIdx) => groupedSchedules.value.filter(s => s.dayOfWeek === dayIdx);

const toggleDaySelection = (idx) => {
  if (selectedDayIndex.value === idx) {
    selectedDayIndex.value = null;
  } else {
    selectedDayIndex.value = idx;
  }
};


// Ana saatler değiştiğinde tüm günlere uygula (Kolaylık için)
watch(() => [scheduleForm.value.startTime, scheduleForm.value.endTime], ([newStart, newEnd]) => {
  scheduleForm.value.selectedDays.forEach(day => {
    if (scheduleForm.value.dayTimes[day]) {
      scheduleForm.value.dayTimes[day].start = newStart;
      scheduleForm.value.dayTimes[day].end = newEnd;
    }
  });
});

const getScheduleStyle = (schedule) => {
  if (!schedule.startTime || !schedule.endTime) return {};
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);
  const top = ((startH - 7) * 90 + startM * 1.5);
  const calculatedHeight = ((endH - startH) * 90 + (endM - startM) * 1.5);
  
  // If grouped with many members, we allow min-height to ensure list is visible
  return { 
    top: `${Math.max(0, top)}px`, 
    height: 'auto', // Allow it to grow
    minHeight: `${Math.max(calculatedHeight, 110)}px`,
    zIndex: 10
  };
};

const getDayThemeColor = (idx) => {
  const colors = ['text-rose-500', 'text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-purple-500', 'text-cyan-500', 'text-orange-500'];
  return colors[idx] || 'text-slate-400';
};

const getDayColor = (idx, isActive) => {
  const configs = [
    { color: 'text-rose-500', glow: 'drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(244,63,94,1)]' },
    { color: 'text-blue-500', glow: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(59,130,246,1)]' },
    { color: 'text-emerald-500', glow: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(16,185,129,1)]' },
    { color: 'text-amber-500', glow: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(245,158,11,1)]' },
    { color: 'text-purple-500', glow: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(168,85,247,1)]' },
    { color: 'text-cyan-500', glow: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(6,182,212,1)]' },
    { color: 'text-orange-500', glow: 'drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]', activeGlow: 'drop-shadow-[0_0_25px_rgba(249,115,22,1)]' }
  ];

  const conf = configs[idx] || configs[0];
  
  // Return white text with color glow for maximize brightness
  if (isActive) {
    return `text-white ${conf.activeGlow} scale-110 font-black brightness-[2] drop-shadow-sm`;
  }
  return `text-white/90 ${conf.glow} font-black hover:text-white transition-all`;
};

const getDayBgColor = (idx, isActive) => {
  if (idx === undefined) return '';
  if (isActive) {
    const activeColors = [
      'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]',
      'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      'bg-cyan-600 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]',
      'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
    ];
    return activeColors[idx] || 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]';
  }
  return 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200';
};

const getDayGridBg = (idx) => {
  const bgColors = [
    'bg-gradient-to-b from-rose-500/[0.12] to-transparent',    // Sunday
    'bg-gradient-to-b from-blue-500/[0.12] to-transparent',    // Monday
    'bg-gradient-to-b from-emerald-500/[0.12] to-transparent', // Tuesday
    'bg-gradient-to-b from-amber-500/[0.12] to-transparent',   // Wednesday
    'bg-gradient-to-b from-purple-500/[0.12] to-transparent',  // Thursday
    'bg-gradient-to-b from-cyan-500/[0.12] to-transparent',    // Friday
    'bg-gradient-to-b from-orange-500/[0.12] to-transparent'   // Saturday
  ];
  return bgColors[idx] || '';
};

const loadSchedules = async () => {
  try {
    const response = await lessonScheduleService.getCalendar();
    schedules.value = response.schedules || [];
  } catch (err) { console.error('Error', err); }
};

const loadInstructors = async () => {
  try {
    instructors.value = await instructorService.getAll();
  } catch (err) { console.error(err); }
};

const loadPrivateMembers = async () => {
  try {
    const data = await memberService.getAll({ lessonType: 'PRIVATE' });
    privateMembers.value = data;
  } catch (err) { console.error(err); }
};

const loadAllMembers = async () => {
  try {
    const data = await memberService.getAll();
    allMembers.value = Array.isArray(data) ? data : (data.members || []);
  } catch (err) { console.error(err); }
};

const loadSpecialties = async () => {
  try {
    specialties.value = await specialtyService.getAll();
  } catch (err) { console.error(err); }
};

const loadCategories = async (specialtyId) => {
  if (!specialtyId) { categories.value = []; return; }
  try {
    categories.value = await specialtyService.getCategories(specialtyId);
  } catch (err) { console.error(err); }
};

const loadAllCategories = async () => {
  try {
    const response = await apiClient.get('/exercise-categories');
    allCategories.value = response.data;
  } catch (err) { console.error(err); }
};

const onSpecialtyChange = () => { scheduleForm.value.categoryId = ''; loadCategories(scheduleForm.value.specialtyId); };

const resetFilters = () => {
  filters.value = { instructorId: '', memberId: '', specialtyId: '', lessonType: '', accessType: '', startDate: '', endDate: '', startTime: '', endTime: '', attendanceStatus: '' };
  searchQuery.value = '';
};

const editSchedule = async (schedule) => {
  console.log('[CALENDAR] Editing:', JSON.parse(JSON.stringify(schedule)));
  editingSchedule.value = schedule;
  
  // 1. Önce branşa ait kategorileri çekelim
  if (schedule.specialtyId) {
    await loadCategories(schedule.specialtyId);
  }

  // 2. Formu dolduralım (Kategori hariç)
  scheduleForm.value = {
    instructorId: schedule.instructorId,
    memberId: schedule.memberId || '',
    memberIds: schedule.memberId ? [schedule.memberId] : [],
    specialtyId: schedule.specialtyId || '',
    categoryId: '', // Geçici boş
    selectedDays: [Number(schedule.dayOfWeek)],
    startTime: schedule.startTime.substring(0, 5),
    endTime: schedule.endTime.substring(0, 5),
    dayTimes: {
      [Number(schedule.dayOfWeek)]: {
        start: schedule.startTime.substring(0, 5),
        end: schedule.endTime.substring(0, 5)
      }
    },
    lessonType: schedule.lessonType,
    groupClassId: schedule.groupClassId || '',
    capacity: schedule.capacity || 20,
    isActive: schedule.isActive !== undefined ? schedule.isActive : true,
    notes: schedule.notes ? schedule.notes.split(' - PlanID:')[0] : ''
  };
  
  showScheduleForm.value = true;

  // 3. Çok kısa bir süre sonra kategoriyi set edelim (DOM render için)
  setTimeout(() => {
    if (schedule.categoryId) {
      console.log('[CALENDAR] Setting CategoryId after delay:', schedule.categoryId);
      scheduleForm.value.categoryId = schedule.categoryId;
    }
  }, 100);
};

const saveSchedule = async () => {
  if (!scheduleForm.value.lessonType || scheduleForm.value.selectedDays.length === 0 || !scheduleForm.value.startTime || !scheduleForm.value.endTime) {
    toast('LÜTFEN TÜM ZORUNLU ALANLARI DOLDURUNUZ', 'error');
    return;
  }

  try {
    const isVirtualId = editingSchedule.value && editingSchedule.value.id.toString().startsWith('group-');
    
    // UUID alanları boş string ise null gönderelim (Backend 500 hatası almamak için)
    const payload = {
      ...scheduleForm.value,
      instructorId: scheduleForm.value.instructorId || null,
      memberId: scheduleForm.value.memberId || null,
      specialtyId: scheduleForm.value.specialtyId || null,
      categoryId: scheduleForm.value.categoryId || null,
      groupClassId: scheduleForm.value.groupClassId || null,
      dayOfWeek: scheduleForm.value.selectedDays[0]
    };

    // Üyeleri döngüye al
    const membersToProcess = scheduleForm.value.memberIds.length > 0 
      ? scheduleForm.value.memberIds 
      : [null];

    if (editingSchedule.value && !isVirtualId) {
      // Mevcut kaydı ilk seçilen üye ve günle güncelle
      const firstMemberId = membersToProcess[0];
      const firstDay = scheduleForm.value.selectedDays[0];
      const firstTime = scheduleForm.value.dayTimes[firstDay];
      
      await lessonScheduleService.update(editingSchedule.value.id, { 
        ...payload, 
        memberId: firstMemberId,
        dayOfWeek: firstDay,
        startTime: firstTime?.start || payload.startTime,
        endTime: firstTime?.end || payload.endTime
      });
      
      // Eğer başka üyeler veya başka günler varsa onlar için yeni kayıtlar oluştur
      // (Düzenleme modunda genellikle tek kayıt üzerinde çalışılır ama seçilen yeni kombinasyonlar için create yapıyoruz)
      for (const mId of membersToProcess) {
        for (const dIdx of scheduleForm.value.selectedDays) {
          // Eğer bu kombinasyon zaten yukarıdaki update ile yapıldıysa atla
          if (mId === firstMemberId && dIdx === firstDay) continue;
          
          const t = scheduleForm.value.dayTimes[dIdx];
          await lessonScheduleService.create({ 
            ...payload, 
            memberId: mId,
            dayOfWeek: dIdx,
            startTime: t?.start || payload.startTime,
            endTime: t?.end || payload.endTime,
            sendNotification: scheduleForm.value.sendNotification // Bildirim flagi
          });
        }
      }
      toast('PROGRAM GÜNCELLENDİ');
    } else {
      // Yeni kayıt oluşturma (Her üye ve gün kombinasyonu için)
      for (const mId of membersToProcess) {
        for (const day of scheduleForm.value.selectedDays) {
          const t = scheduleForm.value.dayTimes[day];
          await lessonScheduleService.create({ 
            ...payload, 
            memberId: mId,
            dayOfWeek: day,
            startTime: t?.start || payload.startTime,
            endTime: t?.end || payload.endTime,
            sendNotification: scheduleForm.value.sendNotification // Bildirim flagi
          });
        }
      }
      toast('YENİ PROGRAM OLUŞTURULDU');
    }
    closeForm();
    loadSchedules();
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || err.response?.data?.error || 'Kayıt sırasında bir hata oluştu.');
  }
};

const deleteSchedule = async () => {
  if (!editingSchedule.value || !editingSchedule.value.id) return;
  
  const isConfirmed = await confirm('PROGRAMI SİL', 'Bu işlem geri alınamaz. Emin misiniz?');
  
  if (isConfirmed) {
    try {
      await lessonScheduleService.delete(editingSchedule.value.id);
      toast('PROGRAM SİLİNDİ');
      closeForm();
      loadSchedules();
    } catch (err) {
      showAlertError('HATA', 'Silme işlemi başarısız.');
    }
  }
};

const closeForm = () => {
  showScheduleForm.value = false;
  editingSchedule.value = null;
  categories.value = [];
  memberSearchQuery.value = '';
  isMemberSelectOpen.value = false;
  scheduleForm.value = {
    instructorId: '', 
    memberId: '', 
    memberIds: [],
    specialtyId: '', 
    categoryId: '',
    selectedDays: [], 
    startTime: '09:00', 
    endTime: '10:30', 
    dayTimes: {},
    lessonType: 'GENERAL',
    groupClassId: '', 
    capacity: 20, 
    isActive: true, 
    sendNotification: true,
    notes: ''
  };
};

const openAttendanceModal = (schedule) => {
  selectedSchedule.value = schedule;
  showAttendanceModal.value = true;
};

const closeAttendanceModal = () => {
  showAttendanceModal.value = false;
  selectedSchedule.value = null;
};

const takeAttendance = async () => {
  try {
    await lessonScheduleService.takeAttendance({
      lessonScheduleId: selectedSchedule.value.id,
      date: attendanceDate.value
    });
    toast('YOKLAMA BAŞARIYLA ALINDI');
    closeAttendanceModal();
    loadSchedules();
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || err.response?.data?.error || 'Yoklama alınırken bir hata oluştu.');
  }
};

onMounted(() => {
  loadSchedules();
  loadInstructors();
  loadPrivateMembers();
  loadAllMembers();
  loadSpecialties();
  loadAllCategories();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(20px); }
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.9); }
.scale-enter-active, .scale-leave-active { transition: all 0.3s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0); }
</style>
