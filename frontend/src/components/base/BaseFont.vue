<template>
  <div class="space-y-5 pb-16">

    <!-- ── SCOPE SELECTOR BAR ─────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-3 p-4 bg-slate-950 border border-slate-700">
      <div class="flex items-center gap-2 flex-shrink-0">
        <Building2 class="w-4 h-4 text-indigo-400" />
        <span class="text-[10px] text-slate-500 uppercase tracking-widest">Kapsam:</span>
      </div>

      <!-- Scope Radio -->
      <div class="flex flex-wrap gap-2">
        <BaseButton v-for="s in scopes" :key="s.key"
          @click="scope = s.key; loadConfig()"
          :variant="scope === s.key ? 'primary' : 'dark'"
          class="text-[10px] px-3 py-1 text-xs">
          {{ s.label }}
        </BaseButton>
      </div>

      <!-- Company Select -->
      <div v-if="scope !== 'global'" class="flex-1 min-w-[180px]">
        <BaseInput v-model="selectedCompanyId" type="select" @change="onCompanyChange">
          <option value="">— Şirket Seçin —</option>
          <option v-for="c in companies" :key="c.id" :value="c.id">{{ c.name }}</option>
        </BaseInput>
      </div>

      <!-- Branch Select -->
      <div v-if="scope === 'branch'" class="flex-1 min-w-[180px]">
        <BaseInput v-model="selectedBranchId" type="select" @change="loadConfig" :disabled="!selectedCompanyId">
          <option value="">— Şube Seçin —</option>
          <option v-for="b in filteredBranches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </BaseInput>
      </div>
    </div>

    <!-- ── SEC 1: FONT AİLESİ & TEMEL ────────────────────────────────────── -->
    <Sec label="Font Ailesi & Temel Yazı" color="indigo">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Grp label="Ana Font">
          <Sel v-model="c.fontMain" :opts="fontOptions" @change="live" />
        </Grp>
        <Grp label="Alternatif Font">
          <Sel v-model="c.fontAlt" :opts="fontOptions" @change="live" />
        </Grp>
        <Grp label="Normal Ağırlık">
          <Sel v-model.number="c.fontWeight" :opts="weightOpts" @change="live" />
        </Grp>
        <Grp label="Kalın Ağırlık">
          <Sel v-model.number="c.fontWeightBold" :opts="boldOpts" @change="live" />
        </Grp>
      </div>
      <div class="mt-4 space-y-2">
        <div class="flex items-center justify-between text-[10px] text-slate-500 uppercase">
          <span>Harf Aralığı (Tracking)</span>
          <span class="text-indigo-400 font-mono">{{ c.letterSpacing }}em</span>
        </div>
        <input type="range" v-model="c.letterSpacing" @input="live" min="0" max="0.5" step="0.01"
          class="w-full h-1 appearance-none bg-slate-800 cursor-pointer accent-indigo-500" />
        <div class="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 uppercase"
          :style="{ letterSpacing: c.letterSpacing + 'em', fontSize: '11px', fontFamily: c.fontMain }">
          HARF ARALIĞI ÖNİZLEME — ABCDEFG 0123456789
        </div>
      </div>
    </Sec>

    <!-- ── SEC 2: BİLEŞEN YAZI BOYUTLARI ─────────────────────────────────── -->
    <Sec label="Bileşen Yazı Boyutları" color="rose" badge="px">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Slider v-for="s in sizeControls" :key="s.k" :label="s.l"
          v-model.number="c.sizes[s.k]" :min="8" :max="24" @update:modelValue="live" />
      </div>
    </Sec>

    <!-- ── SEC 3: RENK PALETİ ─────────────────────────────────────────────── -->
    <Sec label="Yazı Renk Paleti" color="purple">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <ColorCtrl v-for="item in colorControls" :key="item.k"
          :label="item.l" v-model="c.colors[item.k]" @update:modelValue="live" />
      </div>
    </Sec>

    <!-- ── SEC 4: BUTON BOYUTLARI ─────────────────────────────────────────── -->
    <Sec label="Buton Boyutları" color="amber">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Slider label="SM Yükseklik" v-model.number="c.btn.smH" :min="20" :max="60" @update:modelValue="live" />
        <Slider label="MD Yükseklik" v-model.number="c.btn.mdH" :min="24" :max="72" @update:modelValue="live" />
        <Slider label="LG Yükseklik" v-model.number="c.btn.lgH" :min="32" :max="80" @update:modelValue="live" />
        <Slider label="SM Yatay Padding" v-model.number="c.btn.smPx" :min="4" :max="40" @update:modelValue="live" />
        <Slider label="MD Yatay Padding" v-model.number="c.btn.mdPx" :min="8" :max="60" @update:modelValue="live" />
        <Slider label="LG Yatay Padding" v-model.number="c.btn.lgPx" :min="12" :max="80" @update:modelValue="live" />
        <Slider label="Yuvarlaklık (radius)" v-model.number="c.btn.radius" :min="0" :max="24" @update:modelValue="live" />
      </div>
      <div class="mt-4 flex flex-wrap gap-3 p-3 bg-slate-950 border border-slate-800">
        <button :style="btnStyle('sm')" class="bg-indigo-600 text-white border border-indigo-500 uppercase tracking-widest">SM Buton</button>
        <button :style="btnStyle('md')" class="bg-indigo-600 text-white border border-indigo-500 uppercase tracking-widest">MD Buton</button>
        <button :style="btnStyle('lg')" class="bg-indigo-600 text-white border border-indigo-500 uppercase tracking-widest">LG Buton</button>
        <button :style="btnStyle('md')" class="bg-rose-600 text-white border border-rose-500 uppercase tracking-widest">Sil</button>
        <button :style="btnStyle('sm')" class="bg-emerald-600 text-white border border-emerald-500 uppercase tracking-widest">Kaydet</button>
      </div>
    </Sec>

    <!-- ── SEC 5: FORM KONTROLLERİ ───────────────────────────────────────── -->
    <Sec label="Form Kontrolleri (Input, Select, Checkbox, Switch)" color="emerald">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Slider label="Input Yüksekliği" v-model.number="c.form.inputH" :min="24" :max="72" @update:modelValue="live" />
        <Slider label="Select Yüksekliği" v-model.number="c.form.selectH" :min="24" :max="72" @update:modelValue="live" />
        <Slider label="Checkbox Boyutu" v-model.number="c.form.checkboxSize" :min="12" :max="32" @update:modelValue="live" />
        <Slider label="Switch Genişliği" v-model.number="c.form.switchW" :min="32" :max="80" @update:modelValue="live" />
        <Slider label="Switch Yüksekliği" v-model.number="c.form.switchH" :min="16" :max="40" @update:modelValue="live" />
        <Slider label="Switch Thumb" v-model.number="c.form.switchThumb" :min="10" :max="34" @update:modelValue="live" />
        <ColorCtrl label="Dropdown İçi Renk" v-model="c.form.selectColor" @update:modelValue="live" />
        <Slider label="Dropdown İçi Font" v-model.number="c.form.selectFontSize" :min="8" :max="24" @update:modelValue="live" />
      </div>
      <!-- Live Form Preview -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-950 border border-slate-800">
        <div class="space-y-1">
          <label class="text-[10px] text-slate-500 uppercase">Input</label>
          <input type="text" placeholder="ÖRN: AHMET YILMAZ" readonly
            :style="{ height: c.form.inputH + 'px', fontSize: c.sizes.input + 'px', fontFamily: c.fontMain }"
            class="w-full bg-slate-900 border border-slate-700 px-3 text-slate-200 outline-none uppercase" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] text-slate-500 uppercase">Checkbox & Switch</label>
          <div class="flex items-center gap-4">
            <div :style="{ width: c.form.checkboxSize + 'px', height: c.form.checkboxSize + 'px' }"
              class="bg-indigo-600 border border-indigo-400 flex items-center justify-center flex-shrink-0">
              <div class="w-1/2 h-1/2 bg-white"></div>
            </div>
            <div :style="{ width: c.form.switchW + 'px', height: c.form.switchH + 'px' }"
              class="bg-indigo-600 rounded-full relative flex-shrink-0">
              <div :style="{ width: c.form.switchThumb + 'px', height: c.form.switchThumb + 'px', top: ((c.form.switchH - c.form.switchThumb) / 2) + 'px', right: '3px' }"
                class="absolute bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] text-slate-500 uppercase">Select / Dropdown</label>
          <div class="relative">
            <select :style="{ height: c.form.selectH + 'px', fontSize: c.sizes.input + 'px', fontFamily: c.fontMain }"
              class="w-full bg-slate-900 border border-slate-700 px-3 text-slate-200 outline-none appearance-none">
              <option>SEÇENEK 1</option>
              <option>SEÇENEK 2</option>
            </select>
            <ChevronDown class="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </Sec>

    <!-- ── SEC 6: PDF / BASKI ÇIKTISI ────────────────────────────────────── -->
    <Sec label="PDF & Baskı Çıktısı" color="sky" badge="@media print">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Slider label="Başlık Boyutu" v-model.number="c.pdf.titleSize" :min="12" :max="36" @update:modelValue="live" />
        <Slider label="H1 Boyutu" v-model.number="c.pdf.h1Size" :min="10" :max="28" @update:modelValue="live" />
        <Slider label="H2 Boyutu" v-model.number="c.pdf.h2Size" :min="9" :max="24" @update:modelValue="live" />
        <Slider label="Gövde Metni" v-model.number="c.pdf.bodySize" :min="7" :max="18" @update:modelValue="live" />
        <Slider label="Küçük Metin" v-model.number="c.pdf.smallSize" :min="6" :max="14" @update:modelValue="live" />
        <Slider label="Satır Aralığı ×10" v-model.number="c.pdf.lineH10" :min="10" :max="30" @update:modelValue="live" unit="×0.1" />
        <Slider label="Kenar Boşluğu" v-model.number="c.pdf.margin" :min="8" :max="60" @update:modelValue="live" />
      </div>
      <div class="mt-3 p-4 bg-white text-black space-y-2" style="font-family: serif;">
        <p :style="{ fontSize: c.pdf.titleSize + 'px', fontWeight: 700, lineHeight: (c.pdf.lineH10/10) }">BehaGym Pro — PDF Başlığı</p>
        <p :style="{ fontSize: c.pdf.h1Size + 'px', fontWeight: 600 }">Bölüm Başlığı (H1)</p>
        <p :style="{ fontSize: c.pdf.h2Size + 'px', fontWeight: 500, color: '#444' }">Alt Başlık (H2)</p>
        <p :style="{ fontSize: c.pdf.bodySize + 'px', lineHeight: (c.pdf.lineH10/10) }">Gövde metni örneği: Üye ve paket bilgileri, finansal özet raporlar, antrenman planları bu alanda görünür.</p>
        <p :style="{ fontSize: c.pdf.smallSize + 'px', color: '#999' }">Küçük dipnot — Sayfa {{ 1 }}/{{ 5 }} · BehaGym Pro v2</p>
      </div>
    </Sec>

    <!-- ── SEC 7: MEDYA & GÖRSELLER ───────────────────────────────────────── -->
    <Sec label="Medya & Görsel Boyutları" color="violet">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Slider label="Avatar (SM)" v-model.number="c.media.avatarSm" :min="24" :max="80" @update:modelValue="live" />
        <Slider label="Avatar (LG)" v-model.number="c.media.avatarLg" :min="48" :max="160" @update:modelValue="live" />
        <Slider label="Kart Görsel Yüksekliği" v-model.number="c.media.cardImgH" :min="80" :max="400" @update:modelValue="live" />
        <Slider label="Küçük Resim (Thumb)" v-model.number="c.media.thumbSize" :min="40" :max="200" @update:modelValue="live" />
        <Slider label="QR Kod Boyutu" v-model.number="c.media.qrSize" :min="80" :max="300" @update:modelValue="live" />
        <Slider label="QR İç Boşluk" v-model.number="c.media.qrPadding" :min="0" :max="32" @update:modelValue="live" />
      </div>
      <div class="mt-4 flex flex-wrap gap-6 p-3 bg-slate-950 border border-slate-800 items-end">
        <div class="space-y-1 text-center">
          <div :style="{ width: c.media.avatarSm + 'px', height: c.media.avatarSm + 'px' }"
            class="bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <span class="text-[9px]">SM</span>
          </div>
          <p class="text-[9px] text-slate-600 uppercase">Avatar SM</p>
        </div>
        <div class="space-y-1 text-center">
          <div :style="{ width: c.media.avatarLg + 'px', height: c.media.avatarLg + 'px' }"
            class="bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <span class="text-[10px]">LG</span>
          </div>
          <p class="text-[9px] text-slate-600 uppercase">Avatar LG</p>
        </div>
        <div class="space-y-1 text-center">
          <div :style="{ width: c.media.qrSize + 'px', height: c.media.qrSize + 'px', padding: c.media.qrPadding + 'px' }"
            class="bg-white border border-slate-300 flex items-center justify-center">
            <div class="w-full h-full bg-slate-950 grid grid-cols-3 gap-0.5 p-1">
              <div v-for="i in 9" :key="i" :class="[i%3===0||i===5?'bg-white':'bg-slate-950','rounded-sm']"></div>
            </div>
          </div>
          <p class="text-[9px] text-slate-600 uppercase">QR Kod</p>
        </div>
      </div>
    </Sec>

    <!-- ── SEC 8: TEMA & ARKAPLAN ─────────────────────────────────────────── -->
    <Sec label="Tema & Arkaplan Renkleri" color="slate">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <ColorCtrl label="Sayfa Arkaplanı"   v-model="c.theme.bgPage"     @update:modelValue="live" />
        <ColorCtrl label="Ana Arkaplan"      v-model="c.theme.bgPrimary"  @update:modelValue="live" />
        <ColorCtrl label="İkincil Arkaplan"  v-model="c.theme.bgSecondary" @update:modelValue="live" />
        <ColorCtrl label="Kart Arkaplanı"    v-model="c.theme.bgCard"     @update:modelValue="live" />
        <ColorCtrl label="Input Arkaplanı"   v-model="c.theme.bgInput"    @update:modelValue="live" />
        <ColorCtrl label="Border (Normal)"   v-model="c.theme.border"     @update:modelValue="live" />
        <ColorCtrl label="Border (Vurgu)"    v-model="c.theme.borderAccent" @update:modelValue="live" />
      </div>
      <div class="mt-4 flex gap-2">
        <BaseButton @click="applyDarkMode" variant="dark" class="px-4 py-2 text-[10px]">
          <Moon class="w-4 h-4 text-indigo-400" /> GECE MODU
        </BaseButton>
        <BaseButton @click="applyLightMode" variant="secondary" class="px-4 py-2 text-[10px] !text-slate-900 !bg-amber-50 hover:!bg-amber-100 !border-amber-200 hover:!border-amber-400">
          <Sun class="w-4 h-4 text-amber-500" /> GÜNDÜZ MODU
        </BaseButton>
        <BaseButton @click="applyHighContrastMode" variant="dark" class="px-4 py-2 text-[10px] !bg-black !text-white !border-white hover:!border-yellow-400">
          <Contrast class="w-4 h-4 text-yellow-400" /> YÜKSEK KONTRAST
        </BaseButton>
      </div>
    </Sec>

    <!-- ── SEC 9: TABLO SATIR & HÜCRE ──────────────────────────────────────── -->
    <Sec label="Tablo Satır & Hücre Stilleri" color="rose" badge="BaseTable">
      <div class="space-y-5">
        <div>
          <p class="text-[9px] text-slate-600 uppercase tracking-widest mb-3 border-l-2 border-rose-500 pl-2">① Başlık Yüksekliği · ② Satır Yüksekliği · ③ Satır Yazı Boyutu</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SliderFull label="① Başlık Yüksekliği" v-model.number="c.table.headerPy" :min="4" :max="40" color="sky" @update:modelValue="live">
              <div class="px-2 py-1 bg-slate-950 border border-slate-800 text-center text-[10px] text-slate-500 uppercase"
                :style="{ paddingTop: c.table.headerPy + 'px', paddingBottom: c.table.headerPy + 'px' }">BAŞLIK</div>
            </SliderFull>
            <SliderFull label="② Satır Yüksekliği" v-model.number="c.table.rowPy" :min="2" :max="32" color="sky" @update:modelValue="live">
              <div class="px-2 py-1 bg-slate-950 border border-slate-800 text-center text-[10px] text-slate-400 uppercase"
                :style="{ paddingTop: c.table.rowPy + 'px', paddingBottom: c.table.rowPy + 'px' }">SATIR</div>
            </SliderFull>
            <SliderFull label="③ Satır Yazı Boyutu" v-model.number="c.table.cellFontSize" :min="8" :max="20" color="sky" @update:modelValue="live">
              <div class="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 uppercase"
                :style="{ fontSize: c.table.cellFontSize + 'px' }">ÖNİZLEME</div>
            </SliderFull>
          </div>
        </div>
        <div>
          <p class="text-[9px] text-slate-600 uppercase tracking-widest mb-3 border-l-2 border-rose-500 pl-2">④ Satır Arkaplanı · ⑤ Hover Arkaplanı · ⑥ Başlık Arkaplanı</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RgbaCtrl v-for="item in tableBgControls" :key="item.k"
              :label="item.l" v-model="c.table[item.k]" @update:modelValue="live" />
          </div>
        </div>
        <div>
          <p class="text-[9px] text-slate-600 uppercase tracking-widest mb-3 border-l-2 border-rose-500 pl-2">⑦ Satır Border · ⑧ Sütun Ayırıcı · ⑨ Seçili Satır Rengi</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RgbaCtrl v-for="item in tableBorderControls" :key="item.k"
              :label="item.l" v-model="c.table[item.k]" @update:modelValue="live" />
          </div>
        </div>
        <!-- Live Table Preview -->
        <div class="border border-sky-500/30 overflow-hidden">
          <div class="flex" :style="{ backgroundColor: c.table.headerBg }">
            <div v-for="col in ['Üye Adı','Paket','Durum','Tarih']" :key="col"
              :style="{ fontSize: c.sizes.tableHead+'px', fontFamily: c.fontMain, fontWeight: c.fontWeightBold, letterSpacing: c.letterSpacing+'em', paddingTop: c.table.headerPy+'px', paddingBottom: c.table.headerPy+'px', borderRight: '1px solid '+c.table.colDividerColor }"
              class="flex-1 px-4 text-white uppercase last:border-r-0">{{ col }}</div>
          </div>
          <div v-for="(row,ri) in [['Ahmet Yılmaz','Yıllık Üyelik','Aktif','01.03.2026'],['Ayşe Demir','Aylık Spor','Aktif','15.02.2026'],['Mehmet Kaya','Özel Ders','Pasif','10.01.2026']]"
            :key="ri" class="flex cursor-pointer"
            :style="{ backgroundColor: ri===1 ? c.table.selectedRowBg : tblHover===ri ? c.table.rowHoverBg : c.table.rowBg, transition:'background-color 0.15s' }"
            @mouseover="tblHover=ri" @mouseleave="tblHover=null">
            <div v-for="(cell,ci) in row" :key="ci"
              :style="{ fontSize: c.table.cellFontSize+'px', fontFamily: c.fontMain, fontWeight: c.fontWeight, letterSpacing: c.letterSpacing+'em', paddingTop: c.table.rowPy+'px', paddingBottom: c.table.rowPy+'px', borderTop:'1px solid '+c.table.rowBorderColor, borderRight:'1px solid '+c.table.colDividerColor, color: c.colors.main }"
              class="flex-1 px-4 last:border-r-0 uppercase">{{ cell }}</div>
          </div>
        </div>
      </div>
    </Sec>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, h, defineComponent } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { Type, Save, RotateCcw, ChevronDown, Loader2, Building2, Moon, Sun, Contrast } from 'lucide-vue-next'
