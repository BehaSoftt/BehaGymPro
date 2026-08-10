<template>
  <div class="h-full flex flex-col">
    <!-- Sub-tabs -->
    <div class="flex items-center gap-2 px-6 pt-4 border-b border-slate-800">
      <button 
        @click="subTab = 'companies'"
        :class="subTab === 'companies' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest transition-all"
      >
        <Building2 class="w-3 h-3 inline-block mr-2" />
        Şirketler
      </button>
      <button 
        @click="subTab = 'branches'"
        :class="subTab === 'branches' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'"
        class="px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest transition-all"
      >
        <Building2 class="w-3 h-3 inline-block mr-2" />
        Şubeler
      </button>
    </div>

    <!-- Companies List -->
    <CompanyList v-if="subTab === 'companies'" />
    
    <!-- Branches Management -->
    <BranchManagement v-if="subTab === 'branches'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Building2 } from 'lucide-vue-next'
import CompanyList from './CompanyList.vue'
import BranchManagement from './SettingsBranches.vue'

const subTab = ref('companies')
</script>
