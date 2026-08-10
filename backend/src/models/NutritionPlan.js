const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NutritionPlan = sequelize.define('NutritionPlan', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  memberId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    unique: true, // Enforce one-to-one relationship
    references: {
      model: 'Members',
      key: 'id'
    },
    onDelete: 'CASCADE' // Cascade delete when member is deleted
  },
  mealCount: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  foodCategories: { 
    type: DataTypes.JSONB, 
    allowNull: true,
    defaultValue: null
  },
  avoidFoods: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  sleepDuration: { 
    type: DataTypes.DECIMAL(4, 2), 
    allowNull: true,
    validate: {
      min: 0,
      max: 24
    }
  },
  fluidIntake: { 
    type: DataTypes.DECIMAL(4, 2), 
    allowNull: true,
    validate: {
      min: 0,
      max: 10
    }
  },
  additionalNotes: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
}, {
  timestamps: true,
  tableName: 'NutritionPlans'
});

module.exports = NutritionPlan;
