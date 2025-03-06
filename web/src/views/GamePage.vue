<template>
    <div v-if="game" class="game-container">
        <div class="game-header">
            <div class="game-background" :style="{ backgroundImage: `url(${gameBackground})` }" v-if="useBackground">
            </div>
            <div class="game-background-color" :style="{ background: gameBackgroundGradient }" v-else></div>

            <div class=" game-header-infos">
                <div class="game-header-extra">
                    <img :src="gameCover" alt="Game Cover" />

                    <button v-if="user && !owned" @click="addToLibrary">Ajouter à la bibliothèque</button>
                    <button v-if="user && owned" @click="removeFromLibrary">Retirer de la bibliothèque</button>
                </div>

                <div class="game-header-info">
                    <h1>{{ game.title }} - {{ releaseDate }}</h1>
                    <p>{{ storylineOrSummary }}</p>
                </div>
            </div>
        </div>

        <!-- Section Game Details -->
        <div class="game-details">
            <div class="game-details-content">
                <!-- Plateformes -->
                <div v-if="game.platforms?.length && game.platforms[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Plateforme", game.platforms) }}</h3>
                    <RouterLink v-for="platform in game.platforms" :key="platform.id" to="/">
                        <span>{{ platform.name }}</span>
                    </RouterLink>
                </div>

                <!-- Genres -->
                <div v-if="game.genres?.length && game.genres[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Genre", game.genres) }}</h3>
                    <RouterLink v-for="genre in game.genres" :key="genre.id" to="/">
                        <span>{{ genre.name }}</span>
                    </RouterLink>
                </div>

                <!-- Développeurs -->
                <div v-if="game.developers?.length && game.developers[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Développeur", game.developers) }}</h3>
                    <RouterLink v-for="developer in game.developers" :key="developer.id"
                        :to="{ name: 'Company', params: { companyId: getNeo4jNumber(developer.id) } }">
                        <span>
                            {{ developer.name }}
                            <span v-if="developer.country && getCountryWithFlag(developer.country)">
                                - {{ getCountryWithFlag(developer.country) }}
                            </span>
                        </span>
                    </RouterLink>
                </div>

                <!-- Éditeurs -->
                <div v-if="game.publishers?.length && game.publishers[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Éditeur", game.publishers) }}</h3>
                    <RouterLink v-for="publisher in game.publishers" :key="publisher.id"
                        :to="{ name: 'Company', params: { companyId: getNeo4jNumber(publisher.id) } }">
                        <span>
                            {{ publisher.name }}
                            <span v-if="publisher.country && getCountryWithFlag(publisher.country)">
                                - {{ getCountryWithFlag(publisher.country) }}
                            </span>
                        </span>
                    </RouterLink>
                </div>

                <!-- Moteurs de jeu -->
                <div v-if="game.engines?.length && game.engines[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Moteur de jeu", game.engines) }}</h3>
                    <RouterLink v-for="engine in game.engines" :key="engine.id" to="/">
                        <span>{{ engine.name }}</span>
                    </RouterLink>
                </div>

                <!-- Séries -->
                <div v-if="game.series?.length && game.series[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Série", game.series) }}</h3>
                    <RouterLink v-for="series in game.series" :key="series.id" to="/">
                        <span>{{ series.name }}</span>
                    </RouterLink>
                </div>

                <!-- Franchises -->
                <div v-if="game.franchises?.length && game.franchises[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Franchise", game.franchises) }}</h3>
                    <RouterLink v-for="franchise in game.franchises" :key="franchise.id" to="/">
                        <span>{{ franchise.name }}</span>
                    </RouterLink>
                </div>

                <!-- Notes -->
                <div v-if="game.ratings?.length && game.ratings[0].name !== 'NULL'" class="info-section">
                    <h3>{{ getTitle("Note", game.ratings) }}</h3>
                    <RouterLink v-for="rating in game.ratings" :key="rating.id" to="/">
                        <span>{{ rating.name }}</span>
                    </RouterLink>
                </div>

                <!-- Jeux similaires -->
                <div v-if="game.similarGames?.length && game.similarGames[0].title !== 'NULL'">
                    <h3>{{ getTitle("Jeu similaire", game.similarGames) }}</h3>
                    <div class="similar-games-container">
                        <GameCard v-for="similar in game.similarGames" :key="similar.id" :game="similar" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/userStore";
import moment from "moment";
import api from "@/api";
import images from "@/images";
import iso3166 from "iso-3166-1";
import emojiFlags from "emoji-flags";

import GameCard from "./components/GameCard.vue";

const getCountryWithFlag = (countryCode) => {
    const country = iso3166.whereNumeric(getNeo4jNumber(countryCode));
    if (!country) return null;

    const flag = emojiFlags[country.alpha2]?.emoji || "🏳";
    return `${flag} ${country.country}`;
};

