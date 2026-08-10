<template>
  <div class="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
    <!-- Header -->
    <header class="bg-[#060b14] border-b-[3px] border-cyan-400/80 px-8 py-4 flex items-center justify-between z-50 shadow-[0_5px_40px_rgba(34,211,238,0.4)] relative">
      <div class="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>
      <div class="flex items-center gap-3 relative z-10">
        <div @click="history = []" class="cursor-pointer select-none group">
          <div class="flex items-center gap-3 mt-1">
            <span translate="no" class="notranslate" style="color: #ff0033 !important; text-transform: none !important; font-weight: 900 !important; font-size: 1.5rem; letter-spacing: 0.05em; text-shadow: 0 0 10px rgba(255, 0, 51, 0.8), 0 0 20px rgba(255, 0, 51, 0.4); font-family: 'JetBrains Mono', monospace !important;">
              {{ (lastResult?.companyName || branchInfo?.HeaderCompany?.name || branchInfo?.Company?.name || 'Beha').split(' ')[0] }}
            </span>
            <span translate="no" class="notranslate" style="color: #ffffff !important; text-transform: none !important; font-weight: 900 !important; font-size: 1.5rem; letter-spacing: 0.05em; text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4); font-family: 'JetBrains Mono', monospace !important;">
              {{ (lastResult?.companyName || branchInfo?.HeaderCompany?.name || branchInfo?.Company?.name || 'Gym').split(' ').slice(1).join(' ') || 'Gym' }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex-1 flex justify-center px-4 relative z-10">
        <div v-if="branchInfo" class="flex flex-col items-center bg-[#060b14] border-2 border-cyan-500/40 px-12 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md relative group overflow-hidden">
           <div class="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100"></div>
           <span class="text-[0.6rem] font-black text-cyan-500/80 uppercase tracking-[0.5em] mb-1.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">SİSTEM LOKASYONU</span>
           <div class="flex items-center gap-4">
              <span translate="no" class="text-sm font-black uppercase tracking-widest text-cyan-400 notranslate" style="font-family: 'JetBrains Mono', monospace !important;">
                 {{ lastResult?.companyName || branchInfo?.HeaderCompany?.name || branchInfo?.Company?.name || 'BEHA GYM' }}
              </span>
              <div class="h-6 w-[2px] bg-white/10 mx-1"></div>
              <span class="text-sm font-black uppercase tracking-widest text-sky-400" style="font-family: 'JetBrains Mono', monospace !important;">
                 {{ lastResult?.branchName || branchInfo?.name || branchInfo?.branchName || 'KUŞCAĞIZ ŞUBESİ' }}
              </span>
           </div>
        </div>
      </div>

      <div class="flex items-center gap-4 relative z-10 w-[240px] justify-end">
        <div class="flex flex-col items-end">
          <span class="text-xs font-bold text-cyan-200 uppercase tracking-widest">{{ currentTime }}</span>
          <span class="text-[0.6rem] text-emerald-400 font-black uppercase tracking-[0.1em] drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">SİSTEM ÇEVRİMİÇİ</span>
        </div>
        <router-link v-if="!auth.isReceptionist" to="/" class="p-2 bg-[#09101d] border border-cyan-900 border-2 rounded-xl text-cyan-500 hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <X class="w-5 h-5" />
        </router-link>
        <button v-else @click="handleLogout" class="p-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)] rounded-xl group">
          <LogOut class="w-5 h-5 text-rose-500 group-hover:text-rose-400" />
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden p-3 gap-3">
      
      <!-- Left Section: Scanner & Controls (Gizlenir eğer okutma yapıldıysa) -->
      <div :class="!lastResult ? 'w-[360px] opacity-100' : 'w-0 opacity-0 overflow-hidden px-0 mx-0 border-0 pointer-events-none'" class="flex-none flex flex-col gap-3">
         

         <!-- Canlı Tarayıcı Section -->
        <div class="bg-[#060b14] border-[3px] border-cyan-400/80 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(34,211,238,0.4)] relative flex flex-col flex-1">
          <div class="p-4 border-b-[3px] border-cyan-400/70 bg-cyan-950/40 flex justify-between items-center z-10">
            <span class="text-[0.75rem] font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">CANLI TARAYICI</span>
            <div class="flex items-center gap-2">
              <button 
                v-if="isScanning"
                @click="stopScanner"
                class="px-3 py-1 bg-rose-950/50 border border-rose-500/40 rounded text-rose-500 hover:bg-rose-900 hover:text-rose-100 text-[0.55rem] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
              >
                <X class="w-3 h-3" />
                DURDUR
              </button>
              <span class="w-2 h-2 rounded-full shadow-lg" :class="isScanning ? 'bg-emerald-400 shadow-emerald-500/50' : 'bg-slate-600'"></span>
              <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">{{ isScanning ? 'AKTİF' : 'KAPALI' }}</span>
            </div>
          </div>
          
          <div class="flex-1 relative bg-[#030712] flex items-center justify-center overflow-hidden">
            <!-- Camera Feed Container -->
            <div id="reader" class="w-full h-full object-cover opacity-80 mix-blend-screen mix-blend-lighten"></div>
            
            <!-- Scan Overlay Brackets -->
            <div v-if="!lastResult" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div class="w-64 h-64 relative">
                   <div class="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-tl"></div>
                   <div class="absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-tr"></div>
                   <div class="absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-bl"></div>
                   <div class="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-br"></div>
                   <div class="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
                </div>
            </div>

            <!-- Standby Overlay -->
            <div v-if="!isScanning && !showReScanModal" class="absolute inset-0 bg-[#060b14]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-5 border-t border-cyan-900/30">
               <div class="w-24 h-24 rounded-full border border-cyan-500/20 bg-cyan-950/30 flex items-center justify-center">
                   <QrCode class="w-12 h-12 text-cyan-400/50" />
               </div>
               <p class="text-[0.75rem] font-bold text-slate-400 uppercase tracking-[0.2em]">Kamera Beklemede</p>
               <button @click="initScanner" class="px-8 py-3 bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/60 hover:border-cyan-400 text-cyan-400 hover:text-cyan-200 rounded-full text-[0.7rem] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(34,211,238,0.1)]">KAMERAYI BAŞLAT</button>
            </div>

            <!-- In-Place Re-Scan UI (Neon Integrated) -->
            <div v-if="showReScanModal" class="absolute inset-0 bg-[#0b1222]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20 space-y-5 border-t-2 border-rose-500/50">
                <div class="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <!-- Close/Cancel Button -->
                <button @click="showReScanModal = false" class="absolute top-3 right-3 p-1.5 bg-rose-950/30 border border-rose-500/30 text-rose-500 hover:bg-rose-600 hover:text-white rounded transition-all">
                    <X class="w-4 h-4" />
                </button>

                <!-- Neon Icon -->
                <div class="w-20 h-20 bg-rose-500/5 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center rounded-xl relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent animate-pulse"></div>
                    <CreditCard class="w-10 h-10 text-rose-500 relative z-10 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </div>

                <div class="space-y-1 relative z-10">
                    <h3 class="text-lg font-black text-white uppercase tracking-widest [text-shadow:0_0_10px_rgba(255,255,255,0.4)]">KART OKUTUN</h3>
                    <p v-if="isInfoOnlyMode" class="text-[0.55rem] font-black text-amber-400 uppercase tracking-[0.2em] animate-pulse">BİLGİ GÖRÜNTÜLEME MODU</p>
                    <p v-else class="text-[0.5rem] font-black text-rose-500/80 uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <span class="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
                      MANUEL KOD GİRİŞİ YAPIN
                    </p>
                </div>

                <!-- Input Area -->
                <div class="w-full border-2 border-rose-500/30 p-3 bg-slate-950/80 shadow-inner relative group rounded-lg">
                    <input 
                      ref="rescanInput"
                      v-model="qrData"
                      @input="qrData = qrData.replace(/\D/g, '').slice(0, 15)"
                      @keyup.enter="handleRescanSubmit"
                      type="text" 
                      class="w-full bg-transparent border-none text-center text-white text-xl font-black tracking-[0.3em] focus:ring-0 placeholder-rose-500/5 caret-red-neon"
                      placeholder="········"
                      maxlength="15"
                    />
                </div>

                <!-- Small Neon Countdown Bar -->
                <div class="w-full flex flex-col items-center gap-2">
                    <div class="flex gap-1.5">
                        <div v-for="i in 5" :key="i" class="w-2 h-2 rounded-sm transition-all duration-300" :class="i <= rescanCountdown ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]' : 'bg-slate-800'"></div>
                    </div>
                </div>

                <!-- Timer Bar -->
                <div class="absolute bottom-0 left-0 h-1 bg-rose-500 shadow-[0_-2px_10px_rgba(244,63,94,1)] transition-all duration-1000 ease-linear" 
                     :style="{ width: (rescanCountdown / 5 * 100) + '%' }"></div>
            </div>
          </div>

          <!-- NFC / Manual Input Area -->
          <div class="p-6 bg-[#060b14] border-t-[3px] border-cyan-400/80 z-10 flex-none relative shadow-[0_-5px_30px_rgba(34,211,238,0.3)]">
            <div class="relative group">
              <input 
                ref="manualInput"
                v-model="qrData"
                @input="qrData = qrData.replace(/\D/g, '').slice(0, 15)"
                @keyup.enter="handleManualSubmit"
                type="text" 
                class="w-full bg-[#030712] border-[3px] border-cyan-400/70 rounded-xl focus:border-rose-500 focus:shadow-[0_0_25px_rgba(244,63,94,0.4)] py-4 px-6 text-cyan-50 text-center text-lg font-mono tracking-[0.2em] outline-none placeholder:text-cyan-600/50 placeholder:text-[0.7rem] uppercase shadow-[inset_0_0_15px_rgba(34,211,238,0.2)] caret-red-neon"
                placeholder="KART OKUTUN VEYA KOD GİRİN..."
                maxlength="15"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-900 pointer-events-none group-focus-within:text-cyan-400">
                <Dumbbell class="w-6 h-6" />
              </div>
            </div>
            <div class="flex flex-col items-center justify-center gap-2 mt-4 opacity-100 select-none">
              <div class="flex items-center gap-4">
                <div class="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-rose-600"></div>
                <span translate="no" class="text-xl font-black uppercase tracking-[0.5em] drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] flex items-center gap-2 notranslate" style="font-family: 'JetBrains Mono', monospace !important;">
                  <span class="text-rose-600">BEHA</span>
                  <span class="text-white">SOFT</span>
                </span>
                <div class="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-rose-600"></div>
              </div>
              <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mt-2"></div>
            </div>
          </div>
        </div>

        <!-- System Stats Cards -->
        <div class="grid grid-cols-2 gap-2">
           <div class="bg-[#060b14] border-[3px] border-cyan-400/80 rounded-2xl p-2 flex flex-col items-center justify-center text-center gap-1 shadow-[0_0_35px_rgba(34,211,238,0.4)] relative overflow-hidden">
              <div class="absolute -inset-10 bg-cyan-500/5 blur-xl"></div>
              <span class="text-white text-[0.65rem] font-black uppercase tracking-[0.3em] relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">BUGÜNKÜ GİRİŞ</span>
              <span class="text-3xl font-black text-cyan-50 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] relative z-10">{{ stats.entries }}</span>
           </div>
           <div class="bg-[#060b14] border-[3px] border-emerald-500/50 rounded-2xl p-2 flex flex-col items-center justify-center text-center gap-1 shadow-[0_0_35px_rgba(52,211,153,0.4)] relative overflow-hidden">
              <div class="absolute -inset-10 bg-emerald-500/5 blur-xl"></div>
              <span class="text-white text-[0.65rem] font-black uppercase tracking-[0.3em] relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">İÇERİDEKİ ÜYE</span>
              <span class="text-3xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)] relative z-10">{{ stats.inside }}</span>
           </div>
        </div>

        <!-- Receptionist Actions -->
        <div class="bg-[#060b14] border-[3px] border-cyan-400/80 rounded-2xl p-3 space-y-2 shadow-[0_0_40px_rgba(34,211,238,0.35)] relative overflow-hidden flex-none">
           <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl"></div>
           <h4 class="text-white text-[0.75rem] font-black uppercase tracking-[0.3em] text-center mb-1 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">HIZLI İŞLEMLER</h4>
           <div class="space-y-3 relative z-10">
              <button @click="handleGuestEntry" class="w-full py-4 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl text-[0.7rem] font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group">
                 <Zap class="w-5 h-5 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                 <span>MİSAFİR / DENEME GİRİŞİ</span>
              </button>
           </div>
        </div>

      </div>

      <!-- Right Section: Result Display / History -->
      <div :class="lastResult ? 'gap-3' : 'gap-0'" class="flex-1 flex flex-col overflow-hidden">
        
        <!-- Announcements (Güncel Duyurular) - Sadece ana ekranda (giriş yapılmadığında) görünsün -->
        <div v-if="!lastResult && activeAnnouncements && activeAnnouncements.length > 0" class="mb-3 flex-none h-[14%] bg-[#060b14] border-[3px] border-purple-500/50 rounded-2xl p-2 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col">
           <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl"></div>
           <!-- Grid (1 Sütunlu) Kaydırılabilir Alan -->
           <div class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 pr-1">
              <template v-if="activeAnnouncements && activeAnnouncements.length > 0">
                 <div class="grid grid-cols-1 gap-2">
                    <div v-for="a in activeAnnouncements" :key="'sidebar-'+a.id" class="relative bg-[#0a1120] p-3 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:bg-purple-950/20 flex flex-col justify-start min-h-[85px]">
                       <h5 class="text-[0.85rem] font-black text-[#ff1a75] pb-2 drop-shadow-[0_0_15px_rgba(255,0,85,1)] uppercase tracking-widest leading-tight mb-1 truncate pr-[140px]" :title="a.title" style="text-shadow: 0 0 10px #ff0055, 0 0 20px #ff0055, 0 0 30px #ff0055;">{{ a.title }}</h5>
                       <p class="text-[0.95rem] text-cyan-400 leading-relaxed font-bold line-clamp-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" style="text-shadow: 0 0 5px #0891b2, 0 0 10px #06b6d4;">{{ a.content }}</p>
                       <span class="absolute top-3 right-3 text-[0.65rem] text-purple-400/80 font-black tracking-[0.2em] uppercase text-right">
                          {{ a.startDate ? formatDate(a.startDate) : 'SÜRESİZ' }} <template v-if="a.endDate"> - {{ formatDate(a.endDate) }}</template>
                       </span>
                    </div>
                 </div>
              </template>
              <div v-else class="w-full h-full flex flex-col items-center justify-center opacity-40">
                 <Layers class="w-6 h-6 text-purple-500 mb-1"/>
                 <span class="text-[0.6rem] font-black uppercase tracking-widest text-purple-300">AKTİF DUYURU YOK</span>
              </div>
           </div>
        </div>
        <!-- Big Result Card (Shows on Scan) -->
        <div :class="lastResult ? 'flex-1' : 'h-0 overflow-hidden pointer-events-none'" class="relative">
            <div v-if="lastResult" key="result" class="absolute inset-0 bg-slate-900 border-2 shadow-2xl flex flex-col overflow-hidden" 
                 :class="lastResult.status === 'GRANTED' ? (lastResult.actionType === 'EXIT' ? 'border-rose-500/40 shadow-rose-900/10' : 'border-emerald-500/40 shadow-emerald-900/10') : 'border-red-600/40 shadow-red-900/10'">
              
              <!-- Result Background Glow -->
              <div class="absolute inset-0 opacity-10 pointer-events-none" 
                   :class="lastResult.status === 'GRANTED' ? (lastResult.actionType === 'EXIT' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-red-600'"></div>
              
              <!-- Main Result Content -->
              <div class="flex-1 flex flex-col md:flex-row items-stretch relative z-10 h-full bg-[#050a15] rounded-none overflow-hidden border-[3px] border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
                
                 <!-- LEFT PANEL -->
                 <div class="w-[300px] flex-none relative flex flex-col items-center bg-[#11192d] border-r-[3px] border-cyan-500/20 shadow-2xl z-20 overflow-hidden">
                    
                    <!-- Countdown Timer - ABSOLUTE TOP -->
                    <div class="w-full flex-none">
                       <div class="flex items-center justify-between bg-black/40 backdrop-blur-xl px-6 py-5 border-b-[3px] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
                            :class="lastResult.status === 'GRANTED' ? (lastResult.actionType === 'EXIT' ? 'border-rose-500/60' : 'border-emerald-500/60') : 'border-red-600/60'">
                         <div class="flex flex-col">
                            <span class="text-slate-400 text-[0.6rem] font-black uppercase tracking-[0.3em] italic">İŞLEM KAPANACAK</span>
                            <div class="flex items-center gap-1.5 mt-1">
                               <div class="w-1.5 h-1.5 rounded-full animate-pulse" :class="lastResult.status === 'GRANTED' ? (lastResult.actionType === 'EXIT' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-red-600'"></div>
                               <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">SİSTEM GERİ SAYIMI</span>
                            </div>
                         </div>
                         <div class="relative">
                            <span class="text-5xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_15px_currentColor]" 
                                  :class="lastResult.status === 'GRANTED' ? (lastResult.actionType === 'EXIT' ? 'text-rose-500' : 'text-emerald-500') : 'text-red-600'">
                              {{ resultCountdown }}
                            </span>
                         </div>
                       </div>
                    </div>

                    <!-- Scrollable Content below Top Bar -->
                    <div class="p-8 w-full flex-1 flex flex-col items-center overflow-y-auto custom-scrollbar pt-10">
                       <!-- Member Photo Section -->
                        <!-- Member Photo Section with Cyber HUD -->
                        <div class="w-64 h-80 relative group/photo mb-8 shrink-0 flex items-center justify-center">
                            <!-- Background HUD Ornaments -->
                            <div class="absolute inset-x-[-40px] inset-y-[-20px] pointer-events-none opacity-40">
                               <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
                               <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
                               <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
                               <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>
                               <div class="absolute top-1/2 left-[-10px] w-4 h-[1px] bg-cyan-500/30"></div>
                               <div class="absolute top-1/2 right-[-10px] w-4 h-[1px] bg-cyan-500/30"></div>
                            </div>

                            <div class="absolute -inset-6 rounded-none blur-3xl opacity-40 shadow-[0_0_60px_rgba(34,211,238,0.5)] bg-cyan-500/20 group-hover/photo:opacity-70 transition-opacity animate-pulse"></div>
                            
                            <!-- THE PHOTO BOX -->
                            <div class="w-full h-full rounded-none bg-[#030712] border-[3px] overflow-hidden relative z-10 flex items-center justify-center p-1 group"
                                 :class="lastResult.dashboard?.streak >= 3 ? 'animate-streak border-orange-500' : 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]'">
                               
                               <!-- Streak Fire Particles (Original Version) -->
                               <template v-if="lastResult.dashboard?.streak >= 3">
                                  <div v-for="i in 15" :key="i" 
                                       class="flame-particle"
                                       :style="{
                                          left: Math.random() * 100 + '%',
                                          width: (Math.random() * 20 + 10) + 'px',
                                          height: (Math.random() * 40 + 20) + 'px',
                                          animation: `flame-rise ${Math.random() * 1 + 0.5}s infinite ease-out`,
                                          animationDelay: `-${Math.random() * 2}s`
                                       }"></div>
                               </template>

                               <!-- Laser Scanning Line -->
                               <div v-if="!(lastResult.dashboard?.streak >= 3)" class="absolute left-0 right-0 h-[3px] bg-cyan-400 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] z-20 animate-scan-line pointer-events-none"></div>
                               <div v-if="!(lastResult.dashboard?.streak >= 3)" class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan-line pointer-events-none z-20" style="animation-delay: 0.1s; height: 100px;"></div>

                               <!-- Random Cyber HUD Overlays -->
                               <div class="absolute top-4 left-4 z-30 flex flex-col items-start gap-1 pointer-events-none">
                                  <div class="bg-black/60 backdrop-blur-sm border border-cyan-500/30 px-2 py-0.5 animate-hud-flicker">
                                     <span class="text-[0.45rem] font-black text-cyan-400 uppercase tracking-widest cyber-hud-text">KAS KÜTLESİ: ANALİZ...</span>
                                  </div>
                               </div>

                               <div class="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-1 pointer-events-none">
                                  <!-- Akıllı Antrenman Sayacı -->
                                  <div v-if="lastResult.dashboard?.trainingTime !== undefined" class="bg-black/80 backdrop-blur-sm border px-2 py-1 mb-1 shadow-lg"
                                       :class="lastResult.dashboard.trainingTime >= 30 ? 'border-emerald-500/50' : 'border-amber-500/50'">
                                     <span class="text-[0.5rem] font-black uppercase tracking-widest flex items-center gap-2"
                                           :class="lastResult.dashboard.trainingTime >= 30 ? 'text-emerald-400' : 'text-amber-400'">
                                        <Activity class="w-3 h-3" :class="lastResult.dashboard.trainingTime >= 30 ? '' : 'animate-pulse'" />
                                        SÜRE: {{ lastResult.dashboard.trainingTime }} DK
                                        <span v-if="lastResult.dashboard.trainingTime >= 30" class="text-[0.4rem] ml-1 bg-emerald-500/20 px-1 rounded">ONAYLI</span>
                                     </span>
                                  </div>

                                  <div class="bg-black/60 backdrop-blur-sm border border-cyan-500/30 px-2 py-0.5">
                                     <span class="text-[0.45rem] font-black text-rose-400 uppercase tracking-widest">NABIZ: {{ Math.floor(Math.random() * 20) + 70 }} BPM</span>
                                  </div>
                                  <div class="bg-black/60 backdrop-blur-sm border border-cyan-500/30 px-2 py-0.5">
                                     <span class="text-[0.45rem] font-black text-cyan-400 uppercase tracking-widest">METABOLİZMA: OPTİMAL</span>
                                  </div>
                               </div>

                               <img v-if="lastResult.photo" :src="lastResult.photo" class="w-full h-full object-cover rounded-none grayscale group-hover:grayscale-0 transition-all duration-700" />
                               <div v-else class="w-full h-full flex flex-col items-center justify-center text-cyan-900 space-y-4 rounded-none bg-slate-900/50">
                                  <User class="w-20 h-20 opacity-20" />
                               </div>

                               <!-- Digital Grid Overlay -->
                               <div class="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:10px_10px] z-10"></div>
                            </div>
                        </div>

                        <!-- Streak Badge BELOW Photo -->
                        <div v-if="lastResult.dashboard?.streak >= 3" class="mt-4 mb-4 animate-bounce shrink-0">
                           <div class="bg-gradient-to-r from-orange-600 to-red-600 border-2 border-white/20 px-6 py-2 shadow-[0_0_25px_#ff4500]">
                              <span class="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                 <Zap class="w-4 h-4 fill-white animate-pulse" />
                                 {{ lastResult.dashboard.streak }} GÜNLÜK SERİ! 🔥
                              </span>
                           </div>
                        </div>

                        <!-- Info Text -->
                       <div class="text-center w-full flex flex-col items-center mb-10">
                           <h3 class="text-xl font-black text-white uppercase tracking-widest leading-tight mb-2 truncate w-full">{{ lastResult.name }}</h3>
                           <h2 class="text-slate-400 text-[0.65rem] font-bold uppercase tracking-[0.2em]">{{ lastResult.membershipType || 'BİLGİ YOK' }}</h2>
                       </div>

                       <!-- Action Buttons Section (MOVED TO BOTTOM) -->
                    </div>

                    <!-- Bottom Fixed Action Bar -->
                    <div class="w-full p-6 mt-auto bg-black/20 border-t border-white/5">
                        <button 
                           @click="clearLastResult"
                           class="w-full py-6 bg-rose-600/10 hover:bg-rose-600/20 border-[3px] border-rose-500/50 hover:border-rose-500 text-rose-500 rounded-none text-sm font-black tracking-[0.4em] uppercase transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 group"
                        >
                           <RotateCcw class="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                           DETAY ÇIKIŞ
                        </button>
                    </div>
                 </div>

                <!-- RIGHT PANEL - Member Dashboard Section -->
                <div class="flex-1 p-8 lg:p-10 text-left relative overflow-hidden">
                   <div class="w-full h-full flex flex-col">
                       <div class="grid grid-cols-1 xl:grid-cols-[25%_1fr] gap-8 w-full max-w-none items-stretch flex-1 min-h-0">
                           <!-- Sütun 1: Finans ve Alışlar -->
                           <div class="flex flex-col gap-6">
                             <!-- Balances Row -->
                             <div class="grid grid-cols-2 gap-4">
                                <div class="bg-[#11192d] border-2 border-emerald-500/20 p-4 rounded-none flex flex-col gap-1 shadow-lg">
                                   <span class="text-[0.6rem] font-black text-slate-500 tracking-widest uppercase">GÜNCEL BAKİYE</span>
                                   <span class="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                                      {{ lastResult.dashboard?.finance?.balance || 0 }} ₺
                                   </span>
                                </div>
                                <div class="bg-[#11192d] border-2 border-rose-500/20 p-4 rounded-none flex flex-col gap-1 shadow-lg">
                                   <span class="text-[0.6rem] font-black text-slate-500 tracking-widest uppercase">KREDİ LİMİTİ</span>
                                   <span class="text-3xl font-black text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                                      {{ lastResult.dashboard?.finance?.debtLimit || 0 }} ₺
                                   </span>
                                </div>
                             </div>

                             <!-- Daily Purchases Table -->
                             <div class="border-[3px] border-cyan-400/30 rounded-none bg-[#0a1120] flex flex-col h-[350px] overflow-hidden">
                                <div class="px-4 py-3 bg-cyan-950/20 border-b-2 border-cyan-500/20 flex items-center justify-between">
                                   <span class="text-[0.65rem] font-black text-slate-300 tracking-widest uppercase">GÜNLÜK ALIŞLAR</span>
                                   <ShoppingCart class="w-4 h-4 text-cyan-400" />
                                </div>
                                <div class="flex-1 overflow-y-auto custom-scrollbar">
                                   <table class="w-full text-left border-collapse">
                                      <tbody class="divide-y divide-white/5">
                                         <tr v-if="!lastResult.dashboard?.purchases?.length">
                                            <td class="py-12 text-center text-[0.6rem] font-black text-slate-600 uppercase tracking-widest">ALIŞ KAYDI YOK</td>
                                         </tr>
                                         <tr v-for="(p, i) in lastResult.dashboard?.purchases" :key="i" class="hover:bg-white/[0.02]">
                                            <td class="py-3 px-4 text-[0.65rem] font-black text-slate-400 uppercase">{{ p.time }}</td>
                                            <td class="py-3 px-4 text-[0.7rem] font-black text-slate-200 uppercase truncate max-w-[120px]">{{ p.productName }}</td>
                                            <td class="py-3 px-4 text-[0.8rem] font-black text-emerald-400 text-right">{{ p.totalAmount }} ₺</td>
                                         </tr>
                                      </tbody>
                                   </table>
                                </div>
                                <div v-if="lastResult.dashboard?.purchases?.length" class="px-4 py-3 bg-emerald-950/20 border-t-2 border-emerald-500/30 flex justify-between items-center">
                                   <span class="text-[0.65rem] font-black text-emerald-400/80 uppercase">TOPLAM</span>
                                   <span class="text-lg font-black text-emerald-400 tabular-nums">
                                      {{ lastResult.dashboard.purchases.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0).toFixed(2) }} ₺
                                   </span>
                                </div>
                             </div>

                              <!-- Üyelik Detay Tablosu (Moved from bottom) -->
                              <div class="border-[3px] border-cyan-400/30 rounded-none bg-[#0a1120] flex flex-col overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                                 <div class="px-4 py-3 bg-cyan-950/20 border-b-2 border-cyan-500/20 flex items-center justify-between">
                                    <span class="text-[0.65rem] font-black text-slate-300 tracking-widest uppercase italic">ÜYELİK DETAYLARI</span>
                                    <ShieldCheck class="w-4 h-4 text-cyan-400" />
                                 </div>
                                 <div class="p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                                    <div class="flex flex-col gap-1">
                                       <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">PAKET TANIMI</span>
                                       <span class="text-sm font-black text-purple-400 truncate uppercase drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">{{ lastResult.membershipType || 'BİLGİ YOK' }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                       <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">ÜYE KODU</span>
                                       <span class="text-sm font-black text-slate-400">{{ lastResult.memberCode || '-' }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                       <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">KAYIT TARİHİ</span>
                                       <span class="text-sm font-black text-slate-300">{{ lastResult.registrationDate ? new Date(lastResult.registrationDate).toLocaleDateString('tr-TR') : '-' }}</span>
                                    </div>
                                     <div class="flex flex-col gap-1">
                                        <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">KALAN SÜRE</span>
                                        <span class="text-sm font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                                           {{ remainingDays }} {{ typeof remainingDays === 'number' ? 'GÜN KALDI' : '' }}
                                        </span>
                                        <span class="text-[0.45rem] font-bold text-slate-600 uppercase">{{ lastResult.expiryDate ? new Date(lastResult.expiryDate).toLocaleDateString('tr-TR') : 'SÜRESİZ' }}</span>
                                     </div>
                                     <div class="flex flex-col col-span-2 pt-3 border-t border-white/5 mt-2">
                                       <div class="flex justify-between items-center">
                                          <div class="flex flex-col">
                                             <span class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">İŞLEM YAPILAN ŞUBE / ŞİRKET</span>
                                             <span class="text-xs font-black text-amber-500 uppercase tracking-tighter">
                                               {{ lastResult.companyName || 'SİSTEM' }} | {{ lastResult.branchName || 'ANA GİRİŞ' }}
                                             </span>
                                          </div>
                                          <div class="text-right">
                                             <span class="text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">{{ lastResult.time }}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                            <!-- Training Plan Panel (Member Portal Style) -->
                            <div class="flex flex-col flex-1 min-h-0">
                               <div class="border-[3px] border-cyan-400/30 rounded-none bg-[#0a1120] flex flex-col h-full overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                                  <div class="px-6 py-3 bg-cyan-950/20 border-b-2 border-cyan-500/20 flex items-center justify-between z-10 shrink-0">
                                     <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                                           <Layers class="w-4 h-4 text-cyan-500" />
                                        </div>
                                        <div>
                                           <p class="text-[0.55rem] text-slate-500 font-black uppercase tracking-[0.3em] mb-0.5">HAFTALIK EĞİTİM PLANI</p>
                                           <h4 class="text-xs font-black text-slate-300 tracking-tighter uppercase italic leading-none">GÜNCEL PROGRAM DOSYASI</h4>
                                         </div>
                                     </div>
                                     <div class="flex items-center gap-2">
                                        <div class="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                           <span class="text-[0.55rem] font-black text-cyan-400 uppercase tracking-widest">{{ lastResult.dashboard?.weeklyPlans?.filter(p => !p.isRestDay).length }} GÜN</span>
                                        </div>
                                     </div>
                                  </div>

                                  <div class="flex-1 min-h-0 bg-slate-950/40 relative">
                                     <BaseScroll direction="vertical" :scrollbar="true" accent="cyan" :maskSize="40" class="h-full">
                                       <div class="p-6">
                                          <!-- Cyber Background Elements -->
                                          <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>

                                          <div v-if="!lastResult.dashboard?.weeklyPlans?.filter(p => !p.isRestDay).length" class="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 relative z-10 py-20">
                                             <div class="w-20 h-20 border-4 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-6">
                                                <MonitorOff class="w-10 h-10 opacity-30" />
                                             </div>
                                             <span class="text-[0.7rem] font-black uppercase tracking-[0.4em]">AKTİF EĞİTİM PLANI BULUNAMADI</span>
                                          </div>
                                          
                                          <div v-else class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 relative z-10 pb-10">
                                             <div v-for="(plan, idx) in lastResult.dashboard?.weeklyPlans.filter(p => !p.isRestDay)" :key="idx" 
                                                   :class="[
                                                       plan.isCompleted ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-950/20' : 
                                                       (plan.dayIndex === lastResult.dashboard.todayIndex ? (dayThemes[plan.dayIndex]?.active || 'border-amber-400 bg-slate-900') : 
                                                       (plan.dayIndex < lastResult.dashboard?.todayIndex ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)] bg-rose-950/5' : 'border-slate-800 bg-slate-900/60'))
                                                   ]"
                                                   class="rounded-none flex flex-col overflow-hidden transition-all hover:scale-[1.02] group/plan relative h-[320px] border-2">
                                                
                                                <!-- Day Progress Line for Today -->
                                                <div v-if="plan.dayIndex === lastResult.dashboard.todayIndex && !plan.isCompleted" class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-pulse z-20"></div>
 
                                                 <!-- Missed Color Bar (Past days) -->
                                                 <div v-if="plan.dayIndex < lastResult.dashboard?.todayIndex && !plan.isCompleted" class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500/30 z-20"></div>
                                                 
                                                  <!-- Completion Overlay/Badge -->
                                                  <div v-if="plan.isCompleted" class="absolute inset-x-0 top-0 h-full bg-emerald-500/5 pointer-events-none z-10"></div>
                                                  <!-- Only show the absolute badge for historical completed days; today's badge is the button itself -->
                                                  <div v-if="plan.isCompleted && plan.dayIndex !== lastResult.dashboard?.todayIndex" class="absolute top-3 right-3 z-30 flex items-center">
                                                    <div class="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center gap-2 shadow-lg backdrop-blur-md">
                                                      <Check class="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                                      <span class="text-[0.5rem] font-black text-emerald-400 uppercase tracking-widest leading-none whitespace-nowrap">TAMAMLANDI</span>
                                                    </div>
                                                  </div>
 
                                                  <!-- Missed/Telafi Badge -->
                                                  <div v-else-if="plan.dayIndex < lastResult.dashboard?.todayIndex" class="absolute top-3 right-3 z-30 flex items-center">
                                                    <div class="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 rounded flex items-center gap-2 shadow-lg backdrop-blur-md">
                                                      <X class="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                                      <span class="text-[0.5rem] font-black text-rose-400 uppercase tracking-widest leading-none whitespace-nowrap">TELAFİ / KAÇIRILDI</span>
                                                    </div>
                                                  </div>

                                                <!-- Header -->
                                                <div class="px-6 py-4 flex flex-col gap-1 border-b border-white/5 shrink-0" 
                                                     :class="plan.dayIndex === lastResult.dashboard.todayIndex ? 'bg-amber-600/15' : 'bg-black/20'">
                                                  <div class="flex items-center justify-between">
                                                    <div class="flex flex-col">
                                                       <h3 class="text-xl font-black uppercase tracking-tighter italic leading-none"
                                                           :class="plan.dayIndex === lastResult.dashboard.todayIndex ? 'text-amber-400' : 'text-white'">
                                                           {{ plan.dayName }}
                                                       </h3>
                                                       <span class="text-[0.5rem] font-black tracking-[0.3em] mt-1 uppercase transition-opacity"
                                                             :class="plan.dayIndex === lastResult.dashboard.todayIndex ? 'text-white/60' : 'text-slate-500'">HEDEF PROGRAM</span>
                                                    </div>
                                                    
                                                    <!-- Today Completion Logic -->
                                                    <div v-if="plan.dayIndex === lastResult.dashboard.todayIndex" class="flex items-center gap-2">
                                                       <button @click.stop="toggleTodayCompletion(plan)" 
                                                               class="px-3 py-1.5 rounded-xl text-[0.6rem] font-black uppercase transition-all flex items-center gap-2 border shadow-lg"
                                                               :class="plan.isCompleted ? 'bg-emerald-600 border-emerald-400/50 text-white' : 'bg-amber-600 border-amber-400/50 text-white hover:bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.2)]'">
                                                          <Check class="w-3 h-3" v-if="plan.isCompleted" />
                                                          <Zap class="w-3 h-3 animate-pulse" v-else />
                                                          <span>{{ plan.isCompleted ? 'TAMAMLANDI' : 'TAMAMLA' }}</span>
                                                       </button>
                                                    </div>
                                                  </div>
                                                </div>

                                                <!-- Exercise HUD Body with Internal Scroll -->
                                                <div class="flex-1 min-h-0 bg-black/10">
                                                  <BaseScroll direction="vertical" :scrollbar="true" :accent="plan.dayIndex === lastResult.dashboard.todayIndex ? 'amber' : 'indigo'" class="h-full">
                                                     <div class="p-5 flex flex-col gap-6">
                                                        <!-- Muscle Groups / Categories -->
                                                        <div class="space-y-4">
                                                           <div v-for="(cat, cIdx) in plan.categories" :key="cIdx" class="space-y-3">
                                                              <div class="flex items-center justify-between">
                                                                 <div @click="showBranchImage(cat)" class="flex items-center gap-2 cursor-pointer group/branch active:scale-95 transition-all">
                                                                    <div class="w-2 h-2 rounded-full" :class="dayThemes[plan.dayIndex]?.dot || 'bg-cyan-500'"></div>
                                                                    <span class="text-[0.65rem] font-black uppercase tracking-widest text-slate-100 group-hover/branch:text-indigo-400 border-b border-transparent group-hover/branch:border-indigo-500/30 whitespace-nowrap">{{ cat.name }}</span>
                                                                 </div>
                                                              </div>

                                                              <div class="space-y-2">
                                                                 <div v-for="(ex, i) in cat.exercises" :key="i" 
                                                                      class="flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-600 transition-all border-l-4 shadow-sm group/ex"
                                                                      :class="plan.dayIndex === lastResult.dashboard.todayIndex ? 'border-l-amber-500' : 'border-l-rose-600'">
                                                                    <div class="w-1 h-1 rounded-full opacity-40" :class="plan.dayIndex === lastResult.dashboard.todayIndex ? 'bg-amber-500' : 'bg-rose-500'"></div>
                                                                    <span class="text-[0.65rem] font-black text-slate-300 uppercase italic truncate">{{ ex }}</span>
                                                                 </div>
                                                              </div>
                                                           </div>
                                                        </div>
                                                        
                                                        <!-- Footer inside scroll for rest info -->
                                                        <div class="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                                           <div class="flex items-center gap-2">
                                                              <Clock4 class="w-3.5 h-3.5 text-slate-500" />
                                                              <span class="text-[0.65rem] font-black text-slate-400 tracking-wider font-mono">{{ plan.time || '09:00 - 10:30' }}</span>
                                                           </div>
                                                        </div>
                                                     </div>
                                                  </BaseScroll>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                     </BaseScroll>
                                  </div>
                               </div>
                            </div>
                      </div>


                   </div>
                </div>
              </div>
            </div>
        </div>

        <!-- History Section: Two Column Card Layout -->
        <div :class="!lastResult ? 'flex-1 opacity-100 overflow-hidden' : 'h-0 opacity-0 overflow-hidden pointer-events-none'" class="flex flex-col gap-4">
           
           <div class="grid grid-cols-2 gap-6 flex-1 min-h-0">
             <!-- LEFT COLUMN: ENTRIES -->
             <div class="bg-[#060b14] border-[3px] border-emerald-500/50 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(52,211,153,0.15)] relative overflow-hidden">
                <div class="px-6 py-4 border-b-[3px] border-emerald-500/40 bg-emerald-950/20 flex justify-between items-center z-10">
                   <div class="flex items-center gap-3">
                      <LogIn class="w-6 h-6 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                      <span class="text-sm font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">GİRİŞ YAPANLAR</span>
                   </div>
                   <span class="text-xs font-black text-emerald-500/70">{{ entries.length }} KAYIT</span>
                </div>

                <div class="flex-1 overflow-y-auto red-scrollbar p-4 space-y-4">
                   <div v-if="entries.length === 0" class="h-full flex flex-col items-center justify-center text-emerald-900/30 space-y-4">
                      <LogIn class="w-16 h-16 opacity-20" />
                      <span class="text-xs font-black uppercase tracking-widest">HENÜZ GİRİŞ YOK</span>
                   </div>
                   
                   <div v-for="(log, i) in entries" :key="'entry-'+i" 
                        @click="showEntryFromHistory(log)"
                        class="bg-[#0a1120] border-2 border-emerald-500/20 p-3.5 rounded-none group relative overflow-hidden shadow-lg cursor-pointer transition-all active:scale-[0.98]">
                      <div class="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100"></div>
                       <div class="flex items-center gap-4 relative z-10">
                          <!-- Üye Fotoğrafı -->
                          <div class="w-14 h-14 rounded-none border-2 border-emerald-500/30 overflow-hidden flex-none bg-[#030712] shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                             <img v-if="log.photo" :src="log.photo" class="w-full h-full object-cover" @error="log.photo = null" />
                             <div v-else class="w-full h-full flex items-center justify-center bg-emerald-950/20">
                                <User class="w-6 h-6 text-emerald-500/40" />
                             </div>
                          </div>

                          <div class="flex-1 flex justify-between items-center">
                              <div class="flex flex-col">
                                 <span class="text-lg font-black text-white uppercase tracking-wider group-hover:text-emerald-300">{{ log.name }}</span>
                                 <div class="flex items-center gap-2">
                                    <span class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">{{ log.membershipType || 'ÜYE' }}</span>
                                    <span v-if="log.companyName" class="text-[0.55rem] font-black text-emerald-500/60 uppercase tracking-widest border-l border-white/10 pl-2">
                                      {{ log.companyName }} | {{ log.branchName }}
                                    </span>
                                 </div>
                              </div>
                             <div class="text-right flex items-center gap-3">
                                <span class="text-xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{{ log.time }}</span>
                                <span class="text-[0.6rem] font-black text-emerald-500/80 tracking-widest uppercase">GİRİŞ YAPTINIZ</span>
                             </div>
                          </div>
                       </div>
                   </div>
                </div>
             </div>

             <!-- RIGHT COLUMN: EXITS -->
             <div class="bg-[#060b14] border-[3px] border-amber-500/50 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
                <div class="px-6 py-4 border-b-[3px] border-amber-500/40 bg-amber-950/20 flex justify-between items-center z-10">
                   <div class="flex items-center gap-3">
                      <LogOut class="w-6 h-6 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                      <span class="text-sm font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">ÇIKIŞ YAPANLAR</span>
                   </div>
                   <span class="text-xs font-black text-amber-500/70">{{ exits.length }} KAYIT</span>
                </div>

                <div class="flex-1 overflow-y-auto red-scrollbar p-4 space-y-4">
                   <div v-if="exits.length === 0" class="h-full flex flex-col items-center justify-center text-amber-900/30 space-y-4">
                      <LogOut class="w-16 h-16 opacity-20" />
                      <span class="text-xs font-black uppercase tracking-widest">HENÜZ ÇIKIŞ YOK</span>
                   </div>
                   
                   <div v-for="(log, i) in exits" :key="'exit-'+i" 
                         class="bg-[#0a1120] border-2 border-amber-500/10 p-3.5 rounded-none relative overflow-hidden shadow-lg">
                       <div class="absolute inset-0 bg-amber-500/5 opacity-0"></div>
                       <div class="flex items-center gap-4 relative z-10">
                          <!-- Üye Fotoğrafı -->
                          <div class="w-14 h-14 rounded-none border-2 border-amber-500/30 overflow-hidden flex-none bg-[#030712] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                             <img v-if="log.photo" :src="log.photo" class="w-full h-full object-cover" @error="log.photo = null" />
                             <div v-else class="w-full h-full flex items-center justify-center bg-amber-950/20">
                                <User class="w-6 h-6 text-amber-500/40" />
                             </div>
                          </div>

                          <div class="flex-1 flex justify-between items-center">
                              <div class="flex flex-col">
                                 <span class="text-lg font-black text-white uppercase tracking-wider group-hover:text-amber-300">{{ log.name }}</span>
                                 <div class="flex items-center gap-2">
                                    <span class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">{{ log.membershipType || 'ÜYE' }}</span>
                                    <span v-if="log.companyName" class="text-[0.55rem] font-black text-amber-500/60 uppercase tracking-widest border-l border-white/10 pl-2">
                                      {{ log.companyName }} | {{ log.branchName }}
                                    </span>
                                 </div>
                              </div>
                             <div class="text-right flex items-center gap-3">
                                <span class="text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{{ log.time }}</span>
                                <span class="text-[0.6rem] font-black text-amber-500/80 tracking-widest uppercase">ÇIKIŞ YAPTINIZ</span>
                             </div>
                          </div>
                       </div>
                   </div>
                </div>
             </div>
           </div>
         </div>



      <!-- Duyuru Modalı (Giriş Başarılı Olduğunda) -->
      <div v-if="showAnnouncementsModal && activeAnnouncements.length > 0" class="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div class="bg-[#0b1222] border-2 border-cyan-500/40 shadow-[0_0_60px_rgba(34,211,238,0.2)] rounded-none flex flex-col overflow-hidden relative max-w-2xl w-full">
            <div class="px-12 py-8 border-b border-white/5 bg-cyan-950/20 flex justify-between items-center">
               <h3 class="text-cyan-400 text-3xl font-black tracking-widest uppercase">GÜNCEL DUYURULAR</h3>
               <button @click="showAnnouncementsModal = false" class="p-2 hover:bg-white/10 transition-colors">
                  <X class="w-8 h-8 text-slate-400" />
               </button>
            </div>
            <div class="p-12 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
               <div v-for="a in activeAnnouncements" :key="a.id" class="border-l-4 border-cyan-500 bg-cyan-500/5 p-6 space-y-3">
                  <h4 class="text-xl font-black text-white uppercase">{{ a.title }}</h4>
                  <p class="text-slate-300 leading-relaxed font-bold">{{ a.content }}</p>
               </div>
            </div>
            <div class="px-10 py-8 bg-cyan-950/20 border-t border-white/5 flex justify-center mt-auto">
               <button @click="showAnnouncementsModal = false" class="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-black text-[0.8rem] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(34,211,238,0.3)] flex items-center gap-3">
                  OKUDUM, ANLADIM
               </button>
            </div>
          </div>
      </div>

      <!-- Branş Görsel Modalı (600x600) -->
      <div v-if="showBranchImageModal && selectedBranchData" class="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[250] flex items-center justify-center p-6" @click.self="showBranchImageModal = false">
          <div class="bg-[#0b1222] border-[3px] border-indigo-500/50 shadow-[0_0_80px_rgba(99,102,241,0.3)] rounded-none flex flex-col overflow-hidden relative max-w-[650px] w-full animate-in zoom-in-95 duration-300">
            <div class="p-4 border-b border-white/5 bg-indigo-950/20 flex justify-center items-center h-[60px]">
               <h3 class="text-indigo-400 text-xl font-black tracking-widest uppercase truncate">{{ selectedBranchData.name }} EĞİTİM GÖRSELİ</h3>
            </div>
            
            <div class="w-full h-[600px] bg-black flex items-center justify-center relative group">
               <div class="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
               <img 
                 :src="selectedBranchData.photo" 
                 class="max-w-full max-h-full object-contain shadow-2xl" 
                 :alt="selectedBranchData.name"
                 @error="showBranchImageModal = false"
               />
               
               <!-- Corner Accents -->
               <div class="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-500 opacity-50"></div>
               <div class="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-500 opacity-50"></div>
               <div class="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-500 opacity-50"></div>
               <div class="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-500 opacity-50"></div>
            </div>

            <div class="p-4 bg-indigo-950/30 border-t border-white/5 flex justify-center">
               <button @click="showBranchImageModal = false" class="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-none font-black text-[0.8rem] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(99,102,241,0.3)] border-2 border-indigo-400/50 transition-all">
                  KAPAT
               </button>
            </div>
          </div>
      </div>

    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { ScanLine, QrCode, X, Dumbbell, Trash2, User, Activity, Zap, Layers, UserPlus, LogIn, LogOut, CreditCard, ShoppingCart, RotateCcw, MonitorOff, Lock, LayoutDashboard, ShieldCheck, Clock4, Check } from 'lucide-vue-next'
import { gateService } from '../../services/training/gateService'
import { announcementService } from '../../services/admin/announcementService'
import { useBranchManager } from '../../composables/useBranches'
import { useAlerts } from '../../utils/alerts'
import Storage from '../../utils/Storage'

import { useAuthStore } from '../../store/auth'
import { useRouter } from 'vue-router'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm } = useAlerts()
const qrData = ref('')

// Initialize history from localStorage to prevent loss on refresh
const history = ref(JSON.parse(Storage.getItem('gateSimulatorHistory') || '[]'))

// Watch for history changes and persist to localStorage
watch(history, (newHistory) => {
  Storage.setItem('gateSimulatorHistory', JSON.stringify(newHistory))
}, { deep: true })

const stats = ref({ entries: 0, inside: 0 })
const currentTime = ref(new Date().toLocaleString('tr-TR'))
const isScanning = ref(false)
const lastResult = ref(null)
const resultCountdown = ref(15)
const manualInput = ref(null)

const dayThemes = [
  { border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', active: 'border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)] bg-cyan-500/10', text: 'text-cyan-400', branch: 'text-cyan-300', dot: 'bg-cyan-500' },
  { border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', active: 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] bg-emerald-500/10', text: 'text-emerald-400', branch: 'text-emerald-300', dot: 'bg-emerald-500' },
  { border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]', active: 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] bg-rose-500/10', text: 'text-rose-400', branch: 'text-rose-300', dot: 'bg-rose-500' },
  { border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', active: 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.5)] bg-amber-500/10', text: 'text-amber-400', branch: 'text-amber-300', dot: 'bg-amber-500' },
  { border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', active: 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] bg-purple-500/10', text: 'text-purple-400', branch: 'text-purple-300', dot: 'bg-purple-500' },
  { border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', active: 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5)] bg-blue-500/10', text: 'text-blue-400', branch: 'text-blue-300', dot: 'bg-blue-500' },
  { border: 'border-indigo-500/30', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', active: 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)] bg-indigo-500/10', text: 'text-indigo-400', branch: 'text-indigo-300', dot: 'bg-indigo-500' },
]
const isPaymentDetailOpen = ref(false)
const remainingDays = computed(() => {
   if (!lastResult.value) return 0;
   if (!lastResult.value.expiryDate || lastResult.value.expiryDate === 'SÜRESİZ') return 'SÜRESİZ';
   const expiry = new Date(lastResult.value.expiryDate);
   if (isNaN(expiry.getTime())) return 'SÜRESİZ';
   
   const now = new Date();
   expiry.setHours(0,0,0,0);
   now.setHours(0,0,0,0);
   const diffTime = expiry - now;
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   return diffDays > 0 ? diffDays : 0;
});
const branchInfo = ref(null)
let scanner = null
let timer = null
let progressInterval = null
let heartbeatTimer = null

