<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-950">

    <!-- Header -->
    <BaseSearchFilter
      v-model:searchQuery="memberSearch"
      placeholder="ÜYE VEYA PLAN ARA..."
      accent="rose"
      :showToggles="false"
      class="!px-4 !pt-4"
    >
      <template #extra-left>
        <div class="flex items-center gap-4 h-full pl-2 pr-4 border-r border-slate-800/50">
          <button 
            @click="sidebarOpen = !sidebarOpen"
            class="p-2 bg-rose-500/10 border border-slate-800 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all active:scale-95"
            title="Menüyü Aç/Kapat"
          >
            <Menu class="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          
          <div class="flex items-center gap-3">
            <div class="flex-none p-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <BaseMemberAvatar 
                v-if="!isAdmin && auth.user" 
                :src="auth.user.photo" 
                :name="auth.user.fullName || auth.user.username" 
                size="xs" 
                class="ring-1 ring-emerald-500/20 shadow-inner"
              />
              <div v-else class="w-8 h-8 flex items-center justify-center">
                <User class="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span class="text-[0.65rem] font-black text-slate-100 uppercase tracking-widest hidden md:block drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
               {{ auth.user?.fullName || auth.user?.username || 'AYAZ EĞİTMEN' }}
            </span>
          </div>

          <!-- Instructor Filter (admin only) -->
          <div v-if="isAdmin" class="relative">
            <select
              v-model="selectedInstructorFilter"
              @change="applyFilter"
              class="bg-slate-900/50 border border-slate-800 text-[0.6rem] text-rose-400 font-black uppercase tracking-[0.2em] px-3 py-1.5 pr-8 outline-none focus:border-rose-500/50 transition-all appearance-none rounded-lg cursor-pointer"
            >
              <option value="">TÜM EĞİTMENLER</option>
              <option v-for="inst in allInstructors" :key="inst.id" :value="inst.id">
                {{ inst.fullName }}
              </option>
            </select>
            <ChevronDown class="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-rose-500/50 pointer-events-none" />
          </div>
        </div>
      </template>

      <template #extra-actions>
        <div class="flex items-center gap-4 pr-2">
           <div class="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-lg hidden sm:block">
             <span class="text-[0.6rem] text-slate-500 font-black uppercase tracking-widest tabular-nums">
               {{ filteredPlans.length }} PLAN
             </span>
           </div>

           <button 
             v-if="!isAdmin" 
             @click="handleLogout" 
             class="w-9 h-9 flex items-center justify-center bg-rose-500/10 border border-slate-800 text-rose-400 hover:bg-rose-500/20 transition-all rounded-xl active:scale-95"
             title="Güvenli Çıkış"
           >
             <LogOut class="w-4 h-4" />
           </button>
        </div>
      </template>
    </BaseSearchFilter>

    <!-- Body -->
    <div class="flex-1 flex overflow-hidden">

      <!-- 1. LEFT SIDEBAR (MEMBER LIST) -->
      <!-- Mobile Backdrop -->
      <div 
        v-if="sidebarOpen" 
        @click="sidebarOpen = false"
        class="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] animate-in fade-in duration-300"
      ></div>

      <aside 
        :class="[
          sidebarOpen 
            ? 'translate-x-0 w-[280px] lg:w-[320px] lg:ml-4 lg:my-4 lg:mr-0 lg:rounded-2xl opacity-100 shadow-[0_-15px_40px_rgba(244,63,94,0.1)]' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:ml-0 lg:my-4 lg:opacity-0 overflow-hidden'
        ]"
        class="fixed lg:relative top-0 left-0 bg-slate-950/90 lg:bg-slate-950/40 backdrop-blur-xl border-r-2 lg:border-2 border-rose-500/30 flex flex-col z-[70] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-screen lg:h-auto"
      >
        <!-- Mobile Close Button -->
        <div class="lg:hidden flex items-center justify-end p-4 border-b border-rose-500/10">
          <button @click="sidebarOpen = false" class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all">
            <X class="w-6 h-6" />
          </button>
        </div>



        <!-- Education Type Switcher -->
        <div v-if="sidebarOpen" class="px-3 pt-4">
          <div class="flex p-1 bg-slate-900/80 border border-slate-800 rounded-lg shadow-inner gap-1">
            <button 
              @click="educationMode = 'GENERAL'; selectedPlan = null"
              :class="[
                'flex-1 py-2 text-[0.55rem] font-black uppercase tracking-tight transition-all duration-300 rounded-md flex flex-col items-center justify-center',
                educationMode === 'GENERAL' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-slate-300'
              ]"
            >
              <Activity class="w-3 h-3 mb-0.5" /> GENEL
            </button>
            <button 
              @click="educationMode = 'PT'; selectedPlan = null"
              :class="[
                'flex-1 py-2 text-[0.55rem] font-black uppercase tracking-tight transition-all duration-300 rounded-md flex flex-col items-center justify-center',
                educationMode === 'PT' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-500 hover:text-slate-300'
              ]"
            >
              <User class="w-3 h-3 mb-0.5" /> ÖZEL
            </button>
            <button 
              @click="educationMode = 'GROUP'; selectedPlan = null"
              :class="[
                'flex-1 py-2 text-[0.55rem] font-black uppercase tracking-tight transition-all duration-300 rounded-md flex flex-col items-center justify-center',
                educationMode === 'GROUP' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-500 hover:text-slate-300'
              ]"
            >
              <TrendingUp class="w-3 h-3 mb-0.5" /> GRUP
            </button>
          </div>
        </div>


        <!-- Member List -->
        <div class="flex-1 overflow-y-auto custom-scroll px-2 py-3 space-y-1">
          <div v-if="loading" class="p-6 text-center">
            <Loader2 class="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
            <p class="text-[0.6rem] text-slate-600 font-black uppercase tracking-widest">YÜKLÜYOR...</p>
          </div>
          <div v-else-if="searchedPlans.length === 0" class="p-6 text-center">
            <ClipboardCheck class="w-8 h-8 text-slate-800 mx-auto mb-2" />
            <p class="text-[0.6rem] text-slate-600 font-black uppercase tracking-widest">ÜYE BULUNAMADI</p>
          </div>
          <div v-else
            v-for="plan in searchedPlans"
            :key="plan.id"
            @click="selectPlan(plan)"
            :class="[
              'p-2 cursor-pointer transition-all border-l-[3px] flex items-center gap-3 relative group',
              selectedPlan?.id === plan.id
                ? 'bg-rose-600/20 border-l-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-b border-rose-500/5'
            ]"
          >
            <!-- Avatar / Icon -->
            <div class="relative flex-none">
              <BaseMemberAvatar 
                :src="plan.member?.photo" 
                :name="plan.member?.fullName" 
                :size="sidebarCollapsed ? 'sm' : 'md'"
                :class="selectedPlan?.id === plan.id ? 'ring-2 ring-rose-500/50 ring-offset-2 ring-offset-slate-950' : ''"
              />
              <div v-if="getMissedCount(plan) > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 border border-slate-950 rounded-full flex items-center justify-center shadow-lg">
                <span class="text-[0.5rem] text-white font-black">{{ getMissedCount(plan) }}</span>
              </div>
            </div>

            <!-- Member Info (Only when not collapsed) -->
            <div v-if="!sidebarCollapsed" class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <p class="text-[0.6rem] lg:text-[0.7rem] font-black uppercase tracking-tight truncate">{{ plan.member?.fullName || 'İSİMSİZ ÜYE' }}</p>
                <div class="flex items-center gap-1">
                   <span class="text-[0.5rem] lg:text-[0.55rem] font-black text-rose-400/80">{{ getCompletionRate(plan) }}%</span>
                </div>
              </div>
              <p class="text-[0.45rem] lg:text-[0.5rem] text-slate-500 font-black uppercase tracking-widest truncate group-hover:text-slate-400 transition-colors">{{ plan.title }}</p>
              
              <!-- Mini Progress Bar -->
              <div class="mt-1 h-0.5 lg:h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
                <div
                  class="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  :style="{ width: getCompletionRate(plan) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Tooltip for Collapsed Mode -->
            <div v-if="sidebarCollapsed" class="absolute left-full ml-2 px-3 py-1 bg-slate-900 border border-rose-500/30 text-[0.6rem] font-black text-white uppercase tracking-widest opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-2xl rounded-sm border-l-2">
              {{ plan.member?.fullName }} ({{ getCompletionRate(plan) }}%)
            </div>
          </div>
        </div>

      </aside>

      <!-- Right: Detail Panel -->
      <div 
        :class="[sidebarOpen ? 'lg:ml-0' : 'lg:ml-4']"
        class="flex-1 flex flex-col overflow-hidden m-4 bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl relative transition-all duration-500"
      >
        <!-- Inline Views Wrapper (Switching between member overview and specific tasks) -->
        <Transition name="fade-slide" mode="out-in">
          <!-- 1. EMPTY STATE -->
          <div v-if="!selectedPlan" class="flex-1 flex items-center justify-center flex-col gap-4 opacity-30 h-full">
            <ClipboardCheck class="w-20 h-20 text-slate-700" />
            <p class="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest">Soldaki listeden bir üye seçin</p>
          </div>

           <!-- 2. APPROVE VIEW (Inline) -->
            <div v-else-if="showApproveModal" class="h-full flex flex-col bg-slate-900/60 transition-all duration-500 overflow-y-auto custom-scroll">
              <div class="p-4 lg:p-5 w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2 group hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                     <span class="text-[0.6rem] text-slate-500 font-black uppercase tracking-widest mb-1 block">ÜYE BİLGİSİ</span>
                     <div class="flex items-center gap-4">
                       <BaseMemberAvatar :src="selectedPlan.member?.photo" :name="selectedPlan.member?.fullName" size="lg" class="ring-2 ring-emerald-500/20" />
                       <div>
                         <p class="text-xl font-black text-slate-100 uppercase tracking-tight">{{ selectedPlan.member?.fullName }}</p>
                         <p class="text-[0.65rem] text-slate-500 font-bold uppercase tracking-widest">{{ selectedPlan.title }}</p>
                       </div>
                     </div>
                  </div>
                  <div class="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2 group hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                     <span class="text-[0.6rem] text-slate-500 font-black uppercase tracking-widest mb-1 block">TARİH DETAYI</span>
                     <div class="flex items-center gap-4">
                       <div class="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                         <Clock class="w-6 h-6 text-emerald-400" />
                       </div>
                       <div>
                         <p class="text-xl font-black text-emerald-400 uppercase tracking-tight italic">{{ daysOfWeek[approvingDayIdx] }}</p>
                         <p class="text-[0.65rem] text-slate-500 font-bold uppercase tracking-widest">{{ weekDays[approvingDayIdx]?.formattedDate }}</p>
                       </div>
                     </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[0.7rem] text-slate-400 font-black uppercase tracking-[0.2em] block ml-1 italic">EĞİTMEN NOTU VE DEĞERLENDİRME</label>
                  <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                    <textarea
                      v-model="approveNote"
                      rows="3"
                      placeholder="Üye bugünkü idmanda nasıldı? Gözlemleriniz..."
                      class="relative w-full bg-slate-950 border-2 border-slate-800 text-lg text-slate-200 p-4 outline-none resize-none focus:border-emerald-500/50 transition-all duration-500 rounded-2xl shadow-2xl placeholder:text-slate-700"
                    ></textarea>
                  </div>
                </div>

             </div>
           </div>

           <!-- 3. TRANSFER VIEW (Inline) -->
            <div v-else-if="showTransferModal" class="h-full flex flex-col bg-slate-900/60 transition-all duration-500 overflow-y-auto custom-scroll">
              <div class="p-4 lg:p-5 w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div class="space-y-6">
                  <p class="text-lg text-slate-400 font-black uppercase tracking-widest italic ml-1">İdman hangi güne aktarılsın?</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                    <template v-for="(dayName, idx) in daysOfWeek" :key="idx">
                      <button
                        v-if="idx !== transferFromDay"
                        @click="isPastDay(idx) ? null : (transferTargetDay = transferTargetDay === idx ? null : idx)"
                        :disabled="isPastDay(idx)"
                        :class="[
                          'group relative py-12 px-4 border-2 transition-all duration-500 rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden shadow-2xl active:scale-95',
                          isPastDay(idx)
                            ? 'bg-amber-950/20 border-amber-900/30 text-amber-900/50 cursor-not-allowed grayscale'
                            : transferTargetDay === idx
                              ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-amber-500/40 hover:text-amber-400'
                        ]"
                      >
                        <div v-if="transferTargetDay === idx" class="absolute -bottom-4 -right-4 opacity-20">
                           <CheckCircle class="w-24 h-24 text-white" />
                        </div>
                        <span class="text-[0.85rem] font-black uppercase tracking-[0.25em]">{{ dayName }}</span>
                        <div v-if="isPastDay(idx)" class="mt-1 flex flex-col items-center gap-1">
                          <span class="text-[0.5rem] font-black text-amber-600/60 bg-amber-500/5 px-2 py-0.5 border border-amber-500/20 rounded-md uppercase tracking-wider">TELAFİ SEÇİLEMEZ</span>
                          <span class="text-[0.4rem] font-bold text-amber-800 uppercase tracking-widest">(GEÇMİŞ GÜN)</span>
                        </div>
                        <span v-else-if="weekDays[idx]?.isRestDay" class="text-[0.55rem] font-black text-indigo-400/80 bg-indigo-500/10 px-3 py-1 border border-indigo-500/20 rounded-full font-mono">REST</span>
                      </button>
                    </template>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[0.7rem] text-slate-400 font-black uppercase tracking-[0.2em] block ml-1 italic">TELAFİ NOTU (Zorunlu değil)</label>
                  <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                    <textarea
                      v-model="transferNote"
                      rows="3"
                      placeholder="Aktarım hakkında kısa bilgi..."
                      class="relative w-full bg-slate-950 border-2 border-slate-800 text-lg text-slate-200 p-4 outline-none resize-none focus:border-amber-500/50 transition-all duration-500 rounded-2xl shadow-2xl placeholder:text-slate-700"
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>

          <!-- 4. PLAN DETAIL VIEW (Default) -->
          <div v-else class="h-full flex flex-col overflow-hidden">
          <!-- Plan Header -->
          <div class="flex-none bg-slate-900/60 border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="flex-none">
                <BaseMemberAvatar 
                  :src="selectedPlan.member?.photo" 
                  :name="selectedPlan.member?.fullName" 
                  size="lg"
                />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-black text-slate-100 uppercase tracking-tight">{{ selectedPlan.member?.fullName }}</p>
                </div>
                <p class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest">{{ selectedPlan.title }}</p>
                <div v-if="selectedPlan.instructor || (!isAdmin && auth.user)" class="flex items-center gap-1 mt-1">
                  <span class="text-[0.55rem] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 uppercase tracking-widest">
                    🎓 {{ selectedPlan.instructor?.fullName || auth.user?.fullName || auth.user?.username }}
                  </span>
                </div>
                <div v-else class="flex items-center gap-1 mt-1">
                  <span class="text-[0.55rem] font-black text-slate-600 bg-slate-800 border border-slate-700 px-1.5 py-0.5 uppercase tracking-widest">Eğitmen Atanmamış</span>
                </div>
              </div>
            </div>



            <!-- Stats Bar (Interactive Filters) + Week Switcher -->
            <div class="flex items-center gap-1.5 lg:gap-2.5 flex-wrap">
              <!-- All Button -->
              <button 
                @click="statusFilter = null"
                :class="['flex-none text-center transition-all duration-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border-2 shadow-lg min-w-[75px] lg:min-w-[90px]', 
                         statusFilter === null ? 'bg-slate-700 border-slate-400 text-white shadow-[0_0_20px_rgba(100,116,139,0.5)]' : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-500/50 hover:bg-slate-500/10']"
              >
                <span class="block text-[0.4rem] lg:text-[0.5rem] font-bold uppercase tracking-widest mb-0.5 opacity-70">LİSTE</span>
                <span class="text-base lg:text-lg font-black uppercase">TÜMÜ</span>
              </button>

              <!-- Completed Button -->
              <button 
                @click="statusFilter = (statusFilter === 'COMPLETED' ? null : 'COMPLETED')"
                :class="['flex-none text-center transition-all duration-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border-2 shadow-lg min-w-[75px] lg:min-w-[90px]', 
                         statusFilter === 'COMPLETED' ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-900/40 border-slate-700/50 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]']"
              >
                <span class="block text-[0.4rem] lg:text-[0.5rem] font-bold uppercase tracking-widest mb-0.5 opacity-70">TAMAM</span>
                <span class="text-base lg:text-lg font-black tabular-nums">{{ getCompletedCount(selectedPlan) }}</span>
              </button>

              <!-- Skipped Button -->
              <button 
                @click="statusFilter = (statusFilter === 'SKIPPED' ? null : 'SKIPPED')"
                :class="['flex-none text-center transition-all duration-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border-2 shadow-lg min-w-[75px] lg:min-w-[90px]', 
                         statusFilter === 'SKIPPED' ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-slate-900/40 border-slate-700/50 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]']"
              >
                <span class="block text-[0.4rem] lg:text-[0.5rem] font-bold uppercase tracking-widest mb-0.5 opacity-70">KAÇIRDI</span>
                <span class="text-base lg:text-lg font-black tabular-nums">{{ getMissedCount(selectedPlan) }}</span>
              </button>

              <!-- Transferred Button -->
              <button 
                @click="statusFilter = (statusFilter === 'TRANSFERRED' ? null : 'TRANSFERRED')"
                :class="['flex-none text-center transition-all duration-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border-2 shadow-lg min-w-[75px] lg:min-w-[90px]', 
                         statusFilter === 'TRANSFERRED' ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-slate-900/40 border-slate-700/50 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]']"
              >
                <span class="block text-[0.4rem] lg:text-[0.5rem] font-bold uppercase tracking-widest mb-0.5 opacity-70">TELAFİ</span>
                <span class="text-base lg:text-lg font-black tabular-nums">{{ getTransferredCount(selectedPlan) }}</span>
              </button>

              <!-- Pending Button -->
              <button 
                @click="statusFilter = (statusFilter === 'PENDING' ? null : 'PENDING')"
                :class="['flex-none text-center transition-all duration-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border-2 shadow-lg min-w-[75px] lg:min-w-[90px]', 
                         statusFilter === 'PENDING' ? 'bg-sky-600 border-sky-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'bg-slate-900/40 border-slate-700/50 text-sky-400 hover:border-sky-500/50 hover:bg-sky-500/10 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]']"
              >
                <span class="block text-[0.4rem] lg:text-[0.5rem] font-bold uppercase tracking-widest mb-0.5 opacity-70">BEKLEYEN</span>
                <span class="text-base lg:text-lg font-black tabular-nums">
                  {{ (selectedPlan.days?.filter(d => !d.isRestDay).length || 0) - getCompletedCount(selectedPlan) - getMissedCount(selectedPlan) - getTransferredCount(selectedPlan) }}
                </span>
              </button>

              <!-- Success Stat -->
              <div class="flex-none text-center px-3 py-1.5 lg:px-4 lg:py-2 border-2 border-slate-800 bg-slate-900/20 rounded-lg min-w-[65px] lg:min-w-[80px]">
                <span class="block text-[0.4rem] lg:text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest mb-0.5">BAŞARI</span>
                <span class="text-base lg:text-lg font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{{ getCompletionRate(selectedPlan) }}%</span>
              </div>

              <!-- Week Switcher (Back in Header) -->
              <div class="flex items-center gap-1 lg:gap-2 ml-1 lg:ml-2 border-l border-slate-800 pl-2 lg:pl-4">
                <button @click.stop="currentWeek = Math.max(1, currentWeek - 1)" class="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center border border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all rounded-sm">
                  <ChevronLeft class="w-3.5 h-3.5" />
                </button>
                <div class="flex flex-col items-center min-w-[60px] lg:min-w-[80px]">
                  <span class="text-[0.4rem] text-slate-500 font-black uppercase tracking-widest">AKTİF</span>
                  <span class="text-[0.55rem] lg:text-[0.65rem] font-black text-slate-100 uppercase tracking-widest">{{ currentWeek }}. HAFTA</span>
                </div>
                <button @click.stop="currentWeek++" class="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center border border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-all rounded-sm">
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          <!-- Week Days Grid -->
          <div class="flex-1 overflow-y-auto p-4 custom-scroll">
            <div v-if="filteredWeekDays.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 gap-3">
               <Search class="w-12 h-12" />
               <p class="text-[0.65rem] font-black uppercase tracking-[0.2em]">BU FİLTREYE UYGUN ANTRENMAN BULUNAMADI</p>
               <button @click="statusFilter = null" class="text-[0.6rem] font-bold text-sky-400 underline uppercase tracking-widest">Filtreyi Temizle</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <div
                v-for="day in filteredWeekDays"
                :key="day.dayOfWeek"
                :class="['group rounded-3xl border flex flex-col overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl relative', getDayCardClass(day, day.dayOfWeek)]"
              >
                <!-- Day Header -->
                <div :class="['px-6 py-4 flex flex-col gap-1 relative overflow-hidden', getDayHeaderClass(day, day.dayOfWeek)]">
                  <!-- Abstract Background Glow -->
                  <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
                  
                  <div class="flex items-start justify-between relative z-10">
                    <div class="flex flex-col">
                      <h3 class="text-2xl font-black uppercase tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] leading-none italic">
                        {{ daysOfWeek[day.dayOfWeek] }}
                      </h3>
                      <span class="text-[0.6rem] font-black text-slate-100/50 tracking-[0.2em] mt-1">{{ day.formattedDate }}</span>
                    </div>

                    <!-- Status Badge -->
                    <div v-if="!day.isRestDay" class="flex-none">
                      <div v-if="getDayLog(day.dayOfWeek)?.status === 'COMPLETED'" class="bg-emerald-500/20 border border-emerald-400/50 px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2">
                        <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                        <span class="text-[0.65rem] font-black text-emerald-400 uppercase tracking-widest">TAMAM</span>
                      </div>
                      <div v-else-if="getDayLog(day.dayOfWeek)?.status === 'TRANSFERRED'" class="bg-amber-500/20 border border-amber-400/50 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2">
                        <ArrowRightLeft class="w-3.5 h-3.5 text-amber-400" />
                        <span class="text-[0.65rem] font-black text-amber-400 uppercase tracking-widest">TELAFİ</span>
                      </div>
                      <div v-else-if="getDayLog(day.dayOfWeek)?.status === 'SKIPPED' || isPastDay(day.dayOfWeek)" class="bg-rose-500/20 border border-rose-400/50 px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2">
                        <XCircle class="w-3.5 h-3.5 text-rose-400" />
                        <span class="text-[0.65rem] font-black text-rose-400 uppercase tracking-widest">KAÇTI</span>
                      </div>
                      <div v-else-if="isTodayDay(day.dayOfWeek)" class="bg-sky-500/20 border border-sky-400/50 px-3 py-1.5 rounded-full shadow-[0_0_25px_rgba(14,165,233,0.5)] flex items-center gap-2 animate-pulse">
                        <Zap class="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                        <span class="text-[0.65rem] font-black text-sky-400 uppercase tracking-widest">BUGÜN</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Body -->
                <div v-if="!day.isRestDay" class="p-6 flex-1 flex flex-col gap-5 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
                  <!-- Time & Category -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 group/time">
                      <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover/time:border-rose-500/50 transition-colors shadow-inner">
                        <Clock class="w-4 h-4 text-rose-500 animate-pulse-slow" />
                      </div>
                      <span class="text-sm font-black text-slate-200 tracking-[0.1em] italic">
                        {{ (day.startTime || '09:00').substring(0,5) }} – {{ (day.endTime || '10:30').substring(0,5) }}
                      </span>
                    </div>

                    <div class="flex gap-1.5">
                      <span
                        v-for="cat in getDayCategories(day.dayOfWeek)"
                        :key="cat"
                        class="text-[0.75rem] font-black text-indigo-300 bg-indigo-500/10 px-3 py-1.5 border border-indigo-500/20 rounded-md uppercase tracking-wider"
                      >{{ cat }}</span>
                    </div>
                  </div>

                  <!-- Exercise List -->
                  <div class="space-y-3 flex-1">
                    <div 
                      v-for="ex in getDayExercises(day.dayOfWeek)" 
                      :key="ex.id"
                      class="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl hover:border-slate-600 transition-all group/ex"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover/ex:scale-150 transition-transform"></div>
                        <span class="text-[0.75rem] font-black text-slate-100 uppercase tracking-tight truncate italic">{{ ex.exercise?.name }}</span>
                      </div>
                      <div class="flex-none flex items-center gap-2 ml-4">
                        <div class="flex flex-col items-center">
                          <span class="text-[0.7rem] font-black text-emerald-400 leading-none">{{ ex.sets }}</span>
                          <span class="text-[0.4rem] text-slate-500 font-bold tracking-tighter">SET</span>
                        </div>
                        <div class="w-px h-4 bg-slate-800"></div>
                        <div class="flex flex-col items-center">
                          <span class="text-[0.7rem] font-black text-emerald-400 leading-none">{{ ex.reps }}</span>
                          <span class="text-[0.4rem] text-slate-500 font-bold tracking-tighter">REP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Notes / Extra Info -->
                  <div v-if="getDayLog(day.dayOfWeek)?.extraWorkouts?.length || getDayLog(day.dayOfWeek)?.notes" class="space-y-2">
                    <div v-if="getDayLog(day.dayOfWeek)?.extraWorkouts?.length" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 shadow-inner">
                      <div class="flex items-center gap-2 mb-2">
                        <Activity class="w-3 h-3 text-amber-500" />
                        <span class="text-[0.55rem] font-black text-amber-400 uppercase tracking-widest">+ TELAFİ</span>
                      </div>
                      <p v-for="ew in getDayLog(day.dayOfWeek).extraWorkouts" :key="ew.dayFrom" class="text-[0.6rem] text-amber-200/60 font-medium">
                        {{ daysOfWeek[ew.dayFrom] }} → {{ ew.categories?.join(', ') }}
                      </p>
                    </div>

                    <div v-if="getDayLog(day.dayOfWeek)?.notes" class="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3 italic">
                      <div class="flex items-center gap-2 mb-1.5">
                        <MessageSquare class="w-3 h-3 text-slate-500" />
                        <span class="text-[0.5rem] text-slate-500 font-bold uppercase tracking-widest">Hoca Notu</span>
                      </div>
                      <p class="text-[0.65rem] text-slate-300">{{ getDayLog(day.dayOfWeek).notes }}</p>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <template v-if="isTodayDay(day.dayOfWeek) || isPastDay(day.dayOfWeek)">
                      <button
                        v-if="getDayLog(day.dayOfWeek)?.status !== 'COMPLETED' && getDayLog(day.dayOfWeek)?.status !== 'TRANSFERRED'"
                        @click="openApproveDialog(day.dayOfWeek)"
                        class="flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest bg-emerald-600 rounded-xl text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle class="w-4 h-4" /> ONAY
                      </button>
                      <button
                        v-if="isPastDay(day.dayOfWeek) && getDayLog(day.dayOfWeek)?.status !== 'TRANSFERRED' && getDayLog(day.dayOfWeek)?.status !== 'COMPLETED'"
                        @click="openTransferDialog(day.dayOfWeek)"
                        class="px-4 py-3 text-[0.65rem] font-black bg-slate-900 border border-amber-500/40 text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg"
                        title="Telafi Ata"
                      >
                        <ArrowRightLeft class="w-4 h-4" />
                      </button>
                      <button
                        v-if="getDayLog(day.dayOfWeek)?.status === 'COMPLETED'"
                        @click="revertDay(day.dayOfWeek)"
                        class="px-4 py-3 text-[0.65rem] font-black bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/50 transition-all rounded-xl shadow-lg"
                        title="Geri Al"
                      >
                        <RotateCcw class="w-4 h-4" />
                      </button>
                    </template>
                    <div v-else class="flex-1 py-3 text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-600 text-center border border-slate-800 rounded-xl italic">
                      Bekleniyor...
                    </div>
                  </div>
                </div>

                <!-- Rest Day View -->
                <div v-else class="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/40 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div class="w-16 h-16 rounded-full bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-inner">
                     <Moon class="w-8 h-8 text-indigo-500/30" />
                  </div>
                  <span class="text-[0.7rem] text-indigo-400/80 font-black uppercase tracking-[0.3em] text-center border-b border-indigo-500/20 pb-1">DİNLENME GÜNÜ</span>
                  
                  <!-- If has extra workouts on rest day -->
                  <div v-if="getDayLog(day.dayOfWeek)?.extraWorkouts?.length" class="mt-4 w-full">
                    <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-xl">
                      <div class="flex items-center gap-2 mb-2">
                        <Activity class="w-4 h-4 text-amber-500" />
                        <span class="text-[0.6rem] font-black text-amber-400 uppercase tracking-widest">+ TELAFİ VAR</span>
                      </div>
                      <button @click="openApproveDialog(day.dayOfWeek)" class="w-full py-2 bg-amber-500 text-slate-950 text-[0.6rem] font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors">TELAFİYİ ONAYLA</button>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</div>
