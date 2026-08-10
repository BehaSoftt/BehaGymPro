<template>
  <div class="absolute inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 flex flex-col">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 bg-slate-900/40 border-b border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-8 py-5 bg-slate-950/50 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <ArrowRightLeft class="w-5 h-5 text-indigo-500" />
              <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-[0.3em]">HESAPLAR ARASI TRANSFER (VİRMAN)</span>
            </div>
            <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-[0.2em]">KASALAR ARASI PARA AKIŞI</span>
          </div>

          <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Left Side: Source & Destination -->
            <div class="space-y-6">
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-rose-500 uppercase tracking-widest">KAYNAK HESAP (PARA ÇIKACAK)</label>
                  <select v-model="form.fromAccountId" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-3 outline-none focus:border-rose-500 transition-all uppercase text-xs">
                    <option v-for="acc in sortedAccounts" :key="'from-'+acc.id" :value="acc.id">
                      {{ acc.accountName }} (₺{{ parseFloat(acc.balance).toLocaleString('tr-TR') }})
                    </option>
                  </select>
                </div>

                <div class="flex justify-center py-2">
                  <div class="p-2 bg-slate-800 rounded-full">
                    <ArrowDown class="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest">HEDEF HESAP (PARA GİRECEK)</label>
                  <select v-model="form.toAccountId" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-3 outline-none focus:border-emerald-500 transition-all uppercase text-xs">
                    <option v-for="acc in sortedAccounts" :key="'to-'+acc.id" :value="acc.id" :disabled="acc.id === form.fromAccountId">
                      {{ acc.accountName }} (₺{{ parseFloat(acc.balance).toLocaleString('tr-TR') }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="pt-6 border-t border-slate-800">
                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest opacity-80">TRANSFER TUTARI (₺)</label>
                  <div class="relative">
                    <input v-model="form.amount" type="number" step="0.01" class="w-full bg-slate-950 border-2 border-slate-800 text-4xl font-black text-emerald-400 px-6 py-6 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-900" placeholder="0.00" />
                    <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-800 font-black text-2xl italic uppercase pointer-events-none">TRY</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Method & Notes -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ÖDEME / TRANSFER YÖNTEMİ</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="method in paymentMethods" :key="method.id" @click="form.paymentMethod = method.id" type="button" :class="form.paymentMethod === method.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'" class="py-3 px-2 border text-[0.65rem] font-black transition-all uppercase tracking-tight">
                    {{ method.label }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">TRANSFER AÇIKLAMASI (OPSİYONEL)</label>
                <textarea v-model="form.description" rows="5" class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 outline-none focus:border-rose-500 transition-all uppercase text-xs tracking-widest resize-none placeholder:text-slate-800 shadow-inner" placeholder="TRANSFER SEBEBİ VEYA NOTLARINIZ..."></textarea>
              </div>

              <div class="p-6 bg-slate-950/30 border border-slate-800 space-y-4 rounded-sm animate-in fade-in duration-500">
                <h4 class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">İŞLEM ÖZETİ</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500 uppercase font-bold">Kaynak:</span>
                    <span class="text-rose-400 font-black">{{ getAccountName(form.fromAccountId) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500 uppercase font-bold">Hedef:</span>
                    <span class="text-emerald-400 font-black">{{ getAccountName(form.toAccountId) }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span class="text-slate-500 uppercase font-bold">Tutar:</span>
                    <span class="text-lg font-black text-slate-100">₺ {{ parseFloat(form.amount || 0).toLocaleString('tr-TR') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseActionFooter local shadow>
      <div class="flex items-center gap-4">
        <BaseButton variant="dark" size="icon" square @click="$emit('cancel')" title="Vazgeç">
          <template #icon><XCircle class="w-5 h-5" /></template>
        </BaseButton>
        <div class="w-px h-8 bg-slate-800"></div>
        <BaseButton variant="primary" size="icon" square @click="$emit('save', form)" :disabled="!isFormValid" title="Transferi Başlat">
          <template #icon><CheckCircle class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRightLeft, ArrowDown, XCircle, CheckCircle } from 'lucide-vue-next'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  accounts: { type: Array, required: true },
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const sortedAccounts = computed(() => {
  return [...props.accounts].sort((a,b) => {
    // Sort by type: COMPANY, BRANCH, then others
    const weights = { 'COMPANY': 1, 'BRANCH': 2, 'GUEST': 3, 'MEMBER': 4, 'INSTRUCTOR': 5, 'USER': 6 }
    return (weights[a.entityType] || 99) - (weights[b.entityType] || 99)
  })
})

const paymentMethods = [
  { id: 'CASH', label: 'NAKİT' }, 
  { id: 'CREDIT_CARD', label: 'K. KARTI / POS' }, 
  { id: 'BANK_TRANSFER', label: 'HAVALE / İBAN' }
]

const getAccountName = (id) => {
  const account = props.accounts.find(a => a.id === id)
  return account ? account.accountName : '-'
}

const isFormValid = computed(() => {
  return form.value.fromAccountId && 
         form.value.toAccountId && 
         form.value.fromAccountId !== form.value.toAccountId &&
         parseFloat(form.value.amount) > 0
})
</script>