const activeAnnouncements = ref([])
const showAnnouncementsModal = ref(false)

const showBranchImageModal = ref(false)
const selectedBranchData = ref(null)

const showBranchImage = (cat) => {
  if (!cat.photo) {
    toast('Bu branş için eğitim görseli tanımlanmamış.', 'info')
    return
  }
  selectedBranchData.value = cat
  showBranchImageModal.value = true
}

// Re-Scan Modal Logic
const showReScanModal = ref(false)
const rescanInput = ref(null)
const rescanCountdown = ref(5)
const isInfoOnlyMode = ref(false) // Bilgi için bakıldığında toggle yapmaması için
let rescanInterval = null
let rescanAutoCloseTimer = null

const fetchActiveAnnouncements = async () => {
  try {
    const params = { 
      branchId: auth.user?.branchId, 
      companyId: auth.user?.companyId,
      targetType: 'MEMBER'
    };
    const data = await announcementService.getActive(params)
    activeAnnouncements.value = data.filter(a => a.showOnLogin);
  } catch (err) {
    console.error('Aktif duyurular yüklenemedi:', err);
  }
}

const formatDate = (dateStr) => {
   if (!dateStr) return '';
   return new Date(dateStr).toLocaleDateString('tr-TR');
}

const closePaymentDetail = () => {
  isPaymentDetailOpen.value = false
  clearLastResult() // Ekranda da sıfırla ve tarayıcı ekranını geri getir
}

