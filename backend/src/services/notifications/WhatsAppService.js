const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

/**
 * BEHAGYM PRO - WhatsApp Bildirim Servisi (Otomatik - whatsapp-web.js)
 */
class WhatsAppService {
    static client = null;
    static isReady = false;

    // Emojilerin sayısal kodları
    static icons = {
        building: String.fromCodePoint(0x1F3E2),     // 🏢
        welcome: String.fromCodePoint(0x1F31F),      // 🌟
        training: String.fromCodePoint(0x1F3CB) + String.fromCodePoint(0xFE0F), // 🏋️‍♂️
        sun: String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F),       // ☀️
        muscle: String.fromCodePoint(0x1F4AA),       // 💪
        fire: String.fromCodePoint(0x1F525),         // 🔥
        pin: String.fromCodePoint(0x1F4CC),          // 📌
        clock: String.fromCodePoint(0x23F0),         // ⏰
        instructor: String.fromCodePoint(0x1F468) + '\u200D' + String.fromCodePoint(0x1F3EB), // 👨‍🏫
        shoe: String.fromCodePoint(0x1F45F),         // 👟
        bolt: String.fromCodePoint(0x26A1),           // ⚡
        check: String.fromCodePoint(0x2705),          // ✅
        warning: String.fromCodePoint(0x26A0) + String.fromCodePoint(0xFE0F),   // ⚠️
        house: String.fromCodePoint(0x1F3E0),         // 🏠
        phone: String.fromCodePoint(0x1F4F1),         // 📱
        birthday: String.fromCodePoint(0x1F382)      // 🎂
    };

    static getChromePath() {
        const fs = require('fs');
        if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
            return process.env.CHROME_PATH;
        }
        const candidates = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/snap/bin/chromium',
            '/usr/bin/chrome'
        ];
        for (const p of candidates) {
            if (fs.existsSync(p)) return p;
        }
        return undefined;
    }

    static initError = null;

    /**
     * WhatsApp İstemcisini Başlatır
     */
    static initialize(retryCount = 0) {
        if (retryCount > 10) {
            console.error('[WhatsApp] Maksimum bağlantı deneme sınırına ulaşıldı.');
            return;
        }
        console.log(`[WhatsApp] Bağlantı başlatılıyor... (Deneme ${retryCount + 1})`);
        this.initError = null;

        const isPkg = typeof process.pkg !== 'undefined';
        const sessionsPath = isPkg
            ? path.join(path.dirname(process.execPath), 'sessions')
            : './sessions';

        // Chrome lock dosyalarını temizle (nodemon/restart sonrası oluşan stale lock'ları önler)
        const fs = require('fs');
        const lockFiles = [
            path.join(sessionsPath, 'session', 'SingletonLock'),
            path.join(sessionsPath, 'session', 'SingletonCookie'),
            path.join(sessionsPath, 'session', 'SingletonSocket'),
            path.join(sessionsPath, 'session', 'DevToolsActivePort'),
        ];
        lockFiles.forEach(f => { try { if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('[WhatsApp] Lock temizlendi:', path.basename(f)); } } catch (_) {} });

        const chromePath = this.getChromePath();
        if (chromePath) {
            console.log('[WhatsApp] Sistem Chrome/Chromium tespit edildi:', chromePath);
        } else {
            console.log('[WhatsApp] Sistem Chrome bulunamadı, Varsayılan Puppeteer başlatılıyor...');
        }

        const puppeteerOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-extensions'
            ]
        };
        if (chromePath) {
            puppeteerOptions.executablePath = chromePath;
        }

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: sessionsPath // Oturumu bilgisayarda saklar
                }),
                puppeteer: puppeteerOptions
            });

            this.client.on('qr', async (qr) => {
                console.log('\n[WhatsApp] LÜTFEN BU QR KODU OKUTUN:');
                qrcode.generate(qr, { small: true });
                this.latestQr = qr;
                this.initError = null;
                try {
                    const QRCode = require('qrcode');
                    this.latestQrImage = await QRCode.toDataURL(qr);
                } catch (e) {
                    console.error('[WhatsApp] QR DataURL dönüştürme uyarısı:', e);
                }
            });

            this.client.on('ready', () => {
                console.log('\n[WhatsApp] BAĞLANTI BAŞARILI! Cihaz hazır.');
                this.isReady = true;
                this.latestQr = null;
                this.latestQrImage = null;
                this.initError = null;
            });

            this.client.on('authenticated', () => {
                console.log('[WhatsApp] Oturum doğrulandı.');
            });

            this.client.on('auth_failure', () => {
                console.error('[WhatsApp] Oturum hatası! Lütfen QR kodu tekrar okutun.');
                this.isReady = false;
                this.initError = 'Oturum doğrulama hatası (auth_failure)';
            });

            this.client.on('disconnected', (reason) => {
                console.warn('[WhatsApp] Bağlantı koptu:', reason);
                this.isReady = false;
            });

            this.client.initialize().catch(async (err) => {
                console.error(`[WhatsApp INIT ERROR] (Deneme ${retryCount + 1}):`, err?.message || err);
                this.initError = err?.message || String(err);
                this.isReady = false;

                if (retryCount < 5) {
                    console.log('[WhatsApp] 10 saniye içinde otomatik tekrar bağlanılıyor...');
                    setTimeout(() => {
                        try {
                            if (this.client) {
                                this.client.destroy().catch(() => {});
                            }
                        } catch (_) {}
                        this.initialize(retryCount + 1);
                    }, 10000);
                }
            });
        } catch (err) {
            console.error('[WhatsApp INITIALIZE CRASH]:', err);
            this.initError = err?.message || String(err);
        }
    }

    /**
     * Şube ayarlarına göre mesaj kimliğini çözümler (Şirket/Şube ismi override desteği)
     */
    static resolveIdentity(branch, company) {
        let companyName = branch?.HeaderCompany?.name || company?.name || branch?.Company?.name;
        let branchName = branch?.HeaderBranch?.name || branch?.name;
        const phone = branch?.phone;

        if (companyName && (companyName.toUpperCase().includes('BEHASOFT') || companyName.toUpperCase().includes('HEADQUARTERS'))) {
            companyName = null;
        }
        if (branchName && (branchName.toUpperCase().includes('BEHASOFT') || branchName.toUpperCase().includes('HEADQUARTERS'))) {
            branchName = null;
        }

        return { 
            companyName: companyName || 'Ayaz Spor Salonu', 
            branchName, 
            phone 
        };
    }

    /**
     * Mesajın en üstüne Şirket ve Şube bilgisini ekler.
     */
    static getHeader(companyName, branchName, phone) {
        let companyStr = '';
        const isBehasoftCompany = companyName && (companyName.toUpperCase().includes('BEHASOFT') || companyName.toUpperCase().includes('HEADQUARTERS'));

        if (companyName && !isBehasoftCompany) {
            companyStr = `*${companyName.toUpperCase()}*`;
        }

        let branchStr = branchName || '';
        if (branchStr.toUpperCase().includes('BEHASOFT') || branchStr.toUpperCase().includes('HEADQUARTERS')) {
            branchStr = '';
        }

        let header = this.icons.building + ' ';

        if (companyStr && branchStr) {
            header += `${companyStr} - ${branchStr}`;
        } else if (companyStr) {
            header += companyStr;
        } else if (branchStr) {
            header += `*${branchStr.toUpperCase()}*`;
        } else {
            header += '*AYAZ SPOR SALONU*';
        }

        if (phone) {
            header += `\n${this.icons.phone} İletişim: ${phone}`;
        }
        return `${header}\n--------------------\n\n`;
    }

    /**
     * Mesaj Şablonları
     */
    static getCustomGroupMessage(message, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}${message}`;
    }

    static getWelcomeMessage(member, pkgObjOrName, packagePrice, companyName, branchName, phone) {
        const sanitizeName = (name) => {
            if (!name) return null;
            if (name.toUpperCase().includes('BEHASOFT') || name.toUpperCase().includes('HEADQUARTERS')) return null;
            return name;
        };

        const cleanCompany = sanitizeName(companyName);
        const cleanBranch = sanitizeName(branchName);
        const brand = cleanCompany || cleanBranch || 'Ayaz Spor Salonu';

        const formatDate = (dateVal) => {
            if (!dateVal) return null;
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return null;
            return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const regDateStr = formatDate(member.registrationDate || member.createdAt) || formatDate(new Date());

        let pkgName = null;
        let price = packagePrice;

        if (typeof pkgObjOrName === 'object' && pkgObjOrName !== null) {
            pkgName = pkgObjOrName.name;
            price = pkgObjOrName.price || packagePrice;
        } else if (typeof pkgObjOrName === 'string') {
            pkgName = pkgObjOrName;
        }

        const isPackageSelected = pkgName && pkgName !== 'Standart' && pkgName !== 'PAKET SEÇİLMEDİ (STANDART)' && !pkgName.includes('Standart Üyelik');

        let packageDetailsStr = '';

        if (isPackageSelected) {
            const priceText = price ? `\n🔹 *Paket Ücreti:* ₺${parseFloat(price).toFixed(2)}` : '';
            const startDateStr = formatDate(member.startDate || member.registrationDate) || regDateStr;
            const expiryDateStr = formatDate(member.expiryDate) || 'Belirtilmedi';

            packageDetailsStr = 
                `🔹 *Kayıt Tarihi:* ${regDateStr}\n` +
                `🔹 *Seçilen Paket:* ${pkgName}${priceText}\n` +
                `🔹 *Üyelik Başlangıç Tarihi:* ${startDateStr}\n` +
                `🔹 *Üyelik Bitiş Tarihi:* ${expiryDateStr}`;
        } else {
            packageDetailsStr = 
                `🔹 *Kayıt Tarihi:* ${regDateStr}\n` +
                `🔹 *Üyelik Durumu:* Kayıt Yapıldı (Paket Tanımlaması Bekleniyor)`;
        }

        const header = this.getHeader(cleanCompany || companyName, cleanBranch || branchName, phone);

        return `${header}Merhaba *${member.fullName}*! ${this.icons.welcome}\n\n` +
            `*${brand}* ailesine hoş geldin. Sisteme kaydın başarıyla tamamlandı.\n\n` +
            `${packageDetailsStr}\n` +
            `🔹 *Üye Kodu:* ${member.memberCode}\n\n` +
            `Spor yolculuğunda her zaman yanındayız. Haydi Spora..💪`;
    }

    static getTrainingPlanMessage(member, planTitle, description, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Selam *${member.fullName}*! ${this.icons.welcome} \n\n` +
            `Senin için yeni bir *Antrenman Planı* hazırlandı! ${this.icons.training}\n\n` +
            `📂 *Plan Adı:* ${planTitle}\n` +
            `📝 *Detay:* ${description || 'Egzersizlerini uygulamada görüntüleyebilirsin.'}\n\n` +
            `Hadi, sınırları zorlama vakti! Başarılar dileriz. ${this.icons.fire}`;
    }

    static getDailyTrainingReminder(member, exercises, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Günaydın *${member.fullName}*! ${this.icons.sun}${this.icons.muscle}\n\n` +
            `Bugün spor günün! Kendini iyi hissetmen için hedefe bir adım daha yaklaşmak senin elinde. İyi dinlen, zinde gel! ${this.icons.fire}\n\n` +
            `📋 *Seni Bekleyen Program:* \n${exercises}\n\n` +
            `Akşam salonda görüşmek üzere, bahanelere yer yok! ${this.icons.muscle}${this.icons.shoe}${this.icons.bolt}`;
    }

    static getGroupClassReminder(member, className, startTime, instructorName, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Günaydın *${member.fullName}*! ${this.icons.sun} \n\n` +
            `Bugün harika bir grup dersimiz var! Sosyalleşirken formda kalmak için hazır mısın? ${this.icons.fire}\n\n` +
            `📌 *Ders:* ${className}\n` +
            `⏰ *Saat:* ${startTime}\n` +
            `👨‍🏫 *Eğitmen:* ${instructorName || 'Branş Eğitmeni'}\n\n` +
            `Ders saatinde salonda olmayı unutma, zinde gel! ${this.icons.muscle}${this.icons.shoe}${this.icons.bolt}`;
    }

    static getPrivateLessonReminder(member, specialtyName, startTime, instructorName, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Günaydın *${member.fullName}*! ${this.icons.sun} \n\n` +
            `Bugün senin günün! Hocanla özel antrenmanın için her şey hazır mı? Hedefe odaklanma vakti! ${this.icons.fire}\n\n` +
            `🎯 *Özel Ders:* ${specialtyName}\n` +
            `⏰ *Saat:* ${startTime || 'Randevu Saatinizde'}\n` +
            `👨‍🏫 *Eğitmen:* ${instructorName || 'Özel Eğitmeniniz'}\n\n` +
            `Hocan seni bekliyor, iyi dinlenmiş ve enerjik gelmeyi unutma! ${this.icons.muscle}${this.icons.shoe}${this.icons.bolt}`;
    }

    static getAttendancePresentMessage(member, className, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Harikasın *${member.fullName}*! ${this.icons.muscle}${this.icons.welcome}\n\n` +
            `Bugünkü *${className}* dersine katılarak hedefine bir adım daha yaklaştın. Harika bir antrenmandı! ${this.icons.fire}\n\n` +
            `Enerjini hiç kaybetme, bir sonraki derste görüşmek üzere! ${this.icons.muscle}${this.icons.shoe}`;
    }

    static getAttendanceAbsentMessage(member, className, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Bugün seni özledik *${member.fullName}*! ${this.icons.shoe}\n\n` +
            `Maalesef bugünkü *${className}* dersinde seni göremedik. Bir sorun yoktur umarız? \n\n` +
            `Pes etmek yok! Bir sonraki derste seni bekliyoruz. Unutma, en zor antrenman salona gelmektir! ${this.icons.muscle}${this.icons.fire}`;
    }

    static getAttendanceExcusedMessage(member, className, time, excuse, companyName, branchName, phone) {
        const date = new Date().toLocaleDateString('tr-TR');
        return `${this.getHeader(companyName, branchName, phone)}Selam *${member.fullName}*! ${this.icons.warning}\n\n` +
            `*${date}* tarihindeki ve saat *${time || '--:--'}*'daki *${className}* dersi için mazeretin kaydedildi.\n\n` +
            `📝 *Mazeret:* ${excuse || 'Belirtilmedi'}\n\n` +
            `Bir sonraki derste seni aramızda görmek dileğiyle, sağlıklı kal! ${this.icons.house}`;
    }

    static getLessonScheduleNotification(member, schedule, isUpdate = false, companyName, branchName, phone) {
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const dayName = days[schedule.dayOfWeek] || 'Belirtilmedi';
        const type = isUpdate ? 'GÜNCELLENDİ' : 'OLUŞTURULDU';

        return `${this.getHeader(companyName, branchName, phone)}Selam *${member.fullName}*! ${this.icons.welcome} \n\n` +
            `Haftalık ders programın *${type}*! ${this.icons.training}\n\n` +
            `📅 *Gün:* ${dayName}\n` +
            `⏰ *Saat:* ${schedule.startTime} - ${schedule.endTime}\n` +
            `👨‍🏫 *Eğitmen:* ${schedule.instructor?.displayName || 'Branş Eğitmeni'}\n` +
            `📝 *Not:* ${schedule.notes || 'Programına ders takviminden ulaşabilirsin.'}\n\n` +
            `Antrenmanlarında başarılar dileriz! ${this.icons.muscle}${this.icons.fire}`;
    }

    static getPaymentPlanMessage(member, plan, schedules, companyName, branchName, phone) {
        const scheduleList = schedules.map(s => {
            const date = new Date(s.dueDate).toLocaleDateString('tr-TR');
            return `📅 *${s.installmentNumber}. Taksit:* ${date} - ₺${parseFloat(s.amount).toFixed(2)}`;
        }).join('\n');

        return `${this.getHeader(companyName, branchName, phone)}Selam *${member.fullName}*! ${this.icons.welcome} \n\n` +
            `Ödeme planın başarıyla oluşturuldu. ${this.icons.check}\n\n` +
            `🔹 *Plan Adı:* ${plan.planName}\n` +
            `🔹 *Toplam Tutar:* ₺${parseFloat(plan.totalAmount).toFixed(2)}\n` +
            `🔹 *Taksit Sayısı:* ${plan.installmentCount}\n\n` +
            `*Ödeme Takvimi:*\n${scheduleList}\n\n` +
            `Hayırlı olması dileğiyle! ${this.icons.muscle}`;
    }

    static getPaymentReceiptMessage(member, paidAmount, balance, companyName, branchName, phone) {
        const balanceText = parseFloat(balance) < 0 ? `*Kalan Borç:* ₺${Math.abs(parseFloat(balance)).toFixed(2)}` : `*Kalan Bakiye:* ₺${parseFloat(balance).toFixed(2)}`;

        return `${this.getHeader(companyName, branchName, phone)}Makbuz Bilgilendirmesi ${this.icons.check}\n\n` +
            `Merhaba *${member.fullName}*,\n\n` +
            `Az önce *₺${parseFloat(paidAmount).toFixed(2)}* tutarında ödemen başarılı bir şekilde tahsil edilmiştir. ${this.icons.bolt}\n\n` +
            `✅ *Tahsil Edilen:* ₺${parseFloat(paidAmount).toFixed(2)}\n` +
            `📉 ${balanceText}\n\n` +
            `Bizi tercih ettiğin için teşekkürler! Haydi Spora..💪`;
    }

    static getInstructorDailySchedule(instructorName, summary, companyName, branchName, phone) {
        return `${this.getHeader(companyName, branchName, phone)}Selam *${instructorName}*! ${this.icons.instructor} \n\n` +
            `Bugünkü programın hazır. İyi dersler dileriz! ${this.icons.bolt}\n\n` +
            `${summary}\n\n` +
            `Günü verimli geçirmen dileğiyle! ${this.icons.muscle}`;
    }

    static getBirthdayMessage(fullName, companyName, branchName, phone, template = null) {
        let text = '';

        if (template && template.trim()) {
            // Placeholder desteği: {adSoyad} veya {name}
            text = template
                .replace(/{adSoyad}/g, `*${fullName}*`)
                .replace(/{name}/g, `*${fullName}*`);
        } else {
            text = `Mutlu Yıllar *${fullName}*! ${this.icons.birthday} \n\n` +
                `Yeni yaşının sana sağlık, mutluluk ve bol sporlu günler getirmesini dileriz. ${this.icons.fire}\n\n` +
                `İyi ki varsın, doğum günün kutlu olsun! ${this.icons.welcome}${this.icons.muscle}${this.icons.bolt}`;
        }

        const fullMsg = `${this.getHeader(companyName, branchName, phone)}${text}`;

        // WhatsApp için güvenli karakter sınırı (Kırpma)
        if (fullMsg.length > 2000) {
            return fullMsg.substring(0, 1997) + '...';
        }

        return fullMsg;
    }

    /**
     * Mesajı göndermek için resmi WhatsApp API linki oluşturur (Manuel tıklama için)
     */
    static getWhatsAppLink(phone, message) {
        if (!phone) return null;
        let finalPhone = phone.replace(/\D/g, '');
        if (finalPhone.length === 10) finalPhone = '90' + finalPhone;
        else if (finalPhone.length === 11 && finalPhone.startsWith('0')) finalPhone = '90' + finalPhone.substring(1);

        const encodedMsg = encodeURIComponent(message);
        return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedMsg}`;
    }

    /**
     * GERÇEK OTOMATİK GÖNDERİM
     */
    static async sendAutoMessage(phone, message) {
        if (!this.isReady || !this.client) {
            console.warn(`[WhatsApp] Mesaj gönderilemedi (Cihaz bağlı değil): ${phone}`);
            return false;
        }

        try {
            let finalPhone = phone.replace(/\D/g, '');
            if (finalPhone.length === 10) finalPhone = '90' + finalPhone;
            else if (finalPhone.length === 11 && finalPhone.startsWith('0')) finalPhone = '90' + finalPhone.substring(1);

            const chatId = `${finalPhone}@c.us`;
            await this.client.sendMessage(chatId, message);
            console.log(`[WhatsApp SUCCESS] Mesaj gönderildi: ${finalPhone}`);
            return true;
        } catch (err) {
            console.error(`[WhatsApp ERROR] Mesaj gönderilemedi (${phone}):`, err);
            return false;
        }
    }
}

module.exports = WhatsAppService;
