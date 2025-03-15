<template>
    <div v-if="company" class="company-container">
        <!-- Header de l'entreprise -->
        <div class="company-header-infos">
            <div class="company-header-info">
                <h1>{{ company.name }}</h1>
                <p v-if="company.country && countryWithFlag">{{ countryWithFlag }}</p>
            </div>
        </div>

        <!-- Encadré de la palette -->
        <div v-if="!paletteLoaded && !paletteLoading" class="palette-box" @click="loadPalette">
            <button class="palette-button">🎨 Charger la palette</button>
        </div>

        <div v-if="!paletteLoaded && paletteLoading" class="palette-box loading">
            <p class="loading-text">Chargement de la palette<span class="dots"></span></p>
        </div>

        <div v-if="paletteLoaded" class="palette-container">
            <img :src="paletteUrl" alt="Palette de couleurs" class="palette-image" />
        </div>

        <!-- Liste des jeux développés -->
        <div v-if="company.developedGames.length > 0" class="company-details">
            <h2>🎮 Jeux développés</h2>
            <div class="similar-games-container">
                <GameCard v-for="game in company.developedGames" :key="game.igdb_id.low" :game="game" />
            </div>
            <button v-if="!developAll && company.developedGames.length >= 10" @click="toggleDevelop"
                class="show-more-btn">Afficher plus</button>
        </div>

        <!-- Liste des jeux publiés -->
        <div v-if="company.publishedGames.length > 0" class="company-details">
            <h2>📢 Jeux publiés</h2>
            <div class="similar-games-container">
                <GameCard v-for="game in company.publishedGames" :key="game.igdb_id.low" :game="game" />
            </div>
            <button v-if="!publishAll && company.publishedGames.length >= 10" @click="togglePublish"
                class="show-more-btn">Afficher plus</button>
        </div>

        <!-- Graphiques -->
        <div v-if="genreRef" class="company-details">
            <h2>📊 Jeux par genre</h2>
            <PlotlyChart :data="genreRef.data" :layout="genreRef.layout" />
        </div>

        <div v-if="platformRef" class="company-details">
            <h2>📊 Jeux par plateformes</h2>
            <PlotlyChart :data="platformRef.data" :layout="platformRef.layout" />
        </div>

        <!-- Message si aucun jeu trouvé -->
        <p v-if="!hasGames" class="empty-message">Aucun jeu trouvé pour cette société.</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import palette from "@/palette";
import graphs from "@/graphs";
import iso3166 from "iso-3166-1";
import emojiFlags from "emoji-flags";
import GameCard from "./components/GameCard.vue";
import PlotlyChart from "./components/PlotlyChart.vue";

const route = useRoute();
const company = ref(null);
const developAll = ref(false);
const publishAll = ref(false);
const genreRef = ref(null);
const platformRef = ref(null);
const paletteUrl = ref(null);
const paletteLoaded = ref(false);
const paletteLoading = ref(false);

const getNeo4jNumber = (value) => (value && typeof value.low !== "undefined" ? value.low : value);

/**
 * Récupère et retourne le drapeau et le nom du pays.
 */
const getCountryWithFlag = (countryCode) => {
    const country = iso3166.whereNumeric(getNeo4jNumber(countryCode));
    if (!country) return null;
    const flag = emojiFlags[country.alpha2]?.emoji || "🏳";
    return `${flag} ${country.country}`;
};
const countryWithFlag = computed(() => getCountryWithFlag(company.value?.country));

/**
 * Vérifie si l'entreprise a au moins un jeu développé ou publié.
 */
const hasGames = computed(() => company.value?.developedGames.length > 0 || company.value?.publishedGames.length > 0);

/**
 * Récupère les données de l'entreprise depuis l'API.
 */
const fetchCompany = async () => {
    try {
        const response = await api.company.get(route.params.companyId, developAll.value, publishAll.value);
        company.value = response.data;
        fetchGraphs();
    } catch (error) {
        console.error("Erreur lors du chargement des données de l'entreprise:", error);
    }
};

/**
 * Charge la palette de l'entreprise.
 */
const loadPalette = async () => {
    if (!company.value) return;
    try {
        paletteLoading.value = true;
        const response = await palette.get(company.value.name, "Company");
        const imageUrl = URL.createObjectURL(response.data);
        paletteUrl.value = imageUrl;
        paletteLoaded.value = true;
    } catch (error) {
        console.error("Erreur lors du chargement de la palette :", error);
    } finally {
        paletteLoading.value = false;
    }
};

/**
 * Récupère les données des graphiques (genres et plateformes).
 */
const fetchGraphs = async () => {
    if (!company.value) return;

    try {
        const genreResponse = await graphs.genre_distribution.get(company.value.name);
        genreRef.value = genreResponse.data;
    } catch (error) {
        console.error("Erreur lors du chargement des données des genres:", error);
    }

    try {
        const platformResponse = await graphs.platform_distribution.get(company.value.name);
        platformRef.value = platformResponse.data;
    } catch (error) {
        console.error("Erreur lors du chargement des données des plateformes:", error);
    }
};

/**
 * Charge tous les jeux développés.
 */
const toggleDevelop = async () => {
    developAll.value = true;
    await fetchCompany();
};

/**
 * Charge tous les jeux publiés.
 */
const togglePublish = async () => {
    publishAll.value = true;
    await fetchCompany();
};

// Charge les données au montage du composant
onMounted(fetchCompany);

document.title = "VGR - Société";
watch(company, () => {
    if (company.value) {
        document.title = `VGR - ${company.value.name}`;
    }
});
</script>

<style scoped>
/* Conteneur principal */
.company-container {
    width: 100vw;
    padding: 40px 0;
    background: #222;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* Header de la société */
.company-header {
    position: relative;
    width: 100%;
    overflow: hidden;
}

/* Infos de la société */
.company-header-infos {
    max-width: 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
    position: relative;
}

.company-header-info h1 {
    margin: 0;
}

/* Nom et pays */
.company-header-info {
    flex: 1;
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
}

/* Section des jeux */
.company-details {
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

.show-more-btn {
    margin-top: 10px;
    padding: 10px 15px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 14px;
    transition: background 0.3s;
}

.show-more-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

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

.palette-box:hover {
    background-color: rgba(255, 255, 255, 0.2);
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

/* Message si aucun jeu trouvé */
.empty-message {
    font-size: 18px;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.7);
}
</style>