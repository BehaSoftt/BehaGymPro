import { ref, computed } from 'vue';
import { packageService } from '../services/lesson/packageService';
import { specialtyService } from '../services/sport/specialtyService';
import { branchService } from '../services/admin/branchService';

export function usePackages() {
  const packages = ref([]);
  const specialties = ref([]);
  const branches = ref([]);
  const totalPackages = ref(0);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const loading = ref(false);

  const fetchPackages = async (page = 1, limit = 50) => {
    loading.value = true;
    try {
      const response = await packageService.getAll({ page, limit });
      // Backend formatına göre verileri işle
      packages.value = response.packages || [];
      totalPackages.value = response.total || 0;
      totalPages.value = response.pages || 1;
      currentPage.value = response.currentPage || page;
    } catch (err) {
      console.error('Packages fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchSpecialties = async () => {
    try {
      specialties.value = await specialtyService.getAll();
    } catch (err) {
      console.error('Specialties fetch error:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const allBranches = await branchService.getAll();
      branches.value = allBranches.filter(b => !b.name.toLowerCase().includes('behasoft'));
    } catch (err) {
      console.error('Branches fetch error:', err);
    }
  };

  const groupedSpecialties = computed(() => {
    const groups = { 'SALON': [], 'SAHA': [], 'HAVUZ': [], 'DIGER': [] };
    specialties.value.forEach(s => {
      const type = s.facilityType || 'DIGER';
      if (groups[type]) groups[type].push(s);
      else groups['DIGER'].push(s);
    });
    return groups;
  });

  return {
    packages,
    specialties,
    branches,
    loading,
    fetchPackages,
    fetchSpecialties,
    fetchBranches,
    groupedSpecialties
  };
}
