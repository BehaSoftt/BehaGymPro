import { ref, computed } from 'vue';
import { financialService } from '../services/finance/financialService';

export function useFinancials() {
  const accounts = ref([]);
  const totalAccounts = ref(0);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const stats = ref({ totalCash: '0.00', totalPos: '0.00', totalBank: '0.00', totalBalance: '0.00' });
  const plans = ref([]);
  const totalPlans = ref(0);
  const planPages = ref(1);
  const currentPlanPage = ref(1);
  const loading = ref(false);

  const fetchAccounts = async (params = {}) => {
    loading.value = true;
    try {
      const response = await financialService.getAccounts({
        page: 1,
        limit: 50,
        ...params
      });
      
      console.log('🔵 fetchAccounts RESPONSE:', response);
      if (response && response.accounts) {
        accounts.value = response.accounts;
        totalAccounts.value = response.total || 0;
        totalPages.value = response.pages || 1;
        currentPage.value = response.currentPage || 1;
      } else {
        accounts.value = response || [];
        totalAccounts.value = Array.isArray(response) ? response.length : 0;
      }
      console.log('🔵 accounts.value set to:', accounts.value);
    } catch (err) {
      console.error('Accounts fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    try {
      stats.value = await financialService.getStats();
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchPlans = async (params = {}) => {
    loading.value = true;
    try {
      const response = await financialService.getPlans({
        page: 1,
        limit: 50,
        ...params
      });

      if (response && response.plans) {
        plans.value = response.plans;
        totalPlans.value = response.total || 0;
        planPages.value = response.pages || 1;
        currentPlanPage.value = response.currentPage || 1;
      } else {
        plans.value = response || [];
        totalPlans.value = Array.isArray(response) ? response.length : 0;
      }
    } catch (err) {
      console.error('Plans fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  const tableTotals = computed(() => {
    const totals = accounts.value.reduce((acc, curr) => {
      acc.totalCredit += parseFloat(curr.totalCredit || 0);
      acc.totalDebit += parseFloat(curr.totalDebit || 0);
      acc.balance += parseFloat(curr.balance || 0);
      return acc;
    }, { totalCredit: 0, totalDebit: 0, balance: 0 });

    return {
      ...totals,
      totalCash: parseFloat(stats.value.totalCash || 0),
      totalPos: parseFloat(stats.value.totalPos || 0),
      totalBank: parseFloat(stats.value.totalBank || 0)
    };
  });

  const planTotals = computed(() => {
    return plans.value.reduce((acc, curr) => {
      acc.totalAmount += parseFloat(curr.totalAmount || 0);
      acc.totalPaid += parseFloat(curr.paidAmount || 0);
      acc.totalRemaining += parseFloat(curr.remainingAmount || 0);
      return acc;
    }, { totalAmount: 0, totalPaid: 0, totalRemaining: 0 });
  });

  return {
    accounts,
    totalAccounts,
    totalPages,
    currentPage,
    stats,
    plans,
    totalPlans,
    planPages,
    currentPlanPage,
    loading,
    fetchAccounts,
    fetchStats,
    fetchPlans,
    tableTotals,
    planTotals
  };
}
