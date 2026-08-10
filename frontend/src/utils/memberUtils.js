export const memberUtils = {
    getSpecialtyStyle(name) {
        if (!name) return 'bg-slate-800 text-slate-400 border-slate-700';
        const uname = name.toUpperCase();
        if (uname.includes('FUTBOL')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        if (uname.includes('TENİS')) return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
        if (uname.includes('BOKS') || uname.includes('KİCK')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        if (uname.includes('PİLATES') || uname.includes('YOGA')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
        if (uname.includes('YÜZME')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    },

    getBeltStyle(beltName) {
        const name = beltName || '';
        const colors = {
            'Beyaz': '#ffffff', 'Sarı': '#facc15', 'Yeşil': '#22c55e', 'Mavi': '#2563eb',
            'Kırmızı': '#dc2626', 'Turuncu': '#fb923c', 'Mor': '#9333ea',
            'Kahverengi': '#92400e', 'Siyah': '#000000'
        }
        if (name.includes('-')) {
            const parts = name.split('-').map(p => p.trim());
            const c1 = colors[Object.keys(colors).find(k => parts[0].includes(k))] || '#334155';
            const c2 = colors[Object.keys(colors).find(k => parts[1].includes(k))] || '#334155';
            return { background: `linear-gradient(to bottom, ${c1} 50%, ${c2} 50%)` };
        }
        const match = Object.keys(colors).find(k => name.includes(k));
        const color = colors[match] || '#334155';
        return { backgroundColor: color, border: name.includes('Beyaz') ? '1px solid #475569' : 'none' };
    },

    getMemberPosition(member) {
        if (!member || !member.specialtyId || !member.sportProfiles) return null;
        const profile = member.sportProfiles.find(p => p.specialtyId === member.specialtyId);
        return profile?.extraData?.position || null;
    },

    getMemberTeam(member) {
        if (!member || !member.sportGroup) return null;
        return member.sportGroup.name;
    }
};
