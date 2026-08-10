const { Product, ProductGroup, ProductUnit, SalesItem, ProductRecipe, sequelize } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

class ProductService {
    /**
     * Create new product
     */
    static async createProduct(productData, userId) {
        try {
            // Validate price (negative not allowed, 0 is allowed for raw materials/ingredients)
            if (productData.price !== undefined && parseFloat(productData.price) < 0) {
                throw new Error('Ürün fiyatı negatif olamaz.');
            }

            const product = await Product.create({
                name: productData.name,
                groupId: productData.groupId,
                unitId: productData.unitId,
                price: productData.price || 0,
                unit: productData.unit || 'ADET',
                type: productData.type || 'STANDART',
                stock: productData.stock || 0,
                imageUrl: productData.imageUrl,
                isFavorite: productData.isFavorite || false,
                isActive: true,
                branchId: productData.branchId,
                companyId: productData.companyId
            });

            // If it's a KARMA product and has a recipe, create recipe items
            if (product.type === 'KARMA' && productData.recipe && Array.isArray(productData.recipe)) {
                await Promise.all(productData.recipe.map(item =>
                    ProductRecipe.create({
                        productId: product.id,
                        componentProductId: item.componentProductId,
                        quantity: item.quantity,
                        branchId: product.branchId,
                        companyId: product.companyId
                    })
                ));
            }

            console.log(`✅ Ürün oluşturuldu: ${product.name} (ID: ${product.id})`);
            return product;
        } catch (err) {
            console.error('❌ Ürün oluşturma hatası:', err.message);
            throw err;
        }
    }