import { useAuthStore } from '../../store/auth'
import { settingService } from '../../services/admin/settingService'
import { companyService } from '../../services/admin/companyService'
import { branchService } from '../../services/admin/branchService'
import Storage from '../../utils/Storage'
import { useAlerts } from '../../utils/alerts'

const { success: showAlertSuccess, error: showAlertError, toast } = useAlerts()
const KEY = 'ui_font_config'

// ── Micro Components ──────────────────────────────────────────────────────────
const Sec = defineComponent({
  props: { label: String, color: { default: 'indigo' }, badge: String },
  setup(p, { slots }) {
    const bar = { indigo:'bg-indigo-500', rose:'bg-rose-500', amber:'bg-amber-500', emerald:'bg-emerald-500', sky:'bg-sky-500', slate:'bg-slate-500', purple:'bg-purple-500', violet:'bg-violet-500' }
    return () => h('div', { class: 'bg-slate-900/60 border border-slate-800' }, [
      h('div', { class: 'flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/80' }, [
        h('div', { class: `w-1 h-4 ${bar[p.color]}` }),
        h('span', { class: 'text-[11px] font-normal text-slate-200 uppercase tracking-widest' }, p.label),
        p.badge && h('span', { class: 'ml-auto text-[10px] text-slate-600 uppercase tracking-widest' }, p.badge),
      ]),
      h('div', { class: 'p-4' }, slots.default?.())
    ])
  }
})

