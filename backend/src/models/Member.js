const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    memberCode: { type: DataTypes.STRING, unique: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: true },
    photo: { type: DataTypes.TEXT }, // Base64 or URL
    gender: { type: DataTypes.STRING },
    birthDate: { type: DataTypes.DATEONLY },
    bloodGroup: { type: DataTypes.STRING },
    fitnessGoals: { type: DataTypes.JSONB, defaultValue: [] },
    targetWeight: { type: DataTypes.DECIMAL(5, 2) },

    // Onboarding Fields
    height: { type: DataTypes.FLOAT },
    weight: { type: DataTypes.FLOAT },
    startingWeight: { type: DataTypes.FLOAT },
    age: { type: DataTypes.INTEGER },
    activityLevel: { type: DataTypes.STRING }, // Sedentary, Moderate, Active, etc.
    fitnessNotes: { type: DataTypes.TEXT },
    healthNotes: { type: DataTypes.TEXT },

    // Virtual fields for backward compatibility (InstructorProfiles legacy)
    displayName: {
        type: DataTypes.VIRTUAL,
        get() { return this.fullName; }
    },
    profilePicture: {
        type: DataTypes.VIRTUAL,
        get() { return this.photo; }
    },
    registrationDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    expiryDate: { type: DataTypes.DATEONLY },
    isTrial: { type: DataTypes.BOOLEAN, defaultValue: false },
    isFreezed: { type: DataTypes.BOOLEAN, defaultValue: false },
    freezeStartDate: { type: DataTypes.DATEONLY },
    packageId: { type: DataTypes.UUID },
    membershipType: {
        type: DataTypes.STRING,
        defaultValue: 'STANDART'
    },

    // Unified Profile Types
    profileType: {
        type: DataTypes.ENUM('MEMBER', 'INSTRUCTOR', 'PERSONNEL', 'USER'),
        defaultValue: 'MEMBER'
    },

    // Instructor Specific Fields
    instructorCode: { type: DataTypes.STRING, unique: true },
    specialties: { type: DataTypes.JSONB, defaultValue: [] },
    bio: { type: DataTypes.TEXT },
    basePrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    commissionRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    level: { type: DataTypes.STRING, defaultValue: 'UZMAN' }, // STAJYER, UZMAN, PRO

    // Personnel Specific Fields
    personnelCode: { type: DataTypes.STRING, unique: true },

    // Private Lesson Details
    lessonType: {
        type: DataTypes.STRING,
        defaultValue: 'GENERAL',
        // DEPRECATED: Use lessonTypes array instead
        // Kept for backward compatibility - returns first element of lessonTypes
        get() {
            const types = this.getDataValue('lessonTypes');
            if (types && Array.isArray(types) && types.length > 0) {
                return types[0];
            }
            return 'GENERAL';
        }
    },
    lessonTypes: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: false,
        validate: {
            isValidArray(value) {
                if (!Array.isArray(value)) {
                    throw new Error('lessonTypes must be an array');
                }
                const validTypes = ['GENERAL', 'PRIVATE', 'GROUP'];
                const invalid = value.filter(t => !validTypes.includes(t));
                if (invalid.length > 0) {
                    throw new Error(`Invalid lesson types: ${invalid.join(', ')}. Valid types are: GENERAL, PRIVATE, GROUP`);
                }
            }
        }
    },
    specialtyId: { type: DataTypes.UUID, allowNull: true },
    privateLessonSpecialtyId: { type: DataTypes.UUID, allowNull: true },
    privateLessonInstructorId: { type: DataTypes.UUID, allowNull: true },
    privateLessonDays: { type: DataTypes.JSONB, allowNull: true }, // Array of days [0, 1, 2...]
    privateLessonHours: { type: DataTypes.INTEGER, defaultValue: 0 },
    privateLessonPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    privateLessonRemainingSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        get() {
            const remaining = this.getDataValue('privateLessonRemainingSessions');
            // If not set, return privateLessonHours as initial value
            return remaining !== null && remaining !== undefined ? remaining : this.getDataValue('privateLessonHours');
        }
    },

    companyId: { type: DataTypes.UUID },
    branchId: { type: DataTypes.UUID },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isInside: { type: DataTypes.BOOLEAN, defaultValue: false },
    emergencyPhone: { type: DataTypes.STRING },
    notificationPreference: {
        type: DataTypes.STRING,
        defaultValue: 'BOTH'
    },
    nextMeasurementDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null
    },
    currentBelt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    beltBranchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    lastBeltDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    sportGroupId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    // Address Fields
    city: { type: DataTypes.STRING, allowNull: true },
    district: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true }
}, {
    hooks: {
        beforeCreate: async (member) => {
            // Auto-generate Instructor Code if missing and profile is instructor
            if (member.profileType === 'INSTRUCTOR' && !member.instructorCode) {
                const year = new Date().getFullYear();
                const count = await sequelize.models.Member.count({ where: { profileType: 'INSTRUCTOR' } }) + 1;
                member.instructorCode = `EGT-${year}-${String(count).padStart(4, '0')}`;
            }
        },
        afterCreate: async (member, options) => {
            // Sync to User if userId exists
            if (member.userId) {
                try {
                    const User = require('./User');
                    const syncData = {
                        isActive: member.isActive,
                        branchId: member.branchId,
                        companyId: member.companyId
                    };

                    // Personnel/Instructor/Member Code sync to User.personnelCode (used as Card ID)
                    if (member.profileType === 'PERSONNEL' && member.personnelCode) {
                        syncData.personnelCode = member.personnelCode;
                    } else if (member.profileType === 'INSTRUCTOR' && member.instructorCode) {
                        syncData.personnelCode = member.instructorCode;
                    } else if (member.profileType === 'MEMBER' && member.memberCode) {
                        syncData.personnelCode = member.memberCode;
                    }

                    await User.update(syncData, {
                        where: { id: member.userId },
                        transaction: options.transaction
                    });
                } catch (err) {
                    console.error('Member->User sync error:', err.message);
                }
            }
        },
        afterUpdate: async (member, options) => {
            // Sync to User if userId exists
            if (member.userId) {
                try {
                    const User = require('./User');
                    const syncData = {
                        isActive: member.isActive,
                        branchId: member.branchId,
                        companyId: member.companyId
                    };

                    // Personnel/Instructor/Member Code sync to User.personnelCode (used as Card ID)
                    /* 
                    // Manual Sync disabled here because MemberController handles it explicitly with transaction
                    if (member.profileType === 'PERSONNEL' && member.personnelCode) {
                        syncData.personnelCode = member.personnelCode;
                    } else if (member.profileType === 'INSTRUCTOR' && member.instructorCode) {
                        syncData.personnelCode = member.instructorCode;
                    } else if (member.profileType === 'MEMBER' && member.memberCode) {
                        syncData.personnelCode = member.memberCode;
                    }
                    */

                    await User.update(syncData, {
                        where: { id: member.userId },
                        transaction: options.transaction
                    });
                } catch (err) {
                    console.error('Member->User sync error:', err.message);
                }
            }
        }
    }
});

module.exports = Member;
