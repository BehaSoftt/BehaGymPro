<template>
  <div class="h-full bg-[#050505] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">
    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden p-1 gap-1">
      
      <!-- Column 1: Categories (Tab Sidebar) -->
      <div class="w-40 flex flex-col bg-slate-950/80 backdrop-blur-xl border-2 border-blue-500/40 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.15)]">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          
          <button 
            v-for="group in productGroups" 
            :key="group.id"
            @click="selectedCategory = selectedCategory === group.id ? null : group.id"
            :class="[
              selectedCategory === group.id 
                ? getProductTheme({ name: group.name, groupId: group.id }).selected + ' translate-x-1'
                : getProductTheme({ name: group.name, groupId: group.id }).bg + ' opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0'
            ]"
            class="group relative w-full flex flex-col p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 overflow-hidden"
          >
            <!-- Background Glow for Selected -->
            <div v-if="selectedCategory === group.id" class="absolute inset-0 opacity-40"
               :class="getProductTheme({ name: group.name, groupId: group.id }).glow">
            </div>
            
            <span class="relative z-10 text-[0.7rem] font-black tracking-widest uppercase text-center leading-tight break-words transition-colors"
                :class="selectedCategory === group.id ? 'text-white' : ''">
              {{ group.name }}
            </span>
          </button>
        </div>
      </div>

      <!-- Column 2: Products Area -->
      <div class="flex-1 flex flex-col gap-1 overflow-hidden">
        <!-- Arama ve Başlık Bölümü -->
        <div class="px-2 pt-2 pb-1">
           <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search class="w-5 h-5 text-orange-500/80 group-focus-within:text-orange-400 transition-colors" />
              </div>
              <input 
                 v-model="searchQuery" 
                 type="text" 
                 placeholder="Ürün veya kategori ara..." 
                 class="w-full h-14 bg-slate-950 border-2 border-orange-500/30 focus:border-orange-500 text-white pl-12 pr-12 rounded-2xl text-sm font-black placeholder:text-slate-700 outline-none transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)] focus:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''" 
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                 <X class="w-5 h-5" />
              </button>
           </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 bg-slate-950/80 backdrop-blur-xl border-2 border-blue-500/40 rounded-2xl overflow-hidden flex flex-col p-1 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
          <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
             <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-1">
                  <div 
                  v-for="product in filteredProducts" 
                  :key="product.id"
                  @click="addToCart(product)"
                  class="group relative border-2 rounded-xl p-3 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col active:scale-95"
                  :class="[
                    getProductTheme(product).bg, 
                    getProductTheme(product).border, 
                    getProductTheme(product).shadow, 
                    getProductTheme(product).hoverShadow,
                    'hover:-translate-y-1'
                  ]"
                >
                  <!-- Background Glow Effect (Vibrant) -->
                  <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    :class="getProductTheme(product).glow">
                  </div>

                  <!-- Stock Badge -->
                  <div class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[0.55rem] font-black z-10 border border-white/5 uppercase" :class="product.type === 'KARMA' ? 'text-indigo-400' : (product.stock > 10 ? 'text-emerald-400' : 'text-rose-400')">
                    <template v-if="product.type === 'KARMA'">REÇETELİ</template>
                    <template v-else>{{ product.stock }} STOK</template>
                  </div>

                  <!-- Product Image -->
                  <div class="aspect-square bg-slate-900 rounded-lg mb-3 overflow-hidden border border-white/10 flex items-center justify-center relative group-hover:scale-[1.05] transition-transform duration-500 shadow-inner">
                     <img v-if="product.imageUrl" :src="product.imageUrl.startsWith('http') ? product.imageUrl : `http://${getHost()}:5000/uploads${product.imageUrl}`" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                     <div v-else class="flex flex-col items-center gap-1.5 opacity-40">
                        <Package class="w-8 h-8 text-white" />
                     </div>
                  </div>

                  <!-- Name & Price -->
                  <div class="relative z-10 flex flex-col flex-1 justify-between gap-2 overflow-hidden">
                    <h3 class="text-[0.8rem] font-black text-white uppercase tracking-wider leading-tight group-hover:translate-x-0.5 transition-transform duration-300 line-clamp-2">{{ product.name }}</h3>
                    
                    <div class="flex items-center justify-between pt-2 border-t border-white/5">
                        <div class="flex flex-col">
                           <span class="text-[0.9rem] font-black tracking-tighter" :class="getProductTheme(product).text">{{ product.price }} ₺</span>
                           <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">/ {{ product.productUnit?.shortName || product.unit || 'ADET' }}</span>
                        </div>
                        <div class="p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
                           <Plus class="w-3 h-3 text-white" />
                        </div>
                    </div>
                  </div>

                  <!-- Corner Decoration (Subtle) -->
                  <div class="absolute -right-3 -bottom-3 w-12 h-12 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none" :class="getProductTheme(product).text">
                     <Package class="w-full h-full" />
                  </div>
                </div>
             </div>
             <!-- Empty State -->
             <div v-else class="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 py-16">
                <Package class="w-12 h-12 mb-3" />
                <p v-if="!selectedCategory && !searchQuery" class="text-[0.6rem] font-black tracking-[0.4em] uppercase">Ürün Görmek İçin Kategori Seçin veya Arayın</p>
                <p v-else class="text-[0.6rem] font-black tracking-[0.4em] uppercase">Ürün Bulunamadı</p>
             </div>
          </div>

          <!-- Product Pagination -->
          <div class="p-2 border-t border-blue-500/20 bg-slate-900/40 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <BaseButton 
                  v-if="salesStore.productPages > 1"
                  variant="dark" size="icon" square class="w-8 h-8"
                  :disabled="salesStore.currentProductPage === 1"
                  @click="salesStore.loadProducts(salesStore.currentProductPage - 1)"
                >
                   <template #icon><ChevronLeft class="w-4 h-4" /></template>
                </BaseButton>
                
                <div v-if="salesStore.productPages > 1" class="flex items-center gap-1.5 px-2">
                   <span class="text-[0.65rem] font-black text-blue-400">{{ salesStore.currentProductPage }}</span>
                   <span class="text-[0.6rem] font-bold text-slate-600">/</span>
                   <span class="text-[0.65rem] font-black text-slate-400">{{ salesStore.productPages }}</span>
                </div>

                <BaseButton 
                  v-if="salesStore.productPages > 1"
                  variant="dark" size="icon" square class="w-8 h-8"
                  :disabled="salesStore.currentProductPage === salesStore.productPages"
                  @click="salesStore.loadProducts(salesStore.currentProductPage + 1)"
                >
                   <template #icon><ChevronRight class="w-4 h-4" /></template>
                </BaseButton>
             </div>

             <div class="flex flex-col items-end pr-2">
                <span class="text-[0.5rem] font-black text-slate-600 uppercase tracking-tighter">MEVCUT STOKLU ÜRÜN</span>
                <span class="text-[0.7rem] font-black text-blue-400 mt-[-2px]">{{ salesStore.totalProducts }}</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Column 3: Cart Actions (Middle Column) -->
      <div class="w-20 bg-slate-950/80 backdrop-blur-xl border-2 border-blue-500/40 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.15)] flex flex-col p-1.5 gap-1 shrink-0 justify-between">
         <div class="flex flex-col gap-1.5" :class="!selectedCartItem ? 'opacity-20 pointer-events-none' : ''">
            <!-- Plus (Green) -->
            <button 
               @click="selectedCartItem && updateQuantity(selectedCartItem, 1)" 
               class="h-16 w-full flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl text-emerald-500 transition-all shadow-md active:scale-95 group"
            >
               <Plus class="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
            
            <!-- Minus (Amber/Orange) -->
            <button 
               @click="selectedCartItem && updateQuantity(selectedCartItem, -1)" 
               class="h-16 w-full flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/50 rounded-xl text-amber-500 transition-all shadow-md active:scale-95 group"
            >
               <Minus class="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
            
            <!-- Trash (Red) -->
            <button 
               @click="selectedCartItem && removeFromCart(selectedCartItem.productId)" 
               class="h-16 w-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-rose-500 transition-all shadow-md active:scale-95 group"
            >
               <Trash2 class="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
         </div>

          <!-- Action Footer (Tahsilat & Checkout) -->
          <div class="mt-auto border-t-2 border-slate-800 pt-1.5 flex flex-col gap-1.5">
             <button 
               @click="isAccountingModalOpen = true"
               :disabled="cart.length === 0"
               class="h-24 w-full flex flex-col items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/30 border-2 border-emerald-500 rounded-xl text-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
               title="Satışı Tamamla"
             >
                <div class="absolute inset-x-0 bottom-0 h-1 bg-emerald-400/20 scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                <CreditCard class="w-8 h-8 group-hover:scale-110 transition-transform mb-2" />
                <span class="text-xs font-black tracking-widest uppercase">Satışı Tamamla</span>
             </button>
          </div>
      </div>

      <!-- Column 4: Cart Area -->
      <div class="w-72 flex flex-col bg-slate-950/80 backdrop-blur-xl border-2 border-blue-500/40 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(59,130,246,0.15)] relative">
        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1.5 mt-1">
          <TransitionGroup name="list">
             <div 
                v-for="item in cart" 
                :key="item.productId" 
                @click="selectedCartItem = item"
                class="bg-[#0a0a0a] rounded-xl flex overflow-hidden relative group items-stretch shadow-md cursor-pointer transition-all border"
                :class="selectedCartItem?.productId === item.productId ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 hover:border-white/10'"
             >
                 <!-- Product Data -->
                 <div class="flex-1 min-w-0 p-3 flex flex-col">
                    <h4 class="text-[0.7rem] font-black text-slate-200 uppercase leading-none tracking-tight mb-3">{{ item.productName }}</h4>
                    <div class="mt-auto flex items-end justify-between">
                       <div class="flex items-center gap-1.5 text-[0.65rem] font-black" :class="selectedCartItem?.productId === item.productId ? 'text-orange-400/80' : 'text-slate-500'">
                          <span>{{ item.quantity }} {{ item.unit }} x </span>
                          <span>{{ item.unitPrice }} ₺</span>
                       </div>
                       <span class="text-sm font-black tracking-tighter" :class="selectedCartItem?.productId === item.productId ? 'text-orange-400' : 'text-emerald-400'">{{ (item.unitPrice * item.quantity).toFixed(2) }} ₺</span>
                    </div>
                 </div>
              </div>
          </TransitionGroup>

          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-800/40 py-16 pointer-events-none">
             <div class="relative mb-3">
                <div class="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full"></div>
                <ShoppingBag class="w-10 h-10 relative text-slate-700" />
             </div>
             <p class="text-[0.6rem] font-bold tracking-[0.3em] uppercase">Sepetiniz Boş</p>
          </div>
        </div>

         <!-- Footer (Totals Only) -->
         <div class="p-4 bg-slate-950/95 backdrop-blur-xl border-t-2 border-blue-500/40 space-y-3 relative z-10 shadow-[0_-15px_30px_rgba(59,130,246,0.15)]">
            <div class="flex items-center justify-between">
               <span class="text-[0.6rem] font-black text-slate-500 tracking-[0.2em] uppercase">Ara Toplam</span>
               <span class="text-[0.7rem] font-black text-slate-300 tracking-tight">{{ cartTotal }} ₺</span>
            </div>
            <!-- Ara Toplam ile Genel Toplam arasındaki tam neon çizgi -->
            <div class="h-[2px] w-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            
            <div class="flex items-center justify-between pt-1">
               <span class="text-[0.65rem] font-black text-white tracking-[0.2em] uppercase">Genel Toplam</span>
               <span class="text-xl font-black text-orange-400 tracking-tighter drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]">{{ cartTotal }} ₺</span>
            </div>
         </div>
      </div>
    </div>

    <!-- Modals (Payment, Member Search, Success) -->
     <Teleport to="body">
       <Transition name="fade">
          <!-- Modern Transaction View (Full screen overlay simulating FinancialAccounts UI) -->
          <div v-if="isAccountingModalOpen" class="fixed inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
              <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 flex flex-col">
                 <div class="flex-1 flex flex-col">
                    <!-- Unified Modern Card -->
                    <div class="flex-1 bg-slate-950 border-b-2 border-slate-800/50 shadow-2xl relative overflow-hidden flex flex-col">
                       <!-- Top Header -->
                       <div class="flex items-center justify-between px-8 py-6 bg-slate-950 border-b-2 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                          <div class="flex items-center gap-3">
                             <Plus class="w-6 h-6 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                             <span class="text-[0.75rem] font-black text-white uppercase tracking-[0.4em]">{{ selectedMember ? selectedMember.fullName : 'HIZLI İŞLEM' }}</span>
                          </div>
                          <span class="text-[0.65rem] text-slate-500 font-black uppercase tracking-[0.2em] p-2 bg-slate-900 border border-slate-800 rounded-lg">{{ selectedMember ? (selectedMember.memberCode || selectedMember.phone) : 'CARI-2026-X' }}</span>
                       </div>

                       <!-- Content Grid -->
                       <div class="p-4 md:p-8 grid grid-cols-1 gap-6 lg:gap-10 transition-all duration-300" :class="selectedPaymentMethod === 'DEBT' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
                          
                          <!-- Column 1: Mevcut Durum (Ön Ödeme/Avans) -->
                              <div v-if="selectedMember && selectedPaymentMethod === 'DEBT'" class="space-y-4 overflow-hidden">
                                 <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest opacity-60">Mevcut Durum</label>
                                 <div v-if="financialAccount && parseFloat(financialAccount.prepaidBalance) > 0" class="bg-indigo-500/10 border-2 border-indigo-500/40 h-24 flex flex-col justify-center px-6 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                    <span class="text-[0.55rem] text-indigo-400 font-black uppercase tracking-widest mb-0.5">ÖN ÖDEME / AVANS</span>
                                    <span class="text-4xl font-black font-mono tracking-tighter text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">₺{{ parseFloat(financialAccount.prepaidBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                                 </div>
                                 <div v-else class="bg-slate-950 border-2 border-slate-800/50 h-24 flex flex-col justify-center text-center opacity-40 rounded-2xl grayscale">
                                    <span class="text-[0.7rem] font-black text-slate-600 uppercase tracking-widest">ÖN ÖDEME YOK</span>
                                 </div>
                              </div>

                          <!-- Column 2: İşlem Tutarı -->
                          <div class="space-y-4">
                             <label class="block text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest opacity-80">İşlem Tutarı (₺)</label>
                             <div class="relative h-24 flex flex-col">
                                <input type="number" step="0.01" :value="cartTotal" class="w-full h-full bg-slate-950 border-2 border-emerald-500 text-5xl font-black text-emerald-400 px-6 outline-none shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-2xl tracking-tighter" readonly />
                                <span class="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-900/40 font-black text-2xl italic uppercase pointer-events-none">TRY</span>
                             </div>
                          </div>

                          <!-- Column 3: Ödeme Yöntemi -->
                          <div class="space-y-4">
                             <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ÖDEME YÖNTEMİ</label>
                             <div class="grid grid-cols-3 gap-3 h-24">
                                <button v-for="method in [{ id: 'CASH', label: 'NAKİT', variant: 'rose' }, { id: 'CREDIT_CARD', label: 'K. KARTI', variant: 'sky' }, { id: 'DEBT', label: 'CARİ', variant: 'violet' }]" :key="method.id" @click="selectedPaymentMethod = method.id" type="button" 
                                   :class="[
                                      selectedPaymentMethod === method.id 
                                         ? `bg-${method.variant}-500/10 border-2 border-${method.variant}-500 text-${method.variant}-400 shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                                         : 'bg-slate-950 border-2 border-slate-800 text-slate-600 hover:border-slate-700'
                                   ]" 
                                   class="py-4 rounded-xl text-[0.7rem] font-black transition-all uppercase tracking-widest flex items-center justify-center">
                                   {{ method.label }}
                                </button>
                             </div>
                             
                             <div class="mt-4" v-if="selectedPaymentMethod === 'DEBT' && selectedMember">
                                <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                                   <BaseMemberAvatar 
                                       :src="selectedMember?.photo" 
                                       :name="selectedMember?.fullName" 
                                       size="md"
                                       class="mb-2 w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/50"
                                    />
                                   <p class="text-[0.65rem] text-indigo-400 font-bold uppercase tracking-widest">SEÇİLİ CARİ HESAP</p>
                                   <p class="text-sm font-black text-slate-200 mt-1 uppercase">{{ selectedMember.fullName }}</p>
                                </div>
                             </div>
                          </div>

                          <!-- Column 4: Cari Arama (Only visible when DEBT is selected) -->
                              <div v-if="selectedPaymentMethod === 'DEBT'" class="space-y-4 overflow-hidden">
                                 <label class="block text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest opacity-80">CARİ ARAMA</label>
                                 <div class="relative h-24">
                                    <div class="relative w-full h-full">
                                        <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] z-10" />
                                        <input 
                                            ref="cariSearchInput"
                                            v-model="quickMemberSearchQuery" 
                                            @input="handleQuickMemberSearch"
                                            type="text" 
                                            placeholder="Kart/Ad Soyad Ara..." @keydown.enter.prevent="handleEnterKey" 
                                            class="w-full h-full bg-slate-950/80 border-2 border-indigo-500/30 text-indigo-200 pl-14 pr-6 py-5 outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all uppercase text-sm font-black tracking-widest placeholder:text-slate-800 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.1)] focus:shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
                                        />
                                    </div>
                                    
                                    <!-- Search Results -->
                                    <div v-if="quickSearchResults.length > 0 && quickMemberSearchQuery" class="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[200] max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
                                        <div 
                                            v-for="member in quickSearchResults" 
                                            :key="member.entityId"
                                            @click="selectQuickMember(member)"
                                            class="p-3 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center group transition-colors border border-transparent hover:border-slate-700"
                                        >
                                            <div class="flex items-center gap-3">
                                                <BaseMemberAvatar 
                                                   :src="member.photo" 
                                                   :name="member.name" 
                                                   size="sm"
                                                   class="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-400 group-hover:border-indigo-500 transition-colors shadow-inner"
                                                />
                                                <div>
                                                   <p class="text-[0.65rem] font-black text-white group-hover:text-indigo-400 transition-colors uppercase">{{ member.name }}</p>
                                                   <p class="text-[0.5rem] font-bold tracking-widest text-slate-500 uppercase">
                                                     <span :class="member.entityType === 'MEMBER' ? 'text-emerald-400' : member.entityType === 'USER' ? 'text-amber-400' : 'text-indigo-400'">{{ member.entityType }}</span>
                                                     {{ member.code ? '• ' + member.code : '' }} {{ member.phone ? '• ' + member.phone : '' }}
                                                   </p>
                                                </div>
                                            </div>
                                            <ChevronRight class="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                    <div v-else-if="quickMemberSearchQuery.length >= 2" class="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[200] p-6 text-center text-slate-500 text-[0.65rem] font-black uppercase">
                                       Sonuç Bulunamadı
                                    </div>
                                 </div>
                              </div>

                       </div>
                  </div>
               </div>

               <!-- Bottom Footer identical to the financial page action footer -->
                <div class="flex items-center justify-center p-6 bg-slate-950 border-t-2 border-slate-800 shadow-[0_-15px_30px_rgba(0,0,0,0.4)] gap-[25px]">
                   <button type="button" @click="isAccountingModalOpen = false" class="bg-slate-900/50 border-2 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white p-3 px-8 h-14 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase transition-all shadow-md active:scale-95">
                      <X class="w-5 h-5" /> Kapat
                   </button>
                   <button type="button" @click="completeSale" class="bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white p-3 px-10 h-14 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95">
                      <span v-if="loading" class="flex items-center gap-2"><Loader2 class="w-5 h-5 animate-spin"/> İşleniyor...</span>
                      <span v-else class="flex items-center gap-2"><Check class="w-6 h-6 stroke-[3]" /> ÖDEME AL</span>
                   </button>
                </div>
            </div>
          </div>
       </Transition>




       <!-- Success Modal -->
       <Transition name="fade">
          <div v-if="showSuccessModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
             <div class="bg-slate-900 border border-emerald-500/20 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-success">
                <div class="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40 relative">
                   <div class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                   <Check class="w-10 h-10 text-white stroke-[4]" />
                </div>
                
                <h3 class="text-2xl font-black text-white tracking-tighter mb-1 uppercase">Sipariş Alındı</h3>
                <p class="text-[0.55rem] text-emerald-400 font-bold tracking-[0.3em] uppercase mb-8">İşlem Başarıyla Kaydedildi</p>
                
                <div class="bg-black/40 border border-white/5 rounded-2xl p-4 mb-8 space-y-3">
                   <div class="flex justify-between items-center text-[0.55rem] font-black text-slate-500 tracking-[0.2em] uppercase">
                      <span>Müşteri</span>
                       <span class="text-white">{{ selectedMember ? selectedMember.fullName : 'SERBEST MÜŞTERİ' }}</span>
                   </div>
                   <div class="flex justify-between items-center text-[0.55rem] font-black text-slate-500 tracking-[0.2em] uppercase border-t border-white/5 pt-2">
                      <span>Tahsilat</span>
                      <span class="text-emerald-400 font-black text-base tracking-tighter">{{ lastSaleTotal }} ₺</span>
                   </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                   <button @click="closeSuccessModal" class="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[0.65rem] font-black tracking-widest transition-all uppercase">
                      Kapat
                   </button>
                   <button @click="printReceipt" class="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[0.65rem] font-black tracking-widest transition-all shadow-lg shadow-indigo-600/20 uppercase flex items-center justify-center gap-2">
                      <Printer class="w-3.5 h-3.5" /> Yazdır
                   </button>
                </div>
             </div>
          </div>
       </Transition>
    </Teleport>
    
    <!-- Restore BaseActionFooter for UI consistency -->
    <BaseActionFooter v-if="!isAccountingModalOpen && !showSuccessModal">
       <div class="flex items-center gap-[10px]">
          <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
             <template #icon><ArrowLeft class="w-5 h-5" /></template>
          </BaseButton>
          
          <div class="w-px h-6 bg-slate-800 mx-1"></div>
          
          <BaseButton v-if="cart.length > 0" variant="danger" size="icon" square @click="clearCart" title="SEPETİ TEMİZLE">
             <template #icon><Trash2 class="w-5 h-5" /></template>
          </BaseButton>

          <BaseButton variant="primary" size="icon" square @click="isAccountingModalOpen = true" :disabled="cart.length === 0" title="ÖDEME AL / SATIŞI BİTİR">
             <template #icon><CreditCard class="w-5 h-5 text-emerald-400" /></template>
          </BaseButton>
       </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, inject, onUnmounted } from 'vue';
import { 
  Plus, Minus, Trash2, Search, X, Package, ShoppingBag, Loader2, Check, Printer, ChevronRight, ChevronLeft, CreditCard, ArrowLeft
} from 'lucide-vue-next';
import { useSalesStore } from '../../store/sales';
import { useAuthStore } from '../../store/auth';
import { useAlerts } from '../../utils/alerts';
import BaseMemberAvatar from '../../components/base/BaseMemberAvatar.vue';

const salesStore = useSalesStore();
const auth = useAuthStore();
const { toast, confirm, error: showAlertError } = useAlerts();

const pageSubtitle = inject('pageSubtitle', ref(''))

// State
const searchQuery = ref('');
const quickMemberSearchQuery = ref('');
const quickSearchResults = ref([]);
const isAccountingModalOpen = ref(false);
const selectedCategory = ref(null);
const selectedMember = ref(null);
const selectedPaymentMethod = ref('CASH');
const loading = ref(false);
const showSuccessModal = ref(false);
const lastSaleTotal = ref(0);
const selectedCartItem = ref(null);
const cariSearchInput = ref(null);

watch(isAccountingModalOpen, (val) => {
  if (val) pageSubtitle.value = 'ÖDEME ONAYI'
  else pageSubtitle.value = ''
})

onUnmounted(() => {
  pageSubtitle.value = ''
})

watch(selectedPaymentMethod, async (newVal) => {
  if (newVal === 'DEBT') {
    await nextTick();
    if (cariSearchInput.value) {
      cariSearchInput.value.focus();
    }
  }
});

// Computed
const productGroups = computed(() => salesStore.productGroups);
const products = computed(() => salesStore.products);
const cart = computed(() => salesStore.cart);
const cartTotal = computed(() => salesStore.cartTotal);
const financialAccount = computed(() => salesStore.financialAccount);

const getProductTheme = (product) => {
  const themes = [
    { 
      bg: 'bg-indigo-500/10 border-indigo-400',
      border: 'border-indigo-500 hover:border-indigo-300',
      text: 'text-indigo-400',
      shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]',
      glow: 'bg-indigo-400/20',
      selected: 'bg-indigo-600/40 border-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.5)]'
    },
    { 
      bg: 'bg-emerald-500/10 border-emerald-400',
      border: 'border-emerald-500 hover:border-emerald-300',
      text: 'text-emerald-400',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]',
      glow: 'bg-emerald-400/20',
      selected: 'bg-emerald-600/40 border-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.5)]'
    },
    { 
      bg: 'bg-amber-500/10 border-amber-400',
      border: 'border-amber-500 hover:border-amber-300',
      text: 'text-amber-400',
      shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]',
      glow: 'bg-amber-400/20',
      selected: 'bg-amber-600/40 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)]'
    },
    { 
      bg: 'bg-rose-500/10 border-rose-400',
      border: 'border-rose-500 hover:border-rose-300',
      text: 'text-rose-400',
      shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.6)]',
      glow: 'bg-rose-400/20',
      selected: 'bg-rose-600/40 border-rose-300 shadow-[0_0_40px_rgba(244,63,94,0.5)]'
    },
    { 
      bg: 'bg-cyan-500/10 border-cyan-400',
      border: 'border-cyan-500 hover:border-cyan-300',
      text: 'text-cyan-400',
      shadow: 'shadow-[0_0_20_px_rgba(6,182,212,0.3)]',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]',
      glow: 'bg-cyan-400/20',
      selected: 'bg-cyan-600/40 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.5)]'
    }
  ];
  const charCode = (product.name?.charCodeAt(0) || 0) + (product.groupId?.split('-').join('').charCodeAt(0) || 0);
  return themes[charCode % themes.length];
};

const getHost = () => window.location.hostname;

const filteredProducts = computed(() => products.value);

// Methods
const addToCart = (product) => {
  const success = salesStore.addToCart(product);
  if (!success && salesStore.error) {
    toast(salesStore.error, 'error');
    salesStore.resetError();
  } else {
    selectedCartItem.value = cart.value.find(i => i.productId === product.id) || null;
  }
};

const removeFromCart = (productId) => {
  salesStore.removeFromCart(productId);
  if (selectedCartItem.value && selectedCartItem.value.productId === productId) {
    selectedCartItem.value = null;
  }
};

const updateQuantity = (item, delta) => {
  const newQty = item.quantity + delta;
  if (newQty <= 0) removeFromCart(item.productId);
  else salesStore.updateCartQuantity(item.productId, newQty);
};

const clearCart = () => {
  salesStore.clearCart();
  selectedCartItem.value = null;
};

const handleQuickMemberSearch = async () => {
  if (quickMemberSearchQuery.value.length < 2) {
    quickSearchResults.value = [];
    return;
  }
  const results = await salesStore.searchEntities(quickMemberSearchQuery.value);
  quickSearchResults.value = results;
  
  if (results && results.length === 1 && (quickMemberSearchQuery.value.length >= 8)) {
    selectQuickMember(results[0]);
  }
};

const handleEnterKey = () => {
  if (quickSearchResults.value.length === 1) {
    selectQuickMember(quickSearchResults.value[0]);
  }
};

const selectQuickMember = async (member) => {
  const success = await salesStore.selectEntity(member.entityId, member.entityType);
  if (success) {
    selectedMember.value = {
      ...salesStore.selectedEntity.details,
      fullName: member.name,
      phone: member.phone || member.code,
      memberCode: member.code
    };
    quickMemberSearchQuery.value = '';
    quickSearchResults.value = [];
  }
};

const completeSale = async () => {
  if (!selectedPaymentMethod.value) {
    toast('Ödeme yöntemi seçmelisiniz.', 'warning');
    return;
  }

  if (cart.value.length === 0) {
    toast('Satış yapmak için önce ürün eklemelisiniz.', 'warning');
    return;
  }

  const hasZeroPriceItem = cart.value.some(item => parseFloat(item.unitPrice) <= 0);
  if (hasZeroPriceItem || parseFloat(cartTotal.value) <= 0) {
    showAlertError('GEÇERSİZ TUTAR', 'Ücretsiz (0 ₺) ürün satışı yapılamaz.');
    return;
  }
  
  if (selectedPaymentMethod.value === 'DEBT') {
    if (!selectedMember.value) {
      toast('Cari işlemi için bir üye seçmeniz zorunludur.', 'warning');
      return;
    }

    if (salesStore.isDebtLimitExceeded) {
      const limitInfo = salesStore.debtLimitWarning;
      showAlertError('LİMİT AŞILDI', limitInfo?.message || 'Üyenin borçlanma limiti yetersizdir.');
      return;
    }
  }
  
  loading.value = true;
  try {
    let payments = [];
    if (selectedPaymentMethod.value !== 'DEBT') {
       payments = [{
         method: selectedPaymentMethod.value,
         amount: parseFloat(cartTotal.value)
       }];
    }

    if (!selectedMember.value) {
       const selectSuccess = await salesStore.selectEntity(auth.user.branchId, 'GUEST');
       if (!selectSuccess) {
         loading.value = false;
         showAlertError('HATA', salesStore.error || 'Serbest satış hesabı başlatılamadı.');
         return;
       }
    }

    await salesStore.completeSale(payments);
    isAccountingModalOpen.value = false;
    clearCart();
    selectedMember.value = null;
    selectedPaymentMethod.value = 'CASH';
    toast('Satış Tamamlandı', 'success');
  } catch (err) {
    console.error('Satış hatası:', err);
    showAlertError('HATA', err.response?.data?.message || err.message || 'Satış tamamlanamadı');
  } finally {
    loading.value = false;
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  clearCart();
  selectedMember.value = null;
  selectedPaymentMethod.value = 'CASH';
};

const printReceipt = () => {
  toast('Fiş yazdırılıyor...');
};

onMounted(async () => {
  await salesStore.loadProductGroups();
  // Initial products load
  await salesStore.loadProducts(1, 50);
  
  if (salesStore.selectedEntity && salesStore.selectedEntity.details) {
     selectedMember.value = salesStore.selectedEntity.details;
  }
});

// Update salesStore filters on change
watch([searchQuery, selectedCategory], () => {
  salesStore.searchQuery = searchQuery.value;
  salesStore.selectedGroup = selectedCategory.value;
  salesStore.loadProducts(1, 50);
});

watch(cart, (newCart) => {
  if (selectedCartItem.value) {
    const stillExists = newCart.find(i => i.productId === selectedCartItem.value.productId);
    selectedCartItem.value = stillExists || null;
  }
}, { deep: true });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.2);
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes success-pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-success {
  animation: success-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Curtain (Perde) Transitions */
.curtain-enter-active, .curtain-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 800px;
  opacity: 1;
}
.curtain-enter-from, .curtain-leave-to {
  max-height: 0;
  opacity: 0;
}

.curtain-horizontal-enter-active, .curtain-horizontal-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  max-width: 500px;
  opacity: 1;
}
.curtain-horizontal-enter-from, .curtain-horizontal-leave-to {
  max-width: 0;
  opacity: 0;
}

/* Base resets/util */
.tracking-tighter { letter-spacing: -0.05em; }
</style>
