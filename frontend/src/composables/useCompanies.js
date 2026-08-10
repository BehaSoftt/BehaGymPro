import { ref, computed } from 'vue'
import { companyService } from '../services/admin/companyService'

export function useCompanies() {
  const companies = ref([])
  const loading = ref(false)

  const fetchCompanies = async () => {
    loading.value = true
    try {
      const data = await companyService.getAll()
      companies.value = data
      return data
    } catch (err) {
      console.error('Şirketler yüklenemedi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    loading,
    fetchCompanies
  }
}
