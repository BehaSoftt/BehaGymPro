import { ref, computed } from 'vue'
import { specialtyService } from '../services/sport/specialtyService'

export function useSpecialties() {
  const specialties = ref([])
  const loading = ref(false)

  const fetchSpecialties = async () => {
    loading.value = true
    try {
      const data = await specialtyService.getAll()
      specialties.value = data
      return data
    } catch (err) {
      console.error('Branşlar yüklenemedi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    specialties,
    loading,
    fetchSpecialties
  }
}
