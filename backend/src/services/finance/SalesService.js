const {
    SalesTransaction,
    SalesItem,
    SalesPayment,
    Product,
    ProductGroup,
    ProductRecipe,
    FinancialAccount,
    FinancialTransaction,
    Member,
    User,
    sequelize
} = require('../../models');
const { Op } = require('sequelize');

class SalesService {
    /**
     * Get or create a Guest financial account for a branch
     */
    static async getGuestAccount(branchId, companyId) {
        try {
            // Find dedicated guest account for this branch
            let guestAccount = await FinancialAccount.findOne({
                where: {
                    entityType: 'GUEST',
                    entityId: branchId,
                    isSystemAccount: true
                }
            });

            if (!guestAccount) {
                // Create one if not exists
                guestAccount = await FinancialAccount.create({
                    entityType: 'GUEST',
                    entityId: branchId,
                    accountName: 'SERBEST SATIŞ HESABI',
                    accountCode: `MİSAFİR-${branchId.split('-')[0]}`,
                    balance: 0,
                    debtLimit: 0,
                    branchId,
                    companyId,
                    isSystemAccount: true,
                    isActive: true
                });
            }

            return guestAccount;
        } catch (err) {
            console.error('❌ Guest account error:', err.message);
            throw err;
        }
    }

    /**
     * Initiate sale - validate entity and retrieve financial account
     */
    static async initiateSale(entityId, entityType, userId) {
        try {
            // Handle Guest Sale
            if (entityType === 'GUEST') {
                const user = await User.findByPk(userId);
                if (!user) throw new Error('Kullanıcı bulunamadı.');
                const guestAccount = await this.getGuestAccount(user.branchId, user.companyId);
                return {
                    financialAccount: guestAccount,
                    entityDetails: { id: user.branchId, fullName: 'SERBEST MÜŞTERİ', phone: '0000000000' }
                };
            }

            // Validate entity type
            if (!['MEMBER', 'USER', 'INSTRUCTOR'].includes(entityType)) {
                throw new Error('Geçersiz entity tipi. MEMBER, USER veya INSTRUCTOR olmalıdır.');
            }

            // Find financial account
            let financialAccount = await FinancialAccount.findOne({
                where: {
                    entityType,
                    entityId,
                    isActive: true
                },
                attributes: ['id', 'entityType', 'entityId', 'balance', 'cashBalance', 'posBalance', 'bankBalance', 'prepaidBalance', 'debtLimit', 'totalDebit', 'totalCredit', 'isActive']
            });

            if (!financialAccount) {
                const FinancialAccountService = require('./FinancialAccountService');
                if (entityType === 'MEMBER') {
                    const member = await Member.findByPk(entityId);
                    if (member) financialAccount = await FinancialAccountService.createMemberAccount(member);
                } else if (entityType === 'USER') {
                    const user = await User.findByPk(entityId);
                    if (user) financialAccount = await FinancialAccountService.createUserAccount(user, user.branchId, user.companyId);
                } else if (entityType === 'INSTRUCTOR') {
                    const instructor = await Member.findOne({ where: { id: entityId, profileType: 'INSTRUCTOR' } });
                    if (instructor) financialAccount = await FinancialAccountService.createInstructorAccount(instructor);
                }
            }

            if (!financialAccount) {
                throw new Error('Bu kişinin cari hesabı bulunmamaktadır. Satış yapılamaz.');
            }

            // Reload to get fresh data including prepaidBalance
            await financialAccount.reload({
                attributes: ['id', 'entityType', 'entityId', 'balance', 'cashBalance', 'posBalance', 'bankBalance', 'prepaidBalance', 'debtLimit', 'totalDebit', 'totalCredit', 'isActive']
            });

            console.log('💰 Financial Account after reload:', {
                id: financialAccount.id,
                balance: financialAccount.balance,
                prepaidBalance: financialAccount.prepaidBalance,
                cashBalance: financialAccount.cashBalance
            });

            // Get entity details
            let entityDetails;
            if (entityType === 'MEMBER') {
                entityDetails = await Member.findByPk(entityId, {
                    attributes: ['id', 'fullName', 'phone', 'email', 'photo']
                });
            } else if (entityType === 'USER') {
                entityDetails = await User.findByPk(entityId, {
                    attributes: ['id', 'username', 'email']
                });
            } else if (entityType === 'INSTRUCTOR') {
                entityDetails = await Member.findOne({
                    where: { id: entityId, profileType: 'INSTRUCTOR' },
                    attributes: ['id', 'fullName', 'email']
                });
            }

            if (!entityDetails) {
                throw new Error('Entity bulunamadı.');
            }

            console.log(`✅ Satış başlatıldı: ${entityType} - ${entityId}`);
            return {
                financialAccount,
                entityDetails
            };
        } catch (err) {
            console.error('❌ Satış başlatma hatası:', err.message);
            throw err;
        }
    }

