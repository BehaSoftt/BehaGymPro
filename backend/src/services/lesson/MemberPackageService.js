const { MemberPackage, MembershipPackage, Member, Campaign, FinancialTransaction, sequelize } = require('../../models');
const { Op } = require('sequelize');
const FinancialAccountService = require('../finance/FinancialAccountService');
const WhatsAppService = require('../notifications/WhatsAppService');

class MemberPackageService {
    /**
     * Üyeye yeni paket tanımlar ve finansal süreçleri başlatır
     */
    static async assignPackage(data, user) {
        console.log('🚀 [MemberPackageService] ASSIGN_PACKAGE_START:', JSON.stringify(data));
        const { memberId, packageId, instructorId, startDate, expiryDate, campaignId, customPrice } = data;
        const { branchId, companyId } = user;

        if (!memberId || !packageId) {
            throw new Error('Üye ve paket seçimi zorunludur.');
        }

        try {
            console.log('🔍 [MemberPackageService] Checking for duplicates...');
            const todayStr = new Date().toISOString().split('T')[0];
            const duplicate = await MemberPackage.findOne({
                where: { 
                    memberId, 
                    packageId, 
                    status: 'ACTIVE', 
                    expiryDate: { [Op.gte]: todayStr } 
                }
            });
            console.log('✅ [MemberPackageService] Duplicate check completed');
            
            if (duplicate) throw new Error('Bu üye zaten bu pakete aktif olarak tanımlı.');

            console.log('🔍 [MemberPackageService] Fetching package details...');
            const pkg = await MembershipPackage.findByPk(packageId);
            if (!pkg) throw new Error('Paket bulunamadı.');
            console.log('✅ [MemberPackageService] Package found:', pkg.name);

            return await sequelize.transaction(async (t) => {
                console.log('🔄 [MemberPackageService] Transaction started');
                let finalPrice = parseFloat(pkg.price);
                let finalExpiry = expiryDate;
                let campaignUsed = null;

                // Kampanya Mantığı
                if (campaignId && campaignId !== '' && campaignId !== 'null') {
                    console.log('🔍 [MemberPackageService] Fetching campaign...');
                    campaignUsed = await Campaign.findByPk(campaignId, { transaction: t });
                    if (campaignUsed?.isActive) {
                        if (campaignUsed.discountType === 'PERCENTAGE') finalPrice *= (1 - (campaignUsed.discountValue / 100));
                        else if (campaignUsed.discountType === 'AMOUNT') finalPrice = Math.max(0, finalPrice - campaignUsed.discountValue);
                    }
                    console.log('✅ [MemberPackageService] Campaign applied');
                }

                // Fiyat ve Tarih Normalizasyonu
                if (customPrice !== undefined && customPrice !== null && customPrice !== '') {
                    finalPrice = parseFloat(customPrice);
                }
                if (isNaN(finalPrice)) finalPrice = parseFloat(pkg.price);
                
                if (!finalExpiry && pkg.durationMonths > 0) {
                    const sDate = startDate && startDate !== '' ? new Date(startDate) : new Date();
                    const expDate = new Date(sDate);
                    expDate.setMonth(expDate.getMonth() + pkg.durationMonths);
                    finalExpiry = expDate.toISOString().split('T')[0];
                }
                console.log('💰 [MemberPackageService] FINAL_PRICE:', finalPrice, 'FINAL_EXPIRY:', finalExpiry);

                console.log('📝 [MemberPackageService] Creating MemberPackage record...');
                const memberPkg = await MemberPackage.create({
                    memberId, 
                    packageId, 
                    instructorId: (instructorId && instructorId !== '' && instructorId !== 'null') ? instructorId : null, 
                    branchId, 
                    companyId,
                    startDate: (startDate && startDate !== '') ? startDate : todayStr, 
                    expiryDate: finalExpiry,
                    totalSessions: pkg.type === 'SESSION' ? pkg.sessionCount : 0,
                    remainingSessions: pkg.type === 'SESSION' ? pkg.sessionCount : 0,
                    status: 'ACTIVE',
                    paymentStatus: 'UNPAID'
                }, { transaction: t });

                console.log('✅ [MemberPackageService] MEMBER_PACKAGE_CREATED:', memberPkg.id);

                // Üye Koordinasyonu (Bitiş tarihi ve ders tipleri)
                console.log('🔍 [MemberPackageService] Fetching member for profile update...');
                const member = await Member.findByPk(memberId, { transaction: t });
                if (member) {
                    console.log('👤 [MemberPackageService] Updating member profile:', member.fullName);
                    const updates = {};
                    if (!member.expiryDate || new Date(finalExpiry) > new Date(member.expiryDate)) {
                        updates.expiryDate = finalExpiry;
                    }
                    
                    let lessonTypes = member.lessonTypes || [];
                    let type = pkg.name?.toUpperCase().includes('ÖZEL') ? 'PRIVATE' : (pkg.name?.toUpperCase().includes('GRUP') ? 'GROUP' : 'GENERAL');
                    if (!lessonTypes.includes(type)) {
                        lessonTypes.push(type);
                        updates.lessonTypes = lessonTypes;
                    }
                    await member.update(updates, { transaction: t });
                    console.log('✅ [MemberPackageService] MEMBER_PROFILE_UPDATED');

                    // Finansal İşlem
                    if (finalPrice > 0) {
                        console.log('💵 [MemberPackageService] Creating financial transaction...');
                        const account = await FinancialAccountService.createMemberAccount(member, t);
                        if (account) {
                            console.log('🏦 [MemberPackageService] Account found/created:', account.id);
                            await FinancialTransaction.create({
                                financialAccountId: account.id, 
                                transactionType: 'DEBIT', 
                                amount: finalPrice,
                                description: `${pkg.name} Paketi Ataması`, 
                                category: 'MEMBERSHIP',
                                paymentMethod: 'OTHER', 
                                branchId, 
                                companyId, 
                                createdBy: user.id
                            }, { transaction: t });

                            await account.update({
                                balance: sequelize.literal(`"balance" - ${finalPrice}`),
                                totalDebit: sequelize.literal(`"totalDebit" + ${finalPrice}`)
                            }, { transaction: t });
                            
                            await memberPkg.update({ paymentStatus: 'PAID' }, { transaction: t });
                            console.log('✅ [MemberPackageService] FINANCIAL_TRANSACTION_COMPLETED');
                        }
                    }

                    // WhatsApp Bildirimi
                    if (member.phone && (member.notificationPreference === 'WHATSAPP' || member.notificationPreference === 'BOTH')) {
                        console.log('📱 [MemberPackageService] Sending notification...');
                        this.sendPackageNotification(member, pkg, finalPrice, finalExpiry).catch(e => console.error('📱 [WhatsApp Error]:', e));
                    }
                }

                console.log('🚀 [MemberPackageService] Assignment successful!');
                return memberPkg;
            });
        } catch (error) {
            console.error('💥 [MemberPackageService] ERROR:', error.message);
            console.error('📌 [MemberPackageService] STACK:', error.stack);
            throw error;
        }
    }

    static async sendPackageNotification(member, pkg, price, expiry) {
        const msg = `🎉 Merhaba ${member.fullName}!\n\n✅ *${pkg.name}* paketine kaydoldunuz.\n📅 Bitiş: ${new Date(expiry).toLocaleDateString('tr-TR')}\n💰 Ücret: ₺${price}\n\nSağlıklı günler! 💪`;
        await WhatsAppService.sendAutoMessage(member.phone, msg);
    }
}

module.exports = MemberPackageService;
