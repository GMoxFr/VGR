<template>
    <div v-if="genre" class="genre-container">
        <div class="genre-header-infos">
            <div class="genre-header-info">
                <h1>{{ nameWithCount }}</h1>
            </div>
        </div>

        <!-- Liste des jeux du genre -->
        <div v-if="games.length > 0" class="genre-details">
            <h2>🎮 Jeux de ce genre</h2>
            <div class="similar-games-container">
                <GameCard v-for="game in games" :key="game.igdb_id.low" :game="game" />
            </div>

            <!-- Pagination dynamique -->
            <div v-if="pages > 1" class="pagination">
                <button @click="setPage(1)" :disabled="page === 1">&#8676;</button>
                <button @click="setPage(page - 1)" :disabled="page === 1">&#8592;</button>

                <button v-if="page > 2" @click="setPage(1)">1</button>
                <span v-if="page > 3">...</span>

                <button v-if="page > 1" @click="setPage(page - 1)">{{ page - 1 }}</button>
                <button class="active">{{ page }}</button>
                <button v-if="page < pages" @click="setPage(page + 1)">{{ page + 1 }}</button>

                <span v-if="page < pages - 2">...</span>
                <button v-if="page < pages - 1" @click="setPage(pages)">{{ pages }}</button>

                <button @click="setPage(page + 1)" :disabled="page === pages">&#8594;</button>
                <button @click="setPage(pages)" :disabled="page === pages">&#8677;</button>
            </div>
        </div>

        <!-- Message si aucun jeu trouvé -->
        <p v-if="games.length === 0" class="empty-message">
            Aucun jeu trouvé pour ce genre.
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const route = useRoute();
const genre = ref(null);
const games = ref([]);
const page = ref(1);
const maxResults = 15;
const gameCount = ref(0);

// Charger les informations du genre avec la pagination
const fetchGames = async () => {
    try {
        console.log("Chargement des jeux pour le genre:", route.params.genreId);
        const response = await api.genre.get(route.params.genreId, page.value, maxResults);
        genre.value = response.data;
        games.value = response.data.games;
        gameCount.value = response.data.totalGames;
    } catch (error) {
        console.error("Erreur lors du chargement des données du genre:", error);
    }
};

// Définition du nombre total de pages
const pages = computed(() => Math.ceil(gameCount.value / maxResults));

// Changement de page
const setPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pages.value) {
        page.value = pageNum;
        fetchGames();
    }
};

const nameWithCount = computed(() => {
    return `${genre.value.name} (${gameCount.value})`;
});

watch(page, fetchGames);
onMounted(fetchGames);
</script>

<style scoped>
/* Conteneur principal */
.genre-container {
    width: 100vw;
    padding: 40px 0;
    background: #222;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* Infos du genre */
.genre-header-infos {
    max-width: 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
    position: relative;
}

.genre-header-info h1 {
    margin: 0;
}

/* Section des jeux */
.genre-details {
    width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.similar-games-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 20px;
    justify-content: center;
}

.pagination {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pagination button {
    padding: 8px 12px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    font-size: 14px;
    transition: 0.2s ease-in-out;
}

.pagination button:hover {
    background-color: #0056b3;
}

.pagination button:disabled {
    background-color: #555;
    cursor: default;
}

.pagination .active {
    background-color: #0056b3;
    font-weight: bold;
}
</style>
