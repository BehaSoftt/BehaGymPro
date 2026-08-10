const { Member, Branch, Company } = require('../models');
const WhatsAppService = require('../services/notifications/WhatsAppService');

async function testWhatsApp() {
    console.log('--- WhatsApp Test Başlatıldı ---');
    try {
        const member = await Member.findOne({
            where: { fullName: 'BEKİR YASAK' },
            include: [
                { model: Branch, as: 'Branch' },
                { model: Company, as: 'Company' }
            ]
        });

        if (!member) {
            console.log('Bekir Yasak bulunamadı, mockup verisi ile test ediliyor...');
            const mockMember = {
                fullName: 'BEKİR YASAK',
                phone: '5321234567',
                Branch: { name: 'Merkez Şube', isWhatsAppEnabled: true },
                Company: { name: 'Beha Gym Pro' }
            };
            const msg = WhatsAppService.getGroupClassReminder(mockMember, 'Crossfit', '19:00', 'Enes Hoca', mockMember.Company.name, mockMember.Branch.name, '0 (212) 123 45 67');
            console.log('\n[WhatsApp GÖNDERİLECEK MESAJ]:');
            console.log(msg);
            const link = WhatsAppService.getWhatsAppLink(mockMember.phone, msg);
            console.log('\n[WhatsApp MANUEL LİNK]:');
            console.log(link);
        } else {
            console.log('Üye bulundu:', member.fullName);
            const msg = WhatsAppService.getGroupClassReminder(
                member,
                'Crossfit',
                '19:00',
                'Enes Hoca',
                member.Company?.name || 'Beha Gym Pro',
                member.Branch?.name || 'Vadi Şubesi',
                member.Branch?.phone || '0 (5XX) XXX XX XX'
            );
            console.log('\n[WhatsApp GÖNDERİLECEK MESAJ]:');
            console.log(msg);
            const link = WhatsAppService.getWhatsAppLink(member.phone, msg);
            console.log('\n[WhatsApp MANUEL LİNK]:');
            console.log(link);

            // Gerçek gönderim simülasyonu
            await WhatsAppService.sendAutoMessage(member.phone, msg);
        }
    } catch (err) {
        console.error('Test hatası:', err);
    }
    console.log('\n--- Test Tamamlandı ---');
    process.exit(0);
}

testWhatsApp();
