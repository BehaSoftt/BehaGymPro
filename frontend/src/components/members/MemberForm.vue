<template>
  <div class="absolute inset-0 z-50 flex flex-col overflow-hidden bg-slate-800 border border-slate-700/50 shadow-2xl">
    <form id="memberForm" @submit.prevent="$emit('save')" class="flex-1 flex flex-col overflow-hidden relative">
      <div class="overflow-y-auto flex-1 p-2 space-y-8 custom-scrollbar bg-slate-800/30">

        <!-- Profile Type & Specialty Selection (Primary Configuration) -->
        <div class="mb-8 p-6 bg-slate-900/60 border border-slate-700/50 shadow-2xl relative overflow-hidden group space-y-4">
           <div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <component :is="localMember.profileType === 'MEMBER' ? UserPlus : (localMember.profileType === 'INSTRUCTOR' ? GraduationCap : Users)" class="w-24 h-24" />
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <BaseInput 
                v-model="localMember.profileType"
                type="select"
                label="KAYIT TİPİ"
                :disabled="!!editingId"
                required
              >
                <template #icon>
                   <component :is="localMember.profileType === 'MEMBER' ? UserPlus : (localMember.profileType === 'INSTRUCTOR' ? GraduationCap : Users)" 
                              class="w-4 h-4" 
                              :class="localMember.profileType === 'MEMBER' ? 'text-emerald-400' : (localMember.profileType === 'INSTRUCTOR' ? 'text-indigo-400' : 'text-amber-400')" />
                </template>
                <option value="MEMBER">ÜYE / SPORCU</option>
                <option value="INSTRUCTOR">EĞİTMEN / ANTRENÖR</option>
                <option value="PERSONNEL">PERSONEL / OFİS</option>
                <option value="USER">KULLANICI / SİSTEM</option>
              </BaseInput>

              <BaseInput 
                v-if="localMember.profileType === 'MEMBER'"
                v-model="localMember.specialtyId"
                type="select"
                label="ANA SPOR BRANŞI"
                class="animate-in fade-in slide-in-from-top-2 duration-300"
              >
                 <template #icon><Activity class="w-4 h-4 text-rose-400" /></template>
                 <option value="">BRANŞ SEÇİLMEMİŞ (GENEL)</option>
                 <optgroup v-if="groupedSpecialties.SAHA?.length" label="[ TESİS: SAHA / KORT ]">
                    <option v-for="spec in groupedSpecialties.SAHA" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                 </optgroup>
                 <optgroup v-if="groupedSpecialties.SALON?.length" label="[ TESİS: SALON ]">
                    <option v-for="spec in groupedSpecialties.SALON" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                 </optgroup>
                 <optgroup v-if="groupedSpecialties.HAVUZ?.length" label="[ TESİS: HAVUZ ]">
                    <option v-for="spec in groupedSpecialties.HAVUZ" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                 </optgroup>
                 <optgroup v-if="groupedSpecialties.DIGER?.length" label="[ TESİS: DİĞER ]">
                    <option v-for="spec in groupedSpecialties.DIGER" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
                 </optgroup>
              </BaseInput>
           </div>

           <div v-if="editingId" class="mt-1">
              <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">DÜZENLEME MODU - KAYIT TİPİ DEĞİŞTİRİLEMEZ</span>
           </div>

           <div class="mt-3 flex items-center gap-2">
              <div class="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                 <div class="h-full transition-all duration-500" 
                      :class="localMember.profileType === 'MEMBER' ? 'w-1/3 bg-emerald-500' : (localMember.profileType === 'INSTRUCTOR' ? 'w-2/3 bg-indigo-500' : 'w-full bg-amber-500')"></div>
              </div>
              <span class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">TEMEL YAPILANDIRMA</span>
           </div>
        </div>

        <!-- Section: Access Key & QR -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <QrCode class="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">Giriş Kartı & QR Tanımlama</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-8 gap-6 items-center p-4 bg-slate-900/40 border border-slate-700 shadow-xl">
             <div class="md:col-span-4 space-y-4">
                <BaseInput 
                  :modelValue="localMember.memberCode"
                  @update:modelValue="handleCodeInput"
                  @keydown.enter.prevent
                  label="ÜYE NO / KART ID (Giriş Anahtarı)"
                  placeholder="MAKS. 15 RAKAM..."
                  maxlength="15"
                  required
                >
                  <template #icon><QrCode class="w-4 h-4" /></template>
                </BaseInput>
                <div class="p-3 bg-slate-800/30 border border-slate-700">
                   <p class="text-[0.6rem] text-slate-500 font-medium tracking-widest leading-relaxed">
                      Fiziksel Mifare kart kullanıyorsanız imleç buradayken kartı okutun. Manuel kod giriyorsanız benzersiz olduğundan emin olun.
                   </p>
                </div>
             </div>

             <!-- QR Code (Base Component) -->
             <div class="md:col-span-2">
               <BaseQRCode 
                 v-if="localMember.memberCode && localMember.memberCode !== '0'"
                 :value="localMember.memberCode"
                 title="GİRİŞ ANAHTARI"
                 subtitle="MOBİL UYGULAMA İÇİN OKUTUN"
                 :size="150"
               />
               <div v-else class="h-full flex flex-col items-center justify-center p-6 border border-dashed border-slate-700 opacity-20">
                  <QrCode class="w-12 h-12 mb-2" />
                  <span class="text-[0.5rem] font-black">KOD BEKLENİYOR</span>
               </div>
             </div>

             <!-- Profile Photo (Base Component) -->
             <div class="md:col-span-2 flex flex-col items-center">
                <BaseImageUpload 
                  v-model="localMember.photo"
                  @change="$emit('photoUpload', $event)"
                />
                <p class="text-[0.5rem] text-slate-500 mt-2 font-black tracking-widest">PROFİL FOTO</p>
             </div>
          </div>
        </div>

        <!-- Section: Identity -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <UserCheck class="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">Temel Bilgiler</span>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <BaseInput 
              v-model="localMember.branchId"
              type="select"
              label="Şube"
              required
            >
              <option value="" disabled>ŞUBE SEÇİNİZ</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
            </BaseInput>

            <BaseInput 
              v-model="localMember.fullName"
              label="Ad Soyad"
              placeholder="AD SOYAD..."
              required
            />

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput 
              v-model="localMember.birthDate"
              type="date"
              label="Doğum Tarihi"
              required
            />
            <BaseInput 
              :modelValue="calculatedAge || '-'"
              label="Yaş"
              disabled
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput 
              v-model="localMember.gender"
              type="select"
              label="Cinsiyet"
              required
            >
              <option value="" disabled>Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="DİĞER">DİĞER</option>
            </BaseInput>

            <BaseInput 
              v-model="localMember.bloodGroup"
              type="select"
              label="Kan Grubu"
              required
            >
              <option value="" disabled>Seçiniz</option>
              <option v-for="bg in ['0 RH+', '0 RH-', 'A RH+', 'A RH-', 'B RH+', 'B RH-', 'AB RH+', 'AB RH-']" :key="bg" :value="bg">{{ bg }}</option>
            </BaseInput>
          </div>
        </div>

        <!-- Section: Dynamic Sport Profile (Generic Extension) -->
        <div v-if="localMember.profileType === 'MEMBER' && localMember.specialtyId" class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-emerald-500/40 bg-emerald-500/5">
            <Trophy class="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Sportif Teknik Detaylar ({{ getSelectedSpecialtyName }})</span>
          </div>

          <!-- Branşa Özel Alanlar (Dinamik Bileşen) -->
          <div v-if="!isSalon">
            <TechnicalSportFields 
              v-model="activeSportProfile"
              :specialty="selectedSpecialty"
            />
          </div>
          
          <div v-else>
            <FitnessSportFields v-model="localMember" />
          </div>

        </div>

        <!-- Section: Instructor Details (Only for Instructors) -->
        <div v-if="localMember.profileType === 'INSTRUCTOR'" class="space-y-4 animate-in fade-in slide-in-from-top duration-500">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-indigo-500/40 bg-indigo-500/5">
            <GraduationCap class="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest uppercase">Eğitmen Uzmanlık & Profil Bilgileri</span>
          </div>

          <div class="bg-slate-900/40 p-4 border border-slate-700/50 space-y-6">
            <!-- Specialties Selection -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[0.65rem] font-black text-indigo-400 uppercase tracking-widest">UZMANLIK BRANŞLARI</span>
                <span class="text-[0.6rem] text-slate-500">{{ localMember.specialties?.length || 0 }} SEÇİLDİ</span>
              </div>
              
              <div class="space-y-4 max-h-60 overflow-y-auto custom-scrollbar p-3 bg-slate-950/50 border border-slate-800 focus-within:border-indigo-500/50 transition-colors">
                <div v-for="(group, type) in groupedSpecialties" :key="type">
                  <div v-if="group.length" class="mb-3">
                    <div class="flex items-center gap-2 mb-2 px-1">
                      <div class="w-1 h-3 bg-indigo-500"></div>
                      <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{{ type === 'SALON' ? 'SALON / DOJO' : (type === 'SAHA' ? 'SAHA / KORT' : (type === 'HAVUZ' ? 'HAVUZ' : 'DİĞER')) }}</span>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <div v-for="s in group" :key="s.id" 
                           class="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all group/item">
                        <span class="text-[0.65rem] font-bold text-slate-400 group-hover/item:text-indigo-400 uppercase truncate pr-2">{{ s.name }}</span>
                        <label :for="'spec-' + s.id" class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input 
                            :id="'spec-' + s.id"
                            type="checkbox" 
                            :value="s.id" 
                            v-model="localMember.specialties"
                            class="sr-only peer"
                          />
                          <div class="w-8 h-4 bg-slate-800 peer-checked:bg-indigo-600 transition-all duration-300 relative border border-slate-700">
                            <div class="absolute top-0 left-0 bg-slate-500 h-full w-4 transition-all peer-checked:translate-x-4 peer-checked:bg-white"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BaseInput 
                v-model="localMember.level"
                type="select"
                label="KIDEM SEVİYESİ"
              >
                <option value="STAJYER">STAJYER EĞİTMEN</option>
                <option value="UZMAN">UZMAN EĞİTMEN</option>
                <option value="PRO">PROFESYONEL EĞİTMEN</option>
              </BaseInput>

              <BaseInput 
                v-model="localMember.basePrice"
                type="number"
                label="SEANS ÜCRETİ (₺)"
                placeholder="0"
              />

              <BaseInput 
                v-model="localMember.commissionRate"
                type="number"
                step="0.01"
                label="HAKEDİŞ ORANI (0-1)"
                placeholder="0.40"
              />
            </div>

            <BaseInput 
              v-model="localMember.bio"
              type="textarea"
              label="EĞİTMEN BİYOGRAFİSİ & ÖZGEÇMİŞ"
              placeholder="DENEYİM, SERTİFİKALAR VE EĞİTİM BİLGİLERİ..."
              :rows="3"
            />
          </div>
        </div>

        <!-- Section: Belt & Discipline (Show only if branch has belts) -->
        <div v-if="localMember.profileType === 'MEMBER' && (isBeltSpecialty || localMember.beltBranchId)" class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <History class="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">Kuşak & Derece Bilgileri</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput 
              v-model="localMember.beltBranchId"
              type="select"
              label="Kuşak Branşı"
            >
              <option value="">BRANŞ SEÇİNİZ</option>
              <option v-for="spec in beltSpecialties" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
            </BaseInput>

            <div class="flex flex-col gap-2">
              <BaseInput 
                v-model="localMember.currentBelt"
                type="select"
                label="Mevcut Kuşak"
              >
                <option :value="null">SEÇİNİZ</option>
                <option v-for="belt in getAvailableBelts(localMember.beltBranchId)" :key="belt" :value="belt">{{ belt }}</option>
              </BaseInput>
              
              <!-- Belt Preview Scale -->
              <div v-if="localMember.currentBelt" class="mt-[-0.5rem] flex items-center gap-3 p-2.5 bg-slate-950/50 border border-slate-700/50 animate-in fade-in slide-in-from-top-1">
                 <div class="h-4 w-full rounded-full border border-slate-800 relative overflow-hidden shadow-inner" :style="getBeltStyle(localMember.currentBelt)">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                 </div>
                 <span class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{{ localMember.currentBelt }}</span>
              </div>
            </div>
          </div>

          <div v-if="localMember.currentBelt" class="grid grid-cols-1 gap-4">
            <BaseInput 
              v-model="localMember.lastBeltDate"
              type="date"
              label="Son Kuşak Alış Tarihi"
            />
            <p class="text-[0.6rem] text-slate-500 mt-[-0.5rem] tracking-widest ml-1">BEKLEME SÜRESİ HESABI İÇİN GEREKLİDİR.</p>
          </div>
        </div>

        <!-- Section: Contact & Physical -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <Phone class="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">İletişim & Sağlık</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput 
              :modelValue="localMember.phone"
              @update:modelValue="(val) => handlePhoneInput('phone', val)"
              label="Telefon"
              placeholder="0 (5xx) xxx xx xx"
              maxlength="17"
              required
            />
            <BaseInput 
              :modelValue="localMember.emergencyPhone"
              @update:modelValue="(val) => handlePhoneInput('emergencyPhone', val)"
              label="Acil Tel"
              placeholder="YARDIMCI NO"
              maxlength="17"
            />
          </div>
            <BaseInput 
              v-model="localMember.email"
              type="email"
              label="E-Mail"
              placeholder="ornek@email.com"
              maxlength="100"
            />

            <!-- Address Fields -->
            <div class="grid grid-cols-2 gap-4">
              <BaseInput 
                v-model="localMember.city"
                label="İl"
                placeholder="ŞEHİR..."
                maxlength="50"
              />
              <BaseInput 
                v-model="localMember.district"
                label="İlçe"
                placeholder="İLÇE..."
                maxlength="50"
              />
            </div>
            <BaseInput 
              v-model="localMember.address"
              type="textarea"
              label="Açık Adres"
              placeholder="MAHALLE, SOKAK, BİNA NO, DAİRE..."
              :rows="2"
            />

          <!-- Relocated Notes: Always show for all members -->
          <div class="grid grid-cols-1 gap-4">
             <BaseInput 
                v-model="localMember.fitnessNotes"
                type="textarea"
                label="Teknik Notlar / Gözlemler (Vuruş tekniği, kondisyon durumu vb.)"
                placeholder="ÜYENİN BAŞLANGIÇ SEVİYESİ VE TEKNİK DURUMU HAKKINDA NOTLAR..."
                :rows="2"
              />
              <BaseInput 
                v-model="localMember.healthNotes"
                type="textarea"
                label="Özel Sağlık Durumu / Geçmiş Sakatlıklar"
                placeholder="VARSA DİKKAT EDİLMESİ GEREKEN SAĞLIK DURUMLARI..."
                :rows="2"
              />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput 
              :modelValue="localMember.height"
              type="text"
              label="Boy (cm)"
              placeholder="175"
              maxlength="3"
              @update:modelValue="val => localMember = { ...localMember, height: inputMasks.numeric(val, 3) }"
              :required="localMember.profileType === 'MEMBER'"
            />
            <BaseInput 
              :modelValue="localMember.weight"
              type="text"
              label="Kilo (kg)"
              placeholder="75"
              maxlength="3"
              @update:modelValue="val => localMember = { ...localMember, weight: inputMasks.numeric(val, 3) }"
              :required="localMember.profileType === 'MEMBER'"
            />
          </div>
        </div>


        <!-- Section: Membership Details -->
        <div v-if="localMember.profileType === 'MEMBER'" class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <LayoutGrid class="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">Ders & Tesis Erişimi</span>
          </div>

          <!-- Üyelik Paketi & Bitiş Tarihi -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/40 border border-emerald-500/30 shadow-xl">
             <BaseInput 
               :modelValue="localMember.packageId"
               @update:modelValue="handlePackageChange"
               type="select"
               label="ÜYELİK PAKETİ SEÇİMİ"
             >
               <template #icon><CreditCard class="w-4 h-4 text-emerald-400" /></template>
               <option value="">PAKET SEÇİLMEDİ (STANDART)</option>
               <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id">
                 {{ pkg.name }} — ₺{{ pkg.price }} {{ pkg.durationMonths ? `(${pkg.durationMonths} Ay)` : (pkg.sessionCount ? `(${pkg.sessionCount} Ders)` : '') }}
               </option>
             </BaseInput>

             <BaseInput 
               v-model="localMember.expiryDate"
               type="date"
               label="ÜYELİK BİTİŞ TARİHİ"
             />
          </div>

          <!-- Ders Erişimi Section -->
          <div class="space-y-4 p-4 bg-slate-900/40 border border-indigo-500/20">
            <label class="block text-[0.75rem] font-medium text-slate-400 uppercase tracking-widest mb-3">Ders Erişimi (Çoklu Seçim)</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <BaseSwitch 
                :modelValue="localMember.lessonTypes?.includes('GENERAL')"
                @update:modelValue="(val) => {
                  const currentTypes = localMember.lessonTypes || []
                  let nextTypes = [...currentTypes]
                  if (val) {
                    if (!nextTypes.includes('GENERAL')) nextTypes.push('GENERAL')
                  } else {
                    nextTypes = nextTypes.filter(t => t !== 'GENERAL')
                  }
                  localMember = { ...localMember, lessonTypes: nextTypes }
                }"
                label="Genel Üyelik"
                containerClass="px-4 py-3 bg-slate-950 border border-slate-700 hover:border-blue-500 transition-all"
              />
              
              <BaseSwitch 
                :modelValue="localMember.lessonTypes?.includes('PRIVATE')"
                @update:modelValue="(val) => {
                  const currentTypes = localMember.lessonTypes || []
                  let nextTypes = [...currentTypes]
                  if (val) {
                    if (!nextTypes.includes('PRIVATE')) nextTypes.push('PRIVATE')
                  } else {
                    nextTypes = nextTypes.filter(t => t !== 'PRIVATE')
                  }
                  localMember = { ...localMember, lessonTypes: nextTypes }
                }"
                label="Özel Ders"
                containerClass="px-4 py-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 transition-all"
              />

              <BaseSwitch 
                :modelValue="localMember.lessonTypes?.includes('GROUP')"
                @update:modelValue="(val) => {
                  const currentTypes = localMember.lessonTypes || []
                  let nextTypes = [...currentTypes]
                  if (val) {
                    if (!nextTypes.includes('GROUP')) nextTypes.push('GROUP')
                  } else {
                    nextTypes = nextTypes.filter(t => t !== 'GROUP')
                  }
                  localMember = { ...localMember, lessonTypes: nextTypes }
                }"
                label="Grup Dersi"
                containerClass="px-4 py-3 bg-slate-950 border border-slate-800 hover:border-orange-500 transition-all"
              />
            </div>
          </div>

          <!-- Relocated Team / Group Assignment: Only show if 'GROUP' lesson type is selected -->
          <div v-if="localMember.lessonTypes?.includes('GROUP')" class="mt-2 p-5 bg-slate-950/40 border border-orange-500/20 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div class="grid grid-cols-1 gap-4">
              <BaseInput 
                v-model="localMember.sportGroupId"
                type="select"
                label="TAKIM / GRUP SEÇİMİ (ZORUNLU DEĞİL)"
                :loading="loadingGroups"
              >
                <template #icon><Users class="w-4 h-4 text-orange-400" /></template>
                <option value="">GRUP / TAKIM SEÇİLMEMİŞ</option>
                <option v-for="group in availableGroups" :key="group.id" :value="group.id">
                  {{ group.name }} {{ group.category ? `(${group.category})` : '' }} [{{ group.minAge }}-{{ group.maxAge }} YAŞ]
                </option>
              </BaseInput>
              
              <!-- Age Validation Message -->
              <div v-if="ageWarning" class="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 animate-in zoom-in duration-300">
                 <X class="w-4 h-4" />
                 <span class="text-[0.65rem] font-black uppercase tracking-widest">DİKKAT: ÜYE YAŞI ({{ calculatedAge }}) BU GRUBUN ARALIĞINDA ({{ selectedGroupAgeLabel }}) DEĞİLDİR!</span>
              </div>
              <div v-else-if="localMember.sportGroupId" class="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-in zoom-in duration-300">
                 <Check class="w-4 h-4" />
                 <span class="text-[0.65rem] font-black uppercase tracking-widest">ÜYE YAŞI BU GRUP İÇİN UYGUNDUR.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: System & Settings (Visible for all profile types) -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 py-3 px-4 border-b border-rose-600/40">
            <Settings class="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span class="text-[0.85rem] font-medium text-slate-200 tracking-widest">Sistem ve İletişim Ayarları</span>
          </div>

          <BaseInput 
            v-model="localMember.registrationDate"
            type="date"
            label="SİSTEME KAYIT TARİHİ"
          />

          <BaseInput 
            v-model="localMember.notificationPreference"
            type="select"
            label="İletişim / Bildirim Kanalı"
          >
            <option value="BOTH">Hem WhatsApp Hem E-Posta</option>
            <option value="WHATSAPP">Sadece WhatsApp</option>
            <option value="EMAIL">Sadece E-Posta</option>
            <option value="NONE">Sistemsel İletilere Kapat</option>
          </BaseInput>
          <p class="text-[0.6rem] text-slate-500 mt-[-0.5rem] uppercase tracking-widest ml-1 leading-relaxed">BU AYAR ŞUBE GENEL AYARI AÇIK OLSA BİLE ÜYEYE ÖZEL OLARAK UYGULANIR.</p>

          <div class="pt-4 border-t border-slate-700/50">
            <BaseSwitch 
              v-model="localMember.isActive"
              label="PROFİL AKTİF"
              subtitle="Sisteme giriş ve işlem yetkisini kontrol eder"
              containerClass="p-4 bg-slate-900/50 border border-slate-800"
            />
          </div>
        </div>

        <!-- Özel Ders Bilgilendirme Notu -->
        <div v-if="localMember.lessonTypes?.includes('PRIVATE')" class="p-4 bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3">
          <Info class="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-[0.75rem] font-medium text-indigo-400 tracking-widest">Özel Ders Paketleri</p>
            <p class="text-[0.65rem] text-slate-400 leading-relaxed">
              Özel ders paketlerini (branş, eğitmen, seans sayısı, ücret) <router-link to="/private-lessons" class="text-indigo-400 hover:text-indigo-300 underline">Özel Dersler</router-link> sayfasından yönetebilirsiniz. Bir üye birden fazla özel ders paketi alabilir.
            </p>
          </div>
        </div>
      </div>
    </form>

    <BaseActionFooter>
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="VAZGEÇ">
          <template #icon><X class="w-5 h-5" /></template>
        </BaseButton>
        
        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <BaseButton 
          v-if="editingId && localMember.phone"
          variant="secondary" 
          size="icon" square
          @click="$emit('sendWhatsApp')" 
          title="WP MESAJ"
        >
          <template #icon><Send class="w-5 h-5" /></template>
        </BaseButton>

        <BaseButton 
          type="submit" 
          form="memberForm" 
          :variant="editingId ? 'warning' : 'secondary'"
          size="icon" square
          :loading="loading"
          :title="editingId ? 'GÜNCELLE' : 'KAYDET'"
        >
          <template #icon>
            <Save v-if="editingId" class="w-5 h-5" />
            <Check v-else class="w-5 h-5" />
          </template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, toRefs } from 'vue'
