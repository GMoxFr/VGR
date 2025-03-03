<template>
    <div class="popular-games-page">
        <h1>🔥 Jeux les plus populaires</h1>

        <div v-if="games.length > 0" class="game">
            <div class="game-list">
                <GameCard v-for="game in games" :key="game.igdb_id.low" :game="game" />
            </div>
        </div>

        <p v-else class="empty-message">Aucun jeu trouvé.</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const games = ref([]);

// Récupérer les jeux les plus populaires
const fetchPopularGames = async () => {
    try {
        const response = await api.games.popular({ maxResults: 10, page: 1 });
        games.value = response.data.gamesArray;
    } catch (error) {
        console.error("Erreur lors du chargement des jeux populaires:", error);
    }
};

// Charger les jeux populaires au montage
onMounted(fetchPopularGames);
</script>

<style scoped>
.popular-games-page {
    width: 100vw;
    padding: 40px 0;
    background: #222;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.games {
    width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Grille des jeux */
.game-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 20px;
    justify-content: center;
}

/* Message si aucun jeu trouvé */
.empty-message {
    font-size: 18px;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.7);
}
</style>