const Grp = defineComponent({
  props: { label: String },
  setup(p, { slots }) {
    return () => h('div', { class: 'space-y-1.5' }, [
      h('label', { class: 'block text-[10px] text-slate-500 uppercase tracking-widest' }, p.label),
      slots.default?.()
    ])
  }
})

const Sel = defineComponent({
  props: { modelValue: [String, Number], opts: Array },
  emits: ['update:modelValue','change'],
  setup(p, { emit }) {
    return () => h(BaseInput, { 
       modelValue: p.modelValue, 
       type: 'select', 
       'onUpdate:modelValue': val => { emit('update:modelValue', val); emit('change'); },
       class: 'mt-0'
     }, 
     {
       default: () => p.opts.map(o => h('option', { value: o.v }, o.l))
     }
    )
  }
})

const Slider = defineComponent({
  props: { label: String, modelValue: Number, min: { default: 8 }, max: { default: 24 }, unit: { default: 'px' } },
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('div', { class: 'space-y-1.5 group' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('label', { class: 'text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors' }, p.label),
        h('span', { class: 'text-[10px] text-sky-400 font-mono' }, `${p.modelValue}${p.unit}`)
      ]),
      h('div', { class: 'flex items-center gap-2' }, [
        h('input', { type: 'number', value: p.modelValue, min: p.min, max: p.max, onInput: e => emit('update:modelValue', +e.target.value), class: 'w-14 bg-slate-950 border border-slate-700 px-1 py-1 text-white text-[11px] focus:border-sky-500 outline-none text-center [color-scheme:dark]' }),
        h('input', { type: 'range', value: p.modelValue, min: p.min, max: p.max, onInput: e => emit('update:modelValue', +e.target.value), class: 'flex-1 h-1 appearance-none bg-slate-800 cursor-pointer accent-sky-500' })
      ]),
      h('div', { class: 'px-2 py-0.5 bg-slate-950 border border-slate-800 overflow-hidden' },
        h('span', { style: { fontSize: p.modelValue + 'px' }, class: 'text-slate-300 uppercase tracking-widest' }, 'ÖNİZLEME')
      )
    ])
  }
})

