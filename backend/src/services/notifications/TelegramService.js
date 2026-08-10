const https = require('https');

class TelegramService {
    /**
     * Telegram üzerinden mesaj gönderir (Native HTTPS kullanarak axios bağımlılığını ortadan kaldırdık)
     * @param {string} token - Bot API Token
     * @param {string} chatId - Hedef Chat/Group ID
     * @param {string} message - Gönderilecek metin
     */
    async sendMessage(token, chatId, message) {
        if (!token || !chatId || !message) {
            console.error('Telegram Gönderim Hatası: Eksik parametre.');
            return false;
        }

        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            });

            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${token}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(true);
                    } else {
                        console.error('Telegram API Hatası:', body);
                        const error = JSON.parse(body);
                        reject(new Error(error.description || 'Telegram mesajı gönderilemedi.'));
                    }
                });
            });

            req.on('error', (err) => {
                console.error('Telegram HTTPS Hatası:', err.message);
                reject(err);
            });

            req.write(data);
            req.end();
        });
    }
}

module.exports = new TelegramService();