</div>


    <!-- 3. ACTION FOOTER (Standardized) -->
    <BaseActionFooter full-width>
      <div class="w-full flex items-center justify-between px-4">
        <!-- Action Buttons -->
        <div class="flex items-center gap-[10px]">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="KAPAT" v-if="!showApproveModal && !showTransferModal">
            <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>

          <!-- Actions for Approve Modal -->
          <template v-if="showApproveModal">
             <BaseButton variant="dark" size="icon" square @click="showApproveModal = false" title="VAZGEÇ" class="border-rose-500/30">
               <template #icon><X class="w-5 h-5 text-rose-500" /></template>
             </BaseButton>
             <BaseButton variant="emerald" size="icon" square @click="confirmApprove" :loading="saving" title="ONAYLA">
               <template #icon><CheckCircle class="w-5 h-5" /></template>
             </BaseButton>
          </template>

          <!-- Actions for Transfer Modal -->
          <template v-if="showTransferModal">
             <BaseButton variant="dark" size="icon" square @click="showTransferModal = false" title="VAZGEÇ" class="border-rose-500/30">
               <template #icon><X class="w-5 h-5 text-rose-500" /></template>
             </BaseButton>
             <BaseButton variant="amber" size="icon" square @click="confirmTransfer" :loading="saving" :disabled="transferTargetDay === null" title="TELAFİ ATAMASINI ONAYLA">
               <template #icon><ArrowRightLeft class="w-5 h-5" /></template>
             </BaseButton>
          </template>

          <div class="w-px h-6 bg-slate-800 mx-1"></div>
        </div>

        <!-- Selected Member Stats (Only when a plan is selected) -->
        <div v-if="selectedPlan" class="flex-1 flex items-center overflow-x-auto custom-scroll no-scrollbar ml-4">
          <div class="flex items-center justify-between w-full h-[48px]">
            <!-- Goals -->
            <div class="flex flex-col">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5">HEDEFLER</span>
              <div class="flex gap-1.5">
                <span 
                  v-for="goal in (selectedPlan.member?.fitnessGoals || ['Bilinmiyor'])" 
                  :key="goal"
                  class="px-2 py-0.5 lg:px-2.5 lg:py-1 bg-slate-800/50 border border-slate-700 text-[0.55rem] lg:text-[0.65rem] font-black text-slate-100 uppercase tracking-tight shadow-sm"
                >
                  {{ goal === 'Zayıflamak' ? 'ZAYIFLA' : goal === 'Kilo Almak' ? 'KİLO AL' : goal.toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Current Weight -->
            <div class="flex flex-col">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5">GÜNCEL KG</span>
              <span class="text-sm lg:text-lg font-black text-indigo-400 tabular-nums drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                {{ selectedPlan.member?.measurements?.[0]?.weight || selectedPlan.member?.weight || selectedPlan.member?.startingWeight || '-' }} <span class="text-[0.5rem] lg:text-[0.6rem] opacity-60 ml-0.5">KG</span>
              </span>
            </div>

            <!-- Target Weight -->
            <div class="flex flex-col">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5">HEDEF KG</span>
              <span class="text-sm lg:text-lg font-black text-rose-500 tabular-nums drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                {{ selectedPlan.member?.targetWeight || '-' }} <span class="text-[0.5rem] lg:text-[0.6rem] opacity-60 ml-0.5">KG</span>
              </span>
            </div>

            <!-- Remaining -->
            <div class="flex flex-col">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5 uppercase">KALAN</span>
              <span class="text-sm lg:text-lg font-black text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                {{ calculateRemaining(selectedPlan.member) }} <span class="text-[0.5rem] lg:text-[0.6rem] opacity-60 ml-0.5">KG</span>
              </span>
            </div>

            <!-- Progress -->
            <div class="hidden lg:flex flex-col min-w-[140px] lg:min-w-[200px]">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5">İLERLEME BAŞARISI</span>
              <div class="flex items-center gap-3 lg:gap-4">
                <div class="flex-1 h-2 lg:h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                  <div 
                    class="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 animate-pulse-slow rounded-full"
                    :style="{ width: calculateProgress(selectedPlan.member) + '%' }"
                  ></div>
                </div>
                <div class="flex flex-col leading-none">
                  <span class="text-xs lg:text-sm font-black text-white tabular-nums">{{ calculateProgress(selectedPlan.member) }}%</span>
                  <span class="text-[0.35rem] lg:text-[0.4rem] font-bold text-slate-600 uppercase tracking-widest">GÜNCEL</span>
                </div>
              </div>
            </div>

            <!-- BMI Status -->
            <div class="hidden lg:flex flex-col border-l border-slate-800 lg:pl-10">
              <span class="text-[0.45rem] lg:text-[0.55rem] text-slate-500 font-black uppercase tracking-widest mb-1 lg:mb-1.5">DURUM (BKİ)</span>
              <div class="flex items-center gap-2 lg:gap-3">
                <span 
                  :class="getBMIStatus(selectedPlan.member?.measurements?.[0]?.bmi || 0).color"
                  class="text-xs lg:text-sm font-black uppercase tracking-widest shadow-sm"
                >
                  {{ getBMIStatus(selectedPlan.member?.measurements?.[0]?.bmi || 0).label }}
                </span>
                <span class="text-[0.5rem] lg:text-[0.6rem] text-slate-400 font-black tabular-nums border-l border-slate-800 pl-2 lg:pl-3">BKİ: {{ selectedPlan.member?.measurements?.[0]?.bmi || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseActionFooter>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClipboardCheck, Search, X, Loader2, CheckCircle, XCircle,
  ArrowRightLeft, Clock, ChevronLeft, ChevronRight, Zap,
  RotateCcw, ChevronDown, LogOut, User, TrendingDown, TrendingUp, Activity, Menu, ArrowLeft
} from 'lucide-vue-next'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import api from '../../utils/api'
const { apiClient } = api
import { useAuthStore } from '../../store/auth'
import Storage from '../../utils/Storage'


const auth = useAuthStore()
const router = useRouter()
const isAdmin = computed(() => ['ADMIN', 'SUPER_MASTER', 'MASTER', 'MUDUR', 'RECEPTIONIST'].includes(auth.user?.role))

// --- Progress Calculation Functions ---
const calculateRemaining = (member) => {
  if (!member) return '-'
  const current = member.measurements?.[0]?.weight || member.weight || member.startingWeight || 0
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
  if (!member) return 0
  const startWeight = member.startingWeight
  const targetWeight = member.targetWeight
  const currentWeight = member.measurements?.[0]?.weight || member.weight || member.startingWeight
  
  if (!startWeight || !targetWeight || !currentWeight) return 0
  
  const totalChangeNeeded = Math.abs(startWeight - targetWeight)
  const actualChange = Math.abs(startWeight - currentWeight)
  
  if (totalChangeNeeded === 0) return 0
  
  const progress = (actualChange / totalChangeNeeded) * 100
  return Math.min(Math.max(Math.round(progress), 0), 100)
}

const getBMIStatus = (bmi) => {
  if (!bmi) return { label: '-', color: 'text-slate-500' }
  if (bmi < 18.5) return { label: 'ZAYIF', color: 'text-sky-400' }
  if (bmi < 25) return { label: 'NORMAL', color: 'text-emerald-400' }
  if (bmi < 30) return { label: 'KİLOLU', color: 'text-amber-400' }
  return { label: 'OBEZ', color: 'text-rose-500' }
}
// --------------------------------------

const plans = ref([])
import Swal from 'sweetalert2'
const allInstructors = ref([])
const loading = ref(false)
const saving = ref(false)
const selectedPlan = ref(null)
const currentWeek = ref(1)
const memberSearch = ref('')
const selectedInstructorFilter = ref('')
const statusFilter = ref(null)
const educationMode = ref('GENERAL') // 'PT', 'GROUP', or 'GENERAL'

// Approve Modal State
const showApproveModal = ref(false)
const approvingDayIdx = ref(null)
const approveNote = ref('')

// Transfer Modal State
const showTransferModal = ref(false)
const transferFromDay = ref(null)
const transferTargetDay = ref(null)
const transferNote = ref('')

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

// Filter by selected instructor (admin only)
const filteredPlans = computed(() => {
  if (!selectedInstructorFilter.value) return plans.value
  return plans.value.filter(p => p.instructorId === selectedInstructorFilter.value)
})

// Then filter by education mode and search term
const searchedPlans = computed(() => {
  let base = filteredPlans.value
  
  console.log('[TRACKER] Filtering Base Plans:', base.length, 'Current Mode:', educationMode.value)

  // Filter by PT vs Group vs Fitness
  if (educationMode.value === 'PT') {
    // Plans that have 'PT' in the title or are explicitly marked as PT
    base = base.filter(p => !p.isGroup && (p.title?.toUpperCase().includes('PT') || p.planType === 'PT'))
  } else if (educationMode.value === 'GROUP') {
    base = base.filter(p => p.isGroup)
  } else {
    // Generic/General plans
    base = base.filter(p => !p.isGroup && !p.title?.toUpperCase().includes('PT') && p.planType !== 'PT')
  }
  
  console.log('[TRACKER] After Mode Filter:', base.length)

  if (!memberSearch.value) return base
  const q = memberSearch.value.toLowerCase()
  return base.filter(p =>
    p.member?.fullName?.toLowerCase().includes(q) ||
    p.title?.toLowerCase().includes(q)
  )
})

// Summary stats
const avgCompletionRate = computed(() => {
  if (!searchedPlans.value.length) return 0
  return Math.round(searchedPlans.value.reduce((sum, p) => sum + getCompletionRate(p), 0) / searchedPlans.value.length)
})
const totalMissed = computed(() => searchedPlans.value.reduce((sum, p) => sum + getMissedCount(p), 0))

const weekDays = computed(() => {
  if (!selectedPlan.value) return []
  const baseDate = new Date(selectedPlan.value.startDate)
  
  return daysOfWeek.map((name, idx) => {
    const dayData = selectedPlan.value.days?.find(d => d.dayOfWeek === idx)
    // Calculate actual date for this week and day
    const actualDate = new Date(baseDate)
    const daysToAdd = ((currentWeek.value - 1) * 7) + idx
    actualDate.setDate(actualDate.getDate() + daysToAdd)
    
    const formattedDate = actualDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
    const isoDate = actualDate.toISOString().split('T')[0]

    return {
      ...(dayData || { dayOfWeek: idx, isRestDay: true, startTime: null, endTime: null }),
      formattedDate,
      isoDate
    }
  })
})

const getDayLog = (dayIdx) => {
  return selectedPlan.value?.logs?.find(l =>
    l.dayOfWeek === dayIdx && l.weekNumber === currentWeek.value
  ) || null
}

const getDayCategories = (dayIdx) => {
  if (!selectedPlan.value?.items) return ['GENEL']
  const dayItems = selectedPlan.value.items.filter(i => i.dayOfWeek === dayIdx)
  if (dayItems.length === 0) return []
  
  const cats = new Set()
  dayItems.forEach(item => {
    const specialty = item.exercise?.specialty?.name || ''
    const category = item.exercise?.category?.name || ''
    
    if (specialty && category) {
      cats.add(`${specialty} - ${category}`)
    } else if (category) {
      cats.add(category)
    } else if (specialty) {
      cats.add(specialty)
    }
  })
  
  return cats.size > 0 ? Array.from(cats) : ['GENEL']
}

const getDayExercises = (dayIdx) => {
  if (!selectedPlan.value?.items) return []
  return selectedPlan.value.items.filter(i => i.dayOfWeek === dayIdx)
}

const sidebarOpen = ref(window.innerWidth >= 1024)
const sidebarCollapsed = ref(false)

const filteredWeekDays = computed(() => {
  if (!statusFilter.value) return weekDays.value
  
  return weekDays.value.filter(day => {
    if (day.isRestDay) return false
    const log = getDayLog(day.dayOfWeek)
    
    if (statusFilter.value === 'COMPLETED') return log?.status === 'COMPLETED'
    if (statusFilter.value === 'SKIPPED') return log?.status === 'SKIPPED' || (isPastDay(day.dayOfWeek) && !log)
    if (statusFilter.value === 'TRANSFERRED') return log?.status === 'TRANSFERRED'
    if (statusFilter.value === 'PENDING') return !log && !isPastDay(day.dayOfWeek)
    
    return true
  })
})

const todayDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
const isTodayDay = (idx) => idx === todayDayIndex
const isPastDay = (idx) => idx < todayDayIndex

const getDayCardClass = (day, idx) => {
  const log = getDayLog(idx)
  if (log?.status === 'COMPLETED') return 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.3)] neon-box-emerald active-neon'
  if (log?.status === 'TRANSFERRED') return 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)] neon-box-amber'
  if (log?.status === 'SKIPPED' || (isPastDay(idx) && !day.isRestDay && !log)) return 'border-amber-500 bg-amber-500/15 shadow-[0_0_30px_rgba(245,158,11,0.3)] neon-box-amber'
  if (isTodayDay(idx)) return 'border-sky-400 bg-sky-500/25 shadow-[0_0_40px_rgba(14,165,233,0.4)] neon-box-sky ring-2 ring-sky-500/40 animate-neon-pulse'
  
  if (day.isRestDay) {
    if (log?.extraWorkouts?.length) return 'border-amber-500/50 bg-indigo-950/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] neon-box-indigo'
    return 'border-indigo-500/30 bg-indigo-500/10 neon-box-indigo opacity-80 hover:opacity-100'
  }
  
  return 'border-slate-800 bg-slate-900/60 hover:border-slate-500 transition-all shadow-xl hover:scale-[1.01]'
}

