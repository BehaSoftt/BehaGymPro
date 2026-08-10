/**
 * Standardized WhatsApp integration utility for BehaGym Platform.
 */

export const useWhatsApp = () => {
    const formatPhoneNumber = (phone) => {
        if (!phone) return null
        // Remove all non-digits
        let cleaned = phone.replace(/\D/g, '')
        // Add country code if missing (Turkey +90)
        if (cleaned.startsWith('0')) {
            cleaned = '90' + cleaned.substring(1)
        } else if (cleaned.length === 10) {
            cleaned = '90' + cleaned
        }
        return cleaned
    }

    const sendDirectMessage = (phone, message = '') => {
        const cleaned = formatPhoneNumber(phone)
        if (!cleaned) return false

        const encodedMsg = encodeURIComponent(message)
        const url = `https://wa.me/${cleaned}?text=${encodedMsg}`
        window.open(url, '_blank')
        return true
    }

    const generateWelcomeMessage = (name) => {
        return `Selam ${name}! BehaGym ailesine hoş geldin. Üyeliğin başarıyla oluşturulmuştur.`
    }

    const generateExamResult = (name, examName, status, nextBelt) => {
        const resultText = status === 'PASSED' ? `BAŞARILI oldun! Yeni kuşağın: ${nextBelt}` : 'HENÜZ GEÇEMEDİN, bir sonraki sınavda başarılar dileriz.'
        return `Selam ${name}! ${examName} sınav sonucun belli oldu. ${resultText}`
    }

    return { sendDirectMessage, formatPhoneNumber, generateWelcomeMessage, generateExamResult }
}
