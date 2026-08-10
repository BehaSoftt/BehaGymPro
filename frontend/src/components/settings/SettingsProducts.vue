<template>
  <div class="h-full overflow-y-auto custom-scrollbar pr-1 animate-in max-w-[1600px] mx-auto w-full">
    <div class="flex flex-col gap-1 min-h-full">
    <!-- Horizontal Tab Navigation -->
    <div class="flex bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
      <button 
        @click="productSubTab = 'products_list'"
        :class="productSubTab === 'products_list' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-2 py-1.5 text-[0.6rem] font-black tracking-widest uppercase transition-all flex items-center gap-2 border-r border-slate-800/50"
      >
        <Package class="w-4 h-4" /> Ürün Listesi
      </button>
      <button 
        @click="productSubTab = 'groups'"
        :class="productSubTab === 'groups' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-2 py-1.5 text-[0.6rem] font-black tracking-widest uppercase transition-all flex items-center gap-2 border-r border-slate-800/50"
      >
        <LayoutGrid class="w-4 h-4" /> Gruplar
      </button>
      <button 
        @click="productSubTab = 'units'"
        :class="productSubTab === 'units' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-2 py-1.5 text-[0.6rem] font-black tracking-widest uppercase transition-all flex items-center gap-2 border-r border-slate-800/50"
      >
        <Scale class="w-4 h-4" /> Birimler
      </button>
      <button 
        @click="productSubTab = 'stock_management'"
        :class="productSubTab === 'stock_management' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-4 py-3 text-[0.6rem] font-black tracking-widest uppercase transition-all flex items-center gap-2 border-r border-slate-800/50"
      >
        <Zap class="w-4 h-4" /> Stok Yönetimi
      </button>
      <button 
        @click="productSubTab = 'recipe_management'"
        :class="productSubTab === 'recipe_management' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-2 py-1.5 text-[0.6rem] font-black tracking-widest uppercase transition-all flex items-center gap-2"
      >
        <ClipboardList class="w-4 h-4" /> Karma Reçete
      </button>
    </div>

    <!-- Selection Bar moved into form area for products_list -->

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
      <BaseSearchFilter 
        v-model:searchQuery="productSearchQuery"
        v-model:viewMode="productViewModeLocal"
        v-model:isFilterOpen="isFilterOpen"
        :placeholder="productSearchPlaceholder"
        :accent="productSubTab === 'stock_management' ? 'amber' : (productSubTab === 'groups' ? 'purple' : (productSubTab === 'units' ? 'rose' : 'indigo'))"
        class="!overflow-visible relative z-[101]"
      >
        <template #extra-left>
          <div v-if="['products_list', 'stock_management'].includes(productSubTab)" class="h-full relative flex items-center group z-50">
            <button 
              type="button"
              @click.stop="isTypeDropdownOpen = !isTypeDropdownOpen"
              class="h-full px-4 flex items-center gap-2 bg-slate-900/40 hover:bg-slate-800 transition-all text-[0.65rem] font-black text-indigo-400 uppercase cursor-pointer"
            >
              <span>{{ productTypeFilterLabels[productTypeFilter] || 'ÜRÜN TİPİ' }}</span>
              <ChevronDown class="w-3 h-3 text-indigo-500/50 transition-transform duration-300" :class="{ 'rotate-180': isTypeDropdownOpen }" />
            </button>
            <Transition name="fade-slide">
              <div v-if="isTypeDropdownOpen" class="absolute top-[calc(100%+12px)] left-0 w-64 bg-[#0a0f1d] border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.4),0_30px_90px_rgba(0,0,0,0.9)] rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                 <button 
                  v-for="filter in [
                    { id: 'ALL', label: 'TÜM ÜRÜNLER' },
                    { id: 'STANDART', label: 'STANDART (AL-SAT)' },
                    { id: 'HAMMADDE', label: 'HAMMADDE (DÖKME)' },
                    { id: 'KARMA', label: 'KARMA (REÇETELİ)' }
                  ]"
                  :key="filter.id"
                  @click="productTypeFilter = filter.id; isTypeDropdownOpen = false"
                  :class="productTypeFilter === filter.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'"
                  class="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-widest border rounded-xl transition-all text-left mb-1 group"
                 >
                   <div class="flex items-center gap-3">
                      <div class="w-1.5 h-1.5 rounded-full" :class="productTypeFilter === filter.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'"></div>
                      <span>{{ filter.label }}</span>
                   </div>
                   <span v-if="productTypeFilter === filter.id" class="text-[0.6rem] opacity-50">SEÇİLİ</span>
                 </button>
              </div>
            </Transition>
          </div>
        </template>

        <template #extra-actions>
          <!-- Extra actions can be added here if needed -->
        </template>
      </BaseSearchFilter>

      <!-- FORM ALANI (LİSTE ÜSTÜ) -->
      <Transition name="fade-slide">
        <div v-if="isFormVisible && !['stock_management', 'recipe_management'].includes(productSubTab)" class="p-6 border-b border-slate-800 bg-slate-950/20 animate-in">
           <div class="flex flex-col lg:flex-row gap-6">
              <div class="flex-1 space-y-4">
                <!-- Selection Bar (Only for Super Master) -->
                <BaseGlobalSelector 
                  v-if="isSuperMaster"
                  storageKey="product_management_settings" 
                  @change="onGlobalSelectionChange"
                  class="!mb-0 !p-0 !bg-transparent !border-0 !shadow-none"
                />
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <BaseInput v-model="productForm.groupId" type="select" label="Grup">
                    <option value="">Grup Seçin</option>
                    <option v-for="g in productGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                  </BaseInput>
                  <BaseInput v-model="productForm.unitId" type="select" label="Birim">
                    <option value="">Birim Seçin</option>
                    <option v-for="u in productUnits" :key="u.id" :value="u.id">{{ u.name }}</option>
                  </BaseInput>
                  <BaseInput v-model="productForm.type" type="select" label="Ürün Tipi">
                    <option value="STANDART">STANDART (AL-SAT)</option>
                    <option value="HAMMADDE">HAMMADDE (DÖKME)</option>
                    <option value="KARMA">KARMA (REÇETELİ)</option>
                  </BaseInput>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BaseInput v-model="productForm.name" type="text" label="Ürün Adı" placeholder="Ürün İsmi..." />
                  <div class="grid grid-cols-2 gap-4">
                    <BaseInput v-model.number="productForm.price" type="number" step="0.01" label="Fiyat (₺)" />
                    <BaseInput v-if="!editingProductId" v-model.number="productForm.stock" type="number" label="Stok" />
                  </div>
                </div>
              </div>

              <!-- Image Section -->
              <div class="w-full lg:w-44 flex flex-col items-center gap-2">
                <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest text-center">GÖRSEL</span>
                <div class="w-full aspect-square bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <BaseImageUpload 
                    v-model="productForm.imageUrl" 
                    width="100%" 
                    height="100%" 
                    @change="productImage = $event"
                  />
                </div>
              </div>
           </div>
        </div>
      </Transition>

      <!-- LİSTELEME ALANI -->
    <div class="flex-1 relative p-1 min-h-[500px]">
        <!-- BİRİMLER LİSTESİ -->
        <div v-if="productSubTab === 'units'" class="h-full flex flex-col animate-in">

          <div class="flex-1 relative">
            <!-- Table View -->
            <div v-if="productViewModeLocal === 'list'" class="h-full relative" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
              <BaseTable :columns="unitColumns" :items="productUnits" :selectedId="editingProductUnitId" @rowClick="toggleUnitRow" emptyText="Henüz birim tanımlanmamış.">
                <template #cell-name="{ item }">
                  <div class="h-10 flex items-center">
                    <span class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{{ item.name }}</span>
                  </div>
                </template>
                <template #cell-shortName="{ item }">
                  <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.6rem] font-black text-indigo-400 font-mono">{{ item.shortName || '-' }}</span>
                </template>
              </BaseTable>
            </div>

            <!-- Grid View -->
            <div v-else class="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">
              <BaseCard v-for="u in productUnits" :key="u.id" 
                @click="toggleUnitRow(u)"
                :selected="editingProductUnitId === u.id"
                class="flex flex-col gap-3 p-3 group/card cursor-pointer hover:border-rose-500/50 transition-all border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden"
              >
                <div class="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 blur-2xl -mr-10 -mt-10 group-hover/card:bg-rose-500/10 transition-all"></div>
                <div class="flex flex-col gap-1 relative z-10">
                  <div class="flex items-center justify-between">
                    <Scale class="w-4 h-4 text-rose-500/50 group-hover/card:text-rose-400" />
                    <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.55rem] font-black text-rose-400 font-mono">{{ u.shortName || '-' }}</span>
                  </div>
                  <h4 class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight mt-1 truncate">{{ u.name }}</h4>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>


        <!-- GRUPLAR LİSTESİ -->
        <div v-if="productSubTab === 'groups'" class="h-full flex flex-col animate-in">

          <div class="flex-1 relative">
            <!-- Table View -->
            <div v-if="productViewModeLocal === 'list'" class="h-full relative" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
              <BaseTable :columns="groupColumns" :items="productGroups" :selectedId="editingProductGroupId" @rowClick="toggleGroupRow" emptyText="Henüz grup tanımlanmamış.">
                <template #cell-name="{ item }">
                  <div class="h-10 flex items-center">
                    <span class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{{ item.name }}</span>
                  </div>
                </template>
                <template #cell-productCount="{ item }">
                  <div class="flex items-center gap-2">
                    <span class="text-[0.7rem] font-black text-slate-400">{{ item.productCount || 0 }}</span>
                    <span class="text-[0.55rem] text-slate-600 font-bold uppercase tracking-widest italic">ADET</span>
                  </div>
                </template>
              </BaseTable>
            </div>

            <!-- Grid View -->
            <div v-else class="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">
              <BaseCard v-for="g in productGroups" :key="g.id" 
                @click="toggleGroupRow(g)"
                :selected="editingProductGroupId === g.id"
                class="flex flex-col gap-3 p-3 group/card cursor-pointer hover:border-purple-500/50 transition-all border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden"
              >
                <div class="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 blur-2xl -mr-10 -mt-10 group-hover/card:bg-purple-500/10 transition-all"></div>
                <div class="flex flex-col gap-1 relative z-10">
                  <div class="flex items-center justify-between">
                    <LayoutGrid class="w-4 h-4 text-purple-500/50 group-hover/card:text-purple-400" />
                    <span class="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">{{ g.productCount || 0 }} ÜRÜN</span>
                  </div>
                  <h4 class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight mt-1 truncate">{{ g.name }}</h4>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>


        <!-- ÜRÜNLER LİSTESİ -->
        <div v-if="productSubTab === 'products_list'" class="h-full flex flex-col animate-in">
          
          <div class="flex-1 relative">
            <!-- Table View -->
            <div v-if="productViewModeLocal === 'list'" class="relative" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
              <BaseTable :columns="productColumns" :items="filteredProducts" :selectedId="editingProductId" @rowClick="toggleProductRow" emptyText="Henüz ürün tanımlanmamış.">
                <template #cell-product="{ item }">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-950 border border-white/5 flex items-center justify-center relative shadow-black transition-all group-hover:border-indigo-500/30 overflow-hidden rounded-lg">
                      <img v-if="item.imageUrl" :src="formatImgUrl(item.imageUrl)" class="w-full h-full object-cover" />
                      <Package v-else class="w-5 h-5 text-slate-800" />
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[0.75rem] font-black text-slate-100 uppercase group-hover:text-indigo-400 transition-colors leading-tight">{{ item.name }}</span>
                    </div>
                  </div>
                </template>
                <template #cell-group="{ item }">
                  <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.65rem] font-black text-slate-500 uppercase tracking-widest text-center">{{ item.group?.name || 'GENEL' }}</span>
                </template>
                <template #cell-type="{ item }">
                  <span :class="{
                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20': item.type === 'STANDART',
                    'text-amber-400 bg-amber-500/10 border-amber-500/20': item.type === 'HAMMADDE',
                    'text-indigo-400 bg-indigo-500/10 border-indigo-500/20': item.type === 'KARMA'
                  }" class="px-2 py-1 border text-[0.55rem] font-black uppercase tracking-widest rounded flex flex-col items-center leading-none">
                    {{ item.type || 'STANDART' }}
                    <span v-if="item.type === 'KARMA'" class="text-[0.45rem] mt-0.5 opacity-70 italic font-bold">REÇETELİ</span>
                    <span v-if="item.type === 'HAMMADDE'" class="text-[0.45rem] mt-0.5 opacity-70 italic font-bold">DÖKME</span>
                  </span>
                </template>
                <template #cell-unit="{ item }">
                  <span class="text-[0.7rem] font-bold text-slate-500 uppercase">{{ item.productUnit?.name || item.unit }}</span>
                </template>
                <template #cell-stock="{ item }">
                  <span :class="item.stock < 10 ? 'text-rose-500' : 'text-indigo-400'" class="text-[0.8rem] font-black">{{ item.stock }}</span>
                </template>
                <template #cell-price="{ item }">
                  <div class="text-[0.8rem] font-black text-emerald-500 whitespace-nowrap">{{ item.price }} ₺</div>
                </template>
              </BaseTable>
            </div>

            <!-- Grid View -->
            <div v-else class="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 min-h-[400px]">
              <BaseCard v-for="p in filteredProducts" :key="p.id" class="flex flex-col h-full !p-0 overflow-hidden group">
                <template #default>
                  <div class="h-28 bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-800/50">
                    <img v-if="p.imageUrl" :src="formatImgUrl(p.imageUrl)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <Package v-else class="w-8 h-8 text-slate-800 opacity-20" />
                    <div class="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <BaseButton @click="editProduct(p)" variant="dark" class="!p-1.5 !bg-slate-950/80 hover:!bg-indigo-600 !border-slate-800"><Edit class="w-3.5 h-3.5 text-indigo-400 group-hover/btn:text-white"/></BaseButton>
                      <BaseButton @click="deleteProduct(p.id)" variant="danger" class="!p-1.5 !bg-slate-950/80 hover:!bg-rose-600 !border-slate-800"><Trash2 class="w-3.5 h-3.5 text-rose-500 group-hover/btn:text-white"/></BaseButton>
                    </div>
                    <div class="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[0.45rem] font-bold text-emerald-400 tracking-widest rounded shadow-xl">
                      {{ p.price }} ₺
                    </div>
                  </div>
                  <div class="p-2 flex flex-col gap-1 flex-grow bg-slate-900/40">
                    <div class="flex flex-col">
                      <span class="text-[0.6rem] font-black text-slate-100 uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate leading-tight">{{ p.name }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-1 border-t border-slate-800/30 mt-auto">
                      <span class="text-[0.45rem] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[50%]">{{ p.group?.name || 'GENEL' }}</span>
                      <span :class="p.stock < 10 ? 'text-rose-500' : 'text-slate-400'" class="text-[0.55rem] font-black">ST: {{ p.stock }}</span>
                    </div>
                  </div>
                </template>
              </BaseCard>
            </div>
          </div>
          <div class="px-8 py-2 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end">
            <span class="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">TOPLAM: {{ filteredProducts.length }} ÜRÜN</span>
          </div>
        </div>

        <!-- STOK YÖNETİMİ LİSTESİ -->
        <div v-if="productSubTab === 'stock_management'" class="animate-in h-full flex flex-col">

          <div class="flex-1 relative">
            <!-- Table View -->
            <div v-if="productViewModeLocal === 'list'" class="h-full relative" style="--ui-table-row-py: 12px; --ui-table-cell-fs: 11px; --ui-table-header-py: 14px; --ui-table-header-fs: 11px;">
              <BaseTable :columns="stockColumns" :items="filteredProducts" :selectedId="selectedStockProductId" @rowClick="toggleStockRow" emptyText="Stok güncellenecek ürün bulunamadı.">
                <template #cell-product="{ item }">
                  <div class="h-10 flex flex-col justify-center gap-0.5">
                    <span class="text-[0.7rem] font-black text-slate-100 uppercase leading-none">{{ item.name }}</span>
                  </div>
                </template>
                <template #cell-group="{ item }">
                  <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{{ item.group?.name || 'GENEL' }}</span>
                </template>
                <template #cell-type="{ item }">
                  <span :class="{
                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20': item.type === 'STANDART',
                    'text-amber-400 bg-amber-500/10 border-amber-500/20': item.type === 'HAMMADDE',
                    'text-indigo-400 bg-indigo-500/10 border-indigo-500/20': item.type === 'KARMA'
                  }" class="px-2 py-0.5 border text-[0.55rem] font-black uppercase tracking-widest rounded leading-none flex items-center h-6">
                    {{ item.type || 'STANDART' }}
                  </span>
                </template>
                <template #cell-unit="{ item }">
                  <span class="text-[0.65rem] font-bold text-slate-500 uppercase">{{ item.productUnit?.name || item.unit }}</span>
                </template>
                <template #cell-stockStatus="{ item }">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="item.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                    <span class="text-[0.8rem] font-black text-white">{{ item.stock }}</span>
                  </div>
                </template>
                <template #cell-adjust="{ item }">
                  <div class="flex items-center bg-black/40 border border-slate-800 p-1 rounded-lg max-w-[120px]">
                    <input 
                      type="number" 
                      v-model="item.tempStockAdjust" 
                      placeholder="0" 
                      @click.stop
                      class="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 text-[0.8rem] rounded-md font-black text-center text-white outline-none focus:border-indigo-500 shadow-inner" 
                    />
                  </div>
                </template>
              </BaseTable>
            </div>

            <!-- Grid View -->
            <div v-else class="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">
              <BaseCard v-for="p in filteredProducts" :key="p.id" 
                @click="toggleStockRow(p)"
                :selected="selectedStockProductId === p.id"
                class="flex flex-col h-full !p-0 overflow-hidden group/card cursor-pointer border-slate-800 bg-slate-900 shadow-xl relative"
              >
                <!-- Image/Header with Stock Status -->
                <div class="h-24 bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-slate-800/50">
                   <img v-if="p.imageUrl" :src="formatImgUrl(p.imageUrl)" class="w-full h-full object-cover opacity-40 group-hover/card:scale-110 transition-transform duration-500" />
                   <Package v-else class="w-6 h-6 text-slate-800" />
                   
                   <div class="absolute top-2 right-2 flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded">
                      <div class="w-1.5 h-1.5 rounded-full" :class="p.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                      <span class="text-[0.6rem] font-black text-white">{{ p.stock }}</span>
                      <span class="text-[0.45rem] font-bold text-slate-500 uppercase ml-0.5">{{ p.productUnit?.shortName || p.unit }}</span>
                   </div>
                </div>

                <!-- Card Body -->
                 <div class="p-2.5 flex flex-col gap-2 bg-slate-900/40 flex-grow">
                    <div class="flex items-center justify-between gap-2">
                       <h4 class="text-[0.6rem] font-black text-slate-100 uppercase tracking-tight truncate">{{ p.name }}</h4>
                       <span :class="{
                          'text-emerald-500': p.type === 'STANDART',
                          'text-amber-500': p.type === 'HAMMADDE',
                          'text-indigo-500': p.type === 'KARMA'
                       }" class="text-[0.5rem] font-black uppercase tracking-tighter shrink-0 italic">
                          {{ p.type || 'STD' }}
                       </span>
                    </div>
                    
                    <!-- Adjustment Controls on Card -->
                    <div class="flex items-center bg-black/20 p-1 rounded-lg mt-auto border border-slate-800/50">
                       <input 
                        type="number" 
                        v-model="p.tempStockAdjust" 
                        placeholder="0" 
                        @click.stop
                        class="w-full bg-slate-950 border border-slate-700 px-2 py-1 text-[0.7rem] rounded font-black text-center text-white outline-none focus:border-indigo-500" 
                      />
                    </div>
                </div>

                <!-- Selection Pulse -->
                <div v-if="selectedStockProductId === p.id" class="absolute inset-0 border-2 border-emerald-500/50 pointer-events-none rounded-2xl">
                   <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>
                </div>
              </BaseCard>
            </div>
          </div>

          <div class="px-8 py-2 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end">
             <span class="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">TOPLAM: {{ filteredProducts.length }} ÜRÜN STOKU</span>
          </div>
        </div>

        <!-- KARMA REÇETE YÖNETİMİ -->
        <div v-if="productSubTab === 'recipe_management'" class="h-full flex flex-col animate-in">
           <div class="flex-1 flex overflow-hidden">
              <!-- Left Side: Karma Product List (BaseTable) -->
              <div class="w-1/3 xl:w-1/4 border-2 border-rose-500/30 rounded-2xl m-2 flex flex-col bg-rose-500/[0.04] overflow-hidden shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                 <div class="p-4 border-b-2 border-rose-500/30 bg-rose-600/10">
                    <span class="text-[0.65rem] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">
                       <Package class="w-4 h-4" /> KARMA ÜRÜN SEÇİN
                    </span>
                 </div>
                 <div class="flex-1 relative overflow-hidden">
                    <BaseTable 
                      :columns="karmaSelectionColumns" 
                      :items="karmaProducts" 
                      :selectedId="selectedRecipeProductId" 
                      @rowClick="selectRecipeProduct" 
                      emptyText="Karma ürün bulunamadı."
                      hideHeader
                      accent="rose"
                    >
                      <template #cell-name="{ item }">
                        <div class="flex flex-col py-1">
                          <span class="text-[0.7rem] font-black text-slate-100 uppercase truncate leading-tight transition-colors group-hover/row:text-rose-400">{{ item.name }}</span>
                          <span class="text-[0.55rem] font-bold text-slate-500 uppercase">{{ item.group?.name || 'GENEL' }}</span>
                        </div>
                      </template>
                    </BaseTable>
                    <div v-if="karmaProducts.length === 0" class="p-8 text-center text-[0.6rem] text-slate-600 font-bold uppercase italic tracking-widest">
                       HENÜZ KARMA ÜRÜN TANIMLANMAMIŞ
                    </div>
                 </div>
              </div>

              <!-- Right Side: Recipe Editor (BaseTable) -->
              <div class="flex-1 flex flex-col bg-slate-950/[0.04] border-2 border-indigo-500/30 rounded-2xl m-2 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)] relative">
                 <template v-if="selectedRecipeProduct">
                    <!-- Recipe Items Table -->
                    <div class="flex-1 relative overflow-hidden">
                      <BaseTable 
                        :columns="recipeEditorColumns" 
                        :items="recipeFormItems" 
                        :selectedId="selectedRecipeItem?.id"
                        @rowClick="selectedRecipeItem = $event"
                        emptyText="Reçete boş. Bileşen ekleyin."
                        style="--ui-table-row-py: 8px; --ui-table-cell-fs: 11px;"
                      >
                        <template #cell-component="{ item }">
                          <BaseInput v-model="item.componentProductId" type="select" noLabel class="!min-h-0">
                            <option value="">Malzeme Seçin</option>
                            <option v-for="p in availableIngredientsForRecipe" :key="p.id" :value="p.id">
                                {{ p.name }} (Stok: {{ p.stock }} {{ p.productUnit?.shortName || p.unit }})
                            </option>
                          </BaseInput>
                        </template>
                        <template #cell-quantity="{ item }">
                          <BaseInput v-model.number="item.quantity" type="number" step="0.001" noLabel class="!min-h-0 text-center" />
                        </template>
                      </BaseTable>
                    </div>
                 </template>
                 <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-800 opacity-40">
                    <Zap class="w-20 h-20 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse" />
                    <p class="text-sm font-black tracking-[0.3em] uppercase text-center">DÜZENLEMEK İÇİN SOLDAKİ LİSTEDEN<br/>BİR KARMA ÜRÜN SEÇİN</p>
                 </div>
              </div>
           </div>
           <div class="px-8 py-2 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end">
              <span class="text-[0.55rem] font-black text-slate-600 uppercase tracking-widest">TOPLAM: {{ karmaProducts.length }} KARMA ÜRÜN</span>
           </div>
        </div>
      </div>
    </div>

      <!-- PERSISTENT ACTION FOOTER -->
      <BaseActionFooter>
        <div class="flex items-center gap-2">
           <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
              <template #icon><ArrowLeft class="w-5 h-5" /></template>
           </BaseButton>

           <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

           <!-- New Item Button (When not editing) -->
           <BaseButton 
            v-if="!isAnyEditing && productSubTab !== 'stock_management'"
            @click="isFormVisible = !isFormVisible" 
            :variant="isFormVisible ? 'dark' : 'success'"
            size="icon"
            square
            :title="isFormVisible ? 'KAPAT' : 'YENİ EKLE'"
          >
            <template #icon>
              <component :is="isFormVisible ? ChevronUp : ClipboardPlus" class="w-5 h-5" />
            </template>
          </BaseButton>

          <div v-if="isAnyEditing || isFormVisible || selectedStockProductId" class="h-6 w-[1px] bg-slate-800 mx-1"></div>

          <!-- Edit Actions -->
          <template v-if="isAnyEditing || isFormVisible || selectedStockProductId">
            <BaseButton 
              @click="handleGlobalCancel" 
              variant="dark" 
              size="icon"
              square
              title="İPTAL / KAPAT"
            >
              <template #icon><X class="w-5 h-5 text-slate-400" /></template>
            </BaseButton>

            <BaseButton 
              v-if="isAnyEditing"
              @click="handleGlobalDelete" 
              variant="danger" 
              size="icon"
              square
              title="SİL"
            >
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>

            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              v-if="productSubTab === 'recipe_management' && selectedRecipeProductId"
              @click="addRecipeItemToSelected" 
              variant="indigo" 
              size="icon"
              square
              title="YENİ BİLEŞEN EKLE"
            >
              <template #icon><PlusCircle class="w-5 h-5" /></template>
            </BaseButton>

            <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <BaseButton 
              @click="handleGlobalSave" 
              variant="primary" 
              size="icon"
              square
              :title="selectedStockProductId ? 'GÜNCELLE' : (isAnyEditing ? 'GÜNCELLE' : 'KAYDET')"
            >
              <template #icon>
                <component :is="(selectedStockProductId || isAnyEditing) ? CheckCircle : Save" class="w-5 h-5" />
              </template>
            </BaseButton>
          </template>
        </div>
      </BaseActionFooter>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Package, LayoutGrid, Scale, Zap, Info, Edit, Trash2, RotateCcw,
  Plus, Minus, ChevronDown, ChevronUp, Save, CheckCircle, X, ClipboardList,
  PlusCircle, ClipboardPlus, Layers, ArrowLeft
} from 'lucide-vue-next'
import BaseImageUpload from '../base/BaseImageUpload.vue'
import BaseSearchFilter from '../base/BaseSearchFilter.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseTable from '../base/BaseTable.vue'
import BaseCard from '../base/BaseCard.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'

