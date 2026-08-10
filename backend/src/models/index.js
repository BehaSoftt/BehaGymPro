const sequelize = require('../config/database');
const Company = require('./Company');
const Branch = require('./Branch');
const User = require('./User');
const Member = require('./Member');
const MembershipPackage = require('./MembershipPackage');
const TrainingPlan = require('./TrainingPlan');
const { ProductUnit, ProductGroup, Product } = require('./Product');
const Transaction = require('./Transaction');
const AccessLog = require('./AccessLog');
const Expense = require('./Expense');
const BodyMeasurement = require('./BodyMeasurement');
const Exercise = require('./Exercise');
const ExerciseCategory = require('./ExerciseCategory');
const InventoryMovement = require('./InventoryMovement');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const License = require('./License');
const SportSpecialty = require('./SportSpecialty');
const TrainingPlanItem = require('./TrainingPlanItem');
const TrainingPlanDay = require('./TrainingPlanDay');
const MemberPackage = require('./MemberPackage');
const GroupClass = require('./GroupClass');
const GroupClassMember = require('./GroupClassMember');
const Attendance = require('./Attendance');
const TrainingLog = require('./TrainingLog');
const KioskConfig = require('./KioskConfig');
const LessonSchedule = require('./LessonSchedule');
const SystemSetting = require('./SystemSetting');
const FinancialAccount = require('./FinancialAccount');
const FinancialTransaction = require('./FinancialTransaction');
const PaymentPlan = require('./PaymentPlan');
const PaymentSchedule = require('./PaymentSchedule');
const PrivateLessonPackage = require('./PrivateLessonPackage');
const SessionChangeLog = require('./SessionChangeLog');
const NutritionPlan = require('./NutritionPlan');
const BeltExam = require('./BeltExam');
const BeltExamParticipant = require('./BeltExamParticipant');
const SalesTransaction = require('./SalesTransaction');
const SalesItem = require('./SalesItem');
const SalesPayment = require('./SalesPayment');
const Campaign = require('./Campaign');
const Announcement = require('./Announcement');
const ProductRecipe = require('./ProductRecipe');
const MemberSportProfile = require('./MemberSportProfile');
const SportGroup = require('./SportGroup');
const SportGroupMember = require('./SportGroupMember');
const SportEvent = require('./SportEvent');
const SportPerformance = require('./SportPerformance');
const SportFormation = require('./SportFormation');

// --- PRODUCT RECIPE ASSOCIATIONS ---
Product.hasMany(ProductRecipe, { foreignKey: 'productId', as: 'recipe' });
ProductRecipe.belongsTo(Product, { foreignKey: 'productId', as: 'parentProduct' });
ProductRecipe.belongsTo(Product, { foreignKey: 'componentProductId', as: 'component' });


/**
 * BEHAGYM PRO: MERKEZİ ŞEMA YÖNETİMİ (FULL RBAC)
 */

// --- BELT EXAM SYSTEM ---
SportSpecialty.hasMany(BeltExam, { foreignKey: 'branchId', as: 'beltExams' });
BeltExam.belongsTo(SportSpecialty, { foreignKey: 'branchId', as: 'specialty' });

Member.hasMany(BeltExam, { foreignKey: 'instructorId', as: 'conductedExams' }); // Instructors (ProfileType=INSTRUCTOR)
BeltExam.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });

BeltExam.hasMany(BeltExamParticipant, { foreignKey: 'examId', as: 'participants', onDelete: 'CASCADE' });
BeltExamParticipant.belongsTo(BeltExam, { foreignKey: 'examId', as: 'exam' });

Member.hasMany(BeltExamParticipant, { foreignKey: 'memberId', as: 'examHistory' }); // Members (ProfileType=MEMBER)
BeltExamParticipant.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Member.belongsTo(SportSpecialty, { foreignKey: 'beltBranchId', as: 'beltBranch' });
Member.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

// --- RBAC İLİŞKİLERİ ---
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

// Şirket - Lisans İlişkisi
Company.hasMany(License, { foreignKey: 'companyId', as: 'licenses' });
License.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

// Şube - Lisans İlişkisi
Branch.hasMany(License, { foreignKey: 'branchId', as: 'licenses' });
License.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });

// Şirket - Şube İlişkisi
Company.hasMany(Branch, { foreignKey: 'companyId', as: 'branches', onDelete: 'CASCADE' });

