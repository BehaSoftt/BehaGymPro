<template>
  <BaseModal 
    v-model="localShow" 
    :title="type?.label + ' DETAYLARI'" 
    subtitle="ÜYE HİZMET VE PAKET DURUMU"
    hideClose
  >
    <template #icon>
       <div class="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Activity class="w-6 h-6 text-indigo-400" />
       </div>
    </template>

    <div v-if="member && type" class="space-y-6">
       <!-- Active Packages for this type -->
       <div v-for="pkg in currentPackages" :key="pkg.id" 
            class="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
          <div class="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
             <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-2xl">
                   <Check class="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                   <h3 class="text-lg font-black text-white italic uppercase tracking-tighter">{{ pkg.package?.name || 'BELİRSİZ PAKET' }}</h3>
                   <div class="flex items-center gap-2 mt-1">
                      <span class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">DURUM:</span>
                      <span class="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">AKTİF</span>
                   </div>
                </div>
             </div>

             <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div v-if="pkg.expiryDate" class="flex flex-col">
                   <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">KALAN SÜRE</span>
                   <div v-html="calculateRemainingTime(pkg.expiryDate)"></div>
                </div>
                <div v-if="pkg.remainingSessions !== undefined" class="flex flex-col">
                   <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">KALAN SEANS</span>
                   <span class="text-lg font-black text-white italic tabular-nums">{{ pkg.remainingSessions }} <span class="text-[0.6rem] text-slate-500 tracking-normal">DERS</span></span>
                </div>
                <div class="flex flex-col">
                   <span class="text-[0.5rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">KATILIM</span>
                   <span class="text-lg font-black text-white italic tabular-nums">0 <span class="text-[0.6rem] text-slate-500 tracking-normal">KAYIT</span></span>
                </div>
             </div>
          </div>

          <!-- Package Details Footer -->
          <div class="mt-6 pt-6 border-t border-slate-800/50 flex flex-wrap gap-4">
             <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <Calendar class="w-3.5 h-3.5 text-slate-500" />
                <span class="text-[0.6rem] font-bold text-slate-400 uppercase">{{ new Date(pkg.startDate || pkg.createdAt).toLocaleDateString('tr-TR') }} BAŞLANGIÇ</span>
             </div>
             <div v-if="pkg.instructor" class="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <User class="w-3.5 h-3.5 text-slate-500" />
                <span class="text-[0.6rem] font-bold text-slate-400 uppercase italic">{{ pkg.instructor.fullName }}</span>
             </div>
             <div v-if="pkg.specialty" class="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <ShieldCheck class="w-3.5 h-3.5 text-slate-500" />
                <span class="text-[0.6rem] font-bold text-slate-400 uppercase italic">{{ pkg.specialty.name }}</span>
             </div>
          </div>
       </div>

       <div v-if="currentPackages.length === 0" class="py-20 flex flex-col items-center justify-center gap-4 opacity-30 border-2 border-dashed border-slate-800 rounded-[3rem] italic">
          <History class="w-12 h-12" />
          <p class="text-xs font-black uppercase tracking-widest">BU KATEGORİDE AKTİF PAKET BULUNAMADI.</p>
       </div>
    </div>

    <template #footer>
       <div class="w-full flex justify-between items-center">
          <p class="text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest italic">YALNIZCA AKTİF HİZMETLER GÖSTERİLMEKTEDİR</p>
          <BaseButton variant="dark" size="sm" @click="localShow = false">
             <template #icon><X class="w-4 h-4" /></template>
             KAPAT
          </BaseButton>
       </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { Activity, Check, Calendar, User, ShieldCheck, History, X } from 'lucide-vue-next'
import BaseModal from '../../base/BaseModal.vue'
import BaseButton from '../../base/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  member: { type: Object, default: null },
  type: { type: Object, default: null } // { type: 'SALON'|'GROUP'|'PRIVATE', label: 'string' }
})

const emit = defineEmits(['update:modelValue'])

const localShow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const calculateRemainingTime = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  
  const diffTime = exp - today;
  if (diffTime < 0) return '<span class="text-rose-500 font-black uppercase tracking-widest shadow-sm">SÜRESİ DOLMUŞ</span>';
  if (diffTime === 0) return '<span class="text-amber-500 font-black uppercase tracking-widest shadow-sm animate-pulse">SON GÜN!</span>';
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  
  let label = "";
  if (months > 0) label += `${months} AY `;
  if (days > 0) label += `${days} GÜN`;
  if (!label) label = "BUGÜN SON";
  
  return `<span class="text-emerald-400 font-black uppercase tracking-widest">${label} KALDI</span>`;
}

const currentPackages = computed(() => {
  if (!props.member || !props.type) return [];
  const member = props.member;
  const { type, label } = props.type;
  
  if (type === 'PRIVATE') {
    return (member.privateLessonPackages || []).filter(p => 
      !p.isArchived && (p.status === 'ACTIVE' || !p.status) &&
      (label === 'ÖZEL' || p.specialty?.name === label)
    );
  } else {
    return (member.activePackages || []).filter(p => {
      const pkgName = p.package?.name?.toUpperCase() || '';
      if (type === 'GROUP') {
        if (label === 'GRUP') return pkgName.includes('GRUP');
        return pkgName.includes(label);
      }
      return !pkgName.includes('GRUP') && !pkgName.includes('ÖZEL');
    });
  }
})
</script>
