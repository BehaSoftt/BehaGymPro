const ProductService = require('../../services/ProductService');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const upload = require('../../middleware/upload');

class ProductController {
    /**
     * Yeni ürün oluştur
     */
    static createProduct = catchAsync(async (req, res) => {
        const { role, branchId: userBranchId, companyId: userCompanyId } = req.user;
        const isSuperMaster = role === 'SUPER_MASTER';
        
        const branchId = isSuperMaster ? (req.body.branchId || userBranchId) : userBranchId;
        const companyId = isSuperMaster ? (req.body.companyId || userCompanyId) : userCompanyId;

        if (!req.body.name) throw new AppError('Ürün adı gereklidir.', 400);

        const product = await ProductService.createProduct({
            ...req.body,
            branchId,
            companyId
        }, req.user.id);

        res.status(201).json(product);
    });

    /**
     * Ürünleri listele (Filtreleme ile)
     */
    static getProducts = catchAsync(async (req, res) => {
        const { groupId, isActive, isFavorite, search, companyId: qCompanyId, branchId: qBranchId, page, limit } = req.query;
        const { role, branchId: userBranchId, companyId: userCompanyId } = req.user;
        const isSuperMaster = role === 'SUPER_MASTER';

        const filters = {
            branchId: qBranchId || (isSuperMaster ? undefined : userBranchId),
            companyId: qCompanyId || (isSuperMaster ? undefined : userCompanyId),
            groupId,
            isActive: isActive === 'true' || undefined,
            isFavorite: isFavorite === 'true' || undefined,
            search,
            page,
            limit
        };

        const result = await ProductService.getProducts(filters);
        res.json(result);
    });

    /**
     * Favori ürünleri listele
     */
    static getFavoriteProducts = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const products = await ProductService.getFavoriteProducts(branchId);
        res.json(products);
    });

    /**
     * Ürün detayı
     */
    static getProductById = catchAsync(async (req, res) => {
        const product = await ProductService.getProductById(req.params.id);
        res.json(product);
    });

    /**
     * Ürün güncelle
     */
    static updateProduct = catchAsync(async (req, res) => {
        const product = await ProductService.updateProduct(req.params.id, req.body, req.user.id);
        res.json(product);
    });

    /**
     * Ürünü pasifleştir (Soft delete)
     */
    static deactivateProduct = catchAsync(async (req, res) => {
        const product = await ProductService.deactivateProduct(req.params.id, req.user.id);
        res.json({ message: 'Ürün başarıyla pasifleştirildi.', product });
    });

    /**
     * Favori durumunu değiştir
     */
    static toggleFavorite = catchAsync(async (req, res) => {
        const product = await ProductService.toggleFavorite(req.params.id, req.user.id);
        res.json(product);
    });

    /**
     * Toplu stok güncelleme
     */
    static bulkUpdateStock = catchAsync(async (req, res) => {
        const { updates } = req.body;
        const results = await ProductService.bulkUpdateStock(updates);
        res.json({ message: 'Stoklar başarıyla güncellendi.', results });
    });

    /**
     * Ürün görseli yükle
     */
    static uploadProductImage = catchAsync(async (req, res) => {
        if (!req.file) throw new AppError('Dosya seçilmedi.', 400);
        const product = await ProductService.uploadProductImage(req.params.id, req.file);
        res.json({ message: 'Görsel başarıyla yüklendi.', imageUrl: product.imageUrl });
    });

    // ==================== PRODUCT GROUP METHODS ====================

    static getProductGroups = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const groups = await ProductService.getProductGroups(branchId, companyId);
        res.json(groups);
    });

    static createProductGroup = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const group = await ProductService.createProductGroup({ ...req.body, branchId, companyId }, req.user.id);
        res.status(201).json(group);
    });

    static updateProductGroup = catchAsync(async (req, res) => {
        const group = await ProductService.updateProductGroup(req.params.id, req.body, req.user.id);
        res.json(group);
    });

    static deleteProductGroup = catchAsync(async (req, res) => {
        await ProductService.deleteProductGroup(req.params.id, req.user.id);
        res.json({ message: 'Ürün grubu silindi.' });
    });

    // ==================== PRODUCT UNIT METHODS ====================

    static getProductUnits = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const units = await ProductService.getProductUnits(branchId, companyId);
        res.json(units);
    });

    static createProductUnit = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const unit = await ProductService.createProductUnit({ ...req.body, branchId, companyId }, req.user.id);
        res.status(201).json(unit);
    });

    static updateProductUnit = catchAsync(async (req, res) => {
        const unit = await ProductService.updateProductUnit(req.params.id, req.body, req.user.id);
        res.json(unit);
    });

    static deleteProductUnit = catchAsync(async (req, res) => {
        await ProductService.deleteProductUnit(req.params.id, req.user.id);
        res.json({ message: 'Birim silindi.' });
    });
}

const uploadProductImage = upload.single('productImage');

module.exports = {
    ProductController,
    uploadProductImage
};
