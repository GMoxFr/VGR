<template>
    <div class="popular-games-page">
        <h1>🔥 Jeux les plus populaires</h1>

        <div v-if="games.length > 0" class="game">
            <div class="game-list">
                <GameCard v-for="game in games" :key="game.igdb_id.low" :game="game" />
            </div>
        </div>

        <p v-else class="empty-message">Aucun jeu trouvé.</p>

        <div class="users" v-if="users.length > 0">
            <h2>👤 Utilisateurs</h2>
            <div class="user-list">
                <RouterLink v-for="user in users" :key="user.name"
                    :to="{ name: 'Library', params: { username: user.username } }">
                    <span>{{ user.username }}</span>
                </RouterLink>
            </div>
        </div>


    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const games = ref([]);
const users = ref([]);

// Récupérer les jeux les plus populaires
const fetchPopularGames = async () => {
    try {
        const response = await api.games.popular({ maxResults: 10, page: 1 });
        games.value = response.data.gamesArray;
    } catch (error) {
        console.error("Erreur lors du chargement des jeux populaires:", error);
    }
};

const fetchUsers = async () => {
    try {
        const response = await api.user.getAll();
        users.value = response.data;
    } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
    }
};

document.title = "VGR";

// Charger les jeux populaires au montage
onMounted(fetchPopularGames);
onMounted(fetchUsers);
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

.users {
    width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.user-list {
    display: flex;
    flex-wrap: wrap;
    /* Permet aux éléments de revenir à la ligne */
    justify-content: center;
    /* Centre les éléments horizontalement */
    gap: 10px;
    max-width: 100%;
    padding: 10px;
}

.user-list a {
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 15px;
    margin: 5px;
    border-radius: 5px;
    font-size: 16px;
    color: white;
    text-decoration: none;
    transition: background 0.3s;
}

.user-list a:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Message si aucun jeu trouvé */
.empty-message {
    font-size: 18px;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.7);
}
</style>