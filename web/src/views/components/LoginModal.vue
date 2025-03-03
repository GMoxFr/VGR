<template>
    <div v-if="isOpen" class="overlay" @click.self="closeModal">
        <div class="modal" @click.stop>
            <div class="modal-content">
                <h2>{{ isRegister ? "Inscription" : "Connexion" }}</h2>

                <input type="text" placeholder="Identifiant" v-model="username" @keyup.enter="submit"
                    :class="{ error: v$.username.$error }" />
                <p v-if="v$.username.$error" class="error">L'identifiant est requis.</p>

                <input type="password" placeholder="Mot de passe" v-model="password" @keyup.enter="submit"
                    :class="{ error: v$.password.$error }" />
                <p v-if="v$.password.$error" class="error">Le mot de passe est requis et doit contenir au moins 6
                    caractères.</p>

                <!-- Champ confirmation de mot de passe en mode inscription -->
                <input v-if="isRegister" type="password" placeholder="Confirmer le mot de passe"
                    v-model="confirmPassword" @keyup.enter="submit" :class="{ error: v$.confirmPassword.$error }" />
                <p v-if="v$.confirmPassword.$error" class="error">La confirmation du mot de passe est requise et doit
                    correspondre au mot de passe.</p>


                <button @click="submit">{{ isRegister ? "S'inscrire" : "Se connecter" }}</button>
                <p v-if="errorMessage" class="error-validation">{{ errorMessage }}</p>

                <!-- Bouton pour basculer entre connexion et inscription -->
                <p class="switch-text">
                    {{ isRegister ? "Déjà un compte ?" : "Pas encore de compte ?" }}
                    <span @click="toggleMode">
                        {{ isRegister ? "Se connecter" : "S'inscrire" }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minLength, sameAs } from "@vuelidate/validators";
import { useUserStore } from "@/store/userStore";

const props = defineProps({
    isOpen: Boolean, // Contrôle l'affichage de la modal
});

const emit = defineEmits(["close"]);

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const isRegister = ref(false); // Mode d'inscription ou connexion
const errorMessage = ref("");
const store = useUserStore();

// Définition des règles de validation dynamiques
const rules = computed(() => ({
    username: { required },
    password: { required, minLength: minLength(6) },
    confirmPassword: isRegister.value ? { required, sameAs: sameAs(password) } : {},
}));

// Initialisation de Vuelidate
const v$ = useVuelidate(rules, { username, password, confirmPassword });

// Fermer la modal proprement
const closeModal = () => {
    emit("close");
    setTimeout(() => {
        username.value = "";
        password.value = "";
        confirmPassword.value = "";
        v$.value.$reset();
        isRegister.value = false;
        errorMessage.value = "";
    }, 100);
};

// Gérer la fermeture avec la touche Échap
const handleEscape = (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
};

// Ajouter/Supprimer l'écouteur d'événements dynamiquement
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        document.addEventListener("keydown", handleEscape);
    } else {
        document.removeEventListener("keydown", handleEscape);
    }
});

// Basculer entre Login et Register
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    v$.value.$reset(); // Réinitialiser les validations
};

// Validation et soumission du formulaire
const submit = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    try {
        if (isRegister.value) {
            await store.register(username.value, password.value, confirmPassword.value);
        } else {
            await store.login(username.value, password.value);
        }

        setTimeout(() => {
            closeModal();
        }, 100);
    } catch (err) {
        console.error("Erreur lors de la soumission du formulaire");
        if (isRegister.value) {
            errorMessage.value = "Erreur lors de l'inscription.";
        } else {
            errorMessage.value = "Erreur lors de la connexion.";
        }
    }
};
</script>

<style scoped>
/* Overlay */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* Modal */
.modal {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    width: 300px;
}

/* Contenu de la modal */
.modal-content {
    color: black;
    display: flex;
    flex-direction: column;
}

.modal-content input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
}

/* Ajout d'une bordure rouge si erreur */
input.error {
    border-color: red;
}

/* Bouton validation */
.modal-content button {
    background-color: #28a745;
    color: white;
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.modal-content button:hover {
    background-color: #218838;
}

/* Texte du switch */
.switch-text {
    margin-top: 10px;
    font-size: 14px;
    text-align: center;
    color: #555;
}

.switch-text span {
    color: #007bff;
    cursor: pointer;
    font-weight: bold;
}

.switch-text span:hover {
    text-decoration: underline;
}

.error {
    color: red;
    font-size: 12px;
    margin-top: -8px;
}

.error-validation {
    color: red;
    font-size: 14px;
    margin-top: 10px;
}
</style>