const SliderFull = defineComponent({
  props: { label: String, modelValue: Number, min: { default: 4 }, max: { default: 40 }, color: { default: 'sky' } },
  emits: ['update:modelValue'],
  setup(p, { emit, slots }) {
    return () => h('div', { class: 'space-y-1.5' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('label', { class: 'text-[10px] text-slate-400 uppercase tracking-widest' }, p.label),
        h('span', { class: `text-[10px] text-${p.color}-400 font-mono` }, `${p.modelValue}px`)
      ]),
      h('div', { class: 'flex items-center gap-2' }, [
        h('input', { type: 'number', value: p.modelValue, min: p.min, max: p.max, onInput: e => emit('update:modelValue', +e.target.value), class: `w-14 bg-slate-950 border border-slate-700 px-1 py-1 text-white text-[11px] focus:border-${p.color}-500 outline-none text-center [color-scheme:dark]` }),
        h('input', { type: 'range', value: p.modelValue, min: p.min, max: p.max, onInput: e => emit('update:modelValue', +e.target.value), class: `flex-1 h-1 appearance-none bg-slate-800 cursor-pointer accent-${p.color}-500` })
      ]),
      slots.default?.()
    ])
  }
})

const ColorCtrl = defineComponent({
  props: { label: String, modelValue: String },
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('div', { class: 'space-y-1.5 group' }, [
      h('label', { class: 'block text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors' }, p.label),
      h('div', { class: 'flex items-center gap-2' }, [
        h('input', { type: 'color', value: p.modelValue, onInput: e => emit('update:modelValue', e.target.value), class: 'w-9 h-9 border border-slate-700 bg-slate-950 cursor-pointer p-0.5 flex-shrink-0' }),
        h('input', { type: 'text', value: p.modelValue, onInput: e => emit('update:modelValue', e.target.value), class: 'flex-1 min-w-0 bg-slate-950 border border-slate-700 px-2 py-2 text-slate-200 text-[10px] focus:border-indigo-500 outline-none font-mono' })
      ]),
      h('div', { class: 'h-1', style: { backgroundColor: p.modelValue } })
    ])
  }
})

