import { ref, computed } from 'vue';
import { privateLessonService } from '../services/lesson/privateLessonService';
import { memberService } from '../services/member/memberService';
import { instructorService } from '../services/instructor/instructorService';
import { specialtyService } from '../services/sport/specialtyService';

export function usePrivateLessons() {
  const packages = ref([]);
  const totalPackages = ref(0);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const members = ref([]);
  const instructors = ref([]);
  const specialties = ref([]);
  const loading = ref(false);

  const fetchPackages = async (params = {}) => {
    loading.value = true;
    try {
      const response = await privateLessonService.getPackages({
        page: 1,
        limit: 50,
        ...params
      });
      
      if (response && response.packages) {
        packages.value = response.packages;
        totalPackages.value = response.total || 0;
        totalPages.value = response.pages || 1;
        currentPage.value = response.currentPage || 1;
      } else {
        packages.value = Array.isArray(response) ? response : [];
        totalPackages.value = packages.value.length;
      }
    } catch (err) {
      console.error('Packages fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchDependencies = async () => {
    try {
      const [memRes, instRes, specRes] = await Promise.all([
        memberService.getAll(),
        instructorService.getAll(),
        specialtyService.getAll()
      ]);
      members.value = Array.isArray(memRes) ? memRes : (memRes.members || []);
      instructors.value = instRes;
      specialties.value = specRes;
    } catch (err) {
      console.error('Dependencies fetch error:', err);
    } finally {
      console.log('DEPENDENCIES FETCHED:', {
        membersCount: members.value.length,
        instructorsCount: instructors.value.length,
        specialtiesCount: specialties.value.length
      });
      console.log('SAMPLE MEMBER:', members.value[0]);
    }
  };

  const activePackagesCount = computed(() => packages.value.filter(p => p.status === 'ACTIVE').length);
  const totalPurchasedSessions = computed(() => packages.value.reduce((sum, p) => sum + (p.sessionCount || 0), 0));
  const totalCompletedSessions = computed(() => packages.value.reduce((sum, p) => sum + ((p.sessionCount || 0) - (p.remainingSessions || 0)), 0));
  const totalRemainingSessionsCount = computed(() => packages.value.reduce((sum, p) => sum + (p.remainingSessions || 0), 0));

  return {
    packages,
    totalPackages,
    totalPages,
    currentPage,
    members,
    instructors,
    specialties,
    loading,
    fetchPackages,
    fetchDependencies,
    activePackagesCount,
    totalPurchasedSessions,
    totalCompletedSessions,
    totalRemainingSessionsCount
  };
}
