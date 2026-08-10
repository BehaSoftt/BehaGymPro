const GroupClassService = require('../../services/lesson/GroupClassService');
const LessonService = require('../../services/lesson/LessonService');
const { GroupClass, GroupClassMember } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class GroupClassController {
    /**
     * Yeni grup dersi oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const groupData = {
            ...req.body,
            branchId: req.body.branchId || branchId,
            companyId: req.body.companyId || companyId,
            endDate: req.body.endDate || null
        };

        const existing = await GroupClass.findOne({ 
            where: { name: groupData.name, branchId: groupData.branchId, companyId: groupData.companyId } 
        });
        if (existing) throw new AppError('Bu isimde bir grup dersi zaten mevcut.', 400);

        // Eğitmen Çakışma Kontrolü (Grup dersi günlerini tek tek kontrol et)
        if (groupData.instructorId && groupData.days?.length > 0) {
            for (const day of groupData.days) {
                await LessonService.checkOverlaps({
                    instructorId: groupData.instructorId,
                    dayOfWeek: day,
                    startTime: groupData.startTime,
                    endTime: groupData.endTime,
                    companyId: groupData.companyId
                });
            }
        }

        const group = await GroupClass.create(groupData);
        res.status(201).json(group);
    });

    /**
     * Tüm grup derslerini listele
     */
    static getAll = catchAsync(async (req, res) => {
        const groups = await GroupClassService.getAllGroups(req.user, req.query);
        res.json(groups);
    });

    /**
     * Gruba üye ekle
     */
    static enrollMember = catchAsync(async (req, res) => {
        const { groupClassId, memberIds, memberId } = req.body;
        const targetIds = Array.isArray(memberIds) ? memberIds : [memberId];
        
        await GroupClassService.enrollMembers(groupClassId, targetIds);
        res.status(201).json({ message: 'Üyeler gruba başarıyla eklendi.' });
    });

    /**
     * Üyeyi gruptan çıkar
     */
    static unenrollMember = catchAsync(async (req, res) => {
        const { groupClassId, memberId } = req.body;
        await GroupClassMember.destroy({ where: { groupClassId, memberId } });
        res.json({ message: 'Üye gruptan başarıyla çıkarıldı.' });
    });

    /**
     * Grup bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const group = await GroupClass.findByPk(req.params.id);
        if (!group) throw new AppError('Grup bulunamadı.', 404);

        const updateData = { ...req.body, endDate: req.body.endDate || null };
        const { instructorId, days, startTime, endTime } = { ...group.toJSON(), ...updateData };

        if (instructorId && days?.length > 0) {
            for (const day of days) {
                await LessonService.checkOverlaps({
                    instructorId,
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    companyId: group.companyId,
                    excludeGroupClassId: req.params.id
                });
            }
        }

        await group.update(updateData);
        res.json(group);
    });

    /**
     * Grubu sil
     */
    static delete = catchAsync(async (req, res) => {
        const group = await GroupClass.findByPk(req.params.id);
        if (!group) throw new AppError('Grup bulunamadı.', 404);

        await group.destroy();
        res.json({ message: 'Grup başarıyla silindi.' });
    });

    /**
     * Gruba toplu mesaj gönder
     */
    static sendMassMessage = catchAsync(async (req, res) => {
        const count = await GroupClassService.sendMassMessage(req.params.id, req.body.message);
        res.json({ message: `Toplam ${count} üyeye mesaj gönderildi.` });
    });
}

module.exports = GroupClassController;
