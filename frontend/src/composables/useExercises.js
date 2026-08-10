import { ref } from 'vue'
import { exerciseService } from '../services/training/exerciseService'
import { specialtyService } from '../services/sport/specialtyService'
import { useAlerts } from '../utils/alerts'

export function useExercises() {
  const exercises = ref([])
  const totalExercises = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const specialties = ref([])
  const categories = ref([])
  const loading = ref(false)
  const { toast, error: showAlertError, confirm } = useAlerts()

  const fetchExercises = async (params = {}) => {
    loading.value = true
    try {
      const response = await exerciseService.getAll({
        page: 1,
        limit: 50,
        ...params
      })
      
      if (response && response.exercises) {
        exercises.value = response.exercises
        totalExercises.value = response.total || 0
        totalPages.value = response.pages || 1
        currentPage.value = response.currentPage || 1
      } else {
        exercises.value = response || []
        totalExercises.value = Array.isArray(response) ? response.length : 0
      }
    } catch (err) {
      console.error('Error fetching exercises:', err)
      showAlertError('HATA', 'Egzersizler yüklenemedi.')
    } finally {
      loading.value = false
    }
  }

  const fetchSpecialties = async () => {
    try {
      specialties.value = await specialtyService.getAll()
    } catch (err) {
      console.error('Error fetching specialties:', err)
    }
  }

  const fetchCategories = async (specId) => {
    if (!specId) {
      categories.value = []
      return
    }
    try {
      categories.value = await specialtyService.getCategories(specId)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const deleteExercise = async (id) => {
    const isConfirmed = await confirm('SİLME ONAYI', 'Bu istasyonu silmek istediğinize emin misiniz?')
    if (!isConfirmed) return false

    try {
      await exerciseService.delete(id)
      exercises.value = exercises.value.filter(e => e.id !== id)
      toast('İstasyon başarıyla silindi.')
      return true
    } catch (err) {
      console.error('Error deleting exercise:', err)
      showAlertError('HATA', 'İstasyon silinirken bir hata oluştu.')
      return false
    }
  }

  const toggleStatus = async (ex) => {
    try {
      const updatedStatus = !ex.isActive
      await exerciseService.update(ex.id, { ...ex, isActive: updatedStatus })
      ex.isActive = updatedStatus
      toast(`İstasyon ${updatedStatus ? 'aktif' : 'pasif'} hale getirildi.`)
    } catch (err) {
      console.error('Error toggling status:', err)
      showAlertError('HATA', 'Durum güncellenemedi.')
    }
  }

  return {
    exercises,
    totalExercises,
    totalPages,
    currentPage,
    specialties,
    categories,
    loading,
    fetchExercises,
    fetchSpecialties,
    fetchCategories,
    deleteExercise,
    toggleStatus
  }
}
