const DashboardService = require('../../services/dashboard/DashboardService');
const { catchAsync } = require('../../middleware/errorHandler');

class DashboardController {
    /**
     * Dashboard istatistiklerini getir
     */
    static getStats = catchAsync(async (req, res) => {
        const stats = await DashboardService.getDashboardStats(req.user);
        res.json(stats);
    });
}

module.exports = DashboardController;