import axios from 'axios'
import { 
  Users, UserPlus, X, QrCode, UserCheck, GraduationCap, 
  Phone, History, Activity, LayoutGrid, Settings, Info,
  Send, Save, Check, Trophy, ShieldCheck, CreditCard
} from 'lucide-vue-next'

// Base Components
import BaseBadge from '../base/BaseBadge.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseImageUpload from '../base/BaseImageUpload.vue'
import BaseQRCode from '../base/BaseQRCode.vue'
import BaseSwitch from '../base/BaseSwitch.vue'
import TechnicalSportFields from './specialty-controllers/TechnicalSportFields.vue'
import FitnessSportFields from './specialty-controllers/FitnessSportFields.vue'
import Storage from '../../utils/Storage'
import { inputMasks } from '../../utils/inputMasks'

const props = defineProps({
  modelValue: { type: Object, required: true },
  editingId: { type: [String, Number], default: null },
  loading: { type: Boolean, default: false },
  branches: { type: Array, default: () => [] },
  specialties: { type: Array, default: () => [] },
  packages: { type: Array, default: () => [] }
})

const { modelValue, editingId, loading, branches, specialties, packages } = toRefs(props)

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'photoUpload', 'sendWhatsApp'])

// Local proxy for modelValue to allow easy updates
const localMember = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Computeds for form logic
const groupedSpecialties = computed(() => {
  const groups = { SALON: [], SAHA: [], HAVUZ: [], DIGER: [] }
  specialties.value.forEach(s => {
    const type = s.facilityType || 'SALON'
    if (!groups[type]) groups[type] = []
    groups[type].push(s)
  })
  return groups
})

