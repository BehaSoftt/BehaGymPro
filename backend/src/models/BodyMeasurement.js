const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BodyMeasurement = sequelize.define('BodyMeasurement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: false },
    weight: { type: DataTypes.DECIMAL(5, 2) }, // Kilo
    height: { type: DataTypes.DECIMAL(5, 2) }, // Boy
    fatPercentage: { type: DataTypes.DECIMAL(4, 2) }, // Yağ %
    muscleMass: { type: DataTypes.DECIMAL(5, 2) }, // Kas kütlesi
    chest: { type: DataTypes.DECIMAL(5, 2) }, // Göğüs
    waist: { type: DataTypes.DECIMAL(5, 2) }, // Bel
    neck: { type: DataTypes.DECIMAL(5, 2) }, // Boyun
    shoulder: { type: DataTypes.DECIMAL(5, 2) }, // Omuz
    hips: { type: DataTypes.DECIMAL(5, 2) }, // Kalça
    wrist: { type: DataTypes.DECIMAL(5, 2) }, // Bilek
    rightBicep: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Üst Kol (Pazu)
    leftBicep: { type: DataTypes.DECIMAL(5, 2) }, // Sol Üst Kol (Pazu)
    rightForearm: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Ön Kol
    leftForearm: { type: DataTypes.DECIMAL(5, 2) }, // Sol Ön Kol
    rightTricep: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Arka Kol
    leftTricep: { type: DataTypes.DECIMAL(5, 2) }, // Sol Arka Kol
    rightThigh: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Ön Bacak
    leftThigh: { type: DataTypes.DECIMAL(5, 2) }, // Sol Ön Bacak
    rightHamstring: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Arka Bacak
    leftHamstring: { type: DataTypes.DECIMAL(5, 2) }, // Sol Arka Bacak
    rightCalf: { type: DataTypes.DECIMAL(5, 2) }, // Sağ Baldır
    leftCalf: { type: DataTypes.DECIMAL(5, 2) }, // Sol Baldır
    arm: { type: DataTypes.DECIMAL(5, 2) }, // Genel Kol (Eski alan, uyumluluk için bırakıldı)
    leg: { type: DataTypes.DECIMAL(5, 2) }, // Genel Bacak (Eski alan, uyumluluk için bırakıldı)
    bmi: { type: DataTypes.DECIMAL(5, 2) }, // BKİ
    bmr: { type: DataTypes.DECIMAL(7, 2) }, // Bazal Metabolizma
    bmiCategory: { type: DataTypes.STRING }, // BKİ Kategorisi
    targetWeight: { type: DataTypes.DECIMAL(5, 2) }, // Hedeflenen Kilo
    measurementDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    period: { type: DataTypes.STRING }, // Ölçüm Periyodu (Haftalık vb.)
    notes: { type: DataTypes.TEXT }
});

module.exports = BodyMeasurement;
