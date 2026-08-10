<template>
  <div class="absolute inset-0 z-[110] bg-slate-950 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 flex flex-col">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 bg-slate-900/40 border-b border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-8 py-5 bg-slate-950/50 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <Plus class="w-5 h-5 text-rose-500" />
              <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-[0.3em]">{{ account?.accountName }}</span>
            </div>
            <span class="text-[0.6rem] text-slate-500 font-bold uppercase tracking-[0.2em]">{{ account?.accountCode }}</span>
          </div>

          <div class="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">İŞLEM TİPİ</label>
                  <select v-model="form.transactionType" @change="onTransactionTypeChange" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-3 outline-none focus:border-rose-500 transition-all uppercase text-xs">
                    <option value="CREDIT">ALACAK (Tahsilat)</option>
                    <option value="DEBIT">BORÇ (Ödeme/Satış)</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">KATEGORİ</label>
                  <select v-model="form.category" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-3 outline-none focus:border-rose-500 transition-all uppercase text-xs">
                    <option v-for="opt in categoryOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                  </select>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest opacity-60">Mevcut Durum</label>
                  <div v-if="parseFloat(account?.balance) < 0" class="bg-rose-500/10 border border-rose-500/20 p-5 flex flex-col">
                    <span class="text-[0.5rem] text-rose-500 font-black uppercase tracking-widest mb-1">GÜNCEL BORÇ</span>
                    <span class="text-3xl font-black font-mono tracking-tighter text-rose-400">₺{{ Math.abs(parseFloat(account?.balance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                  <div v-else class="bg-emerald-500/10 border border-emerald-500/20 p-5 flex flex-col">
                    <span class="text-[0.5rem] text-emerald-500 font-black uppercase tracking-widest mb-1">GÜNCEL ALACAK</span>
                    <span class="text-3xl font-black font-mono tracking-tighter text-emerald-400">₺{{ parseFloat(account?.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-[0.6rem] font-black text-emerald-500 uppercase tracking-widest opacity-80">İşlem Tutarı (₺)</label>
                  <div class="relative">
                    <input v-model="form.amount" type="number" step="0.01" :readonly="isProductType" class="w-full bg-slate-950 border-2 border-slate-800 text-4xl font-black text-emerald-400 px-6 py-6 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-900" placeholder="0.00" />
                    <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-800 font-black text-2xl italic uppercase pointer-events-none">TRY</span>
                  </div>

                  <div v-if="form.category === 'PRODUCT_SALE' && form.transactionType === 'DEBIT' && parseFloat(account?.debtLimit || 0) > 0" 
                       class="flex justify-between items-center px-4 py-3 mt-4 transition-all border duration-300"
                       :class="limitExceeded ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-amber-500/5 border-amber-500/20'">
                    <div class="flex flex-col">
                      <span class="text-[0.6rem] font-black uppercase tracking-widest" :class="limitExceeded ? 'text-rose-400' : 'text-amber-500'">KANTİN VERESİYE LİMİTİ</span>
                      <div v-if="limitExceeded" class="flex items-center gap-1 mt-1">
                        <Zap class="w-3 h-3 text-rose-500 fill-current" />
                        <span class="text-[0.55rem] tracking-widest text-rose-400 font-bold uppercase">LİMİT AŞILIYOR (Mevcut borcu kapsamıyor)</span>
                      </div>
                    </div>
                    <span class="text-xs font-black font-mono pl-4" :class="limitExceeded ? 'text-rose-400' : 'text-amber-400'">₺{{ parseFloat(account?.debtLimit).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="isProductType" class="bg-slate-950/30 border border-slate-800 p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-1 space-y-2">
                    <label class="block text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">ÜRÜN</label>
                    <input v-model="form.productName" type="text" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-2 outline-none focus:border-rose-500 transition-all uppercase text-xs" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">ADET</label>
                    <input v-model="form.quantity" type="number" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-2 outline-none focus:border-rose-500 transition-all text-xs" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">BİRİM (₺)</label>
                    <input v-model="form.unitPrice" type="number" step="0.01" class="w-full bg-slate-950 border border-slate-800 text-slate-100 font-bold px-4 py-2 outline-none focus:border-rose-500 transition-all text-xs" />
                  </div>
                </div>
              </div>

              <div v-if="form.transactionType === 'DEBIT' && parseFloat(account?.prepaidBalance || 0) > 0" class="p-4 bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <input type="checkbox" v-model="form.usePrepaid" class="w-4 h-4 accent-indigo-500 cursor-pointer" />
                  <label class="text-[0.65rem] font-black text-indigo-400 uppercase tracking-widest cursor-pointer">ÖN ÖDEMEYİ KULLAN</label>
                </div>
                <span class="text-[0.7rem] font-black font-mono text-indigo-300">₺{{ parseFloat(account?.prepaidBalance || 0).toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">ÖDEME YÖNTEMİ</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button v-for="method in paymentMethods" :key="method.id" @click="form.paymentMethod = method.id" type="button" :class="form.paymentMethod === method.id ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'" class="py-3 px-2 border text-[0.65rem] font-black transition-all uppercase tracking-tight">
                    {{ method.label }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">İŞLEM AÇIKLAMASI</label>
                <textarea v-model="form.description" rows="5" class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 outline-none focus:border-rose-500 transition-all uppercase text-xs tracking-widest resize-none placeholder:text-slate-800 shadow-inner" placeholder="İŞLEM DETAYLARINI BURAYA YAZIN..."></textarea>
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
        <BaseButton variant="success" size="icon" square @click="$emit('save', form)" :disabled="isSaveDisabled" :title="saveTitle">
          <template #icon><CheckCircle class="w-5 h-5" /></template>
        </BaseButton>
      </div>
    </BaseActionFooter>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Plus, Zap, XCircle, CheckCircle } from 'lucide-vue-next'
import BaseActionFooter from '../base/BaseActionFooter.vue'
import BaseButton from '../base/BaseButton.vue'

const props = defineProps({
  account: { type: Object, required: true },
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isProductType = computed(() => form.value.category === 'PRODUCT_SALE' || form.value.category === 'PRODUCT_RENTAL')

const categoryOptions = computed(() => {
  if (form.value.transactionType === 'CREDIT') {
    return [
      { id: 'DEBT_COLLECTION', label: 'CARİ TAHSİLAT' },
      { id: 'PREPAID_LOAD', label: 'ÖN ÖDEME YÜKLEME' },
      { id: 'MEMBERSHIP', label: 'ÜYELİK PAKETİ' },
      { id: 'EXAM_FEE', label: 'SINAV ÜCRETİ' },
      { id: 'COMMISSION', label: 'KOMİSYON (Gelir)' },
      { id: 'OTHER', label: 'DİĞER' }
    ]
  } else {
    return [
      { id: 'PRODUCT_SALE', label: 'ÜRÜN SATIŞI (BORÇ)' },
      { id: 'PRODUCT_RENTAL', label: 'ÜRÜN KİRALAMA' },
      { id: 'SALARY', label: 'MAAŞ ÖDEMESİ' },
      { id: 'COMMISSION', label: 'KOMİSYON (Gider)' },
      { id: 'EXPENSE', label: 'GENEL GİDER / HARCAMA' },
      { id: 'CASH_TRANSFER', label: 'KASA TRANSFERİ' },
      { id: 'OTHER', label: 'DİĞER' }
    ]
  }
})

const paymentMethods = [
  { id: 'CASH', label: 'NAKİT' }, 
  { id: 'CREDIT_CARD', label: 'K. KARTI' }, 
  { id: 'BANK_TRANSFER', label: 'HAVALE' }, 
  { id: 'COIN', label: 'COIN' }, 
  { id: 'TICKET', label: 'TICKET' }, 
  { id: 'OTHER', label: 'DİĞER' }
]

const limitExceeded = computed(() => {
  return parseFloat(form.value.amount || 0) > parseFloat(props.account?.debtLimit || 0)
})

const debtExceeded = computed(() => {
  if (form.value.transactionType === 'CREDIT' && form.value.category === 'DEBT_COLLECTION') {
    const currentDebt = Math.abs(Math.min(0, parseFloat(props.account?.balance || 0)))
    return parseFloat(form.value.amount || 0) > currentDebt + 0.01 // Small buffer for decimals
  }
  return false
})

const isSaveDisabled = computed(() => {
  if (form.value.category === 'PRODUCT_SALE' && 
      form.value.transactionType === 'DEBIT' && 
      parseFloat(props.account?.debtLimit || 0) > 0 && 
      limitExceeded.value) {
    return true
  }
  
  if (debtExceeded.value) return true

  return false
})

const saveTitle = computed(() => {
  if (debtExceeded.value) return 'TAHSİLAT TUTARI MEVCUT BORCU AŞAMAZ (FAZLASINI ÖN ÖDEME OLARAK GİRİN)'
  return isSaveDisabled.value ? 'LİMİT AŞILDIĞI İÇİN İŞLEM YAPILAMAZ' : 'İşlemi Onayla ve Kaydet'
})

const onTransactionTypeChange = () => {
  form.value.usePrepaid = false
  if (form.value.transactionType === 'CREDIT') {
    form.value.category = 'DEBT_COLLECTION'
  } else {
    form.value.category = 'OTHER'
  }
}

const calculateProductTotal = () => {
  const qty = parseFloat(form.value.quantity) || 0
  const price = parseFloat(form.value.unitPrice) || 0
  form.value.amount = (qty * price).toFixed(2)
}

watch(() => form.value.quantity, calculateProductTotal)
watch(() => form.value.unitPrice, calculateProductTotal)
</script>
