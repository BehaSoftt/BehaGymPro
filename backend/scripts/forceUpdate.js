const { Permission } = require('./src/models');

async function forceUpdatePermissions() {
    try {
        console.log('Force updating financial permissions...');

        const updates = [
            { key: 'FIN_ACC_VIEW', module: 'FİNANS PLANLARI', name: 'Finans Planlarını Görüntüle' },
            { key: 'FIN_ACC_CREATE', module: 'FİNANS PLANLARI', name: 'Yeni Finans Planı Oluştur' },
            { key: 'FIN_ACC_EDIT', module: 'FİNANS PLANLARI', name: 'Finans Planı Düzenle' },
            { key: 'FIN_ACC_DELETE', module: 'FİNANS PLANLARI', name: 'Finans Planı Sil' },
            { key: 'FINANCE_VIEW', module: 'FİNANS PLANLARI', name: 'Finansal Kayıt Listesini Görüntüle' },
            { key: 'EXPENSE_MANAGE', module: 'FİNANS PLANLARI', name: 'Gider Yönetimi' },
            { key: 'PAY_PLAN_VIEW', module: 'TAKSİT VE ÖDEMELER', name: 'Taksit ve Ödemeleri Görüntüle' },
            { key: 'PAY_PLAN_CREATE', module: 'TAKSİT VE ÖDEMELER', name: 'Yeni Taksit Planı Oluştur' },
            { key: 'PAY_PLAN_EDIT', module: 'TAKSİT VE ÖDEMELER', name: 'Taksit Ödemesi Al / Düzenle' },
            { key: 'PAY_PLAN_DELETE', module: 'TAKSİT VE ÖDEMELER', name: 'Plan veya Taksit İptal Et' },
            { key: 'FINANCE_TRANSACTION', module: 'TAKSİT VE ÖDEMELER', name: 'Ödeme Alma/İade İşlemleri' },
            { key: 'FINANCE_CREATE', module: 'TAKSİT VE ÖDEMELER', name: 'Yeni Tahsilat/Ödeme Ekle' },
            { key: 'FINANCE_EDIT', module: 'TAKSİT VE ÖDEMELER', name: 'Finansal Kayıt Düzenle' },
            { key: 'FINANCE_DELETE', module: 'TAKSİT VE ÖDEMELER', name: 'Finansal Kayıt Sil' }
        ];

        for (const item of updates) {
            await Permission.update(
                { module: item.module, name: item.name },
                { where: { key: item.key } }
            );
        }

        console.log('Force update completed.');
    } catch (error) {
        console.error('Error during force update:', error);
    }
}

module.exports = forceUpdatePermissions;
