const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrivateLessonPackage = sequelize.define('PrivateLessonPackage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Members', key: 'id' },
        onDelete: 'CASCADE'
    },
    specialtyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'SportSpecialties', key: 'id' }
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Members', key: 'id' }
    },
    sessionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Seans sayısı en az 1 olmalıdır'
            }
        }
    },
    remainingSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Kalan seans sayısı negatif olamaz'
            },
            isValidRemaining(value) {
                if (value > this.sessionCount) {
                    throw new Error('Kalan seans sayısı toplam seans sayısından fazla olamaz');
                }
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Fiyat negatif olamaz'
            }
        }
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isAfterStartDate(value) {
                if (value && this.startDate && new Date(value) < new Date(this.startDate)) {
                    throw new Error('Bitiş tarihi başlangıç tarihinden önce olamaz');
                }
            }
        }
    },
    days: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
            isValidDaysArray(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Günler bir dizi olmalıdır');
                }
                if (value.length === 0) {
                    throw new Error('En az bir gün seçilmelidir');
                }
                const validDays = [0, 1, 2, 3, 4, 5, 6];
                const invalidDays = value.filter(day => !validDays.includes(day));
                if (invalidDays.length > 0) {
                    throw new Error('Günler 0-6 arasında tam sayılar olmalıdır');
                }
            }
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE',
        validate: {
            isIn: {
                args: [['ACTIVE', 'COMPLETED', 'ARCHIVED']],
                msg: 'Geçersiz durum. Geçerli durumlar: ACTIVE, COMPLETED, ARCHIVED'
            }
        }
    },
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    branchId: {
        type: DataTypes.UUID,
        references: { model: 'Branches', key: 'id' }
    },
    companyId: {
        type: DataTypes.UUID,
        references: { model: 'Companies', key: 'id' }
    },
    sportGroupId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'SportGroups', key: 'id' }
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'ExerciseCategories', key: 'id' }
    },
    dayCategories: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    categoryIds: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
});

module.exports = PrivateLessonPackage;