// Update clock
setInterval(() => {
  currentTime.value = new Date().toLocaleString('tr-TR')
}, 1000)

const initScanner = async () => {
  try {
    isScanning.value = true
    scanner = new Html5Qrcode("reader")
    
    // Gelişmiş kamera ayarları
    const config = { 
      fps: 10, 
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.0,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    }
    
    // Kamera listesini al
    const devices = await Html5Qrcode.getCameras()
    if (!devices || devices.length === 0) {
      throw new Error('Kamera bulunamadı')
    }
    
    // Arka kamerayı tercih et (tablet için)
    let selectedCamera = devices[0].id
    const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('arka'))
    if (backCamera) {
      selectedCamera = backCamera.id
    }
    
    await scanner.start(
      selectedCamera,
      config,
      (decodedText) => {
         verifyQR(decodedText)
      },
      (errorMessage) => {
         // Silently catch scan errors
      }
    )
  } catch (err) {
    console.error("Kamera başlatma hatası:", err)
    isScanning.value = false
    
    showAlertError('KAMERA HATASI', 'Kamera erişimi reddedildi veya kamera bulunamadı. Lütfen tarayıcı izinlerini kontrol edin.')
  }
}

const stopScanner = async () => {
  if (scanner) {
    try {
      await scanner.stop()
      scanner.clear()
      scanner = null
      isScanning.value = false
    } catch (err) {
      console.error("Kamera durdurma hatası:", err)
    }
  }
}