const beltSpecialties = computed(() => specialties.value.filter(s => s.hasBelts))
const generalSpecialties = computed(() => specialties.value.filter(s => !s.hasBelts))

const availablePackages = computed(() => {
  if (!packages.value || !Array.isArray(packages.value)) return []
  if (!localMember.value.branchId) return packages.value
  return packages.value.filter(p => !p.branchId || p.branchId === localMember.value.branchId)
})

const handlePackageChange = (pkgId) => {
  const pkg = packages.value?.find(p => p.id === pkgId)
  if (pkg) {
    let expDate = localMember.value.expiryDate
    if (pkg.durationMonths) {
      const reg = localMember.value.registrationDate ? new Date(localMember.value.registrationDate) : new Date()
      reg.setMonth(reg.getMonth() + parseInt(pkg.durationMonths))
      expDate = reg.toISOString().split('T')[0]
    }
    localMember.value = {
      ...localMember.value,
      packageId: pkgId,
      membershipType: pkg.name || 'STANDART',
      specialtyId: pkg.specialtyId || localMember.value.specialtyId,
      expiryDate: expDate
    }
  } else {
    localMember.value = {
      ...localMember.value,
      packageId: ''
    }
  }
}

const calculatedAge = computed(() => {
  if (!localMember.value.birthDate) return null
  const today = new Date()
  const bDate = new Date(localMember.value.birthDate)
  let age = today.getFullYear() - bDate.getFullYear()
  const m = today.getMonth() - bDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--
  return age
})

