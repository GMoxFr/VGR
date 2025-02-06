<template>

    <div>
        <h1>Home</h1>
        <p>Welcome to the home page</p>

        <button v-if="user" @click="logout">Logout</button>
        <button v-else @click="isLogin = true">Login</button>

        <LoginComponent v-if="!user && isLogin" @close="closeLogin()" />

        <p v-if="user">Logged in as {{ user.username }}</p>

        <GameListComponent />

    </div>

</template>

<script>

import { onBeforeMount, computed, ref } from 'vue';
import { useUserStore } from '@/store/userStore';

import LoginComponent from './components/LoginComponent.vue';
import GameListComponent from './components/GameListComponent.vue';

export default {
    components: {
        LoginComponent,
        GameListComponent,
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
        };
    },
    methods: {
        logout() {
            this.store.logout();
        },
        closeLogin() {
            this.isLogin = false;
        },
    },
}

</script>