const { 
    Member, User, MembershipPackage, MemberPackage, 
    TrainingPlan, FinancialAccount, SalesTransaction, 
    SalesItem, BeltExam, BeltExamParticipant, 
    PaymentSchedule, PaymentPlan, SportSpecialty,
    Branch, Company, MemberSportProfile, SportGroupMember,
    Attendance,
    sequelize
} = require('../../models');
const { Op } = require('sequelize');
const WhatsAppService = require('../notifications/WhatsAppService');

class MemberService {
    /**
     * Üye Dashboard verilerini hesaplar ve getirir
     */
    static async getMemberDashboardData(memberIdOrUserId) {
        console.log('[DEBUG] MemberService.getMemberDashboardData called for:', memberIdOrUserId);
        const member = await Member.findOne({
            where: {
                [Op.or]: [
                    { id: memberIdOrUserId },
                    { userId: memberIdOrUserId }
                ]
            },
            include: [
                { model: User, as: 'user', attributes: ['username', 'email', 'role'] },
                {
                    model: MemberPackage,
                    as: 'activePackages',
                    where: { status: 'ACTIVE' },
                    required: false,
                    include: [
                        { model: MembershipPackage, as: 'package' },
                        {
                            model: Member,
                            as: 'instructor',
                            attributes: ['id', 'fullName', 'photo', 'instructorCode']
                        }
                    ]
                },
                {
                    model: MembershipPackage,
                    as: 'package',
                    include: [{ model: SportSpecialty, as: 'specialty', attributes: ['name'] }]
                },
                { model: SportSpecialty, as: 'lessonSpecialty', attributes: ['name'] },
                { model: Member, as: 'lessonInstructor', attributes: ['id', 'fullName', 'photo'] }
            ]
        });

        if (!member) {
            console.log('[DEBUG] Member not found in database for:', memberIdOrUserId);
            return null;
        }
        console.log('[DEBUG] Member found:', member.id, 'ProfileType:', member.profileType);

        console.log('[DEBUG] Starting Promise.all for additional data...');
        const [account, recentSales, upcomingExams, activePlansCount] = await Promise.all([
            FinancialAccount.findOne({ where: { entityType: 'MEMBER', entityId: member.id } }),
            SalesTransaction.findAll({
                where: { entityType: 'MEMBER', entityId: member.id, status: 'COMPLETED' },
                include: [{ model: SalesItem, as: 'items' }],
                order: [['transactionDate', 'DESC']],
                limit: 5
            }),
            BeltExamParticipant.findAll({
                where: { memberId: member.id, status: 'PENDING' },
                include: [{
                    model: BeltExam,
                    as: 'exam',
                    where: { examDate: { [Op.gte]: new Date().toISOString().split('T')[0] } }
                }]
            }),
            TrainingPlan.count({ where: { memberId: member.id, isActive: true } })
        ]);
        console.log('[DEBUG] Promise.all completed.');

        // Paket Durumunu Hesapla
        console.log('[DEBUG] Calculating package status...');
        let maxExpiryDate = new Date(0);
        const allPackages = [...(member.activePackages || [])];

        if (member.packageId && !allPackages.find(p => p.packageId === member.packageId)) {
            allPackages.push({
                packageId: member.packageId,
                package: member.package,
                instructor: member.lessonInstructor,
                expiryDate: member.expiryDate,
                remainingSessions: member.lessonType === 'PRIVATE' ? member.privateLessonHours : 0,
                status: 'ACTIVE'
            });
        }

        let totalRemainingSessions = member.lessonType === 'PRIVATE' ? (member.privateLessonHours || 0) : 0;

        allPackages.forEach(pkg => {
            let pkgExp = pkg.expiryDate ? new Date(pkg.expiryDate) : null;
            if (pkgExp) {
                pkgExp.setHours(23, 59, 59, 999);
                if (pkgExp > maxExpiryDate) maxExpiryDate = pkgExp;
            }
            if (pkg.package?.type === 'SESSION') {
                totalRemainingSessions += pkg.remainingSessions || 0;
            }
        });

        const now = new Date();
        const diffTime = maxExpiryDate.getTime() - now.getTime();
        const remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
        console.log('[DEBUG] Package status calculation done. Remaining days:', remainingDays);

        // Son 1 aylık katılım özeti
        console.log('[DEBUG] Fetching attendance summary...');
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);

        const attendance = await Attendance.findAll({
            where: {
                memberId: member.id,
                date: { [Op.gte]: lastMonth }
            },
            order: [['date', 'ASC']]
        });
        console.log('[DEBUG] Attendance summary fetched. Total:', attendance.length);

