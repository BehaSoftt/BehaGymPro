const { User } = require('./src/models');
const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        const user = await User.findOne({ where: { username: 'T1' } });
        if (user) {
            const hash = await bcrypt.hash('123', 10);
            await user.update({ passwordHash: hash });
            console.log('T1 kullanıcısının şifresi başarıyla "123" olarak güncellendi.');
        } else {
            console.log('T1 kullanıcısı bulunamadı.');
        }
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
fix();
