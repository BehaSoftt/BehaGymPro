const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const { Op } = require('sequelize');
const { User, Member, Role, Permission, Company, Branch } = require('../../models');
const Mailer = require('../../utils/mailer');
const SecurityVault = require('../../utils/SecurityVault');

class AuthService {
    /**
     * Kullanıcı girişi ve 2FA kontrolü
     */
    static async login(identifier, password) {
        const user = await User.findOne({
            where: {
                [Op.or]: [{ username: identifier }, { email: identifier }],
                isActive: true
            },
            include: [
                { model: Role, include: [{ model: Permission, as: 'permissions' }] },
                { model: Company, as: 'Company', attributes: ['name'] },
                { model: Branch, as: 'Branch', attributes: ['name'] },
                { model: Member, as: 'profile', attributes: ['photo', 'fullName'] },
                { model: Member, as: 'instructorProfile', attributes: ['photo', 'fullName'] },
                { model: Member, as: 'personnelProfile', attributes: ['photo', 'fullName'] }
            ]
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error('Geçersiz kullanıcı adı veya şifre.');
        }

        const isSuperMaster = user.role === 'SUPER_MASTER';
        if (isSuperMaster || user.isTwoFactorEnabled) {
            const code = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const expiry = new Date(Date.now() + 10 * 60 * 1000);

            // Kodu şifreleyip veritabanına yaz (Güvenlik Artırıldı)
            const hashedCode = SecurityVault.hash(code);
            await user.update({ twoFactorCode: hashedCode, twoFactorExpiry: expiry });

            console.log(`[2FA] Kod gönderiliyor: ${user.email}`);
            Mailer.sendMail(user.email, 'BehaGym Pro Giriş Onay Kodu', `Giriş kodunuz: ${code}`)
                .then(() => console.log('[2FA] E-posta başarıyla gönderildi!'))
                .catch(e => console.error('[2FA] Mailer Error:', e.message));



            return { status: 'REQUIRE_2FA', userId: user.id };
        }

        const token = this.generateToken(user);
        return { status: 'SUCCESS', token, user: this.formatUserResponse(user) };
    }

    /**
     * 2FA Kod Doğrulama
     */
    static async verify2FA(userId, code) {
        const user = await User.findByPk(userId, {
            include: [
                { model: Role, include: [{ model: Permission, as: 'permissions' }] },
                { model: Company, as: 'Company', attributes: ['name'] },
                { model: Branch, as: 'Branch', attributes: ['name'] },
                { model: Member, as: 'profile', attributes: ['photo', 'fullName'] },
                { model: Member, as: 'instructorProfile', attributes: ['photo', 'fullName'] },
                { model: Member, as: 'personnelProfile', attributes: ['photo', 'fullName'] }
            ]
        });

        // Gelen kodu hashleyip veritabanındakiyle karşılaştır
        const hashedInputCode = SecurityVault.hash(code);
        if (!user || user.twoFactorCode !== hashedInputCode || new Date() > user.twoFactorExpiry) {
            throw new Error('Geçersiz veya süresi dolmuş onay kodu.');
        }

        await user.update({ twoFactorCode: null, twoFactorExpiry: null });
        const token = this.generateToken(user);
        return { token, user: this.formatUserResponse(user) };
    }

    /**
     * Kart veya QR ile giriş
     */
    static async cardLogin(qrData) {
        if (!qrData) throw new AppError('Tanımsız Kart veya QR Kod.', 400);

        // 1. Önce Düz Metin (Kart No / Üye Kodu / İrtibat Kodu) ile Ara
        const profile = await Member.findOne({
            where: {
                [Op.or]: [
                    { memberCode: qrData }, 
                    { instructorCode: qrData }, 
                    { personnelCode: qrData },
                    { phone: qrData }
                ],
                isActive: true
            }
        });

        if (profile) {
            const memberRole = profile.profileType === 'INSTRUCTOR' ? 'EĞİTMEN' : (profile.profileType === 'PERSONNEL' ? 'PERSONEL' : 'MEMBER');
            const token = jwt.sign({
                id: profile.id,
                role: memberRole,
                companyId: profile.companyId,
                branchId: profile.branchId
            }, SecurityVault.get('jwt_secret'), { expiresIn: '30d' });

            return {
                token,
                user: {
                    id: profile.id,
                    fullName: profile.fullName,
                    photo: profile.photo,
                    role: memberRole,
                    companyId: profile.companyId,
                    branchId: profile.branchId
                }
            };
        }

        // 2. Şifreli QR Kod ise Decrypt Et
        let userId = null;
        let type = null;
        try {
            const bytes = CryptoJS.AES.decrypt(qrData, SecurityVault.get('jwt_secret'));
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedString) {
                const decryptedData = JSON.parse(decryptedString);
                userId = decryptedData.userId || decryptedData.memberId;
                type = decryptedData.type || (decryptedData.memberId ? 'MEMBER' : 'PERSONNEL');

                if (decryptedData.timestamp && (Date.now() - decryptedData.timestamp) > (2 * 60 * 1000)) {
                    throw new AppError('QR Kodun süresi dolmuş.', 400);
                }
            }
        } catch (e) {
            // Decrypt hatası
        }

        if (!userId) throw new AppError('Tanımsız Kart veya QR Kod.', 404);

        const user = await User.findByPk(userId);
        if (!user) throw new AppError('Kullanıcı hesabı bulunamadı.', 404);
        const token = this.generateToken(user);
        return { token, user: this.formatUserResponse(user) };
    }

    /**
     * Üye girişi (Hızlı portal girişi)
     */
    static async memberLogin(memberCode, phone) {
        const member = await Member.findOne({ where: { memberCode, phone, isActive: true } });
        if (!member) throw new Error('Geçersiz Üye Kodu veya Telefon Numarası.');

        const token = jwt.sign(
            { id: member.id, role: 'MEMBER', branchId: member.branchId, companyId: member.companyId },
            SecurityVault.get('jwt_secret'),
            { expiresIn: '30d' }
         );

        return {
            token,
            user: {
                id: member.id,
                fullName: member.fullName,
                photo: member.photo,
                role: 'MEMBER'
            }
        };
    }

    // Yardımcı Metodlar
    static generateToken(user) {
        const roleName = user.Role?.name || user.role;
        return jwt.sign(
            { id: user.id, role: roleName, companyId: user.companyId, branchId: user.branchId, username: user.username, email: user.email },
            SecurityVault.get('jwt_secret'),
            { expiresIn: '7d' }
        );
    }

    static formatUserResponse(user) {
        return {
            id: user.id,
            username: user.username,
            role: user.Role?.name || user.role,
            branchId: user.branchId,
            companyId: user.companyId,
            Role: user.Role,
            Company: user.Company,
            Branch: user.Branch,
            photo: user.instructorProfile?.photo || user.personnelProfile?.photo || user.profile?.photo,
            fullName: user.instructorProfile?.fullName || user.personnelProfile?.fullName || user.profile?.fullName || user.username
        };
    }
}

module.exports = AuthService;
