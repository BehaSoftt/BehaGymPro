<template>
  <div class="flex items-center gap-1">
    <!-- EXCEL Logo SVG -->
    <BaseButton 
      variant="ghost" 
      size="icon" 
      square
      @click="exportExcel"
      class="hover:bg-emerald-500/10 group/excel"
      title="EXCEL OLARAK DIŞARI AKTAR"
    >
      <template #icon>
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V7.5L14.5 2Z" fill="#107C41"/>
          <path d="M14.5 2V7.5H20L14.5 2Z" fill="#33C481"/>
          <path d="M11 11.5L13.5 14L11 16.5M16 11.5L13.5 14L16 16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 11.5H9V16.5H7V11.5Z" fill="white"/>
        </svg>
      </template>
    </BaseButton>

    <!-- PDF Logo SVG -->
    <BaseButton 
      variant="ghost" 
      size="icon" 
      square
      @click="exportPDF"
      class="hover:bg-rose-500/10 group/pdf"
      title="PDF OLARAK YAZDIR / KAYDET"
    >
      <template #icon>
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V7.5L14.5 2Z" fill="#E01B24"/>
          <path d="M14.5 2V7.5H20L14.5 2Z" fill="#FF4D4D"/>
          <path d="M8 12.5C8 11.6716 8.67157 11 9.5 11H11C11.8284 11 12.5 11.6716 12.5 12.5V13.5C12.5 14.3284 11.8284 15 11 15H9.5C8.67157 15 8 14.3284 8 13.5V12.5Z" stroke="white" stroke-width="1.2"/>
          <path d="M14 11H16" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M14 13H15.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M14 15H14" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </template>
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true }, // [{ key: 'name', label: 'AD SOYAD' }]
  filename: { type: String, default: 'DATA_EXPORT' }
})

const exportExcel = () => {
  // Generate CSV Content (Most spreadsheet software opens it automatically)
  const header = props.columns.map(col => col.label).join(',')
  const rows = props.data.map(row => {
    return props.columns.map(col => {
      let val = row[col.key] || ''
      // Escape commas in data
      return typeof val === 'string' ? `"${val}"` : val
    }).join(',')
  })
  
  const csvContent = "data:text/csv;charset=utf-8,\ufeff" + header + "\n" + rows.join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${props.filename}_${new Date().toISOString().split('T')[0]}.csv`) // Changed to CSV for safety without libraries
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportPDF = () => {
  // For PDF, we'll use window.print() and create a temporarily printable view
  // (In real usage, this should be handled by a specific print component or window.print)
  window.print()
}
</script>
