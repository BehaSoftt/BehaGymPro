const express = require('express');
const router = express.Router();
const { PrivateLessonPackage, Member, SportSpecialty, User, SessionChangeLog, TrainingPlan, Attendance, SportGroup, ExerciseCategory } = require('../models');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// GET /api/private-lesson-packages - List packages with filters
router.get('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.INSTRUCTOR, ROLES.EĞİTMEN]), async (req, res) => {
    try {
        const { memberId, instructorId, status, isArchived, search, page = 1, limit = 50 } = req.query;
        const { branchId, companyId, role } = req.user;
        const offset = (page - 1) * limit;

        const isSuperMaster = role === 'SUPER_MASTER';
        const where = {};

        if (!isSuperMaster) {
            where.branchId = branchId;
            where.companyId = companyId;
        }

        if (memberId) where.memberId = memberId;
        if (instructorId) where.instructorId = instructorId;
        if (status) where.status = status;
        where.isArchived = isArchived === 'true' ? true : false;

        if (search) {
            where[Op.or] = [
                { '$member.fullName$': { [Op.iLike]: `%${search}%` } },
                { '$member.memberCode$': { [Op.iLike]: `%${search}%` } },
                { '$specialty.name$': { [Op.iLike]: `%${search}%` } },
                { '$instructor.fullName$': { [Op.iLike]: `%${search}%` } }
            ];
        }

        const today = new Date().toISOString().split('T')[0];
        const { count, rows: packages } = await PrivateLessonPackage.findAndCountAll({
            where,
            include: [
                {
                    model: Member,
                    as: 'member',
                    attributes: ['id', 'fullName', 'memberCode', 'phone', 'photo']
                },
                {
                    model: SportSpecialty,
                    as: 'specialty',
                    attributes: ['id', 'name']
                },
                {
                    model: Member,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'photo', 'instructorCode']
                },
                {
                    model: SportGroup,
                    as: 'sportGroup',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: ExerciseCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: TrainingPlan,
                    as: 'trainingPlans',
                    attributes: ['id', 'title'],
                    required: false
                },
                {
                    model: Attendance,
                    as: 'attendanceRecords',
                    where: { date: today },
                    required: false,
                    attributes: ['id', 'status', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            subQuery: false // Necessary for searching on joined tables with limit
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            packages
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Paketler getirilemedi',
                details: error.message
            }
        });
    }
});

// GET /api/private-lesson-packages/:id - Get single package
router.get('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.INSTRUCTOR, ROLES.EĞİTMEN]), async (req, res) => {
    try {
        const { id } = req.params;

        const package = await PrivateLessonPackage.findByPk(id, {
            include: [
                {
                    model: Member,
                    as: 'member',
                    attributes: ['id', 'fullName', 'memberCode', 'phone', 'email', 'photo']
                },
                {
                    model: SportSpecialty,
                    as: 'specialty',
                    attributes: ['id', 'name']
                },
                {
                    model: Member,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'photo', 'instructorCode']
                },
                {
                    model: SportGroup,
                    as: 'sportGroup',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: ExerciseCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        if (!package) {
            return res.status(404).json({
                error: {
                    code: 'PACKAGE_NOT_FOUND',
                    message: 'Paket bulunamadı'
                }
            });
        }

        res.json(package);
    } catch (error) {
        console.error('Get package error:', error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Paket getirilemedi',
                details: error.message
            }
        });
    }
});

// POST /api/private-lesson-packages - Create package
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), async (req, res) => {
    console.log('CREATE PKG REQ BODY:', JSON.stringify(req.body, null, 2));
    try {
        const { memberId, specialtyId, instructorId, sessionCount, price, startDate, expiryDate, days, sportGroupId, categoryId, dayCategories, categoryIds } = req.body;
        const { branchId, companyId } = req.user;

        // Validate member has PRIVATE in lessonTypes
        const member = await Member.findByPk(memberId);
        if (!member) {
            return res.status(404).json({
                error: {
                    code: 'MEMBER_NOT_FOUND',
                    message: 'Üye bulunamadı'
                }
            });
        }

        if (!member.lessonTypes || !member.lessonTypes.includes('PRIVATE')) {
            return res.status(400).json({
                error: {
                    code: 'NO_PRIVATE_ACCESS',
                    message: 'Üyenin özel ders erişimi bulunmamaktadır'
                }
            });
        }

        // Create package
        const package = await PrivateLessonPackage.create({
            memberId,
            specialtyId,
            instructorId,
            sessionCount,
            remainingSessions: sessionCount, // Initialize with sessionCount
            price,
            startDate,
            expiryDate: expiryDate || null,
            days,
            status: 'ACTIVE',
            branchId: req.body.branchId || branchId,
            companyId: req.body.companyId || companyId,
            sportGroupId: sportGroupId || null,
            categoryId: categoryId || null,
            dayCategories: dayCategories || {},
            categoryIds: categoryIds || []
        });

        // COORDINATION: Update Member's expiryDate if the new one is further
        if (expiryDate && (!member.expiryDate || new Date(expiryDate) > new Date(member.expiryDate))) {
            await member.update({ expiryDate });
        }

        // Fetch with relations
        const createdPackage = await PrivateLessonPackage.findByPk(package.id, {
            include: [
                { model: Member, as: 'member', attributes: ['id', 'fullName', 'memberCode', 'photo'] },
                { model: SportSpecialty, as: 'specialty', attributes: ['id', 'name'] },
                {
                    model: Member,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'photo', 'instructorCode']
                },
                {
                    model: SportGroup,
                    as: 'sportGroup',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        res.status(201).json(createdPackage);
    } catch (error) {
        console.error('Create package full error:', error);
        
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            console.error('Validation Error Details:', error.errors.map(e => ({ field: e.path, value: e.value, message: e.message })));
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.errors[0].message,
                    details: error.errors.map(e => ({ field: e.path, message: e.message }))
                }
            });
        }

        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Paket oluşturulamadı',
                details: error.message
            }
        });
    }
});