const selectedSpecialty = computed(() => specialties.value.find(s => s.id === localMember.value.specialtyId))
const getSelectedSpecialtyName = computed(() => selectedSpecialty.value ? selectedSpecialty.value.name : '')

const isBeltSpecialty = computed(() => selectedSpecialty.value?.hasBelts)
const isSalon = computed(() => selectedSpecialty.value?.facilityType === 'SALON')

const currentSelectedGroup = computed(() => availableGroups.value.find(g => g.id === localMember.value.sportGroupId))
const selectedGroupAgeLabel = computed(() => currentSelectedGroup.value ? `${currentSelectedGroup.value.minAge}-${currentSelectedGroup.value.maxAge}` : '')

const ageWarning = computed(() => {
    if (!currentSelectedGroup.value || calculatedAge.value === null) return false
    const { minAge, maxAge } = currentSelectedGroup.value
    return calculatedAge.value < minAge || calculatedAge.value > maxAge
})

// Computed to handle the active sport profile within localized structure
const activeSportProfile = computed({
  get: () => {
    const profiles = localMember.value.sportProfiles || []
    return profiles.find(p => p.specialtyId === localMember.value.specialtyId) || { specialtyId: localMember.value.specialtyId, level: 'BAŞLANGIÇ', extraData: {} }
  },
  set: (val) => {
    const profiles = [...(localMember.value.sportProfiles || [])]
    const idx = profiles.findIndex(p => p.specialtyId === localMember.value.specialtyId)
    if (idx !== -1) {
      profiles[idx] = val
    } else {
      profiles.push(val)
    }
    localMember.value = { ...localMember.value, sportProfiles: profiles }
  }
})

