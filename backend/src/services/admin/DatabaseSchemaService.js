const { sequelize } = require('../../models');

/**
 * DatabaseSchemaService
 * app.js içindeki karmaşık manuel SQL sorgularını yöneten servis.
 */
class DatabaseSchemaService {
    static async updateSchema() {
        const SCHEMA_VERSION = '2024.03.24.010'; // Adres alanları ve yeni ölçüm alanları eklendi

        // 1. Durum Kontrolü
        try {
            const [versionResult] = await sequelize.query(`SELECT value->>'version' as version FROM "SystemSettings" WHERE "key" = 'INTERNAL_SCHEMA_VERSION' LIMIT 1`, { type: sequelize.QueryTypes.SELECT });
            if (versionResult && versionResult.version === SCHEMA_VERSION) {
                console.log(`[DB] Şema zaten güncel (Versiyon: ${SCHEMA_VERSION}). Atlama yapılıyor...`);
                return;
            }
        } catch (e) {
        }

        const queries = [
            // PERFORMANS İNDEKSLERİ
            'CREATE INDEX IF NOT EXISTS "idx_members_branch_company_active" ON "Members" ("branchId", "companyId", "isActive")',
            'CREATE INDEX IF NOT EXISTS "idx_members_created_at" ON "Members" ("createdAt" DESC)',
            'CREATE INDEX IF NOT EXISTS "idx_members_full_name" ON "Members" ("fullName")',
            'CREATE INDEX IF NOT EXISTS "idx_members_member_code" ON "Members" ("memberCode")',

            // Erişim Logları Tablosu (Zorunlu)
            'CREATE TABLE IF NOT EXISTS "AccessLogs" ("id" UUID PRIMARY KEY, "memberId" UUID NOT NULL, "branchId" UUID NOT NULL, "status" VARCHAR(50) DEFAULT \'SUCCESS\', "actionType" VARCHAR(50) DEFAULT \'ENTRY\', "entryType" VARCHAR(50) DEFAULT \'QR\', "failureReason" TEXT, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',

            // Members tablosu güncellemeleri (Yeni Ünified Profil Alanları)
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "profileType" VARCHAR(50) DEFAULT \'MEMBER\'',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "instructorCode" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "specialties" JSONB DEFAULT \'[]\'::JSONB',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "bio" TEXT',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "basePrice" DECIMAL(10, 2) DEFAULT 0',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "commissionRate" FLOAT DEFAULT 0',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "level" VARCHAR(255) DEFAULT \'UZMAN\'',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "personnelCode" VARCHAR(255)',

            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "bloodGroup" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "gender" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "beltBranchId" UUID',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "currentBelt" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "lastBeltDate" DATE',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "fitnessNotes" TEXT',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "healthNotes" TEXT',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "sportGroupId" UUID',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "city" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "district" VARCHAR(255)',
            'ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "address" TEXT',

            'ALTER TABLE "BeltExams" ADD COLUMN IF NOT EXISTS "targetBelt" VARCHAR(255)',
            'ALTER TABLE "BeltExams" ADD COLUMN IF NOT EXISTS "examPeriod" VARCHAR(255)',
            'ALTER TABLE "BeltExams" ADD COLUMN IF NOT EXISTS "instructorId" UUID',
            'ALTER TABLE "BeltExams" ADD COLUMN IF NOT EXISTS "companyId" UUID',
            'ALTER TABLE "BeltExams" ADD COLUMN IF NOT EXISTS "gymBranchId" UUID',

            'ALTER TABLE "LessonSchedules" ALTER COLUMN "instructorId" DROP NOT NULL',
            'ALTER TABLE "LessonSchedules" ALTER COLUMN "branchId" DROP NOT NULL',

            'ALTER TABLE "GroupClasses" ALTER COLUMN "days" TYPE JSONB USING "days"::JSONB',
            'ALTER TABLE "PrivateLessonPackages" ALTER COLUMN "days" TYPE JSONB USING "days"::JSONB',
            'ALTER TABLE "Members" ALTER COLUMN "lessonTypes" TYPE JSONB USING "lessonTypes"::JSONB',
            'ALTER TABLE "Members" ALTER COLUMN "privateLessonDays" TYPE JSONB USING "privateLessonDays"::JSONB',
            'ALTER TABLE "Members" ALTER COLUMN "specialties" TYPE JSONB USING "specialties"::JSONB',

            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "isWhatsAppEnabled" BOOLEAN DEFAULT true',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "isEmailEnabled" BOOLEAN DEFAULT true',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "isBirthdayMessageEnabled" BOOLEAN DEFAULT true',
            'ALTER TABLE "Exercises" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "period" VARCHAR(255)',

            'ALTER TABLE "BeltExamParticipants" ADD COLUMN IF NOT EXISTS "excuse" TEXT',
            'ALTER TABLE "BeltExamParticipants" ADD COLUMN IF NOT EXISTS "note" TEXT',
            'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "scope" VARCHAR(50) DEFAULT \'global\'',
            'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "label" VARCHAR(255)',

            'ALTER TABLE "FinancialAccounts" ADD COLUMN IF NOT EXISTS "cashBalance" DECIMAL(15, 2) DEFAULT 0',
            'ALTER TABLE "FinancialAccounts" ADD COLUMN IF NOT EXISTS "posBalance" DECIMAL(15, 2) DEFAULT 0',
            'ALTER TABLE "FinancialAccounts" ADD COLUMN IF NOT EXISTS "bankBalance" DECIMAL(15, 2) DEFAULT 0',
            'ALTER TABLE "ExerciseCategories" ADD COLUMN IF NOT EXISTS "photo" TEXT',
            'ALTER TABLE "ExerciseCategories" ALTER COLUMN "photo" SET DATA TYPE TEXT',
            'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(255)',
            'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "birthDate" DATE',
            'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isInside" BOOLEAN DEFAULT false',
            'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "personnelCode" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "whatsappHeaderCompanyId" UUID',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "whatsappHeaderBranchId" UUID',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "birthdayMessageTemplate" TEXT',

            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpHost" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpUser" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpPass" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpSecure" BOOLEAN DEFAULT true',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smtpFromEmail" VARCHAR(255)',

            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smsProvider" VARCHAR(50) DEFAULT \'NETGSM\'',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smsUser" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smsPass" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "smsHeader" VARCHAR(255)',

            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "isTelegramEnabled" BOOLEAN DEFAULT false',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "telegramBotToken" VARCHAR(255)',
            'ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "telegramChatId" VARCHAR(255)',

            'ALTER TABLE "FinancialTransactions" ADD COLUMN IF NOT EXISTS "salesTransactionId" UUID',
            'ALTER TABLE "MemberPackages" ADD COLUMN IF NOT EXISTS "campaignId" UUID',
            'ALTER TABLE "FinancialAccounts" ADD COLUMN IF NOT EXISTS "lastBalanceUpdate" TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE "MemberPackages" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN DEFAULT false',

            'CREATE TABLE IF NOT EXISTS "SystemSettings" ("id" UUID PRIMARY KEY, "key" VARCHAR(255) UNIQUE NOT NULL, "value" JSONB NOT NULL, "description" TEXT, "scope" VARCHAR(50) DEFAULT \'global\', "label" VARCHAR(255), "companyId" UUID, "branchId" UUID, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "Campaigns" ("id" UUID PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "description" TEXT, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "discountType" VARCHAR(50) DEFAULT \'AMOUNT\', "discountValue" DECIMAL(10, 2) DEFAULT 0, "durationBonusDays" INTEGER DEFAULT 0, "durationBonusMonths" INTEGER DEFAULT 0, "isActive" BOOLEAN DEFAULT true, "branchId" UUID, "companyId" UUID NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "Announcements" ("id" UUID PRIMARY KEY, "title" VARCHAR(255) NOT NULL, "content" TEXT NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "isActive" BOOLEAN DEFAULT true, "priority" INTEGER DEFAULT 0, "targetType" VARCHAR(50) DEFAULT \'ALL\', "showOnLogin" BOOLEAN DEFAULT true, "branchId" UUID, "companyId" UUID NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "Licenses" ("id" UUID PRIMARY KEY, "companyId" UUID NOT NULL, "branchId" UUID, "licenseKey" VARCHAR(255) UNIQUE NOT NULL, "packageType" VARCHAR(50) DEFAULT \'CUSTOM\', "type" VARCHAR(50) DEFAULT \'REGULAR\', "maxBranches" INTEGER DEFAULT 1, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "usedAt" TIMESTAMP WITH TIME ZONE, "status" VARCHAR(50) DEFAULT \'ACTIVE\', "isActive" BOOLEAN DEFAULT true, "securityHash" VARCHAR(255), "notes" TEXT, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "ProductUnits" ("id" UUID PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "shortName" VARCHAR(255), "branchId" UUID, "companyId" UUID, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "ProductRecipes" ("id" UUID PRIMARY KEY, "productId" UUID NOT NULL, "componentProductId" UUID NOT NULL, "quantity" DECIMAL(10,3) DEFAULT 1, "branchId" UUID, "companyId" UUID, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',

            'ALTER TABLE "Campaigns" ALTER COLUMN "discountType" TYPE VARCHAR(50) USING ("discountType"::TEXT)',
            'ALTER TABLE "Announcements" ALTER COLUMN "targetType" TYPE VARCHAR(50) USING ("targetType"::TEXT)',
            'ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "unitId" UUID',
            'ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT \'STANDART\'',
            'ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN DEFAULT false',
            'ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT',
            'ALTER TABLE "Licenses" ADD COLUMN IF NOT EXISTS "notes" TEXT',
            'ALTER TABLE "Licenses" ADD COLUMN IF NOT EXISTS "maxBranches" INTEGER DEFAULT 1',
            'ALTER TABLE "Licenses" ADD COLUMN IF NOT EXISTS "type" VARCHAR(255) DEFAULT \'REGULAR\'',

            `DO $$ BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_role') THEN
                    CREATE TYPE "enum_Users_role" AS ENUM ('ADMIN', 'SUPER_MASTER', 'USER');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Members_profileType') THEN
                    CREATE TYPE "enum_Members_profileType" AS ENUM ('MEMBER', 'INSTRUCTOR', 'PERSONNEL');
                END IF;
            END $$;`,

            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'TERMINAL'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'INSTRUCTOR'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'RECEPTIONIST'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'MEMBER'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'MUDUR'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'GUEST'",
            "ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'REPORT'",

            `UPDATE "Roles" SET "name" = 'EĞİTMEN' WHERE "name" = 'INSTRUCTOR' AND NOT EXISTS (SELECT 1 FROM "Roles" WHERE "name" = 'EĞİTMEN')`,
            `UPDATE "Users" SET "role" = 'EĞİTMEN' WHERE "role" = 'INSTRUCTOR'`,
            `DELETE FROM "Roles" WHERE "name" = 'INSTRUCTOR'`, 

            "ALTER TYPE \"enum_Members_profileType\" ADD VALUE IF NOT EXISTS 'INSTRUCTOR'",
            "ALTER TYPE \"enum_Members_profileType\" ADD VALUE IF NOT EXISTS 'PERSONNEL'",

            "ALTER TYPE \"enum_Licenses_status\" ADD VALUE IF NOT EXISTS 'PENDING'",

            'CREATE TABLE IF NOT EXISTS "SportGroups" ("id" UUID PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "category" VARCHAR(255), "minAge" INTEGER DEFAULT 0, "maxAge" INTEGER DEFAULT 99, "maxCapacity" INTEGER DEFAULT 30, "isActive" BOOLEAN DEFAULT true, "branchId" UUID NOT NULL, "companyId" UUID NOT NULL, "specialtyId" UUID NOT NULL, "instructorId" UUID, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "MemberSportProfiles" ("id" UUID PRIMARY KEY, "memberId" UUID NOT NULL, "specialtyId" UUID NOT NULL, "level" VARCHAR(255) DEFAULT \'AMATÖR\', "extraData" JSONB DEFAULT \'{}\'::JSONB, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "SportGroupMembers" ("id" UUID PRIMARY KEY, "sportGroupId" UUID NOT NULL, "memberId" UUID NOT NULL, "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "SportEvents" ("id" UUID PRIMARY KEY, "title" VARCHAR(255) NOT NULL, "type" VARCHAR(50) DEFAULT \'MATCH\', "date" TIMESTAMP WITH TIME ZONE NOT NULL, "location" VARCHAR(255), "opponent" VARCHAR(255), "result" VARCHAR(255), "notes" TEXT, "status" VARCHAR(50) DEFAULT \'PLANNED\', "groupId" UUID, "specialtyId" UUID NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "SportPerformances" ("id" UUID PRIMARY KEY, "stats" JSONB DEFAULT \'{}\'::JSONB, "coachRating" DECIMAL(3,1), "coachNotes" TEXT, "eventId" UUID NOT NULL, "memberId" UUID NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            'CREATE TABLE IF NOT EXISTS "SportFormations" ("id" UUID PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "layout" JSONB DEFAULT \'[]\'::JSONB, "sportSpecialtyId" UUID NOT NULL, "branchId" UUID NOT NULL, "companyId" UUID NOT NULL, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW())',
            
            'UPDATE "Members" SET "profileType" = \'MEMBER\' WHERE "profileType" IS NULL',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "neck" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "shoulder" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "hips" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "wrist" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightBicep" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftBicep" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightForearm" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftForearm" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightTricep" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftTricep" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightThigh" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftThigh" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightHamstring" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftHamstring" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "rightCalf" DECIMAL(5, 2)',
            'ALTER TABLE "BodyMeasurements" ADD COLUMN IF NOT EXISTS "leftCalf" DECIMAL(5, 2)',
            'ALTER TABLE "GroupClasses" ADD COLUMN IF NOT EXISTS "groupSchedules" JSONB DEFAULT \'[]\'::JSONB'
        ];

        console.log(`--- [DB] Kritik Şema Güncellemesi Başlatıldı (${queries.length} sorgu) ---`);
        const BATCH_SIZE = 8;
        for (let i = 0; i < queries.length; i += BATCH_SIZE) {
            const batch = queries.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (query) => {
                try {
                    await sequelize.query(query);
                } catch (err) {
                    // Sessiz geçilebilir hatalar (already exists vb.)
                }
            }));
        }

