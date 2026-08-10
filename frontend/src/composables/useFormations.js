import { ref } from 'vue'
import { formationService } from '../services/sport/formationService'
import { useAlerts } from '../utils/alerts'

export function useFormations() {
  const formations = ref([])
  const loading = ref(false)
  const { toast, confirm, error: showAlertError } = useAlerts()

  const fetchFormations = async (specialtyId) => {
    if (!specialtyId) return
    loading.value = true
    try {
      formations.value = await formationService.getBySpecialty(specialtyId)
    } catch (err) {
      console.error(err)
      showAlertError('HATA', 'Dizilimler yüklenemedi.')
    } finally {
      loading.value = false
    }
  }

  const deleteFormation = async (id) => {
    const isConfirmed = await confirm('EMİN MİSİNİZ?', 'Bu stratejik dizilim kalıcı olarak silinecek.')
    if (!isConfirmed) return false

    loading.value = true
    try {
      await formationService.delete(id)
      toast('Dizilim silindi.')
      return true
    } catch (err) {
      console.error(err)
      showAlertError('HATA', 'Silme işlemi başarısız.')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    formations,
    loading,
    fetchFormations,
    deleteFormation
  }
}
