<template>
    <nav class="navbar">
        <!-- Colonne gauche : Bouton Home -->
        <div class="nav-left">
            <button class="nav-btn" @click="goHome">VGR</button>
        </div>

        <!-- Colonne centrale : Barre de recherche -->
        <div class="nav-center">
            <GameSearch />
        </div>

        <!-- Colonne droite : Section utilisateur -->
        <div class="nav-right">
            <template v-if="user">
                <div class="user-menu" @click.stop>
                    <button class="username-btn" @click="toggleDropdown">
                        👤 {{ user.username }} ▼
                    </button>

                    <div v-if="isDropdownOpen" class="dropdown">
                        <button @click="goToLibrary" class="dropdown-item">📚 Ma Bibliothèque</button>
                        <button @click="logout" class="dropdown-item logout">🚪 Déconnexion</button>
                    </div>
                </div>
            </template>
            <button v-else @click.stop="isModalOpen = true" class="login-btn">
                Login
            </button>
        </div>
    </nav>

    <!-- Importation de la modal Login -->
    <LoginModal :isOpen="isModalOpen" @close="isModalOpen = false" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

import GameSearch from "./GameSearch.vue";
import LoginModal from "./LoginModal.vue";

const router = useRouter();
const userStore = useUserStore();
const isModalOpen = ref(false);

// Utiliser computed pour suivre automatiquement les changements de user
const user = computed(() => userStore.user);

// Déconnexion
const logout = () => {
    userStore.logout();
};

// Aller à la page d'accueil
const goHome = () => {
    router.push("/");
};

const isDropdownOpen = ref(false);

// Ouvre/ferme la dropdown
const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

// Redirection vers la bibliothèque
const goToLibrary = () => {
    router.push({ name: "Library", params: { username: user.value.username } });
    isDropdownOpen.value = false;
};

// Fermer le menu si on clique ailleurs
document.addEventListener("click", () => {
    isDropdownOpen.value = false;
});
</script>

<style scoped>
/* Navbar */
.navbar {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    /* ✅ Colonnes fixes pour Home et User, centre flexible */
    align-items: center;
    width: 100%;
    background-color: #222;
    color: white;
    padding: 10px 20px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
}

/* Colonne gauche : Home */
.nav-left {
    display: flex;
    justify-content: flex-start;
}

/* Colonne centrale : Barre de recherche */
.nav-center {
    display: flex;
    justify-content: center;
    gap: 20px;
    min-width: 300px;
}

/* Colonne droite : Section utilisateur */
.nav-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    min-width: 300px;
    /* ✅ Largeur fixe pour éviter les décalages */
}

/* Bouton Home */
.nav-btn {
    padding: 10px 15px;
    background-color: #555;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.nav-btn:hover {
    background-color: #444;
}

/* Nom de l'utilisateur */
.username {
    font-size: 16px;
    font-weight: bold;
}

/* Bouton Login */
.login-btn {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.login-btn:hover {
    background-color: #0056b3;
}

/* Bouton Logout */
.logout-btn {
    padding: 10px 15px;
    background-color: #d9534f;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.logout-btn:hover {
    background-color: #c9302c;
}

/* Conteneur du menu utilisateur */
.user-menu {
    position: relative;
}

/* Bouton username */
.username-btn {
    background: none;
    border: none;
    font-size: 16px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    padding: 10px;
}

.username-btn:hover {
    color: #aaa;
}

/* Dropdown */
.dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: #333;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    min-width: 150px;
    z-index: 1000;
}

/* Items de la dropdown */
.dropdown-item {
    padding: 10px;
    text-align: left;
    background: none;
    border: none;
    color: white;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
}

.dropdown-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Déconnexion en rouge */
.logout {
    color: #d9534f;
}

.logout:hover {
    background: rgba(217, 83, 79, 0.2);
}
</style>