const RgbaCtrl = defineComponent({
  props: { label: String, modelValue: String },
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    const hexVal = computed(() => {
      const m = (p.modelValue || '').match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/)
      if (m) return '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('')
      if (/^#[0-9a-fA-F]{6}$/.test(p.modelValue)) return p.modelValue
      return '#000000'
    })
    const opacityVal = computed(() => {
      const m = (p.modelValue || '').match(/rgba\(.*,([\d.]+)\)/)
      return m ? Math.round(parseFloat(m[1]) * 100) : 100
    })
    const build = (hex, opPct) => {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
      return `rgba(${r},${g},${b},${(opPct/100).toFixed(2)})`
    }
    return () => h('div', { class: 'space-y-1.5' }, [
      h('label', { class: 'block text-[10px] text-slate-400 uppercase tracking-widest' }, p.label),
      h('div', { class: 'flex items-center gap-2' }, [
        h('input', { type: 'color', value: hexVal.value, onInput: e => emit('update:modelValue', build(e.target.value, opacityVal.value)), class: 'w-9 h-9 border border-slate-700 bg-slate-950 cursor-pointer p-0.5 flex-shrink-0' }),
        h('input', { type: 'text', value: p.modelValue, onInput: e => emit('update:modelValue', e.target.value), class: 'flex-1 min-w-0 bg-slate-950 border border-slate-700 px-2 py-1.5 text-slate-200 text-[10px] focus:border-sky-500 outline-none font-mono' })
      ]),
      h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-[9px] text-slate-600 uppercase w-12 flex-shrink-0' }, 'Opaklık'),
        h('input', { type: 'range', value: opacityVal.value, min: 0, max: 100, step: 1, onInput: e => emit('update:modelValue', build(hexVal.value, +e.target.value)), class: 'flex-1 h-1 appearance-none bg-slate-800 cursor-pointer accent-sky-500' }),
        h('span', { class: 'text-[9px] text-sky-400 font-mono w-8 text-right' }, `${opacityVal.value}%`)
      ]),
      h('div', { class: 'h-1.5 border border-slate-700', style: { backgroundColor: p.modelValue } })
    ])
  }
})

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
  fontMain: "'JetBrains Mono', monospace", fontAlt: "'Inter', sans-serif",
  fontWeight: 400, fontWeightBold: 600, letterSpacing: 0.15,
  sizes: { base: 11, label: 11, input: 11, placeholder: 11, cardTitle: 11, modalTitle: 11, tableHead: 11, badge: 11, button: 11, span: 10 },
  colors: { main: '#f8fafc', muted: '#64748b', accent: '#e11d48', indigo: '#818cf8', emerald: '#10b981' },
  btn: { smH: 28, mdH: 36, lgH: 44, smPx: 12, mdPx: 20, lgPx: 28, radius: 0 },
  form: { inputH: 36, selectH: 36, checkboxSize: 16, switchW: 44, switchH: 24, switchThumb: 18, selectColor: '#ffffff', selectFontSize: 11 },
  pdf: { titleSize: 18, h1Size: 14, h2Size: 12, bodySize: 10, smallSize: 8, lineH10: 16, margin: 20 },
  media: { avatarSm: 40, avatarLg: 64, cardImgH: 180, thumbSize: 80, qrSize: 150, qrPadding: 8 },
  theme: { bgPage: '#020617', bgPrimary: '#0f172a', bgSecondary: '#1e293b', bgCard: '#0f172a', bgInput: '#020617', border: '#334155', borderAccent: '#e11d48' },
  table: { headerPy: 12, rowPy: 10, cellFontSize: 11, rowBg: 'transparent', rowHoverBg: 'rgba(30,41,59,0.8)', headerBg: 'rgba(2,6,23,0.95)', rowBorderColor: 'rgba(244,63,94,0.15)', colDividerColor: 'rgba(244,63,94,0.05)', selectedRowBg: 'rgba(225,29,72,0.15)' }
}