const getDayHeaderClass = (day, idx) => {
  const log = getDayLog(idx)
  if (log?.status === 'COMPLETED') return 'bg-emerald-600/40 border-b border-emerald-400/50'
  if (log?.status === 'TRANSFERRED') return 'bg-amber-600/30 border-b border-amber-400/40'
  if (log?.status === 'SKIPPED' || (isPastDay(idx) && !day.isRestDay && !log)) return 'bg-amber-600/40 border-b border-amber-400/50'
  if (isTodayDay(idx)) return 'bg-sky-600/50 border-b border-sky-400/60'
  if (day.isRestDay) {
    if (log?.extraWorkouts?.length) return 'bg-amber-500/20 border-b border-amber-500/30'
    return 'bg-indigo-900/50 border-b border-indigo-500/30'
  }
  return 'bg-slate-900 border-b border-slate-700'
}

// Stats
const getCompletedCount = (plan) => plan.logs?.filter(l => l.status === 'COMPLETED').length || 0
const getMissedCount = (plan) => plan.logs?.filter(l => l.status === 'SKIPPED').length || 0
const getTransferredCount = (plan) => plan.logs?.filter(l => l.status === 'TRANSFERRED').length || 0
const getCompletionRate = (plan) => {
  const total = plan.days?.filter(d => !d.isRestDay).length || 0
  if (!total) return 0
  return Math.round((getCompletedCount(plan) / total) * 100)
}