// Services & Composables
import { productService } from '../../services/admin/productService'
import { uploadService } from '../../services/admin/uploadService'
import { useAlerts } from '../../utils/alerts'
import { useDataStore } from '../../store/data'
import { useAuthStore } from '../../store/auth'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const authStore = useAuthStore()
const router = useRouter()
const { companies, branches } = storeToRefs(dataStore)
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()

const isSuperMaster = computed(() => authStore.user?.role === 'SUPER_MASTER')

const props = defineProps({
  viewMode: { type: String, default: 'list' }
})

const loading = ref(false)
const productSubTab = ref('products_list')
const productUnits = ref([])
const productGroups = ref([])
const allProducts = ref([])
const productUnitForm = ref({ name: '', shortName: '' })
const productGroupForm = ref({ name: '' })
const productForm = ref({ 
  name: '', 
  groupId: '', 
  unitId: '', 
  price: 0, 
  stock: 0,
  type: 'STANDART',
  imageUrl: '',
  recipe: []
})
const productImage = ref(null)
const editingProductUnitId = ref(null)
const editingProductGroupId = ref(null)
const editingProductId = ref(null)
const selectedStockProductId = ref(null)
const selectedRecipeProductId = ref(null)
const recipeFormItems = ref([])
const selectedRecipeItem = ref(null)
const productSearchQuery = ref('')
const productTypeFilter = ref('ALL')
const productViewModeLocal = ref(props.viewMode)
const isFormVisible = ref(typeof window !== 'undefined' ? window.innerWidth > 1400 : true)
const isTypeDropdownOpen = ref(false)
const isFilterOpen = ref(false)


