require('dotenv').config();
const { Member, MemberPackage, MembershipPackage } = require('./src/models');

async function fixBekir() {
  try {
    const bekir = await Member.findOne({ where: { fullName: 'Bekir Yasak' } });
    if (!bekir) {
      console.log('Bekir bulunamadı.');
      return;
    }
    console.log('Bekir ID:', bekir.id);

    const activePkg = await MemberPackage.findOne({ 
      where: { memberId: bekir.id, status: 'ACTIVE' },
      include: [{ model: MembershipPackage, as: 'package' }]
    });

    if (!activePkg) {
      console.log('Bekir için aktif paket bulunamadı.');
      return;
    }

    const duration = activePkg.package?.durationMonths || 1;
    const startDate = new Date();
    startDate.setHours(0,0,0,0);
    
    // Sizin "kral" mantığı: tam ay üzerine ekleme
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + duration);

    const startStr = startDate.toISOString().split('T')[0];
    const expiryStr = expiryDate.toISOString().split('T')[0];

    await activePkg.update({
      startDate: startStr,
      expiryDate: expiryStr
    });

    console.log(`Güncellendi: Başlangıç: ${startStr}, Bitiş: ${expiryStr}`);
    
    // Üye ana tablosundaki bitiş tarihini de senkronize edelim
    await bekir.update({ expiryDate: expiryStr });
    console.log('Üye bitiş tarihi de "Kral" mantığıyla güncellendi.');

  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    process.exit();
  }
}

fixBekir();