const darkenColor = (hex, factor = 0.7) => {
    const rgb = hex.match(/\w\w/g).map((c) => parseInt(c, 16));
    const darkenedRgb = rgb.map((c) => Math.max(0, Math.round(c * factor)));
    return `#${darkenedRgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

const gameBackgroundGradient = computed(() => {
    const darkenedColor = darkenColor(gameBackgroundColor.value, 0.6); // Facteur de 60% de luminosité
    return `linear-gradient(180deg, ${gameBackgroundColor.value}, ${darkenedColor})`;
});

const route = useRoute();
const userStore = useUserStore();
const user = computed(() => userStore.user);

const gameId = ref(route.params.gameId);
const game = ref(null);
const owned = ref(false);
const error = ref(null);

const fetchGame = async () => {
    if (!gameId.value) {
        error.value = "Aucun identifiant de jeu fourni";
        return;
    }
    try {
        const response = await api.games.get(gameId.value);
        game.value = response.data;
    } catch (err) {
        console.error("Erreur lors de la récupération du jeu:", err);
        error.value = err.response?.data?.error || "Erreur lors de la récupération du jeu";
    }

    console.log("Game data:", game.value);
};

const fetchOwned = async () => {
    if (!user.value) return;
    try {
        const response = await api.library.owned(gameId.value);
        owned.value = response.data.owned;
    } catch (err) {
        console.error("Erreur lors de la récupération de la bibliothèque:", err);
    }
};

const addToLibrary = async () => {
    try {
        await api.library.add(gameId.value);
        owned.value = true;
    } catch (err) {
        console.error("Erreur lors de l'ajout à la bibliothèque:", err);
    }
};

const removeFromLibrary = async () => {
    try {
        await api.library.remove(gameId.value);
        owned.value = false;
    } catch (err) {
        console.error("Erreur lors du retrait de la bibliothèque:", err);
    }
};

const getNeo4jNumber = (value) => (value && typeof value.low !== "undefined" ? value.low : value);

const gameCover = ref("/placeholder-game.png"); // Image par défaut

const fetchGameCover = async () => {
    if (game.value?.cover_image_id) {
        try {
            const response = await images.image.get(game.value.cover_image_id, "cover", "cover_big", true);

            const contentType = response.headers["content-type"];
            if (!contentType.startsWith("image/")) {
                throw new Error("Le fichier reçu n'est pas une image !");
            }

            const blob = new Blob([response.data], { type: contentType });
            gameCover.value = URL.createObjectURL(blob);
        } catch (error) {
            console.error("Erreur chargement cover :", error);
            gameCover.value = "/placeholder-game.png";
        }
    }
};

const useBackground = ref(false);
const gameBackground = ref("/background.jpg");
const gameBackgroundColor = ref("#789399");

const fetchGameBackground = async () => {
    if (game.value?.screenshots_image_id[0]) {
        try {
            useBackground.value = true;
            const response = await images.image.get(game.value.screenshots_image_id[0], "screenshot", "720p", false);
            const contentType = response.headers["content-type"];
            if (!contentType.startsWith("image/")) {
                throw new Error("Le fichier reçu n'est pas une image !");
            }

            const blob = new Blob([response.data], { type: contentType });
            gameBackground.value = URL.createObjectURL(blob);
        } catch (error) {
            console.error("Erreur chargement background :", error);
            gameBackground.value = "/background.jpg";
        }
    } else if (game.value?.cover_image_id[10001]) {
        try {
            const colorResponse = await images.colors.get(game.value.cover_image_id);
            console.log("Color response:", colorResponse.data.color);
            gameBackgroundColor.value = colorResponse.data.color;
            useBackground.value = false;
        } catch (error) {
            console.error("Erreur chargement background :", error);
            gameBackground.value = "/background.jpg";
        }
    }
};

const releaseDate = computed(() => {
    return game.value ? moment.unix(getNeo4jNumber(game.value.release_date)).format("DD/MM/YYYY") : "";
});

const storylineOrSummary = computed(() => {
    if (game.value?.storyline && game.value?.summary) {
        return game.value.storyline.length < game.value.summary.length ? game.value.storyline : game.value.summary;
    } else {
        return game.value?.storyline || game.value?.summary;
    }
});

const getTitle = (baseTitle, array) => {
    if (array.length > 1) {
        if (baseTitle === "Moteur de jeu") return "Moteurs de jeu"; // Cas spécial
        return `${baseTitle}s`; // Pluriel standard
    }
    return baseTitle;
};

watch(
    () => route.params.gameId,
    (newGameId) => {
        gameId.value = newGameId;
        fetchGame();
        fetchOwned();
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll en haut en douceur
    },
    { immediate: true }
);

watch(game, (newGame) => {
    if (newGame) {
        fetchGameCover();
        fetchGameBackground();
    }
});

watch(user, (newUser) => {
    if (newUser) {
        fetchOwned();
    }
});
</script>

<style scoped>
/* Conteneur principal sur toute la largeur */
.game-container {
    width: 100%;
    /* Prend toute la largeur de la page */
    text-align: left;
    position: relative;
    z-index: 1;
}

/* Header du jeu */
.game-header {
    position: relative;
    width: 100%;
    overflow: hidden;
}

/* Image de fond derrière uniquement le header */
.game-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 110%;
    /* Augmenté pour masquer les bords du flou */
    height: 110%;
    /* background-image: url("/public/background.jpg"); */
    /* Image de fond */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(10px) brightness(50%);
    transform: scale(1.1);
    /* Agrandissement léger pour éviter les bords visibles */
    z-index: -1;
}

.game-background-color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

/* Regroupe l’image + les infos */
.game-header-infos {
    max-width: 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
    position: relative;
}

/* Image et boutons */
.game-header-extra {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.game-header-extra img {
    width: 225px;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
}

.game-header-extra button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    font-size: 16px;
}

.game-header-extra button:hover {
    background-color: #0056b3;
}

/* Infos du jeu */
.game-header-info {
    flex: 1;
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
}

/* Nouvelle section des détails */
.game-details {
    width: 100vw;
    /* 100% de la largeur de la page */
    background: #222;
    padding: 40px 0;
    color: white;
    display: flex;
    justify-content: center;
}

/* Contenu interne limité à 70% de la page */
.game-details-content {
    width: 70%;
}

/* Sections d'infos */
.info-section {
    margin-bottom: 20px;
}

.info-section h3 {
    font-size: 22px;
    margin-bottom: 10px;
}

/* Style des liens */
.info-section a {
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

.info-section a:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Conteneur des jeux similaires */
.similar-games-container {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: left;
}
</style>