Branch.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
Branch.belongsTo(Company, { foreignKey: 'whatsappHeaderCompanyId', as: 'HeaderCompany' });
Branch.belongsTo(Branch, { foreignKey: 'whatsappHeaderBranchId', as: 'HeaderBranch' });

Branch.hasMany(User, { foreignKey: 'branchId', as: 'users' });

// User - KioskConfig İlişkisi
User.hasOne(KioskConfig, { foreignKey: 'userId', as: 'kioskConfig' });
KioskConfig.belongsTo(User, { foreignKey: 'userId' });
User.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });

Branch.hasMany(Member, { foreignKey: 'branchId', as: 'members' });
Member.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });

Company.hasMany(Member, { foreignKey: 'companyId', as: 'members' });
Member.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

Branch.hasMany(Expense, { foreignKey: 'branchId', as: 'expenses' });
Expense.belongsTo(Branch, { foreignKey: 'branchId' });

Branch.hasMany(InventoryMovement, { foreignKey: 'branchId', as: 'inventoryMovements' });
InventoryMovement.belongsTo(Branch, { foreignKey: 'branchId' });

// --- CAMPAIGNS ---
Branch.hasMany(Campaign, { foreignKey: 'branchId', as: 'campaigns' });
Campaign.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
Company.hasMany(Campaign, { foreignKey: 'companyId', as: 'campaigns' });
Campaign.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

// --- ANNOUNCEMENT ASSOCIATIONS ---
Branch.hasMany(Announcement, { foreignKey: 'branchId' });
Announcement.belongsTo(Branch, { foreignKey: 'branchId' });
Company.hasMany(Announcement, { foreignKey: 'companyId' });
Announcement.belongsTo(Company, { foreignKey: 'companyId' });


// --- ÜYE VE MÜŞTERİ HAREKETLERİ ---
Member.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Member, { foreignKey: 'userId', as: 'profile' }); // Unified Profile Alias
User.hasOne(Member, { foreignKey: 'userId', as: 'memberProfile', scope: { profileType: 'MEMBER' } }); // Backward compatibility
User.hasOne(Member, { foreignKey: 'userId', as: 'instructorProfile', scope: { profileType: 'INSTRUCTOR' } }); // Backward compatibility
User.hasOne(Member, { foreignKey: 'userId', as: 'personnelProfile', scope: { profileType: 'PERSONNEL' } }); // Useful alias for staff

Member.hasMany(Transaction, { foreignKey: 'memberId', as: 'transactions' });
Transaction.belongsTo(Member, { foreignKey: 'memberId' });

MembershipPackage.hasMany(Member, { foreignKey: 'packageId', as: 'members' });
Member.belongsTo(MembershipPackage, { foreignKey: 'packageId', as: 'package' });

// --- MULTI-MEMBERSHIP (NEW) ---
Member.hasMany(MemberPackage, { foreignKey: 'memberId', as: 'activePackages' });
MemberPackage.belongsTo(Member, { foreignKey: 'memberId' });

MembershipPackage.hasMany(MemberPackage, { foreignKey: 'packageId', as: 'memberPackages' });
MemberPackage.belongsTo(MembershipPackage, { foreignKey: 'packageId', as: 'package' });

Member.hasMany(MemberPackage, { foreignKey: 'instructorId', as: 'coachedPackages' });
MemberPackage.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });

// --- GROUP CLASSES (NEW) ---
SportSpecialty.hasMany(GroupClass, { foreignKey: 'specialtyId', as: 'groups' });
GroupClass.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

Member.hasMany(GroupClass, { foreignKey: 'instructorId', as: 'taughtGroups' });
GroupClass.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });

MembershipPackage.hasMany(GroupClass, { foreignKey: 'packageId', as: 'groupClasses' });
GroupClass.belongsTo(MembershipPackage, { foreignKey: 'packageId', as: 'package' });

GroupClass.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
GroupClass.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

GroupClass.belongsToMany(Member, { through: GroupClassMember, foreignKey: 'groupClassId', as: 'enrolledMembers' });
Member.belongsToMany(GroupClass, { through: GroupClassMember, foreignKey: 'memberId', as: 'enrolledGroups' });

GroupClass.hasMany(Attendance, { foreignKey: 'groupClassId', as: 'attendanceRecords' });
Attendance.belongsTo(GroupClass, { foreignKey: 'groupClassId', as: 'groupClass' });

Member.hasMany(Attendance, { foreignKey: 'memberId', as: 'attendanceHistory' });
Attendance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Attendance.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });
Member.hasMany(Attendance, { foreignKey: 'instructorId', as: 'conductedAttendance' });

