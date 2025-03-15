<template>
    <div class="library-page">
        <h1>{{ isOwnLibrary ? "Ma bibliothèque" : `Bibliothèque de ${username}` }}</h1>

        <!-- Encadré de la palette -->
        <div v-if="!paletteLoaded && !paletteLoading && games.length > 0 && !paletteError" class="palette-box"
            @click="loadPalette">
            <button class="palette-button">🎨 Charger la palette</button>
        </div>
        <div v-if="!paletteLoaded && paletteLoading && games.length > 0 && !paletteError" class="palette-box loading">
            <p class="loading-text">Chargement de la palette<span class="dots"></span></p>
        </div>
        <div v-if="paletteLoaded && games.length > 0 && !paletteError" class="palette-container">
            <img :src="paletteUrl" alt="Palette de couleurs" class="palette-image" />
        </div>
        <div v-if="paletteError && games.length > 0" class="palette-container">
            <p>Palette non disponible</p>
        </div>


        <!-- Boutons Exporter / Importer -->
        <div class="actions" v-if="gameCount > 0 || isOwnLibrary">
            <button v-if="gameCount > 0" @click="exportLibrary">📥 Exporter</button>
            <button v-if="isOwnLibrary && !importLoading" @click="openFileInput">📤 Importer</button>
            <button v-if="isOwnLibrary && importLoading" class="import-loading">⏳ Import en cours...</button>
            <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv" hidden />
        </div>

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
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import api from "@/api";
import importer from "@/importer";
import exporter from "@/exporter";
import palette from "@/palette";
import GameCard from "./components/GameCard.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const username = ref(route.params.username || userStore.user?.username || "");
const games = ref([]);
const gameCount = ref(0);
const page = ref(1);
const maxResults = 15;
const fileInput = ref(null);
const importLoading = ref(false);

const paletteUrl = ref(null);
const paletteLoaded = ref(false);
const paletteLoading = ref(false);
const paletteError = ref(false);

// Vérifie si c'est la bibliothèque du user connecté
const isOwnLibrary = computed(() => userStore.user?.username === username.value);

// Redirection si pas de username et utilisateur non connecté
if (!username.value) {
    if (userStore.user) {
        username.value = userStore.user.username;
    } else {
        router.push("/");
    }
}

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

// EXPORT CSV
const exportLibrary = async () => {
    try {
        const response = await exporter.get(username.value);
        if (response.status !== 200) {
            throw new Error("Erreur lors de l'exportation");
        }
        const blob = new Blob([response.data], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${username.value}_games.csv`;
        link.click();
    } catch (error) {
        console.error("Erreur lors de l'export :", error);
    }
};

// IMPORT CSV
const openFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    importLoading.value = true; // Active le loading

    try {
        await importer.post(file);
        fetchLibrary(); // Recharge la bibliothèque après l'import
        alert("Import réussi !");
    } catch (error) {
        console.error("Erreur lors de l'import :", error);
        alert("Échec de l'import.");
    } finally {
        importLoading.value = false; // Désactive le loading
    }
};

const loadPalette = async () => {
    if (!username.value) return;
    try {
        paletteLoading.value = true;
        const response = await palette.get(username.value, "User");
        const imageUrl = URL.createObjectURL(response.data);
        paletteUrl.value = imageUrl;
        paletteLoaded.value = true;
    } catch (error) {
        console.error("Erreur lors du chargement de la palette :", error);
        if (error.response && error.response.status === 404) {
            paletteError.value = true;
            paletteLoaded.value = false;
        }
    } finally {
        paletteLoading.value = false;
    }
};

document.title = "VGR - Bibliothèque";

// Watch pour actualiser quand l’URL change
watch(() => route.params.username, (newUsername) => {
    username.value = newUsername || userStore.user?.username || "";
    document.title = `VGR - ${username.value}`;
    page.value = 1;
    if (!username.value) {
        router.push("/");
    } else {
        paletteLoaded.value = false;
        paletteUrl.value = null;
        paletteError.value = false;
        fetchLibrary();
    }
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

.actions {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.actions button {
    padding: 10px 15px;
    border: none;
    background-color: #28a745;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    font-size: 16px;
    transition: 0.2s ease-in-out;
}

.actions button:hover {
    background-color: #218838;
}

.games {
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

/* Encadré de la palette */
.palette-box {
    width: 50%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
    border: 2px dashed rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background 0.3s ease-in-out;
}

/* Effet de pulsation sur le chargement */
.palette-box.loading {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        background-color: rgba(255, 255, 255, 0.1);
    }

    50% {
        background-color: rgba(255, 255, 255, 0.2);
    }

    100% {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

/* Animation pour le texte de chargement */
.loading-text {
    font-size: 16px;
    font-weight: bold;
}

.dots::after {
    content: "";
    animation: dots-animation 1.5s infinite;
}

@keyframes dots-animation {
    0% {
        content: ".";
    }

    33% {
        content: "..";
    }

    66% {
        content: "...";
    }

    100% {
        content: ".";
    }
}

/* Palette affichée */
.palette-container {
    width: 50%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.palette-image {
    max-width: 100%;
    height: 100%;
    object-fit: contain;
}

.palette-button {
    padding: 10px 15px;
    background: #28a745;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 16px;
    transition: background 0.3s;
}

.palette-button:hover {
    background: #218838;
}

/* Message si la bibliothèque est vide */
.empty-message {
    font-size: 18px;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.7);
}
</style>