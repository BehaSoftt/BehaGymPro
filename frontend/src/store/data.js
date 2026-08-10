import { defineStore } from 'pinia'
import { ref } from 'vue'
import { branchService } from '../services/admin/branchService'
import { companyService } from '../services/admin/companyService'
import { specialtyService } from '../services/sport/specialtyService'
import { packageService } from '../services/lesson/packageService'
import { exerciseService } from '../services/training/exerciseService'
import { instructorService } from '../services/instructor/instructorService'

export const useDataStore = defineStore('data', () => {
    // State
    const branches = ref([])
    const companies = ref([])
    const specialties = ref([])
    const packages = ref([])
    const exercises = ref([])
    const instructors = ref([])

    const lastRefresh = ref(Date.now())

    const loading = ref({
        branches: false,
        companies: false,
        specialties: false,
        packages: false,
        exercises: false,
        instructors: false
    })

    // Actions
    const triggerGlobalRefresh = () => {
        lastRefresh.value = Date.now()
    }

    const fetchCompanies = async (force = false) => {
        if (companies.value.length > 0 && !force) return
        loading.value.companies = true
        try {
            companies.value = await companyService.getAll()
        } catch (err) {
            console.error('Şirketler yüklenemedi:', err)
        } finally {
            loading.value.companies = false
        }
    }

    const fetchBranches = async (force = false) => {
        if (branches.value.length > 0 && !force) return
        loading.value.branches = true
        try {
            const data = await branchService.getAll()
            branches.value = (data || []).map(b => {
                if (b.name && (b.name.toLowerCase().includes('behasoft') || b.name.toLowerCase().includes('headquarters'))) {
                    return { ...b, name: b.name.replace(/behasoft|headquarters/gi, '').trim() || 'Merkez Şube' };
                }
                return b;
            })
        } catch (err) {
            console.error('Şubeler yüklenemedi:', err)
        } finally {
            loading.value.branches = false
        }
    }

    const fetchSpecialties = async (force = false) => {
        if (specialties.value.length > 0 && !force) return
        loading.value.specialties = true
        try {
            specialties.value = await specialtyService.getAll()
            console.log(`[DATASTORE] Specialties fetched: ${specialties.value.length}`)
        } catch (err) {
            console.error('Branşlar yüklenemedi:', err)
        } finally {
            loading.value.specialties = false
        }
    }

    const fetchPackages = async (force = false) => {
        if (packages.value.length > 0 && !force) return
        loading.value.packages = true
        try {
            const response = await packageService.getAll()
            packages.value = response.packages || []
        } catch (err) {
            console.error('Paketler yüklenemedi:', err)
        } finally {
            loading.value.packages = false
        }
    }

    const fetchExercises = async (force = false) => {
        if (exercises.value.length > 0 && !force) return
        loading.value.exercises = true
        try {
            const res = await exerciseService.getAll()
            const data = res?.exercises || res?.data || res || []
            exercises.value = Array.isArray(data) ? data : []
            console.log(`[DATASTORE] Exercises fetched: ${exercises.value.length}`)
        } catch (err) {
            console.error('Egzersizler yüklenemedi:', err)
        } finally {
            loading.value.exercises = false
        }
    }

    const fetchInstructors = async (force = false) => {
        if (instructors.value.length > 0 && !force) return
        loading.value.instructors = true
        try {
            instructors.value = await instructorService.getAll()
        } catch (err) {
            console.error('Eğitmenler yüklenemedi:', err)
        } finally {
            loading.value.instructors = false
        }
    }

    // Initialize all common data (Sadece her zaman gereken temel veriler)
    const initAppData = async () => {
        await Promise.all([
            fetchBranches(),
            fetchCompanies(),
            fetchSpecialties()
        ])
    }

    return {
        branches,
        companies,
        specialties,
        packages,
        exercises,
        instructors,
        lastRefresh,
        loading,
        triggerGlobalRefresh,
        fetchBranches,
        fetchCompanies,
        fetchSpecialties,
        fetchPackages,
        fetchExercises,
        fetchInstructors,
        initAppData
    }
})