Attendance.belongsTo(PrivateLessonPackage, { foreignKey: 'packageId', as: 'package' });
PrivateLessonPackage.hasMany(Attendance, { foreignKey: 'packageId', as: 'attendanceRecords' });

Member.hasMany(AccessLog, { foreignKey: 'memberId', as: 'accessLogs' });
AccessLog.belongsTo(Member, { foreignKey: 'memberId' });

Member.hasMany(BodyMeasurement, { foreignKey: 'memberId', as: 'measurements' });
BodyMeasurement.belongsTo(Member, { foreignKey: 'memberId' });

Member.hasMany(TrainingPlan, { foreignKey: 'memberId', as: 'trainingPlans' });
TrainingPlan.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// --- NUTRITION PLAN RELATIONSHIP (ONE-TO-ONE) ---
Member.hasOne(NutritionPlan, { foreignKey: 'memberId', onDelete: 'CASCADE', as: 'nutritionPlan' });
NutritionPlan.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

MembershipPackage.hasMany(TrainingPlan, { foreignKey: 'packageId', as: 'trainingPlans' });
TrainingPlan.belongsTo(MembershipPackage, { foreignKey: 'packageId', as: 'package' });

// Private Lesson Relationships
Member.belongsTo(SportSpecialty, { foreignKey: 'privateLessonSpecialtyId', as: 'lessonSpecialty' });
Member.belongsTo(Member, { foreignKey: 'privateLessonInstructorId', as: 'lessonInstructor' });

// PrivateLessonPackage Relationships
PrivateLessonPackage.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Member.hasMany(PrivateLessonPackage, { foreignKey: 'memberId', as: 'privateLessonPackages' });

PrivateLessonPackage.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });
SportSpecialty.hasMany(PrivateLessonPackage, { foreignKey: 'specialtyId', as: 'privateLessonPackages' });

PrivateLessonPackage.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });
Member.hasMany(PrivateLessonPackage, { foreignKey: 'instructorId', as: 'coachedPrivatePackages' });

PrivateLessonPackage.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
PrivateLessonPackage.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
PrivateLessonPackage.belongsTo(SportGroup, { foreignKey: 'sportGroupId', as: 'sportGroup' });
SportGroup.hasMany(PrivateLessonPackage, { foreignKey: 'sportGroupId', as: 'privateLessonPackages' });

PrivateLessonPackage.belongsTo(ExerciseCategory, { foreignKey: 'categoryId', as: 'category' });
ExerciseCategory.hasMany(PrivateLessonPackage, { foreignKey: 'categoryId', as: 'privateLessonPackages' });

// PrivateLessonPackage - TrainingPlan RELATIONSHIP (Polymorphic-like usage of packageId)
PrivateLessonPackage.hasMany(TrainingPlan, { foreignKey: 'packageId', as: 'trainingPlans' });
TrainingPlan.belongsTo(PrivateLessonPackage, { foreignKey: 'packageId', as: 'privateLessonPackage' });

// SessionChangeLog Relationships
SessionChangeLog.belongsTo(PrivateLessonPackage, { foreignKey: 'packageId', as: 'package' });
PrivateLessonPackage.hasMany(SessionChangeLog, { foreignKey: 'packageId', as: 'changeLogs' });

SessionChangeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SessionChangeLog.belongsTo(Attendance, { foreignKey: 'attendanceId', as: 'attendance' });

// Training Plan Relationships
TrainingPlan.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });
Member.hasMany(TrainingPlan, { foreignKey: 'instructorId', as: 'createdTrainingPlans' });
TrainingPlan.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });
SportSpecialty.hasMany(TrainingPlan, { foreignKey: 'specialtyId', as: 'trainingPlans' });

// --- STOK VE ÜRÜNLER ---
ProductGroup.hasMany(Product, { foreignKey: 'groupId', as: 'products' });
Product.belongsTo(ProductGroup, { foreignKey: 'groupId', as: 'group' });

ProductUnit.hasMany(Product, { foreignKey: 'unitId', as: 'products' });
Product.belongsTo(ProductUnit, { foreignKey: 'unitId', as: 'productUnit' });

Product.hasMany(InventoryMovement, { foreignKey: 'productId', as: 'movements' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });

// --- BRANŞ (SPORT SPECIALTY) İLİŞKİLERİ ---
SportSpecialty.hasMany(MembershipPackage, { foreignKey: 'specialtyId', as: 'packages' });
MembershipPackage.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

