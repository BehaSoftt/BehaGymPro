<template>
  <div class="flex-1 flex flex-col bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-500/10 border border-emerald-500/20">
          <Building2 class="w-5 h-5 text-emerald-400" />
        </div>
        <h3 class="text-sm font-bold text-slate-100 uppercase tracking-widest">ŞİRKETLER</h3>
      </div>
      <span class="text-[0.6rem] font-bold text-slate-500 bg-slate-950 px-2 py-1 border border-slate-800 uppercase tracking-widest">
        {{ companies.length }} ŞİRKET
      </span>
    </div>
    
    <!-- Companies Grid -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="company in companies" :key="company.id" class="bg-slate-950 border border-slate-800/50 hover:border-emerald-500/30 transition-all group flex flex-col">
          <!-- Company Card Content -->
          <div class="p-6 border-b border-slate-800/50">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div v-if="company.logo" class="w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <img :src="getLogoUrl(company.logo)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 class="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-[0.8rem] font-bold text-slate-100 uppercase tracking-tight">{{ company.name }}</h4>
                  <p class="text-[0.6rem] text-slate-500 font-medium tracking-widest uppercase mt-0.5">
                    {{ company.branches?.length || 0 }} ŞUBE
                  </p>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="editCompany(company)" class="p-2 text-indigo-400 hover:bg-indigo-600/10 transition-all" title="Düzenle">
                  <Edit class="w-4 h-4" />
                </button>
                <button @click="deleteCompany(company.id)" class="p-2 text-rose-500 hover:bg-rose-500/10 transition-all" title="Sil">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div class="space-y-2 text-[0.65rem] text-slate-400">
              <p v-if="company.authorizedPerson" class="flex items-center gap-2">
                <User class="w-3 h-3" /> {{ company.authorizedPerson }}
              </p>
              <p v-if="company.email" class="flex items-center gap-2 truncate">
                <span>📧</span> {{ company.email }}
              </p>
              <p v-if="company.phone" class="flex items-center gap-2">
                <span>📞</span> {{ company.phone }}
              </p>
              <p v-if="company.city" class="flex items-center gap-2">
                <span>📍</span> {{ company.city }} / {{ company.district }}
              </p>
            </div>
          </div>
          
          <!-- Branches Preview -->
          <div class="flex-1 p-4 bg-slate-900/30">
            <span class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block mb-3">Şubeler</span>
            
            <div v-if="company.branches?.length" class="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
              <div v-for="branch in company.branches.slice(0, 3)" :key="branch.id" class="p-2 bg-slate-950 border border-slate-800/30">
                <p class="text-[0.65rem] font-medium text-slate-300 uppercase truncate">{{ branch.name }}</p>
              </div>
              <p v-if="company.branches.length > 3" class="text-[0.6rem] text-slate-600 text-center">
                +{{ company.branches.length - 3 }} şube daha
              </p>
            </div>
            
            <div v-else class="py-6 text-center opacity-30">
              <p class="text-[0.6rem] text-slate-600 uppercase tracking-widest">Henüz şube yok</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Building2, Edit, Trash2, User } from 'lucide-vue-next'

const companies = inject('companies')
const editCompany = inject('editCompany')
const deleteCompany = inject('deleteCompany')
const getLogoUrl = inject('getLogoUrl')
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); }
</style>
