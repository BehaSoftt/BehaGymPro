const CampaignService = require('../../services/admin/CampaignService');
const { Campaign } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class CampaignController {
    /**
     * Tüm kampanyaları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const campaigns = await CampaignService.getCampaigns(req.query);
        res.json(campaigns);
    });

    /**
     * Yeni kampanya oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { name, startDate, endDate, companyId } = req.body;
        if (!name || !startDate || !endDate || !companyId) throw new AppError('Eksik alanlar var.', 400);

        const campaign = await Campaign.create({ ...req.body, isActive: true });
        res.status(201).json(campaign);
    });

    /**
     * Kampanya güncelle
     */
    static update = catchAsync(async (req, res) => {
        const campaign = await Campaign.findByPk(req.params.id);
        if (!campaign) throw new AppError('Kampanya bulunamadı.', 404);

        await campaign.update(req.body);
        res.json(campaign);
    });

    /**
     * Kampanya sil
     */
    static delete = catchAsync(async (req, res) => {
        const campaign = await Campaign.findByPk(req.params.id);
        if (!campaign) throw new AppError('Kampanya bulunamadı.', 404);

        await campaign.destroy();
        res.json({ message: 'Kampanya silindi.' });
    });

    /**
     * Şu an aktif olan kampanyaları getir
     */
    static getActiveCampaigns = catchAsync(async (req, res) => {
        const campaigns = await CampaignService.getCampaigns({ ...req.query, activeOnly: true });
        res.json(campaigns);
    });
}

module.exports = CampaignController;