const handleManualSubmit = () => {
  if (!qrData.value) return
  verifyQR(qrData.value)
}

const speakNotification = (obj) => {
  if (!window.speechSynthesis) return

  // Cancel any ongoing speech and wait a bit for a clean start
  window.speechSynthesis.cancel()
  
  setTimeout(() => {
    const firstName = (obj.name || 'Üye').split(' ')[0]
    const action = (obj.actionType || 'ENTRY').toUpperCase()
    const isEntry = action === 'ENTRY' || action === 'INFO'
    const text = isEntry ? `Hoş geldin ${firstName}` : `Hoşçakal ${firstName}`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'tr-TR'
    
    const userGender = (obj.gender || 'BILINMIYOR').toUpperCase()
    const voices = window.speechSynthesis.getVoices()
    const trVoices = voices.filter(v => v.lang.includes('tr'))
    
    let selectedVoice = null
    
    // Comprehensive matching lists
    const femaleVariants = ['ayşe', 'ayse', 'emel', 'yelda', 'filiz', 'seda', 'sibel', 'dilara', 'female', 'vocalizer', 'google türkçe', 'ziraat']
    const maleVariants = ['tolga', 'cem', 'alp', 'vural', 'can', 'male', 'google turkish', 'vladimir'] // Vladimir bazen TR motorunda çıkabiliyor

    if (userGender === 'ERKEK') {
      // Erkek üye -> Kesinlikle Kadın sesi
      selectedVoice = trVoices.find(v => femaleVariants.some(name => v.name.toLowerCase().includes(name)))
      utterance.pitch = 1.2 // Kadın tınısı için yükseltiyoruz
    } else if (userGender === 'KADIN') {
      // Kadın üye -> Kesinlikle Erkek sesi
      selectedVoice = trVoices.find(v => maleVariants.some(name => v.name.toLowerCase().includes(name)))
      utterance.pitch = 0.8 // Erkek tınısı için kalınlaştırıyoruz
    }
    
    // Eğer zıt ses bulunamadıysa ama sistemde TR sesler varsa
    if (!selectedVoice && trVoices.length > 0) {
      if (userGender === 'ERKEK' && trVoices.length >= 2) {
        // En azından varsayılan (genelde Tolga) olmayan diğerini seç
        selectedVoice = trVoices.find(v => !v.name.toLowerCase().includes('tolga') && !v.name.toLowerCase().includes('male')) || trVoices[1]
      } else {
        selectedVoice = trVoices[0]
      }
    }
    
    if (selectedVoice) {
      console.log(`[SPEECH-FINAL] ${userGender} için SES: ${selectedVoice.name} | METİN: ${text}`)
      utterance.voice = selectedVoice
    }

    utterance.rate = 1.05
    window.speechSynthesis.speak(utterance)
  }, 50) // 50ms bekleme, ses motorunun temizlenmesi için kritik
}

