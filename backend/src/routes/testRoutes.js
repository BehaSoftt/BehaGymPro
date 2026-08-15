const express = require('express');
const router = express.Router();
const SchedulerService = require('../services/notifications/SchedulerService');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * WhatsApp Hatırlatma Sistemini Manuel Tetikleme (Test İçin)
 */
router.get('/trigger-reminders', authMiddleware, async (req, res) => {
    try {
        console.log('--- MANUEL TEST BAŞLATILDI ---');
        await SchedulerService.checkAndSendDailyReminders();
        res.json({ message: 'Hatırlatma sistemi başarıyla tetiklendi. Backend loglarını kontrol edin.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/whatsapp-status', authMiddleware, async (req, res) => {
    try {
        const WhatsAppService = require('../services/notifications/WhatsAppService');
        res.json({
            isReady: WhatsAppService.isReady,
            qrImage: WhatsAppService.latestQrImage || null,
            qr: WhatsAppService.latestQr || null,
            initError: WhatsAppService.initError || null,
            chromePath: WhatsAppService.getChromePath() || 'Sistem Chrome bulunamadı!'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/whatsapp-restart', authMiddleware, async (req, res) => {
    try {
        const WhatsAppService = require('../services/notifications/WhatsAppService');
        if (WhatsAppService.client) {
            try { await WhatsAppService.client.destroy(); } catch (_) {}
            WhatsAppService.client = null;
        }
        WhatsAppService.isReady = false;
        WhatsAppService.latestQr = null;
        WhatsAppService.latestQrImage = null;
        WhatsAppService.initError = null;
        WhatsAppService.initialize();
        res.json({ success: true, message: 'WhatsApp servisi yeniden başlatılıyor...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Belirli bir üyeye test mesajı gönder (GELİŞTİRİLMİŞ TEST)
 */
router.post('/test-whatsapp-member', authMiddleware, async (req, res) => {
    const { fullName, type, phone } = req.body;
    try {
        const { Member, Branch, Company } = require('../models');
        const WhatsAppService = require('../services/notifications/WhatsAppService');

        // Önce DB'den üyeyi döküman amaçlı bulalım ama numara gelmişse onu kullanalım
        const member = await Member.findOne({
            where: { fullName: fullName || 'BEKİR YASAK' },
            include: [
                {
                    model: Branch,
                    as: 'Branch',
                    include: [
                        { model: Company, as: 'Company' },
                        { model: Company, as: 'HeaderCompany' },
                        { model: Branch, as: 'HeaderBranch' }
                    ]
                },
                { model: Company, as: 'Company' }
            ]
        });

        const identity = WhatsAppService.resolveIdentity(member?.Branch, member?.Company);
        const companyName = identity.companyName;
        const branchName = identity.branchName;
        const branchPhone = identity.phone;
        const instructorName = 'Ayaz Hoca';
        const memberName = fullName || member?.fullName || 'BEKİR YASAK';

        // Geçici bir üye objesi oluşturalım (fonksiyonlara göndermek için)
        const tempMember = { fullName: memberName };

        let msg = '';
        if (type === 'INSTRUCTOR') {
            const summary = `📅 *BUGÜNKÜ PROGRAMIN:*\n` +
                `• 09:00 - Özel Ders (Mustafa A.)\n` +
                `• 11:00 - Grup Dersi (Crossfit)\n` +
                `• 17:00 - Özel Ders (Ayşe K.)\n` +
                `• 19:00 - Grup Dersi (Spinning)`;
            msg = WhatsAppService.getInstructorDailySchedule(memberName, summary, companyName, branchName, branchPhone);
        } else if (type === 'GROUP_CLASS') {
            msg = WhatsAppService.getGroupClassReminder(tempMember, 'Crossfit', '19:00', instructorName, companyName, branchName, branchPhone);
        } else {
            msg = WhatsAppService.getDailyTrainingReminder(tempMember, '• Bench Press (4x12)\n• Squat (4x10)\n• Deadlift (3x8)', companyName, branchName, branchPhone);
        }

        // Telefon Numarası: Ekranda yazan numarayı (req.body.phone) kullan, yoksa DB'den al
        let targetPhone = (phone || member?.phone || '').replace(/\D/g, '');

        // Numara formatlama (Türkiye için 90 ekleme)
        if (targetPhone.length === 10) targetPhone = '90' + targetPhone;
        else if (targetPhone.length === 11 && targetPhone.startsWith('0')) targetPhone = '90' + targetPhone.substring(1);
        else if (targetPhone.length === 11 && targetPhone.startsWith('9')) { /* zaten 90'lı olabilir */ }
        else if (!targetPhone.startsWith('90') && targetPhone.length > 0) targetPhone = '90' + targetPhone;

        // Otomatik gönderim simülasyonu (Log)
        await WhatsAppService.sendAutoMessage(targetPhone, msg);

        // Manuel link oluştur
        const link = WhatsAppService.getWhatsAppLink(targetPhone, msg);

        res.json({
            message: `${memberName} için test mesajı hazırlandu.`,
            content: msg,
            whatsappLink: link,
            phone: phone || member?.phone,
            targetPhone: targetPhone
        });
    } catch (err) {
        console.error('WhatsApp Test Hatası:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Tüm şube üyelerine duyuru mesajı gönder
 */
router.post('/broadcast-whatsapp', authMiddleware, async (req, res) => {
    const { branchId, message, lessonType, memberIds } = req.body;
    try {
        const { Member, Branch, Company } = require('../models');
        const WhatsAppService = require('../services/notifications/WhatsAppService');
        const { Op } = require('sequelize');

        if (!message) return res.status(400).json({ error: 'Mesaj metni boş olamaz.' });

        const branch = await Branch.findByPk(branchId, {
            include: [
                { model: Company, as: 'Company' },
                { model: Company, as: 'HeaderCompany' },
                { model: Branch, as: 'HeaderBranch' }
            ]
        });

        // Dinamik filtre oluşturma
        const whereClause = { branchId, isActive: true };

        // Eğer belirli üyeler seçilmişse sadece onlara gönder
        if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
            whereClause.id = { [Op.in]: memberIds };
        }
        // Eğer ders tipi seçilmişse ona göre filtrele
        else if (lessonType) {
            whereClause.lessonTypes = { [Op.contains]: [lessonType] };
        }

        const members = await Member.findAll({ where: whereClause });

        const identity = WhatsAppService.resolveIdentity(branch, branch?.Company);

        let sentCount = 0;
        for (const member of members) {
            if (member.phone) {
                const finalMsg = WhatsAppService.getCustomGroupMessage(message, identity.companyName, identity.branchName, identity.phone);
                await WhatsAppService.sendAutoMessage(member.phone, finalMsg);
                sentCount++;
            }
        }

        res.json({ message: `Duyuru ${sentCount} üyeye başarıyla iletildi.` });
    } catch (err) {
        console.error('Broadcast Error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Belirli bir numaraya serbest metin gönder
 */
router.post('/send-single-whatsapp', authMiddleware, async (req, res) => {
    const { phone, message, branchId } = req.body;
    try {
        const { Branch, Company } = require('../models');
        const WhatsAppService = require('../services/notifications/WhatsAppService');

        const branch = await Branch.findByPk(branchId, {
            include: [
                { model: Company, as: 'Company' },
                { model: Company, as: 'HeaderCompany' },
                { model: Branch, as: 'HeaderBranch' }
            ]
        });
        const identity = WhatsAppService.resolveIdentity(branch, branch?.Company);
        const finalMsg = WhatsAppService.getCustomGroupMessage(message, identity.companyName, identity.branchName, identity.phone);
        await WhatsAppService.sendAutoMessage(phone, finalMsg);

        res.json({ message: 'Mesaj başarıyla iletildi.' });
    } catch (err) {
        console.error('Single Message Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/diagnose-db', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        await sequelize.query(`UPDATE "Members" SET "specialtyId" = 'cc295384-a89c-4a73-afb5-d898f2168085' WHERE "fullName" ILIKE '%Bekir Yasak%'`);
        const [results] = await sequelize.query(`SELECT id, "fullName", "specialtyId", "branchId" FROM "Members" WHERE "fullName" ILIKE '%Bekir Yasak%'`);
        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/diagnose-member/:name', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        const [results] = await sequelize.query(`SELECT id, "fullName", "specialtyId", "branchId" FROM "Members" WHERE "fullName" ILIKE '%${req.params.name}%'`);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Telegram Test Mesajı Gönder
 */
router.post('/test-telegram', authMiddleware, async (req, res) => {
    const { token, chatId, message } = req.body;
    try {
        const TelegramService = require('../services/notifications/TelegramService');
        if (!token || !chatId) {
            return res.status(400).json({ error: 'Token ve Chat ID gereklidir.' });
        }
        await TelegramService.sendMessage(token, chatId, message || '🚀 BehaGym Sisteminden Test Mesajı Başarılı!');
        res.json({ message: 'Telegram test mesajı başarıyla gönderildi.' });
    } catch (err) {
        console.error('Telegram Test Hatası:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/fix-permissions', authMiddleware, async (req, res) => {
    try {
        const DatabaseSchemaService = require('../services/admin/DatabaseSchemaService');
        await DatabaseSchemaService.forceFixPermissions();
        res.json({ message: 'Yetkiler başarıyla senkronize edildi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
