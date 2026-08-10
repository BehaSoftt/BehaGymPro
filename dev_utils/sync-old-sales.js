
const {
    SalesTransaction,
    SalesItem,
    Product,
    FinancialTransaction,
    sequelize
} = require('./backend/src/models');
const { Op } = require('sequelize');

async function syncOrphanedSales() {
    console.log('--- 🔄 Eski Silinmiş Hareketler İçin Satış Senkronizasyonu Başlatıldı ---');

    try {
        // 1. Durumu COMPLETED olan tüm satışları getir
        const completedSales = await SalesTransaction.findAll({
            where: { status: 'COMPLETED' },
            include: [{ model: SalesItem, as: 'items' }]
        });

        console.log(`🔍 Toplam ${completedSales.length} adet tamamlanmış satış inceleniyor...`);
        let fixedCount = 0;

        for (const sale of completedSales) {
            // Bu satışa bağlı herhangi bir ödeme veya borç hareketi var mı bak?
            // PRODUCT_SALE kategorisindeki hareketleri kontrol ediyoruz
            // (Eskiden salesTransactionId alanı boş olduğu için description veya tutar/hesap eşleşmesi bakmak gerekebilir ama
            // en güvenlisi SalesPayment veya description üzerinden gitmek)

            const linkedTxCount = await FinancialTransaction.count({
                where: {
                    financialAccountId: sale.financialAccountId,
                    category: 'PRODUCT_SALE',
                    amount: sale.totalAmount, // Basit bir eşleşme: Aynı hesap, aynı tutar
                    [Op.or]: [
                        { description: { [Op.iLike]: `%${sale.id}%` } },
                        {
                            createdAt: {
                                [Op.between]: [
                                    new Date(sale.createdAt.getTime() - 5000), // Satıştan 5 saniye önce/sonrası
                                    new Date(sale.createdAt.getTime() + 5000)
                                ]
                            }
                        }
                    ]
                }
            });

            // Eğer bu satışa bağlı hiç hareket bulunamadıysa, demek ki hareketi silinmiş bir "yetim" satıştır!
            if (linkedTxCount === 0) {
                console.log(`⚠️  YETİM SATIŞ TESPİT EDİLDİ: ID ${sale.id} - Tutar: ${sale.totalAmount}`);

                // İptal Et ve Stokları Geri Yükle
                const tx = await sequelize.transaction();
                try {
                    // Satışı İptal Et
                    await sale.update({
                        status: 'CANCELLED',
                        notes: (sale.notes || '') + '\n[TEMİZLİK] Bağlı cari hareket bulunamadığı için sistem tarafından otomatik iptal edildi.'
                    }, { transaction: tx });

                    // Stokları Geri Ver
                    for (const item of sale.items) {
                        if (item.productId) {
                            const product = await Product.findByPk(item.productId, { transaction: tx });
                            if (product) {
                                await product.update({
                                    stock: parseInt(product.stock || 0) + parseInt(item.quantity)
                                }, { transaction: tx });
                                console.log(`   📦 Stok iade: ${product.name} (+${item.quantity})`);
                            }
                        }
                    }

                    await tx.commit();
                    fixedCount++;
                } catch (err) {
                    await tx.rollback();
                    console.error(`   ❌ Hata (Sale ${sale.id}):`, err.message);
                }
            }
        }

        console.log(`\n✅ İşlem tamamlandı! ${fixedCount} adet yetim satış iptal edildi ve stokları düzeltildi.`);
    } catch (err) {
        console.error('❌ Senkronizasyon hatası:', err);
    } finally {
        process.exit();
    }
}

syncOrphanedSales();