const fetchStats = async () => {
  try {
    const branchId = auth.user?.branchId || '00000000-0000-0000-0000-000000000000'
    const data = await gateService.getStats(branchId)
    stats.value = data
  } catch (err) {
    console.warn('İstatistikler güncellenemedi')
  }
}

const verifyQR = async (data) => {
  if (!data) return

  try {
    const payload = { 
      qrData: data, 
      branchId: auth.user?.branchId || '00000000-0000-0000-0000-000000000000'
    };

    // Eğer bir üyenin üstüne tıklayıp bakıyorsak, giriş-çıkış tetikleme
    if (isInfoOnlyMode.value) {
       payload.actionType = 'INFO';
    }

    const resData = await gateService.verifyQR(payload)
    console.log('QR Response:', resData) // Debug
    
    const resultObj = {
      ...resData,
      time: new Date().toLocaleTimeString('tr-TR'),
      status: 'GRANTED'
    }
    
    // Eğer detay bakıyorsak (Listeden tıklanan) Dashboard aç
    if (isInfoOnlyMode.value) {
       showResult(resultObj)
    } else {
       // Normal kapı girişi ise sadece toast göster ve geçmişe ekle
       history.value.unshift(resultObj)
       fetchStats()
       speakNotification(resultObj)
       
        toast(
          resultObj.isEarlyExit 
            ? `${resultObj.name} | ERKEN ÇIKIŞ`
            : `${resultObj.name} | ${resultObj.actionType === 'ENTRY' ? 'HOŞ GELDİNİZ' : 'İYİ GÜNLER'}`,
          resultObj.isEarlyExit ? 'warning' : 'success'
        )
    }
    qrData.value = ''

  } catch (err) {
    console.error('QR Verify Error:', err)
    const errorData = err.response?.data
    const serverMessage = errorData?.message || 'Geçersiz Kod veya Kart'
    
    const failObj = {
      name: serverMessage === 'Üye kaydı bulunamadı.' ? 'BİLİNMEYEN GİRİŞ' : serverMessage,
      message: serverMessage,
      status: 'DENIED',
      time: new Date().toLocaleTimeString('tr-TR')
    }

    if (isInfoOnlyMode.value) {
       showResult(failObj)
    } else {
       history.value.unshift(failObj)
       showAlertError(failObj.name, failObj.message)
    }
    qrData.value = ''
  }
}