const productTypeFilterLabels = {
  ALL: 'TÜM ÜRÜNLER',
  STANDART: 'STANDART (AL-SAT)',
  HAMMADDE: 'HAMMADDE (DÖKME)',
  KARMA: 'KARMA (REÇETELİ)'
}


const formatImgUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  
  // Eğer url zaten /uploads ile başlıyorsa, mükerrer ekleme yapma
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    return `http://${hostname}:5000${cleanUrl}`
  }
  
  const path = url.startsWith('/') ? url : `/${url}`
  return `http://${hostname}:5000/uploads${path}`
}

// Global Selection State
const globalSelection = ref({ companyId: '', branchId: '', remember: false })
const globalCompanyId = computed(() => globalSelection.value.companyId)
const globalBranchId = computed(() => globalSelection.value.branchId)

const onGlobalSelectionChange = (data) => {
  globalSelection.value = data
  fetchProducts()
  fetchProductGroups()
  fetchProductUnits()
}

onMounted(() => {
  // If not super master, auto-set company and branch from user profile
  if (!isSuperMaster.value && authStore.user) {
    globalSelection.value = {
      companyId: authStore.user.companyId || authStore.user.CompanyId || '',
      branchId: authStore.user.branchId || authStore.user.BranchId || '',
      remember: true
    }
    
    // Trigger initial fetches for non-super users
    fetchProducts()
    fetchProductGroups()
    fetchProductUnits()
  }
})