    /**
     * Search entities with financial accounts
     */
    static async searchEntities(searchQuery, branchId, companyId, role) {
        try {
            const results = [];

            const where = {
                isActive: true,
                [Op.or]: [
                    { fullName: { [Op.iLike]: `%${searchQuery}%` } },
                    { memberCode: { [Op.iLike]: `%${searchQuery}%` } },
                    { phone: { [Op.iLike]: `%${searchQuery}%` } },
                    { email: { [Op.iLike]: `%${searchQuery}%` } }
                ]
            };

            // Apply filters based on role
            if (role === 'SUPER_MASTER') {
                where.companyId = companyId;
            } else {
                if (branchId) where.branchId = branchId;
                where.companyId = companyId;
            }

            console.log('🔍 [Sales Search] Query:', searchQuery, 'Role:', role, 'Company:', companyId, 'Branch:', branchId);
            console.log('🔍 [Sales Search] Where clause:', JSON.stringify(where));

            // Search members ONLY (for product sales)
            const members = await Member.findAll({
                where,
                include: [{
                    model: FinancialAccount,
                    as: 'financialAccount',
                    where: { entityType: 'MEMBER' },
                    required: false
                }],
                order: [['fullName', 'ASC']],
                limit: 20
            });

            console.log('🔍 [Sales Search] Found count:', members.length);

            members.forEach(member => {
                results.push({
                    entityType: 'MEMBER',
                    entityId: member.id,
                    name: member.fullName,
                    code: member.memberCode || member.phone,
                    phone: member.phone,
                    photo: member.photo,
                    financialAccountId: member.financialAccount?.id
                });
            });

            return results;
        } catch (err) {
            console.error('❌ Entity arama hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get frequent/favorite products for quick sale
     */
    static async getFrequentProducts(branchId, limit = 20) {
        try {
            // Get favorite products first
            const favoriteProducts = await Product.findAll({
                where: {
                    [Op.or]: [
                        { branchId },
                        { branchId: null }
                    ],
                    isActive: true,
                    isFavorite: true
                },
                include: [{
                    model: ProductGroup,
                    as: 'group',
                    attributes: ['id', 'name']
                }],
                limit
            });

            // If not enough favorites, get most sold products
            if (favoriteProducts.length < limit) {
                const mostSold = await sequelize.query(`
                    SELECT p.*, COUNT(si.id) as sales_count
                    FROM "Products" p
                    INNER JOIN "SalesItems" si ON p.id = si."productId"
                    WHERE (p."branchId" = :branchId OR p."branchId" IS NULL) AND p."isActive" = true
                    GROUP BY p.id
                    ORDER BY sales_count DESC
                    LIMIT :remaining
                `, {
                    replacements: {
                        branchId,
                        remaining: limit - favoriteProducts.length
                    },
                    type: sequelize.QueryTypes.SELECT
                });

                return [...favoriteProducts, ...mostSold];
            }

            return favoriteProducts;
        } catch (err) {
            console.error('❌ Sık satılan ürünler getirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Calculate cart total with 2 decimal precision
     */
    static async calculateCartTotal(cartItems) {
        try {
            const total = cartItems.reduce((sum, item) => {
                return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
            }, 0);

            return parseFloat(total.toFixed(2));
        } catch (err) {
            console.error('❌ Sepet toplamı hesaplama hatası:', err.message);
            throw err;
        }
    }

    /**
     * Check stock availability for a product
     */
    static async checkStockAvailability(productId, quantity) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new Error('Ürün bulunamadı.');
            }

            if (!product.isActive) {
                throw new Error('Pasif ürünler satılamaz.');
            }

            if (product.type === 'KARMA') {
                const recipe = await ProductRecipe.findAll({
                    where: { productId },
                    include: [{ model: Product, as: 'component' }]
                });

                if (!recipe || recipe.length === 0) {
                    throw new Error(`'${product.name}' bir karma ürün fakat reçetesi tanımlanmamış.`);
                }

                for (const item of recipe) {
                    const needed = parseFloat(item.quantity) * parseFloat(quantity);
                    const available = parseFloat(item.component?.stock || 0);
                    if (needed > available) {
                        return {
                            available: false,
                            message: `Yetersiz malzeme: ${item.component?.name || 'Bileşen'} (Gereken: ${needed}, Mevcut: ${available})`
                        };
                    }
                }

                return { available: true };
            }

            const availableStock = parseFloat(product.stock || 0);
            const requestedQty = parseFloat(quantity);

            if (requestedQty > availableStock) {
                return {
                    available: false,
                    message: `Yetersiz stok. Mevcut: ${availableStock}, Talep: ${requestedQty}`
                };
            }

            return {
                available: true,
                availableStock
            };
        } catch (err) {
            console.error('❌ Stok kontrolü hatası:', err.message);
            throw err;
        }
    }

    /**
     * Validate entire cart against stock and other rules
     */
    static async validateCart(cartItems, financialAccountId) {
        try {
            if (!cartItems || cartItems.length === 0) {
                throw new Error('Sepet boş. En az bir ürün ekleyiniz.');
            }

            // Check stock for each item
            for (const item of cartItems) {
                const stockCheck = await this.checkStockAvailability(
                    item.productId,
                    item.quantity
                );

                if (!stockCheck.available) {
                    throw new Error(stockCheck.message);
                }
            }

            // Calculate total
            const total = await this.calculateCartTotal(cartItems);

            // Get financial account for debt limit check
            const account = await FinancialAccount.findByPk(financialAccountId);
            if (!account) {
                throw new Error('Cari hesap bulunamadı.');
            }

            // Check debt limit
            const debtLimitCheck = await this.validateDebtLimit(account, total);

            return {
                valid: true,
                total,
                debtLimitCheck
            };
        } catch (err) {
            console.error('❌ Sepet doğrulama hatası:', err.message);
            throw err;
        }
    }

    /**
     * Validate debt limit using formula: (balance - amount) >= (-1 × debtLimit)
     */
    static async validateDebtLimit(account, saleAmount) {
        try {
            const balance = parseFloat(account.balance);
            const debtLimit = parseFloat(account.debtLimit || 0);
            const amount = parseFloat(saleAmount);

            // If debtLimit is precisely 0, it indicates an unlimited debt line capability
            if (debtLimit === 0) {
                return {
                    allowed: true,
                    availableCredit: amount + 1, // Dummy sufficient value
                    remainingCredit: 1,
                    nearLimit: false,
                    warning: null
                };
            }

            const newBalance = balance - amount;
            const minAllowedBalance = -1 * debtLimit;

            const allowed = newBalance >= minAllowedBalance;
            const availableCredit = balance + debtLimit;
            const remainingCredit = availableCredit - amount;

            // Check if within 10% of limit
            const nearLimit = remainingCredit <= (debtLimit * 0.1) && remainingCredit > 0;

            return {
                allowed,
                availableCredit,
                remainingCredit,
                nearLimit,
                warning: !allowed ? `Borç limiti aşılıyor. Mevcut limit: ${debtLimit} TL, Talep: ${amount} TL` : null
            };
        } catch (err) {
            console.error('❌ Borç limiti kontrolü hatası:', err.message);
            throw err;
        }
    }

    /**
     * Validate payments match sale total
     */
    static async validatePayments(payments, saleTotal) {
        try {
            if (!payments || payments.length === 0) {
                // No payment means debt sale
                return {
                    valid: true,
                    isDebtSale: true
                };
            }

            const paymentSum = payments.reduce((sum, payment) => {
                const amt = parseFloat(payment.amount);
                if (isNaN(amt)) throw new Error('Geçersiz ödeme tutarı tespit edildi.');
                return sum + amt;
            }, 0);

            const total = parseFloat(saleTotal);
            if (isNaN(total)) throw new Error('Geçersiz satış toplamı.');

            const difference = Math.abs(paymentSum - total);

            // Allow 0.01 difference for rounding
            if (difference > 0.01) {
                return {
                    valid: false,
                    error: `Ödeme tutarı (${paymentSum.toFixed(2)}) satış tutarına (${total.toFixed(2)}) eşit değil.`
                };
            }

            return {
                valid: true,
                isDebtSale: false
            };
        } catch (err) {
            console.error('❌ Ödeme doğrulama hatası:', err.message);
            throw err;
        }
    }

    /**
     * Calculate remaining unpaid amount
     */
    static calculateRemainingAmount(saleTotal, payments) {
        const paidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        return parseFloat((saleTotal - paidAmount).toFixed(2));
    }

    /**
     * Complete sale transaction (atomic operation)
     */
    static async completeSale(saleData, userId) {
        const transaction = await sequelize.transaction();

        try {
            const {
                entityId,
                entityType,
                financialAccountId,
                items,
                payments,
                totalAmount,
                branchId,
                companyId,
                notes
            } = saleData;

            if (!branchId || !companyId) {
                throw new Error('Şube veya şirket bilgisi eksik. Lütfen oturumunuzu yenileyip tekrar deneyin.');
            }

            // Validate payments
            const paymentValidation = await this.validatePayments(payments, totalAmount);
            if (!paymentValidation.valid) {
                throw new Error(paymentValidation.error);
            }

            const isDebtSale = paymentValidation.isDebtSale;
            const paidAmount = payments ? payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;

            // Create sales transaction
            const salesTransaction = await SalesTransaction.create({
                transactionDate: new Date(),
                totalAmount,
                entityType,
                entityId,
                financialAccountId,
                isPaid: !isDebtSale,
                paidAmount,
                status: 'COMPLETED',
                branchId,
                companyId,
                createdBy: userId,
                notes
            }, { transaction });

            // Create sales items and update stock
            for (const item of items) {
                // Create sales item
                await SalesItem.create({
                    salesTransactionId: salesTransaction.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: parseFloat((item.quantity * item.unitPrice).toFixed(2))
                }, { transaction });

                // Update product stock
                const product = await Product.findByPk(item.productId, { transaction });
                if (!product) {
                    throw new Error(`Ürün bulunamadı: ${item.productId}`);
                }

                if (product.type === 'KARMA') {
                    // KARMA Product: Deduct stock from components
                    const recipe = await ProductRecipe.findAll({
                        where: { productId: product.id },
                        transaction
                    });

                    for (const ingredient of recipe) {
                        const component = await Product.findByPk(ingredient.componentProductId, { transaction });
                        if (!component) throw new Error(`Bileşen ürün bulunamadı (ID: ${ingredient.componentProductId})`);

                        const deduction = parseFloat(ingredient.quantity) * parseFloat(item.quantity);
                        const currentStock = parseFloat(component.stock || 0);

                        if (currentStock < deduction) {
                            throw new Error(`Yetersiz malzeme: ${component.name}. Gereken: ${deduction}, Mevcut: ${currentStock}`);
                        }

                        await component.update({ stock: currentStock - deduction }, { transaction });
                        console.log(`[SALES] Karma bileşeni düşüldü: ${component.name}, Miktar: ${deduction}`);
                    }
                } else {
                    // STANDART / HAMMADDE Product: Direct deduction
                    const currentStock = parseFloat(product.stock || 0);
                    const sellQuantity = parseFloat(item.quantity || 0);
                    const newStock = currentStock - sellQuantity;

                    if (newStock < 0) {
                        throw new Error(`Yetersiz stok: ${product.name} (Mevcut: ${currentStock})`);
                    }

                    await product.update({ stock: newStock }, { transaction });
                }
            }

            // Process payments and create financial transactions
            if (payments && payments.length > 0) {
                await this.processPayments(
                    salesTransaction.id,
                    payments,
                    financialAccountId,
                    branchId,
                    companyId,
                    userId,
                    transaction
                );
            } else {
                // Debt sale - create DEBIT transaction
                await this.createDebitTransaction(
                    financialAccountId,
                    totalAmount,
                    salesTransaction.id,
                    branchId,
                    companyId,
                    userId,
                    transaction
                );
            }

            await transaction.commit();

            console.log(`✅ Satış tamamlandı: ${salesTransaction.id} - ${totalAmount} TL`);
            return salesTransaction;
        } catch (err) {
            await transaction.rollback();
            console.error('❌ Satış tamamlama hatası:', err.message);
            throw err;
        }
    }

    /**
     * Process payments and create financial transactions
     */
    static async processPayments(salesTransactionId, payments, financialAccountId, branchId, companyId, userId, transaction) {
        try {
            const account = await FinancialAccount.findByPk(financialAccountId, { transaction });
            if (!account) {
                throw new Error('Cari hesap bulunamadı.');
            }

            for (const payment of payments) {
                const { method, amount } = payment;

                // Create financial transaction (CREDIT)
                const financialTransaction = await FinancialTransaction.create({
                    financialAccountId,
                    transactionType: 'CREDIT',
                    amount,
                    description: `Ürün Satışı`,
                    category: 'PRODUCT_SALE',
                    branchId,
                    companyId,
                    createdBy: userId,
                    salesTransactionId
                }, { transaction });

                // Create sales payment record
                await SalesPayment.create({
                    salesTransactionId,
                    paymentMethod: method,
                    amount,
                    financialTransactionId: financialTransaction.id
                }, { transaction });

                // Update account balances
                await this.updateAccountBalances(account, method, amount, transaction);
            }
        } catch (err) {
            console.error('❌ Ödeme işleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Update account balances based on payment method
     */
    static async updateAccountBalances(account, paymentMethod, amount, transaction) {
        try {
            const amountFloat = parseFloat(amount);

            // Update main balance
            await account.update({
                balance: sequelize.literal(`"balance" + ${amountFloat}`),
                totalCredit: sequelize.literal(`"totalCredit" + ${amountFloat}`)
            }, { transaction });

            // Update specific balance field based on payment method
            if (paymentMethod === 'CASH') {
                await account.update({
                    cashBalance: sequelize.literal(`"cashBalance" + ${amountFloat}`)
                }, { transaction });
            } else if (paymentMethod === 'CREDIT_CARD') {
                await account.update({
                    posBalance: sequelize.literal(`"posBalance" + ${amountFloat}`)
                }, { transaction });
            } else if (paymentMethod === 'BANK_TRANSFER') {
                await account.update({
                    bankBalance: sequelize.literal(`"bankBalance" + ${amountFloat}`)
                }, { transaction });
            }
        } catch (err) {
            console.error('❌ Bakiye güncelleme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Create debit transaction for debt sales
     */
    static async createDebitTransaction(financialAccountId, amount, salesTransactionId, branchId, companyId, userId, transaction) {
        try {
            const account = await FinancialAccount.findByPk(financialAccountId, { transaction });
            if (!account) {
                throw new Error('Cari hesap bulunamadı.');
            }

            // Calculate prepaid usage first
            const amountFloat = parseFloat(amount);
            let prepaidUsed = 0;
            let finalDebtAmount = amountFloat;

            const prepaidBalance = parseFloat(account.prepaidBalance || 0);

            if (prepaidBalance > 0) {
                if (prepaidBalance >= amountFloat) {
                    prepaidUsed = amountFloat;
                    finalDebtAmount = 0;
                } else {
                    prepaidUsed = prepaidBalance;
                    finalDebtAmount = amountFloat - prepaidBalance;
                }
            }

            // Create DEBIT transaction
            await FinancialTransaction.create({
                financialAccountId,
                transactionType: 'DEBIT',
                amount,
                description: `Ürün Satışı (Borç)`,
                category: 'PRODUCT_SALE',
                paymentMethod: 'CARİ',
                branchId,
                companyId,
                createdBy: userId,
                prepaidUsed: prepaidUsed || 0,
                salesTransactionId
            }, { transaction });

            // Update account balances
            const updateData = {};

            if (prepaidUsed > 0) {
                updateData.prepaidBalance = sequelize.literal(`"prepaidBalance" - ${prepaidUsed}`);
            }

            // Important: We ALWAYS subtract the FULL amount from balance and totalDebit
            // because the PREPAID_LOAD (CREDIT) already added the money to the balance.
            updateData.balance = sequelize.literal(`"balance" - ${amountFloat}`);
            updateData.totalDebit = sequelize.literal(`"totalDebit" + ${amountFloat}`);

            await account.update(updateData, { transaction });
        } catch (err) {
            console.error('❌ Borç işlemi oluşturma hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get sales history for an entity
     */
    static async getSalesHistory(entityId, entityType, filters = {}) {
        try {
            const { page = 1, limit = 50 } = filters;
            const offset = (page - 1) * limit;

            const where = {
                entityId,
                entityType
            };

            if (filters.startDate && filters.endDate) {
                where.transactionDate = {
                    [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
                };
            }

            if (filters.status) {
                where.status = filters.status;
            }

            const { count, rows: sales } = await SalesTransaction.findAndCountAll({
                where,
                include: [
                    {
                        model: SalesItem,
                        as: 'items'
                    },
                    {
                        model: SalesPayment,
                        as: 'payments'
                    }
                ],
                order: [['transactionDate', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            return {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                sales
            };
        } catch (err) {
            console.error('❌ Satış geçmişi getirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Get sale details by ID
     */
    static async getSaleDetails(saleId) {
        try {
            const sale = await SalesTransaction.findByPk(saleId, {
                include: [
                    {
                        model: SalesItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'imageUrl']
                        }]
                    },
                    {
                        model: SalesPayment,
                        as: 'payments'
                    },
                    {
                        model: FinancialAccount,
                        as: 'account'
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'username']
                    }
                ]
            });

            if (!sale) {
                throw new Error('Satış bulunamadı.');
            }

            return sale;
        } catch (err) {
            console.error('❌ Satış detayı getirme hatası:', err.message);
            throw err;
        }
    }

    /**
     * Cancel sale (reverse all transactions)
     */
    static async cancelSale(saleId, userId, reason) {
        const transaction = await sequelize.transaction();

        try {
            const sale = await SalesTransaction.findByPk(saleId, {
                include: [
                    { model: SalesItem, as: 'items' },
                    { model: SalesPayment, as: 'payments' }
                ],
                transaction
            });

            if (!sale) {
                throw new Error('Satış bulunamadı.');
            }

            if (sale.status === 'CANCELLED') {
                throw new Error('Bu satış zaten iptal edilmiş.');
            }

            // Restore stock
            for (const item of sale.items) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (product) {
                    await product.update({
                        stock: sequelize.literal(`"stock" + ${item.quantity}`)
                    }, { transaction });
                }
            }

            // Reverse financial transactions
            if (sale.payments && sale.payments.length > 0) {
                for (const payment of sale.payments) {
                    // Create reverse DEBIT transaction
                    await FinancialTransaction.create({
                        financialAccountId: sale.financialAccountId,
                        transactionType: 'DEBIT',
                        amount: payment.amount,
                        description: `Satış İptali - ${payment.paymentMethod} - ${reason}`,
                        category: 'PRODUCT_SALE_CANCEL',
                        branchId: sale.branchId,
                        companyId: sale.companyId,
                        createdBy: userId
                    }, { transaction });

                    // Update account balances (reverse)
                    const account = await FinancialAccount.findByPk(sale.financialAccountId, { transaction });
                    await this.reverseAccountBalances(account, payment.paymentMethod, payment.amount, transaction);
                }
            } else {
                // Reverse debt transaction (DEBIT becomes CREDIT)
                await FinancialTransaction.create({
                    financialAccountId: sale.financialAccountId,
                    transactionType: 'CREDIT',
                    amount: sale.totalAmount,
                    description: `Satış İptali (Borç İadesi) - ${reason}`,
                    category: 'PRODUCT_SALE_CANCEL',
                    branchId: sale.branchId,
                    companyId: sale.companyId,
                    createdBy: userId
                }, { transaction });

                const account = await FinancialAccount.findByPk(sale.financialAccountId, { transaction });
                await account.update({
                    balance: sequelize.literal(`"balance" + ${sale.totalAmount}`),
                    totalDebit: sequelize.literal(`"totalDebit" - ${sale.totalAmount}`)
                }, { transaction });
            }

            // Mark sale as cancelled
            await sale.update({
                status: 'CANCELLED',
                notes: `${sale.notes || ''}\n\nİptal Nedeni: ${reason}\nİptal Eden: ${userId}\nİptal Tarihi: ${new Date().toISOString()}`
            }, { transaction });

            await transaction.commit();

            console.log(`✅ Satış iptal edildi: ${saleId}`);
            return sale;
        } catch (err) {
            await transaction.rollback();
            console.error('❌ Satış iptal hatası:', err.message);
            throw err;
        }
    }

    /**
     * Reverse account balances (for cancellation)
     */
    static async reverseAccountBalances(account, paymentMethod, amount, transaction) {
        try {
            const amountFloat = parseFloat(amount);

            // Update main balance
            await account.update({
                balance: sequelize.literal(`"balance" - ${amountFloat}`),
                totalCredit: sequelize.literal(`"totalCredit" - ${amountFloat}`)
            }, { transaction });

            // Update specific balance field
            if (paymentMethod === 'CASH') {
                await account.update({
                    cashBalance: sequelize.literal(`"cashBalance" - ${amountFloat}`)
                }, { transaction });
            } else if (paymentMethod === 'CREDIT_CARD') {
                await account.update({
                    posBalance: sequelize.literal(`"posBalance" - ${amountFloat}`)
                }, { transaction });
            } else if (paymentMethod === 'BANK_TRANSFER') {
                await account.update({
                    bankBalance: sequelize.literal(`"bankBalance" - ${amountFloat}`)
                }, { transaction });
            }
        } catch (err) {
            console.error('❌ Bakiye geri alma hatası:', err.message);
            throw err;
        }
    }
}

module.exports = SalesService;

