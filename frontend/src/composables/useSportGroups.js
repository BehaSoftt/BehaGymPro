import { ref } from 'vue'
import { sportGroupService } from '../services/sport/sportGroupService'
import { useAlerts } from '../utils/alerts'

export function useSportGroups() {
  const groups = ref([])
  const loading = ref(false)
  const { toast, confirm, error: showAlertError } = useAlerts()

  const fetchGroups = async () => {
    loading.value = true
    try {
      groups.value = await sportGroupService.getAll()
    } catch (err) {
      console.error(err)
      showAlertError('HATA', 'Gruplar yüklenemedi.')
    } finally {
      loading.value = false
    }
  }

  const deleteGroup = async (id) => {
    const isConfirmed = await confirm('EMİN MİSİNİZ?', 'Bu takımı silmek istiyor musunuz? Üyelerin grup atamaları kaldırılacaktır.')
    if (!isConfirmed) return false

    loading.value = true
    try {
      await sportGroupService.delete(id)
      toast('Takım silindi.')
      await fetchGroups()
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
    groups,
    loading,
    fetchGroups,
    deleteGroup
  }
}
