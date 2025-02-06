import { defineStore } from 'pinia'
import api from '@/api'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: sessionStorage.getItem('userToken') || null,
        expiration: sessionStorage.getItem('userExpiration') || null,
        user: null,
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await api.auth.signin({ username, password });

                if (response.status !== 200 || !response.data.token) {
                    throw new Error('Invalid credentials');
                }

                this.token = response.data.token;
                this.expiration = new Date().getTime() + response.data.expiration * 1000; // Stocker un timestamp exact

                sessionStorage.setItem('userToken', this.token);
                sessionStorage.setItem('userExpiration', this.expiration);

                await this.fetchUser();
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        async logout() {
            this.token = null;
            this.expiration = null;
            this.user = null;

            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userExpiration');
        },

        async fetchUser() {
            if (!this.token) {
                return;
            }

            if (new Date().getTime() > this.expiration) {
                this.logout();
                return;
            }

            try {
                const response = await api.profile.getUser();
                if (response.status !== 200) {
                    throw new Error('Invalid user data');
                }

                this.user = response.data;
            } catch (error) {
                console.error('Fetch user error:', error);
                this.logout();
            }
        },

        async refreshToken() {
            try {
                const response = await api.profile.refreshToken({ token: this.token });

                if (response.status === 200 && response.data.token) {
                    this.token = response.data.token;
                    this.expiration = new Date().getTime() + response.data.expiration * 1000;

                    sessionStorage.setItem('userToken', this.token);
                    sessionStorage.setItem('userExpiration', this.expiration);
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Refresh token error:', error);
                this.logout();
            }
        }
    }
});