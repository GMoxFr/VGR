<template>
    <div>
        <!-- Barre de recherche -->
        <input 
            type="text" 
            v-model="searchQuery" 
            @input="fetchGames"
            placeholder="Rechercher un jeu..."
        />

        <input 
            type="submit" 
            value="Rechercher" 
            @click="routeToResults"
        />

        <!-- Liste des jeux -->
        <div v-if="games.length > 0">
            <div v-for="game in games" :key="game.title">
                <RouterLink :to="{ name: 'Game', params: { gameId: game.igdb_id.low } }">{{ game.title }}</RouterLink>
            </div>
        </div>
        <p v-else>Aucun jeu trouvé</p>
    </div>
</template>

<script>
import api from '@/api';

export default {
    name: 'GameSearchComponent',
    data() {
        return {
            searchQuery: '', // Stocke la requête utilisateur
            games: [],       // Liste des jeux récupérés
        };
    },
    methods: {
        async fetchGames() {
            if (this.searchQuery.length < 2) { // Évite de spammer l'API avec une recherche trop courte
                this.games = [];
                return;
            }

            try {
                const response = await api.games.search({ query: this.searchQuery, maxResults: 5, page: 1 });
                this.games = response.data.gamesArray;
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
            }
        },
        routeToResults() {
            this.$router.push({ name: 'Search', query: { query: this.searchQuery } });
        },
    },
};
</script>

<style scoped>
input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
}
</style>