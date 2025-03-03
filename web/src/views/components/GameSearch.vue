<template>
    <div class="search-container">
        <div class="search-box" @click.stop>
            <!-- Barre de recherche -->
            <input type="text" v-model="searchQuery" @input="fetchGames" placeholder="Rechercher un jeu..."
                @keydown.enter="routeToResults" class="search-input" />

            <!-- Bouton pour effacer la recherche (croix) -->
            <button v-if="searchQuery.length > 0" @click.stop="clearSearch" class="clear-button">
                ❌
            </button>

            <button @click="routeToResults" class="search-button">
                🔍
            </button>
        </div>

        <!-- Liste des jeux affichée dynamiquement -->
        <div v-if="gamesArray.length > 0" class="search-results">
            <RouterLink v-for="game in gamesArray" :key="game.igdb_id.low"
                :to="{ name: 'Game', params: { gameId: game.igdb_id.low } }" class="search-result-item"
                @click="closeResults">
                {{ game.title }}
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const searchQuery = ref(""); // Stocke la requête utilisateur
const games = ref([]); // Liste des jeux récupérés
const router = useRouter();

// Fonction pour récupérer les jeux
const fetchGames = async () => {
    if (searchQuery.value.length < 2) {
        games.value = [];
        return;
    }

    try {
        const response = await api.games.search({ query: searchQuery.value, maxResults: 5, page: 1 });
        games.value = response.data.gamesArray;
    } catch (error) {
        console.error("Erreur lors de la recherche:", error);
    }
};

// Supprime la recherche
const clearSearch = () => {
    searchQuery.value = "";
    games.value = [];
};

// Masquer les résultats si clic en dehors, touche Échap ou clic sur un lien
const closeResults = () => {
    games.value = [];
};

// Fermer les résultats avec la touche Échap
const handleEscape = (event) => {
    if (event.key === "Escape") {
        closeResults();
    }
};

// Ajouter / Retirer les écouteurs d'événements
onMounted(() => {
    document.addEventListener("click", closeResults);
    document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
    document.removeEventListener("click", closeResults);
    document.removeEventListener("keydown", handleEscape);
});

// Filtrer les résultats affichés uniquement si la recherche est longue
const gamesArray = computed(() => (searchQuery.value.length >= 3 ? games.value : []));

// Redirection vers la page de résultats
const routeToResults = () => {
    router.push({ name: "Search", query: { query: searchQuery.value } });
    closeResults(); // Fermer les résultats après validation
};
</script>

<style scoped>
/* Conteneur principal */
.search-container {
    position: relative;
    width: 100%;
    max-width: 400px;
}

/* Boîte de recherche */
.search-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease-in-out;
    position: relative;
}

/* Input stylisé */
.search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 8px 15px;
    color: white;
    font-size: 14px;
}

/* Placeholder en blanc */
.search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}

/* Bouton de recherche */
.search-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 5px 10px;
    color: white;
    transition: transform 0.2s ease-in-out;
}

.search-button:hover {
    transform: scale(1.1);
}

/* Bouton pour effacer la recherche */
.clear-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: white;
    margin-right: 8px;
}

.clear-button:hover {
    color: #ff4444;
}

/* Liste des résultats */
.search-results {
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    z-index: 1000;
}

/* Résultat individuel */
.search-result-item {
    display: block;
    padding: 10px;
    color: white;
    text-decoration: none;
    transition: background 0.2s ease-in-out;
}

.search-result-item:hover {
    background: rgba(255, 255, 255, 0.2);
}
</style>