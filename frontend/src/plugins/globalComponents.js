import * as LucideIcons from 'lucide-vue-next'
import { defineAsyncComponent } from 'vue'

export default {
    install(app) {
        // Register common Lucide Icons globally
        const icons = [
            'Clock', 'Save', 'Trash2', 'CalendarDays', 'Info', 'Package', 
            'MessageSquare', 'Moon', 'Check', 'X', 'Plus', 'Edit', 
            'Search', 'Filter', 'ChevronDown', 'ChevronUp', 'ArrowRight', 
            'ArrowLeft', 'Download', 'Upload', 'Eye', 'Settings', 'LogOut',
            'LayoutDashboard', 'Users', 'Activity', 'CreditCard', 'QrCode',
            'Menu', 'Dumbbell', 'GraduationCap', 'BookOpen', 'ShieldCheck',
            'Home', 'Heart', 'Wallet', 'LayoutList', 'ShoppingCart', 'KeyRound',
            'ClipboardCheck', 'Trophy', 'ArrowRightLeft', 'Power', 'RefreshCcw',
            'XCircle', 'Layers', 'FileText', 'Calendar', 'Copy', 'Banknote'
        ]

        icons.forEach(iconName => {
            const icon = LucideIcons[iconName]
            if (icon) {
                app.component(iconName, icon)
            }
        })

        // Base Components Auto-Registration
        const baseComponents = import.meta.glob('../components/base/*.vue', { eager: true })
        Object.entries(baseComponents).forEach(([path, module]) => {
            const componentName = path.split('/').pop().replace(/\.\w+$/, '')
            app.component(componentName, module.default)
        })

        // Specialized common components that might be missing
        // app.component('BaseSearchFilter', defineAsyncComponent(() => import('../components/base/BaseSearchFilter.vue')))
    }
}
