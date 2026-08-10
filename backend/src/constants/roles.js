/**
 * BEHAGYM PRO: ROL SABİTLERİ
 * Sistem genelindeki tüm rol isimleri buradan yönetilir.
 */

const ROLES = {
    SUPER_MASTER: 'SUPER_MASTER',
    ADMIN: 'ADMIN',
    RECEPTIONIST: 'RECEPTIONIST',
    TERMINAL: 'TERMINAL',
    INSTRUCTOR: 'EĞİTMEN',
    EĞİTMEN: 'EĞİTMEN', // Alias for easier use in routes
    PERSONNEL: 'PERSONNEL',
    MEMBER: 'MEMBER',
    USER: 'USER',
    GUEST: 'GUEST',
    REPORT: 'REPORT',
    MUDUR: 'MUDUR',
    STAFF: 'STAFF',
    BRANCH_MASTER: 'BRANCH_MASTER'
};

module.exports = ROLES;