const unitColumns = [
  { key: 'name', label: 'BİRİM ADI' },
  { key: 'shortName', label: 'KISA KOD' }
]

const groupColumns = [
  { key: 'name', label: 'GRUP ADI', width: '70%' },
  { key: 'productCount', label: 'ÜRÜN SAYISI', width: '30%' }
]

const productColumns = [
  { key: 'product', label: 'GÖRSEL / İSİM', width: '30%' },
  { key: 'group', label: 'GRUP', width: '20%' },
  { key: 'type', label: 'TİP', width: '15%' },
  { key: 'unit', label: 'BİRİM', width: '10%' },
  { key: 'stock', label: 'STOK', width: '10%' },
  { key: 'price', label: 'FİYAT', width: '15%' }
]

const stockColumns = [
  { key: 'product', label: 'ÜRÜN ADI', width: '25%' },
  { key: 'group', label: 'GRUP', width: '15%' },
  { key: 'type', label: 'TİP', width: '12%' },
  { key: 'unit', label: 'BİRİM', width: '10%' },
  { key: 'stockStatus', label: 'STOK DURUMU', width: '15%' },
  { key: 'adjust', label: 'MİKTAR AYARI', width: '23%' }
]

const karmaSelectionColumns = [
  { key: 'name', label: 'KARMA ÜRÜN ADI', width: '100%' }
]