// ── State ─────────────────────────────────────────────────────────────────────
const c = ref(JSON.parse(JSON.stringify(DEFAULTS)))
const saving = ref(false)
const savedStatus = ref('idle')
const tblHover = ref(null)

const scope = ref('global')
const selectedCompanyId = ref('')
const selectedBranchId = ref('')
const companies = ref([])
const branches = ref([])

const scopes = [
  { key: 'global',  label: 'Global' },
  { key: 'company', label: 'Şirket' },
  { key: 'branch',  label: 'Şube'   },
]

const filteredBranches = computed(() =>
  selectedCompanyId.value ? branches.value.filter(b => b.companyId === selectedCompanyId.value) : []
)

const settingKey = computed(() => {
  if (scope.value === 'company' && selectedCompanyId.value) return `${KEY}_company_${selectedCompanyId.value}`
  if (scope.value === 'branch' && selectedBranchId.value) return `${KEY}_branch_${selectedBranchId.value}`
  return KEY
})

const statusClass = computed(() => ({
  'text-emerald-400': savedStatus.value === 'saved',
  'text-rose-400':    savedStatus.value === 'error',
  'text-indigo-400':  !['saved','error'].includes(savedStatus.value),
}))
const statusLabel = computed(() => {
  if (savedStatus.value === 'saved')   return '✓ Veritabanına kaydedildi'
  if (savedStatus.value === 'error')   return '✗ Kayıt başarısız'
  if (savedStatus.value === 'loading') return 'Yükleniyor...'
  return 'Değişiklikler anlık uygulanır'
})

