<template>
    <div>
        <p v-if="game">Game: {{ game.title }}</p>

        <p v-if="error">{{ error }}</p>

        <input v-if="user && !owned" type="button" value="Add to library" @click="addToLibrary" />
        <input v-if="user && owned" type="button" value="Remove from library" @click="removeFromLibrary" />

        <RouterLink :to="{ name: 'Home' }">Back to home</RouterLink>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from '@/store/userStore';
import api from '@/api';

export default {
    name: 'GamePage',
    setup() {
        const store = useUserStore();
        const user = computed(() => store.user);

        return {
            store,
            user,
        };
    },
    data() {
        return {
            gameId: this.$route.params.gameId || null,
            error: null,
            game: null,
            owned: false,
        };
    },
    methods: {
        async fetchGame() {
            if (!this.gameId) {
                this.error = 'No game ID provided';
                return;
            }
            try {
                const response = await api.games.get(this.gameId);
                this.game = response.data;
            } catch (error) {
                console.error('Error while fetching game:', error);
                this.error = error.response?.data?.error || 'Error fetching game';
            }
        },
        async fetchOwned() {
            if (!this.user) return;

            try {
                const response = await api.library.owned(this.gameId);
                this.owned = response.data.owned;
            } catch (error) {
                console.error('Error while fetching owned games:', error);
            }
        },
        async addToLibrary() {
            try {
                await api.library.add({ gameId: this.gameId });
                this.owned = true;
            } catch (error) {
                console.error('Error while adding game to library:', error);
            }
        },
        async removeFromLibrary() {
            try {
                await api.library.remove(this.gameId);
                this.owned = false;
            } catch (error) {
                console.error('Error while removing game from library:', error);
            }
        },
    },
    mounted() {
        this.gameId = this.$route.params.gameId || null;
        this.fetchGame();

        // 🔥 Vérifie si `user` est déjà chargé au moment du mount
        if (this.user) {
            this.fetchOwned();
        }
    },
    watch: {
        // 🔥 Surveille les changements de `user`
        user(newUser) {
            if (newUser) {
                this.fetchOwned();
            }
        }
    }
}
</script>