        // Başarılıysa versiyonu kaydet
        try {
            const versionData = JSON.stringify({ version: SCHEMA_VERSION, updatedAt: new Date() });
            await sequelize.query(`
                INSERT INTO "SystemSettings" ("id", "key", "value", "description", "createdAt", "updatedAt") 
                VALUES (md5(random()::text || clock_timestamp()::text)::uuid, 'INTERNAL_SCHEMA_VERSION', '${versionData}'::JSONB, 'Veritabanı şema versiyon takibi', NOW(), NOW())
                ON CONFLICT ("key") DO UPDATE SET "value" = '${versionData}'::JSONB, "updatedAt" = NOW()
            `);
        } catch (verErr) {
            console.error('[DB] Şema versiyonu güncellenemedi:', verErr.message);
        }

        console.log(`--- [DB] Şema Güncelleme Tamamlandı (Versiyon: ${SCHEMA_VERSION}) ---`);
    }

    static async fixAttendanceColumn() {
        try {
            // Tablo mevcut değilse atla
            const [tableCheck] = await sequelize.query(
                `SELECT to_regclass('"BeltExamParticipants"') as tbl`,
                { type: sequelize.QueryTypes.SELECT }
            );
            if (!tableCheck?.tbl) return;

            await sequelize.query('ALTER TABLE "BeltExamParticipants" ALTER COLUMN "attendance" TYPE VARCHAR(255) USING "attendance"::TEXT');
            await sequelize.query(`UPDATE "BeltExamParticipants" SET "attendance" = 'PRESENT' WHERE "attendance" = 'true'`);
            await sequelize.query(`UPDATE "BeltExamParticipants" SET "attendance" = 'ABSENT' WHERE "attendance" = 'false'`);
            await sequelize.query(`UPDATE "BeltExamParticipants" SET "attendance" = 'PENDING' WHERE "attendance" IS NULL OR "attendance" = ''`);
            console.log('--- Attendance kolonu başarıyla güncellendi ---');
        } catch (e) {
            console.error('🔴 ATTENDANCE COLUMN CONVERSION ERROR:', e.message);
        }
    }

    static async forceFixPermissions() {
        const PERM_VERSION = '2024.03.14.009'; // Versiyonu artırarak güncellemeyi zorunlu kıldık

        try {
            // 0. Roles tablosu mevcut mu kontrol et
            const [rolesCheck] = await sequelize.query(
                `SELECT to_regclass('"Roles"') as tbl`,
                { type: sequelize.QueryTypes.SELECT }
            );
            if (!rolesCheck?.tbl) {
                console.log('[DB] Roles tablosu henüz mevcut değil, izin güncellemesi atlanıyor.');
                return;
            }

            // 1. Versiyon Kontrolü
            const [versionResult] = await sequelize.query(`SELECT value->>'version' as version FROM "SystemSettings" WHERE "key" = 'INTERNAL_PERM_VERSION' LIMIT 1`, { type: sequelize.QueryTypes.SELECT });
            if (versionResult && versionResult.version === PERM_VERSION) {
                console.log(`[DB] Rol ve İzinler zaten güncel (Versiyon: ${PERM_VERSION}). Atlama yapılıyor...`);
                return;
            }

            const { Permission, RolePermission, Role } = require('../../models');

            // 2. Eksik Rolleri Tanımla
            await Role.findOrCreate({ where: { name: 'REPORT' }, defaults: { description: 'Rapor okuyucu rolü.', isSystemRole: true } });
            await Role.findOrCreate({ where: { name: 'GUEST' }, defaults: { description: 'Misafir rolü.', isSystemRole: true } });
            const [terminalRoleInstance] = await Role.findOrCreate({ where: { name: 'TERMINAL' }, defaults: { description: 'Kiosk rolü.', isSystemRole: true } });
            const smRole = await Role.findOne({ where: { name: 'SUPER_MASTER' } });

            // 3. İzin Listesi
            const permsToFix = [
                { key: 'FIN_ACC_VIEW', name: 'Finans Yönetimi Erişimi', module: 'Finans Yönetimi' },
                { key: 'FIN_ACC_CREATE', name: 'Yeni Cari Hesap Oluştur', module: 'Finans Yönetimi' },
                { key: 'FIN_ACC_EDIT', name: 'Cari Hesap Düzenle', module: 'Finans Yönetimi' },
                { key: 'FIN_ACC_DELETE', name: 'Cari Hesap Sil', module: 'Finans Yönetimi' },
                { key: 'FIN_ACC_DETAILS', name: 'Hesap Hareketlerini Gör', module: 'Finans Yönetimi' },
                { key: 'FINANCE_VIEW', name: 'Genel Finansal Özet Paneli', module: 'Finans Yönetimi' },
                { key: 'EXPENSE_MANAGE', name: 'Gider ve Masraf Yönetimi', module: 'Finans Yönetimi' },
                { key: 'PAY_PLAN_VIEW', name: 'Taksit ve Ödemeleri Görüntüle', module: 'Finans Yönetimi' },
                { key: 'PAY_PLAN_CREATE', name: 'Yeni Taksit Planı Oluştur', module: 'Finans Yönetimi' },
                { key: 'PAY_PLAN_EDIT', name: 'Taksit Planı Düzenle', module: 'Finans Yönetimi' },
                { key: 'PAY_PLAN_DELETE', name: 'Taksit Planı İptal Et', module: 'Finans Yönetimi' },
                { key: 'PAY_PLAN_DETAILS', name: 'Ödeme Planı Detaylarını Gör', module: 'Finans Yönetimi' },
                { key: 'FINANCE_TRANSACTION', name: 'Tahsilat ve Ödeme İşlemleri', module: 'Finans Yönetimi' },
                { key: 'FINANCE_CREATE', name: 'Hızlı Tahsilat Girişi', module: 'Finans Yönetimi' },
                { key: 'FINANCE_EDIT', name: 'Tahsilat Kaydı Düzeltme', module: 'Finans Yönetimi' },
                { key: 'FINANCE_DELETE', name: 'Tahsilat Kaydı Silme', module: 'Finans Yönetimi' },
                { key: 'BELT_EXAM_VIEW', name: 'Kuşak Sınavlarını Görüntüle', module: 'Kuşak Sınavları' },
                { key: 'BELT_EXAM_CREATE', name: 'Yeni Kuşak Sınavı Ekle', module: 'Kuşak Sınavları' },
                { key: 'BELT_EXAM_EDIT', name: 'Kuşak Sınavı Düzenle', module: 'Kuşak Sınavları' },
                { key: 'BELT_EXAM_DELETE', name: 'Kuşak Sınavı Sil', module: 'Kuşak Sınavları' },
                { key: 'BELT_EXAM_MANAGE', name: 'Sınav Katılımcı ve Sonuç Yönetimi', module: 'Kuşak Sınavları' },
                { key: 'MEASUREMENT_VIEW', name: 'Ölçümleri Görüntüle', module: 'Vücut Ölçümleri' },
                { key: 'MEASUREMENT_CREATE', name: 'Yeni Ölçüm Ekle', module: 'Vücut Ölçümleri' },
                { key: 'MEASUREMENT_EDIT', name: 'Ölçüm Düzenle', module: 'Vücut Ölçümleri' },
                { key: 'MEASUREMENT_DELETE', name: 'Ölçüm Sil', module: 'Vücut Ölçümleri' },
                { key: 'NUTRITION_VIEW', name: 'Beslenme Planlarını Görüntüle', module: 'Beslenme Planları' },
                { key: 'NUTRITION_CREATE', name: 'Yeni Beslenme Planı Ekle', module: 'Beslenme Planları' },
                { key: 'NUTRITION_EDIT', name: 'Beslenme Planı Düzenle', module: 'Beslenme Planları' },
                { key: 'NUTRITION_DELETE', name: 'Beslenme Planı Sil', module: 'Beslenme Planları' },
                { key: 'PRODUCT_VIEW', name: 'Ürünleri Görüntüle', module: 'Satış ve Ürün' },
                { key: 'PRODUCT_MANAGE', name: 'Ürün Yönetimi (Ekle/Düzenle/Sil)', module: 'Satış ve Ürün' },
                { key: 'PRODUCT_GROUP_MANAGE', name: 'Ürün Gruplarını Yönet', module: 'Satış ve Ürün' },
                { key: 'PRODUCT_UNIT_MANAGE', name: 'Ürün Birimlerini Yönet', module: 'Satış ve Ürün' },
                { key: 'SALES_VIEW', name: 'Satış Kayıtlarını Görüntüle', module: 'Satış ve Ürün' },
                { key: 'SALES_CREATE', name: 'Yeni Satış Yap', module: 'Satış ve Ürün' },
                { key: 'PRIVATE_LESSON_VIEW', name: 'Özel Dersleri Görüntüle', module: 'Özel Dersler' },
                { key: 'PRIVATE_LESSON_MANAGE', name: 'Özel Ders Paket Yönetimi', module: 'Özel Dersler' },
                { key: 'SCHEDULE_VIEW', name: 'Ders Programını Görüntüle', module: 'Ders Programı' },
                { key: 'SCHEDULE_MANAGE', name: 'Ders Programı Planlama ve Yönetim', module: 'Ders Programı' },
                { key: 'CAMPAIGN_MANAGE', name: 'Kampanya Yönetimi', module: 'Kampanya Yönetimi' },
                { key: 'ANNOUNCEMENT_MANAGE', name: 'Duyuru Yönetimi', module: 'Duyuru Yönetimi' },
                { key: 'LICENSE_MANAGE', name: 'Lisans Yönetimi - Lisans Üretimi ve Görüntüleme', module: 'LİSANS' },
                { key: 'COMPANY_MANAGE', name: 'Şirket Yönetimi - Şirket Ekleme, Düzenleme ve Silme', module: 'ŞİRKET' },
                { key: 'BRANCH_MANAGE', name: 'Şube Yönetimi - Şube Ekleme, Düzenleme ve Silme', module: 'ŞUBELER' },
                { key: 'ROLE_MANAGE', name: 'Yetki Yönetimi - Rol ve İzin Oluşturma / Düzenleme', module: 'YETKİ YÖNETİMİ' },
                { key: 'TERMINAL_MEMBER_ENTRY', name: 'Üye Giriş Ekranı (Kiosk) Erişimi', module: 'TERMİNAL' },
                { key: 'SPORT_GROUP_VIEW', name: 'Takım / Grupları Görüntüle', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_GROUP_MANAGE', name: 'Takım / Grup Tanımlama ve Yönetim', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_EVENT_VIEW', name: 'Maç ve Etkinlik Takvimini Gör', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_EVENT_MANAGE', name: 'Maç / Etkinlik Oluşturma ve Yönetim', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_PERFORMANCE_VIEW', name: 'Oyuncu Performans Analizlerini Gör', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_PERFORMANCE_MANAGE', name: 'Performans Verisi Girişi ve Değerlendirme', module: 'SPOR YÖNETİMİ' },
                { key: 'SPORT_FORMATION_MANAGE', name: 'Saha Diziliş ve Taktik Tasarımı', module: 'SPOR YÖNETİMİ' },
                { key: 'TACTICAL_BOARD_VIEW', name: 'Taktik Tahtası Erişimi', module: 'SPOR YÖNETİMİ' },
                { key: 'PLAN_VIEW', name: 'Antrenman Planlarını Görüntüle', module: 'ANTRENMAN PLANLARI' },
                { key: 'PLAN_CREATE', name: 'Yeni Plan Oluştur', module: 'ANTRENMAN PLANLARI' },
                { key: 'PLAN_EDIT', name: 'Plan Düzenle', module: 'ANTRENMAN PLANLARI' },
                { key: 'PLAN_DELETE', name: 'Plan Sil', module: 'ANTRENMAN PLANLARI' },
                { key: 'PLAN_LOG_MANAGE', name: 'İdman Onaylama ve Telafi Yönetimi', module: 'ANTRENMAN PLANLARI' }
            ];

            // 4. İzinleri Kaydet (Güçlendirilmiş Döngü)
            for (const p of permsToFix) {
                const [permission, created] = await Permission.findOrCreate({
                    where: { key: p.key },
                    defaults: p
                });
                
                // Eğer zaten varsa ama modül ismi farklıysa güncelle
                if (!created && (permission.module !== p.module || permission.name !== p.name)) {
                    await permission.update({ name: p.name, module: p.module });
                }

                if (smRole) await RolePermission.findOrCreate({ where: { roleId: smRole.id, permissionId: permission.id } });
                
                if (p.key === 'TERMINAL_MEMBER_ENTRY' && terminalRoleInstance) {
                    await RolePermission.findOrCreate({ where: { roleId: terminalRoleInstance.id, permissionId: permission.id } });
                }
            }

            // 5. Versiyonu Güncelle
            const vData = JSON.stringify({ version: PERM_VERSION, updatedAt: new Date() });
            await sequelize.query(`
                INSERT INTO "SystemSettings" ("id", "key", "value", "createdAt", "updatedAt") 
                VALUES (md5(random()::text || clock_timestamp()::text)::uuid, 'INTERNAL_PERM_VERSION', '${vData}'::JSONB, NOW(), NOW())
                ON CONFLICT ("key") DO UPDATE SET "value" = '${vData}'::JSONB, "updatedAt" = NOW()
            `);

            console.log(`--- [DB] Rol ve İzinler güncellendi (Versiyon: ${PERM_VERSION}) ---`);
        } catch (e) {
            console.error('[DB] İzin güncelleme hatası:', e.message);
        }
    }
}

module.exports = DatabaseSchemaService;
