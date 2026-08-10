<template>
  <div class="h-full flex flex-col gap-4 animate-in">
    <div class="flex-none px-2 mt-2 animate-in slide-in-from-top-1 duration-500 pb-2">
       <BaseGlobalSelector 
         v-if="auth.isBehaAdmin"
         storageKey="settings_comm_selection" 
         @change="onGlobalSelectionChange"
       />
    </div>
    <div class="flex-1 flex flex-row gap-6 min-h-0">
      <!-- Branch selection side (List) -->
      <div class="w-1/3 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden min-w-[300px]">
        <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span class="text-[0.6rem] font-bold text-slate-500 tracking-widest">Şube Listesi</span>
        </div>
        <div class="p-4 border-b border-slate-800 bg-slate-900/50">
           <div class="relative flex items-center">
              <Search class="absolute left-3 w-4 h-4 text-slate-500" />
              <input 
                v-model="branchCommSearchQuery" 
                type="text" 
                placeholder="Şube Ara..." 
                class="w-full bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs font-medium tracking-widest text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                v-if="branchCommSearchQuery"
                @click="branchCommSearchQuery = ''"
                class="absolute right-3 text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
           </div>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar">
           <button 
             v-for="b in filteredBranchListComm" 
             :key="b.id"
             @click="selectCommBranch(b)"
             :class="selectedCommBranch?.id === b.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-800 border-l-2 border-l-transparent'"
             class="w-full p-3 flex items-center gap-3 transition-all text-left border-b border-slate-800/50 group"
           >
              <div class="w-9 h-9 rounded-none bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
                 <Building2 class="w-5 h-5" />
              </div>
              <div class="flex-1 overflow-hidden">
                 <p class="text-[0.7rem] font-bold text-slate-200 truncate">{{ b.name }}</p>
                 <p class="text-[0.55rem] text-slate-500 font-medium tracking-widest truncate">{{ b.company?.name }}</p>
              </div>
           </button>
           
           <div v-if="filteredBranchListComm.length === 0" class="p-12 text-center opacity-30">
              <Search class="w-12 h-12 mx-auto mb-4" />
              <p class="text-[0.6rem] font-bold tracking-widest">Şube Bulunamadı</p>
           </div>
        </div>
      </div>

      <!-- Management Area (Settings) -->
      <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
         <template v-if="selectedCommBranch">
            <div class="flex-1 flex flex-col overflow-hidden">
               <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
                  <!-- Communication Strategy / DEFAULT MODE -->

                  <!-- Communication Settings -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    <!-- WhatsApp Section -->
                    <div class="space-y-4">
                       <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-emerald-500/30">
                          <MessageSquare class="w-3.5 h-3.5 text-emerald-400" />
                          <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">WhatsApp Servisi</span>
                       </div>
                       
                       <div class="p-4 bg-slate-950 border border-emerald-500/20 space-y-4">
                          <div class="flex justify-between items-center">
                             <div class="space-y-0.5">
                                <p class="text-[0.65rem] font-bold text-slate-200">WhatsApp Bildirimleri</p>
                                <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Yoklama, Hatırlatma Ve Diğer Mesajlar</p>
                             </div>
                             
                              <BaseSwitch v-model="communicationForm.isWhatsAppEnabled" />
                          </div>
                       </div>
                    </div>

                    <!-- Email Section -->
                    <div class="space-y-4">
                       <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                          <Mail class="w-3.5 h-3.5 text-indigo-400" />
                          <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">E-Posta Servisi</span>
                       </div>
                       
                         <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                            <div class="flex justify-between items-center">
                               <div class="space-y-0.5">
                                  <p class="text-[0.65rem] font-bold text-slate-200">E-Posta Bildirimleri</p>
                                  <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Sistem Bilgilendirme E-Postaları</p>
                               </div>
                               
                                <BaseSwitch v-model="communicationForm.isEmailEnabled" />
                            </div>

                            <!-- SMTP Configuration -->
                            <div v-if="communicationForm.isEmailEnabled" class="space-y-4 pt-4 border-t border-indigo-500/10">
                               <p class="text-[0.55rem] font-black text-indigo-400 uppercase tracking-widest">SMTP Yapılandırması</p>
                               <div class="grid grid-cols-2 gap-3">
                                  <div class="space-y-1">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Sunucu (Host)</label>
                                     <input v-model="communicationForm.smtpHost" type="text" placeholder="smtp.gmail.com" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="space-y-1">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Port</label>
                                     <input v-model.number="communicationForm.smtpPort" type="number" placeholder="587" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="space-y-1">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Kullanıcı Adı</label>
                                     <input v-model="communicationForm.smtpUser" type="text" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="space-y-1">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Şifre</label>
                                     <input v-model="communicationForm.smtpPass" type="password" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="space-y-1">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Gönderici (From)</label>
                                     <input v-model="communicationForm.smtpFromEmail" type="text" placeholder="gym@behasoft.com" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="flex items-center justify-between pt-4">
                                     <span class="text-[0.55rem] font-bold text-slate-400 uppercase">SSL/TLS</span>
                                      <BaseSwitch v-model="communicationForm.smtpSecure" />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Birthday Section -->
                      <div class="space-y-4">
                         <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-rose-500/30">
                            <Award class="w-3.5 h-3.5 text-rose-400" />
                            <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Doğum Günü Servisi</span>
                         </div>
                         
                         <div class="p-4 bg-slate-950 border border-rose-500/20 space-y-4">
                            <div class="flex justify-between items-center">
                               <div class="space-y-0.5">
                                  <p class="text-[0.65rem] font-bold text-slate-200">Kutlama Mesajları</p>
                                  <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Otomatik Doğum Günü Kutlaması</p>
                               </div>
                               
                                <BaseSwitch v-model="communicationForm.isBirthdayMessageEnabled" />
                            </div>

                            <div v-if="communicationForm.isBirthdayMessageEnabled" class="space-y-2 pt-2 border-t border-rose-500/10">
                               <div class="flex items-center justify-between">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Kutlama Mesajı Şablonu</label>
                                  <span class="text-[0.55rem] font-bold" :class="communicationForm.birthdayMessageTemplate?.length > 950 ? 'text-amber-500' : 'text-slate-600'">
                                     {{ communicationForm.birthdayMessageTemplate?.length || 0 }} / 1024
                                  </span>
                               </div>
                               <textarea 
                                  v-model="communicationForm.birthdayMessageTemplate"
                                  maxlength="1024"
                                  rows="4"
                                  placeholder="Mutlu yıllar {adSoyad}..."
                                  class="w-full bg-black/50 border border-slate-800 p-3 text-[0.7rem] text-slate-300 focus:border-rose-500/50 outline-none transition-colors resize-none placeholder:text-slate-800 font-medium"
                               ></textarea>
                               <div class="flex items-center gap-2 px-1 text-[0.55rem] text-slate-500 italic">
                                  <p>📌 Kullanılabilir Etiketler: <span class="bg-rose-500/20 text-rose-300 px-1 rounded not-italic font-bold">{adSoyad}</span></p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- SMS Provider Section -->
                      <div class="space-y-4">
                         <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                            <Monitor class="w-3.5 h-3.5 text-indigo-400" />
                            <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">SMS Servis Sağlayıcı</span>
                         </div>
                         
                         <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                            <div class="space-y-4">
                               <div class="space-y-1.5">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">SMS Operatörü</label>
                                  <select 
                                    v-model="communicationForm.smsProvider"
                                    class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                                  >
                                    <option value="NETGSM">Netgsm</option>
                                    <option value="ILETIMERKEZI">İleti Merkezi</option>
                                  </select>
                               </div>
                               
                               <div class="grid grid-cols-2 gap-3">
                                  <div class="space-y-1.5">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Kullanıcı</label>
                                     <input v-model="communicationForm.smsUser" type="text" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                                  <div class="space-y-1.5">
                                     <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Şifre</label>
                                     <input v-model="communicationForm.smsPass" type="password" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                                  </div>
                               </div>

                               <div class="space-y-1.5">
                                  <label class="text-[0.55rem] font-bold text-slate-500 uppercase">Başlık (Header)</label>
                                  <input v-model="communicationForm.smsHeader" type="text" placeholder="BEHASOFT" class="w-full bg-black/50 border border-slate-800 p-2 text-[0.65rem] text-slate-300 focus:border-indigo-500 outline-none" />
                               </div>
                            </div>
                         </div>
                      </div>

                      <!-- Telegram Section -->
                      <div class="space-y-4">
                         <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-sky-500/30">
                            <Send class="w-3.5 h-3.5 text-sky-400" />
                            <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Telegram Bot Servisi</span>
                         </div>
                         
                         <div class="p-4 bg-slate-950 border border-sky-500/20 space-y-4">
                            <div class="flex justify-between items-center">
                               <div class="space-y-0.5">
                                  <p class="text-[0.65rem] font-bold text-slate-200">Telegram Bildirimleri</p>
                                  <p class="text-[0.55rem] text-slate-600 font-medium max-w-[180px]">Bot Üzerinden Log Ve Rapor Gönderimi</p>
                               </div>
                               
                                <BaseSwitch v-model="communicationForm.isTelegramEnabled" />
                            </div>

                            <div v-if="communicationForm.isTelegramEnabled" class="space-y-4 pt-2 border-t border-sky-500/10">
                               <div class="space-y-1.5">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest uppercase">Bot API Token</label>
                                  <input 
                                     v-model="communicationForm.telegramBotToken"
                                     type="text" 
                                     placeholder="123456789:ABCDefGhIJKlmNoP..."
                                     class="w-full bg-black/50 border border-slate-800 p-3 text-[0.7rem] text-slate-300 focus:border-sky-500/50 outline-none transition-colors placeholder:text-slate-800 font-mono"
                                  />
                                  <p class="text-[0.5rem] text-slate-600 italic">BotFather üzerinden aldığınız API token bilgisi.</p>
                               </div>

                               <div class="space-y-1.5">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest uppercase">Hedef Chat ID / Grup ID</label>
                                  <input 
                                     v-model="communicationForm.telegramChatId"
                                     type="text" 
                                     placeholder="-100xxxxxxxxx veya xxxxxxxxx"
                                     class="w-full bg-black/50 border border-slate-800 p-3 text-[0.7rem] text-slate-300 focus:border-sky-500/50 outline-none transition-colors placeholder:text-slate-800 font-mono"
                                  />
                                  <p class="text-[0.5rem] text-slate-600 italic">Mesajların gönderileceği grubun veya kullanıcının benzersiz ID'si.</p>
                               </div>

                               <button 
                                  @click="testTelegramConnection" 
                                  :disabled="!communicationForm.telegramBotToken || !communicationForm.telegramChatId || loading"
                                  class="w-full py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 text-[0.6rem] font-black uppercase tracking-widest border border-sky-500/30 transition-all flex items-center justify-center gap-2"
                               >
                                  <Send class="w-3 h-3" /> Bağlantıyı Test Et (Mesaj Gönder)
                               </button>
                            </div>
                         </div>
                      </div>

                      <!-- WhatsApp Header Identity -->
                      <div class="space-y-4">
                         <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-indigo-500/30">
                            <Zap class="w-3.5 h-3.5 text-indigo-400" />
                            <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Bildirim Başlık Kimliği</span>
                         </div>
                         
                         <div class="p-4 bg-slate-950 border border-indigo-500/20 space-y-4">
                            <div class="space-y-3">
                               <div class="space-y-1.5">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Görünecek Şirket</label>
                                  <select 
                                    v-model="communicationForm.whatsappHeaderCompanyId"
                                    @change="communicationForm.whatsappHeaderBranchId = ''"
                                    class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                                  >
                                    <option value="">Varolan Şirket (Sistem Şirketi)</option>
                                    <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
                                  </select>
                               </div>
                               
                               <div class="space-y-1.5">
                                  <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">Görünecek Şube</label>
                                  <select 
                                    v-model="communicationForm.whatsappHeaderBranchId"
                                    class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                                  >
                                    <option value="">Tümü / Ana Şube (Default)</option>
                                    <option 
                                      v-for="b in allBranches.filter(b => b.company?.id === communicationForm.whatsappHeaderCompanyId || !communicationForm.whatsappHeaderCompanyId)" 
                                      :key="b.id" 
                                      :value="b.id"
                                    >{{ b.name }} ({{ b.company?.name }})</option>
                                  </select>
                               </div>
                            </div>
                            <p class="text-[0.55rem] text-slate-600 font-medium italic">* Mesajların en üstünde görünecek bilgileri belirler. Boş bırakılırsa üyenin kendi şube bilgileri kullanılır.</p>
                         </div>
                      </div>
                  </div>

                  <!-- Duyuru / Kampanya Gönderimi -->
                  <div class="space-y-6 pt-6 border-t border-slate-800">
                     <div class="flex items-center gap-2 p-1.5 bg-slate-950 border border-amber-500/30">
                        <Megaphone class="w-3.5 h-3.5 text-amber-500" />
                        <span class="text-[0.7rem] font-bold text-slate-300 tracking-widest">Duyuru & Kampanya</span>
                     </div>

                      <div class="p-4 bg-slate-950 border border-slate-800 space-y-6">
                         <!-- Filtreler Paneli -->
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-900">
                             <div class="space-y-1.5">
                                <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                   <Filter class="w-3.5 h-3.5 text-indigo-500" /> Eğitim / Ders Tipi
                                </label>
                                <select 
                                  v-model="broadcastFilters.lessonType"
                                  class="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[0.65rem] font-medium tracking-widest text-slate-300 outline-none focus:border-indigo-500"
                                >
                                   <option value="">Tümü (Standart)</option>
                                   <option value="GENERAL">Genel Üyelik</option>
                                   <option value="PRIVATE">Özel Ders</option>
                                   <option value="GROUP">Grup Dersi</option>
                                </select>
                             </div>
                             <div class="space-y-1.5">
                                <label class="text-[0.6rem] font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                   <Users class="w-3.5 h-3.5 text-indigo-500" /> Seçilen Üye Sayısı: {{ broadcastFilters.memberIds.length }}
                                </label>
                                <div class="flex items-center gap-2">
                                   <button 
                                     @click="broadcastFilters.memberIds = []"
                                     class="text-[0.55rem] font-bold text-rose-500 border border-rose-500/20 px-2 py-1 hover:bg-rose-500/10"
                                   >Temizle</button>
                                   <span class="text-[0.55rem] text-slate-600 font-medium">Listeden Seçim Yapabilirsiniz</span>
                                </div>
                             </div>
                         </div>

                         <div class="space-y-4">
                            <label class="block text-[0.7rem] font-bold text-slate-400 tracking-widest">Mesaj Metni (Toplu Whatsapp)</label>
                            <textarea 
                              v-model="broadcastMessage"
                              :rows="4"
                              placeholder="Üyelerinize göndermek istediğiniz kampanya veya duyuru metnini buraya yazın..."
                              class="w-full bg-slate-900 border border-slate-700 p-4 text-slate-200 outline-none focus:border-amber-500 transition-all text-xs font-medium tracking-wide leading-relaxed custom-scrollbar"
                            ></textarea>
                            
                            <!-- Üye Seçim Listesi (Geliştirilmiş 2 Sütun) -->
                            <div class="space-y-3">
                               <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <label class="text-[0.6rem] font-black text-slate-500 tracking-[0.2em]">Gönderilecek Üyeleri Seçin (Opsiyonel)</label>
                                  <span class="text-[0.55rem] text-slate-600 font-bold">{{ broadcastFilters.memberIds.length }} Üye Seçili</span>
                               </div>
                               
                               <div class="max-h-[260px] overflow-y-auto custom-scrollbar border border-slate-800 bg-slate-950/40">
                                  <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
                                     <div 
                                       v-for="m in branchMembers" 
                                       :key="m.id"
                                       class="flex items-center justify-between p-3 hover:bg-slate-800/40 transition-all group/item border-b border-slate-800/50"
                                     >
                                        <div class="flex items-center gap-4">
                                            <BaseSwitch v-model="broadcastFilters.memberIds" :value="m.id" />
                                           
                                           <div class="flex flex-col">
                                              <span class="text-[0.65rem] font-bold text-slate-300 leading-none group-hover/item:text-indigo-400 transition-colors">{{ m.fullName }}</span>
                                              <span class="text-[0.55rem] text-slate-600 font-medium tracking-widest mt-1.5">{{ m.phone || 'Numara Yok' }}</span>
                                           </div>
                                        </div>

                                        <div class="flex flex-wrap gap-1 justify-end max-w-[100px]">
                                           <span 
                                             v-for="lt in m.lessonTypes" 
                                             :key="lt"
                                             class="text-[0.45rem] px-1.5 py-0.5 bg-slate-950 text-indigo-400 border border-indigo-500/10 font-black"
                                           >{{ lt }}</span>
                                        </div>
                                     </div>
                                  </div>
                                  <div v-if="branchMembers.length === 0" class="p-8 text-center text-slate-700">
                                     <p class="text-[0.6rem] font-black tracking-[0.3em]">Mesaj Gönderilebilecek Üye Bulunamadı</p>
                                  </div>
                               </div>
                            </div>

                            <div class="flex items-center justify-between pt-4">
                               <div class="flex items-center gap-2 p-2 bg-amber-500/5 border border-amber-500/10">
                                  <Info class="w-3.5 h-3.5 text-amber-500" />
                                  <span class="text-[0.55rem] text-slate-500 font-bold tracking-widest">
                                     {{ broadcastFilters.memberIds.length > 0 ? 'Sadece seçili üyelere gönderilecek.' : 'Kriterlere uyan tüm aktif üyelere gönderilecektir.' }}
                                  </span>
                               </div>
                            </div>
                         </div>
                      </div>
                  </div>


               </div>
            </div>

            <!-- Global Action Footer (Teleports to App.vue #action-footer-target) -->
            <BaseActionFooter v-if="selectedCommBranch">
               <div class="flex items-center gap-2">
                  <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ DÖN">
                     <template #icon><ArrowLeft class="w-5 h-5" /></template>
                  </BaseButton>

                  <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

                 <!-- Broadcast Button (Icon Only) -->
                 <BaseButton 
                   @click="sendBroadcastMessage"
                   :disabled="!broadcastMessage || loading"
                   variant="warning"
                   size="icon"
                   square
                   title="DUYURUYU GÖNDER"
                 >
                   <template #icon><Send class="w-4 h-4" /></template>
                 </BaseButton>

                 <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

                 <!-- Save Settings Button (Icon Only) -->
                 <BaseButton 
                   @click="saveCommSettings"
                   :disabled="loading"
                   variant="secondary"
                   size="icon"
                   square
                   :loading="loading"
                   title="AYARLARI KAYDET"
                 >
                   <template #icon><Save class="w-4 h-4" /></template>
                 </BaseButton>

                 <!-- Close Button -->
                 <BaseButton 
                   variant="dark" 
                   size="icon" 
                   square 
                   @click="selectedCommBranch = null" 
                   title="KAPAT"
                 >
                   <template #icon><X class="w-4 h-4" /></template>
                 </BaseButton>
               </div>
            </BaseActionFooter>
         </template>

         <!-- Empty State -->
         <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-slate-600 shadow-inner">
            <div class="relative">
               <BellRing class="w-24 h-24 mb-6 opacity-10 animate-pulse" />
               <MessageSquare class="w-8 h-8 absolute -top-2 -right-2 text-indigo-500 opacity-20" />
            </div>
            <p class="text-sm font-black tracking-[0.3em] opacity-40">Yönetilecek Şubeyi Seçin</p>
            <p class="text-[0.6rem] font-bold tracking-widest mt-2 opacity-20">Lütfen Sol Listeden Bir Seçim Yapın</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { 
  Building2, MessageSquare, Mail, Award, Monitor, Megaphone, 
  Filter, Users, Info, Send, Plus, Search, X, BellRing, Save, Loader2, Zap, ArrowLeft
} from 'lucide-vue-next'
import BaseInput from '../base/BaseInput.vue'
import BaseGlobalSelector from '../base/BaseGlobalSelector.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import BaseButton from '../base/BaseButton.vue'

// Services & Composables
import { companyService } from '../../services/admin/companyService'
import { branchService } from '../../services/admin/branchService'
import { memberService } from '../../services/member/memberService'
import { communicationService } from '../../services/admin/communicationService'
import { useAlerts } from '../../utils/alerts'

const auth = useAuthStore()
const router = useRouter()
const { toast, error: showAlertError, confirm: showAlertConfirm, success: showAlertSuccess } = useAlerts()
const loading = ref(false)
const branches = ref([])
const companies = ref([])
const selectedCommBranch = ref(null)
const branchCommSearchQuery = ref('')
const broadcastMessage = ref('')
const branchMembers = ref([])
const broadcastFilters = ref({
   lessonType: '',
   memberIds: []
})

const communicationForm = ref({
  isWhatsAppEnabled: true,
  isEmailEnabled: true,
  isBirthdayMessageEnabled: true,
  birthdayMessageTemplate: '',
  whatsappHeaderCompanyId: '',
  whatsappHeaderBranchId: '',
  notificationSystemMode: 'WHATSAPP',
  // SMTP
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSecure: true,
  smtpFromEmail: '',
  // SMS
  smsProvider: 'NETGSM',
  smsUser: '',
  smsPass: '',
  smsHeader: '',
  // Telegram
  isTelegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: ''
})

// Global Selection State
const globalSelection = ref({ 
  companyId: auth.user?.companyId || '', 
  branchId: auth.user?.branchId || '', 
  remember: false 
})

const isSuperMaster = computed(() => {
  const user = auth.user;
  if (!user) return false;
  return user.username?.toLowerCase() === 'super_master' || 
         user.role?.toUpperCase() === 'SUPER_MASTER';
});

const fetchBranches = async () => {
  try {
    branches.value = await branchService.getAll()
  } catch (err) {
    console.error('Şubeler yüklenemedi:', err)
  }
}

const fetchCompanies = async () => {
  try {
    companies.value = await companyService.getAll()
  } catch (err) {
    console.error('Şirketler yüklenemedi:', err)
  }
}

const allBranches = computed(() => {
  if (!branches.value || !Array.isArray(branches.value)) return [];
  return branches.value.map(br => ({
    ...br,
    company: br.Company || br.company || { name: 'SİSTEM' }
  }));
});

const filteredBranchListComm = computed(() => {
  let list = allBranches.value;
  if (!isSuperMaster.value) {
    const myBranchId = auth.user?.branchId;
    list = list.filter(b => b.id === myBranchId);
  }
  if (!branchCommSearchQuery.value) return list;
  const q = branchCommSearchQuery.value.toLowerCase();
  return list.filter(b => 
    b.name?.toLowerCase().includes(q) ||
    b.company?.name?.toLowerCase().includes(q)
  );
});

const selectCommBranch = async (branch) => {
  selectedCommBranch.value = branch
  communicationForm.value = {
    isWhatsAppEnabled: branch.isWhatsAppEnabled !== false,
    isEmailEnabled: branch.isEmailEnabled !== false,
    isBirthdayMessageEnabled: branch.isBirthdayMessageEnabled !== false,
    birthdayMessageTemplate: branch.birthdayMessageTemplate || '',
    whatsappHeaderCompanyId: branch.whatsappHeaderCompanyId || '',
    whatsappHeaderBranchId: branch.whatsappHeaderBranchId || '',
    notificationSystemMode: branch.notificationSystemMode || 'WHATSAPP',
    smtpHost: branch.smtpHost || 'smtp.gmail.com',
    smtpPort: branch.smtpPort || 587,
    smtpUser: branch.smtpUser || '',
    smtpPass: branch.smtpPass || '',
    smtpSecure: branch.smtpSecure !== false,
    smtpFromEmail: branch.smtpFromEmail || '',
    smsProvider: branch.smsProvider || 'NETGSM',
    smsUser: branch.smsUser || '',
    smsPass: branch.smsPass || '',
    smsHeader: branch.smsHeader || '',
    isTelegramEnabled: branch.isTelegramEnabled === true,
    telegramBotToken: branch.telegramBotToken || '',
    telegramChatId: branch.telegramChatId || ''
  }
  
  broadcastFilters.value = { lessonType: '', memberIds: [] }
  broadcastMessage.value = ''
  
  try {
     branchMembers.value = await memberService.getAll({ branchId: branch.id });
  } catch (err) {
     console.error('Şube üyeleri yüklenemedi:', err);
     branchMembers.value = [];
  }
}

const onGlobalSelectionChange = (selection) => {
  globalSelection.value = selection
  fetchBranches()
  fetchCompanies()
  
  if (selection && selection.branchId) {
     const branch = allBranches.value.find(b => b.id === selection.branchId)
     if (branch) selectCommBranch(branch)
  }
}

const saveCommSettings = async () => {
  if (!selectedCommBranch.value) return
  
  loading.value = true
  try {
    const branchId = selectedCommBranch.value.id
    await branchService.update(branchId, {
      ...communicationForm.value,
      birthdayMessageTemplate: communicationForm.value.birthdayMessageTemplate || null,
      whatsappHeaderCompanyId: communicationForm.value.whatsappHeaderCompanyId || null,
      whatsappHeaderBranchId: communicationForm.value.whatsappHeaderBranchId || null
    })
    
    await fetchBranches()

    const freshBranch = allBranches.value.find(b => b.id === branchId)
    if (freshBranch) {
      selectedCommBranch.value = freshBranch
    }

    toast('İletişim ayarlarınız güncellendi.')
  } catch (err) {
    console.error('İletişim ayarları kaydedilemedi:', err)
    showAlertError('HATA', 'Ayarlar kaydedilirken bir hata oluştu.')
  } finally {
    loading.value = false
  }
}

const sendBroadcastMessage = async () => {
  if (!selectedCommBranch.value || !broadcastMessage.value) return
  
  const isConfirmed = await showAlertConfirm(
    'TOPLU DUYURU GÖNDERİLSİN Mİ?',
    broadcastFilters.value.memberIds.length > 0 
      ? `Seçtiğiniz ${broadcastFilters.value.memberIds.length} üyeye bu mesaj iletilecektir.`
      : `"${selectedCommBranch.value.name}" şubesindeki belirlenen kriterlere uyan TÜM üyelere bu mesaj iletilecektir.`
  )

  if (!isConfirmed) return
  
  loading.value = true
  try {
    const res = await communicationService.sendBroadcastWhatsApp({
      branchId: selectedCommBranch.value.id,
      message: broadcastMessage.value,
      lessonType: broadcastFilters.value.lessonType || null,
      memberIds: broadcastFilters.value.memberIds.length > 0 ? broadcastFilters.value.memberIds : null
    })
    
    showAlertSuccess('BAŞARILI', res.message || 'Duyuru başarıyla gönderildi.')
    broadcastMessage.value = ''
  } catch (err) {
    console.error('Broadcast error:', err)
    showAlertError('GÖNDERİM HATASI', err.response?.data?.error || 'Duyuru gönderilemedi. WhatsApp bağlantısını kontrol edin.')
  } finally {
    loading.value = false
  }
}

const testTelegramConnection = async () => {
  if (!communicationForm.value.telegramBotToken || !communicationForm.value.telegramChatId) return
  loading.value = true
  try {
    await communicationService.testTelegram({
      token: communicationForm.value.telegramBotToken,
      chatId: communicationForm.value.telegramChatId,
      message: 'BehaGym Pro Telegram Bağlantı Testi Başarılı! 🚀'
    })
    toast('Test mesajı gönderildi.')
  } catch (err) {
    showAlertError('BAĞLANTI HATASI', 'Bilgileri kontrol edin.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!auth.isBehaAdmin) {
    onGlobalSelectionChange(globalSelection.value)
  } else {
    fetchBranches()
    fetchCompanies()
  }
})
</script>

<style scoped>
.custom-red-scrollbar::-webkit-scrollbar {
  height: 3px;
}
.custom-red-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.2);
}
.custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.4);
}
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
</style>
