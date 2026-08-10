import { ref } from 'vue'
import { beltExamService } from '../services/admin/beltExamService'
import { specialtyService } from '../services/sport/specialtyService'
import { instructorService } from '../services/instructor/instructorService'
import { useAlerts } from '../utils/alerts'

export function useBeltExams() {
  const exams = ref([])
  const totalExams = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const specialties = ref([])
  const instructors = ref([])
  const loading = ref(false)
  const { toast, error: showAlertError, confirm } = useAlerts()

  const fetchExams = async (params = {}) => {
    loading.value = true
    try {
      const response = await beltExamService.getAll({
        page: 1,
        limit: 50,
        ...params
      })
      
      if (response && response.exams) {
        exams.value = response.exams
        totalExams.value = response.total || 0
        totalPages.value = response.pages || 1
        currentPage.value = response.currentPage || 1
      } else {
        exams.value = response || []
        totalExams.value = Array.isArray(response) ? response.length : 0
      }
    } catch (err) {
      console.error('Error fetching exams:', err)
      showAlertError('HATA', 'Sınavlar yüklenemedi.')
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

  const fetchInstructors = async () => {
    try {
      instructors.value = await instructorService.getAll()
    } catch (err) {
      console.error('Error fetching instructors:', err)
    }
  }

  const deleteExam = async (id) => {
    const isConfirmed = await confirm('SİLME ONAYI', 'Sınav ve tüm katılımcı verileri silinecektir! Emin misiniz?')
    if (!isConfirmed) return false

    try {
      await beltExamService.delete(id)
      exams.value = exams.value.filter(e => e.id !== id)
      toast('Sınav başarıyla silindi.')
      return true
    } catch (err) {
      console.error('Error deleting exam:', err)
      showAlertError('HATA', 'Sınav silinirken bir hata oluştu.')
      return false
    }
  }

  const completeExam = async (id) => {
    const isConfirmed = await confirm('SINAVI TAMAMLA', "Tüm sonuçlar ve tahsilatlar tamamlandı. Sınavı arşivlemek ve üye kuşaklarını kalıcılaştırmak üzeresiniz.")
    if (!isConfirmed) return false

    try {
      await beltExamService.complete(id)
      toast('Sınav başarıyla tamamlandı.')
      await fetchExams()
      return true
    } catch (err) {
      console.error('Error completing exam:', err)
      showAlertError('HATA', err.response?.data?.message || 'Sınav tamamlanamadı.')
      return false
    }
  }

  return {
    exams,
    totalExams,
    totalPages,
    currentPage,
    specialties,
    instructors,
    loading,
    fetchExams,
    fetchSpecialties,
    fetchInstructors,
    deleteExam,
    completeExam
  }
}
