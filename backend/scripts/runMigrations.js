require('dotenv').config();
const sequelize = require('./src/config/database');
const { PrivateLessonPackage, SessionChangeLog, Attendance, MembershipPackage, Member, NutritionPlan } = require('./src/models');

async function runMigrations() {
    try {
        console.log('🔄 Migration başlatılıyor...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Veritabanı bağlantısı başarılı');

        // Sync models (creates tables if they don't exist)
        await PrivateLessonPackage.sync({ alter: true });
        console.log('✅ PrivateLessonPackages tablosu oluşturuldu/güncellendi');

        await SessionChangeLog.sync({ alter: true });
        console.log('✅ SessionChangeLogs tablosu oluşturuldu/güncellendi');

        await Attendance.sync({ alter: true });
        console.log('✅ Attendances tablosu güncellendi (packageId eklendi)');

        await MembershipPackage.sync({ alter: true });
        console.log('✅ MembershipPackages tablosu güncellendi (weeklySessionCount eklendi)');

        await Member.sync({ alter: true });
        console.log('✅ Members tablosu güncellendi (nextMeasurementDate eklendi)');

        await NutritionPlan.sync({ alter: true });
        console.log('✅ NutritionPlans tablosu oluşturuldu/güncellendi');

        console.log('✅ Tüm migration\'lar başarıyla tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration hatası:', error);
        process.exit(1);
    }
}

runMigrations();
