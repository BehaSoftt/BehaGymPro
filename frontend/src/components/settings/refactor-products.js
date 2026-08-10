const fs = require('fs');
const path = 'd:/BehaGymPro/frontend/src/components/settings/SettingsProducts.vue';
let content = fs.readFileSync(path, 'utf8');

// ======================== UNITS TABLE ========================
const unitsTableRegex = /<table v-if="productSubTab === 'units'"[\s\S]*?<\/table>/;
const unitsTableNew = `
        <div v-if="productSubTab === 'units'" class="h-full">
          <BaseTable :columns="unitColumns" :items="productUnits" emptyText="Henüz birim tanımlanmamış.">
            <template #cell-name="{ item }">
              <div class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{{ item.name }}</div>
            </template>
            <template #cell-shortName="{ item }">
              <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.6rem] font-black text-indigo-400 font-mono">{{ item.shortName || '-' }}</span>
            </template>
            <template #cell-actions="{ item }">
              <div class="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <button @click="editProductUnit(item)" class="p-2 text-indigo-400 hover:bg-indigo-600/10"><Edit class="w-3.5 h-3.5"/></button>
                <button @click="deleteProductUnit(item.id)" class="p-2 text-rose-500 hover:bg-rose-500/10"><Trash2 class="w-3.5 h-3.5"/></button>
              </div>
            </template>
          </BaseTable>
        </div>
`;
content = content.replace(unitsTableRegex, unitsTableNew.trim());

// ======================== GROUPS TABLE ========================
const groupsTableRegex = /<table v-if="productSubTab === 'groups'"[\s\S]*?<\/table>/;
const groupsTableNew = `
        <div v-if="productSubTab === 'groups'" class="h-full">
          <BaseTable :columns="groupColumns" :items="productGroups" emptyText="Henüz grup tanımlanmamış.">
            <template #cell-name="{ item }">
              <div class="text-[0.7rem] font-bold text-slate-100 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{{ item.name }}</div>
            </template>
            <template #cell-productCount="{ item }">
              <div class="flex items-center gap-2">
                <span class="text-[0.7rem] font-black text-slate-400">{{ item.productCount || 0 }}</span>
                <span class="text-[0.55rem] text-slate-600 font-bold uppercase tracking-widest italic">ADET</span>
              </div>
            </template>
            <template #cell-actions="{ item }">
              <div class="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <button @click="editProductGroup(item)" class="p-2 text-indigo-400 hover:bg-indigo-600/10"><Edit class="w-3.5 h-3.5"/></button>
                <button @click="deleteProductGroup(item.id)" class="p-2 text-rose-500 hover:bg-rose-500/10"><Trash2 class="w-3.5 h-3.5"/></button>
              </div>
            </template>
          </BaseTable>
        </div>
`;
content = content.replace(groupsTableRegex, groupsTableNew.trim());

// ======================== PRODUCTS TABLE ========================
const productsTableRegex = /<table v-if="productViewModeLocal === 'list'"[\s\S]*?<\/table>/;
const productsTableNew = `
            <div v-if="productViewModeLocal === 'list'" class="h-full mt-2">
              <BaseTable :columns="productColumns" :items="filteredProducts" emptyText="Henüz ürün tanımlanmamış.">
                <template #cell-product="{ item }">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-slate-950 border border-white/5 flex items-center justify-center relative shadow-black transition-all group-hover:border-indigo-500/30 overflow-hidden rounded-lg">
                      <img v-if="item.imageUrl" :src="item.imageUrl.startsWith('http') ? item.imageUrl : \`http://\${window.location.hostname}:5000/uploads\${item.imageUrl}\`" class="w-full h-full object-cover" />
                      <Package v-else class="w-4 h-4 text-slate-800" />
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[0.7rem] font-black text-slate-100 uppercase group-hover:text-indigo-400 transition-colors">{{ item.name }}</span>
                      <span class="text-[0.5rem] text-slate-600 font-bold uppercase tracking-widest">{{ String(item.id).split('-')[0] }}</span>
                    </div>
                  </div>
                </template>
                <template #cell-group="{ item }">
                  <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">{{ item.group?.name || 'GENEL' }}</span>
                </template>
                <template #cell-unit="{ item }">
                  <span class="text-[0.6rem] font-bold text-slate-500 uppercase">{{ item.productUnit?.name || item.unit }}</span>
                </template>
                <template #cell-stock="{ item }">
                  <span :class="item.stock < 10 ? 'text-rose-500' : 'text-indigo-400'" class="text-[0.7rem] font-black">{{ item.stock }}</span>
                </template>
                <template #cell-price="{ item }">
                  <div class="text-[0.7rem] font-black text-emerald-500">{{ item.price }} ₺</div>
                </template>
                <template #cell-actions="{ item }">
                  <div class="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button @click="editProduct(item)" class="p-2 text-indigo-400 hover:bg-indigo-600/10"><Edit class="w-3.5 h-3.5"/></button>
                    <button @click="deleteProduct(item.id)" class="p-2 text-rose-500 hover:bg-rose-500/10"><Trash2 class="w-3.5 h-3.5"/></button>
                  </div>
                </template>
              </BaseTable>
            </div>
`;
content = content.replace(productsTableRegex, productsTableNew.trim());