// Branş -> Alt Başlık -> İstasyon
SportSpecialty.hasMany(ExerciseCategory, { foreignKey: 'specialtyId', as: 'categories' });
ExerciseCategory.belongsTo(SportSpecialty, { foreignKey: 'specialtyId' });

ExerciseCategory.hasMany(Exercise, { foreignKey: 'categoryId', as: 'exercises' });
Exercise.belongsTo(ExerciseCategory, { foreignKey: 'categoryId', as: 'category' });

SportSpecialty.hasMany(Exercise, { foreignKey: 'specialtyId', as: 'exercises' });
Exercise.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

TrainingPlan.hasMany(TrainingPlanItem, { foreignKey: 'planId', as: 'items', onDelete: 'CASCADE' });
TrainingPlanItem.belongsTo(TrainingPlan, { foreignKey: 'planId' });

Exercise.hasMany(TrainingPlanItem, { foreignKey: 'exerciseId', as: 'planItems' });
TrainingPlanItem.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

TrainingPlan.hasMany(TrainingPlanDay, { foreignKey: 'planId', as: 'days', onDelete: 'CASCADE' });
TrainingPlanDay.belongsTo(TrainingPlan, { foreignKey: 'planId' });

// Training Log Associations
Member.hasMany(TrainingLog, { foreignKey: 'memberId', as: 'trainingLogs' });
TrainingLog.belongsTo(Member, { foreignKey: 'memberId' });
TrainingPlan.hasMany(TrainingLog, { foreignKey: 'planId', as: 'logs' });
TrainingLog.belongsTo(TrainingPlan, { foreignKey: 'planId' });

// --- LESSON SCHEDULE RELATIONSHIPS ---
LessonSchedule.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });
Member.hasMany(LessonSchedule, { foreignKey: 'instructorId', as: 'teachingSchedules' });

LessonSchedule.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Member.hasMany(LessonSchedule, { foreignKey: 'memberId', as: 'lessonSchedules' });

LessonSchedule.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });
SportSpecialty.hasMany(LessonSchedule, { foreignKey: 'specialtyId', as: 'schedules' });

LessonSchedule.belongsTo(ExerciseCategory, { foreignKey: 'categoryId', as: 'category' });
ExerciseCategory.hasMany(LessonSchedule, { foreignKey: 'categoryId', as: 'schedules' });

LessonSchedule.belongsTo(GroupClass, { foreignKey: 'groupClassId', as: 'groupClass' });
GroupClass.hasMany(LessonSchedule, { foreignKey: 'groupClassId', as: 'schedules' });

LessonSchedule.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
LessonSchedule.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

// --- FINANCIAL ACCOUNT RELATIONSHIPS ---
FinancialAccount.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
FinancialAccount.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

// Polymorphic-like relationships for FinancialAccount
// Now they all point to Member model but we can keep aliases for logical clarity
Member.hasOne(FinancialAccount, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'financialAccount'
});
FinancialAccount.belongsTo(Member, {
    foreignKey: 'entityId',
    constraints: false,
    as: 'profile'
});

FinancialAccount.hasMany(FinancialTransaction, { foreignKey: 'financialAccountId', as: 'transactions' });
FinancialTransaction.belongsTo(FinancialAccount, { foreignKey: 'financialAccountId', as: 'account' });

FinancialTransaction.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
FinancialTransaction.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
FinancialTransaction.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// --- PAYMENT PLAN RELATIONSHIPS ---
PaymentPlan.belongsTo(FinancialAccount, { foreignKey: 'financialAccountId', as: 'account' });
FinancialAccount.hasMany(PaymentPlan, { foreignKey: 'financialAccountId', as: 'paymentPlans' });

PaymentPlan.belongsTo(FinancialTransaction, { foreignKey: 'relatedTransactionId', as: 'relatedTransaction' });

PaymentPlan.hasMany(PaymentSchedule, { foreignKey: 'paymentPlanId', as: 'schedules' });
PaymentSchedule.belongsTo(PaymentPlan, { foreignKey: 'paymentPlanId', as: 'plan' });

PaymentSchedule.belongsTo(FinancialTransaction, { foreignKey: 'transactionId', as: 'transaction' });

PaymentPlan.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
PaymentPlan.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

PaymentSchedule.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
PaymentSchedule.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

// --- SALES SYSTEM RELATIONSHIPS ---
Product.hasMany(SalesItem, { foreignKey: 'productId', as: 'salesItems' });
SalesItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

