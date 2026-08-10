<template>
  <div class="h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100">
    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden p-2 gap-2 relative">
       <!-- TACTICAL TOOLS SIDEBAR -->
       <div class="w-14 shrink-0 flex flex-col gap-4">
          <!-- Main Palette Box -->
          <div class="flex flex-col items-center gap-2 bg-slate-900/40 border border-white/5 p-2 shadow-xl">
             <button 
               @click="currentTool = 'select'"
               class="p-2.5 rounded-none transition-all hover:bg-slate-800"
               :class="currentTool === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'"
               title="Seç / Taşı"
             >
                <MousePointer2 class="w-5 h-5" />
             </button>
             <button 
               @click="currentTool = 'pen'"
               class="p-2.5 rounded-none transition-all hover:bg-slate-800"
               :class="currentTool === 'pen' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'"
               title="Çizim Kalemi"
             >
                <Pencil class="w-5 h-5" />
             </button>
             <button 
               @click="currentTool = 'eraser'"
               class="p-2.5 rounded-none transition-all hover:bg-slate-800 active:scale-95"
               :class="currentTool === 'eraser' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'"
               title="Silgi"
             >
                <Eraser class="w-5 h-5" />
             </button>
             <div class="h-px w-8 bg-slate-800 my-1"></div>
             <button 
               @click="clearCanvas"
               class="p-2.5 rounded-none transition-all hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
               title="Çizimleri Temizle"
             >
                <RotateCcw class="w-5 h-5" />
             </button>
          </div>

          <!-- Pen Controls Box -->
          <div v-if="currentTool === 'pen'" class="flex flex-col items-center gap-3 bg-slate-900/40 border border-white/5 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
             <div class="flex flex-col gap-2">
                <button 
                  v-for="color in penColors" 
                  :key="color.value"
                  @click="strokeColor = color.value"
                  class="w-6 h-6 rounded-none transition-all active:scale-90"
                  :class="strokeColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-lg scale-110' : 'opacity-40 hover:opacity-100'"
                  :style="{ backgroundColor: color.value }"
                ></button>
             </div>
             <div class="h-px w-8 bg-slate-800"></div>
             <div class="flex flex-col gap-1">
                <button 
                  v-for="size in [2, 4, 8, 10]" 
                  :key="size"
                  @click="strokeWidth = size"
                  class="w-8 h-8 flex items-center justify-center transition-all hover:bg-slate-800 rounded-none relative group"
                  :class="strokeWidth === size ? 'bg-slate-700 text-white shadow-inner font-black' : 'text-slate-500'"
                  :title="size + 'px Kalınlık'"
                >
                   <span :style="{ height: size + 'px' }" class="w-5 bg-current rounded-full"></span>
                </button>
             </div>
             <div class="h-px w-8 bg-slate-800"></div>
             <button 
                @click="isDashed = !isDashed"
                class="w-8 h-8 flex items-center justify-center transition-all hover:bg-slate-800 rounded-none"
                :class="isDashed ? 'bg-indigo-600 text-white shadow-inner' : 'text-slate-500'"
                title="Kesikli Çizgi"
             >
                <div class="flex flex-col gap-0.5 rotate-90">
                    <span class="w-2 h-1 bg-current rounded-full"></span>
                    <span class="w-2 h-1 bg-current rounded-full"></span>
                </div>
             </button>
          </div>

          <!-- Football Formations Box (Optional but moved for consistency) -->
          <div v-if="boardType === 'football'" class="flex flex-col gap-1 bg-slate-900/40 border border-white/5 p-1 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
             <p class="text-[0.45rem] font-black text-slate-600 text-center py-1 uppercase tracking-tighter">DİZİLİŞ</p>
             <button 
               v-for="form in allFormations" 
               :key="form.name"
               @click="applyFormation(form)"
               class="w-full py-2 text-[0.5rem] font-black uppercase tracking-tighter rounded-none transition-all hover:bg-slate-800"
               :class="currentFormation === form.name ? 'bg-emerald-600 text-white' : 'text-slate-500'"
             >
                {{ form.name.split(' ')[0] }}
             </button>
          </div>
       </div>

       <!-- Left Sidebar (Roster) -->
        <!-- Left Sidebar - Narrowed for bigger pitch -->
        <div v-if="selectedGroupId" class="w-60 shrink-0 flex flex-col gap-4 uppercase italic font-bold overflow-hidden">
          <!-- AS KADRO (İLK 11) -->
          <div class="flex-[1.4] flex flex-col min-h-0 bg-slate-900/40 border border-white/5 p-3 shadow-xl relative overflow-hidden group">
             <div class="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                <ShieldCheck class="w-12 h-12 text-emerald-500" />
             </div>
             <div class="flex items-center justify-between mb-3 px-1 relative z-10">
                <div class="flex items-center gap-2">
                   <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span class="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest">AS KADRO (İLK 11)</span>
                </div>
             </div>
             
             <BaseScroll accent="emerald" class="flex-1 pr-2">
                <div class="space-y-1">
                   <div 
                     v-for="player in players.slice(0, 11)" 
                     :key="player.id"
                     class="p-2 border rounded-none flex items-center gap-3 transition-all select-none"
                     :class="isOnPitch(player.id) 
                       ? 'opacity-30 bg-slate-950/50 border-slate-900 cursor-not-allowed filter grayscale' 
                       : 'bg-slate-900/50 border-slate-800/50 cursor-move group hover:border-emerald-500/50 hover:bg-slate-900'"
                     @mousedown="!isOnPitch(player.id) && startDraggingNew(player, 'player', $event)"
                   >
                      <BaseMemberAvatar :src="player.photo" :name="player.fullName" size="sm" />
                      <div class="flex-1 min-w-0">
                         <p class="text-[0.6rem] font-black text-slate-100 uppercase truncate leading-tight">{{ player.fullName }}</p>
                         <p class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">{{ getPositionLabel(player) }}</p>
                      </div>
                      <GripVertical v-if="!isOnPitch(player.id)" class="w-3.5 h-3.5 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <ShieldCheck v-else class="w-3.5 h-3.5 text-emerald-500" />
                   </div>
                </div>
             </BaseScroll>
          </div>

          <!-- YEDEKLER -->
          <div class="flex-1 flex flex-col min-h-0 bg-slate-900/40 border border-white/5 p-3 shadow-xl relative overflow-hidden group">
             <div class="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                <Users class="w-12 h-12 text-indigo-500" />
             </div>
             <div class="flex items-center justify-between mb-3 px-1 relative z-10">
                <div class="flex items-center gap-2">
                   <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                   <span class="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest">YEDEKLER (SUB)</span>
                </div>
                <span class="text-[0.55rem] font-bold text-slate-600">{{ Math.max(0, players.length - 11) }} OYUNCU</span>
             </div>

             <BaseScroll accent="indigo" class="flex-1 pr-2">
                <div class="space-y-1">
                   <div 
                     v-for="player in players.slice(11)" 
                     :key="player.id"
                     class="p-2 border rounded-none flex items-center gap-3 transition-all select-none"
                     :class="isOnPitch(player.id) 
                       ? 'opacity-30 bg-slate-950/50 border-slate-900 cursor-not-allowed filter grayscale' 
                       : 'bg-slate-900/50 border-slate-800/50 cursor-move group hover:border-emerald-500/50 hover:bg-slate-900'"
                     @mousedown="!isOnPitch(player.id) && startDraggingNew(player, 'player', $event)"
                   >
                      <BaseMemberAvatar :src="player.photo" :name="player.fullName" size="sm" />
                      <div class="flex-1 min-w-0">
                         <p class="text-[0.6rem] font-black text-slate-100 uppercase truncate leading-tight">{{ player.fullName }}</p>
                         <p class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">{{ getPositionLabel(player) }}</p>
                      </div>
                      <GripVertical v-if="!isOnPitch(player.id)" class="w-3.5 h-3.5 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <ShieldCheck v-else class="w-3.5 h-3.5 text-emerald-500" />
                   </div>
                   <div v-if="players.length <= 11" class="py-10 text-center">
                      <p class="text-[0.5rem] text-slate-700 tracking-tighter uppercase font-black">YEDEK OYUNCU BULUNMUYOR</p>
                   </div>
                </div>
             </BaseScroll>
          </div>
        </div>

       <!-- Center: The Pitch -->
       <div 
         ref="pitchContainer"
         class="flex-1 bg-slate-900/40 border border-white/5 relative overflow-hidden select-none shadow-[0_0_50px_rgba(0,0,0,0.5)]"
         :class="{ 
          'cursor-crosshair': currentTool === 'pen', 
          'cursor-none': currentTool === 'eraser',
          'cursor-default': currentTool === 'select'
        }"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mousedown="onPitchMouseDown"
        @mouseleave="onMouseLeave"
        @click="selectedItemId = null"
       >
        <canvas ref="drawingCanvas" class="absolute inset-0 z-20 pointer-events-none"></canvas>

        <!-- Eraser Overlay -->
        <div 
          v-if="currentTool === 'eraser' && isMouseInPitch"
          class="fixed rounded-full border-2 border-rose-500 bg-rose-500/40 pointer-events-none z-[100]"
          :style="{ 
            width: eraserSize + 'px', 
            height: eraserSize + 'px', 
            left: screenMousePos.x - (eraserSize/2) + 'px', 
            top: screenMousePos.y - (eraserSize/2) + 'px'
          }"
        ></div>

          <!-- Markings (Snow White & Bright) -->
          <div v-if="boardType === 'football'" class="absolute inset-4 border-2 border-white rounded-none pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
             <!-- Center Line -->
             <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -translate-x-1/2 opacity-80"></div>
             <!-- Center Circle -->
             <div class="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
             <!-- Center Spot (The "Ball" at center) -->
             <div class="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_white] z-30"></div>
             
             <!-- Penalty boxes -->
             <div class="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-72 border-2 border-white border-l-0 rounded-none opacity-90"></div>
             <div class="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-72 border-2 border-white border-r-0 rounded-none opacity-90"></div>
             
             <!-- Goal Areas -->
             <div class="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-36 border-2 border-white border-l-0 rounded-none opacity-70"></div>
             <div class="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-36 border-2 border-white border-r-0 rounded-none opacity-70"></div>

             <!-- Goals (The "Kale") -->
             <div class="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-20 border-2 border-white/80 border-r-0 bg-white/10 rounded-l-sm"></div>
             <div class="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-20 border-2 border-white/80 border-l-0 bg-white/10 rounded-r-sm"></div>
             
             <!-- Corner Flags -->
             <div class="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-amber-500 z-10"></div>
             <div class="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-amber-500 z-10"></div>
             <div class="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-amber-500 z-10"></div>
             <div class="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-amber-500 z-10"></div>
          </div>

          <!-- Active Items -->
          <div 
            v-for="p in activeOnPitch" 
            :key="p.id"
            class="absolute cursor-grab group transition-all"
            :style="{ 
               left: p.x + '%', 
               top: p.y + '%',
               transform: `translate(-50%, -50%) ${draggedItem?.id === p.id ? 'scale(1.05)' : 'scale(1)'} ${p.flipX ? 'scaleX(-1)' : ''}`,
               zIndex: selectedItemId === p.id ? 50 : 10
            }"
            @mousedown.stop="onMouseDown(p, $event)"
            @click.stop="selectedItemId = p.id"
          >
             <div 
               class="relative flex flex-col items-center p-1"
               :class="{ 'ring-2 ring-indigo-500 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]': selectedItemId === p.id }"
             >
                <!-- Player -->
                <div v-if="p.type === 'player'" class="relative pointer-events-none">
                   <div 
                     class="rounded-none p-0.5 bg-slate-950 border-2 transition-all relative overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
                     :style="{ width: (64 * p.scale) + 'px', height: (64 * p.scale) + 'px' }"
                     :class="selectedItemId === p.id ? 'border-indigo-400' : 'border-slate-700'"
                   >
                      <img v-if="p.photo" :src="getUploadUrl(p.photo)" class="w-full h-full object-cover rounded-none" />
                      <!-- Jersey Number -->
                      <div class="absolute top-0 right-0 bg-slate-900/90 border-l border-b border-white/20 px-1 text-[0.45rem] font-black text-emerald-400">
                         #{{ p.number || '?' }}
                      </div>
                   </div>
                   <div class="mt-2 px-3 py-1 bg-slate-950 border border-slate-700 rounded-none shadow-lg">
                       <p class="text-[0.6rem] font-black text-white uppercase tracking-tighter">{{ (p.fullName || '').split(' ')[0] }}</p>
                   </div>
                </div>

                <!-- Object -->
                <div v-else class="relative pointer-events-none">
                    <div 
                        class="flex items-center justify-center transition-all bg-slate-950/95 border border-slate-800 shadow-2xl p-2 rounded-none"
                        :style="{ 
                            width: (p.icon ? 44 * p.scale : 52 * p.scale) + 'px', 
                            height: (p.icon ? 44 * p.scale : 52 * p.scale) + 'px' 
                        }"
                        :class="selectedItemId === p.id ? 'border-indigo-400' : 'opacity-90'"
                    >
                        <component :is="p.icon" v-if="p.icon" class="w-full h-full" :class="p.color || 'text-white'" />
                        <span v-else class="filter drop-shadow-md select-none leading-none" :style="{ fontSize: (30 * p.scale) + 'px' }">{{ p.emoji }}</span>
                    </div>
                </div>

                <!-- Resize Handle -->
                <div 
                  v-if="selectedItemId === p.id"
                  class="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-500 border-2 border-white cursor-nwse-resize z-[60] flex items-center justify-center shadow-lg"
                  @mousedown.stop.prevent="startResizing(p, $event)"
                >
                   <Maximize2 class="w-3.5 h-3.5 text-white" />
                </div>

                <!-- Delete / Remove -->
                <button 
                  v-for="btn in [
                    { id: 'sub', icon: ArrowRightLeft, title: 'Değiştir (Kenara Al)', color: 'bg-amber-600', pos: { top: '-0.75rem', right: '2.5rem' } },
                    { id: 'del', icon: X, title: 'Sil', color: 'bg-rose-600', pos: { top: '-0.75rem', right: '-0.75rem' } },
                    { id: 'flip', icon: MoveHorizontal, title: 'Yönü Çevir', color: 'bg-indigo-600', pos: { bottom: '-0.75rem', left: '-0.75rem' } }
                  ]"
                  :key="btn.id"
                  v-if="selectedItemId === p.id"
                  @click.stop="btn.id === 'flip' ? p.flipX = !p.flipX : removeFromPitch(p.id)"
                  class="absolute w-6 h-6 text-white rounded-none flex items-center justify-center shadow-lg hover:brightness-110 z-[60] border border-white/20 transition-all font-black"
                  :class="btn.color"
                  :style="btn.pos"
                  :title="btn.title"
                >
                   <component :is="btn.icon" class="w-3.5 h-3.5" />
                </button>
             </div>
          </div>

          <!-- Warning Overlay -->
          <div v-if="showPitchWarning" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-rose-600/90 text-white px-6 py-3 border border-white/20 shadow-2xl backdrop-blur-sm animate-bounce">
             <div class="flex items-center gap-3">
                <Info class="w-6 h-6 animate-pulse" />
                <span class="text-sm font-black uppercase italic tracking-widest">SAHA İÇİNDE EN FAZLA 11 OYUNCU OLABİLİR!</span>
             </div>
          </div>

          <!-- Preview -->
          <div v-if="previewItem" class="absolute pointer-events-none opacity-50 z-50 scale-110" :style="{ left: mousePos.x + 'px', top: mousePos.y + 'px', transform: 'translate(-50%, -50%)' }">
             <div v-if="previewItem.type === 'player'" class="w-12 h-12 border-2 border-indigo-400 overflow-hidden"><img :src="getUploadUrl(previewItem.photo)" class="w-full h-full object-cover" /></div>
             <div v-else class="flex items-center justify-center w-12 h-12 bg-slate-950 border border-indigo-700">
                <component :is="previewItem.icon" v-if="previewItem.icon" class="w-8 h-8" :class="previewItem.color" />
                <span v-else class="text-3xl">{{ previewItem.emoji }}</span>
             </div>
          </div>
       </div>

       <!-- Right Side - Narrowed for bigger pitch -->
       <div class="w-60 flex flex-col gap-2 overflow-hidden uppercase italic font-bold">
          <!-- Objects Box Moved from Left to Right -->
          <div class="shrink-0 flex flex-col bg-slate-900/50 border border-slate-800 rounded-none overflow-hidden h-[350px]">
             <div class="flex border-b border-slate-800 shrink-0 overflow-x-auto no-scrollbar bg-slate-950/50">
                <button 
                  v-for="cat in objectCategories" 
                  :key="cat.id"
                  @click="activeCategory = cat.id"
                  class="flex-1 py-3 text-[0.45rem] font-bold uppercase tracking-widest border-b-2 transition-all"
                  :class="activeCategory === cat.id ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-600 hover:text-slate-400'"
                >
                   {{ cat.name }}
                </button>
             </div>
             
             <BaseScroll direction="vertical" class="flex-1">
                <div class="grid grid-cols-5 gap-1 p-2 content-start align-top">
                   <div 
                     v-for="obj in filteredObjects" 
                     :key="obj.id"
                     class="aspect-square bg-slate-950 border border-slate-800 rounded-none flex items-center justify-center cursor-move group hover:border-indigo-500 hover:bg-white/5 transition-all select-none relative"
                     @mousedown="startDraggingNew(obj, 'object', $event)"
                   >
                      <component :is="obj.icon" v-if="obj.icon" class="w-5 h-5 flex-shrink-0" :class="obj.color || 'text-slate-400'" />
                      <span v-else class="text-xl flex-shrink-0 leading-none filter drop-shadow-sm">{{ obj.emoji }}</span>
                   </div>
                </div>
             </BaseScroll>
          </div>

          <div class="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-none overflow-hidden relative">
             <div class="p-5 border-b border-slate-800 flex items-center justify-between">
                <LayoutList class="w-4 h-4 text-slate-500" />
                <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">TAKTİK NOTLARI</span>
             </div>
             <textarea class="flex-1 p-5 bg-transparent border-none outline-none text-[0.65rem] font-bold text-slate-300 resize-none leading-loose custom-scrollbar uppercase italic" placeholder="NOTLARINIZ..."></textarea>
          </div>
       </div>
    </div>

    <!-- 3. ACTION FOOTER -->
    <BaseActionFooter>
      <template #left>
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
          <template #icon><ArrowLeft class="w-5 h-5" /></template>
        </BaseButton>
      </template>

      <template #default>
        <div class="flex items-center justify-center bg-slate-900/40 border-2 border-slate-700/50 p-1 gap-1 rounded-none shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div class="flex items-center gap-3">
            <!-- Clear / Close Button -->
            <button 
              v-if="selectedGroupId"
              @click="selectedGroupId = ''"
              type="button" 
              class="flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 font-ui-normal text-ui-button tracking-ui bg-slate-900 border-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all w-[30px] h-[30px] p-0 aspect-square"
              title="TAKIMDAN ÇIK"
            >
              <X class="w-4 h-4" />
            </button>

            <div v-if="selectedGroupId" class="w-px h-6 bg-slate-800 mx-1"></div>

            <!-- Selected Team Display -->
            <div v-if="selectedGroupId" class="px-2 flex items-center gap-2 min-w-[120px]">
               <span class="text-[0.6rem] font-black text-emerald-400 uppercase italic tracking-wider">{{ selectedGroup?.name }}</span>
               <div class="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>

            <!-- Add / Select Button -->
            <div v-if="!selectedGroupId" class="relative group/picker drop-up">
              <button 
                type="button" 
                @click="isTeamDropdownOpen = !isTeamDropdownOpen"
                class="flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 font-ui-normal text-ui-button tracking-ui bg-sky-500/10 hover:bg-sky-500/30 text-sky-400 border-2 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] w-[30px] h-[30px] p-0 aspect-square"
                title="TAKIM SEÇ"
              >
                <Plus class="w-5 h-5" />
              </button>

              <!-- Custom Pick Dropdown (Opens Unward) -->
              <Transition name="fade-slide">
                <div v-if="isTeamDropdownOpen" class="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border-2 border-slate-700 shadow-2xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <div class="px-3 py-2 border-b border-slate-800 mb-1">
                    <p class="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">BRANŞA GÖRE TAKIMLAR</p>
                  </div>
                  <div class="max-h-60 overflow-y-auto custom-scrollbar">
                    <button 
                      v-for="group in footballGroups" 
                      :key="group.id"
                      @click="selectedGroupId = group.id; isTeamDropdownOpen = false"
                      class="w-full flex items-center justify-between px-3 py-2.5 text-[0.6rem] font-bold tracking-widest border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-400 transition-all text-left mb-1"
                    >
                      {{ group.name }}
                      <span class="text-[0.5rem] opacity-50">{{ group.specialty?.name }}</span>
                    </button>
                    <div v-if="footballGroups.length === 0" class="p-4 text-center">
                      <p class="text-[0.55rem] text-slate-600 font-bold uppercase italic">FUTBOL BRANŞINDA TAKIM BULUNAMADI</p>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </template>

      <template #right>
         <div class="flex items-center gap-4">
            <BaseButton variant="danger" size="icon" square @click="clearPitch" title="TAHTAYI SIFIRLA" class="!rounded-none bg-rose-600/10 border-rose-600/30 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.1)]">
               <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>
         </div>
      </template>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { 
  Trophy, Trash2, GripVertical, UserX, X, Info, LayoutList, Users, ShieldCheck, Zap, Activity,
  MousePointer2, Pencil, Eraser, RotateCcw, Minus, Circle, Target, Flag, Maximize2, Timer, 
  Dumbbell as DumbbellIcon, HeartPulse, ArrowRightCircle, Star, Triangle, Square, Hexagon,
  ArrowLeft, ArrowUp, ArrowDown, MoveHorizontal, MoveVertical, ArrowRightLeft, Plus
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'

const router = useRouter()

// Services & Composables
import { sportGroupService } from '../../services/sport/sportGroupService'
import { formationService } from '../../services/sport/formationService'
import { useSportGroups } from '../../composables/useSportGroups'
import { useFormations } from '../../composables/useFormations'
import { useAlerts } from '../../utils/alerts'
import api from '../../utils/api'

const { getUploadUrl } = api;

const { groups: sportGroups, fetchGroups: fetchSportGroups } = useSportGroups()
const { formations: dynamicFormations, fetchFormations } = useFormations()
const { error: showAlertError } = useAlerts()

const selectedGroupId = ref('')
const players = ref([])
const activeOnPitch = ref([])

const pitchContainer = ref(null)
const drawingCanvas = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const screenMousePos = ref({ x: 0, y: 0 })
const isMouseInPitch = ref(false)
const dragType = ref(null)
const draggedItem = ref(null)
const previewItem = ref(null)
const selectedItemId = ref(null)
const activeCategory = ref('football')
const resizeStart = ref({ y: 0, scale: 1 })
const isTeamDropdownOpen = ref(false)
const footballGroups = computed(() => {
    return sportGroups.value.filter(g => 
        (g.specialty?.name || '').toLowerCase().includes('futbol')
    )
})
const showPitchWarning = ref(false)


const objectCategories = [
    { id: 'football', name: 'FUTBOL' },
    { id: 'gym', name: 'GYM & SPOR' },
    { id: 'shapes', name: 'ŞEKİLLER' },
    { id: 'emojis', name: 'EMOJİ' }
]

const tacticalObjects = [
    // Top Bölümü (Favoriler - Hepsi en üst satırda)
    { id: 'fb-1', emoji: '⚽', category: 'football' },
    { id: 'em-1', emoji: '😊', category: 'football' },
    { id: 'em-3', emoji: '😠', category: 'football' },
    { id: 'em-heart', emoji: '❤️', category: 'football' }, 
    { id: 'em-7', emoji: '🔥', category: 'football' },
    { id: 'em-8', emoji: '💪', category: 'football' },
    { id: 'em-bottle', emoji: '🥤', category: 'football' },
    { id: 'em-glass', emoji: '🥛', category: 'football' },
    { id: 'sh-R1', icon: ArrowRightCircle, color: 'text-white', category: 'football' },
    { id: 'sh-8', icon: ArrowLeft, color: 'text-white', category: 'football' },
    { id: 'fb-3', icon: Flag, color: 'text-rose-500', category: 'football' },
    { id: 'fb-2', icon: ShieldCheck, color: 'text-white', category: 'football' },
    
    // Gym & Spor
    { id: 'gym-1', icon: DumbbellIcon, color: 'text-slate-200', category: 'gym' },
    { id: 'gym-2', icon: Timer, color: 'text-emerald-400', category: 'gym' },
    { id: 'sp-1', emoji: '🧍‍♂️', category: 'gym' }, // Tam Erkek (Standing)
    { id: 'sp-2', emoji: '🧍‍♀️', category: 'gym' }, // Tam Kadın (Standing)
    { id: 'sp-3', emoji: '🚶‍♂️', category: 'gym' }, // Tam Erkek (Walking)
    { id: 'sp-4', emoji: '🚶‍♀️', category: 'gym' }, // Tam Kadın (Walking)
    { id: 'sp-5', emoji: '🏋️‍♂️', category: 'gym' },
    { id: 'sp-6', emoji: '🥋', category: 'gym' },
    { id: 'sp-7', emoji: '🎾', category: 'gym' },
    { id: 'sp-8', emoji: '🤺', category: 'gym' },
    { id: 'sp-9', emoji: '🥅', category: 'gym' }, // Kale Direği
    { id: 'sp-10', emoji: '🏀', category: 'gym' }, // Basket Potası

    // Şekiller
    { id: 'sh-1', icon: Circle, color: 'text-rose-400', category: 'shapes' }, // Daire
    { id: 'sh-12', icon: Circle, color: 'text-rose-500', category: 'shapes', scale: 0.7 }, // Elips (Küçük Daire)
    { id: 'sh-2', icon: Triangle, color: 'text-emerald-500', category: 'shapes' },
    { id: 'sh-3', icon: Square, color: 'text-indigo-400', category: 'shapes' },
    { id: 'sh-4', icon: Square, color: 'text-sky-400', category: 'shapes', scale: 1.5 },
    { id: 'sh-5', emoji: '⬠', category: 'shapes' },
    { id: 'sh-6', icon: Hexagon, color: 'text-amber-500', category: 'shapes' },
    { id: 'sh-7', icon: MoveHorizontal, color: 'text-slate-400', category: 'shapes' },
    { id: 'sh-8', icon: MoveVertical, color: 'text-slate-400', category: 'shapes' },

    // Diğer Emojiler
    { id: 'em-2', emoji: '☹️', category: 'emojis' },
    { id: 'em-4', emoji: '😳', category: 'emojis' },
    { id: 'em-heart', emoji: '❤️', category: 'emojis' }, // Kalp
    { id: 'em-bottle', emoji: '🥤', category: 'emojis' }, // Sporcu Şişesi
    { id: 'em-glass', emoji: '🥛', category: 'emojis' }, // Bardak
    { id: 'em-10', emoji: '🎯', category: 'emojis' },
    { id: 'em-11', emoji: '🏆', category: 'emojis' },
    { id: 'em-12', emoji: '📍', category: 'emojis' }
]

const filteredObjects = computed(() => tacticalObjects.filter(obj => obj.category === activeCategory.value))

const currentTool = ref('select') 
const isDrawing = ref(false)
const eraserSize = 40
let ctx = null

const strokeColor = ref('#34d399')
const strokeWidth = ref(3)
const isDashed = ref(false)
const penColors = [
    { name: 'Emerald', value: '#34d399' }, { name: 'White', value: '#ffffff' }, { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' }, { name: 'Sky', value: '#38bdf8' }
]

const selectedGroup = computed(() => sportGroups.value.find(g => g.id === selectedGroupId.value))
const boardType = computed(() => {
    if (!selectedGroup.value) return 'generic'
    const name = selectedGroup.value.specialty?.name?.toLowerCase() || ''
    if (name.includes('futbol')) return 'football'
    return 'generic'
})

const staticFormations = [
  { name: '4-4-2', layout: [{ x: 10, y: 50 }, { x: 25, y: 20 }, { x: 25, y: 40 }, { x: 25, y: 60 }, { x: 25, y: 80 }, { x: 50, y: 20 }, { x: 50, y: 40 }, { x: 50, y: 60 }, { x: 50, y: 80 }, { x: 80, y: 40 }, { x: 80, y: 60 }]},
  { name: '4-3-3', layout: [{ x: 10, y: 50 }, { x: 25, y: 20 }, { x: 25, y: 40 }, { x: 25, y: 60 }, { x: 25, y: 80 }, { x: 45, y: 30 }, { x: 45, y: 50 }, { x: 45, y: 70 }, { x: 75, y: 20 }, { x: 75, y: 50 }, { x: 75, y: 80 }]},
  { name: '5-4-1 DEFANSİF', layout: [{ x: 10, y: 50 }, { x: 25, y: 15 }, { x: 25, y: 32 }, { x: 25, y: 50 }, { x: 25, y: 68 }, { x: 25, y: 85 }, { x: 50, y: 25 }, { x: 50, y: 42 }, { x: 50, y: 58 }, { x: 50, y: 75 }, { x: 80, y: 50 }]},
  { name: '3-2-5 FULL ATAK', layout: [{ x: 10, y: 50 }, { x: 25, y: 30 }, { x: 25, y: 50 }, { x: 25, y: 70 }, { x: 45, y: 40 }, { x: 45, y: 60 }, { x: 75, y: 15 }, { x: 75, y: 32 }, { x: 75, y: 50 }, { x: 75, y: 68 }, { x: 75, y: 85 }]}
]
const allFormations = computed(() => {
    return [...staticFormations, ...dynamicFormations.value]
})
const currentFormation = ref('')

const fetchDynamicFormations = async () => {
    if (!selectedGroup.value?.specialtyId) return
    try {
        await fetchFormations(selectedGroup.value.specialtyId)
    } catch (err) {
        console.error('Dinamik dizilimler yüklenemedi:', err)
    }
}

const fetchPlayers = async (groupId) => {
    if (!groupId) return;
    try { 
      players.value = await sportGroupService.getMembers(groupId)
    } catch (err) { 
      console.error(err); 
    }
}

watch(selectedGroupId, (val) => { 
    fetchPlayers(val); 
    fetchDynamicFormations();
    clearPitch(); 
})
onMounted(() => { fetchSportGroups(); initCanvas(); window.addEventListener('resize', initCanvas); })

const initCanvas = () => {
    if (!drawingCanvas.value || !pitchContainer.value) return
    const rect = pitchContainer.value.getBoundingClientRect();
    drawingCanvas.value.width = rect.width; drawingCanvas.value.height = rect.height;
    ctx = drawingCanvas.value.getContext('2d'); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
}

const onPitchMouseDown = (e) => {
    if (currentTool.value === 'select') return
    isDrawing.value = true; const rect = pitchContainer.value.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    if (currentTool.value === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = eraserSize; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = strokeColor.value; ctx.lineWidth = strokeWidth.value; ctx.setLineDash(isDashed.value ? [10, 5] : []); }
}

const startDraggingNew = (item, type, e) => {
    dragType.value = 'new'; previewItem.value = { ...item, type, scale: 1, flipX: false, id: `item-${Date.now()}` }; 
    mousePos.value = { x: e.clientX, y: e.clientY };
}

const onMouseDown = (item, e) => {
    e.stopPropagation(); selectedItemId.value = item.id; dragType.value = 'move'; draggedItem.value = item;
}

const startResizing = (item, e) => {
    dragType.value = 'resize'; draggedItem.value = item; resizeStart.value = { y: e.clientY, scale: item.scale || 1 };
}

const onMouseMove = (e) => {
    screenMousePos.value = { x: e.clientX, y: e.clientY };
    const rect = pitchContainer.value.getBoundingClientRect();
    if (dragType.value === 'resize' && draggedItem.value) {
        draggedItem.value.scale = Math.max(0.3, Math.min(4, resizeStart.value.scale + (e.clientY - resizeStart.value.y) * 0.01));
    } else if (dragType.value === 'move' && draggedItem.value) {
        draggedItem.value.x = ((e.clientX - rect.left) / rect.width) * 100;
        draggedItem.value.y = ((e.clientY - rect.top) / rect.height) * 100;
    } else if (dragType.value === 'new') {
        mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    if (isDrawing.value) { ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke(); }
    isMouseInPitch.value = true;
}

const onMouseUp = (e) => {
    if (dragType.value === 'new' && previewItem.value) {
        const rect = pitchContainer.value.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            // Futbol modunda 11 oyuncu sınırı kontrolü
            if (previewItem.value.type === 'player' && boardType.value === 'football') {
                const currentPlayerCount = activeOnPitch.value.filter(p => p.type === 'player').length;
                if (currentPlayerCount >= 11) {
                    showPitchWarning.value = true;
                    setTimeout(() => { showPitchWarning.value = false; }, 3000);
                    dragType.value = null; draggedItem.value = null; previewItem.value = null;
                    return;
                }
            }
            activeOnPitch.value.push({ ...previewItem.value, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
        }
    }
    dragType.value = null; draggedItem.value = null; previewItem.value = null; isDrawing.value = false;
}

const onMouseLeave = () => { isMouseInPitch.value = false; isDrawing.value = false; }
const removeFromPitch = (id) => { activeOnPitch.value = activeOnPitch.value.filter(p => p.id !== id); selectedItemId.value = null; }
const clearPitch = () => { activeOnPitch.value = []; currentFormation.value = ''; clearCanvas(); }
const clearCanvas = () => { if (ctx) ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height); }
const applyFormation = (form) => {
    if (!players.value.length) return;
    currentFormation.value = form.name;
    
    // Sadece İlk 11 sahaya dizilir
    activeOnPitch.value = players.value.slice(0, 11).map((p, idx) => ({ 
        ...p, 
        x: form.layout[idx]?.x || 50, 
        y: form.layout[idx]?.y || 50, 
        type: 'player', 
        scale: 1, 
        flipX: false 
    }));
}
const getPositionLabel = (p) => p.sportProfiles?.[0]?.extraData?.position || '-'
const isOnPitch = (id) => activeOnPitch.value.some(p => p.id === id)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #312e81; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
