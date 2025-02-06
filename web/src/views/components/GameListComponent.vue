<template>

    <div v-for="game in games" :key="game.title ">
        <p>{{ game.title }}</p>
    </div>

</template>

<script>

import api from '@/api';

export default {
    name: 'GameListComponent',
    setup() {
    },
    data() {
        return {
            games: [],
        }
    },
    mounted() {
        this.fetchGames();
    },
    methods: {
        async fetchGames() {
            try {
                const response = await api.games.list();
                this.games = response.data;
            } catch (error) {
                console.error(error);
            }
        },
    },
}

</script>