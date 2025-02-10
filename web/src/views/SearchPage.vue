<template>

    <div>

        <div v-if="games.length > 0">
            <div v-for="game in games" :key="game.title">
                <RouterLink :to="{ name: 'Game', params: { gameId: game.igdb_id.low } }">{{ game.title }}</RouterLink>
            </div>

            <div v-if="pages > 1">
                <button v-for="page in pages" :key="page" @click="setPage(page)">{{ page }}</button>
            </div>
        </div>

        <p v-else>No game found</p>

        <RouterLink :to="{ name: 'Home' }">Back to home</RouterLink>

    </div>

</template>

<script>

import api from '@/api';

export default {
    name: 'SearchPage',
    data() {
        return {
            searchQuery: '',
            maxResults: 10,
            page: 1,
            games: [],
        };
    },
    methods: {
        async fetchGames() {
            try {
                const response = await api.games.search({ query: this.searchQuery, maxResults: this.maxResults, page: this.page });
                this.games = response.data.gamesArray;
                this.gameCount = response.data.gameCount;
            } catch (error) {
                console.error('Error while searching:', error);
            }
        },
        setPage(page) {
            this.page = page;
            this.fetchGames();
        },
    },
    mounted() {
        this.searchQuery = this.$route.query.query;
        this.fetchGames();
    },
    computed: {
        pages() {
            return Math.ceil(this.gameCount / this.maxResults);
        },
    },
}

</script>