const showResult = async (obj) => {
  lastResult.value = obj
  resultCountdown.value = 15
  
  // Sync historical logs to mark completed days (Monday etc.)
  if (obj.dashboard?.planId) {
     syncPlanLogs(obj);
  }
  
  // Eğer giriş başarılıysa duyuruları göster (User istediği için kapatıldı)
  /*
  if (obj.status === 'GRANTED' && activeAnnouncements.value.length > 0) {
    showAnnouncementsModal.value = true
  }
  */
  
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)

  // Debug photo URL
  if (obj.photo) {
    console.log('Photo URL:', obj.photo)
    // Preload image
    const img = new Image()
    img.src = obj.photo
  }

  // Auto clear result after 15 seconds
  timer = setTimeout(() => {
    clearLastResult()
  }, 15000)

  // Countdown timer - her saniye 1 azalt
  progressInterval = setInterval(() => {
    resultCountdown.value -= 1
    if (resultCountdown.value <= 0) {
      clearInterval(progressInterval)
    }
  }, 1000)
}

const clearLastResult = () => {
  lastResult.value = null
  resultCountdown.value = 15
  isInfoOnlyMode.value = false // Modu her zaman sıfırla
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
  
  // Refocus manual input for NFC
  setTimeout(() => {
    if (manualInput.value) manualInput.value.focus()
  }, 100)
}