// Specialty ve ProfileType değişimlerinde sportProfile'ı otomatik ilklendir
watch([() => localMember.value.specialtyId, () => localMember.value.profileType], ([newId, type]) => {
  if (newId && type === 'MEMBER') {
    const profiles = [...(localMember.value.sportProfiles || [])]
    if (!profiles.find(p => p.specialtyId === newId)) {
      profiles.push({ specialtyId: newId, level: 'BAŞLANGIÇ', extraData: {} })
      localMember.value = { ...localMember.value, sportProfiles: profiles }
    }
  }
}, { immediate: true })

// --- Sport Group Management ---
const availableGroups = ref([])
const loadingGroups = ref(false)

// Grup Dersi seçeneği kapatıldığında grup atamasını da sıfırla
watch(() => localMember.value.lessonTypes, (newTypes) => {
    if (!newTypes?.includes('GROUP') && localMember.value.sportGroupId) {
        localMember.value = { ...localMember.value, sportGroupId: '' }
    }
})

const fetchGroups = async (specId) => {
  if (!specId) {
    availableGroups.value = []
    return
  }
  loadingGroups.value = true
  try {
    const token = Storage.getItem('token')
    const response = await axios.get(`http://${window.location.hostname}:5000/api/sport-groups`, {
      params: { specialtyId: specId },
      headers: { Authorization: `Bearer ${token}` }
    })
    availableGroups.value = response.data
  } catch (err) {
    console.error('Gruplar getirilemedi:', err)
  } finally {
    loadingGroups.value = false
  }
}