SalesTransaction.hasMany(SalesItem, { foreignKey: 'salesTransactionId', as: 'items', onDelete: 'RESTRICT' });
SalesItem.belongsTo(SalesTransaction, { foreignKey: 'salesTransactionId', as: 'transaction' });

SalesTransaction.hasMany(SalesPayment, { foreignKey: 'salesTransactionId', as: 'payments', onDelete: 'CASCADE' });
SalesPayment.belongsTo(SalesTransaction, { foreignKey: 'salesTransactionId', as: 'transaction' });

SalesTransaction.belongsTo(FinancialAccount, { foreignKey: 'financialAccountId', as: 'account' });
FinancialAccount.hasMany(SalesTransaction, { foreignKey: 'financialAccountId', as: 'salesTransactions' });

SalesPayment.belongsTo(FinancialTransaction, { foreignKey: 'financialTransactionId', as: 'financialTransaction' });
FinancialTransaction.belongsTo(SalesTransaction, { foreignKey: 'salesTransactionId', as: 'salesTransaction' });
SalesTransaction.hasMany(FinancialTransaction, { foreignKey: 'salesTransactionId', as: 'financialTransactions' });

SalesTransaction.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
SalesTransaction.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
SalesTransaction.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// --- GENERIC SPORT MANAGEMENT ASSOCIATIONS ---
Member.hasMany(MemberSportProfile, { foreignKey: 'memberId', as: 'sportProfiles' });
MemberSportProfile.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

SportSpecialty.hasMany(MemberSportProfile, { foreignKey: 'specialtyId', as: 'memberProfiles' });
MemberSportProfile.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

// Groups (Teams)
SportGroup.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
SportGroup.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });
SportGroup.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });
SportGroup.belongsTo(Member, { foreignKey: 'instructorId', as: 'instructor' });

SportGroup.belongsToMany(Member, { through: SportGroupMember, foreignKey: 'sportGroupId', as: 'players' });
Member.belongsToMany(SportGroup, { through: SportGroupMember, foreignKey: 'memberId', as: 'teams' });

// Events & Performance
SportGroup.hasMany(SportEvent, { foreignKey: 'groupId', as: 'events' });
SportEvent.belongsTo(SportGroup, { foreignKey: 'groupId', as: 'group' });

SportSpecialty.hasMany(SportEvent, { foreignKey: 'specialtyId', as: 'events' });
SportEvent.belongsTo(SportSpecialty, { foreignKey: 'specialtyId', as: 'specialty' });

SportEvent.hasMany(SportPerformance, { foreignKey: 'eventId', as: 'performances', onDelete: 'CASCADE' });
SportPerformance.belongsTo(SportEvent, { foreignKey: 'eventId', as: 'event' });

Member.hasMany(SportPerformance, { foreignKey: 'memberId', as: 'matchHistory' });
SportPerformance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Formations
SportSpecialty.hasMany(SportFormation, { foreignKey: 'sportSpecialtyId', as: 'formations' });
SportFormation.belongsTo(SportSpecialty, { foreignKey: 'sportSpecialtyId', as: 'specialty' });
SportFormation.belongsTo(Branch, { foreignKey: 'branchId', as: 'Branch' });
SportFormation.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

module.exports = {
    sequelize,
    Company,
    Branch,
    User,
    Member,
    MembershipPackage,
    TrainingPlan,
    ProductGroup,
    ProductUnit,
    Product,
    Transaction,
    AccessLog,
    Expense,
    BodyMeasurement,
    Exercise,
    ExerciseCategory,
    InventoryMovement,
    Role,
    Permission,
    RolePermission,
    License,
    SportSpecialty,
    TrainingPlanItem,
    TrainingPlanDay,
    MemberPackage,
    GroupClass,
    GroupClassMember,
    Attendance,
    TrainingLog,
    KioskConfig,
    LessonSchedule,
    SystemSetting,
    FinancialAccount,
    FinancialTransaction,
    PaymentPlan,
    PaymentSchedule,
    PrivateLessonPackage,
    SessionChangeLog,
    NutritionPlan,
    BeltExam,
    BeltExamParticipant,
    SalesTransaction,
    SalesItem,
    SalesPayment,
    Campaign,
    Announcement,
    ProductRecipe,
    MemberSportProfile,
    SportGroup,
    SportGroupMember,
    SportEvent,
    SportPerformance,
    SportFormation
};
