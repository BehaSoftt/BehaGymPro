import { defineStore } from 'pinia'
import { productService } from '../services/admin/productService'
import { saleService } from '../services/finance/saleService'
import { useAuthStore } from './auth'
import Storage from '../utils/Storage'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    selectedEntity: JSON.parse(Storage.getItem('sales_selectedEntity')) || null,
    financialAccount: JSON.parse(Storage.getItem('sales_financialAccount')) || null,
    cart: JSON.parse(Storage.getItem('sales_cart')) || [],
    products: [],
    productGroups: [],
    selectedGroup: null,
    searchQuery: '',
    paymentMethods: [],
    salesHistory: [],
    // Pagination state
    totalProducts: 0,
    totalHistory: 0,
    historyPages: 1,
    currentHistoryPage: 1,
    productPages: 1,
    currentProductPage: 1,
    loading: false,
    error: null
  }),

  getters: {
    cartTotal: (state) => {
      return state.cart.reduce((sum, item) =>
        sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0
      ).toFixed(2)
    },

    cartItemCount: (state) => state.cart.length,

    availableCredit: (state) => {
      if (!state.financialAccount) return 0
      const balance = parseFloat(state.financialAccount.balance || 0)
      const debtLimit = parseFloat(state.financialAccount.debtLimit || 0)
      return balance + debtLimit
    },

    isDebtLimitExceeded: (state) => {
      const total = parseFloat(state.cart.reduce((sum, item) =>
        sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0
      ))
      if (!state.financialAccount) return false
      const debtLimit = parseFloat(state.financialAccount.debtLimit || 0)
      if (debtLimit === 0) return false
      const available = parseFloat(state.financialAccount.balance || 0) + debtLimit
      return total > available
    },

    filteredProducts: (state) => {
      // Backend zaten filtrelenmiş veriyi döndürüyor ancak client-side filtreleme güvenliği için:
      let products = state.products
      if (state.selectedGroup) products = products.filter(p => p.groupId === state.selectedGroup)
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        products = products.filter(p => p.name.toLowerCase().includes(query))
      }
      return products
    },

    debtLimitWarning: (state) => {
      if (!state.financialAccount) return null
      const balance = parseFloat(state.financialAccount.balance || 0)
      const debtLimit = parseFloat(state.financialAccount.debtLimit || 0)
      if (debtLimit === 0) return null
      const total = parseFloat(state.cart.reduce((sum, item) =>
        sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0
      ))
      const remainingCredit = (balance + debtLimit) - total
      const isNearLimit = remainingCredit <= (debtLimit * 0.1) && remainingCredit > 0
      if (remainingCredit < 0) {
        return { type: 'error', message: `Borç limiti aşılıyor! Mevcut limit: ${debtLimit} TL` }
      } else if (isNearLimit) {
        return { type: 'warning', message: `Borç limitine yaklaşıyorsunuz. Kalan: ${remainingCredit.toFixed(2)} TL` }
      }
      return null
    }
  },

  actions: {
    persist() {
      Storage.setItem('sales_selectedEntity', JSON.stringify(this.selectedEntity))
      Storage.setItem('sales_financialAccount', JSON.stringify(this.financialAccount))
      Storage.setItem('sales_cart', JSON.stringify(this.cart))
    },

    async selectEntity(entityId, entityType) {
      this.loading = true
      this.error = null
      try {
        const data = await saleService.initiate({ entityId, entityType })
        this.selectedEntity = { id: entityId, type: entityType, details: data.entityDetails }
        this.financialAccount = data.financialAccount
        this.persist()
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Entity seçilemedi'
        return false
      } finally {
        this.loading = false
      }
    },

    async loadProducts(page = 1, limit = 50) {
      this.loading = true
      try {
        const response = await productService.getAll({ 
          isActive: true, 
          page, 
          limit,
          search: this.searchQuery,
          groupId: this.selectedGroup
        })
        this.products = response.products || []
        this.totalProducts = response.total || 0
        this.productPages = response.pages || 1
        this.currentProductPage = response.currentPage || page
      } catch (err) {
        this.error = err.response?.data?.message || 'Ürünler yüklenemedi'
      } finally {
        this.loading = false
      }
    },

    async loadProductGroups() {
      try {
        this.productGroups = await productService.getGroups()
      } catch (err) {
        this.error = err.response?.data?.message || 'Gruplar yüklenemedi'
      }
    },

    async searchEntities(query) {
      try {
        return await saleService.searchEntities(query)
      } catch (err) {
        this.error = err.response?.data?.message || 'Arama başarısız'
        return []
      }
    },

    addToCart(product) {
      const existing = this.cart.find(item => item.productId === product.id)
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          this.error = 'Stok yetersiz'
          return false
        }
        existing.quantity += 1
      } else {
        if (product.stock < 1) {
          this.error = 'Stok yetersiz'
          return false
        }
        this.cart.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          stock: product.stock,
          unit: product.productUnit?.shortName || product.unit || 'ADET'
        })
      }
      this.persist()
      return true
    },

    updateCartQuantity(productId, quantity) {
      const item = this.cart.find(i => i.productId === productId)
      if (item) {
        if (quantity > item.stock) {
          this.error = 'Stok yetersiz'
          return false
        }
        if (quantity <= 0) this.removeFromCart(productId)
        else item.quantity = quantity
      }
      this.persist()
      return true
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.productId !== productId)
      this.persist()
    },

    clearCart() {
      this.cart = []
      this.persist()
    },

    async completeSale(payments = [], isGuest = false) {
      this.loading = true
      this.error = null
      try {
        if (isGuest && !this.selectedEntity) {
          const auth = useAuthStore()
          const data = await saleService.initiate({ entityType: 'GUEST', entityId: auth.user.branchId })
          this.selectedEntity = { id: data.entityDetails.id, type: 'GUEST', details: data.entityDetails }
          this.financialAccount = data.financialAccount
        }
        if (!this.selectedEntity || !this.financialAccount) throw new Error('Müşteri veya cari hesap seçilmedi.')
        const saleData = {
          entityId: this.selectedEntity.id,
          entityType: this.selectedEntity.type,
          financialAccountId: this.financialAccount.id,
          items: this.cart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          payments,
          totalAmount: parseFloat(this.cartTotal)
        }
        const response = await saleService.complete(saleData)
        this.clearCart()
        this.selectedEntity = null
        this.financialAccount = null
        this.persist()
        return response
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Satış tamamlanamadı'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadSalesHistory(entityId, entityType, filters = {}) {
      this.loading = true
      const { page = 1, limit = 50 } = filters
      try {
        const response = await saleService.getHistory(entityId, { entityType, ...filters, page, limit })
        this.salesHistory = response.sales || []
        this.totalHistory = response.total || 0
        this.historyPages = response.pages || 1
        this.currentHistoryPage = response.currentPage || page
      } catch (err) {
        this.error = err.response?.data?.message || 'Satış geçmişi yüklenemedi'
      } finally {
        this.loading = false
      }
    },

    async getSaleDetails(saleId) {
      try {
        return await saleService.getDetails(saleId)
      } catch (err) {
        this.error = err.response?.data?.message || 'Satış detayı yüklenemedi'
        return null
      }
    },

    resetError() {
      this.error = null
    }
  }
})