// ── Option Lists ──────────────────────────────────────────────────────────────
const fontOptions = [
  { v: "'JetBrains Mono', monospace", l: "JetBrains Mono" },
  { v: "'Inter', sans-serif",         l: "Inter" },
  { v: "'Roboto', sans-serif",        l: "Roboto" },
  { v: "'Outfit', sans-serif",        l: "Outfit" },
  { v: "'DM Sans', sans-serif",       l: "DM Sans" },
  { v: "'Space Grotesk', sans-serif", l: "Space Grotesk" },
  { v: "'Fira Code', monospace",      l: "Fira Code (Mono)" },
  { v: "system-ui, sans-serif",       l: "Sistem Fontu" },
]
const weightOpts = [
  { v: 300, l: '300 — Hafif' }, { v: 400, l: '400 — Normal' }, { v: 500, l: '500 — Medium' }
]
const boldOpts = [
  { v: 500, l: '500 — Medium' }, { v: 600, l: '600 — SemiBold' }, { v: 700, l: '700 — Bold' }, { v: 800, l: '800 — ExtraBold' }, { v: 900, l: '900 — Black' }
]
const sizeControls = [
  { k:'base', l:'Genel' }, { k:'label', l:'Etiket' }, { k:'input', l:'Input/Select' },
  { k:'cardTitle', l:'Kart Başlığı' }, { k:'modalTitle', l:'Modal Başlığı' },
  { k:'tableHead', l:'Tablo Başlığı' }, { k:'badge', l:'Rozet' }, { k:'button', l:'Buton' },
  { k:'span', l:'Span (Küçük Metin)' }
]
const colorControls = [
  { k:'main', l:'Ana Metin' }, { k:'muted', l:'Silik Metin' },
  { k:'accent', l:'Vurgu' }, { k:'indigo', l:'Bilgi' }, { k:'emerald', l:'Onay' }
]
const tableBgControls = [
  { k:'rowBg', l:'④ Satır Arkaplanı' }, { k:'rowHoverBg', l:'⑤ Hover Arkaplanı' }, { k:'headerBg', l:'⑥ Başlık Arkaplanı' }
]
const tableBorderControls = [
  { k:'rowBorderColor', l:'⑦ Satır Border' }, { k:'colDividerColor', l:'⑧ Sütun Ayırıcı' }, { k:'selectedRowBg', l:'⑨ Seçili Satır' }
]

// ── Apply CSS Vars ────────────────────────────────────────────────────────────
const live = () => {
  const root = document.documentElement
  const d = c.value
  root.style.setProperty('--ui-font-main', d.fontMain)
  root.style.setProperty('--ui-font-alt', d.fontAlt)
  root.style.setProperty('--ui-font-weight', d.fontWeight)
  root.style.setProperty('--ui-font-weight-bold', d.fontWeightBold)
  root.style.setProperty('--ui-letter-spacing', d.letterSpacing + 'em')
  Object.entries(d.sizes).forEach(([k,v]) => root.style.setProperty(`--ui-font-size${k==='base'?'':'-'+k.replace(/([A-Z])/g,'-$1').toLowerCase()}`, v+'px'))
  Object.entries(d.colors).forEach(([k,v]) => root.style.setProperty(`--ui-color-text-${k}`, v))
  // Buttons
  root.style.setProperty('--ui-btn-sm-h', d.btn.smH+'px'); root.style.setProperty('--ui-btn-md-h', d.btn.mdH+'px'); root.style.setProperty('--ui-btn-lg-h', d.btn.lgH+'px')
  root.style.setProperty('--ui-btn-sm-px', d.btn.smPx+'px'); root.style.setProperty('--ui-btn-md-px', d.btn.mdPx+'px'); root.style.setProperty('--ui-btn-lg-px', d.btn.lgPx+'px')
  root.style.setProperty('--ui-btn-radius', d.btn.radius+'px')
  // Form
  root.style.setProperty('--ui-input-h', d.form.inputH+'px'); root.style.setProperty('--ui-select-h', d.form.selectH+'px')
  root.style.setProperty('--ui-checkbox-size', d.form.checkboxSize+'px')
  root.style.setProperty('--ui-switch-w', d.form.switchW+'px'); root.style.setProperty('--ui-switch-h', d.form.switchH+'px'); root.style.setProperty('--ui-switch-thumb', d.form.switchThumb+'px')
  root.style.setProperty('--ui-select-color', d.form.selectColor); root.style.setProperty('--ui-select-fs', d.form.selectFontSize+'px')
  // PDF
  root.style.setProperty('--ui-pdf-title-size', d.pdf.titleSize+'px'); root.style.setProperty('--ui-pdf-h1-size', d.pdf.h1Size+'px')
  root.style.setProperty('--ui-pdf-h2-size', d.pdf.h2Size+'px'); root.style.setProperty('--ui-pdf-body-size', d.pdf.bodySize+'px')
  root.style.setProperty('--ui-pdf-small-size', d.pdf.smallSize+'px'); root.style.setProperty('--ui-pdf-line-height', d.pdf.lineH10/10)
  root.style.setProperty('--ui-pdf-margin', d.pdf.margin+'px')
  // Media
  root.style.setProperty('--ui-avatar-size', d.media.avatarSm+'px'); root.style.setProperty('--ui-avatar-lg-size', d.media.avatarLg+'px')
  root.style.setProperty('--ui-card-img-h', d.media.cardImgH+'px'); root.style.setProperty('--ui-thumb-size', d.media.thumbSize+'px')
  root.style.setProperty('--ui-qr-size', d.media.qrSize+'px'); root.style.setProperty('--ui-qr-padding', d.media.qrPadding+'px')
  // Theme
  Object.entries(d.theme).forEach(([k,v]) => { const key = '--ui-'+k.replace(/([A-Z])/g,'-$1').toLowerCase().replace('bg-','bg-'); root.style.setProperty(`--ui-${k.replace(/([A-Z])/g,'-$1').toLowerCase()}`, v) })
  // Table
  root.style.setProperty('--ui-table-header-py', d.table.headerPy+'px'); root.style.setProperty('--ui-table-row-py', d.table.rowPy+'px')
  root.style.setProperty('--ui-table-cell-fs', d.table.cellFontSize+'px')
  root.style.setProperty('--ui-table-header-bg', d.table.headerBg); root.style.setProperty('--ui-table-row-bg', d.table.rowBg)
  root.style.setProperty('--ui-table-row-hover-bg', d.table.rowHoverBg); root.style.setProperty('--ui-table-row-border', d.table.rowBorderColor)
  root.style.setProperty('--ui-table-col-divider', d.table.colDividerColor); root.style.setProperty('--ui-table-selected-bg', d.table.selectedRowBg)
}

