const SalesService = require('../../services/finance/SalesService');
const { catchAsync } = require('../../middleware/errorHandler');

class SalesController {
    /**
     * Satış başlat - Cari hesap bul
     */
    static initiateSale = catchAsync(async (req, res) => {
        const { entityId, entityType } = req.body;
        const result = await SalesService.initiateSale(entityId, entityType, req.user.id);
        res.json(result);
    });

    /**
     * Sepet doğrula (Stok ve borç limiti)
     */
    static validateCart = catchAsync(async (req, res) => {
        const { cartItems, financialAccountId } = req.body;
        const validation = await SalesService.validateCart(cartItems, financialAccountId);
        res.json(validation);
    });

    /**
     * Satışı tamamla
     */
    static completeSale = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const sale = await SalesService.completeSale({
            ...req.body,
            branchId,
            companyId
        }, req.user.id);
        res.status(201).json(sale);
    });

    /**
     * Satış iptal et
     */
    static cancelSale = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        const sale = await SalesService.cancelSale(id, req.user.id, reason);
        res.json({ message: 'Satış başarıyla iptal edildi.', sale });
    });

    /**
     * Satış detaylarını getir
     */
    static getSaleDetails = catchAsync(async (req, res) => {
        const sale = await SalesService.getSaleDetails(req.params.id);
        res.json(sale);
    });

    /**
     * Satış için varlık (Üye/Personel) ara
     */
    static searchEntities = catchAsync(async (req, res) => {
        const { q } = req.query;
        const results = await SalesService.searchEntities(q, req.user.branchId, req.user.companyId, req.user.role);
        res.json(results);
    });

    /**
     * Satış geçmişini getir
     */
    static getSalesHistory = catchAsync(async (req, res) => {
        const { entityId } = req.params;
        const sales = await SalesService.getSalesHistory(entityId, req.query.entityType, req.query);
        res.json(sales);
    });

    /**
     * Hızlı satış ürünlerini (Favoriler) getir
     */
    static getQuickProducts = catchAsync(async (req, res) => {
        const { limit } = req.query;
        const products = await SalesService.getFrequentProducts(req.user.branchId, limit ? parseInt(limit) : 20);
        res.json(products);
    });

    /**
     * Cari hesap detaylarını ve kişi bilgilerini getir
     */
    static getEntityAccount = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { entityType = 'MEMBER' } = req.query;
        const result = await SalesService.initiateSale(id, entityType, req.user.id);
        res.json(result);
    });
}

module.exports = SalesController;
