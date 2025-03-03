<template>
    <div class="library-page">
        <h1>{{ isOwnLibrary ? "Ma bibliothèque" : `Bibliothèque de ${username}` }}</h1>

        <div v-if="games.length > 0" class="games">
            <div class="game-list">
                <GameCard v-for="game in games" :key="game.igdb_id.low" :game="game" />
            </div>

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

        <p v-else class="empty-message">
            {{ isOwnLibrary ? "Votre bibliothèque est vide." : `Aucune donnée pour ${username}.` }}
        </p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/userStore";
import api from "@/api";
import GameCard from "./components/GameCard.vue";

const route = useRoute();
const userStore = useUserStore();

const username = ref(route.params.username);
const games = ref([]);
const gameCount = ref(0);
const page = ref(1);
const maxResults = 15;

// Vérifie si c'est la bibliothèque du user connecté
const isOwnLibrary = computed(() => userStore.user?.username === username.value);

// Fonction pour récupérer la bibliothèque
const fetchLibrary = async () => {
    try {
        const data = { maxResults, page: page.value };

        let response;
        if (isOwnLibrary.value) {
            response = await api.library.myGames(data);
        } else {
            response = await api.library.games(username.value, data);
        }

        games.value = response.data.gamesArray;
        gameCount.value = response.data.gameCount;
    } catch (error) {
        console.error("Erreur lors du chargement de la bibliothèque:", error);
    }
};

// Nombre total de pages
const pages = computed(() => Math.ceil(gameCount.value / maxResults));

// Changement de page
const setPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pages.value) {
        page.value = pageNum;
        fetchLibrary();
    }
};

// Watch pour actualiser quand l’URL change
watch(() => route.params.username, (newUsername) => {
    username.value = newUsername;
    page.value = 1;
    fetchLibrary();
}, { immediate: true });

onMounted(fetchLibrary);
</script>

<style scoped>
.library-page {
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

/* Grille de jeux */
.game-list {
    width: 80%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 20px;
    justify-content: center;
}

/* Pagination */
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

/* Message si la bibliothèque est vide */
.empty-message {
    font-size: 18px;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.7);
}
</style>