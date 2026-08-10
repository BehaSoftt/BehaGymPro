const nodemailer = require('nodemailer');
const SecurityVault = require('./SecurityVault');

class Mailer {
    static async sendMail(to, subject, text, html) {
        // Gmail SMTP configuration using SecurityVault
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT == "465", // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: SecurityVault.get('smtp_pass'),
            },
            tls: {
                rejectUnauthorized: false // Bypasses self-signed certificate issues (common with antivirus)
            }
        });

        let info = await transporter.sendMail({
            from: `"BehaGym Pro" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Mesaj gönderildi: %s", info.messageId);
        return info;
    }

    static async sendWelcomeMail(email, name) {
        const html = `<h1>Hoş Geldin, ${name}!</h1><p>BehaGym Pro ailesine katıldığın için mutluyuz. Gelişimini takip etmek için üye panelini kullanabilirsin.</p>`;
        return this.sendMail(email, "BehaGym Pro'ya Hoş Geldin!", "Hoş geldin!", html);
    }

    static async sendExpirityWarning(email, name, days) {
        const html = `<h2 style="color: #e11d48;">Dikkat, Üyelik Bitiyor!</h2><p>Sayın ${name}, üyeliğinizin sona ermesine <strong>${days}</strong> gün kaldı. Salonumuzun imkanlarından kesintisiz yararlanmak için yenileme yapabilirsiniz.</p>`;
        return this.sendMail(email, "Üyelik Süresi Hatırlatması", "Üyelik bitiyor!", html);
    }
}

module.exports = Mailer;