// ── Theme Presets ─────────────────────────────────────────────────────────────
const applyDarkMode = () => {
  c.value.theme = { bgPage: '#020617', bgPrimary: '#0f172a', bgSecondary: '#1e293b', bgCard: '#0f172a', bgInput: '#020617', border: '#334155', borderAccent: '#e11d48' }
  live()
}
const applyLightMode = () => {
  c.value.theme = { bgPage: '#f1f5f9', bgPrimary: '#ffffff', bgSecondary: '#f8fafc', bgCard: '#ffffff', bgInput: '#f1f5f9', border: '#cbd5e1', borderAccent: '#6366f1' }
  c.value.colors = { main: '#0f172a', muted: '#64748b', accent: '#e11d48', indigo: '#4f46e5', emerald: '#059669' }
  live()
}
const applyHighContrastMode = () => {
  c.value.theme = { bgPage: '#000000', bgPrimary: '#0a0a0a', bgSecondary: '#111111', bgCard: '#0a0a0a', bgInput: '#000000', border: '#ffffff', borderAccent: '#facc15' }
  c.value.colors = { main: '#ffffff', muted: '#d1d5db', accent: '#facc15', indigo: '#a5b4fc', emerald: '#6ee7b7' }
  live()
}

// ── DB Save/Load ──────────────────────────────────────────────────────────────
const merge = (saved) => {
  if (!saved) return { ...DEFAULTS }
  return {
    ...DEFAULTS, ...saved,
    sizes: { ...DEFAULTS.sizes, ...(saved.sizes||{}) },
    colors: { ...DEFAULTS.colors, ...(saved.colors||{}) },
    btn: { ...DEFAULTS.btn, ...(saved.btn||{}) },
    form: { ...DEFAULTS.form, ...(saved.form||{}) },
    pdf: { ...DEFAULTS.pdf, ...(saved.pdf||{}) },
    media: { ...DEFAULTS.media, ...(saved.media||{}) },
    theme: { ...DEFAULTS.theme, ...(saved.theme||{}) },
    table: { ...DEFAULTS.table, ...(saved.table||{}) },
  }
}

const loadConfig = async () => {
  savedStatus.value = 'loading'
  try {
    const data = await settingService.getByKey(settingKey.value)
    if (data && typeof data === 'object') c.value = merge(data)
  } catch {
    const local = Storage.getItem('beha_font_config')
    if (local) try { c.value = merge(JSON.parse(local)) } catch {}
  } finally {
    savedStatus.value = 'idle'
    live()
  }
}

const applyAndSave = async () => {
  live(); saving.value = true; savedStatus.value = 'idle'
  try {
    Storage.setItem('beha_font_config', JSON.stringify(c.value))
    await settingService.update(settingKey.value, {
      value: c.value,
      description: `UI Font Config [${scope.value}]`,
      companyId: selectedCompanyId.value || null,
      branchId:  selectedBranchId.value  || null,
    })
    savedStatus.value = 'saved'
    toast('Ayarlar Kaydedildi')
  } catch { 
    savedStatus.value = 'error'
    showAlertError('Hata', 'Ayarlar kaydedilemedi.')
  }
  finally { saving.value = false; setTimeout(() => savedStatus.value = 'idle', 3000) }
}

const resetToDefaults = async () => {
  c.value = JSON.parse(JSON.stringify(DEFAULTS)); live()
  Storage.removeItem('beha_font_config')
  try { await settingService.update(settingKey.value, { value: DEFAULTS, description: 'Reset' }) } catch {}
}

// ── Button Preview Style ──────────────────────────────────────────────────────
const btnStyle = (sz) => ({
  height: c.value.btn[sz+'H'] + 'px',
  paddingLeft: c.value.btn[sz+'Px'] + 'px',
  paddingRight: c.value.btn[sz+'Px'] + 'px',
  borderRadius: c.value.btn.radius + 'px',
  fontSize: c.value.sizes.button + 'px',
  fontFamily: c.value.fontMain,
  fontWeight: c.value.fontWeight,
  letterSpacing: c.value.letterSpacing + 'em',
})

// ── Company/Branch Loader ─────────────────────────────────────────────────────
const onCompanyChange = () => { selectedBranchId.value = ''; loadConfig() }

const fetchCompanies = async () => {
  try {
    const data = await companyService.getAll()
    companies.value = Array.isArray(data) ? data : (data?.companies || data?.data || [])
  } catch {}
}
const fetchBranches = async () => {
  try {
    const data = await branchService.getAll()
    branches.value = Array.isArray(data) ? data : (data?.branches || data?.data || [])
  } catch {}
}

onMounted(async () => {
  const auth = useAuthStore()
  await Promise.all([fetchCompanies(), fetchBranches()])
  
  // BehaAdmin değilse kapsamı ve şirket/şubeyi kitleyelim
  if (auth.user && auth.user.email !== 'behasoftt@gmail.com') {
    if (auth.user.branchId) {
      scope.value = 'branch'
      selectedCompanyId.value = auth.user.companyId || ''
      selectedBranchId.value = auth.user.branchId || ''
    } else if (auth.user.companyId) {
      scope.value = 'company'
      selectedCompanyId.value = auth.user.companyId || ''
    }
  }

  await loadConfig()
})

defineExpose({ resetToDefaults, applyAndSave })
</script>