const recipeEditorColumns = [
  { key: 'component', label: 'BİLEŞEN (MALZEME)', width: '70%' },
  { key: 'quantity', label: 'MİKTAR', width: '30%' }
]

const productSearchPlaceholder = computed(() => {
  const placeholders = {
    products_list: 'ÜRÜN LİSTESİNDE ARA...',
    groups: 'GRUPLARDA ARA...',
    units: 'BİRİMLERDE ARA...',
    stock_management: 'STOK LİSTESİNDE ARA...',
    recipe_management: 'KARMA ÜRÜNLERDE ARA...'
  }
  return placeholders[productSubTab.value] || 'ARA...'
})

const fetchProductUnits = async () => {
  try {
    const params = {}
    if (globalCompanyId.value) params.companyId = globalCompanyId.value
    if (globalBranchId.value) params.branchId = globalBranchId.value
    productUnits.value = await productService.getUnits(params)
  } catch (err) {
    console.error('Birimler yüklenemedi:', err)
  }
}

const fetchProductGroups = async () => {
  try {
    const params = {}
    if (globalCompanyId.value) params.companyId = globalCompanyId.value
    if (globalBranchId.value) params.branchId = globalBranchId.value
    productGroups.value = await productService.getGroups(params)
  } catch (err) {
    console.error('Gruplar yüklenemedi:', err)
  }
}

