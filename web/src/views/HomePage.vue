<template>

    <div>
        <h1>Home</h1>
        <p>Welcome to the home page</p>

        <div v-if="user">
            <button @click="logout">Logout</button>
            <button @click="deleteAccount">Delete Account</button>
        </div>
        <div v-else>
            <button @click="isLogin = true, isRegister = false">Login</button>
            <button @click="isRegister = true, isLogin = false">Register</button>
        </div>

        <LoginComponent v-if="!user && isLogin" @close="closeLogin()" />
        <RegisterComponent v-if="!user && isRegister" @close="closeRegister()" />

        <p v-if="user">Logged in as {{ user.username }}</p>

        <GameListComponent v-if="user" />

        <GameSearchComponent />
    </div>

</template>

<script>

import { onBeforeMount, computed, ref } from 'vue';
import { useUserStore } from '@/store/userStore';

import LoginComponent from './components/LoginComponent.vue';
import RegisterComponent from './components/RegisterComponent.vue';
import GameListComponent from './components/GameListComponent.vue';
import GameSearchComponent from './components/GameSearchComponent.vue';

export default {
    components: {
        LoginComponent,
        RegisterComponent,
        GameListComponent,
        GameSearchComponent,
    },
    setup() {
        const store = useUserStore();

        onBeforeMount(() => {
            store.fetchUser();
        });

        return {
            store,
            user: computed(() => store.user),
            isLogin: ref(false),
            isRegister: ref(false),
        };
    },
    methods: {
        logout() {
            this.store.logout();
        },
        deleteAccount() {
            this.store.deleteAccount();
        },
        closeLogin() {
            this.isLogin = false;
        },
        closeRegister() {
            this.isRegister = false;
        },
    },
}

</script>