const applyFilter = () => { selectedPlan.value = null }

const selectPlan = async (plan) => {
  selectedPlan.value = plan
  currentWeek.value = 1
  try {
    const res = await apiClient.get(`/training-plans/${plan.id}`)
    selectedPlan.value = res.data
  } catch (e) { console.error(e) }
}

const openApproveDialog = (dayIdx) => {
  approvingDayIdx.value = dayIdx
  approveNote.value = ''
  showApproveModal.value = true
}

const confirmApprove = async () => {
  if (!selectedPlan.value || approvingDayIdx.value === null) return
  saving.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    await apiClient.post(`/training-plans/instructor/override`, {
      planId: selectedPlan.value.id,
      memberId: selectedPlan.value.memberId,
      dayOfWeek: approvingDayIdx.value,
      weekNumber: currentWeek.value,
      date: today,
      status: 'COMPLETED',
      notes: approveNote.value
    })
    showApproveModal.value = false
    await selectPlan(selectedPlan.value)
    Swal.fire({ icon: 'success', title: 'ONAYLANDI', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#f1f5f9' })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Hata', text: err.response?.data?.message || 'İşlem başarısız.', background: '#1e293b', color: '#f1f5f9' })
  } finally { saving.value = false }
}

const openTransferDialog = (dayIdx) => {
  transferFromDay.value = dayIdx
  transferTargetDay.value = null
  transferNote.value = ''
  showTransferModal.value = true
}

const confirmTransfer = async () => {
  if (!selectedPlan.value || transferFromDay.value === null || transferTargetDay.value === null) return
  saving.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    await apiClient.post(`/training-plans/instructor/override`, {
      planId: selectedPlan.value.id,
      memberId: selectedPlan.value.memberId,
      dayOfWeek: transferFromDay.value,
      weekNumber: currentWeek.value,
      date: today,
      status: 'TRANSFERRED',
      transferredToDate: today,
      notes: transferNote.value,
    })

    const targetExisting = getDayLog(transferTargetDay.value)
    const extraWorkouts = [
      ...(targetExisting?.extraWorkouts || []),
      { dayFrom: transferFromDay.value, categories: getDayCategories(transferFromDay.value) }
    ]
    await apiClient.post(`/training-plans/instructor/override`, {
      planId: selectedPlan.value.id,
      memberId: selectedPlan.value.memberId,
      dayOfWeek: transferTargetDay.value,
      weekNumber: currentWeek.value,
      date: today,
      status: targetExisting?.status || 'PENDING',
      extraWorkouts
    })

    showTransferModal.value = false
    await selectPlan(selectedPlan.value)
    Swal.fire({ icon: 'success', title: 'TELAFİ ATAMALANDI', text: `${daysOfWeek[transferFromDay.value]} → ${daysOfWeek[transferTargetDay.value]}`, timer: 2000, showConfirmButton: false, background: '#1e293b', color: '#f1f5f9' })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Hata', text: err.response?.data?.message || 'İşlem başarısız.', background: '#1e293b', color: '#f1f5f9' })
  } finally { saving.value = false }
}