const handleGuestEntry = () => {
    const guestObj = {
       name: 'TEST KULLANICISI',
       message: 'STREAK EFEKTİ TEST EDİLİYOR',
       status: 'GRANTED',
       actionType: 'ENTRY',
       gender: 'ERKEK',
       time: new Date().toLocaleTimeString('tr-TR'),
       dashboard: {
          warning: 'Bu bir MİSAFİR girişidir. Kayıtlı üye değildir.'
       }
    }
    showResult(guestObj)
   history.value.unshift(guestObj)
   speakNotification(guestObj)
   stats.value.entries++
   stats.value.inside++
}

const handleGuestExit = (log, index) => {
   const exitObj = {
      name: 'MİSAFİR ZİYARETÇİ',
      message: 'DENEME ÇIKIŞI TAMAMLANDI',
      status: 'GRANTED',
      actionType: 'EXIT',
      gender: 'ERKEK',
      time: new Date().toLocaleTimeString('tr-TR'),
      dashboard: {
         warning: 'Misafir çıkışı kaydedildi. İyi günler dileriz.'
      }
   }
   showResult(exitObj)
   history.value.unshift(exitObj)
   speakNotification(exitObj)
   stats.value.inside = Math.max(0, stats.value.inside - 1)
   
   // Giriş kaydını güncelle (çıkış yapıldı olarak işaretle)
   history.value[index + 1].actionType = 'EXIT'
}

