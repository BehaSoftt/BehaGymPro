import { ref, computed } from 'vue'
import { instructorService } from '../services/instructor/instructorService'
import { useDataStore } from '../store/data'
import { useAuthStore } from '../store/auth'
import { storeToRefs } from 'pinia'

export function useInstructors() {
  const dataStore = useDataStore()
  const authStore = useAuthStore()
  const { branches, specialties: allSpecialties } = storeToRefs(dataStore)
  
  const instructors = ref([])
  const loading = ref(false)

  const isSuperMaster = computed(() => {
    const user = authStore.user
    if (!user) return false
    return user.username?.toLowerCase() === 'super_master' || 
           user.role?.toUpperCase() === 'SUPER_MASTER'
  })

  const fetchInstructors = async () => {
    loading.value = true
    try {
      const data = await instructorService.getAll()
      instructors.value = data
      return data
    } catch (err) {
      console.error('Eğitmenler yüklenemedi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSpecialtyName = (id) => {
    const s = allSpecialties.value.find(x => x.id === id)
    return s ? s.name : ''
  }

  return {
    instructors,
    loading,
    branches,
    allSpecialties,
    isSuperMaster,
    fetchInstructors,
    getSpecialtyName
  }
}
