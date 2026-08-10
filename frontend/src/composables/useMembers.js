import { ref, computed, watch } from 'vue'
import { memberService } from '../services/member/memberService'
import { useAlerts } from '../utils/alerts'

export function useMembers() {
    const { toast, error: showAlertError, confirm, warning } = useAlerts()
    const members = ref([])
    const totalMembers = ref(0)
    const totalPages = ref(1)
    const currentPage = ref(1)
    const loading = ref(false)
    const searchQuery = ref('')
    const filterProfileType = ref('MEMBER')
    const filterGender = ref('ALL')
    const filterType = ref('ALL')
    const selectedMembers = ref([])

    const fetchMembers = async (params = {}) => {
        try {
            console.time('🚀 FRONTEND_TOTAL_LOAD_TIME'); 
            loading.value = true
            
            const normalizedParams = typeof params === 'number' ? { page: params } : params;
            const page = normalizedParams.page || 1;
            const response = await memberService.getAll({
                page: page,
                limit: normalizedParams.limit || 50,
                search: searchQuery.value,
                profileType: filterProfileType.value,
                gender: filterGender.value === 'ALL' ? undefined : filterGender.value,
                membershipType: filterType.value === 'ALL' ? undefined : filterType.value,
                ...normalizedParams
            })
            
            members.value = response.members || []
            totalMembers.value = response.total || 0
            totalPages.value = response.pages || 1
            currentPage.value = response.currentPage || page

            console.timeEnd('🚀 FRONTEND_TOTAL_LOAD_TIME'); 
        } catch (err) {
            console.error('fetchMembers error:', err)
            showAlertError('HATA', 'Üye listesi yüklenemedi.')
        } finally {
            loading.value = false
        }
    }

    const filteredMembers = computed(() => members.value)

    // Watch for search/filters
    let debounceTimer
    watch([searchQuery, filterProfileType, filterGender, filterType], () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            fetchMembers({ page: 1 })
        }, 300)
    })

    const toggleSelection = (id) => {
        if (selectedMembers.value[0] === id) {
            selectedMembers.value = []
        } else {
            selectedMembers.value = [id]
        }
    }

    const deleteMember = async (id) => {
        const member = members.value.find(m => m.id === id)
        if (!member) return

        const hasActivePackages = member.activePackages?.some(ap => ap.status === 'ACTIVE')
        if (hasActivePackages) {
            const packageNames = member.activePackages
                .filter(ap => ap.status === 'ACTIVE')
                .map(ap => ap.package?.name || 'Bilinmeyen Paket')
                .join(', ')
            
            await showAlertError(
                'ÜYE SİLİNEMEZ',
                `BU ÜYE ŞU PAKETLERE KAYITLI:\n${packageNames}`
            )
            return
        }

        const result = await confirm(
            'EMİN MİSİNİZ?',
            'Bu üye kalıcı olarak silinecek!'
        )

        if (result.isConfirmed) {
            try {
                await memberService.delete(id)
                toast('Üye başarıyla silindi.')
                await fetchMembers(currentPage.value)
            } catch (err) {
                showAlertError('HATA', 'Silme işlemi başarısız.')
            }
        }
    }

    return {
        members,
        totalMembers,
        totalPages,
        currentPage,
        loading,
        searchQuery,
        filterProfileType,
        filterGender,
        filterType,
        selectedMembers,
        fetchMembers,
        filteredMembers,
        toggleSelection,
        deleteMember
    }
}
