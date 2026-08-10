const path = require('path');
const dotenv = require('dotenv');

const isPkg = typeof process.pkg !== 'undefined';
const envPath = isPkg 
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(process.cwd(), '.env');

dotenv.config({ path: envPath });

const express = require('express');
const cors = require('cors');

console.log('--- [BOOT] SİSTEM BAŞLATILIYOR ---');
console.log(`[BOOT] Env Path: ${envPath}`);
console.log(`[BOOT] DB_HOST: ${process.env.DB_HOST}`);
console.log(`[BOOT] DB_USER: ${process.env.DB_USER}`);
console.log(`[BOOT] DB_NAME: ${process.env.DB_NAME}`);
console.log(`[BOOT] PORT: ${process.env.PORT || 5000}`);

// JWT Secret kontrolü
const secret = process.env.JWT_SECRET;
if (!secret || secret === 'PROTECTED_BY_BEHASOFT') {
    console.log('[WARN] JWT_SECRET varsayılan güvenlik modunda çalışıyor.');
} else {
    console.log('[INFO] JWT_SECRET başarıyla yüklendi.');
}

console.log('--- [BOOT] ENV KONTROLÜ TAMAM ---');

const sequelize = require('./models').sequelize;
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const packageRoutes = require('./routes/packageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const qrRoutes = require('./routes/qrRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const specialtyRoutes = require('./routes/sportSpecialtyRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const exerciseCategoryRoutes = require('./routes/exerciseCategoryRoutes');
const trainingPlanRoutes = require('./routes/trainingPlanRoutes');
const branchRoutes = require('./routes/branchRoutes');
const companyRoutes = require('./routes/companyRoutes');
const memberPackageRoutes = require('./routes/memberPackageRoutes');
const groupClassRoutes = require('./routes/groupClassRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const testRoutes = require('./routes/testRoutes');
const roleRoutes = require('./routes/roleRoutes');
const lessonScheduleRoutes = require('./routes/lessonScheduleRoutes');
const privateLessonPackageRoutes = require('./routes/privateLessonPackages');
const settingRoutes = require('./routes/settingRoutes');
const financialAccountRoutes = require('./routes/financialAccountRoutes');
const paymentPlanRoutes = require('./routes/paymentPlanRoutes');
const bodyMeasurementRoutes = require('./routes/bodyMeasurementRoutes');
const nutritionPlanRoutes = require('./routes/nutritionPlanRoutes');
const beltExamRoutes = require('./routes/beltExamRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const campaignRoutes = require('./routes/campaigns');
const announcementRoutes = require('./routes/announcements');
const licenseRoutes = require('./routes/licenseRoutes');
const sportGroupRoutes = require('./routes/sportGroupRoutes');
const sportEventRoutes = require('./routes/sportEventRoutes');
const sportPerformanceRoutes = require('./routes/sportPerformanceRoutes');
const sportFormationRoutes = require('./routes/sportFormationRoutes');
const seedSuperMaster = require('./scripts/seed');
const ensureDatabaseExists = require('./utils/dbInit');
const { License } = require('./models');
const SecurityVault = require('./utils/SecurityVault');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const SchedulerService = require('./services/notifications/SchedulerService');

const app = express();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Geliştirme aşamasında veya listedeki origin'ler için izin ver
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('CORS kısıtlaması: Bu origin için izin verilmiyor.'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/', generalLimiter);

const startServer = async () => {
    try {
        await ensureDatabaseExists();
        await sequelize.authenticate();

        // 1. DB Şemasını ve Yetkileri Servis Üzerinden Güncelle
        const DatabaseSchemaService = require('./services/admin/DatabaseSchemaService');
        await DatabaseSchemaService.updateSchema();
        await DatabaseSchemaService.fixAttendanceColumn();
        await DatabaseSchemaService.forceFixPermissions();

        // 2. Tabloları ve İlişkileri Senkronize Et (Sequelize Sync)
        console.log('--- Şema Senkronizasyonu Başlatıldı ---');
        await sequelize.sync();
        console.log('--- Şema Senkronizasyonu Tamamlandı ---');

        // [AUTO-SEED] Eğer veritabanı boş ise (yeni oluşturulmuşsa) otomatik olarak ana kullanıcıyı ve yetkileri oluştur.
        const { User } = require('./models');
        try {
            const userCount = await User.count();
            if (userCount === 0) {
                console.log('--- [AUTO-SEED] Veritabanı boş görünüyor. Kurulum başlatılıyor... ---');
                await seedSuperMaster();
                
                const fixCashAccounts = require('./utils/fixCashAccounts');
                await fixCashAccounts();
                console.log('--- [AUTO-SEED] Temel kurulum başarıyla tamamlandı. ---');
            }
        } catch (seedErr) {
            console.error('--- [AUTO-SEED] Otomatik kurulum sırasında hata (Normal olabilir):', seedErr.message);
        }

        if (process.env.DB_SYNC === 'true') {
            console.log('--- [DB SYNC] Syncing with alter: true... ---');
            await sequelize.sync({ alter: true });
            
            console.log('--- [SEED] Starting seedSuperMaster... ---');
            await seedSuperMaster();
            
            const fixCashAccounts = require('./utils/fixCashAccounts');
            await fixCashAccounts();
        }

        // Static Files & Uploads
        const isPkg = typeof process.pkg !== 'undefined';
        const staticUploadsDir = isPkg
            ? path.join(path.dirname(process.execPath), 'uploads')
            : path.join(__dirname, '../uploads');

        app.use('/uploads', express.static(staticUploadsDir));

        // API Rotaları
        const frontendPath = isPkg
            ? path.join(path.dirname(process.execPath), '..', 'frontend', 'dist')
            : path.join(__dirname, '../../frontend/dist');

        console.log(`[BOOT] Frontend yolu: ${frontendPath}`);
        app.use(express.static(frontendPath));

        app.use('/api/auth', authRoutes);
        app.use('/api/members', memberRoutes);
        app.use('/api/packages', packageRoutes);
        app.use('/api/membership-packages', packageRoutes);
        const financialTransactionRoutes = require('./routes/financialTransactionRoutes');
        app.use('/api/financial-transactions', financialTransactionRoutes);
        app.use('/api/transactions', transactionRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/qr', qrRoutes);
        app.use('/api/dashboard', dashboardRoutes);
        app.use('/api/specialties', specialtyRoutes);
        app.use('/api/sport-specialties', specialtyRoutes);
        app.use('/api/exercises', exerciseRoutes);
        app.use('/api/exercise-categories', exerciseCategoryRoutes);
        app.use('/api/training-plans', trainingPlanRoutes);
        app.use('/api/branches', branchRoutes);
        app.use('/api/companies', companyRoutes);
        app.use('/api/member-packages', memberPackageRoutes);
        app.use('/api/group-classes', groupClassRoutes);
        app.use('/api/attendance', attendanceRoutes);
        app.use('/api/instructors', instructorRoutes);
        app.use('/api/lesson-schedules', lessonScheduleRoutes);
        app.use('/api/private-lesson-packages', privateLessonPackageRoutes);
        app.use('/api/upload', uploadRoutes);
        app.use('/api/roles', roleRoutes);
        app.use('/api/settings', settingRoutes);
        app.use('/api/financial-accounts', financialAccountRoutes);
        app.use('/api/payment-plans', paymentPlanRoutes);
        app.use('/api/financial-plans', paymentPlanRoutes);
        app.use('/api/body-measurements', bodyMeasurementRoutes);
        app.use('/api/nutrition-plans', nutritionPlanRoutes);
        app.use('/api/belt-exams', beltExamRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/sales', salesRoutes);
        app.use('/api/campaigns', campaignRoutes);
        app.use('/api/announcements', announcementRoutes);
        app.use('/api/licenses', licenseRoutes);
        app.use('/api/sport-groups', sportGroupRoutes);
        app.use('/api/sport-events', sportEventRoutes);
        app.use('/api/sport-performances', sportPerformanceRoutes);
        app.use('/api/sport-formations', sportFormationRoutes);
        app.use('/api/test', testRoutes);

        // SPA Catch-all (Express 5 PathError riskini sıfırlamak için middleware kullanıyoruz)
        app.use((req, res, next) => {
            // Sadece GET istekleri ve API/Upload olmayan rotalar için index.html gönder
            if (req.method === 'GET' &&
                !req.path.startsWith('/api') &&
                !req.path.startsWith('/uploads') &&
                !req.path.includes('.')) { // Dosya uzantısı içermeyen (sayfa rotası olan) isteklere bak
                return res.sendFile(path.join(frontendPath, 'index.html'));
            }
            next();
        });

        app.get('/', (req, res) => {
            res.json({ app: 'BehaGym Pro API', status: 'Online' });
        });

        // Health check endpoint for connection testing
        app.get('/api', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        app.get('/api/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        app.get('/api/fix-cash', async (req, res) => {
            try {
                const fixAccounts = require('./utils/fixCashAccounts');
                await fixAccounts();
                res.json({ message: 'Kasa düzeltme komutu başarıyla çalıştırıldı.' });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.use(notFoundHandler);
        app.use(errorHandler);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            const localIPs = [];
            
            Object.keys(networkInterfaces).forEach((interfaceName) => {
                networkInterfaces[interfaceName].forEach((iface) => {
                    if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
                        localIPs.push(iface.address);
                    }
                });
            });

            console.log('\x1b[32m%s\x1b[0m', `🚀 BEHAGYM PRO AKTİF: PORT ${PORT}`);
            console.log('\x1b[36m%s\x1b[0m', `------------------------------------------------------`);
            console.log('\x1b[36m%s\x1b[0m', `🌍 YEREL AĞDAN ERİŞİM İÇİN ŞU ADRESLERİ KULLANIN:`);
            console.log('\x1b[34m%s\x1b[0m', `   🏠 Yerel: http://localhost:${PORT}`);
            localIPs.forEach(ip => {
                console.log('\x1b[34m%s\x1b[0m', `   🌐 Ağ:    http://${ip}:${PORT}`);
            });
            console.log('\x1b[36m%s\x1b[0m', `------------------------------------------------------`);

            SchedulerService.start();

            // WHATSAPP OTOMASYON BAŞLATMA
            const WhatsAppService = require('./services/notifications/WhatsAppService');
            WhatsAppService.initialize();
        });

    } catch (err) {
        console.error('!!! SİSTEM BAŞLATMA HATASI !!!', err);
        process.exit(1);
    }
};

startServer();

