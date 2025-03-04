<template>
    <div class="search-page">
        <h1>Search results for "{{ searchQuery }}"</h1>

        <div v-if="games.length > 0" class="games">
            <!-- Liste des jeux affichés en grid -->
            <div class="game-list">
                <GameCard v-for="game in games" :key="game.title" :game="game" />
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

        <p v-else>No game found</p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const route = useRoute();
const searchQuery = ref("");
const maxResults = 15; // Changement : affichage de 20 jeux au lieu de 10
const page = ref(1);
const games = ref([]);
const gameCount = ref(0);

// Fonction pour récupérer les jeux depuis l'API
const fetchGames = async () => {
    try {
        const response = await api.games.search({
            query: searchQuery.value,
            maxResults,
            page: page.value
        });

        games.value = response.data.gamesArray;
        gameCount.value = response.data.gameCount;
    } catch (error) {
        console.error("Error while searching:", error);
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

// Watch sur la query pour relancer la recherche
watch(() => route.query.query, (newQuery) => {
    searchQuery.value = newQuery || "";
    page.value = 1;
    fetchGames();
}, { immediate: true });

onMounted(() => {
    searchQuery.value = route.query.query || "";
    fetchGames();
});
</script>

<style scoped>
.search-page {
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

.game-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(3, auto);
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