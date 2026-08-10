const { Company, Branch } = require('../../models');
const FinancialAccountService = require('../finance/FinancialAccountService');

class CompanyService {
    /**
     * Şirkete bağlı yeni bir şube oluşturur ve finansal hesaplarını açar
     */
    static async createBranch(companyId, branchData) {
        const company = await Company.findByPk(companyId);
        if (!company) throw new Error('Şirket bulunamadı.');

        const branch = await Branch.create({ ...branchData, companyId });

        // Otomatik Cari Kasa Hesaplarını Oluştur (BehaSoft HARİÇ)
        if (company.name !== 'BehaSoft') {
            await FinancialAccountService.createCompanyCashAccount(company, branch.id);
            await FinancialAccountService.createBranchCashAccount(branch);
        }

        return branch;
    }

    /**
     * Şubeyi siler ve logosunu temizler
     */
    static async deleteBranch(id) {
        const { deleteFile } = require('../../utils/fileHelper');
        const branch = await Branch.findByPk(id);
        if (!branch) throw new Error('Şube bulunamadı.');

        // Logoyu sil
        if (branch.logo) await deleteFile(branch.logo);

        await branch.destroy();
        return true;
    }

    /**
     * Şirketi güvenli bir şekilde siler
     */
    static async deleteCompany(id) {
        const { deleteFile } = require('../../utils/fileHelper');
        const branchCount = await Branch.count({ where: { companyId: id } });
        if (branchCount > 0) throw new Error('Bu şirkete bağlı aktif şubeler var. Önce şubeleri silmelisiniz.');

        const company = await Company.findByPk(id);
        if (!company) throw new Error('Şirket bulunamadı.');

        // Logoyu sil
        if (company.logo) await deleteFile(company.logo);

        await company.destroy();
        return true;
    }
}

module.exports = CompanyService;