    /**
     * Update existing product
     */
    static async updateProduct(productId, productData, userId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            // Validate price if provided (allow 0, but no negative)
            if (productData.price !== undefined && parseFloat(productData.price) < 0) {
                throw new Error('Ürün fiyatı negatif olamaz.');
            }

            await product.update({
                name: productData.name !== undefined ? productData.name : product.name,
                groupId: productData.groupId !== undefined ? productData.groupId : product.groupId,
                unitId: productData.unitId !== undefined ? productData.unitId : product.unitId,
                price: productData.price !== undefined ? productData.price : product.price,
                unit: productData.unit !== undefined ? productData.unit : product.unit,
                type: productData.type !== undefined ? productData.type : product.type,
                stock: productData.stock !== undefined ? productData.stock : product.stock,
                imageUrl: productData.imageUrl !== undefined ? productData.imageUrl : product.imageUrl,
                isFavorite: productData.isFavorite !== undefined ? productData.isFavorite : product.isFavorite,
                companyId: productData.companyId !== undefined ? productData.companyId : product.companyId,
                branchId: productData.branchId !== undefined ? productData.branchId : product.branchId
            });

            // Update recipe if provided and product is KARMA
            if (product.type === 'KARMA' && productData.recipe && Array.isArray(productData.recipe)) {
                // Delete old recipe
                await ProductRecipe.destroy({ where: { productId: product.id } });

                // Create new recipe items
                await Promise.all(productData.recipe.map(item =>
                    ProductRecipe.create({
                        productId: product.id,
                        componentProductId: item.componentProductId,
                        quantity: item.quantity,
                        branchId: product.branchId,
                        companyId: product.companyId
                    })
                ));
            }

            console.log(`✅ Ürün güncellendi: ${product.name}`);
            return product;
        } catch (err) {
            console.error('❌ Ürün güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Deactivate product (soft delete)
     */
    static async deactivateProduct(productId, userId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            // We only deactivate (soft-delete), so sales records can still reference the product ID.
            await product.update({ isActive: false });

            console.log(`✅ Ürün pasifleştirildi: ${product.name}`);
            return product;
        } catch (err) {
            console.error('❌ Ürün pasifleştirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get products with filtering
     */
    static async getProducts(filters = {}) {
        try {
            const { page = 1, limit = 50 } = filters;
            const offset = (page - 1) * limit;
            const where = { isActive: true };

            if (filters.branchId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ branchId: filters.branchId }, { branchId: null }]
                });
            } else if (filters.branchId === null) {
                where.branchId = null;
            }

            if (filters.companyId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ companyId: filters.companyId }, { companyId: null }]
                });
            }

            if (filters.groupId) where.groupId = filters.groupId;
            if (filters.isActive !== undefined) where.isActive = filters.isActive;
            if (filters.isFavorite !== undefined) where.isFavorite = filters.isFavorite;

            if (filters.search) {
                where.name = { [Op.iLike]: `%${filters.search}%` };
            }

            const { count, rows: products } = await Product.findAndCountAll({
                where,
                include: [
                    { model: ProductGroup, as: 'group', attributes: ['id', 'name'] },
                    { model: ProductUnit, as: 'productUnit', attributes: ['id', 'name', 'shortName'] },
                    { model: ProductRecipe, as: 'recipe' }
                ],
                order: [
                    ['isFavorite', 'DESC'],
                    ['name', 'ASC']
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            return {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                products
            };
        } catch (err) {
            console.error('❌ Ürün listesi getirme hatası:', err);
            throw err;
        }
    }

    /**
     * Get product by ID
     */
    static async getProductById(productId) {
        let product;
        try {
            product = await Product.findByPk(productId, {
                include: [
                    { model: ProductGroup, as: 'group', attributes: ['id', 'name'] },
                    { model: ProductUnit, as: 'productUnit', attributes: ['id', 'name', 'shortName'] },
                    { model: ProductRecipe, as: 'recipe' }
                ]
            });
        } catch (includeErr) {
            console.warn(`⚠️ Ürün detayları (ilişkili verilerle) getirilemedi, sade hali deneniyor: ${includeErr.message}`);
            product = await Product.findByPk(productId);
        }

        if (!product) {
            throw new Error('Ürün bulunamadı.');
        }

        return product;
    }

    /**
     * Update stock (ADD or SUBTRACT)
     */
    static async updateStock(productId, quantity, operation = 'SUBTRACT', transaction = null) {
        try {
            const product = await Product.findByPk(productId, { transaction });

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            const currentStock = parseInt(product.stock);
            let newStock;

            if (operation === 'ADD') {
                newStock = currentStock + quantity;
            } else if (operation === 'SUBTRACT') {
                newStock = currentStock - quantity;

                if (newStock < 0) {
                    throw new Error(`Yetersiz stok. Mevcut: ${currentStock}, Talep: ${quantity}`);
                }
            } else {
                throw new Error('Geçersiz işlem tipi. ADD veya SUBTRACT olmalıdır.');
            }

            await product.update({ stock: newStock }, { transaction });

            console.log(`✅ Stok güncellendi: ${product.name} - ${currentStock} → ${newStock}`);
            return product;
        } catch (err) {
            console.error('❌ Stok güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Check if stock is low (below 10 units)
     */
    static async checkLowStock(productId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            return parseInt(product.stock) < 10;
        } catch (err) {
            console.error('❌ Düşük stok kontrolü hatası:', err.message);
            throw err;
        }
    }

    /**
     * Bulk update stock for multiple products
     */
    static async bulkUpdateStock(stockUpdates, transaction = null) {
        try {
            const results = [];

            for (const update of stockUpdates) {
                const result = await this.updateStock(
                    update.productId,
                    update.quantity,
                    update.operation || 'SUBTRACT',
                    transaction
                );
                results.push(result);
            }

            return results;
        } catch (err) {
            console.error('❌ Toplu stok güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Toggle favorite status
     */
    static async toggleFavorite(productId, userId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            await product.update({ isFavorite: !product.isFavorite });

            console.log(`✅ Favori durumu değiştirildi: ${product.name} - ${product.isFavorite}`);
            return product;
        } catch (err) {
            console.error('❌ Favori değiştirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get favorite products
     */
    static async getFavoriteProducts(branchId) {
        try {
            return await this.getProducts({
                branchId,
                isActive: true,
                isFavorite: true
            });
        } catch (err) {
            console.error('❌ Favori ürünler getirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Upload product image
     */
    static async uploadProductImage(productId, file) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Dosya boyutu 5MB\'ı aşamaz.');
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Sadece resim dosyaları yüklenebilir (JPG, PNG, WEBP).');
            }

            // Delete old image if exists
            if (product.imageUrl) {
                const { deleteFile } = require('../utils/fileHelper');
                await deleteFile(product.imageUrl);
            }

            // Save new image path
            const imageUrl = `/products/${file.filename}`;
            await product.update({ imageUrl });

            console.log(`✅ Ürün resmi yüklendi: ${product.name}`);
            return product;
        } catch (err) {
            console.error('❌ Resim yükleme hatası:', err.message);
            throw err;
        }
    }

    // ==================== PRODUCT GROUP METHODS ====================

    /**
     * Create product group
     */
    static async createProductGroup(groupData, userId) {
        try {
            const group = await ProductGroup.create({
                name: groupData.name,
                branchId: groupData.branchId,
                companyId: groupData.companyId,
                isActive: true
            });

            console.log(`✅ Ürün grubu oluşturuldu: ${group.name}`);
            return group;
        } catch (err) {
            console.error('❌ Ürün grubu oluşturma hatası:', err.message);
            throw err;
        }
    }

    /**
     * Update product group
     */
    static async updateProductGroup(groupId, groupData, userId) {
        try {
            const group = await ProductGroup.findByPk(groupId);

            if (!group) {
                throw new Error('Ürün grubu bulunamadı.');
            }

            await group.update({
                name: groupData.name !== undefined ? groupData.name : group.name
            });

            console.log(`✅ Ürün grubu güncellendi: ${group.name}`);
            return group;
        } catch (err) {
            console.error('❌ Ürün grubu güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Delete product group (only if no products)
     */
    static async deleteProductGroup(groupId, userId) {
        try {
            const group = await ProductGroup.findByPk(groupId);

            if (!group) {
                throw new Error('Ürün grubu bulunamadı.');
            }

            // Check if group has products
            const productCount = await Product.count({
                where: { groupId }
            });

            if (productCount > 0) {
                throw new Error('Bu grupta ürünler bulunmaktadır. Önce ürünleri siliniz veya başka gruba taşıyınız.');
            }

            await group.destroy();

            console.log(`✅ Ürün grubu silindi: ${group.name}`);
            return { success: true };
        } catch (err) {
            console.error('❌ Ürün grubu silme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get product groups
     */
    static async getProductGroups(branchId, companyId) {
        try {
            const where = { isActive: true };
            if (branchId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ branchId }, { branchId: null }]
                });
            }
            if (companyId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ companyId }, { companyId: null }]
                });
            }
            const groups = await ProductGroup.findAll({
                where,
                include: [
                    {
                        model: Product,
                        as: 'products',
                        attributes: ['id'],
                        where: { isActive: true },
                        required: false
                    }
                ],
                order: [['name', 'ASC']]
            });

            // Add product count to each group
            const groupsWithCount = groups.map(group => {
                const groupData = group.toJSON();
                groupData.productCount = groupData.products ? groupData.products.length : 0;
                delete groupData.products;
                return groupData;
            });

            return groupsWithCount;
        } catch (err) {
            console.error('❌ Ürün grupları getirme hatası:', err.message);
            throw err;
        }
    }

    // ==================== PRODUCT UNIT METHODS ====================

    /**
     * Create product unit
     */
    static async createProductUnit(unitData, userId) {
        try {
            const unit = await ProductUnit.create({
                name: unitData.name,
                shortName: unitData.shortName,
                branchId: unitData.branchId,
                companyId: unitData.companyId,
                isActive: true
            });

            console.log(`✅ Ürün birimi oluşturuldu: ${unit.name}`);
            return unit;
        } catch (err) {
            console.error('❌ Ürün birimi oluşturma hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get all product units
     */
    static async getProductUnits(branchId, companyId) {
        try {
            const where = { isActive: true };
            if (branchId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ branchId }, { branchId: null }]
                });
            }
            if (companyId) {
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push({
                    [Op.or]: [{ companyId }, { companyId: null }]
                });
            }

            return await ProductUnit.findAll({
                where,
                order: [['name', 'ASC']]
            });
        } catch (err) {
            console.error('❌ Ürün birimleri getirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Update product unit
     */
    static async updateProductUnit(unitId, unitData, userId) {
        try {
            const unit = await ProductUnit.findByPk(unitId);
            if (!unit) throw new Error('Birim bulunamadı.');

            await unit.update({
                name: unitData.name !== undefined ? unitData.name : unit.name,
                shortName: unitData.shortName !== undefined ? unitData.shortName : unit.shortName
            });

            return unit;
        } catch (err) {
            console.error('❌ Ürün birimi güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Delete product unit
     */
    static async deleteProductUnit(unitId, userId) {
        try {
            const unit = await ProductUnit.findByPk(unitId);
            if (!unit) throw new Error('Birim bulunamadı.');

            // Check if unit is used by products
            const productCount = await Product.count({ where: { unitId } });
            if (productCount > 0) throw new Error('Bu birimi kullanan ürünler var. Önce ürünleri güncelleyiniz.');

            await unit.destroy();
            return { success: true };
        } catch (err) {
            console.error('❌ Ürün birimi silme hatası:', err.message);
            throw err;
        }
    }
}

module.exports = ProductService;
