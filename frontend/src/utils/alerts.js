import Swal from 'sweetalert2'

const defaultSettings = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#e11d48', // rose-600
    cancelButtonColor: '#475569',  // slate-600
    heightAuto: false,
}

export const useAlerts = () => {
    const success = (title, text = '') => {
        return Swal.fire({
            ...defaultSettings,
            icon: 'success',
            title: String(title || '').toUpperCase(),
            text: String(text || '').toUpperCase(),
            timer: 2000,
            showConfirmButton: false,
        })
    }

    const error = (title, text = '') => {
        return Swal.fire({
            ...defaultSettings,
            icon: 'error',
            title: String(title || '').toUpperCase(),
            text: String(text || '').toUpperCase(),
        })
    }

    const confirm = (title, text = '', confirmText = 'EVET, DEVAM ET', cancelText = 'VAZGEÇ') => {
        return Swal.fire({
            ...defaultSettings,
            title: String(title || '').toUpperCase(),
            text: String(text || '').toUpperCase(),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: String(confirmText || '').toUpperCase(),
            cancelButtonText: String(cancelText || '').toUpperCase(),
        })
    }

    const warning = (title, text = '') => {
        return Swal.fire({
            ...defaultSettings,
            icon: 'warning',
            title: String(title || '').toUpperCase(),
            text: String(text || '').toUpperCase(),
        })
    }

    const toast = (title, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#1e293b',
            color: '#f1f5f9',
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        return Toast.fire({
            icon: icon,
            title: String(title || '').toUpperCase()
        });
    }

    const prompt = (title, inputLabel = '', inputType = 'text', inputValue = '') => {
        return Swal.fire({
            ...defaultSettings,
            title: String(title || '').toUpperCase(),
            input: inputType,
            inputLabel: String(inputLabel || '').toUpperCase(),
            inputValue: inputValue,
            showCancelButton: true,
            confirmButtonText: 'TAMAM',
            cancelButtonText: 'İPTAL',
        })
    }

    return { success, error, confirm, warning, toast, prompt }
}
