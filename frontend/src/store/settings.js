import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import Storage from '../utils/Storage'

const DEFAULTS = [
    { id: 'stats', key: 'showStats', label: 'TEMEL İSTATİSTİKLER', isVisible: true },
    { id: 'finance', key: 'showFinance', label: 'FİNANSAL ÖZET (KASA)', isVisible: true },
    { id: 'birthdays', key: 'showBirthdays', label: 'BUGÜN DOĞANLAR', isVisible: true },
    { id: 'expired', key: 'showExpiredMembers', label: 'SÜRESİ DOLANLAR', isVisible: true },
    { id: 'popularHours', key: 'showPopularHours', label: 'YOĞUNLUK ANALİZİ', isVisible: true },
    { id: 'staff', key: 'showStaffStatus', label: 'PERSONEL DURUMU', isVisible: true },
    { id: 'activity', key: 'showRecentActivity', label: 'SON HAREKETLER LİSTESİ', isVisible: true },
    { id: 'branches', key: 'showBranchDistribution', label: 'BRANŞ DAĞILIM GRAFİĞİ', isVisible: true },
    { id: 'churnRisk', key: 'showChurnRisk', label: 'RİSKLİ ÜYELER (CHURN)', isVisible: true },
    { id: 'revenueTarget', key: 'showRevenueTarget', label: 'GELİR HEDEFİ TAKİBİ', isVisible: true },
    { id: 'classOccupancy', key: 'showClassOccupancy', label: 'DERS DOLULUK ORANI', isVisible: true },
    { id: 'serviceHealth', key: 'showServiceHealth', label: 'SERVİS SAĞLIK DURUMU', isVisible: true },
    { id: 'acquisition', key: 'showAcquisition', label: 'YENİ ÜYE KAZANIMI', isVisible: true },
    { id: 'demographics', key: 'showDemographics', label: 'ÜYE DEMOGRAFİSİ', isVisible: true },
]

export const useSettingsStore = defineStore('settings', () => {
    const dashboardLayout = ref(JSON.parse(JSON.stringify(DEFAULTS)))
    const dashboardSaving = ref(false)
    const dashboardSaved = ref('idle') // idle | saved | error

    const movePanel = async (index, direction) => {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= dashboardLayout.value.length) return
        const temp = dashboardLayout.value[index]
        dashboardLayout.value[index] = dashboardLayout.value[newIndex]
        dashboardLayout.value[newIndex] = temp
        await saveLayout()
    }

    const saveLayout = async () => {
        dashboardSaving.value = true
        dashboardSaved.value = 'idle'
        try {
            await axios.post(`http://${window.location.hostname}:5000/api/settings/dashboard_layout`, {
                value: dashboardLayout.value
            }, {
                headers: { Authorization: `Bearer ${Storage.getItem('token')}` }
            })
            dashboardSaved.value = 'saved'
        } catch (err) {
            console.error('Layout kaydedilemedi:', err)
            dashboardSaved.value = 'error'
        } finally {
            dashboardSaving.value = false
            setTimeout(() => dashboardSaved.value = 'idle', 3000)
        }
    }

    const resetLayout = async () => {
        dashboardLayout.value = JSON.parse(JSON.stringify(DEFAULTS))
        await saveLayout()
    }

    const loadLayout = async () => {
        try {
            const res = await axios.get(`http://${window.location.hostname}:5000/api/settings/dashboard_layout`, {
                headers: { Authorization: `Bearer ${Storage.getItem('token')}` }
            })
            if (res.data) {
                dashboardLayout.value = res.data
            }
        } catch (err) {
            console.error('Layout yüklenemedi:', err)
        }
    }

    return {
        dashboardLayout,
        dashboardSaving,
        dashboardSaved,
        movePanel,
        saveLayout,
        resetLayout,
        loadLayout
    }
})