// PUT /api/private-lesson-packages/:id - Update package
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId, specialtyId, instructorId, sessionCount, remainingSessions, price, expiryDate, days, sportGroupId, categoryId, dayCategories, categoryIds } = req.body;

        const package = await PrivateLessonPackage.findByPk(id);
        if (!package) {
            return res.status(404).json({
                error: {
                    code: 'PACKAGE_NOT_FOUND',
                    message: 'Paket bulunamadı'
                }
            });
        }

        // Prevent memberId change
        if (memberId && memberId !== package.memberId) {
            return res.status(400).json({
                error: {
                    code: 'MEMBER_ID_IMMUTABLE',
                    message: 'Paket üyesi değiştirilemez'
                }
            });
        }

        const updateData = {};
        if (specialtyId !== undefined) updateData.specialtyId = specialtyId;
        if (instructorId !== undefined) updateData.instructorId = instructorId;
        if (sessionCount !== undefined) updateData.sessionCount = sessionCount;
        if (price !== undefined) updateData.price = price;
        if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
        if (days !== undefined) updateData.days = days;
        if (sportGroupId !== undefined) updateData.sportGroupId = sportGroupId || null;
        if (categoryId !== undefined) updateData.categoryId = categoryId || null;
        if (dayCategories !== undefined) updateData.dayCategories = dayCategories || {};
        if (categoryIds !== undefined) updateData.categoryIds = categoryIds || [];

        // Handle manual remainingSessions update with logging
        if (remainingSessions !== undefined && remainingSessions !== package.remainingSessions) {
            const { reason } = req.body;

            // Log the manual change
            await SessionChangeLog.create({
                packageId: package.id,
                changeType: 'MANUAL_UPDATE',
                previousValue: package.remainingSessions,
                newValue: remainingSessions,
                reason: reason || 'Manuel güncelleme',
                userId: req.user.id,
                timestamp: new Date()
            });

            updateData.remainingSessions = remainingSessions;
        }

        await package.update(updateData);

        // Fetch updated package with relations
        const updatedPackage = await PrivateLessonPackage.findByPk(id, {
            include: [
                { model: Member, as: 'member', attributes: ['id', 'fullName', 'memberCode', 'photo'] },
                { model: SportSpecialty, as: 'specialty', attributes: ['id', 'name'] },
                {
                    model: Member,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'photo', 'instructorCode']
                },
                {
                    model: SportGroup,
                    as: 'sportGroup',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        res.json(updatedPackage);
    } catch (error) {
        console.error('Update package error:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.errors[0].message,
                    details: error.errors.map(e => ({ field: e.path, message: e.message }))
                }
            });
        }

        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Paket güncellenemedi',
                details: error.message
            }
        });
    }
});

// DELETE /api/private-lesson-packages/:id - Soft delete (archive)
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), async (req, res) => {
    try {
        const { id } = req.params;

        const package = await PrivateLessonPackage.findByPk(id);
        if (!package) {
            return res.status(404).json({
                error: {
                    code: 'PACKAGE_NOT_FOUND',
                    message: 'Paket bulunamadı'
                }
            });
        }

        // Soft delete: set isArchived flag
        await package.update({ isArchived: true });

        res.json({
            message: 'Paket arşivlendi',
            packageId: id
        });
    } catch (error) {
        console.error('Delete package error:', error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Paket silinemedi',
                details: error.message
            }
        });
    }
});

// GET /api/private-lesson-packages/:id/history - Get session change history
router.get('/:id/history', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.INSTRUCTOR, ROLES.EĞİTMEN]), async (req, res) => {
    try {
        const { id } = req.params;

        const package = await PrivateLessonPackage.findByPk(id);
        if (!package) {
            return res.status(404).json({
                error: {
                    code: 'PACKAGE_NOT_FOUND',
                    message: 'Paket bulunamadı'
                }
            });
        }

        const history = await SessionChangeLog.findAll({
            where: { packageId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            ],
            order: [['timestamp', 'DESC']]
        });

        res.json(history);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Geçmiş getirilemedi',
                details: error.message
            }
        });
    }
});

module.exports = router;