const entries = computed(() => {
   const inside = []
   const seen = new Set()
   
   // History en yeniden en eskiye (unshifted) doğru tarıyoruz
   for (const log of history.value) {
      if (log.status !== 'GRANTED' || !log.name) continue
      
      const key = log.memberId || log.memberCode || log.name
      if (!seen.has(key)) {
         seen.add(key)
         // Eğer en son hareketi GİRİŞ ise hala içeridedir
         if (log.actionType === 'ENTRY') {
            inside.push(log)
         }
      }
   }
   return inside
})

const exits = computed(() => history.value.filter(log => log.actionType === 'EXIT'))

const showEntryFromHistory = async (log) => {
   // User wants a modal to scan card when clicking an item
   qrData.value = ''
   isInfoOnlyMode.value = true // Bilgi modunu aktif et
   showReScanModal.value = true
   rescanCountdown.value = 5
   
   // Auto hide after 5 seconds
   if (rescanAutoCloseTimer) clearTimeout(rescanAutoCloseTimer)
   if (rescanInterval) clearInterval(rescanInterval)
   
   rescanAutoCloseTimer = setTimeout(() => {
     showReScanModal.value = false
   }, 5000)

   rescanInterval = setInterval(() => {
     rescanCountdown.value -= 1
     if (rescanCountdown.value <= 0) clearInterval(rescanInterval)
   }, 1000)

   await nextTick()
   if (rescanInput.value) rescanInput.value.focus()
}

const handleRescanSubmit = () => {
   if (!qrData.value) return
   showReScanModal.value = false
   if (rescanAutoCloseTimer) clearTimeout(rescanAutoCloseTimer)
   if (rescanInterval) clearInterval(rescanInterval)
   verifyQR(qrData.value)
}

// Global ESC key listener to clear result
const handleKeydown = (e) => {
  if (e.key === 'Escape') clearLastResult()
}

// Check if date changed to reset history
const checkDailyReset = () => {
  const lastDate = Storage.getItem('gateSimulatorLastDate')
  const today = new Date().toLocaleDateString('tr-TR')
  
  if (lastDate !== today) {
    history.value = []
    Storage.setItem('gateSimulatorLastDate', today)
  }
}
// Şube Bilgilerini Getir
const fetchBranchInfo = async () => {
  try {
    const branchId = auth.user?.branchId
    if (branchId) {
      const { branchService } = await import('../services/admin/branchService')
      const data = await branchService.getById(branchId)
      branchInfo.value = data
    }
  } catch (err) {
    console.error('Şube bilgileri yüklenemedi:', err)
  }
}

const canToggleToday = (plan) => {
  if (!lastResult.value || !lastResult.value.dashboard) return false;
  if (plan.dayIndex !== lastResult.value.dashboard.todayIndex) return false;
  
  const entryTimeStr = lastResult.value.time;
  if (!entryTimeStr) return false;
  
  const [h, m, s] = entryTimeStr.split(':').map(Number);
  const entryDate = new Date();
  entryDate.setHours(h, m, s, 0);
  
  const now = new Date();
  const diffMinutes = (now - entryDate) / (1000 * 60);
  
  return diffMinutes >= 30;
}

const syncPlanLogs = async (obj) => {
   try {
      const planId = obj.dashboard?.planId;
      const memberId = obj.id || obj.dashboard?.memberId; // Fallback sources
      const week = obj.dashboard?.currentWeek || 1;
      
      if (!planId || !memberId) return; // Silent exit if not a training scan
      
      const logs = await gateService.getTrainingLogs(planId, week, memberId)
      
      if (logs && obj.dashboard.weeklyPlans) {
         obj.dashboard.weeklyPlans.forEach(plan => {
            const logFound = logs.find(l => Number(l.dayOfWeek) === Number(plan.dayIndex));
            if (logFound) plan.isCompleted = true;
         });
      }
   } catch (err) {
      console.error('Logs sync error:', err);
   }
}

const toggleTodayCompletion = async (plan) => {
  if (!canToggleToday(plan)) {
     showAlertError('HENÜZ ÇOK ERKEN', 'Antrenmanı tamamlamak için giriş yaptıktan sonra en az 30 dakika geçmelidir.')
     return;
  }
  
  try {
     const planId = lastResult.value.dashboard.planId;
     const week = lastResult.value.dashboard.currentWeek || 1;
     const dayOfWeek = plan.dayIndex;
     
     await gateService.toggleTrainingLog({
        planId, week, dayOfWeek, memberId: lastResult.value.id
     });
     
     plan.isCompleted = !plan.isCompleted;
     
     toast(plan.isCompleted ? 'ANTRENMAN TAMAMLANDI' : 'GÜNCELLENDİ')
     
  } catch (err) {
     console.error('Completion error:', err);
  }
}

onMounted(() => {
  checkDailyReset()
  fetchStats()
  fetchBranchInfo()
  fetchActiveAnnouncements()
  
  window.addEventListener('keydown', handleKeydown)
  
  // Auto-focus the input
  setTimeout(() => {
    if (manualInput.value) manualInput.value.focus()
  }, 500)

  // Initial fetch
  fetchStats()
  
  // Start heartbeat
  sendHeartbeat()
  heartbeatTimer = setInterval(sendHeartbeat, 60000)
  
  // Refresh stats periodically
  timer = setInterval(fetchStats, 30000)
})

const sendHeartbeat = async () => {
  try {
    await gateService.sendHeartbeat()
  } catch (err) {
    console.warn('Heartbeat failed')
  }
}


onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (scanner) scanner.stop()
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
  if (heartbeatTimer) clearInterval(heartbeatTimer)
})
const handleLogout = async () => {
  const isConfirmed = await confirm('ÇIKIŞ YAPILIYOR', 'Terminalden çıkış yapmak istediğinize emin misiniz?')

  if (isConfirmed) {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
 

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); }

.red-scrollbar::-webkit-scrollbar { width: 10px; }
.red-scrollbar::-webkit-scrollbar-track { background: rgba(255, 0, 0, 0.02); }
.red-scrollbar::-webkit-scrollbar-thumb { 
  background: linear-gradient(to bottom, #ff0040, #ff00ff, #ff0040); 
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 0, 64, 1), inset 0 0 8px rgba(255, 255, 255, 0.8);
}
.red-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ff3366, #ff00ff, #ff3366);
  box-shadow: 0 0 30px rgba(255, 0, 64, 1), inset 0 0 12px rgba(255, 255, 255, 1);
}
.red-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ff0040 rgba(255, 0, 0, 0.05);
  overflow-y: scroll !important;
}

/* Neon Red Caret & Glowing Input */
.caret-red-neon {
  caret-color: #ff0000;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

/* Cyber Scan Effects */
@keyframes scan-line {
  0% { top: -10%; }
  100% { top: 110%; }
}
.animate-scan-line {
  animation: scan-line 3s linear infinite;
}

@keyframes hud-flicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
.animate-hud-flicker {
  animation: hud-flicker 2s ease-in-out infinite;
}

@keyframes typing-effect {
  from { width: 0; }
  to { width: 100%; }
}
.cyber-hud-text {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #22d3ee;
  animation: typing-effect 1.5s steps(30, end), blink-caret 0.75s step-end infinite;
}

@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #22d3ee; }
}

/* Fire Effect (Original Version) */
@keyframes flame-rise {
  0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.8; }
  100% { transform: translateY(-40px) scale(0.5) rotate(20deg); opacity: 0; }
}

.flame-particle {
  position: absolute;
  bottom: 20px;
  background: radial-gradient(circle, #ff4d00, #ff0000);
  filter: blur(8px);
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: screen;
}

@keyframes streak-pulse {
  0% { box-shadow: 0 0 20px #ff4500, inset 0 0 20px #ff4500; border-color: #ff4500; }
  50% { box-shadow: 0 0 50px #ff8c00, inset 0 0 30px #ff8c00; border-color: #ff8c00; }
  100% { box-shadow: 0 0 20px #ff4500, inset 0 0 20px #ff4500; border-color: #ff4500; }
}

.animate-streak {
  animation: streak-pulse 1s infinite ease-in-out;
}
</style>
