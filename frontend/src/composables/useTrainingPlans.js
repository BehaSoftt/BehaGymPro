import { ref, computed } from 'vue'
import { trainingService } from '../services/training/trainingService'
import { useAlerts } from '../utils/alerts'

export function useTrainingPlans() {
  const plans = ref([])
  const totalPlans = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const loading = ref(false)
  const { toast, error: showAlertError, confirm } = useAlerts()

  const fetchPlans = async (params = {}) => {
    loading.value = true
    try {
      const response = await trainingService.getAll({
        page: 1,
        limit: 50,
        ...params
      })
      
      if (response && response.plans) {
        plans.value = response.plans
        totalPlans.value = response.total || 0
        totalPages.value = response.pages || 1
        currentPage.value = response.currentPage || 1
      } else {
        plans.value = response || []
        totalPlans.value = Array.isArray(response) ? response.length : 0
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
      showAlertError('HATA', 'Antrenman planları yüklenemedi.')
    } finally {
      loading.value = false
    }
  }

  const deletePlan = async (id) => {
    const isConfirmed = await confirm('SİLME ONAYI', 'Bu planı silmek istediğinize emin misiniz?')
    if (!isConfirmed) return false

    try {
      await trainingService.delete(id)
      plans.value = plans.value.filter(p => p.id !== id)
      toast('Plan başarıyla silindi.')
      return true
    } catch (err) {
      console.error('Error deleting plan:', err)
      showAlertError('HATA', 'Plan silinirken bir hata oluştu.')
      return false
    }
  }

  const toggleStatus = async (plan) => {
    try {
      const updatedStatus = !plan.isActive
      await trainingService.update(plan.id, { ...plan, isActive: updatedStatus })
      plan.isActive = updatedStatus
      toast(`Plan ${updatedStatus ? 'aktif' : 'pasif'} hale getirildi.`)
    } catch (err) {
      console.error('Error toggling status:', err)
      showAlertError('HATA', 'Durum güncellenemedi.')
    }
  }

  return {
    plans,
    totalPlans,
    totalPages,
    currentPage,
    loading,
    fetchPlans,
    deletePlan,
    toggleStatus
  }
}
