import { computed } from 'vue';
import { useAuthStore } from '../store/auth';

/**
 * BEHAGYM PRO: YETKİ YÖNETİM COMPOSABLE
 * Bileşenlerde yetki kontrolünü kolaylaştırır.
 */
export function usePermissions() {
    const authStore = useAuthStore();

    const hasPermission = (key) => {
        return authStore.hasPermission(key);
    };

    const isSuperMaster = computed(() => authStore.isBehaAdmin);
    
    // Yaygın kullanılan yetkiler için hazır computed değerler
    const canManageGroups = computed(() => hasPermission('SPORT_GROUP_MANAGE'));
    const canViewTacticalBoard = computed(() => hasPermission('TACTICAL_BOARD_VIEW'));
    const canManageMembers = computed(() => hasPermission('MEMBER_MANAGE'));

    return {
        hasPermission,
        isSuperMaster,
        canManageGroups,
        canViewTacticalBoard,
        canManageMembers,
        user: computed(() => authStore.user)
    };
}
