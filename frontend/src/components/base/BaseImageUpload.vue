<template>
  <div class="flex flex-col items-center gap-4 group">
    <div 
      class="relative bg-slate-950 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden hover:border-amber-500 transition-colors cursor-pointer group/photo shadow-xl"
      :style="{ width: props.width, height: props.height }"
      @click="triggerFileInput"
    >
      <img v-if="fullSrc" :src="fullSrc" class="w-full h-full object-cover transition-transform group-hover/photo:scale-110" />
      <div v-else class="flex flex-col items-center gap-2 text-slate-600 group-hover/photo:text-amber-500 transition-colors">
        <Camera class="w-8 h-8" />
        <span class="text-ui-base font-ui-normal uppercase tracking-ui text-center px-2">Resim Seç (JPG/PNG)</span>
      </div>
      
      <!-- Overlay on Hover -->
      <div v-if="fullSrc" class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity gap-4">
        <button type="button" @click.stop="triggerFileInput" class="text-white hover:text-amber-500 transition-colors p-2" title="Değiştir">
          <Edit class="w-6 h-6" />
        </button>
        <button type="button" @click.stop="showPreviewModal = true" class="text-white hover:text-amber-500 transition-colors p-2" title="Büyüt">
          <Search class="w-6 h-6" />
        </button>
      </div>
      <div v-else class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
        <Camera class="w-6 h-6 text-white" />
      </div>
    </div>

    <!-- Hidden Input -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      class="hidden" 
      @change="handleFileSelect" 
    />

    <!-- Remove Photo Button -->
    <button 
      v-if="fullSrc" 
      type="button"
      @click.stop="removePhoto" 
      class="text-[0.6rem] font-black text-rose-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 bg-rose-500/5 px-2 py-1 border border-rose-500/20"
    >
      <Trash2 class="w-3 h-3" /> FOTOĞRAFI KALDIR
    </button>

    <!-- Full Size Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreviewModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm" @click="showPreviewModal = false">
        <div class="relative w-[350px] flex flex-col items-center gap-4" @click.stop>
          <div class="w-[350px] h-[350px] bg-slate-900 border border-slate-700 p-2 shadow-2xl">
           <img :src="fullSrc" class="w-full h-full object-cover" />
          </div>
          
          <BaseActionFooter local>
            <BaseButton variant="dark" size="icon" square @click="showPreviewModal = false" title="KAPAT">
              <template #icon><X class="w-5 h-5" /></template>
            </BaseButton>
          </BaseActionFooter>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Camera, Edit, Trash2, Search, X } from 'lucide-vue-next'
import BaseActionFooter from './BaseActionFooter.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: String, // String (URL path from server)
  width: {
    type: String,
    default: '8rem' // 128px (w-32)
  },
  height: {
    type: String,
    default: '8rem' // 128px (h-32)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const apiBaseUrl = `http://${window.location.hostname}:5000`
const previewUrl = ref(null)
const showPreviewModal = ref(false)
const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const fullSrc = computed(() => {
  if (previewUrl.value) return previewUrl.value
  if (!props.modelValue) return null
  if (props.modelValue.startsWith('data:') || props.modelValue.startsWith('http')) return props.modelValue
  
  // Ensure modelValue starts with a slash if prepending
  const path = props.modelValue.startsWith('/') ? props.modelValue : `/${props.modelValue}`
  return `${apiBaseUrl}${path}`
})

// Clear preview when modelValue changes externally to something new
watch(() => props.modelValue, (newVal) => {
  if (newVal && previewUrl.value) {
    // If we just got a path from the server that matches what we'd expect after upload,
    // we can clear the local preview to use the server one.
    // For now, let's just clear it whenever modelValue becomes a string (and not null)
    previewUrl.value = null
  }
})

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    // Sadece resimleri sıkıştır
    if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const MAX_WIDTH = 800; // max width
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            // Always convert to JPEG to ensure consistent size reduction
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(newFile);
          } else {
            reject(new Error("Sıkıştırma başarısız oldu"));
          }
        }, 'image/jpeg', 0.82); // %82 kalite
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (file) {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    // Orijinali ile hemen önizleme göster
    previewUrl.value = URL.createObjectURL(file)
    
    try {
        const compressedFile = await compressImage(file)
        console.log(`Orijinal: ${(file.size/1024).toFixed(2)}KB, Sıkıştırılmış: ${(compressedFile.size/1024).toFixed(2)}KB`)
        emit('change', compressedFile) 
    } catch (err) {
        console.error("Görsel sıkıştırılamadı:", err)
        emit('change', file) // Hata durumunda orijinali yolla
    }
  }
}

const removePhoto = (e) => {
  e.stopPropagation()
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  emit('update:modelValue', null)
  emit('change', null)
}
</script>
