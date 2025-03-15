<template>
    <div v-if="franchise" class="franchise-container">
        <div class="franchise-header-infos">
            <div class="franchise-header-info">
                <h1>{{ nameWithCount }}</h1>
            </div>
        </div>

        <!-- Liste des jeux de la franchise -->
        <div v-if="games.length > 0" class="franchise-details">
            <h2>🎮 Jeux mettant en scène cette franchise</h2>
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
            Aucun jeu trouvé pour cette franchise.
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const route = useRoute();
const franchise = ref(null);
const games = ref([]);
const page = ref(1);
const maxResults = 15;
const gameCount = ref(0);

// Charger les informations de la franchise avec la pagination
const fetchGames = async () => {
    try {
        console.log("Chargement des jeux pour la franchise:", route.params.franchiseId);
        const response = await api.franchise.get(route.params.franchiseId, page.value, maxResults);
        franchise.value = response.data;
        games.value = response.data.games;
        gameCount.value = response.data.totalGames;
    } catch (error) {
        console.error("Erreur lors du chargement des données de la franchise:", error);
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
    return `${franchise.value?.name} (${gameCount.value})`;
});

watch(page, fetchGames);
onMounted(fetchGames);

document.title = "VGR - Franchise";
watch(franchise, () => {
    if (franchise.value) {
        document.title = `VGR - ${franchise.value.name}`;
    }
});
</script>

<style scoped>
/* Conteneur principal */
.franchise-container {
    width: 100vw;
    padding: 40px 0;
    background: #222;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* Infos de la franchise */
.franchise-header-infos {
    max-width: 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
    position: relative;
}

.franchise-header-info h1 {
    margin: 0;
}

/* Section des jeux */
.franchise-details {
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
