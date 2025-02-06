import { defineStore } from 'pinia'
import api from '@/api'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: sessionStorage.getItem('userToken') || null,
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

                sessionStorage.setItem('userToken', this.token);

                await this.fetchUser();
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        async register(username, password, passwordConfirm) {
            if (password !== passwordConfirm) {
                throw new Error('Passwords do not match');
            }

            try {
                const response = await api.auth.signup({ username, password, passwordConfirm });

                if (response.status !== 201 || !response.data.token) {
                    throw new Error('Invalid registration');
                }

                this.token = response.data.token;

                sessionStorage.setItem('userToken', this.token);

                await this.fetchUser();
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        },

        async logout() {
            this.token = null;
            this.user = null;

            sessionStorage.removeItem('userToken');
        },

        async deleteAccount() {
            try {
                await api.profile.deleteUser();
                this.logout();
            } catch (error) {
                console.error('Delete user error:', error);
                throw error;
            }
        },

        async fetchUser() {
            if (!this.token) {
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
    }
});