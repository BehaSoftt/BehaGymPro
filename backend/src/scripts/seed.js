const { Company, Branch, User, Role, Permission, RolePermission, License, SystemSetting, MembershipPackage } = require('../models');
const bcrypt = require('bcryptjs');
const SecurityVault = require('../utils/SecurityVault');
const seedSportSpecialties = require('./seedSpecialties');

const seedSuperMaster = async () => {
    try {
        // 1. Şirket ve Şube Kontrolü
        const [behasoft] = await Company.findOrCreate({
            where: { name: 'BehaSoft' },
            defaults: { email: 'info@behasoft.com', phone: '02120000000', isActive: true }
        });

        // Lisans Oluştur
        const [license] = await License.findOrCreate({
            where: { companyId: behasoft.id },
            defaults: {
                licenseKey: SecurityVault.hash('BEHASOFT_MASTER_LICENSE'),
                type: 'LIFETIME',
                status: 'ACTIVE',
                isActive: true,
                maxBranches: 9999
            }
        });

        // Lisans Limiti Güncelleme ve Bütünlük Hash'i
        if (license.maxBranches !== 9999 || !license.securityHash || license.status !== 'ACTIVE') {
            await license.update({
                maxBranches: 9999,
                status: 'ACTIVE',
                isActive: true,
                securityHash: SecurityVault.generateIntegrityHash({ ...license.toJSON(), maxBranches: 9999, status: 'ACTIVE' })
            });
            console.log('--- BehaSoft Master Lisans Limiti ve Mührü Güncellendi (9999 / ACTIVE) ---');
        }

        const [branch] = await Branch.findOrCreate({
            where: { name: 'BehaSoft Headquarters', companyId: behasoft.id },
            defaults: {
                isHeadquarters: true,
                // SMTP Settings from .env
                smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
                smtpPort: process.env.SMTP_PORT || 587,
                smtpUser: process.env.SMTP_USER || 'behasoftt@gmail.com',
                smtpPass: process.env.SMTP_PASS || '',
                smtpSecure: process.env.SMTP_PORT == 465,
                smtpFromEmail: process.env.EMAIL_FROM || '',

                // Telegram Settings (Default/Placeholder)
                isTelegramEnabled: !!process.env.TELEGRAM_BOT_TOKEN,
                telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
                telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
            }
        });

        // 2. Rolleri ve Yetkileri Tanımla
        const [superMasterRole] = await Role.findOrCreate({
            where: { name: 'SUPER_MASTER' },
            defaults: { description: 'Sistem bütününde sınırsız yetkiye sahip ana kullanıcı rolü.', isSystemRole: true }
        });

        const [adminRole] = await Role.findOrCreate({
            where: { name: 'ADMIN' },
            defaults: { description: 'İşletme sahibi veya genel yönetici.', isSystemRole: true }
        });

        const [mudurRole] = await Role.findOrCreate({
            where: { name: 'MUDUR' },
            defaults: { description: 'Şube operasyonlarını yöneten yetkili.', isSystemRole: true }
        });

        const [userRole] = await Role.findOrCreate({
            where: { name: 'USER' },
            defaults: { description: 'Standart sistem kullanıcısı.', isSystemRole: true }
        });

        const [reportRole] = await Role.findOrCreate({
            where: { name: 'REPORT' },
            defaults: { description: 'Sadece raporlama, dashboard ve izleme yetkilerine sahip varsayılan rapor okuyucu rolü.', isSystemRole: true }
        });

        const [guestRole] = await Role.findOrCreate({
            where: { name: 'GUEST' },
            defaults: { description: 'Misafir kullanıcılar için sınırlı yetkiye sahip rol.', isSystemRole: true }
        });

        const [terminalRole] = await Role.findOrCreate({
            where: { name: 'TERMINAL' },
            defaults: { description: 'Kiosk ve terminal cihazları için kısıtlı yetkiye sahip rol.', isSystemRole: true }
        });

        const [instructorRole] = await Role.findOrCreate({
            where: { name: 'EĞİTMEN' },
            defaults: { description: 'Eğitmen portalı üzerinden üyelere idman yaptıran ve onaylayan personel rolü.', isSystemRole: true }
        });

        // --- CLEANUP: Move users from old INSTRUCTOR role to EĞİTMEN and delete old role ---
        const oldInstRole = await Role.findOne({ where: { name: 'INSTRUCTOR' } });
        if (oldInstRole && oldInstRole.id !== instructorRole.id) {
            console.log('--- Cleaning up legacy INSTRUCTOR role... ---');
            await User.update(
                { roleId: instructorRole.id, role: 'EĞİTMEN' },
                { where: { roleId: oldInstRole.id } }
            );
            await oldInstRole.destroy();
            console.log('--- Old INSTRUCTOR role deleted and users migrated. ---');
        }

        // Tüm modüller için Granüler Yetki Tanımlamaları (CRUD)
        const corePermissions = [
            // ÜYE İŞLEMLERİ
            { key: 'MEMBER_VIEW', name: 'Üyeleri Görüntüle', module: 'ÜYELER' },
            { key: 'MEMBER_CREATE', name: 'Yeni Üye Ekle', module: 'ÜYELER' },
            { key: 'MEMBER_EDIT', name: 'Üye Bilgilerini Düzenle', module: 'ÜYELER' },
            { key: 'MEMBER_DELETE', name: 'Üye Sil', module: 'ÜYELER' },

            // PAKET İŞLEMLERİ
            { key: 'PACKAGE_VIEW', name: 'Paketleri Görüntüle', module: 'PAKETLER' },
            { key: 'PACKAGE_CREATE', name: 'Yeni Paket Ekle', module: 'PAKETLER' },
            { key: 'PACKAGE_EDIT', name: 'Paket Düzenle', module: 'PAKETLER' },
            { key: 'PACKAGE_DELETE', name: 'Paket Sil', module: 'PAKETLER' },

            // BRANŞ İŞLEMLERİ
            { key: 'SPECIALTY_VIEW', name: 'Branşları Görüntüle', module: 'BRANŞLAR' },
            { key: 'SPECIALTY_CREATE', name: 'Yeni Branş Ekle', module: 'BRANŞLAR' },
            { key: 'SPECIALTY_EDIT', name: 'Branş Düzenle', module: 'BRANŞLAR' },
            { key: 'SPECIALTY_DELETE', name: 'Branş Sil', module: 'BRANŞLAR' },

            // İSTASYON İŞLEMLERİ
            { key: 'EXERCISE_VIEW', name: 'İstasyonları Görüntüle', module: 'İSTASYONLAR' },
            { key: 'EXERCISE_CREATE', name: 'Yeni İstasyon Ekle', module: 'İSTASYONLAR' },
            { key: 'EXERCISE_EDIT', name: 'İstasyon Düzenle', module: 'İSTASYONLAR' },
            { key: 'EXERCISE_DELETE', name: 'İstasyon Sil', module: 'İSTASYONLAR' },

            // ANTRENMAN PLANLARI
            { key: 'PLAN_VIEW', name: 'Antrenman Planlarını Görüntüle', module: 'ANTRENMANLAR' },
            { key: 'PLAN_CREATE', name: 'Yeni Plan Oluştur', module: 'ANTRENMANLAR' },
            { key: 'PLAN_EDIT', name: 'Plan Düzenle', module: 'ANTRENMANLAR' },
            { key: 'PLAN_DELETE', name: 'Plan Sil', module: 'ANTRENMANLAR' },
            { key: 'PLAN_LOG_MANAGE', name: 'İdman Onaylama ve Telafi Yönetimi', module: 'ANTRENMANLAR' },

            // EĞİTMEN İŞLEMLERİ
            { key: 'INSTRUCTOR_VIEW', name: 'Eğitmenleri Görüntüle', module: 'EĞİTMENLER' },
            { key: 'INSTRUCTOR_CREATE', name: 'Yeni Eğitmen Ekle', module: 'EĞİTMENLER' },
            { key: 'INSTRUCTOR_EDIT', name: 'Eğitmen Bilgilerini Düzenle', module: 'EĞİTMENLER' },
            { key: 'INSTRUCTOR_DELETE', name: 'Eğitmen Sil', module: 'EĞİTMENLER' },

            // DERS İŞLEMLERİ
            { key: 'CLASS_VIEW', name: 'Grup Derslerini Görüntüle', module: 'DERSLER' },
            { key: 'CLASS_CREATE', name: 'Yeni Ders Tanımla', module: 'DERSLER' },
            { key: 'CLASS_EDIT', name: 'Ders Bilgilerini Düzenle', module: 'DERSLER' },
            { key: 'CLASS_DELETE', name: 'Ders Sil', module: 'DERSLER' },

            // TAKVİM İŞLEMLERİ
            { key: 'CALENDAR_VIEW', name: 'Ders Takvimini Görüntüle', module: 'TAKVİM' },
            { key: 'CALENDAR_CREATE', name: 'Takvim Planlaması Yap', module: 'TAKVİM' },
            { key: 'CALENDAR_EDIT', name: 'Takvimi Düzenle', module: 'TAKVİM' },
            { key: 'CALENDAR_DELETE', name: 'Takvimden Etkinlik Sil', module: 'TAKVİM' },

            // FİNANS YÖNETİMİ
            { key: 'FIN_ACC_VIEW', name: 'Finans Yönetimi Erişimi', module: 'FİNANS YÖNETİMİ' },
            { key: 'FIN_ACC_CREATE', name: 'Yeni Cari Hesap Oluştur', module: 'FİNANS YÖNETİMİ' },
            { key: 'FIN_ACC_EDIT', name: 'Cari Hesap Düzenle', module: 'FİNANS YÖNETİMİ' },
            { key: 'FIN_ACC_DELETE', name: 'Cari Hesap Sil', module: 'FİNANS YÖNETİMİ' },
            { key: 'FIN_ACC_DETAILS', name: 'Hesap Hareketlerini Gör', module: 'FİNANS YÖNETİMİ' },
            { key: 'FINANCE_VIEW', name: 'Genel Finansal Özet Paneli', module: 'FİNANS YÖNETİMİ' },
            { key: 'EXPENSE_MANAGE', name: 'Gider ve Masraf Yönetimi', module: 'FİNANS YÖNETİMİ' },
            { key: 'PAY_PLAN_VIEW', name: 'Taksit ve Ödemeleri Görüntüle', module: 'FİNANS YÖNETİMİ' },
            { key: 'PAY_PLAN_CREATE', name: 'Yeni Taksit Planı Oluştur', module: 'FİNANS YÖNETİMİ' },
            { key: 'PAY_PLAN_EDIT', name: 'Taksit Planı Düzenle', module: 'FİNANS YÖNETİMİ' },
            { key: 'PAY_PLAN_DELETE', name: 'Taksit Planı İptal Et', module: 'FİNANS YÖNETİMİ' },
            { key: 'PAY_PLAN_DETAILS', name: 'Ödeme Planı Detaylarını Gör', module: 'FİNANS YÖNETİMİ' },
            { key: 'FINANCE_TRANSACTION', name: 'Tahsilat ve Ödeme İşlemleri', module: 'FİNANS YÖNETİMİ' },
            { key: 'FINANCE_CREATE', name: 'Hızlı Tahsilat Girişi', module: 'FİNANS YÖNETİMİ' },
            { key: 'FINANCE_EDIT', name: 'Tahsilat Kaydı Düzeltme', module: 'FİNANS YÖNETİMİ' },
            { key: 'FINANCE_DELETE', name: 'Tahsilat Kaydı Silme', module: 'FİNANS YÖNETİMİ' },

            // RAPORLAMA İŞLEMLERİ
            { key: 'REPORT_VIEW', name: 'Raporları Görüntüle', module: 'RAPORLAR' },
            { key: 'REPORT_CREATE', name: 'Yeni Rapor Şablonu Oluştur', module: 'RAPORLAR' },
            { key: 'REPORT_EDIT', name: 'Rapor Ayarlarını Düzenle', module: 'RAPORLAR' },
            { key: 'REPORT_DELETE', name: 'Rapor Sil', module: 'RAPORLAR' },

            // KULLANICI YÖNETİMİ
            { key: 'USER_VIEW', name: 'Kullanıcı Listesini Görüntüle', module: 'KULLANICILAR' },
            { key: 'USER_CREATE', name: 'Yeni Kullanıcı Oluştur', module: 'KULLANICILAR' },
            { key: 'USER_EDIT', name: 'Kullanıcı Bilgilerini Düzenle', module: 'KULLANICILAR' },
            { key: 'USER_DELETE', name: 'Kullanıcı Sil', module: 'KULLANICILAR' },

            // ROL VE YETKİ YÖNETİMİ
            { key: 'ROLE_VIEW', name: 'Rolleri Görüntüle', module: 'YETKİ YÖNETİMİ' },
            { key: 'ROLE_CREATE', name: 'Yeni Rol Oluştur', module: 'YETKİ YÖNETİMİ' },
            { key: 'ROLE_EDIT', name: 'Rol Yetkilerini Düzenle', module: 'YETKİ YÖNETİMİ' },
            { key: 'ROLE_DELETE', name: 'Rol Sil', module: 'YETKİ YÖNETİMİ' },

            // İLETİ / BİLDİRİM YÖNETİMİ
            { key: 'COMM_VIEW', name: 'İleti Ayarlarını Görüntüle', module: 'İLETİ YÖNETİMİ' },
            { key: 'COMM_EDIT', name: 'İleti Ayarlarını Düzenle', module: 'İLETİ YÖNETİMİ' },
            { key: 'COMM_BROADCAST', name: 'Toplu Duyuru Gönder (WhatsApp/E-posta)', module: 'İLETİ YÖNETİMİ' },
            { key: 'COMM_DELETE', name: 'İleti Kayıtlarını Sil', module: 'İLETİ YÖNETİMİ' },

            // DASHBOARD (PANEL) YÖNETİMİ
            { key: 'DASHBOARD_VIEW_STATS', name: 'Temel İstatistikleri Gör (Giriş, Üye Sayısı)', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_FINANCE', name: 'Finansal Verileri Gör (Tahsilat, Kasa)', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_USERS', name: 'Son Hareketler Tablosunu Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_BRANCHES', name: 'Şube/Branş Dağılımını Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_BIRTHDAYS', name: 'Günün Doğum Günlerini Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_EXPIRED', name: 'Süresi Dolan/Azalan Üyeleri Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_POPULAR_HOURS', name: 'Salon Yoğunluk Grafiğini Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_STAFF', name: 'Nöbetçi Personel Durumunu Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_CHURN_RISK', name: 'Risk Analizini Gör (Gelmeyen Üyeler)', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_REVENUE_TARGET', name: 'Aylık Gelir Hedefini Takip Et', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_CLASS_OCCUPANCY', name: 'Ders Doluluk Oranlarını Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_SERVICE_HEALTH', name: 'Servislerin Çalışma Durumunu Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_ACQUISITION', name: 'Yeni Üye Kazanım Hızını Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_VIEW_DEMOGRAPHICS', name: 'Üye Demografi Grafiklerini Gör', module: 'DASHBOARD' },
            { key: 'DASHBOARD_CONFIG_MANAGE', name: 'Panel Düzeni ve Izgara Yönetimi', module: 'DASHBOARD' },

            // SİSTEM VE DASHBOARD
            { key: 'DASHBOARD_VIEW', name: 'Dashboard Genel Erişimi', module: 'SİSTEM' },
            { key: 'SYSTEM_LOGS', name: 'Sistem Kayıtlarını (Log) İncele', module: 'SİSTEM' },

            // SİSTEM AYARLARI
            { key: 'SETTING_VIEW', name: 'Sistem Ayarlarını Görüntüle', module: 'AYARLAR' },
            { key: 'SETTING_EDIT', name: 'Sistem Ayarlarını Düzenle', module: 'AYARLAR' },
            { key: 'SETTING_MANAGE', name: 'Tam Sistem Yönetim Yetkisi', module: 'AYARLAR' },

            // LİSANS YÖNETİMİ
            { key: 'LICENSE_VIEW', name: 'Lisans Durumunu Görüntüle', module: 'LİSANS' },
            { key: 'LICENSE_CREATE', name: 'Yeni Lisans Tanımla', module: 'LİSANS' },
            { key: 'LICENSE_EDIT', name: 'Lisans Mührünü Güncelle', module: 'LİSANS' },
            { key: 'LICENSE_DELETE', name: 'Lisans İptal Et', module: 'LİSANS' },

            // ŞİRKET YÖNETİMİ
            { key: 'COMPANY_VIEW', name: 'Şirket Bilgilerini Görüntüle', module: 'ŞİRKET' },
            { key: 'COMPANY_CREATE', name: 'Yeni Şirket Kaydı Oluştur', module: 'ŞİRKET' },
            { key: 'COMPANY_EDIT', name: 'Şirket Bilgilerini Düzenle', module: 'ŞİRKET' },
            { key: 'COMPANY_DELETE', name: 'Şirket Kaydını Sil', module: 'ŞİRKET' },

            // ŞUBE YÖNETİMİ
            { key: 'BRANCH_VIEW', name: 'Şubeleri Görüntüle', module: 'ŞUBELER' },
            { key: 'BRANCH_CREATE', name: 'Yeni Şube Ekle', module: 'ŞUBELER' },
            { key: 'BRANCH_EDIT', name: 'Şube Bilgilerini Düzenle', module: 'ŞUBELER' },
            { key: 'BRANCH_DELETE', name: 'Şube Sil', module: 'ŞUBELER' },

            // KUŞAK SINAVLARI
            { key: 'BELT_EXAM_VIEW', name: 'Kuşak Sınavlarını Görüntüle', module: 'KUŞAK SINAVLARI' },
            { key: 'BELT_EXAM_CREATE', name: 'Yeni Kuşak Sınavı Ekle', module: 'KUŞAK SINAVLARI' },
            { key: 'BELT_EXAM_EDIT', name: 'Kuşak Sınavı Düzenle', module: 'KUŞAK SINAVLARI' },
            { key: 'BELT_EXAM_DELETE', name: 'Kuşak Sınavı Sil', module: 'KUŞAK SINAVLARI' },
            { key: 'BELT_EXAM_MANAGE', name: 'Sınav Katılımcı ve Sonuç Yönetimi', module: 'KUŞAK SINAVLARI' },

            // VÜCUT ÖLÇÜMLERİ
            { key: 'MEASUREMENT_VIEW', name: 'Ölçümleri Görüntüle', module: 'VÜCUT ÖLÇÜMLERİ' },
            { key: 'MEASUREMENT_CREATE', name: 'Yeni Ölçüm Ekle', module: 'VÜCUT ÖLÇÜMLERİ' },
            { key: 'MEASUREMENT_EDIT', name: 'Ölçüm Düzenle', module: 'VÜCUT ÖLÇÜMLERİ' },
            { key: 'MEASUREMENT_DELETE', name: 'Ölçüm Sil', module: 'VÜCUT ÖLÇÜMLERİ' },

            // BESLENME PLANLARI
            { key: 'NUTRITION_VIEW', name: 'Beslenme Planlarını Görüntüle', module: 'BESLENME PLANLARI' },
            { key: 'NUTRITION_CREATE', name: 'Yeni Beslenme Planı Ekle', module: 'BESLENME PLANLARI' },
            { key: 'NUTRITION_EDIT', name: 'Beslenme Planı Düzenle', module: 'BESLENME PLANLARI' },
            { key: 'NUTRITION_DELETE', name: 'Beslenme Planı Sil', module: 'BESLENME PLANLARI' },

            // SATIŞ VE ÜRÜN
            { key: 'PRODUCT_VIEW', name: 'Ürünleri Görüntüle', module: 'SATIŞ VE ÜRÜN' },
            { key: 'PRODUCT_MANAGE', name: 'Ürün Ekle/Düzenle/Sil', module: 'SATIŞ VE ÜRÜN' },
            { key: 'SALES_VIEW', name: 'Satış Kayıtlarını Görüntüle', module: 'SATIŞ VE ÜRÜN' },
            { key: 'SALES_CREATE', name: 'Yeni Satış Yap', module: 'SATIŞ VE ÜRÜN' },

            // ÖZEL DERSLER
            { key: 'PRIVATE_LESSON_VIEW', name: 'Özel Dersleri Görüntüle', module: 'ÖZEL DERSLER' },
            { key: 'PRIVATE_LESSON_MANAGE', name: 'Özel Ders Paket Yönetimi', module: 'ÖZEL DERSLER' },

            // DERS PROGRAMI
            { key: 'SCHEDULE_VIEW', name: 'Ders Programını Görüntüle', module: 'DERS PROGRAMI' },
            { key: 'SCHEDULE_MANAGE', name: 'Ders Programı Planlama ve Yönetim', module: 'DERS PROGRAMI' },

            // TERMİNAL YETKİLERİ
            { key: 'TERMINAL_MEMBER_ENTRY', name: 'Üye Giriş Ekranı (Kiosk) Erişimi', module: 'TERMİNAL' },

            // SPOR YÖNETİMİ
            { key: 'SPORT_GROUP_VIEW', name: 'Takım / Grupları Görüntüle', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_GROUP_MANAGE', name: 'Takım / Grup Tanımlama ve Yönetim', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_EVENT_VIEW', name: 'Maç ve Etkinlik Takvimini Gör', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_EVENT_MANAGE', name: 'Maç / Etkinlik Oluşturma ve Yönetim', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_PERFORMANCE_VIEW', name: 'Oyuncu Performans Analizlerini Gör', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_PERFORMANCE_MANAGE', name: 'Performans Verisi Girişi ve Değerlendirme', module: 'SPOR YÖNETİMİ' },
            { key: 'SPORT_FORMATION_MANAGE', name: 'Saha Diziliş ve Taktik Tasarımı', module: 'SPOR YÖNETİMİ' },
            { key: 'TACTICAL_BOARD_VIEW', name: 'Taktik Tahtası Erişimi', module: 'SPOR YÖNETİMİ' }
        ];

        for (const p of corePermissions) {
            const [permission] = await Permission.findOrCreate({
                where: { key: p.key },
                defaults: p
            });
            // Var olanları güncelle (modül veya isim değişmiş olabilir)
            await permission.update(p);

            // Super Master'a tüm yetkileri bağla
            await RolePermission.findOrCreate({
                where: { roleId: superMasterRole.id, permissionId: permission.id }
            });

            // Rapor Rolü için: Sadece Görüntüleme ve Dashboard Yetkileri
            const isViewOnly = p.key.endsWith('_VIEW') || p.key.startsWith('DASHBOARD_VIEW') || p.module === 'RAPORLAR';
            if (isViewOnly) {
                await RolePermission.findOrCreate({
                    where: { roleId: reportRole.id, permissionId: permission.id }
                });
            }

            // Guest Rolü için: Sadece Dashboard ve Çok Sınırlı Görüntüleme
            const isGuestPerm = p.key === 'DASHBOARD_VIEW' || p.key === 'DASHBOARD_VIEW_STATS' || p.key === 'MEMBER_VIEW';
            if (isGuestPerm) {
                await RolePermission.findOrCreate({
                    where: { roleId: guestRole.id, permissionId: permission.id }
                });
            }

            // Terminal Rolü için: Sadece giriş ekranı yetkisi
            if (p.key === 'TERMINAL_MEMBER_ENTRY') {
                await RolePermission.findOrCreate({
                    where: { roleId: terminalRole.id, permissionId: permission.id }
                });
            }

            // INSTRUCTOR Rolü için: Sınırlı yetki (Sadece kendi alanı)
            const isInstructorPerm =
                p.key === 'PLAN_VIEW' ||
                p.key === 'PLAN_LOG_MANAGE' ||
                p.key === 'MEMBER_VIEW' ||
                p.key === 'CALENDAR_VIEW' ||
                p.key === 'DASHBOARD_VIEW';

            if (isInstructorPerm) {
                await RolePermission.findOrCreate({
                    where: { roleId: instructorRole.id, permissionId: permission.id }
                });
            }
        }

        // 3. Super Master Kullanıcını Oluştur
        const superMasterEmail = 'behasoftt@gmail.com';
        const newPassword = 'BehaGym1955';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let superMaster = await User.findOne({ where: { email: superMasterEmail } });

        if (!superMaster) {
            // Kullanıcı ilk kez oluşturuluyor → varsayılan şifre ile kaydet
            superMaster = await User.create({
                username: 'super_master',
                passwordHash: hashedPassword,
                email: superMasterEmail,
                role: 'SUPER_MASTER',
                roleId: superMasterRole.id,
                companyId: behasoft.id,
                branchId: branch.id,
                isActive: true
            });
            console.log('--- BehaSoft Super Master Kurulumu Tamamlandı (İlk kurulum şifresi: BehaGym1955) ---');
        } else {
            // Kullanıcı zaten var → SADECE rol ve kritik alanları güncelle, ŞİFREYE DOKUNMA!
            await superMaster.update({
                roleId: superMasterRole.id,
                isActive: true
            });
            console.log('--- BehaSoft Super Master Güvenlik Güncellemesi Başarılı (Şifre korundu) ---');
        }

        console.log('--- [SEED] Dashboard Layout seeding... ---');
        // 4. Varsayılan Dashboard Düzeni Seed
        const defaultLayout = [
            { id: 'stats', key: 'showStats', label: 'TEMEL İSTATİSTİKLER', isVisible: true },
            { id: 'finance', key: 'showFinance', label: 'FİNANSAL ÖZET (KASA)', isVisible: true },
            { id: 'birthdays', key: 'showBirthdays', label: 'BUGÜN DOĞANLAR', isVisible: true },
            { id: 'expired', key: 'showExpiredMembers', label: 'SÜRESİ DOLANLAR', isVisible: true },
            { id: 'popularHours', key: 'showPopularHours', label: 'YOĞUNLUK ANALİZİ', isVisible: true },
            { id: 'staff', key: 'showStaffStatus', label: 'PERSONEL DURUMU', isVisible: true },
            { id: 'activity', key: 'showRecentActivity', label: 'SON HAREKETLER LİSTESİ', isVisible: true },
            { id: 'branches', key: 'showBranchDistribution', label: 'BRANŞ DAĞILIM GRAFİĞİ', isVisible: true },
            { id: 'churnRisk', key: 'showChurnRisk', label: 'RİSKLİ ÜYELER (CHURN)', isVisible: true },
            { id: 'revenueTarget', key: 'showRevenueTarget', label: 'GELİR HEDEFİ TAKİBİ', isVisible: true },
            { id: 'classOccupancy', key: 'showClassOccupancy', label: 'DERS DOLULUK ORANI', isVisible: true },
            { id: 'serviceHealth', key: 'showServiceHealth', label: 'SERVİS SAĞLIK DURUMU', isVisible: true },
            { id: 'acquisition', key: 'showAcquisition', label: 'YENİ ÜYE KAZANIMI', isVisible: true },
            { id: 'demographics', key: 'showDemographics', label: 'ÜYE DEMOGRAFİSİ', isVisible: true }
        ];

        await SystemSetting.findOrCreate({
            where: { key: 'dashboard_layout' },
            defaults: {
                value: defaultLayout,
                description: 'Yönetim paneli bileşen dizilimi ve görünürlük ayarları.'
            }
        });
        console.log('--- [SEED] Dashboard Layout seeded. ---');

        console.log('--- [SEED] Sport Specialties seeding... ---');
        await seedSportSpecialties(branch.id, behasoft.id);
        console.log('--- [SEED] Sport Specialties seeded. ---');

        console.log(`Master User: ${superMasterEmail} [SECURITY_ENFORCED]`);

        // 5. Varsayılan Takım / Grup Seed (Sadece Futbol için örnekler)
        const { SportGroup, SportSpecialty } = require('../models');
        const footballSpec = await SportSpecialty.findOne({ where: { name: 'Futbol' } });
        
        if (footballSpec && branch.name !== 'BehaSoft Headquarters') {
            const existingGroups = await SportGroup.count({ 
                where: { specialtyId: footballSpec.id, branchId: branch.id } 
            });
            if (existingGroups === 0) {
                console.log('--- [SEED] Default Football Groups seeding... ---');
                const defaultGroups = [
                    { name: 'U6-U7 GRASSROOTS', category: 'U6-U7', minAge: 5, maxAge: 7 },
                    { name: 'U8-U9 GELİŞİM', category: 'U8-U9', minAge: 8, maxAge: 9 },
                    { name: 'U10-U11 ALT YAPI', category: 'U10-U11', minAge: 10, maxAge: 11 },
                    { name: 'U12-U13 YILDIZLAR', category: 'U12-U13', minAge: 12, maxAge: 13 },
                    { name: 'U14-U15 AKADEMİ', category: 'U14-U15', minAge: 14, maxAge: 15 },
                    { name: 'U16-U17 GENÇ TAKIM', category: 'U16-U17', minAge: 16, maxAge: 17 },
                    { name: 'U19-U21 REZERV', category: 'U19-U21', minAge: 18, maxAge: 21 },
                    { name: 'SENİOR A TAKIM', category: 'Senior', minAge: 18, maxAge: 45 },
                    { name: 'VETERAN TAKIMI', category: 'Veteran', minAge: 35, maxAge: 65 }
                ];

                for (const g of defaultGroups) {
                    await SportGroup.create({
                        ...g,
                        specialtyId: footballSpec.id,
                        branchId: branch.id,
                        companyId: behasoft.id,
                        maxCapacity: 30,
                        isActive: true
                    });
                }
                console.log('--- [SEED] Default Football Groups seeded. ---');
            }
        }

    } catch (err) {
        console.error('Seed hatası:', err);
    }
};

module.exports = seedSuperMaster;
