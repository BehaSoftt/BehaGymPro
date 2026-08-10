export const inputMasks = {
    phone: (val) => {
        if (!val && val !== 0) return ''
        let digits = String(val).replace(/\D/g, '')
        
        // Eğer 10 hane girildiyse ve başında 0 yoksa (örn: 552...), otomatik 0 ekle
        if (digits.length === 10 && digits[0] !== '0') {
            digits = '0' + digits
        }

        if (digits.length > 11) digits = digits.substring(0, 11)
        
        let res = ''
        if (digits.length > 0) res += digits[0]
        if (digits.length > 1) {
            res += ' (' + digits.substring(1, 4)
            if (digits.length >= 4) res += ') '
        }
        if (digits.length > 4) {
            res += digits.substring(4, 7)
            if (digits.length >= 7) res += ' '
        }
        if (digits.length > 7) {
            res += digits.substring(7, 9)
            if (digits.length >= 9) res += ' '
        }
        if (digits.length > 9) {
            res += digits.substring(9, 11)
        }
        
        return res
    },

    tcNo: (val) => {
        if (!val && val !== 0) return ''
        return String(val).replace(/\D/g, '').substring(0, 11)
    },

    vergiNo: (val) => {
        if (!val && val !== 0) return ''
        return String(val).replace(/\D/g, '').substring(0, 10)
    },

    numeric: (val, maxDigits = null) => {
        if (!val && val !== 0) return ''
        let digits = String(val).replace(/\D/g, '')
        if (maxDigits) digits = digits.substring(0, maxDigits)
        return digits
    },

    decimal: (val) => {
        if (!val && val !== 0) return ''
        // Allow only digits and one dot
        let value = String(val).replace(/[^0-9.]/g, '')
        const parts = value.split('.')
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('')
        }
        return value
    }
}
