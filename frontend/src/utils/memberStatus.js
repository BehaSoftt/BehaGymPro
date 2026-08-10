export const memberStatus = {
    getMergedLessonTypes(member, availableSpecialties = []) {
        let types = [];
        const now = new Date().setHours(0, 0, 0, 0);

        if (member.profileType === 'MEMBER') {
            const baseTypes = Array.isArray(member.lessonTypes) ? member.lessonTypes : (member.lessonType ? [member.lessonType] : []);
            
            if (baseTypes.includes('GROUP')) {
                const label = member.specialty?.name || 'GRUP';
                types.push({ id: 'BASE_GROUP', label: label.toUpperCase(), type: 'GROUP', isExpired: false });
            }

            if (baseTypes.includes('PRIVATE')) {
                const label = member.specialty?.name ? `${member.specialty.name} (ÖZEL)` : 'ÖZEL DERS';
                types.push({ id: 'BASE_PRIVATE', label: label.toUpperCase(), type: 'PRIVATE', isExpired: false });
            }

            if (baseTypes.includes('GENERAL')) {
                types.push({ id: 'BASE_GENERAL', label: 'GENEL ÜYELİK', type: 'GENERAL', isExpired: false });
            }
        }

        if (member.activePackages?.length > 0) {
            member.activePackages.forEach(ap => {
                if (ap.status === 'ACTIVE' || !ap.status) {
                    const pkgName = ap.package?.name?.toUpperCase() || '';
                    const isExpired = ap.expiryDate && new Date(ap.expiryDate).setHours(0, 0, 0, 0) < now;

                    if (pkgName.includes('GRUP')) {
                        const branchMatch = pkgName.match(/(TEKVANDO|BOKS|KİCK BOKS|PİLATES|YOGA|ZUMBA|FUTBOL)/);
                        const label = branchMatch ? branchMatch[0] : (ap.package?.name || 'GRUP');
                        if (!types.find(t => t.label === label)) {
                            types.push({ id: `GROUP_${label}`, label: label.toUpperCase(), type: 'GROUP', isExpired });
                        }
                    } else {
                        const trimmedPkg = pkgName.trim();
                        if (trimmedPkg !== 'FITNESS' && trimmedPkg !== 'FITNES') {
                            types.push({ id: `PKG_${ap.id}`, label: pkgName, type: 'GENERAL', isExpired });
                        }
                    }
                }
            });
        }

        const activePrivatePkgs = (member.privateLessonPackages || []).filter(p => p.status === 'ACTIVE' || !p.status);
        if (activePrivatePkgs.length > 0) {
            activePrivatePkgs.forEach(p => {
                const label = p.specialty?.name || 'ÖZEL';
                const isExpired = (p.expiryDate && new Date(p.expiryDate).setHours(0, 0, 0, 0) < now) || (p.remainingSessions <= 0);
                if (!types.find(t => t.label === label)) {
                    types.push({ id: `PRIVATE_${label}`, label: label, type: 'PRIVATE', isExpired });
                }
            });
        }

        if (member.profileType === 'INSTRUCTOR') {
            const specs = Array.isArray(member.specialties) ? member.specialties : [];
            specs.forEach(specId => {
                const spec = availableSpecialties.find(s => s.id === specId);
                if (spec && !types.find(t => t.label === spec.name)) {
                    types.push({ id: `SPEC_${spec.id}`, label: spec.name, type: 'INSTRUCTOR_SPEC', isExpired: false });
                }
            });
        }

        if (types.length === 0 && member.profileType === 'MEMBER' && member.specialty?.name) {
            if (member.specialty.name.toUpperCase() !== 'FITNESS') {
                types.push({ id: 'FALLBACK', label: member.specialty.name.toUpperCase(), type: 'GENERAL', isExpired: false });
            }
        }

        return types;
    },

    getExpiryDate(member) {
        if (member.expiryDate) return member.expiryDate;
        const activePkgs = (member.activePackages || []).filter(p => !p.status || p.status === 'ACTIVE');
        const privatePkgs = (member.privateLessonPackages || []).filter(p => !p.status || p.status === 'ACTIVE');
        const allExp = [...activePkgs, ...privatePkgs].map(p => p.expiryDate).filter(d => d);
        if (allExp.length > 0) {
            allExp.sort();
            return allExp[allExp.length - 1];
        }
        return null;
    },

    isExpired(member) {
        if (!member.isActive) return false;
        const date = memberStatus.getExpiryDate(member);
        return date && new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    },

    getExpiryLabel(member) {
        const date = memberStatus.getExpiryDate(member);
        if (date) {
            const now = new Date().setHours(0, 0, 0, 0);
            const exp = new Date(date).setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
            let label = new Date(date).toLocaleDateString('tr-TR');
            if (diffDays > 0) label += ` (${diffDays} GÜN)`;
            else if (diffDays === 0) label += ` (SON GÜN!)`;
            else label += ` (BİTTİ)`;
            return label;
        }
        return '';
    }
};
