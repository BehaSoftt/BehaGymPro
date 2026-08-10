<template>
  <div class="absolute inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 flex flex-col">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 bg-slate-900/40 border-b border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-8 py-5 bg-slate-950/50 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <Settings class="w-5 h-5 text-emerald-500" />
              <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-[0.3em]">HESAP BİLGİLERİNİ DÜZENLE</span>
            </div>
            <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-[0.2em]">{{ form.accountName }}</span>
          </div>

          <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">HESAP ADI</label>
                <input v-model="form.accountName" type="text" class="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-slate-300 font-bold focus:outline-none opacity-60 text-xs uppercase" disabled />
              </div>

              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-amber-500 uppercase tracking-widest">KANTİN VERESİYE LİMİTİ (₺)</label>
                <input v-model.number="form.debtLimit" type="number" step="0.01" class="w-full bg-slate-950 border border-amber-500/30 px-4 py-3 text-amber-400 font-black focus:border-amber-500 outline-none transition-colors text-lg" />
                <p class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-widest mt-1">Ürün satışlarında borçlanılabilecek maksimum tutar</p>
              </div>

              <div class="p-4 bg-slate-950/50 border border-slate-800 flex items-center justify-between cursor-pointer group" @click="form.isActive = !form.isActive">
                <label class="text-[0.65rem] font-black text-slate-400 group-hover:text-slate-200 uppercase tracking-widest cursor-pointer transition-colors">Bu cari hesap aktif mi?</label>
                <div class="relative w-10 h-5 bg-slate-800 border border-slate-700 rounded-full transition-colors duration-300" :class="{ 'bg-emerald-500/20 border-emerald-500': form.isActive }">
                  <div class="absolute left-1 top-1 w-3 h-3 bg-slate-500 rounded-full transition-all duration-300 transform" :class="{ 'translate-x-5 bg-emerald-500': form.isActive }"></div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-4 p-6 bg-indigo-500/5 border border-indigo-500/20 animate-in fade-in duration-300">
                <h4 class="text-[0.7rem] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-3">ÖN ÖDEME / AVANS YÜKLE</h4>
                
                <div class="space-y-2 mt-4">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest opacity-80">Yüklenecek Tutar (₺)</label>
                  <div class="relative">
                    <input v-model.number="form.prepaidLoadAmount" type="number" step="0.01" class="w-full bg-slate-950 border-2 border-slate-800 text-3xl font-black text-indigo-400 px-4 py-4 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-900" placeholder="0.00" />
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 font-black text-xl italic uppercase pointer-events-none">TRY</span>
                  </div>
                  <p class="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mt-1 text-right">Mevcut Bakiye: ₺{{ parseFloat(form.currentPrepaidBalance || 0).toFixed(2) }}</p>
                </div>

                <div class="space-y-2 pt-2">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ÖDEME YÖNTEMİ</label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button v-for="method in paymentMethods" :key="method.id" @click="form.prepaidPaymentMethod = method.id" type="button" :class="form.prepaidPaymentMethod === method.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'" class="py-2 px-2 border text-[0.6rem] font-black transition-all uppercase tracking-tight">
                      {{ method.label }}
                    </button>
                  </div>
                </div>

                <div class="space-y-2 pt-2">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">AÇIKLAMA</label>
                  <textarea v-model="form.prepaidDescription" rows="2" class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 outline-none focus:border-indigo-500 transition-all uppercase text-xs tracking-widest resize-none placeholder:text-slate-800 shadow-inner" placeholder="AVANS / KUMBARA EKLENİRKEN İÇİN NOT/AÇIKLAMA..."></textarea>
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
        <BaseButton variant="success" size="icon" square @click="$emit('save', form)" title="Kaydet">
          <template #icon><CheckCircle class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Settings, XCircle, CheckCircle } from 'lucide-vue-next'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const paymentMethods = [
  { id: 'CASH', label: 'NAKİT' }, 
  { id: 'CREDIT_CARD', label: 'K. KARTI' }, 
  { id: 'BANK_TRANSFER', label: 'HAVALE' }, 
  { id: 'COIN', label: 'COIN' }, 
  { id: 'TICKET', label: 'TICKET' }, 
  { id: 'OTHER', label: 'DİĞER' }
]
</script>
