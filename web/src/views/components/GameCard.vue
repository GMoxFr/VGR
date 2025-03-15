<template>
    <RouterLink :to="{ name: 'Game', params: { gameId: getNeo4jNumber(game.igdb_id) } }" class="game-card"
        @mouseenter="startMarquee" @mouseleave="stopMarquee">

        <img :src="gameImage" alt="Game Cover" class="game-card-img" />
        <div class="game-card-content">
            <div class="game-card-title">
                <Vue3Marquee v-if="showMarquee" :duration="getTimeWithTitle(game.title)" :pause="marqueePaused"
                    :loop="0" :clone="false" :animateOnOverflowOnly="true" class="marquee">
                    {{ game.title }}&nbsp;&nbsp;&nbsp;
                </Vue3Marquee>
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
import { ref, defineProps, onMounted, onUnmounted, watch } from "vue";
import { Vue3Marquee } from "vue3-marquee";
import images from "@/images";

// Props
const props = defineProps({
    game: Object
});

const marqueePaused = ref(true);
const showMarquee = ref(true);
const blobImg = ref(null);
const gameImage = ref("/placeholder.png");

// Fonction pour récupérer l’image du jeu depuis l'API et la stocker en binaire
const fetchGameImage = async () => {
    if (props.game.cover_image_id && typeof props.game.cover_image_id === "string") {
        try {
            const response = await images.image.get(props.game.cover_image_id, "cover", "cover_big", true);

            // Vérification du type
            const contentType = response.headers["content-type"];
            if (!contentType.startsWith("image/")) {
                throw new Error("Le fichier reçu n'est pas une image !");
            }

            // Créer un blob
            const blob = new Blob([response.data], { type: contentType });
            gameImage.value = URL.createObjectURL(blob);
        } catch (error) {
            console.error("Erreur chargement image :", error);
            gameImage.value = "/placeholder.png";
        }
    }
};

const revokeBlobUrl = () => {
    if (blobImg.value) {
        URL.revokeObjectURL(blobImg.value);
    }
};
onUnmounted(revokeBlobUrl);

// Fonction pour calculer la durée du scroll en fonction du titre
const getTimeWithTitle = (title) => {
    const baseTime = 5;
    const timePerChar = 0.15;
    return baseTime + (title?.length || 0) * timePerChar;
};

// Démarrer le scroll au survol
const startMarquee = () => {
    marqueePaused.value = false;
};

// Arrêter et reset le scroll au `mouseleave`
const stopMarquee = () => {
    marqueePaused.value = true;
    showMarquee.value = false;
    setTimeout(() => {
        showMarquee.value = true;
    }, 100);
};

// Convertit Neo4j ID en valeur simple si nécessaire
const getNeo4jNumber = (value) => (value && typeof value.low !== "undefined" ? value.low : value);

onMounted(fetchGameImage);

watch(props, (newProp) => {
    if (newProp) {
        fetchGameImage();
    }
});
</script>

<style scoped>
/* Style général de la carte */
.game-card {
    width: 150px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: white;
    cursor: pointer;
    background: #333;
    /* Fond sombre */
    border-radius: 8px;
    padding: 10px;
    transition: transform 0.2s ease-in-out, background 0.3s ease-in-out;
}

/* Effet au survol */
.game-card:hover {
    transform: scale(1.05);
    background: #444;
    /* Fond légèrement plus clair */
}

/* Image */
.game-card-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.2s ease-in-out;
}

/* Titre et contenu */
.game-card-content {
    width: 100%;
    padding-top: 10px;
}

/* Conteneur du titre */
.game-card-title {
    width: 100%;
    overflow: hidden;
    position: relative;
    height: 25px;
    display: flex;
    align-items: center;
}
</style>