watch(() => localMember.value.specialtyId, (newId) => {
  fetchGroups(newId)
})

onMounted(() => {
  if (!localMember.value.lessonTypes) {
    localMember.value = { ...localMember.value, lessonTypes: [] }
  }
  if (!localMember.value.specialties) {
    localMember.value = { ...localMember.value, specialties: [] }
  }
  if (localMember.value.specialtyId) fetchGroups(localMember.value.specialtyId)
})

// Helper functions
const getAvailableBelts = (beltSpecId) => {
  const specId = beltSpecId || localMember.value.specialtyId
  if (!specId) return ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan']
  const spec = specialties.value.find(s => s.id === specId)
  if (spec && spec.belts && spec.belts.length > 0) return spec.belts
  return ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan']
}

const getBeltStyle = (beltName) => {
  const name = beltName || ''
  const colors = {
    'Beyaz': '#ffffff', 'Sarı': '#facc15', 'Yeşil': '#22c55e', 'Mavi': '#2563eb', 
    'Kırmızı': '#dc2626', 'Turuncu': '#fb923c', 'Mor': '#9333ea', 
    'Kahverengi': '#92400e', 'Siyah': '#000000'
  }
  if (name.includes('-')) {
    const parts = name.split('-').map(p => p.trim())
    const c1 = colors[Object.keys(colors).find(k => parts[0].includes(k))] || '#334155'
    const c2 = colors[Object.keys(colors).find(k => parts[1].includes(k))] || '#334155'
    return { background: `linear-gradient(to bottom, ${c1} 50%, ${c2} 50%)` }
  }
  const match = Object.keys(colors).find(k => name.includes(k))
  const color = colors[match] || '#334155'
  return { backgroundColor: color, border: name.includes('Beyaz') ? '1px solid #475569' : 'none' }
}

const handleCodeInput = (val) => {
  localMember.value = { ...props.modelValue, memberCode: inputMasks.numeric(val, 15) }
}

const handlePhoneInput = (key, val) => {
  localMember.value = { ...props.modelValue, [key]: inputMasks.phone(val) }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