const fetchProducts = async () => {
  try {
    const params = {}
    if (globalCompanyId.value) params.companyId = globalCompanyId.value
    if (globalBranchId.value) params.branchId = globalBranchId.value
    const res = await productService.getAll(params)
    const data = res?.products || res?.data || (Array.isArray(res) ? res : [])
    allProducts.value = Array.isArray(data) ? data.map(p => ({
       ...p,
       tempStockAdjust: 0
    })) : []
  } catch (err) {
    console.error('Ürünler yüklenemedi:', err)
  }
}

const saveProductUnit = async () => {
  if (!productUnitForm.value.name) return
  loading.value = true
  try {
    const payload = { 
      ...productUnitForm.value,
      companyId: globalCompanyId.value || null,
      branchId: globalBranchId.value || null
    }
    if (editingProductUnitId.value) {
      await productService.updateUnit(editingProductUnitId.value, payload)
    } else {
      await productService.createUnit(payload)
    }
    await fetchProductUnits()
    productUnitForm.value = { name: '', shortName: '' }
    editingProductUnitId.value = null
    showAlertSuccess('BAŞARILI', 'Birim kaydedildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Birim kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteProductUnit = async (id) => {
  const isConfirmed = await showAlertConfirm('BİRİM SİLİNSİN Mİ?', 'Bu birimi kullanan ürün varsa silinemez.')
  if (!isConfirmed) return
  try {
    await productService.deleteUnit(id)
    await fetchProductUnits()
    showAlertSuccess('SİLİNDİ', 'Birim silindi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Birim silinemedi.')
  }
}

const editProductUnit = (unit) => {
  isFormVisible.value = true
  editingProductUnitId.value = unit.id
  productUnitForm.value = { name: unit.name, shortName: unit.shortName }
}

const saveProductGroup = async () => {
  if (!productGroupForm.value.name) return
  loading.value = true
  try {
    const payload = { 
      ...productGroupForm.value,
      companyId: globalCompanyId.value || null,
      branchId: globalBranchId.value || null
    }
    if (editingProductGroupId.value) {
      await productService.updateGroup(editingProductGroupId.value, payload)
    } else {
      await productService.createGroup(payload)
    }
    await fetchProductGroups()
    productGroupForm.value = { name: '' }
    editingProductGroupId.value = null
    showAlertSuccess('BAŞARILI', 'Grup kaydedildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Grup kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const deleteProductGroup = async (id) => {
  const isConfirmed = await showAlertConfirm('GRUP SİLİNSİN Mİ?', 'Grupta ürün varsa silinemez.')
  if (!isConfirmed) return
  try {
    await productService.deleteGroup(id)
    await fetchProductGroups()
    showAlertSuccess('SİLİNDİ', 'Grup silindi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Grup silinemedi.')
  }
}

const editProductGroup = (group) => {
  isFormVisible.value = true
  editingProductGroupId.value = group.id
  productGroupForm.value = { name: group.name }
}

const toggleUnitRow = (item) => {
  if (editingProductUnitId.value === item.id) {
    editingProductUnitId.value = null
    productUnitForm.value = { name: '', shortName: '' }
  } else {
    editProductUnit(item)
  }
}

const toggleGroupRow = (item) => {
  if (editingProductGroupId.value === item.id) {
    editingProductGroupId.value = null
    productGroupForm.value = { name: '' }
  } else {
    editProductGroup(item)
  }
}

const toggleProductRow = (item) => {
  if (editingProductId.value === item.id) {
    cancelProductEdit()
  } else {
    editProduct(item)
  }
}

const toggleStockRow = (item) => {
  if (selectedStockProductId.value === item.id) {
    selectedStockProductId.value = null
  } else {
    selectedStockProductId.value = item.id
  }
}

const saveProduct = async () => {
  if (!productForm.value.name) return
  loading.value = true
  try {
    let imageUrl = productForm.value.imageUrl
    if (productImage.value) {
       imageUrl = await uploadService.uploadFile(productImage.value, 'products')
    }

    const payload = { 
      ...productForm.value,
      imageUrl,
      companyId: globalCompanyId.value || null,
      branchId: globalBranchId.value || null
    }
    
    if (editingProductId.value) {
      await productService.update(editingProductId.value, payload)
    } else {
      await productService.create(payload)
    }
    
    await fetchProducts()
    cancelProductEdit()
    showAlertSuccess('BAŞARILI', 'Ürün ve görsel kaydedildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Ürün kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const cancelProductEdit = () => {
   editingProductId.value = null
   productForm.value = { name: '', groupId: '', unitId: '', price: 0, stock: 0, type: 'STANDART', imageUrl: '', recipe: [] }
   productImage.value = null
}

const addRecipeItem = () => {
  if (!productForm.value.recipe) productForm.value.recipe = []
  productForm.value.recipe.push({ componentProductId: '', quantity: 1 })
}

const removeRecipeItem = (index) => {
  productForm.value.recipe.splice(index, 1)
}

const availableIngredients = computed(() => {
  // Sadece HAMMADDE (Dökme) tipindeki ürünler reçeteye eklenebilir
  return allProducts.value.filter(p => p.type === 'HAMMADDE' && p.id !== editingProductId.value)
})

const quickStockUpdate = (productId, delta) => {
   const product = allProducts.value.find(p => p.id === productId)
   if (product) {
      product.tempStockAdjust = (product.tempStockAdjust || 0) + delta
   }
}

const applyStockUpdate = async (product) => {
   if (!product.tempStockAdjust || product.tempStockAdjust === 0) return
   await bulkStockUpdate([product])
}


const deleteProduct = async (id) => {
  const isConfirmed = await showAlertConfirm('ÜRÜNÜ SİLİNSİN Mİ?', 'Ürün pasifleştirilecek.')
  if (!isConfirmed) return
  try {
    await productService.delete(id)
    await fetchProducts()
    showAlertSuccess('SİLİNDİ', 'Ürün pasifleştirildi.')
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Ürün silinemedi.')
  }
}

const editProduct = (product) => {
  isFormVisible.value = true
  editingProductId.value = product.id
  productForm.value = { 
    name: product.name, 
    groupId: product.group?.id || product.groupId || '', 
    unitId: product.productUnit?.id || product.unitId || product.unit || '', 
    price: product.price, 
    stock: product.stock,
    type: product.type || 'STANDART',
    imageUrl: product.imageUrl || '',
    recipe: product.recipe ? product.recipe.map(r => ({ 
      componentProductId: r.componentProductId, 
      quantity: r.quantity 
    })) : []
  }
}

const karmaProducts = computed(() => {
   return allProducts.value.filter(p => p.type === 'KARMA')
})

const selectedRecipeProduct = computed(() => {
   if (!selectedRecipeProductId.value) return null
   return allProducts.value.find(p => p.id === selectedRecipeProductId.value)
})

const availableIngredientsForRecipe = computed(() => {
   // Karma ürünlerin reçetesine dökme hammadde veya standart ürünler girebilir
   return allProducts.value.filter(p => p.type !== 'KARMA' && p.id !== selectedRecipeProductId.value)
})

const selectRecipeProduct = (product) => {
   selectedRecipeProductId.value = product.id
   selectedRecipeItem.value = null
   recipeFormItems.value = product.recipe ? product.recipe.map(r => ({
      id: r.id || `rec-${r.componentProductId}-${Math.random()}`,
      componentProductId: r.componentProductId,
      quantity: r.quantity
   })) : []
}

const addRecipeItemToSelected = () => {
   recipeFormItems.value.push({ id: `new-${Date.now()}`, componentProductId: '', quantity: 1 })
}

const removeRecipeItemFromSelected = (item) => {
   const index = recipeFormItems.value.indexOf(item)
   if (index !== -1) recipeFormItems.value.splice(index, 1)
}

const bulkStockUpdate = async (products) => {
  if (!products || products.length === 0) return
  
  loading.value = true
  try {
    const stockUpdates = products.map(p => {
       const val = parseInt(p.tempStockAdjust)
       return {
          productId: p.id,
          quantity: Math.abs(val),
          operation: val > 0 ? 'ADD' : 'SUBTRACT'
       }
    })

    await productService.adjustStockBulk({ stockUpdates })
    
    await fetchProducts()
    
    selectedStockProductId.value = null
    
    toast('STOK GÜNCELLENDİ', `${products.length} ürünün stoku güncellendi.`, 'success')
  } catch (err) {
    console.error('Stok güncelleme hatası:', err)
    showAlertError('HATA', err.response?.data?.message || 'Stok güncellenemedi.')
  } finally {
    loading.value = false
  }
}

const saveRecipe = async () => {
  if (!selectedRecipeProductId.value) return
  
  loading.value = true
  try {
    await productService.update(selectedRecipeProductId.value, {
       recipe: recipeFormItems.value.filter(item => item.componentProductId && item.quantity > 0)
    })
    
    await fetchProducts()
    
    toast('REÇETE KAYDEDİLDİ', 'Ürün reçetesi başarıyla güncellendi.', 'success')
  } catch (err) {
    showAlertError('HATA', 'Reçete kaydedilemedi.')
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
   let products = allProducts.value || []
   
   // Apply Type Filter
   if (productTypeFilter.value !== 'ALL') {
     products = products.filter(p => p.type === productTypeFilter.value)
   }

   // Apply Search Query
   if (!productSearchQuery.value) return products
   const q = productSearchQuery.value.toLowerCase()
   return products.filter(p => p.name && p.name.toLowerCase().includes(q))
})

// Global Action Footer Logic
const hasStockAdjustments = computed(() => {
   return allProducts.value.some(p => p.tempStockAdjust && parseInt(p.tempStockAdjust) !== 0)
})

const isAnyEditing = computed(() => {
  if (productSubTab.value === 'units') return !!editingProductUnitId.value
  if (productSubTab.value === 'groups') return !!editingProductGroupId.value
  if (productSubTab.value === 'products_list') return !!editingProductId.value
  if (productSubTab.value === 'stock_management') return !!selectedStockProductId.value || hasStockAdjustments.value
  if (productSubTab.value === 'recipe_management') return !!selectedRecipeProductId.value
  return false
})

const handleGlobalSave = async () => {
  if (productSubTab.value === 'recipe_management') await saveRecipe()
  else if (productSubTab.value === 'units') await saveProductUnit()
  else if (productSubTab.value === 'groups') await saveProductGroup()
  else if (productSubTab.value === 'products_list') await saveProduct()
  else if (productSubTab.value === 'stock_management') {
    const adjustedProducts = allProducts.value.filter(p => p.tempStockAdjust && parseInt(p.tempStockAdjust) !== 0)
    if (adjustedProducts.length > 0) {
      await bulkStockUpdate(adjustedProducts)
    } else if (selectedStockProductId.value) {
      selectedStockProductId.value = null
    }
  }
}

const handleGlobalCancel = () => {
  if (productSubTab.value === 'recipe_management') {
    selectedRecipeProductId.value = null
    recipeFormItems.value = []
  } else if (productSubTab.value === 'units') {
    editingProductUnitId.value = null
    productUnitForm.value = { name: '', shortName: '' }
  } else if (productSubTab.value === 'groups') {
    editingProductGroupId.value = null
    productGroupForm.value = { name: '' }
  } else if (productSubTab.value === 'products_list') {
    cancelProductEdit()
  } else if (productSubTab.value === 'stock_management') {
    selectedStockProductId.value = null
  }
  
  // If not editing, hide the form (only for form tabs)
  if (productSubTab.value !== 'stock_management' && productSubTab.value !== 'recipe_management' && !isAnyEditing.value) {
    isFormVisible.value = false
  }
}

const handleGlobalDelete = () => {
  if (productSubTab.value === 'recipe_management') {
    if (selectedRecipeItem.value) {
      removeRecipeItemFromSelected(selectedRecipeItem.value)
      selectedRecipeItem.value = null
    }
  } else if (productSubTab.value === 'units' && editingProductUnitId.value) {
    deleteProductUnit(editingProductUnitId.value)
  } else if (productSubTab.value === 'groups' && editingProductGroupId.value) {
    deleteProductGroup(editingProductGroupId.value)
  } else if (productSubTab.value === 'products_list' && editingProductId.value) {
    deleteProduct(editingProductId.value)
  }
}

onMounted(async () => {
  // dataStore fetches happen inside BaseGlobalSelector
  // Eğer BehaAdmin değilse (selector gizliyse) direkt çekelim
  if (!authStore.isBehaAdmin) {
    onGlobalSelectionChange(globalSelection.value)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); }

.animate-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