// ======================== PRODUCTS GRID ========================
const productsGridRegex = /<div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const productsGridNew = `
            <div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <BaseCard v-for="p in filteredProducts" :key="p.id" class="flex flex-col h-full !p-0 overflow-hidden group">
                <template #default>
                  <div class="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <img v-if="p.imageUrl" :src="p.imageUrl.startsWith('http') ? p.imageUrl : \`http://\${window.location.hostname}:5000/uploads\${p.imageUrl}\`" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <Package v-else class="w-12 h-12 text-slate-800 opacity-20" />
                    <div class="absolute top-2 right-2 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button @click="editProduct(p)" class="p-2 bg-slate-900/80 backdrop-blur-md text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all border border-slate-700 shadow-xl rounded"><Edit class="w-3.5 h-3.5"/></button>
                      <button @click="deleteProduct(p.id)" class="p-2 bg-slate-900/80 backdrop-blur-md text-rose-500 hover:text-white hover:bg-rose-600 transition-all border border-slate-700 shadow-xl rounded"><Trash2 class="w-3.5 h-3.5"/></button>
                    </div>
                    <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[0.55rem] font-bold text-emerald-400 tracking-widest rounded shadow-xl">
                      {{ p.price }} ₺
                    </div>
                  </div>
                  <div class="p-4 flex flex-col gap-2 flex-grow">
                     <div class="flex flex-col">
                      <span class="text-[0.7rem] font-black text-slate-100 uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate">{{ p.name }}</span>
                      <span class="text-[0.45rem] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{{ p.group?.name || 'GENEL' }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-800/50 mt-auto">
                      <span class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest">{{ p.productUnit?.name || p.unit }}</span>
                      <span :class="p.stock < 10 ? 'text-rose-500' : 'text-slate-300'" class="text-[0.65rem] font-black">STOK: {{ p.stock }}</span>
                    </div>
                  </div>
                </template>
              </BaseCard>
            </div>
          </div>
        </div>
`;
content = content.replace(productsGridRegex, productsGridNew.trim() + '\n        </div>\n');

// ======================== STOCK MANAGEMENT TABLE ========================
const stockTableRegex = /<table class="w-full text-left border-collapse">[\s\S]*?<\/table>/;
const stockTableNew = `
          <BaseTable :columns="stockColumns" :items="filteredProducts" emptyText="Stok güncellenecek ürün bulunamadı.">
            <template #cell-product="{ item }">
              <div class="flex flex-col gap-0.5">
                <span class="text-[0.7rem] font-black text-slate-100 uppercase">{{ item.name }}</span>
                <span class="text-[0.55rem] text-slate-600 font-bold uppercase tracking-widest">{{ item.group?.name || 'Genel' }}</span>
              </div>
            </template>
            <template #cell-stockStatus="{ item }">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="item.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                <span class="text-[0.8rem] font-black text-white">{{ item.stock }}</span>
              </div>
            </template>
            <template #cell-adjust="{ item }">
              <div class="flex items-center gap-1.5 bg-black/40 border border-slate-800 p-1 rounded-lg max-w-[180px]">
                <button @click="quickStockUpdate(item.id, -1)" class="w-8 h-8 flex items-center justify-center bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-md transition-all">-</button>
                <input 
                  type="number" 
                  v-model="item.tempStockAdjust" 
                  placeholder="0" 
                  class="w-full bg-slate-950 border border-slate-700 px-2 py-1 text-[0.7rem] font-black text-center text-indigo-400 outline-none focus:border-indigo-500" 
                />
                <button @click="quickStockUpdate(item.id, 1)" class="w-8 h-8 flex items-center justify-center bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-md transition-all">+</button>
              </div>
            </template>
            <template #cell-actions="{ item }">
              <BaseButton 
                @click="applyStockUpdate(item)" 
                :disabled="!item.tempStockAdjust || item.tempStockAdjust == 0"
                variant="primary"
                class="px-4 py-2 text-[0.6rem]"
              >
                GÜNCELLE
              </BaseButton>
            </template>
          </BaseTable>
`;
content = content.replace(stockTableRegex, stockTableNew.trim());

// ======================== IMPORTS & COLUMNS ========================
const scriptSetupIndex = content.indexOf('<script setup>');
const endOfImportsIndex = content.indexOf('const props = defineProps({');

let importsSection = content.slice(scriptSetupIndex, endOfImportsIndex);

if (!importsSection.includes('BaseTable')) {
    importsSection = importsSection.replace(
        "import BaseButton from '../base/BaseButton.vue'",
        "import BaseButton from '../base/BaseButton.vue'\nimport BaseTable from '../base/BaseTable.vue'\nimport BaseCard from '../base/BaseCard.vue'"
    );
    content = content.slice(0, scriptSetupIndex) + importsSection + content.slice(endOfImportsIndex);
}

const columnsToInsert = `
const unitColumns = [
  { key: 'name', label: 'BİRİM ADI' },
  { key: 'shortName', label: 'KISA KOD' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right' }
];

const groupColumns = [
  { key: 'name', label: 'GRUP ADI' },
  { key: 'productCount', label: 'ÜRÜN SAYISI' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right' }
];

const productColumns = [
  { key: 'product', label: 'GÖRSEL / İSİM' },
  { key: 'group', label: 'GRUP' },
  { key: 'unit', label: 'BİRİM' },
  { key: 'stock', label: 'STOK' },
  { key: 'price', label: 'FİYAT' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right' }
];

const stockColumns = [
  { key: 'product', label: 'ÜRÜN ADI' },
  { key: 'stockStatus', label: 'STOK DURUMU' },
  { key: 'adjust', label: 'MİKTAR AYARI' },
  { key: 'actions', label: 'İŞLEMLER', align: 'right' }
];

`;

const viewModeLocalIndex = content.indexOf('const productViewModeLocal = ref(props.viewMode)');
content = content.slice(0, viewModeLocalIndex + 48) + '\n' + columnsToInsert + content.slice(viewModeLocalIndex + 48);


fs.writeFileSync(path, content, 'utf8');
console.log('Product refactoring script done!');