const revertDay = async (dayIdx) => {
  const result = await Swal.fire({
    title: 'Onayı geri al?', text: 'Bu günün onayı kaldırılacak.',
    icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Geri Al',
    confirmButtonColor: '#ef4444', background: '#1e293b', color: '#f1f5f9'
  })
  if (!result.isConfirmed) return
  const log = getDayLog(dayIdx)
  if (!log) return
  try {
    await apiClient.post(`/training-plans/instructor/override`, {
      planId: selectedPlan.value.id,
      memberId: selectedPlan.value.memberId,
      dayOfWeek: dayIdx,
      weekNumber: currentWeek.value,
      date: log.date,
      status: 'PENDING',
      notes: null
    })
    await selectPlan(selectedPlan.value)
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Hata', background: '#1e293b', color: '#f1f5f9' })
  }
}


const loadPlans = async () => {
  loading.value = true
  try {
    const res = await apiClient.get(`/training-plans/instructor/dashboard`)
    console.log('[TRACKER] API Response:', res.data)
    plans.value = res.data
  } catch (e) {
    console.error('[TRACKER] Load Error:', e)
  } finally { loading.value = false }
}

const loadInstructors = async () => {
  if (!isAdmin.value) return
  try {
    const res = await apiClient.get(`/instructors`)
    allInstructors.value = res.data.instructors || []
    console.log('[TRACKER] Instructors loaded:', allInstructors.value.length)
  } catch (e) { console.error('Instructor load error:', e) }
}

