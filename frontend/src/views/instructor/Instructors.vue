<template>
  <div class="h-full flex flex-col overflow-hidden px-2 relative bg-slate-950">

    <!-- Sub Navigation (Actions & Filters) -->
    <!-- Premium Search & Filter -->
    <BaseSearchFilter
      v-if="!showCreateModal && !showEditModal"
      v-model:searchQuery="searchQuery"
      v-model:viewMode="viewMode"
      placeholder="EĞİTMEN ARA (İSİM, KULLANICI ADI, KOD)..."
      accent="indigo"
    >

    </BaseSearchFilter>
    <!-- Main Dynamic Area -->
    <div v-if="!showCreateModal && !showEditModal" class="flex-1 relative overflow-hidden">
      <!-- Grid View -->
      <BaseScroll v-if="viewMode === 'grid'" class="absolute inset-0 pt-2 px-4 pb-20" accent="indigo">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <BaseCard 
            v-for="instructor in filteredInstructors" :key="instructor.id" 
            v-memo="[instructor, selectedInstructors.includes(instructor.id)]"
            :selected="selectedInstructors.includes(instructor.id)"
            :status="instructor.isActive"
            accent="indigo"
            @click="toggleSelection(instructor.id)"
          >
            <!-- 2FA Status Badge (Absolute) -->
            <div v-if="isSuperMaster && instructor.user" class="absolute top-3 right-3 z-10">
              <div :class="instructor.user.isTwoFactorEnabled ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-800/50 border-slate-700'" class="p-1 px-2 border backdrop-blur-sm" @click.stop="toggleInstructor2FA(instructor)">
                <ShieldCheck v-if="instructor.user.isTwoFactorEnabled" class="w-3 h-3" />
                <ShieldOff v-else class="w-3 h-3" />
                <span class="text-[0.5rem] font-bold ml-1">{{ instructor.user.isTwoFactorEnabled ? '2FA' : '-' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-medium text-amber-400 overflow-hidden relative">
                <img v-if="instructor.profilePicture" :src="`http://${serverHost}:5000${instructor.profilePicture}`" class="w-full h-full object-cover" />
                <span v-else>{{ (instructor.displayName || instructor.user?.username || 'E')[0].toUpperCase() }}</span>
              </div>
              <div class="uppercase tracking-tight flex-1 min-w-0">
                <h3 class="text-sm font-black text-slate-50 group-hover:text-indigo-400 transition-colors truncate">{{ instructor.displayName || instructor.user?.username }}</h3>
                <div v-if="instructor.instructorCode" class="text-[0.6rem] text-rose-500 font-black tracking-widest mt-0.5">{{ instructor.instructorCode }}</div>
                <div class="flex items-center gap-2 mt-1.5">
                  <span :class="{
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': instructor.level === 'PRO',
                    'bg-amber-500/10 text-amber-500 border-amber-500/20': instructor.level === 'UZMAN' || !instructor.level,
                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': instructor.level === 'STAJYER'
                  }" class="text-[0.5rem] font-black px-1.5 py-0.5 border uppercase tracking-widest">
                    {{ instructor.level === 'PRO' ? 'PROFESYONEL' : instructor.level === 'STAJYER' ? 'STAJYER' : 'UZMAN' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Specialties -->
            <div v-if="instructor.specialties?.length" class="flex flex-wrap gap-1 py-1 mt-3">
              <span v-for="sId in instructor.specialties" :key="sId" class="text-[0.6rem] bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 uppercase font-black tracking-wider">
                  {{ getSpecialtyName(sId) }}
              </span>
            </div>

            <div class="space-y-3 py-4 border-t border-slate-700/50 mt-4">
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center text-[0.65rem] px-1 font-bold">
                    <span class="text-slate-500 uppercase tracking-widest">DERS ÜCRETİ</span>
                    <span class="text-indigo-400 font-mono">₺{{ instructor.basePrice }}</span>
                </div>
              </div>
              
              <div v-if="instructor.phone" class="flex items-center gap-2 text-slate-300 text-[0.65rem] bg-slate-950/60 p-2 border border-slate-800/60 font-mono tracking-widest">
                <Phone class="w-3 h-3 text-rose-400" />
                {{ instructor.phone }}
              </div>
            </div>

            <template #footer>
              <span :class="instructor.isActive ? 'text-emerald-500' : 'text-rose-500'" class="text-[0.6rem] font-black uppercase tracking-[0.2em]">
                 {{ instructor.isActive ? 'SATIŞA AÇIK' : 'PASİF / GİZLİ' }}
              </span>
              <div @click.stop="toggleInstructorStatus(instructor)" class="relative inline-flex items-center cursor-pointer scale-90">
                  <input type="checkbox" :checked="instructor.isActive" class="sr-only peer">
                  <div class="w-8 h-4 bg-slate-900 border border-slate-700 rounded-full peer peer-checked:bg-emerald-600 transition-all duration-300 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-600 after:rounded-full after:h-3 after:w-3 
                               after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white shadow-inner"></div>
              </div>
            </template>
          </BaseCard>
        </div>
      </BaseScroll>

      <!-- List View -->
      <BaseTable 
        v-else
        :columns="instructorColumns"
        :items="filteredInstructors"
        :selected-ids="selectedInstructors"
        @rowClick="item => toggleSelection(item.id)"
        accent="indigo"
        class="absolute inset-0"
      >
        <!-- Profil -->
        <template #cell-profile="{ item }">
          <div class="flex justify-center">
            <BaseTablePhoto 
              :src="item.profilePicture ? `http://${serverHost}:5000${item.profilePicture}` : null"
              :initials="(item.displayName || item.user?.username || 'E')[0].toUpperCase()"
              :selected="selectedInstructors.includes(item.id)"
            />
          </div>
        </template>

        <!-- Kullanıcı Adı -->
        <template #cell-username="{ item }">
          <div class="flex flex-col uppercase tracking-[0.1em]">
            <span class="text-sm font-bold text-slate-50 group-hover:text-rose-400 transition-colors">{{ item.user?.username || '-' }}</span>
            <div v-if="item.instructorCode" class="text-[0.55rem] text-rose-500 font-black flex items-center gap-1">
              <div class="w-1 h-1 bg-rose-500 rounded-full"></div>
              {{ item.instructorCode }}
            </div>
          </div>
        </template>

        <!-- Ad Soyad / Bilgi -->
        <template #cell-displayName="{ item }">
          <div class="flex flex-col uppercase tracking-tight gap-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-200">{{ item.displayName || '-' }}</span>
              <span :class="{
                'bg-emerald-500 text-slate-950': item.level === 'PRO',
                'bg-amber-500 text-slate-950': item.level === 'UZMAN' || !item.level,
                'bg-indigo-500 text-slate-950': item.level === 'STAJYER'
              }" class="text-[0.5rem] font-black px-1.5 py-0.5 tracking-[0.15em] whitespace-nowrap">
                {{ item.level === 'PRO' ? 'PROFESYONEL' : item.level === 'STAJYER' ? 'STAJYER' : 'UZMAN' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Branşlar -->
        <template #cell-specialties="{ item }">
          <div class="flex flex-wrap gap-1 max-w-[200px]">
            <span v-for="sId in item.specialties" :key="sId" class="text-[0.55rem] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 uppercase tracking-widest whitespace-nowrap">
              {{ getSpecialtyName(sId) }}
            </span>
            <span v-if="!item.specialties?.length" class="text-[0.55rem] font-bold text-slate-500 tracking-widest uppercase">
              BELİRTİLMEDİ
            </span>
          </div>
        </template>

        <!-- Ders Ücreti -->
        <template #cell-basePrice="{ item }">
          <span class="text-sm font-black text-white font-mono">₺{{ item.basePrice }}</span>
        </template>

        <!-- Komisyon -->
        <template #cell-commissionRate="{ item }">
          <span class="text-[0.8rem] font-black text-rose-500 opacity-80 uppercase tracking-widest">%{{ item.commissionRate * 100 }}</span>
        </template>

        <!-- Durum -->
        <template #cell-status="{ item }">
          <div class="flex items-center justify-center gap-2">
            <span :class="item.isActive ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'" class="text-ui-span font-black px-2 py-1 border uppercase tracking-[0.2em]">
              {{ item.isActive ? 'AKTİF' : 'PASİF' }}
            </span>
            <div v-if="isSuperMaster && item.user" :title="item.user.isTwoFactorEnabled ? '2FA AKTİF' : '2FA PASİF'">
              <ShieldCheck v-if="item.user.isTwoFactorEnabled" class="w-3.5 h-3.5 text-emerald-500 shadow-sm" />
              <ShieldOff v-else class="w-3.5 h-3.5 text-slate-600 opacity-40" />
            </div>
          </div>
        </template>
      </BaseTable>

    </div>

    <!-- Action Footer for List View -->

    <BaseActionFooter v-if="!showCreateModal && !showEditModal">
      <div class="flex items-center gap-[10px]">
        <BaseButton variant="dark" size="icon" square @click="router.push('/')" title="GERİ">
          <template #icon><ArrowLeft class="w-5 h-5" /></template>
        </BaseButton>


        <div v-if="selectedInstructors.length === 0" class="w-px h-6 bg-slate-800 mx-1"></div>

        <!-- Center: Primary Action -->
        <BaseButton v-if="selectedInstructors.length === 0" variant="primary" size="icon" square @click="showCreateModal = true" title="YENİ EĞİTMEN EKLE">
          <template #icon><Plus class="w-5 h-5" /></template>
        </BaseButton>

        <!-- Selection Contextual Actions -->
        <Transition name="fade-slide">
          <div v-if="selectedInstructors.length > 0" class="flex items-center gap-[10px] border-l border-slate-800 pl-3 ml-1 transition-all">
            <template v-if="selectedInstructors.length === 1">
              <BaseButton variant="warning" size="icon" square @click="startEdit(instructors.find(i => i.id === selectedInstructors[0]))" title="DÜZENLE">
                <template #icon><Edit class="w-5 h-5" /></template>
              </BaseButton>

              <!-- Status Toggle -->
              <BaseButton 
                variant="toggle"
                :active="instructors.find(i => i.id === selectedInstructors[0])?.isActive"
                size="icon" square
                @click="toggleInstructorStatus(instructors.find(i => i.id === selectedInstructors[0]))"
                title="DURUMU GÜNCELLE"
              >
                <template #icon><Power class="w-5 h-5" /></template>
              </BaseButton>
            </template>

            <BaseButton variant="danger" size="icon" square @click="deleteSelectedInstructors" title="SİL">
              <template #icon><Trash2 class="w-5 h-5" /></template>
            </BaseButton>
            
            <BaseButton variant="ghost" size="icon" square @click="selectedInstructors = []" title="İPTAL">
               <template #icon><X class="w-4 h-4" /></template>
            </BaseButton>
          </div>
        </Transition>
      </div>
    </BaseActionFooter>

    <!-- Create/Edit Form Area (Integrated Overlay Style) -->
    <div v-if="showCreateModal || showEditModal" class="absolute inset-0 z-40 bg-slate-950 flex flex-col overflow-hidden">
      

      <!-- Form Body -->
      <form @submit.prevent="showCreateModal ? createInstructor() : saveInstructor()" class="flex-1 flex flex-col overflow-hidden relative">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-8 bg-slate-950/50">
          <div class="w-full space-y-12">
            

            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <!-- Account Section -->
              <div class="space-y-6">
                <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                  <UserPlus class="w-3.5 h-3.5 text-indigo-400" />
                  <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Hesap Ayarları</span>
                </div>
                
                <div class="w-full">
                  <BaseInput v-if="showCreateModal" type="select" v-model="createForm.branchId" label="Şube" required>
                    <option value="" disabled>ŞUBE SEÇİNİZ</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                  </BaseInput>
                  <BaseInput v-else type="select" v-model="editForm.branchId" label="Şube" required>
                    <option value="" disabled>ŞUBE SEÇİNİZ</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                  </BaseInput>
                </div>
                
                <div class="flex items-center gap-6 mb-4">
                  <div class="flex items-center gap-4">
                    <label class="flex items-center cursor-pointer group">
                      <input type="checkbox" v-model="createForm.isSystemUser" class="sr-only peer">
                      <div class="relative w-11 h-6 bg-slate-800 peer peer-checked:bg-amber-600 transition-all duration-300 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-5 after:w-5 
                                  after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white shadow-lg"></div>
                      <span class="ms-3 text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Sistem Kullanıcısı Olarak Oluştur</span>
                    </label>
                  </div>
                  <div v-if="showCreateModal" class="flex items-center gap-4">
                    <label class="flex items-center cursor-pointer group">
                      <input type="checkbox" v-model="createForm.isActive" class="sr-only peer">
                      <div class="relative w-11 h-6 bg-slate-800 peer peer-checked:bg-emerald-600 transition-all duration-300 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-5 after:w-5 
                                  after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white shadow-lg"></div>
                      <span class="ms-3 text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Kayıt Aktif</span>
                    </label>
                  </div>
                  <div v-else-if="showEditModal" class="flex items-center gap-4">
                    <label class="flex items-center cursor-pointer group">
                      <input type="checkbox" v-model="editForm.isActive" class="sr-only peer">
                      <div class="relative w-11 h-6 bg-slate-800 peer peer-checked:bg-emerald-600 transition-all duration-300 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-5 after:w-5 
                                  after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white shadow-lg"></div>
                      <span class="ms-3 text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Kayıt Aktif</span>
                    </label>
                  </div>
                </div>

                <div v-if="showCreateModal && !createForm.isSystemUser">
                  <BaseInput v-model="createForm.displayName" label="Ad Soyad" placeholder="İSİM SOYİSİM..." required />
                </div>

                <!-- Ad Soyad for Edit Mode -->
                <div v-if="showEditModal">
                  <BaseInput v-model="editForm.displayName" label="Ad Soyad" placeholder="İSİM SOYİSİM..." required />
                </div>

                <!-- Giriş Kartı Kodu (Read-only for Edit Mode) -->
                <div v-if="showEditModal && editForm.instructorCode">
                  <BaseInput :model-value="editForm.instructorCode" label="Giriş Kartı Kodu" disabled />
                </div>

                <div v-if="(showCreateModal && createForm.isSystemUser) || showEditModal" class="space-y-4">
                  <div>
                    <BaseInput v-if="showCreateModal" v-model="createForm.username" label="Kullanıcı Adı" />
                    <BaseInput v-else v-model="editForm.username" label="Kullanıcı Adı" />
                  </div>

                  <!-- E-Mail for Edit Mode -->
                  <div v-if="showEditModal">
                    <BaseInput v-model="editForm.user.email" type="email" label="E-posta" />
                  </div>
                  
                  <!-- Password Update for Admins during Edit -->
                  <div v-if="showEditModal && isSuperMaster && editForm.user?.id">
                    <BaseInput v-model="editForm.newPassword" type="password" label="Yeni Şifre (Boş bırakılırsa değişmez)" placeholder="YENİ ŞİFRE BELİRLE..." />
                  </div>

                  <div v-if="showCreateModal">
                    <BaseInput v-model="createForm.email" type="email" label="E-posta" required />
                  </div>
                  <div v-if="showCreateModal">
                    <BaseInput v-model="createForm.password" type="password" label="Şifre" required />
                  </div>

                  <div v-if="showEditModal && isSuperMaster && editForm.user?.id" class="pt-4 border-t border-slate-700/50">
                    <label class="flex items-center cursor-pointer group">
                      <input type="checkbox" v-model="editForm.user.isTwoFactorEnabled" class="sr-only peer">
                      <div class="relative w-11 h-6 bg-slate-800 peer peer-checked:bg-emerald-600 transition-all duration-300 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:h-5 after:w-5 
                                  after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white shadow-lg"></div>
                      <span class="ms-3 text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">2FA Doğrulamasını Zorunlu Kıl</span>
                    </label>
                  </div>
                </div>

                <!-- Personal Info Section -->
                <div class="space-y-6 pt-6 border-t border-slate-800">
                  <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                    <UserPlus class="w-3.5 h-3.5 text-rose-400" />
                    <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Kişisel Bilgiler</span>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="w-full">
                      <BaseInput v-if="showCreateModal" type="select" v-model="createForm.gender" label="Cinsiyet">
                        <option value="ERKEK">ERKEK</option>
                        <option value="KADIN">KADIN</option>
                        <option value="DİĞER">DİĞER</option>
                      </BaseInput>
                      <BaseInput v-else type="select" v-model="editForm.gender" label="Cinsiyet">
                        <option value="ERKEK">ERKEK</option>
                        <option value="KADIN">KADIN</option>
                        <option value="DİĞER">DİĞER</option>
                      </BaseInput>
                    </div>
                    <div class="w-full">
                      <BaseInput v-if="showCreateModal" type="select" v-model="createForm.bloodGroup" label="Kan Grubu">
                        <option value="">BELİRTİLMEDİ</option>
                        <option value="A Rh+">A Rh+</option>
                        <option value="A Rh-">A Rh-</option>
                        <option value="B Rh+">B Rh+</option>
                        <option value="B Rh-">B Rh-</option>
                        <option value="AB Rh+">AB Rh+</option>
                        <option value="AB Rh-">AB Rh-</option>
                        <option value="0 Rh+">0 Rh+</option>
                        <option value="0 Rh-">0 Rh-</option>
                      </BaseInput>
                      <BaseInput v-else type="select" v-model="editForm.bloodGroup" label="Kan Grubu">
                        <option value="">BELİRTİLMEDİ</option>
                        <option value="A Rh+">A Rh+</option>
                        <option value="A Rh-">A Rh-</option>
                        <option value="B Rh+">B Rh+</option>
                        <option value="B Rh-">B Rh-</option>
                        <option value="AB Rh+">AB Rh+</option>
                        <option value="AB Rh-">AB Rh-</option>
                        <option value="0 Rh+">0 Rh+</option>
                        <option value="0 Rh-">0 Rh-</option>
                      </BaseInput>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="w-full">
                      <BaseInput v-if="showCreateModal" type="date" v-model="createForm.birthDate" min="1900-01-01" max="2100-12-31" label="Doğum Tarihi" />
                      <BaseInput v-else type="date" v-model="editForm.birthDate" min="1900-01-01" max="2100-12-31" label="Doğum Tarihi" />
                    </div>
                    <div class="w-full">
                      <BaseInput :model-value="calculatedAge" label="Hesaplanan Yaş" disabled />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Financial Section -->
              <div class="space-y-6">
                <!-- Instructor Photo -->
                <div class="space-y-4 flex flex-col items-center">
                  <div class="w-full flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                    <Camera class="w-3.5 h-3.5 text-amber-400" />
                    <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Eğitmen Fotoğrafı</span>
                  </div>
                  <div class="w-full flex justify-center">
                    <BaseImageUpload
                      v-if="showCreateModal"
                      v-model="createForm.profilePicture"
                      @change="file => handleFileChange(file, true)"
                    />
                    <BaseImageUpload
                      v-else
                      v-model="editForm.profilePicture"
                      @change="file => handleFileChange(file, false)"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-2 mb-2 mt-12 p-2 bg-slate-900 border border-slate-800">
                  <DollarSign class="w-3.5 h-3.5 text-emerald-400" />
                  <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Finans & İletişim</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="w-full">
                    <BaseInput v-if="showCreateModal" v-model.number="createForm.basePrice" type="number" label="Baz Ücret (₺)" required />
                    <BaseInput v-else v-model.number="editForm.basePrice" type="number" label="Baz Ücret (₺)" required />
                  </div>
                  <div class="w-full">
                    <BaseInput v-if="showCreateModal" v-model.number="createForm.commissionRate" type="number" step="0.01" label="Komisyon (%)" required />
                    <BaseInput v-else v-model.number="editForm.commissionRate" type="number" step="0.01" label="Komisyon (%)" required />
                  </div>
                </div>

                <div class="w-full">
                  <BaseInput :model-value="(showCreateModal ? createForm.phone : editForm.phone)" @update:model-value="val => handlePhoneInput('phone', val, showCreateModal)" type="text" label="Telefon" placeholder="0 (5xx) xxx xx xx" maxlength="17" />
                </div>

                <div class="w-full">
                  <BaseInput v-if="showCreateModal" type="select" v-model="createForm.notificationPreference" label="İletişim / Bildirim Kanalı">
                    <option value="BOTH">Hem WhatsApp Hem E-Posta</option>
                    <option value="WHATSAPP">SADECE WHATSAPP</option>
                    <option value="MAIL">SADECE E-POSTA</option>
                    <option value="NONE">SİSTEMSEL İLETİLERE KAPAT</option>
                  </BaseInput>
                  <BaseInput v-else type="select" v-model="editForm.notificationPreference" label="İletişim / Bildirim Kanalı">
                    <option value="BOTH">Hem WhatsApp Hem E-Posta</option>
                    <option value="WHATSAPP">SADECE WHATSAPP</option>
                    <option value="MAIL">SADECE E-POSTA</option>
                    <option value="NONE">SİSTEMSEL İLETİLERE KAPAT</option>
                  </BaseInput>
                </div>
              </div>
            </div>

            <!-- Level & Specialties Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-800">
               <div class="space-y-6">
                  <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                    <Award class="w-3.5 h-3.5 text-amber-400" />
                    <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Eğitmen Statüsü</span>
                  </div>
                  <div class="w-full">
                    <BaseInput v-if="showCreateModal" type="select" v-model="createForm.level">
                       <option value="STAJYER">STAJYER EĞİTMEN</option>
                       <option value="UZMAN">UZMAN EĞİTMEN</option>
                       <option value="PRO">PROFESYONEL EĞİTMEN</option>
                    </BaseInput>
                    <BaseInput v-else type="select" v-model="editForm.level">
                       <option value="STAJYER">STAJYER EĞİTMEN</option>
                       <option value="UZMAN">UZMAN EĞİTMEN</option>
                       <option value="PRO">PROFESYONEL EĞİTMEN</option>
                    </BaseInput>
                  </div>
                  <p class="text-[0.6rem] text-slate-500 uppercase tracking-widest leading-relaxed">Eğitmenin kıdem seviyesini belirler.</p>
               </div>

                <div class="space-y-6">
                   <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                     <GraduationCap class="w-3.5 h-3.5 text-indigo-400" />
                     <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Uzmanlık Branşları</span>
                   </div>
                   <div class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-slate-950/50 border border-slate-800">
                      <template v-if="showCreateModal">
                         <div v-for="s in allSpecialties" :key="s.id + 'create'" class="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group/item">
                            <span class="text-ui-span font-black text-slate-400 group-hover/item:text-amber-500 uppercase tracking-tight">{{ s.name }}</span>
                            <label :for="'create-' + s.id" class="relative inline-flex items-center cursor-pointer">
                               <input 
                                 :id="'create-' + s.id"
                                 type="checkbox" 
                                 :value="s.id" 
                                 v-model="createForm.specialties"
                                 class="sr-only peer"
                               />
                               <div class="w-8 h-4 bg-slate-800 peer-checked:bg-amber-600 transition-all duration-300 relative border border-slate-700">
                                 <div class="absolute top-0 left-0 bg-slate-500 h-full w-4 transition-all peer-checked:translate-x-4 peer-checked:bg-white"></div>
                               </div>
                            </label>
                         </div>
                      </template>
                      <template v-else>
                         <div v-for="s in allSpecialties" :key="s.id + 'edit'" class="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group/item">
                            <span class="text-ui-span font-black text-slate-400 group-hover/item:text-amber-500 uppercase tracking-tight">{{ s.name }}</span>
                            <label :for="'edit-' + s.id" class="relative inline-flex items-center cursor-pointer">
                               <input 
                                 :id="'edit-' + s.id"
                                 type="checkbox" 
                                 :value="s.id" 
                                 v-model="editForm.specialties"
                                 class="sr-only peer"
                               />
                               <div class="w-8 h-4 bg-slate-800 peer-checked:bg-amber-600 transition-all duration-300 relative border border-slate-700">
                                 <div class="absolute top-0 left-0 bg-slate-500 h-full w-4 transition-all peer-checked:translate-x-4 peer-checked:bg-white"></div>
                               </div>
                            </label>
                         </div>
                      </template>
                   </div>
                </div>
             </div>

             <!-- Bio Section -->
             <div class="space-y-4 pt-8 border-t border-slate-800">
               <div class="flex items-center gap-2 mb-2 p-2 bg-slate-900 border border-slate-800">
                  <Award class="w-3.5 h-3.5 text-amber-400" />
                  <span class="text-[0.85rem] font-black text-slate-100 uppercase tracking-widest">Biyografi & Sertifikalar</span>
                </div>
                <BaseInput v-if="showCreateModal" type="textarea" v-model="createForm.bio" :rows="4" placeholder="DENEYİM, SERTİFİKALAR, EĞİTİM BİLGİLERİ..." />
                <BaseInput v-else type="textarea" v-model="editForm.bio" :rows="4" placeholder="DENEYİM, SERTİFİKALAR, EĞİTİM BİLGİLERİ..." />
            </div>
          </div>
        </div>

        <!-- Action Footer for Form View -->
        <BaseActionFooter local>
          <!-- Left: Cancel -->
          <BaseButton variant="dark" size="icon" square @click="showCreateModal = false; showEditModal = false" title="İPTAL" class="mr-2">
            <template #icon><X class="w-5 h-5" /></template>
          </BaseButton>

          <!-- Right: Save/Update -->
          <BaseButton 
            :variant="showEditModal ? 'warning' : 'success'" 
            size="icon" 
            square
            :loading="loading" 
            @click="showCreateModal ? createInstructor() : saveInstructor()"
            :title="showEditModal ? 'GÜNCELLE' : 'KAYDET'"
          >
            <template #icon>
              <Save v-if="showEditModal" class="w-5 h-5" />
              <Check v-else class="w-5 h-5" />
            </template>
          </BaseButton>
        </BaseActionFooter>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  GraduationCap, X, Edit, Phone, Award, Plus, UserPlus, 
  Camera, Save, Check, DollarSign, ShieldCheck, ShieldOff,
  Power, ArrowLeft
} from 'lucide-vue-next'
import { uploadService } from '../../services/admin/uploadService'

// Components
import BaseScroll from '../../components/base/BaseScroll.vue'
import BaseTable from '../../components/base/BaseTable.vue'
import BaseSearchFilter from '../../components/base/BaseSearchFilter.vue'
import BaseActionFooter from '../../components/base/BaseActionFooter.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseImageUpload from '../../components/base/BaseImageUpload.vue'
import BaseTablePhoto from '../../components/base/BaseTablePhoto.vue'

// Services & Composables
import { instructorService } from '../../services/instructor/instructorService'
import { useInstructors } from '../../composables/useInstructors'
import { useAlerts } from '../../utils/alerts'
import { useDataStore } from '../../store/data'

import { inputMasks } from '../../utils/inputMasks'

const router = useRouter()
const { toast, confirm, error: showAlertError } = useAlerts()
const dataStore = useDataStore()
const serverHost = window.location.hostname

const {
  instructors,
  loading: globalLoading,
  branches,
  allSpecialties,
  isSuperMaster,
  fetchInstructors,
  getSpecialtyName
} = useInstructors()

const instructorColumns = [
  { key: 'profile',        label: 'PROFİL',          align: 'center' },
  { key: 'username',       label: 'KULLANICI ADI',   sortable: true },
  { key: 'displayName',    label: 'AD SOYAD / BİLGİ', sortable: true },
  { key: 'specialties',    label: 'BRANŞLAR' },
  { key: 'basePrice',      label: 'DERS ÜCRETİ',     align: 'right', sortable: true },
  { key: 'commissionRate', label: 'KOMİSYON',         align: 'right' },
  { key: 'status',         label: 'DURUM',            align: 'center' },
]

const selectedInstructors = ref([])
const showEditModal = ref(false)
const showCreateModal = ref(false)
const loading = ref(false)
const viewMode = ref('list')
const searchQuery = ref('')

const toggleSelection = (id) => {
  selectedInstructors.value = selectedInstructors.value[0] === id ? [] : [id]
}

const editForm = ref({ id: null, displayName: '', basePrice: 0, commissionRate: 0, phone: '', bio: '', profilePicture: '', branchId: '', notificationPreference: 'BOTH', level: 'UZMAN', specialties: [], gender: 'DİĞER', bloodGroup: '', birthDate: '', isActive: true, user: {} })
const createForm = ref({ isSystemUser: true, displayName: '', username: '', email: '', password: '', basePrice: 0, commissionRate: 0.4, phone: '', bio: '', profilePicture: '', branchId: '', notificationPreference: 'BOTH', level: 'UZMAN', specialties: [], gender: 'DİĞER', bloodGroup: '', birthDate: '', isActive: true })

const calculatedAge = computed(() => {
  const bDate = showCreateModal.value ? createForm.value.birthDate : editForm.value.birthDate
  if (!bDate) return '-'
  const birth = new Date(bDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age > 0 ? age : '-'
})

const toggleInstructor2FA = async (instructor) => {
  if (!instructor.user) return
  const newStatus = !instructor.user.isTwoFactorEnabled
  try {
    await instructorService.updateUserSettings(instructor.user.id, { 
      isTwoFactorEnabled: newStatus 
    })
    instructor.user.isTwoFactorEnabled = newStatus
    toast('Güvenlik ayarları güncellendi.')
  } catch (err) {
    showAlertError('HATA', 'Güvenlik ayarı değiştirilemedi.')
  }
}

const filteredInstructors = computed(() => {
  if (!searchQuery.value) return instructors.value
  const query = searchQuery.value.toLowerCase()
  return instructors.value.filter(inst => 
    inst.user?.username?.toLowerCase().includes(query) ||
    inst.user?.email?.toLowerCase().includes(query) ||
    inst.displayName?.toLowerCase().includes(query)
  )
})

const startEdit = (instructor) => {
  editForm.value = JSON.parse(JSON.stringify(instructor))
  editForm.value.username = instructor.user?.username || ''
  editForm.value.branchId = instructor.branchId || instructor.user?.branchId || ''
  if (!Array.isArray(editForm.value.specialties)) editForm.value.specialties = []
  showEditModal.value = true
}

const saveInstructor = async () => {
  loading.value = true
  try {
    await instructorService.update(editForm.value.id, editForm.value)
    toast('Eğitmen profili güncellendi.')
    showEditModal.value = false
    fetchInstructors()
    dataStore.fetchInstructors(true)
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Güncelleme yapılamadı.')
  } finally { loading.value = false }
}

const createInstructor = async () => {
  loading.value = true
  try {
    await instructorService.create(createForm.value)
    toast('Yeni eğitmen eklendi.')
    showCreateModal.value = false
    createForm.value = { isSystemUser: true, displayName: '', username: '', email: '', password: '', basePrice: 0, commissionRate: 0.4, phone: '', bio: '', profilePicture: '', branchId: '', isActive: true }
    fetchInstructors()
    dataStore.fetchInstructors(true)
  } catch (err) {
    showAlertError('HATA', err.response?.data?.message || 'Eğitmen oluşturulamadı.')
  } finally { loading.value = false }
}

const toggleInstructorStatus = async (instructor) => {
  try {
    await instructorService.update(instructor.id, {
      ...instructor,
      isActive: !instructor.isActive
    })
    instructor.isActive = !instructor.isActive
    toast('Durum güncellendi.')
  } catch (err) {
    showAlertError('HATA', 'Durum güncellenirken bir hata oluştu.')
  }
}

const deleteSelectedInstructors = async () => {
  const isConfirmed = await confirm('EMİN MİSİNİZ?', `${selectedInstructors.value.length} eğitmen kaydı silinecektir!`)
  if (isConfirmed) {
    try {
      await Promise.all(selectedInstructors.value.map(id => instructorService.delete(id)))
      toast('Eğitmenler kaldırıldı.')
      selectedInstructors.value = []
      fetchInstructors()
    } catch (err) {
      showAlertError('HATA', 'Bazı kayıtlar silinemedi.')
    }
  }
}

const handleFileChange = async (file, isCreate) => {
  if (!file) {
    if (isCreate) createForm.value.profilePicture = ''
    else editForm.value.profilePicture = ''
    return
  }
  try {
    const data = await uploadService.uploadFile(file)
    if (isCreate) createForm.value.profilePicture = data.filePath
    else editForm.value.profilePicture = data.filePath
  } catch (err) {
    showAlertError('HATA', 'Fotoğraf yüklenemedi.')
  }
}

const handlePhoneInput = (key, val, isCreate = false) => {
  const formatted = inputMasks.phone(val)
  if (isCreate) {
    createForm.value = { ...createForm.value, [key]: formatted }
  } else {
    editForm.value = { ...editForm.value, [key]: formatted }
  }
}

onMounted(() => { 
  fetchInstructors() 
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); }
</style>
