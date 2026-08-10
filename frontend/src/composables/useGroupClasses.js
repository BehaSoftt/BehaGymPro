import { ref } from 'vue'
import { groupClassService } from '../services/lesson/groupClassService'
import { memberService } from '../services/member/memberService'
import { packageService } from '../services/lesson/packageService'
import { useAlerts } from '../utils/alerts'

export function useGroupClasses() {
  const groups = ref([])
  const totalGroups = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const members = ref([])
  const packages = ref([])
  const loading = ref(false)
  const { toast, error: showAlertError, confirm } = useAlerts()

  const fetchGroups = async (params = {}) => {
    loading.value = true
    try {
      const response = await groupClassService.getAll({
        page: 1,
        limit: 50,
        ...params
      })
      
      if (response && response.groups) {
        groups.value = response.groups
        totalGroups.value = response.total || 0
        totalPages.value = response.pages || 1
        currentPage.value = response.currentPage || 1
      } else {
        groups.value = response || []
        totalGroups.value = Array.isArray(response) ? response.length : 0
      }
    } catch (err) {
      console.error('Error fetching groups:', err)
      showAlertError('HATA', 'Grup dersleri yüklenemedi.')
    } finally {
      loading.value = false
    }
  }

  const fetchMembers = async () => {
    try {
      members.value = await memberService.getAll()
    } catch (err) {
      console.error('Error fetching members:', err)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await packageService.getAll({ type: 'GROUP' })
      packages.value = response.packages || []
    } catch (err) {
      console.error('Error fetching packages:', err)
    }
  }

  const deleteGroup = async (id) => {
    const isConfirmed = await confirm('EMİN MİSİNİZ?', 'Grup kaydı silinecektir. Bu işlem geri alınamaz!')
    if (!isConfirmed) return false

    try {
      await groupClassService.delete(id)
      groups.value = groups.value.filter(g => g.id !== id)
      toast('Grup başarıyla silindi.')
      return true
    } catch (err) {
      console.error('Error deleting group:', err)
      showAlertError('HATA', 'Grup silinirken bir hata oluştu.')
      return false
    }
  }

  const toggleStatus = async (group) => {
    try {
      const newStatus = group.status === 'ACTIVE' ? 'PASSIVE' : 'ACTIVE'
      await groupClassService.update(group.id, { ...group, status: newStatus })
      group.status = newStatus
      toast(`Grup durumu ${newStatus === 'ACTIVE' ? 'aktif' : 'pasif'} olarak güncellendi.`)
    } catch (err) {
      console.error('Error toggling status:', err)
      showAlertError('HATA', 'Durum güncellenemedi.')
    }
  }

  return {
    groups,
    totalGroups,
    totalPages,
    currentPage,
    members,
    packages,
    loading,
    fetchGroups,
    fetchMembers,
    fetchPackages,
    deleteGroup,
    toggleStatus
  }
}
