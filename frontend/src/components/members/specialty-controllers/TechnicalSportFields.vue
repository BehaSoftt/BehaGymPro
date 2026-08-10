<template>
  <div class="p-5 bg-slate-900/60 border border-slate-700/50 shadow-2xl space-y-6">
    <!-- Level & License -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BaseInput 
        v-model="localProfile.level"
        type="select"
        label="SPORCU SEVİYESİ"
      >
        <option value="BAŞLANGIÇ">BAŞLANGIÇ</option>
        <option value="AMATÖR">AMATÖR</option>
        <option value="LİSANSLI">LİSANSLI</option>
        <option value="YILDIZ / ELİT">YILDIZ / ELİT</option>
        <option value="PROFESYONEL">PROFESYONEL</option>
      </BaseInput>

      <BaseInput 
        v-model="localProfile.extraData.licenseNo"
        label="LİSANS NO (VARSA)"
        placeholder="ÖRN: 12345678"
      >
        <template #icon><ShieldCheck class="w-4 h-4 text-indigo-400" /></template>
      </BaseInput>
    </div>

    <!-- Branşa Özel Alanlar -->
    
    <!-- FUTBOL -->
    <div v-if="isFootball" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
       <BaseInput 
        v-model="localProfile.extraData.position"
        type="select"
        label="MEVKİ"
      >
        <option value="">SEÇİNİZ</option>
        <option value="GK">KALECİ (GK)</option>
        <option value="DF">DEFANS (DF)</option>
        <option value="MF">ORTA SAHA (MF)</option>
        <option value="FW">FORVET (FW)</option>
      </BaseInput>

      <BaseInput 
        v-model="localProfile.extraData.strongFoot"
        type="select"
        label="GÜÇLÜ AYAK"
      >
        <option value="">SEÇİNİZ</option>
        <option value="RIGHT">SAĞ</option>
        <option value="LEFT">SOL</option>
        <option value="BOTH">HER İKİSİ</option>
      </BaseInput>

      <BaseInput 
        v-model="localProfile.extraData.preferredRole"
        :type="currentSubPositions.length ? 'select' : 'text'"
        label="DETAY MEVKİ"
        :placeholder="currentSubPositions.length ? 'SEÇİNİZ...' : 'ÖNCE MEVKİ SEÇİN'"
        :disabled="!currentSubPositions.length"
      >
        <template v-if="currentSubPositions.length">
          <option value="">ROLES / MEVKİ DETAYI SEÇİN</option>
          <option v-for="sub in currentSubPositions" :key="sub.value" :value="sub.value">
            {{ sub.label }}
          </option>
        </template>
      </BaseInput>
    </div>

    <!-- TENİS -->
    <div v-if="isTennis" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
       <BaseInput 
        v-model="localProfile.extraData.hand"
        type="select"
        label="OYNADIĞI EL"
      >
        <option value="RIGHT">SAĞ EL</option>
        <option value="LEFT">SOL EL</option>
      </BaseInput>

      <BaseInput 
        v-model="localProfile.extraData.backhand"
        type="select"
        label="BACKHAND TİPİ"
      >
        <option value="SINGLE">TEK EL</option>
        <option value="DOUBLE">ÇİFT EL</option>
      </BaseInput>
    </div>

    <!-- YÜZME / HAVUZ (Genel) -->
    <div v-if="isPool" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
       <BaseInput 
        v-model="localProfile.extraData.swimStyle"
        type="select"
        label="ANA STİL"
      >
        <option value="">SEÇİNİZ</option>
        <option value="FREE">SERBEST</option>
        <option value="BACK">SIRT</option>
        <option value="BREAST">KURBAĞALAMA</option>
        <option value="BUTTERFLY">KELEBEK</option>
      </BaseInput>

      <BaseInput 
        v-model="localProfile.extraData.bestTime"
        label="EN İYİ DERECE (100M)"
        placeholder="ÖRN: 01:05.20"
      />
    </div>

    <!-- Diğer Branşlar İçin Fallback -->
    <div v-if="!isFootball && !isTennis && !isPool" class="p-10 border border-dashed border-slate-800 flex flex-col items-center justify-center opacity-40">
       <Activity class="w-10 h-10 mb-2" />
       <p class="text-[0.6rem] font-black uppercase tracking-widest text-center">BU BRANŞ İÇİN HENÜZ ÖZEL TEKNİK ALAN TANIMLANMAMIŞ. <br/> SEVİYE VE LİSANS BİLGİSİNİ KULLANABİLİRSİNİZ.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ShieldCheck, Activity } from 'lucide-vue-next'
import BaseInput from '../../base/BaseInput.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  specialty: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const localProfile = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const specialtyName = computed(() => (props.specialty?.name || '').toUpperCase())
const facilityType = computed(() => props.specialty?.facilityType || '')

const isFootball = computed(() => specialtyName.value.includes('FUTBOL'))
const isTennis = computed(() => specialtyName.value.includes('TENİS'))
const isPool = computed(() => facilityType.value === 'HAVUZ' || specialtyName.value.includes('YÜZME'))

const footballSubPositions = {
  'GK': [
    { value: 'Traditional', label: 'KLASİK KALECİ' },
    { value: 'Sweeper', label: 'SÜPÜRÜCÜ KALECİ' }
  ],
  'DF': [
    { value: 'CB', label: 'STOPER (CB)' },
    { value: 'RB', label: 'SAĞ BEK (RB)' },
    { value: 'LB', label: 'SOL BEK (LB)' },
    { value: 'RWB', label: 'SAĞ KANAT BEK (RWB)' },
    { value: 'LWB', label: 'SOL KANAT BEK (LWB)' },
    { value: 'SW', label: 'LİBERO (SW)' }
  ],
  'MF': [
    { value: 'CDM', label: 'ÖN LİBERO (CDM)' },
    { value: 'CM', label: 'MERKEZ ORTA SAHA (CM)' },
    { value: 'CAM', label: 'OYUN KURUCU / 10 NUMARA (CAM)' },
    { value: 'RM', label: 'SAĞ KANAT (RM)' },
    { value: 'LM', label: 'SOL KANAT (LM)' },
    { value: 'B2B', label: 'İKİ YÖNLÜ (BOX-TO-BOX)' }
  ],
  'FW': [
    { value: 'ST', label: 'SANTRAFOR (ST)' },
    { value: 'CF', label: 'YARDIMCI FORVET (CF)' },
    { value: 'RW', label: 'SAĞ KANAT FORVET (RW)' },
    { value: 'LW', label: 'SOL KANAT FORVET (LW)' },
    { value: 'PIVOT', label: 'PİVOT SANTRAFOR' },
    { value: 'FALSE9', label: 'GİZLİ FORVET (FALSE 9)' }
  ]
}

const currentSubPositions = computed(() => {
  const pos = localProfile.value.extraData.position
  return footballSubPositions[pos] || []
})

// Mevki değiştiğinde detay mevkisini sıfırla
import { watch } from 'vue'
watch(() => localProfile.value.extraData.position, () => {
  localProfile.value.extraData.preferredRole = ''
})
</script>