const handleLogout = () => {
  auth.logout()
  window.location.reload()
}

onMounted(async () => {
  await Promise.all([loadPlans(), loadInstructors()])
  
  // Sync current user profile if needed
  if (!auth.user?.photo && auth.isAuthenticated) {
     try {
       const res = await apiClient.get(`/instructors`)
       const list = Array.isArray(res.data) ? res.data : (res.data?.instructors || res.data?.data || [])
       const me = list.find(x => x.user?.id === auth.user.id || x.userId === auth.user.id)
       if (me) {
         auth.user.photo = me.photo
         auth.user.fullName = me.fullName
         Storage.setItem('user', JSON.stringify(auth.user))
       }
     } catch (e) { console.error('Profile sync error:', e) }
  }
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 2px; }

.neon-box-emerald { border-color: #10b981; box-shadow: inset 0 0 30px rgba(16,185,129,0.1), 0 0 20px rgba(16,185,129,0.2); }
.neon-box-rose { border-color: #f43f5e; box-shadow: inset 0 0 30px rgba(244,63,94,0.1), 0 0 20px rgba(244,63,94,0.2); }
.neon-box-sky { border-color: #0ea5e9; box-shadow: inset 0 0 40px rgba(14,165,233,0.15), 0 0 30px rgba(14,165,233,0.3); }
.neon-box-amber { border-color: #f59e0b; box-shadow: inset 0 0 30px rgba(245,158,11,0.1), 0 0 20px rgba(245,158,11,0.2); }
.neon-box-indigo { border-color: #6366f1; box-shadow: inset 0 0 30px rgba(99,102,241,0.05), 0 0 15px rgba(99,102,241,0.1); }

/* Glow animations */
@keyframes neon-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.animate-neon-pulse { animation: neon-glow 2s infinite ease-in-out; }

/* Animation Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}
.animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
</style>
