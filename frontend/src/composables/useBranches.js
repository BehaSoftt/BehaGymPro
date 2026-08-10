import { ref, computed } from 'vue'
import { branchService } from '../services/admin/branchService'

export function useBranches() {
  const branches = ref([])
  const loading = ref(false)

  const fetchBranches = async () => {
    loading.value = true
    try {
      const data = await branchService.getAll()
      branches.value = data
      return data
    } catch (err) {
      console.error('Şubeler yüklenemedi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    branches,
    loading,
    fetchBranches
  }
}