        const currentBalance = parseFloat(account?.balance || 0);
        const prepaid = parseFloat(account?.prepaidBalance || 0);

        const memberDebt = currentBalance > 0 ? currentBalance.toFixed(2) : '0.00';
        const memberWallet = currentBalance < 0 ? Math.abs(currentBalance).toFixed(2) : (prepaid > 0 ? prepaid.toFixed(2) : '0.00');

        return {
            member,
            stats: {
                activePlansCount,
                remainingDays,
                remainingPrivateSessions: totalRemainingSessions,
                balance: memberWallet,
                totalDebt: memberDebt
            },
            allPackages,
            recentSales,
            upcomingExams,
            attendanceSummary: attendance
        };
    }

    /**
     * Üyeleri filtreleyerek getirir
     */
    static async getAllMembers(filters, user) {
        const startTime = Date.now(); // Manuel kronometre başlat
        const { branchId, companyId, role: userRole } = user;
        const { packageId, lessonType, page = 1, limit = 50, search, profileType } = filters;

        const isSuperMaster = userRole === 'SUPER_MASTER';
        const where = { isActive: true };

        if (!isSuperMaster) {
            if (companyId) where.companyId = companyId;
            if (filters.branchId) where.branchId = filters.branchId;
        } else {
            if (filters.branchId) where.branchId = filters.branchId;
        }

        if (packageId) where.packageId = packageId;
        if (lessonType) where.lessonType = lessonType;
        
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.iLike]: `%${search}%` } },
                { memberCode: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (profileType && profileType !== 'ALL') {
            where.profileType = profileType;
        }

        // Sistem/Kasa hesaplarını dışla
        where[Op.and] = [
            ...(where[Op.and] || []),
            {
                [Op.or]: [
                    { fullName: { [Op.notILike]: '%Kasa%' } },
                    { memberCode: { [Op.not]: null } }
                ]
            }
        ];

        const offset = (page - 1) * limit;

        const [count, rows] = await Promise.all([
            Member.count({ where }),
            Member.findAll({
                where,
                attributes: [
                    'id', 'fullName', 'memberCode', 'phone', 'email', 'gender', 'photo', 
                    'birthDate', 'age', 'bloodGroup', 'specialtyId', 'emergencyPhone', 
                    'height', 'weight', 'startingWeight', 'targetWeight', 
                    'registrationDate', 'expiryDate', 'notificationPreference', 
                    'lessonTypes', 'lessonType', 'isActive', 'profileType', 'specialties',
                    'instructorCode', 'personnelCode', 'branchId', 'companyId', 
                    'activityLevel', 'fitnessGoals', 'membershipType', 'createdAt',
                    'currentBelt', 'beltBranchId', 'lastBeltDate', 'sportGroupId',
                    'fitnessNotes', 'healthNotes', 'city', 'district', 'address', 'packageId'
                ],
                include: [
                    { model: User, as: 'user', attributes: ['email', 'username'] },
                    { model: MembershipPackage, as: 'package', attributes: ['id', 'name', 'price'] },
                    { model: SportSpecialty, as: 'lessonSpecialty', attributes: ['id', 'name'] },
                    { model: SportSpecialty, as: 'specialty', attributes: ['id', 'name'] },
                    { model: SportSpecialty, as: 'beltBranch', attributes: ['id', 'name'] },
                    { model: Branch, as: 'Branch', attributes: ['id', 'name'] },
                    {
                        model: Member,
                        as: 'lessonInstructor',
                        attributes: ['id', 'fullName']
                    },
                    {
                        model: MemberPackage,
                        as: 'activePackages',
                        where: { status: 'ACTIVE' },
                        required: false,
                        include: [{ model: MembershipPackage, as: 'package' }]
                    },
                    {
                        model: MemberSportProfile,
                        as: 'sportProfiles',
                        separate: true
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                subQuery: false,
                distinct: true
            })
        ]);

        const duration = Date.now() - startTime;
        console.log(`🚀 DATABASE_FETCH_TIME: ${duration}ms`); // Hesaplanan süreyi yazdır

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            members: rows
        };
    }

    /**
     * Yeni bir üye (ve kullanıcı) oluşturur
     */
    static async createMember(memberData, currentUser) {
        console.log('[DEBUG] createMember called. Data:', JSON.stringify(memberData));
        const bcrypt = require('bcryptjs');

        // Boş string ve geçersiz değer temizliği (Önemli: User oluşturmadan önce)
        const nullFields = [
            'birthDate', 'expiryDate', 'registrationDate', 'packageId', 
            'privateLessonSpecialtyId', 'privateLessonInstructorId', 
            'bloodGroup', 'beltBranchId', 'specialtyId', 'lastBeltDate', 
            'sportGroupId', 'targetWeight', 'height', 'weight', 'startingWeight',
            'email', 'username', 'phone', 'emergencyPhone',
            'memberCode', 'instructorCode', 'personnelCode',
            'fitnessNotes', 'healthNotes', 'city', 'district', 'address'
        ];
        nullFields.forEach(field => {
            if (memberData[field] === '' || memberData[field] === 'null' || memberData[field] === undefined) {
                memberData[field] = null;
            }
        });

        const {
            fullName, username, password, email,
            phone, birthDate, gender, memberCode,
            registrationDate, expiryDate, packageId,
            profileType = 'MEMBER'
        } = memberData;

        if (!fullName) throw new Error('Ad Soyad zorunludur.');

        const finalBranchId = memberData.branchId || (currentUser && currentUser.branchId) || null;
        const branchObj = finalBranchId ? await Branch.findByPk(finalBranchId) : null;
        const finalCompanyId = memberData.companyId || branchObj?.companyId || (currentUser && currentUser.companyId) || null;

        console.log('[DEBUG] Sanitized values:', { fullName, username, email, phone, finalCompanyId, finalBranchId });

        if (phone) {
            const existing = await Member.findOne({ where: { phone, companyId: finalCompanyId } });
            if (existing) {
                console.log('[DEBUG] Phone already exists:', phone);
                const err = new Error('Bu telefon numarasına sahip bir üye zaten mevcut.');
                err.statusCode = 400;
                throw err;
            }
        }

        if (email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.log('[DEBUG] Email already exists:', email);
                const err = new Error('Bu e-posta adresi zaten başka bir kullanıcı tarafından kullanılıyor.');
                err.statusCode = 400;
                throw err;
            }
        }

        const hashedPassword = bcrypt.hashSync(password || 'member123', 10);
        console.log('[DEBUG] Password hashed sync.');

        const createdMember = await sequelize.transaction(async (t) => {
            try {
                console.log('[DEBUG] Starting transaction...');
                const user = await User.create({
                    username: username || Math.random().toString(36).slice(-8),
                    passwordHash: hashedPassword,
                    email,
                    role: profileType === 'INSTRUCTOR' ? 'EĞİTMEN' : (profileType === 'PERSONNEL' ? 'RECEPTIONIST' : (profileType === 'USER' ? 'USER' : 'MEMBER')),
                    companyId: finalCompanyId,
                    branchId: finalBranchId
                }, { transaction: t });
                console.log('[DEBUG] User created:', user.id);

                if (!username) {
                    await user.update({ username: user.id.slice(0, 8) }, { transaction: t });
                    console.log('[DEBUG] User username updated.');
                }

                // Lesson Types safe initialization
                let lessonTypes = memberData.lessonTypes || [];
                if (!Array.isArray(lessonTypes) || lessonTypes.length === 0) {
                    lessonTypes = ['GENERAL'];
                }
                console.log('[DEBUG] Final lessonTypes:', lessonTypes);

                const member = await Member.create({
                    ...memberData,
                    lessonTypes,
                    sportProfiles: memberData.sportProfiles || [],
                    userId: user.id,
                    companyId: finalCompanyId,
                    branchId: finalBranchId,
                    profileType
                }, { transaction: t });
                console.log('[DEBUG] Member created:', member.id);

                // AUTOMATIC CARI KART (FINANCIAL ACCOUNT) CREATION
                let cariAccount = null;
                try {
                    const FinancialAccountService = require('../finance/FinancialAccountService');
                    cariAccount = await FinancialAccountService.createMemberAccount(member, t);
                    console.log('[DEBUG] Cari Kart automatically created for member:', member.fullName);
                } catch (cariErr) {
                    console.error('[CARİ KART ERROR]:', cariErr.message);
                }

                // SPORT GROUP SYNC: If sportGroupId is provided, create junction entry
                if (member.sportGroupId) {
                    await SportGroupMember.create({
                        sportGroupId: member.sportGroupId,
                        memberId: member.id,
                        isActive: true
                    }, { transaction: t });
                    console.log('[DEBUG] SportGroupMember junction entry created for group:', member.sportGroupId);
                }

                // MEMBERSHIP PACKAGE ASSIGNMENT & BORÇLANDIRMA
                if (member.packageId) {
                    const pkg = await MembershipPackage.findByPk(member.packageId, { transaction: t });
                    if (pkg) {
                        const startDate = member.registrationDate || new Date().toISOString().split('T')[0];
                        let expDate = member.expiryDate;
                        if (!expDate && pkg.durationMonths) {
                            const d = new Date(startDate);
                            d.setMonth(d.getMonth() + parseInt(pkg.durationMonths));
                            expDate = d.toISOString().split('T')[0];
                        }
                        await MemberPackage.create({
                            memberId: member.id,
                            packageId: pkg.id,
                            startDate,
                            expiryDate: expDate,
                            status: 'ACTIVE',
                            paymentStatus: 'UNPAID',
                            remainingSessions: pkg.sessionCount || 0,
                            companyId: finalCompanyId,
                            branchId: finalBranchId,
                            createdBy: currentUser?.id || user.id
                        }, { transaction: t });

                        if (expDate) {
                            await member.update({ expiryDate: expDate }, { transaction: t });
                        }

                        // DEBIT CARI ACCOUNT (BORÇLANDIRMA)
                        const price = parseFloat(pkg.price || 0);
                        if (price > 0 && cariAccount) {
                            await FinancialTransaction.create({
                                financialAccountId: cariAccount.id,
                                amount: price,
                                transactionType: 'DEBIT',
                                category: 'MEMBERSHIP',
                                paymentMethod: 'CARİ',
                                description: `Üyelik Paket Satışı: ${pkg.name}`,
                                branchId: finalBranchId,
                                companyId: finalCompanyId,
                                createdBy: currentUser?.id || user.id
                            }, { transaction: t });

                            await cariAccount.update({
                                totalDebit: sequelize.literal(`"totalDebit" + ${price}`),
                                balance: sequelize.literal(`"balance" + ${price}`)
                            }, { transaction: t });
                            console.log(`[DEBUG] Debited ${price} TL to Cari Account for package: ${pkg.name}`);
                        }
                    }
                }

                return member;
            } catch (innerErr) {
                console.error('[CRITICAL] Transaction failed:', innerErr);
                if (innerErr.errors) {
                    console.error('[DETAILS]:', innerErr.errors.map(e => `${e.path}: ${e.message}`).join(', '));
                }
                throw innerErr;
            }
        });

        // WhatsApp Hoş Geldin Bildirimi
        if (createdMember && createdMember.phone) {
            try {
                const fullMember = await Member.findByPk(createdMember.id, {
                    include: [
                        { model: Branch, as: 'Branch' },
                        { model: Company, as: 'Company' },
                        { model: MembershipPackage, as: 'package' }
                    ]
                });
                if (fullMember) {
                    const identity = WhatsAppService.resolveIdentity(fullMember.Branch, fullMember.Company);
                    const welcomeMsg = WhatsAppService.getWelcomeMessage(
                        fullMember,
                        fullMember.package?.name || 'Standart Üyelik',
                        fullMember.package?.price || null,
                        identity.companyName,
                        identity.branchName,
                        identity.phone
                    );
                    console.log(`📱 [WhatsApp Welcome] Yeni üyeye hoş geldin mesajı gönderiliyor: ${fullMember.phone}`);
                    WhatsAppService.sendAutoMessage(fullMember.phone, welcomeMsg).catch(e => console.error('📱 [WhatsApp Welcome Error]:', e.message));
                }
            } catch (e) {
                console.error('📱 [WhatsApp Welcome Error]:', e.message);
            }
        }

        return createdMember;
    }

    /**
     * Üye bilgilerini günceller
     */
    static async updateMember(id, updateData) {
        const { deleteFile } = require('../../utils/fileHelper');
        const member = await Member.findByPk(id);
        if (!member) throw new Error('Üye bulunamadı.');

        // Fotoğraf değişmişse eskisini sil
        if (updateData.photo && member.photo && updateData.photo !== member.photo) {
            await deleteFile(member.photo);
        }

        // Lesson Types validation/fix
        if (updateData.lessonTypes && Array.isArray(updateData.lessonTypes)) {
            // If explicit array is provided, use it. But handle empty array by keeping it (or default to GENERAL)
            if (updateData.lessonTypes.length === 0) {
                updateData.lessonTypes = ['GENERAL'];
            }
        } else if (updateData.lessonType) {
            // Legacy support
            updateData.lessonTypes = [updateData.lessonType];
        }
        // If lessonTypes is missing from payload, we don't change the current value

        // Boş string temizliği
        const nullFields = [
            'birthDate', 'expiryDate', 'packageId', 'privateLessonSpecialtyId', 
            'privateLessonInstructorId', 'bloodGroup', 'beltBranchId', 
            'specialtyId', 'lastBeltDate', 'sportGroupId',
            'fitnessNotes', 'healthNotes', 'city', 'district', 'address'
        ];
        nullFields.forEach(field => {
            if (updateData[field] === '' || updateData[field] === 'null' || updateData[field] === undefined) {
                updateData[field] = null;
            }
        });

        // MEMBERSHIP PACKAGE SYNC: If packageId changed, create active MemberPackage
        if (updateData.packageId && updateData.packageId !== member.packageId) {
            const pkg = await MembershipPackage.findByPk(updateData.packageId);
            if (pkg) {
                const startDate = updateData.registrationDate || member.registrationDate || new Date().toISOString().split('T')[0];
                let expDate = updateData.expiryDate;
                if (!expDate && pkg.durationMonths) {
                    const d = new Date(startDate);
                    d.setMonth(d.getMonth() + pkg.durationMonths);
                    expDate = d.toISOString().split('T')[0];
                }
                await MemberPackage.create({
                    memberId: member.id,
                    packageId: pkg.id,
                    startDate,
                    expiryDate: expDate,
                    status: 'ACTIVE',
                    paymentStatus: 'PAID',
                    remainingSessions: pkg.sessionCount || 0,
                    companyId: member.companyId,
                    branchId: member.branchId
                });
                if (expDate) {
                    updateData.expiryDate = expDate;
                }
            }
        }

        const oldGroupId = member.sportGroupId;
        await member.update(updateData);
        const newGroupId = member.sportGroupId;

        // SPORT GROUP SYNC: Handle junction table updates on group change
        if (oldGroupId !== newGroupId) {
            console.log(`[DEBUG] Member group changed from ${oldGroupId} to ${newGroupId}. Syncing junction table...`);
            
            // Remove old junction entry if it existed
            if (oldGroupId) {
                await SportGroupMember.destroy({
                    where: { memberId: id, sportGroupId: oldGroupId }
                });
            }

            // Create new junction entry if new group is set
            if (newGroupId) {
                // Ensure we don't create duplicate (though destroy should have handled it if it was the same)
                await SportGroupMember.findOrCreate({
                    where: { memberId: id, sportGroupId: newGroupId },
                    defaults: { isActive: true }
                });
            }
        }
        // WhatsApp Güncelleme Bildirimi
        if (member.phone) {
            try {
                const fullMember = await Member.findByPk(member.id, {
                    include: [
                        { model: Branch, as: 'Branch' },
                        { model: Company, as: 'Company' },
                        { model: MembershipPackage, as: 'package' }
                    ]
                });
                if (fullMember) {
                    const identity = WhatsAppService.resolveIdentity(fullMember.Branch, fullMember.Company);
                    const updateMsg = WhatsAppService.getWelcomeMessage(
                        fullMember,
                        fullMember.package?.name || fullMember.membershipType || 'Standart Üyelik',
                        fullMember.package?.price || null,
                        identity.companyName,
                        identity.branchName,
                        identity.phone
                    );
                    console.log(`📱 [WhatsApp Update] Üye güncellendi, bildirim gönderiliyor: ${fullMember.phone}`);
                    WhatsAppService.sendAutoMessage(fullMember.phone, updateMsg).catch(e => console.error('📱 [WhatsApp Update Error]:', e.message));
                }
            } catch (e) {
                console.error('📱 [WhatsApp Update Error]:', e.message);
            }
        }

        return member;
    }

    /**
     * Üyeyi ve bağlı kullanıcısını siler
     */
    static async deleteMember(id) {
        const { deleteFile } = require('../../utils/fileHelper');
        return await sequelize.transaction(async (t) => {
            const member = await Member.findByPk(id, { transaction: t });
            if (!member) throw new Error('Üye bulunamadı.');

            // Fotoğrafı sil
            if (member.photo) await deleteFile(member.photo);

            if (member.userId) {
                await User.destroy({ where: { id: member.userId }, transaction: t });
            }
            await member.destroy({ transaction: t });
            return true;
        });
    }

    /**
     * Çoklu üye silme
     */
    static async bulkDeleteMembers(ids) {
        const { deleteFile } = require('../../utils/fileHelper');
        return await sequelize.transaction(async (t) => {
            const members = await Member.findAll({ where: { id: ids }, transaction: t });
            
            // Fotoğrafları sil
            for (const member of members) {
                if (member.photo) await deleteFile(member.photo);
            }

            const userIds = members.map(m => m.userId).filter(Boolean);
            
            if (userIds.length > 0) {
                await User.destroy({ where: { id: userIds }, transaction: t });
            }
            await Member.destroy({ where: { id: ids }, transaction: t });
            return ids.length;
        });
    }
}

module.exports = MemberService;
