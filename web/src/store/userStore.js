import { defineStore } from 'pinia';
import api from '@/api';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        token: localStorage.getItem('userToken') || null, // ✅ Utilisation de localStorage pour persistance
        user: null,
        isFetchingUser: false, // ✅ Empêche les appels API multiples
    }),
    actions: {
        async login(username, password) {
            const response = await api.auth.signin({ username, password });

            if (response.status !== 200 || !response.data.token) {
                throw new Error('Invalid credentials');
            }

            this.token = response.data.token;
            localStorage.setItem('userToken', this.token); // ✅ Sauvegarde dans localStorage

            await this.fetchUser();
        },

        async register(username, password, passwordConfirm) {
            if (password !== passwordConfirm) {
                throw new Error('Passwords do not match');
            }

            const response = await api.auth.signup({ username, password, passwordConfirm });

            if (response.status !== 201 || !response.data.token) {
                throw new Error('Invalid registration');
            }

            this.token = response.data.token;
            localStorage.setItem('userToken', this.token);

            await this.fetchUser();
        },

        async logout() {
            this.token = null;
            this.user = null;

            localStorage.removeItem('userToken'); // ✅ Supprime le token persistant
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
            if (!this.token || this.user || this.isFetchingUser) {
                return;
            }

            this.isFetchingUser = true; // ✅ Empêche les appels multiples

            try {
                const response = await api.profile.getUser();
                if (response.status !== 200) {
                    throw new Error('Invalid user data');
                }

                this.user = response.data;
            } catch (error) {
                console.error('Fetch user error:', error);
                this.logout();
            } finally {
                this.isFetchingUser = false; // ✅ Réactive la possibilité d'appel
            }
        },

        // ✅ Appel automatique lors du chargement de l'application
        async initializeUser() {
            if (this.token) {
                await this.fetchUser();
            }
        }
    }
});