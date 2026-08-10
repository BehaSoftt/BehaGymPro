import { defineStore } from 'pinia';
import api from '../utils/api';
import Storage from '../utils/Storage';

const { apiClient } = api;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(Storage.getItem('user')) || null,
        token: Storage.getItem('token') || null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN',
        isMember: (state) => state.user?.role === 'MEMBER',
        isBehaAdmin: (state) => {
            if (!state.user) return false;
            return state.user.role === 'SUPER_MASTER' ||
                state.user.email === 'behasoftt@gmail.com' ||
                state.user.Company?.name?.toUpperCase() === 'BEHASOFT';
        },
        isReceptionist: (state) => state.user?.role === 'RECEPTIONIST' || state.user?.role === 'TERMINAL' || state.user?.username?.toLowerCase().startsWith('terminal'),
        isInstructor: (state) => state.user?.role === 'EĞİTMEN' || state.user?.role === 'INSTRUCTOR',
        hasPermission: (state) => (permKey) => {
            if (!state.user) return false;
            if (state.user.role === 'SUPER_MASTER') return true;
            const perms = state.user.Permissions ||
                state.user.permissions ||
                state.user.Role?.Permissions ||
                state.user.Role?.permissions ||
                [];
            return perms.some(p => p.key === permKey);
        }
    },

    actions: {
        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.post('/auth/login', { username, password });

                if (response.data.status === 'REQUIRE_2FA') {
                    return { status: 'REQUIRE_2FA', userId: response.data.userId };
                }

                this.setAuthData(response.data.user, response.data.token);
                return { status: 'SUCCESS' };
            } catch (err) {
                this.error = err.response?.data?.message || 'Giriş yapılamadı.';
                return { status: 'ERROR' };
            } finally {
                this.loading = false;
            }
        },

        async cardLogin(qrData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.post('/auth/card-login', { qrData });
                this.setAuthData(response.data.user, response.data.token);
                return { status: 'SUCCESS' };
            } catch (err) {
                this.error = err.response?.data?.message || 'Geçersiz Kart veya QR Kod.';
                return { status: 'ERROR' };
            } finally {
                this.loading = false;
            }
        },

        setAuthData(user, token) {
            this.user = user;
            this.token = token;
            Storage.setItem('user', JSON.stringify(user));
            Storage.setItem('token', token);
        },

        async verify2FA(userId, code) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.post('/auth/verify-2fa', { userId, code });
                this.setAuthData(response.data.user, response.data.token);
                return true;
            } catch (err) {
                this.error = err.response?.data?.message || 'Doğrulama kodu geçersiz.';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async verify2FA(userId, code) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.post('/auth/verify-2fa', { userId, code });
                this.setAuthData(response.data.user, response.data.token);
                return true;
            } catch (err) {
                this.error = err.response?.data?.message || 'Doğrulama kodu geçersiz.';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async memberLogin(memberCode, phone) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiClient.post('/auth/member-login', { memberCode, phone });
                this.setAuthData(response.data.user, response.data.token);
                return { status: 'SUCCESS' };
            } catch (err) {
                this.error = err.response?.data?.message || 'Geçersiz bilgiler.';
                return { status: 'ERROR' };
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            Storage.removeItem('user');
            Storage.removeItem('token');
        }
    }
});
